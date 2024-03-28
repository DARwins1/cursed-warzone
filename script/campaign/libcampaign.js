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

// Structure for accessing the game's sounds (mostly dialogue-related)
const camSounds = {
	sfx: {
		barrelExpl1: "pcv331.ogg",
		barrelExpl2: "pcv332.ogg",
		barrelExpl3: "pcv333.ogg",
		enderTele: "pcv426.ogg",
		powerDown: "Powerdown.ogg",
		cave1: "Cave1.ogg",
		cave2: "Cave2.ogg",
		cave3: "Cave3.ogg",
		cave4: "Cave4.ogg",
		cave5: "Cave5.ogg",
		cave6: "Cave6.ogg",
		cave7: "Cave7.ogg",
		cave8: "Cave8.ogg",
		cave9: "Cave9.ogg",
		cave10: "Cave10.ogg",
		cave11: "Cave11.ogg",
		cave12: "Cave12.ogg",
		cave13: "Cave13.ogg",
		cave14: "Cave14.ogg",
		cave15: "Cave15.ogg",
		cave16: "Cave16.ogg",
		cave17: "Cave17.ogg",
		cave18: "Cave18.ogg",
		cave19: "Cave19.ogg",
	},
	project: {
		incomIntel: "pcv456.ogg", // Incoming Intelligence Report
		scavOutpst: "pcv375.ogg", // Scavenger Outpost Detected
		scavBase: "pcv374.ogg", // Scavenger Base Detected
		enemyBase: "pcv379.ogg", // Enemy Base Detected
		scavOutpstErad: "pcv391.ogg", //  Scavenger Outpost Eradicated
		scavBaseErad: "pcv392.ogg", // Scavenger Base Eradicated
		enemyBaseErad: "pcv394.ogg", // Enemy Base Eradicated
		retLz: "pcv427.ogg", // Return To LZ
		lzComp: "pcv445.ogg", // LZ Compromised
		lzClear: "lz-clear.ogg", // LZ Clear
		enemyTrans: "pcv381.ogg", // Enemy Transport Detected
		incomTrans: "pcv395.ogg", // Incoming Enemy Transport
		reinforceAvail: "pcv440.ogg", // Reinforcements Are Available
		artiRecovered: "pcv352.ogg", // Artifact Recovered
		pwrTrans: "power-transferred.ogg", // Power Transferred
	},
	spamton: {
		talk1: "pcv451.ogg",
		talk2: "pcv452.ogg",
		laugh: "pcv446.ogg",
		deepLaugh: "pcv447.ogg",
		badumtiss: "badumtiss.ogg",
	},
	bonzi: {
		// Beta 4 / Colosseum stuff:
		// Wave 3
		w3_1: "W3B1.ogg", // You have not fallen yet, Commander?
		w3_2: "W3B2.ogg", // Then let's shake things up a bit...
		// Wave 6
		w6_1: "W6B1.ogg", // This is growing tiresome, Commander. So I will add an extra challenge for this next wave.
		w6_2: "W6B2.ogg", // If you do not finish the wave within the time limit, I will wipe this arena with nuclear fire.
		// Wave 10
		w10_1: "W10B1.ogg", // Or don't.
		w10_2: "W10B2.ogg", // You could just die now.
		// Wave 11
		w11_1: "W11B1.ogg", // Enough. This is the end for you.
		w11_2: "W11B2.ogg", // Prepare to bow before the might of Lord BonziBUDDY!
		// Wave 12
		w12_1: "W12B1.ogg", // I should've known that slimy salesman couldn't be trusted.
		w12_2: "W12B2.ogg", // Nonetheless, this is as far as you go, Commander.
		w12_3: "W12B3.ogg", // For you will not stand against my most valiant warrior.
		w12_4: "W12B4.ogg", // Prepare to meet your end!
		// Post-waves
		end_1: "ENDB1.ogg", // Impossible!
		end_2: "ENDB2.ogg", // No!

		// Beta 5
		welcome1: "B5-wlcm1.ogg", // Welcome to my glorious palace grounds, Commander.
		welcome2: "B5-wlcm2.ogg", // This is the heart of what will soon be my glorious empire.
		welcome3: "B5-wlcm3.ogg", // And what will also soon be your grave.
		gate1: "B5-gate1.ogg", // Do you feel it?
		gate2: "B5-gate2.ogg", // That sense of impending doom?
		gate3: "B5-gate3.ogg", // Every step you take brings you closer to your own demise.
		aggro1: "B5-aggro1.ogg", // Enough!
		aggro2: "B5-aggro2.ogg", // Your demise is here, Commander.
		aggro3: "B5-aggro3.ogg", // For I shall break you down until nothing of you remains.
		aggro4: "B5-aggro4.ogg", // Prepare yourself for obliteration!
		taunt1: "B5-taunt1.ogg", // Die!
		taunt2: "B5-taunt2.ogg", // Perish!
		taunt3: "B5-taunt3.ogg", // Feel my wrath!
		taunt4: "B5-taunt4.ogg", // Become paste!
		taunt5: "B5-taunt5.ogg", // Become nothing!
		taunt6: "B5-taunt6.ogg", // Be gone!
	},
	announcer: {
		// Wave 1
		w1_1: "W1A1.ogg", // Hello and welcome to The Colosseum. 
		w1_2: "W1A2.ogg", // You have been summoned here by Lord BonziBUDDY to complete a series of challenges.
		w1_3: "W1A3.ogg", // The rules of The Colosseum are simple.
		w1_4: "W1A4.ogg", // Defeat the enemies in each wave to continue to the next.
		w1_5: "W1A5.ogg", // You must survive all twelve waves in order to succeed.
		w1_6: "W1A6.ogg", // Do not approach the edges of the arena, as this will damage your units.
		w1_7: "W1A7.ogg", // The sign on the north side of the arena will show you what enemies you will face in the upcoming wave.
		w1_8: "W1A8.ogg", // Finally, you may call one transport of reinforcements between each wave.
		w1_9: "W1A9.ogg", // You may begin preparing for the first wave now.
		// Wave 2
		w2_1: "W2A1.ogg", // Very good. You are still alive.
		w2_2: "W2A2.ogg", // You may begin preparing for the second wave.
		// Wave 4
		w4_1: "W4A1.ogg", // Congratulations. You are not dead.
		w4_2: "W4A2.ogg", // You should keep doing that.
		// Wave 5
		w5_1: "W5A1.ogg", // A reminder to all spectators to not look contestants directly in the eyes.
		w5_2: "W5A2.ogg", // The Colosseum is not responsible for injuries caused by agitating the contestants.
		w5_3: "W5A3.ogg", // The Colosseum is also not responsible for any heartbreaks caused by forming emotional attachments to contestants who are then inevitably riddled with bullets.
		// Wave 6
		w6_1: "W6A1.ogg", // Congratulations, you have reached the half-way point.
		w6_2: "W6A2.ogg", // Please do not blow up The Colosseum.
		// Wave 7
		w7_1: "W7A1.ogg", // Congratulations on not blowing up.
		w7_2: "W7A2.ogg", // Please prepare for the next wave.
		// Wave 8
		w8_1: "W8A1.ogg", // A reminder to all spectators that The Colosseum is not responsible for any injuries caused by rockets, shells, large rocks, or other projectiles that are hurled into the spectator gallery.
		// Wave 9
		w9_1: "W9A1.ogg", // Please do not refer to The Colosseum as a "Circle of Slaughter".
		w9_2: "W9A2.ogg", // We cannot afford the legal fees, since the majority of our funds are spent feeding the contestants.
		w9_3: "W9A3.ogg", // With the funds.
		w9_4: "W9A4.ogg", // We feed them money.
		w9_5: "W9A5.ogg", // We are financially unstable.
		// Wave 10
		w10_1: "W10A1.ogg", // This next wave is by far the most challenging yet, Commander.
		w10_2: "W10A2.ogg", // But you have done well up to now, hopefully you can persevere.
		w10_3: "W10A3.ogg", // Please do not die yet. Our ratings have never been higher.
		// Post-waves
		end_1: "ENDA1.ogg", // Congratulations, Commander.
		end_2: "ENDA2.ogg", // You have successfully overcome the challenges and are now the Colosseum champion.
		end_3: "ENDA3.ogg", // We will now grant you your hard-earned victory prize.
		end_4: "ENDA4.ogg", // 5$ have been wired to your account.
		// Misc.
		cCheer: "crowd_cheer.ogg",
		cGasp: "crowd_gasp.ogg",
	},
}
// Pattern coordinates to place orange rocks.
// A "1" represents a position with it's index in 
// A "2" represents an invisible feature that prevents units from getting stuck
// the pattern's 2D array.
const camEasyPatterns = [
	// "Smile"
	// . . . . . . . . . . . .
	// . . . . . . . . . . . .
	// . . . # . . . . # . . .
	// . . . # . . . . # . . .
	// . . . # . . . . # . . .
	// . . . . . . . . . . . .
	// . . . . . . . . . . . .
	// . . . . . . . . . . . .
	// . . # . . . . . . # . .
	// . . . # # # # # # . . .
	// . . . . . . . . . . . .
	// . . . . . . . . . . . .
	[
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,1,0,0,0,0,1,0,0,0],
		[0,0,0,1,0,0,0,0,1,0,0,0],
		[0,0,0,1,0,0,0,0,1,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,1,0,0,0,0,0,0,1,0,0],
		[0,0,0,1,1,1,1,1,1,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
	],
	// "Loss"
	// . # . . . . . # . . . .
	// . # . . . . . # . . . .
	// . # . . . . . # . # . .
	// . # . . . . . # . # . .
	// . . . . . . . . . . . .
	// . . . . . . . . . . . .
	// . . . . . . . . . . . .
	// . . . . . . . . . . . .
	// . # . # . . . # . . . .
	// . # . # . . . # . . . .
	// . # . # . . . # . . . .
	// . # . # . . . # . # # #
	[
		[0,1,0,0,0,0,0,1,0,0,0,0],
		[0,1,0,0,0,0,0,1,0,0,0,0],
		[0,1,0,0,0,0,0,1,0,1,0,0],
		[0,1,0,0,0,0,0,1,0,1,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,1,0,1,0,0,0,1,0,0,0,0],
		[0,1,0,1,0,0,0,1,0,0,0,0],
		[0,1,0,1,0,0,0,1,0,0,0,0],
		[0,1,0,1,0,0,0,1,0,1,1,1],
	],
	// "WZ"
	// . . . . . . . . . . . .
	// . . . . . . . . . . . .
	// . . . . . . . . . . . .
	// . . . . . . . . . . . .
	// . # . . . # . # # # # .
	// . # . # . # . . . # . .
	// . # # . # # . . # . . .
	// . # . . . # . # # # # .
	// . . . . . . . . . . . .
	// . . . . . . . . . . . .
	// . . . . . . . . . . . .
	// . . . . . . . . . . . .
	[
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,1,0,0,0,1,0,1,1,1,1,0],
		[0,1,0,1,0,1,0,0,0,1,0,0],
		[0,1,1,0,1,1,0,0,1,0,0,0],
		[0,1,0,0,0,1,0,1,1,1,1,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
	],
	// "Infinity"
	// . . . . . . . . . . . .
	// . . . . . . . . . . . .
	// . . . . . . . . . . . .
	// . # # # # . . # # # # .
	// # . . . . # # . . . . #
	// # . . . . # # . . . . #
	// # . . . . # # . . . . #
	// . # # # # . . # # # # .
	// . . . . . . . . . . . .
	// . . . . . . . . . . . .
	// . . . . . . . . . . . .
	// . . . . . . . . . . . .
	[
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,1,1,1,1,0,0,1,1,1,1,0],
		[1,2,2,2,2,1,1,2,2,2,2,1],
		[1,2,2,2,2,1,1,2,2,2,2,1],
		[1,2,2,2,2,1,1,2,2,2,2,1],
		[0,1,1,1,1,0,0,1,1,1,1,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
	],
];
const camMediumPatterns = [
	// "Nubert"
	// . . . . . . . . . . . .
	// . . . . . . . . . . . .
	// . . . . . . . . . . . .
	// . . . . . . . . . . . .
	// . . . # # . . # # . . .
	// . # . . . . . . . . # .
	// . # # # # # # # # # # .
	// # . # . . . . . . # . #
	// . . . # # # # # # . . .
	// . . . . . . . . . . . .
	// . . . . . . . . . . . .
	// . . . . . . . . . . . .
	[
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,1,1,0,0,1,1,0,0,0],
		[0,1,0,0,0,0,0,0,0,0,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,0],
		[1,0,1,2,2,2,2,2,2,1,0,1],
		[0,0,0,1,1,1,1,1,1,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
	],
	// "Amogus"
	// . . . . . . . . . . . .
	// . . . . # # # # . . . .
	// . . . # # # # # # . . .
	// . . . . . . . # # # . .
	// . . . . . . . # # # . .
	// . . . # # # # # # # . .
	// . . . # # # # # # # . .
	// . . . # # # # # # . . .
	// . . . # # . . # # . . .
	// . . . # # . . # # . . .
	// . . . . . . . . . . . .
	// . . . . . . . . . . . .
	[
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,1,1,1,1,0,0,0,0],
		[0,0,0,1,1,1,1,1,1,0,0,0],
		[0,0,0,0,0,0,0,1,1,1,0,0],
		[0,0,0,0,0,0,0,1,1,1,0,0],
		[0,0,0,1,1,1,1,1,1,1,0,0],
		[0,0,0,1,1,1,1,1,1,1,0,0],
		[0,0,0,1,1,1,1,1,1,0,0,0],
		[0,0,0,1,1,0,0,1,1,0,0,0],
		[0,0,0,1,1,0,0,1,1,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
	],
	// "Epic Face"
	// . . . . . . . . . . . .
	// . # # . . . . . # # . .
	// # # . # . . . # # . # .
	// # # # # . . . # # # # .
	// . . . . . . . . . . . .
	// . . . . . . . . . . . .
	// # # # # # # # # # # # .
	// # . . . . . . . . . # .
	// . # . . . . # # # # . .
	// . . # # # # # # # . . .
	// . . . . . . . . . . . .
	// . . . . . . . . . . . .
	[
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,1,1,0,0,0,0,0,1,1,0,0],
		[1,1,2,1,0,0,0,1,1,2,1,0],
		[1,1,1,1,0,0,0,1,1,1,1,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[1,1,1,1,1,1,1,1,1,1,1,0],
		[1,2,2,2,2,2,2,2,2,2,1,0],
		[0,1,2,2,2,2,1,1,1,1,0,0],
		[0,0,1,1,1,1,1,1,1,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
	],
	// "Target"
	// . . . . . # . . . . . .
	// . . . . . # . # . . . .
	// . . . # . # . . # . . .
	// . . # . . # . . . # . .
	// . # . . . . . . . . . .
	// . . . . . # # . # # # #
	// # # # # . # # . . . . .
	// . . . . . . . . . . # .
	// . . # . . . # . . # . .
	// . . . # . . # . # . . .
	// . . . . # . # . . . . .
	// . . . . . . # . . . . .
	[
		[0,0,0,0,0,1,0,0,0,0,0,0],
		[0,0,0,0,0,1,0,1,0,0,0,0],
		[0,0,0,1,0,1,0,0,1,0,0,0],
		[0,0,1,0,0,1,0,0,0,1,0,0],
		[0,1,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,1,1,0,1,1,1,1],
		[1,1,1,1,0,1,1,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,1,0],
		[0,0,1,0,0,0,1,0,0,1,0,0],
		[0,0,0,1,0,0,1,0,1,0,0,0],
		[0,0,0,0,1,0,1,0,0,0,0,0],
		[0,0,0,0,0,0,1,0,0,0,0,0],
	],
];
const camHardPatterns = [
	// "Heart"
	// . . . . . . . . . . . .
	// . . # # . . . . # # . .
	// . # # # # . . # # # # .
	// . # # # # # # # # # # .
	// . # # # # # # # # # # .
	// . # # # # # # # # # # .
	// . . # # # # # # # # . .
	// . . # # # # # # # # . .
	// . . . # # # # # # . . .
	// . . . . # # # # . . . .
	// . . . . . # # . . . . .
	// . . . . . . . . . . . .
	[
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,1,1,0,0,0,0,1,1,0,0],
		[0,1,1,1,1,0,0,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,1,1,1,1,1,1,1,1,1,0],
		[0,0,1,1,1,1,1,1,1,1,0,0],
		[0,0,1,1,1,1,1,1,1,1,0,0],
		[0,0,0,1,1,1,1,1,1,0,0,0],
		[0,0,0,0,1,1,1,1,0,0,0,0],
		[0,0,0,0,0,1,1,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
	],
	// "Sans"
	// . . . . . . . . . . . .
	// . . . . . . . . . . . .
	// # # # . . . . . # # # .
	// # # # . . . . . # # # .
	// # # # . . # . . # # # .
	// . . . . # # # . . . . .
	// # . . . . . . . . . # .
	// # # # # # # # # # # # .
	// . # . # . # . # . # . .
	// . . # # # # # # # . . .
	// . . . . . . . . . . . .
	// . . . . . . . . . . . .
	[
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[1,1,1,0,0,0,0,0,1,1,1,0],
		[1,1,1,0,0,0,0,0,1,1,1,0],
		[1,1,1,0,0,1,0,0,1,1,1,0],
		[0,0,0,0,1,1,1,0,0,0,0,0],
		[1,0,0,0,0,0,0,0,0,0,1,0],
		[1,1,1,1,1,1,1,1,1,1,1,0],
		[0,1,2,1,2,1,2,1,2,1,0,0],
		[0,0,1,1,1,1,1,1,1,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0],
	],
	// "Creeper"
	// # # # # . . . . # # # #
	// # # # # . . . . # # # #
	// # # # # . . . . # # # #
	// # # # # . . . . # # # #
	// . . . . # # # # . . . .
	// . . . . # # # # . . . .
	// . . # # # # # # # # . .
	// . . # # # # # # # # . .
	// . . # # # # # # # # . .
	// . . # # # # # # # # . .
	// . . # # . . . . # # . .
	// . . # # . . . . # # . .
	[
		[1,1,1,1,0,0,0,0,1,1,1,1],
		[1,1,1,1,0,0,0,0,1,1,1,1],
		[1,1,1,1,0,0,0,0,1,1,1,1],
		[1,1,1,1,0,0,0,0,1,1,1,1],
		[0,0,0,0,1,1,1,1,0,0,0,0],
		[0,0,0,0,1,1,1,1,0,0,0,0],
		[0,0,1,1,1,1,1,1,1,1,0,0],
		[0,0,1,1,1,1,1,1,1,1,0,0],
		[0,0,1,1,1,1,1,1,1,1,0,0],
		[0,0,1,1,1,1,1,1,1,1,0,0],
		[0,0,1,1,0,0,0,0,1,1,0,0],
		[0,0,1,1,0,0,0,0,1,1,0,0],
	],
	// "Eye"
	// . . . . # # # # . . . .
	// . . # # . . . . # # . .
	// . # . . . # # . . . # .
	// . # . . # # . # . . # .
	// # . . . # . # # . . . #
	// # . . . # # . # . . . #
	// # . . . # . # # . . . #
	// # . . . # # . # . . . #
	// . # . . # . # # . . # .
	// . # . . . # # . . . # .
	// . . # # . . . . # # . .
	// . . . . # # # # . . . .
	[
		[0,0,0,0,1,1,1,1,0,0,0,0],
		[0,0,1,1,0,0,0,0,1,1,0,0],
		[0,1,0,0,0,1,1,0,0,0,1,0],
		[0,1,0,0,1,1,2,1,0,0,1,0],
		[1,0,0,0,1,2,1,1,0,0,0,1],
		[1,0,0,0,1,1,2,1,0,0,0,1],
		[1,0,0,0,1,2,1,1,0,0,0,1],
		[1,0,0,0,1,1,2,1,0,0,0,1],
		[0,1,0,0,1,2,1,1,0,0,1,0],
		[0,1,0,0,0,1,1,0,0,0,1,0],
		[0,0,1,1,0,0,0,0,1,1,0,0],
		[0,0,0,0,1,1,1,1,0,0,0,0],
	],
	// "Spamton"
	// . # # # # . . # # # # .
	// # . . . . # # . . . . #
	// # . . . . # # . . . . #
	// # . . . . # # . . . . #
	// . # # # # . . # # # # .
	// # # # # . . . . . . . .
	// . . . . . . . . . # # .
	// . . . . . . . . . # # .
	// # # # # # # # # # # . .
	// . . . # . . . . # . . .
	// . . . . # # # # . . . .
	// . . . . # . . # . . . .
	[
		[0,1,1,1,1,0,0,1,1,1,1,0],
		[1,2,2,2,2,1,1,2,2,2,2,1],
		[1,2,2,2,2,1,1,2,2,2,2,1],
		[1,2,2,2,2,1,1,2,2,2,2,1],
		[0,1,1,1,1,0,0,1,1,1,1,0],
		[1,1,1,1,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,1,1,0],
		[0,0,0,0,0,0,0,0,0,1,1,0],
		[1,1,1,1,1,1,1,1,1,1,0,0],
		[0,0,0,1,2,2,2,2,1,0,0,0],
		[0,0,0,0,1,1,1,1,0,0,0,0],
		[0,0,0,0,1,0,0,1,0,0,0,0],
	],
];

//artifact
var __camArtifacts;
var __camNumArtifacts;

//base
var __camEnemyBases;
var __camNumEnemyBases;

//dialogue
var __camQueuedDialogue;

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
const __camSpamtonReplacableStructs = [
	"GuardTower-MEGA", "Spawner-Zombie", "Spawner-Skeleton",
	"Spawner-Creeper", "A0HardcreteMk1CWall", "A0HardcreteMk1Wall",
	"Tower-Projector", "WallTower04", "Sys-SensoTower02",
	"GuardTowerEH", "GuardTower6", "PillBox1",
	"PillBox4", "PillBoxBison", "Pillbox-Big",
	"Sys-SensoTower03", "Tower-VulcanCan", "WallTower-HPVcannon",
	"GuardTower-Rail1", "GuardTower5", "GuardTower3",
	"GuardTower4H", "PillBox-BB", "PillBox-BB2",
	"PillBox-BB3", "WallTower02", "PillBox6",
	"X-Super-MG", "WallTower06", "WallTowerMG",
	"WallTower03Mk2","WallTower03Mk3","WallTower03Mk4",
	"WallTower03Mk5","WallTower03Mk6","WallTower03Mk7",
	"WallTower03Mk8","WallTower03Mk9","WallTower03Mk10",
	"WallTower03Mk11","WallTower03Mk12","WallTower03Mk13",
	"WallTower03Mk14","WallTower03Mk15", "WallTower01",
];
const __camSpamtonReplacementStructs = [
	"GuardTower-MEGASpam", "Spawner-ZombieSpam", "Spawner-SkeletonSpam",
	"Spawner-CreeperSpam", "CollectiveCWall", "CollectiveWall",
	"CO-Tower-HvFlame", "WallTower04Spam", "Sys-CO-SensoTower",
	"GuardTowerEHSpam", "GuardTower6Spam", "PillBox1Spam",
	"PillBox4Spam", "PillBoxBisonSpam", "Pillbox-BigSpam",
	"Sys-SensoTower03Spam", "Tower-VulcanCanSpam", "WallTower-HPVcannonSpam",
	"GuardTower-Rail1Spam", "GuardTower5Spam", "GuardTower3Spam",
	"GuardTower4HSpam", "PillBox-BBSpam", "PillBox-BB2Spam",
	"PillBox-BB3Spam", "WallTower02Spam", "PillBox6Spam",
	"X-Super-MGSpam", "WallTower06Spam", "WallTowerMGSpam",
	"WallTower03Mk2Spam","WallTower03Mk3Spam","WallTower03Mk4Spam",
	"WallTower03Mk5Spam","WallTower03Mk6Spam","WallTower03Mk7Spam",
	"WallTower03Mk8Spam","WallTower03Mk9Spam","WallTower03Mk10Spam",
	"WallTower03Mk11Spam","WallTower03Mk12Spam","WallTower03Mk13Spam",
	"WallTower03Mk14Spam","WallTower03Mk15Spam", "WallTower01Spam",
];
const __camSpamtonSigns = [
	"SpamSign1", "SpamSign2", "SpamSign3",
	"SpamSign4", "SpamSign5", "SpamSign6",
	"SpamSign7", "SpamSign8", "SpamSign9",
	"SpamSign11", "SpamSign12", "SpamSign13",
	"SpamSign14",
];

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
var __camGameOverPool; // List of possible random game over screens (chosen by level script)
// Full list of all game over screens (because this should at least be documented somewhere)
// "GAMEOVER_CRASH": CGI car crash scene
// "GAMEOVER_UK": ULTRAKILL game over screen
// "GAMEOVER_UT": Undertale game over screen
// "GAMEOVER_EXPLODE": Deltarune explosion
// "GAMEOVER_MICROWAVE": Spamton puts you in the microwave
// "GAMEOVER_JET": Jet crash scene
// "GAMEOVER_MISSILE": Missile bombardment scene
// "GAMEOVER_UTALT": Alternate Undertale game over where Spamton informs you that you suck

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
include(__CAM_INCLUDE_PATH + "dialogue.js");
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
