//;; # `libcampaign.js` documentation
//;;
//;; `libcampaign.js` is a JavaScript library supplied with the game,
//;; which contains reusable code for campaign scenarios. It is designed to
//;; make scenario development as high-level and declarative as possible.
//;; It also contains a few simple convenient wrappers.
//;; Public API functions of `libcampaign.js` are prefixed with `cam`.
//;; To use `libcampaign.js`, add the following include into your scenario code:
//;;
//;; ```js
//;; include("script/campaign/libcampaign.js");
//;; ```
//;;
//;; Also, most of the `libcampaign.js` features require some of the game
//;; events handled by the library. Transparent JavaScript pre-hooks are
//;; therefore injected into your global event handlers upon include.
//;; For example, if `camSetArtifacts()` was called to let `libcampaign.js`
//;; manage scenario artifacts, then `eventPickup()` will be first handled
//;; by the library, and only then your handler will be called, if any.
//;; All of this happens automagically and does not normally require
//;; your attention.
//;;

/*
	Private vars and functions are prefixed with `__cam`.
	Private consts are prefixed with `__CAM_` or `__cam_`.
	Public vars/functions are prefixed with `cam`, consts with `CAM_` or `cam_`.
	Please do not use private stuff in scenario code, use only public API.

	It is encouraged to prefix any local consts with `__` in any function in the
	library if they are not objects/arrays. Mission scripts may use a `_` but
	only if the name seems like it could clash with a JS API global.

	Please CAPITALIZE const names for consistency for most of everything.
	The only exception to these rules is when the const is declared in a loop
	initialization or will be assigned as a global-context callback function,
	or if it will be a JS object/array as these aren't truly immutable. Follow
	standard camel case style as usual.

	Also, in the event you want a top level const for a mission script
	(and any include file) please prefix it with `MIS_` or `mis_` depending on
	if it's an object/array or not.

	We CANNOT put our private vars into an anonymous namespace, even though
	it's a common JS trick -

		(function(global) {
			var __camPrivateVar; // something like that
		})(this);

	because they would break on savegame-loadgame. So let's just agree
	that we'd never use them anywhere outside the file, so that it'd be easier
	to change them, and also think twice before we change the public API.

	The lib is split into sections, each section is separated with a slash line:

////////////////////////////////////////////////////////////////////////////////
// Section name.
////////////////////////////////////////////////////////////////////////////////

	yeah, like that. Also, it's exactly 80 characters wide.

	In each section, public stuff is on TOP, and private stuff
	is below, split from the public stuff with:

//////////// privates

	, for easier reading (all the useful stuff on top).

	Please leave camDebug() around if something that should never happen
	occurs, indicating an actual bug in campaign. Then a sensible message
	should be helpful as well. But normally, no warnings should ever be
	printed.

	In cheat mode, more warnings make sense, explaining what's going on
	under the hood. Use camTrace() for such warnings - they'd auto-hide
	outside cheat mode.

	Lines prefixed with // followed by ;; are docstrings for JavaScript API
	documentation.
*/

////////////////////////////////////////////////////////////////////////////////
// Library initialization.
////////////////////////////////////////////////////////////////////////////////

// Registers a private event namespace for this library, to avoid collisions with
// any event handling in code using this library. Make sure no other library uses
// the same namespace, or strange things will happen. After this, we can name our
// event handlers with the registered prefix, and they will still get called.
namespace("cam_");

//////////global vars start
//These are campaign player numbers.
const CAM_HUMAN_PLAYER = 0;
const CAM_NEW_PARADIGM = 1;
const CAM_THE_COLLECTIVE = 2;
const CAM_NEXUS = 3;
const CAM_SCAV_6 = 6;
const CAM_SCAV_7 = 7;

const CAM_CLIPPY = 1;
const CAM_BONZI_BUDDY = 2;
const CAM_SPAMTON = 3;
const CAM_MOBS = 4;

const __CAM_MAX_PLAYERS = 8;
const __CAM_TICKS_PER_FRAME = 100;
const __CAM_AI_POWER = 999999;
const __CAM_INCLUDE_PATH = "script/campaign/libcampaign_includes/";

//level load codes here for reference. Might be useful for later code.
const CAM_GAMMA_OUT = "GAMMA_OUT"; //Fake next level for the final Gamma mission.
const __CAM_ALPHA_CAMPAIGN_NUMBER = 1;
const __CAM_BETA_CAMPAIGN_NUMBER = 2;
const __CAM_GAMMA_CAMPAIGN_NUMBER = 3;
const __CAM_UNKNOWN_CAMPAIGN_NUMBER = 1000;
const __cam_alphaLevels = [
	"CAM_1A", // Alpha 1
	"CAM_1B", // Alpha 2
	"SUB_1_1S", "SURFACE_TENSION", // Alpha 3
	"CP_DUSTBOWL", // Alpha 4
	"CTF_2FORT", // Alpha 5
	"BYE_BYE" // Transition
];
const __cam_betaLevels = [
	"how_was_the_fall", // Beta 1
	"CAVE_UPDATE_PART_4", "XBOX_LIVE", // Beta 2
	"BRING_AN_UMBRELLA", "HAIL", // Beta 3
	"GET_READY_TO_RUMBLE", "THE_COLOSSEUM", // Beta 4
	"HOW_2_UNINSTALL", "BONZI_BUDDY", // Beta 5
	"KILL_YOUR_TV" // Transition
];
const __cam_gammaLevels = [
	"HOLY_CUNGADERO", // Gamma 1
	"NO_DONT_STEAL_MY_", "THE_BIG_ONE", // Gamma 2
	"WELCOME_TO_THE", "SPAMTOPIA", // Gamma 3
	"THE_G_STANDS_FOR_", // Gamma 4
	"BIG_SHOT" // Gamma 5
];

