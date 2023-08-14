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
	Private vars and functions are prefixed with `__cam'.
	Please do not use private stuff in scenario code, use only public API.

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
const NEW_PARADIGM = 1;
const THE_COLLECTIVE = 2;
const NEXUS = 3;
const SCAV_6 = 6;
const SCAV_7 = 7;

const CLIPPY = 1;
const BONZI_BUDDY = 2;
const SPAMTON = 3;
const MOBS = 4;

const CAM_MAX_PLAYERS = 8;
const CAM_TICKS_PER_FRAME = 100;
const AI_POWER = 999999;
const INCLUDE_PATH = "script/campaign/libcampaign_includes/";

//level load codes here for reference. Might be useful for later code.
const ALPHA_CAMPAIGN_NUMBER = 1;
const BETA_CAMPAIGN_NUMBER = 2;
const GAMMA_CAMPAIGN_NUMBER = 3;
const CAM_GAMMA_OUT = "GAMMA_OUT"; //Fake next level for the final Gamma mission.
const UNKNOWN_CAMPAIGN_NUMBER = 1000;
const ALPHA_LEVELS = [
	"CAM_1A", "CAM_1B", "SUB_1_1S", "SUB_1_1", "SUB_1_2S", "SUB_1_2", "SUB_1_3S",
	"SUB_1_3", "CAM_1C", "CAM_1CA", "SUB_1_4AS", "SUB_1_4A", "SUB_1_5S", "SUB_1_5",
	"CAM_1A-C", "SUB_1_7S", "SUB_1_7", "SUB_1_DS", "SUB_1_D", "CAM_1END", 
	"SURFACE_TENSION", // Alpha 3
	"CP_DUSTBOWL", // Alpha 4
	"CTF_2FORT", // Alpha 5
	"BYE_BYE" // Transition
];
const BETA_LEVELS = [
	"CAM_2A", "SUB_2_1S", "SUB_2_1", "CAM_2B", "SUB_2_2S", "SUB_2_2", "CAM_2C",
	"SUB_2_5S", "SUB_2_5", "SUB_2DS", "SUB_2D", "SUB_2_6S", "SUB_2_6", "SUB_2_7S",
	"SUB_2_7", "SUB_2_8S", "SUB_2_8", "CAM_2END",
	"how_was_the_fall", // Beta 1
	"CAVE_UPDATE_PART_4", "MY_COOL_MAP.ZIP", // Beta 2
	"BRING_AN_UMBRELLA", "CLOUDY_WITH_A_CHANCE_OF_ROCKETS", // Beta 3
	"GET_READY_TO_RUMBLE", "THE_COLOSSEUM", // Beta 4
	"HOW_2_UNINSTALL", "BONZI_BUDDY", // Beta 5
	"LET'S_A_GO" // Transition
];
const GAMMA_LEVELS = [
	"CAM_3A", "SUB_3_1S", "SUB_3_1", "CAM_3B", "SUB_3_2S", "SUB_3_2", "CAM3A-B",
	"CAM3C", "CAM3A-D1", "CAM3A-D2", "CAM_3_4S", "CAM_3_4",
	"WHAT_ARE_YOU_DOING_IN_MY_[Dumpster]!?", // Gamma 1
	"NO_DON'T_[Steal]_MY_!", "THE_BIG_ONE", // Gamma 2
	"RIDE_AROUND_TOWN", "SPAMTON_CITY", // Gamma 3
	"THE_G_STANDS_FOR_[[Blaster]]", // Gamma 4
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

//group
var __camNewGroupCounter;
var __camNeverGroupDroids;

//hook
var __camOriginalEvents = {};

//misc
const CAM_SPAWNER_RANGE = 16; // How close the player has to be for a spawner to become active
const CAM_ALPHA_SUN_POSITION = {x: 225.0, y: -600.0, z: 450.0}; // Default sun stats for Alpha campaign
const CAM_ALPHA_SUN_INTENSITY = {ar: 0.5, ag: 0.5, ab: 0.5, dr: 1, dg: 1, db: 1, sr: 1, sg: 1, sb: 1};
const CAM_BETA_SUN_POSITION = {x: 4.0, y: -20.0, z: -8.0}; // Default sun stats for Beta campaign
const CAM_BETA_SUN_INTENSITY = {ar: 0.4, ag: 0.4, ab: 0.4, dr: 0.8, dg: 0.8, db: 0.8, sr: 0.8, sg: 0.8, sb: 0.8};
const CAM_GAMMA_SUN_POSITION = {x: 225.0, y: -600.0, z: 450.0}; // Default sun stats for Gamma campaign
const CAM_GAMMA_SUN_INTENSITY = {ar: 0.5, ag: 0.5, ab: 0.5, dr: 1, dg: 1, db: 1, sr: 1, sg: 1, sb: 1};
var __camCalledOnce = {};
var __camNeedlerLog = []; // List of targets with needles in them
var __camPrimedCreepers = []; // List of Creepers that are ready to explode
var __camSunPosition; // The xyz position of the sun
var __camSunIntensity; // The lighting intensity of the sun
var __camBlackOut; // Whether a "black out" effect is active

//nexus
const DEFENSE_ABSORBED = "defabsrd.ogg";
const DEFENSE_NEUTRALIZE = "defnut.ogg";
const LAUGH1 = "laugh1.ogg";
const LAUGH2 = "laugh2.ogg";
const LAUGH3 = "laugh3.ogg";
const PRODUCTION_COMPLETE = "pordcomp.ogg";
const RES_ABSORBED = "resabsrd.ogg";
const STRUCTURE_ABSORBED = "strutabs.ogg";
const STRUCTURE_NEUTRALIZE = "strutnut.ogg";
const SYNAPTICS_ACTIVATED = "synplnk.ogg";
const UNIT_ABSORBED = "untabsrd.ogg";
const UNIT_NEUTRALIZE = "untnut.ogg";
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
const MILLISECONDS_IN_SECOND = 1000;
const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;

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

include(INCLUDE_PATH + "misc.js");
include(INCLUDE_PATH + "debug.js");
include(INCLUDE_PATH + "hook.js");
include(INCLUDE_PATH + "events.js");

include(INCLUDE_PATH + "time.js");
include(INCLUDE_PATH + "research.js");
include(INCLUDE_PATH + "artifact.js");
include(INCLUDE_PATH + "base.js");
include(INCLUDE_PATH + "reinforcements.js");
include(INCLUDE_PATH + "tactics.js");
include(INCLUDE_PATH + "production.js");
include(INCLUDE_PATH + "truck.js");
include(INCLUDE_PATH + "victory.js");
include(INCLUDE_PATH + "transport.js");
include(INCLUDE_PATH + "vtol.js");
include(INCLUDE_PATH + "nexus.js");
include(INCLUDE_PATH + "group.js");
include(INCLUDE_PATH + "video.js");