//artifact
var __camArtifacts;
var __camNumArtifacts;

//base
var __camEnemyBases;
var __camNumEnemyBases;

//reinforcements
const CAM_REINFORCE_NONE = 0;
const CAM_REINFORCE_GROUND = 1;
const CAM_REINFORCE_TRANSPORT = 2;

//debug
var __camMarkedTiles = {};
var __camCheatMode = false;
var __camDebuggedOnce = {};
var __camTracedOnce = {};

//events
var __camSaveLoading;
var __camFungibleCanSwapList = [
	"Script-FungibleCannon-Swap2", "Script-FungibleCannon-Swap3", "Script-FungibleCannon-Swap4",
	"Script-FungibleCannon-Swap5", "Script-FungibleCannon-Swap6", "Script-FungibleCannon-Swap7",
	"Script-FungibleCannon-Swap8", "Script-FungibleCannon-Swap9", "Script-FungibleCannon-Swap10",
	"Script-FungibleCannon-Swap11", "Script-FungibleCannon-Swap12", "Script-FungibleCannon-Swap13",
	"Script-FungibleCannon-Swap14", "Script-FungibleCannon-Swap15"
];
var __camMobGlobalGroup; // Default group for Silverfish and enraged Endermen
var __camAllowSilverfishSpawn; // Whether Silverfish can spawn randomly out of destroyed buildings

//group
var __camNewGroupCounter;
var __camNeverGroupDroids;

//hook
var __camOriginalEvents = {};

//misc
const __CAM_SPAWNER_RANGE = 16; // How close (in tiles) the player has to be for a spawner to become active
const __CAM_SPY_FEIGN_DURATION = 12 * 1000; // How long a Spy Cyborg stays hidden after feigning death (12 seconds)
const __CAM_SPY_FEIGN_COOLDOWN = 60 * 1000; // How long after a Spy Cyborg feigns death until it can feign again (60 seconds)
const __CAM_ALPHA_SUN_POSITION = {x: 225.0, y: -600.0, z: 450.0}; // Default sun stats for Alpha campaign
const __CAM_ALPHA_SUN_INTENSITY = {ar: 0.5, ag: 0.5, ab: 0.5, dr: 1, dg: 1, db: 1, sr: 1, sg: 1, sb: 1};
const __CAM_BETA_SUN_POSITION = {x: 4.0, y: -20.0, z: -8.0}; // Default sun stats for Beta campaign
const __CAM_BETA_SUN_INTENSITY = {ar: 0.4, ag: 0.4, ab: 0.4, dr: 0.8, dg: 0.8, db: 0.8, sr: 0.8, sg: 0.8, sb: 0.8};
const __CAM_GAMMA_SUN_POSITION = {x: 225.0, y: -600.0, z: 450.0}; // Default sun stats for Gamma campaign
const __CAM_GAMMA_SUN_INTENSITY = {ar: 0.5, ag: 0.5, ab: 0.5, dr: 1, dg: 1, db: 1, sr: 1, sg: 1, sb: 1};
var __camCalledOnce = {};
var __camNeedlerLog = []; // List of targets with needles in them
var __camPrimedCreepers = []; // List of Creepers that are ready to explode
var __camSpyFeigns = []; // List of stats for Spy Cyborgs that have "died" (used to restore unit stats on respawn)
var __camSpyCooldowns = []; // List id's and dates of Spy Cyborgs that have recently un-died (used to determine when spies can feign again)
var __camSunPosition; // The xyz position of the sun
var __camSunIntensity; // The lighting intensity of the sun
var __camBlackOut; // Whether a "black out" effect is active
var __camExpLevel;

//nexus
const CAM_DEFENSE_ABSORBED_SND = "defabsrd.ogg";
const CAM_DEFENSE_NEUTRALIZE_SND = "defnut.ogg";
const CAM_LAUGH1_SND = "laugh1.ogg";
const CAM_LAUGH2_SND = "laugh2.ogg";
const CAM_LAUGH3_SND = "laugh3.ogg";
const CAM_PRODUCTION_COMPLETE_SND = "pordcomp.ogg";
const CAM_RES_ABSORBED_SND = "resabsrd.ogg";
const CAM_STRUCTURE_ABSORBED_SND = "strutabs.ogg";
const CAM_STRUCTURE_NEUTRALIZE_SND = "strutnut.ogg";
const CAM_SYNAPTICS_ACTIVATED_SND = "synplnk.ogg";
const CAM_UNIT_ABSORBED_SND = "untabsrd.ogg";
const CAM_UNIT_NEUTRALIZE_SND = "untnut.ogg";
var __camLastNexusAttack;
var __camNexusActivated;

//production
var __camFactoryInfo;
var __camFactoryQueue;
var __camPropulsionTypeLimit;
var __camFungibleCannonList = [ // List of Fungible Cannon variants
	"Cannon2A-TMk2", "Cannon2A-TMk3", "Cannon2A-TMk4",
	"Cannon2A-TMk5", "Cannon2A-TMk6", "Cannon2A-TMk7",
	"Cannon2A-TMk8", "Cannon2A-TMk9", "Cannon2A-TMk10",
	"Cannon2A-TMk11", "Cannon2A-TMk12", "Cannon2A-TMk13",
	"Cannon2A-TMk14", "Cannon2A-TMk15",
];
var __camFungibleCanHardList = [ // List of Fungible Cannon Hardpoint variants
	"WallTower03Mk2", "WallTower03Mk3", "WallTower03Mk4",
	"WallTower03Mk5", "WallTower03Mk6", "WallTower03Mk7",
	"WallTower03Mk8", "WallTower03Mk9", "WallTower03Mk10",
	"WallTower03Mk11", "WallTower03Mk12", "WallTower03Mk13",
	"WallTower03Mk14", "WallTower03Mk15",
];

//tactics
const CAM_ORDER_ATTACK = 0;
const CAM_ORDER_DEFEND = 1;
const CAM_ORDER_PATROL = 2;
const CAM_ORDER_COMPROMISE = 3;
const CAM_ORDER_FOLLOW = 4;
var __camGroupInfo;
const __CAM_TARGET_TRACKING_RADIUS = 7;
const __CAM_PLAYER_BASE_RADIUS = 20;
const __CAM_DEFENSE_RADIUS = 4;
const __CAM_CLOSE_RADIUS = 2;
const __CAM_CLUSTER_SIZE = 4;
const __CAM_FALLBACK_TIME_ON_REGROUP = 5000;
var __camGroupAvgCoord = {x: 0, y: 0};

//time
const CAM_MILLISECONDS_IN_SECOND = 1000;
const CAM_SECONDS_IN_MINUTE = 60;
const CAM_MINUTES_IN_HOUR = 60;

//transport
var __camNumTransporterExits;
var __camPlayerTransports;
var __camIncomingTransports;
var __camTransporterQueue;
var __camTransporterMessage;

//truck
var __camTruckInfo;

//victory
const CAM_VICTORY_STANDARD = "__camVictoryStandard";
const CAM_VICTORY_PRE_OFFWORLD = "__camVictoryPreOffworld";
const CAM_VICTORY_OFFWORLD = "__camVictoryOffworld";
const CAM_VICTORY_TIMEOUT = "__camVictoryTimeout";
const CAM_VICTORY_SCRIPTED = "__camVictoryScripted";
var __camWinLossCallback;
var __camNextLevel;
var __camNeedBonusTime;
var __camDefeatOnTimeout;
var __camVictoryData;
var __camRTLZTicker;
var __camLZCompromisedTicker;
var __camLastAttackTriggered;
var __camLevelEnded;
var __camExtraObjectiveMessage;
var __camAllowVictoryMsgClear;

//video
var __camVideoSequences;

//vtol
var __camVtolDataSystem;
//////////globals vars end

// A hack to make sure we do not put this variable into the savegame. It is
// called from top level, because we need to call it again every time we load
// scripts. But other than this one, you should in general never call game
// functions from toplevel, since all game state may not be fully initialized
// yet at the time scripts are loaded. (Yes, function name needs to be quoted.)
hackDoNotSave("__camOriginalEvents");

include(__CAM_INCLUDE_PATH + "misc.js");
include(__CAM_INCLUDE_PATH + "debug.js");
include(__CAM_INCLUDE_PATH + "hook.js");
include(__CAM_INCLUDE_PATH + "events.js");

include(__CAM_INCLUDE_PATH + "time.js");
include(__CAM_INCLUDE_PATH + "research.js");
include(__CAM_INCLUDE_PATH + "artifact.js");
include(__CAM_INCLUDE_PATH + "base.js");
include(__CAM_INCLUDE_PATH + "reinforcements.js");
include(__CAM_INCLUDE_PATH + "tactics.js");
include(__CAM_INCLUDE_PATH + "production.js");
include(__CAM_INCLUDE_PATH + "truck.js");
include(__CAM_INCLUDE_PATH + "victory.js");
include(__CAM_INCLUDE_PATH + "transport.js");
include(__CAM_INCLUDE_PATH + "vtol.js");
include(__CAM_INCLUDE_PATH + "nexus.js");
include(__CAM_INCLUDE_PATH + "group.js");
include(__CAM_INCLUDE_PATH + "video.js");
