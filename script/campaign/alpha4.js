
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_enemyRes = [
	"R-Wpn-MG-Damage01",
];

const MIS_PUZZLE_TIME_THRESHOLD = camChangeOnDiff(camMinutesToSeconds(30));

// Keep track of the number of structures required to complete each pattern
var pattern1Count;
var pattern2Count;
var pattern3Count;

// Keep track of which doors have been opened
var door1Open;
var door2Open;
var door3Open;

var tonySpawned;
var tonyGroup;
var tonyMourned;

// True if Clippy has started launching transports
var clippyTransportsActive;

camAreaEvent("RemoveBeacon", function()
{
	hackRemoveMessage("C1C_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER);
});

camAreaEvent("tonyTrigger", function(droid)
{
	// Only trigger if the player moves a droid in
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		if (tonySpawned)
		{
			camPlayVideos({video: "TONY_ENCOUNTER", type: MISS_MSG});

			// Tell Tony to attack
			camManageGroup(tonyGroup, CAM_ORDER_ATTACK);
		}
	}
	else
	{
		resetLabel("tonyTrigger", CAM_HUMAN_PLAYER);
	}
});

camAreaEvent("patternZone1", function(droid)
{
	// Only trigger if the player moves a droid in
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		camPlayVideos({video: "CLIP_ALPHA4_MSG1", type: MISS_MSG});
	}
	else
	{
		resetLabel("patternZone1", CAM_HUMAN_PLAYER);
	}

});

function eventStructureBuilt(structure, droid)
{
	if (structure.player !== CAM_HUMAN_PLAYER || clippyTransportsActive)
	{
		return; // Don't care
	}
	if (enumArea("patternZone2", CAM_HUMAN_PLAYER, false).filter((obj) => (
		obj.type === STRUCTURE
	)).length > 0)
	{
		// The player has started working on the second pattern puzzle
		// Clippy can help with that :)
		clippyTransportsActive = true;

		setTimer("sendClippyTransport", camChangeOnDiff(camMinutesToMilliseconds(2)));
		queue("sendClippyTransport", camSecondsToMilliseconds(10)); // Send one right away

		// Funny message from Clippy
		camPlayVideos({video: "CLIP_ALPHA4_MSG2", type: MISS_MSG});
	}
}

function eventDestroyed(obj)
{
	if (obj.type === FEATURE && obj.name === _("Sign 2") && !door1Open)
	{
		// Make sure the isn't destroyed before the door is opened (in case the player forgets what to do)
		addFeature("Sign2", obj.x, obj.y);
	}
	
	if (tonySpawned && !tonyMourned && obj.type === DROID && groupSize(tonyGroup) < 1)
	{
		// Mourn the loss of Tony
		queue("tonyDeathMessage", camSecondsToMilliseconds(1));
		tonyMourned = true;
	}
}

// RIP Tony :(
function tonyDeathMessage()
{
	camPlayVideos({video: "TONY_DEATH", type: MISS_MSG});
}

// Send a transport to harrass the player as they try to do a puzzle
function sendClippyTransport()
{
	let pos;
	if (!door2Open && enumArea("patternZone2", CAM_HUMAN_PLAYER, false).filter((obj) => (
		obj.type === STRUCTURE
	)).length > 0)
	{
		pos = camGenerateRandomMapCoordinateWithinRadius(camMakePos("patrolPos4"), 10);
		if (pos === null) pos = camMakePos("patrolPos4");
		camSendReinforcement(CAM_CLIPPY, pos, getDroidsForClippyLZ(),
			CAM_REINFORCE_TRANSPORT, {
				entry: { x: 107, y: 70 },
				exit: { x: 107, y: 70 }
			})
	}
	else if (!door3Open && enumArea("patternZone3", CAM_HUMAN_PLAYER, false).filter((obj) => (
		obj.type === STRUCTURE
	)).length > 0)
	{
		pos = camGenerateRandomMapCoordinateWithinRadius(camMakePos("patrolPos8"), 10);
		if (pos === null) pos = camMakePos("patrolPos8");
		camSendReinforcement(CAM_CLIPPY, pos, getDroidsForClippyLZ(),
			CAM_REINFORCE_TRANSPORT, {
				entry: { x: 107, y: 70 },
				exit: { x: 107, y: 70 }
			})
	}
}

function getDroidsForClippyLZ()
{
	let door2Templates = [ cTempl.crlmgw, cTempl.crlbbw, cTempl.crlbbw, cTempl.crlscorchw, cTempl.crcybmg ];
	let door3Templates = [ cTempl.crcybbb, cTempl.crcybbb, cTempl.crlcanw, cTempl.crcybcool, cTempl.crcybpyro ];

	let templates = !door2Open ? door2Templates : door2Templates.concat(door3Templates);
	let numUnits = !door2Open ? 6 : 8;
	let list = [];

	for (let i = 0; i < numUnits; ++i)
	{
		list[list.length] = templates[camRand(templates.length)];
	}

	return list;
}

// Place orange rocks according to the selected pattern
function initializePatterns()
{
	// Top-left corners of the template pattern boards
	let pattern1Pos = {x: 70, y: 90};
	let pattern2Pos = {x: 70, y: 55};
	let pattern3Pos = {x: 78, y: 5};

	// Choose a random pattern from each list
	let pattern1 = camEasyPatterns[camRand(camEasyPatterns.length)];
	let pattern2 = camMediumPatterns[camRand(camMediumPatterns.length)];
	let pattern3 = camHardPatterns[camRand(camHardPatterns.length)];

	// Possible rock types to place
	let rockTypes = ["Boulder1", "Boulder2", "Boulder3"];

	pattern1Count = 0;
	pattern2Count = 0;
	pattern3Count = 0;

	// Place rocks in pattern 1
	for (let y = 0; y < pattern1.length; y++)
	{
		for (let x = 0; x < pattern1[y].length; x++)
		{
			if (pattern1[y][x] === 1)
			{
				pattern1Count++;
				addFeature(rockTypes[camRand(rockTypes.length)], pattern1Pos.x + x, pattern1Pos.y + y);
			}
			else if (pattern1[y][x] === 2)
			{
				// These should prevent units from getting stuck inside the rock patterns
				addFeature("PatternDummy", pattern1Pos.x + x, pattern1Pos.y + y);
			}
		}
	}

	// Place rocks in pattern 2
	for (let y = 0; y < pattern2.length; y++)
	{
		for (let x = 0; x < pattern2[y].length; x++)
		{
			if (pattern2[y][x] === 1)
			{
				pattern2Count++;
				addFeature(rockTypes[camRand(rockTypes.length)], pattern2Pos.x + x, pattern2Pos.y + y);
			}
			else if (pattern2[y][x] === 2)
			{
				addFeature("PatternDummy", pattern2Pos.x + x, pattern2Pos.y + y);
			}
		}
	}

	// Place rocks in pattern 3
	for (let y = 0; y < pattern3.length; y++)
	{
		for (let x = 0; x < pattern3[y].length; x++)
		{
			if (pattern3[y][x] === 1)
			{
				pattern3Count++;
				addFeature(rockTypes[camRand(rockTypes.length)], pattern3Pos.x + x, pattern3Pos.y + y);
			}
			else if (pattern3[y][x] === 2)
			{
				addFeature("PatternDummy", pattern3Pos.x + x, pattern3Pos.y + y);
			}
		}
	}
}

// See if the player has successfully completed a pattern
function checkPatterns()
{
	// A pattern is complete if both:
	// 1: The number of player structures on the grid equals the corresponding pattern count variable.
	// 2: Each player structure on the grid is aligned to an orange rock on the template grid.

	let pattern1Structs = enumArea("patternZone1", ALL_PLAYERS, false).filter((obj) => (
		obj.type === STRUCTURE || (obj.type === FEATURE && obj.name === _("Explosive Drum"))
	));
	let pattern2Structs = enumArea("patternZone2", ALL_PLAYERS, false).filter((obj) => (
		obj.type === STRUCTURE || (obj.type === FEATURE && obj.name === _("Explosive Drum"))
	));
	let pattern3Structs = enumArea("patternZone3", ALL_PLAYERS, false).filter((obj) => (
		obj.type === STRUCTURE || (obj.type === FEATURE && obj.name === _("Explosive Drum"))
	));

	if (!door1Open && pattern1Structs.length === pattern1Count)
	{
		// The correct number of structures are present; now check if everything lines up
		for (const struct of pattern1Structs)
		{
			// The first pattern grid is 23 tiles east of the template grid...
			// So each structure should have a corresponding orange rock 23 tiles to the west
			let obj = getObject((struct.x) - 23, struct.y);

			if (obj === null || !camDef(obj) || obj.type !== FEATURE || obj.stattype !== 5) // 5 is stattype BOULDER
			{
				return; // Mismatch found, no need to check further
			}
		}

		// If we made it to this point, then everything checks out.
		camCallOnce("openFirstDoor");
	}
	if (!door2Open && pattern2Structs.length === pattern2Count)
	{
		for (const struct of pattern2Structs)
		{
			// The second pattern grid is 14 tiles east of the template grid...
			// So each structure should have a corresponding orange rock 14 tiles to the west
			let obj = getObject((struct.x) - 14, struct.y);

			if (obj === null || !camDef(obj) || obj.type !== FEATURE || obj.stattype !== 5) // 5 is stattype BOULDER
			{
				return;
			}
		}

		camCallOnce("openSecondDoor");
	}
	if (!door3Open && pattern3Structs.length === pattern3Count)
	{
		for (const struct of pattern3Structs)
		{
			// The third pattern grid is also 14 tiles east of the template grid...
			// So each structure should have a corresponding orange rock 14 tiles to the west
			let obj = getObject((struct.x) - 14, struct.y);

			if (obj === null || !camDef(obj) || obj.type !== FEATURE || obj.stattype !== 5) // 5 is stattype BOULDER
			{
				return;
			}
		}

		camCallOnce("openThirdDoor");
	}
}

// "Open" the first door and wake up the second room
function openFirstDoor()
{
	door1Open = true;
	cameraSlide(88 * 128, 87 * 128); // Center the camera on the door dramatically
	queue("doorEffects", camSecondsToMilliseconds(2));

	camEnableFactory("clipFactory1");
	camManageGroup(camMakeGroup("patternZone2"), CAM_ORDER_PATROL, {
		pos: [ "patrolPos1", "patrolPos2", "patrolPos3", "patrolPos4" ],
		interval: camSecondsToMilliseconds(20)
	});

	camSetExtraObjectiveMessage("Open the second inconvenient door");

	// Grant the player more time if they're about to run out
	if (getMissionTime() < MIS_PUZZLE_TIME_THRESHOLD)
	{
		setMissionTime(MIS_PUZZLE_TIME_THRESHOLD);
	}
}

// Delayed effects for the first door
function doorEffects()
{
	fireWeaponAtObj("VanishSFX", getObject("door1"));
	camSafeRemoveObject("door1", true);
}

// Open the second door and wake up the final room
function openSecondDoor()
{
	door2Open = true;
	fireWeaponAtObj("VanishSFX", getObject("door2"));
	camSafeRemoveObject("door2", true);

	camEnableFactory("clipFactory2");
	camEnableFactory("scavFactory2");
	camEnableFactory("clipCybFactory1");
	camEnableFactory("clipCybFactory2");
	camManageGroup(camMakeGroup("patternZone3"), CAM_ORDER_PATROL, {
		pos: [ "patrolPos5", "patrolPos6", "patrolPos7", "patrolPos8", "patrolPos9" ],
		interval: camSecondsToMilliseconds(20)
	});
	camManageGroup(camMakeGroup("scavBaseGroup3"), CAM_ORDER_PATROL, {
		pos: [ "patrolPos9", "patrolPos10", "patrolPos11" ],
		interval: camSecondsToMilliseconds(20)
	});

	// Grant the player more time if they're about to run out
	if (getMissionTime() < MIS_PUZZLE_TIME_THRESHOLD)
	{
		setMissionTime(MIS_PUZZLE_TIME_THRESHOLD);
	}

	camSetExtraObjectiveMessage("Open the final inconvenient door");
}

// Open the last door and allow the player to win
function openThirdDoor()
{
	door3Open = true;
	fireWeaponAtObj("VanishSFX", getObject("door3"));
	camSafeRemoveObject("door3", true);

	camSetExtraObjectiveMessage(undefined);
}

function doorCheck()
{
	if (door3Open)
	{
		return true;
	}
	else
	{
		return undefined;
	}
}

function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "CTF_2FORT", {callback: "doorCheck"});
	camSetGameOverScenePool([
		"GAMEOVER_CRASH", "GAMEOVER_UT", "GAMEOVER_UK",
		"GAMEOVER_EXPLODE", "GAMEOVER_JET", "GAMEOVER_MISSILE",
	]);
	const startpos = getObject("startPosition");
	const lz = getObject("landingZone");
	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);

	setMissionTime(camChangeOnDiff(camHoursToSeconds(1.5)));

	door1Open = false;
	door2Open = false;
	door3Open = false;
	clippyTransportsActive = false;

	setReinforcementTime(-1);
	setAlliance(CAM_CLIPPY, CAM_SCAV_7, true);
	camCompleteRequiredResearch(mis_enemyRes, CAM_CLIPPY);
	camCompleteRequiredResearch(mis_enemyRes, CAM_SCAV_7);

	tonyGroup = camNewGroup();
	tonyMourned = false;
	if (camRand(3) === 0)
	{
		// 33% chance of Tony being encountered on this level
		completeResearch("Script-Tony-Encountered");
		// Spawn Tony
		const pos = camMakePos("tonyGroup");
		groupAdd(tonyGroup, addDroid(CAM_SCAV_7, pos.x, pos.y, 
			_("Tony"), "B1BaBaPerson01", "BaBaLegs", "", "", "BabaMG"
		));
		tonySpawned = true;
	}
	else
	{
		tonySpawned = false;
	}

	camSetEnemyBases({
		"scavBase1": {
			cleanup: "scavBaseGroup1",
			detectMsg: "C1C_BASE1",
			detectSnd: camSounds.project.scavBase,
			eliminateSnd: camSounds.project.scavBaseErad,
		},
		"scavBase2": {
			cleanup: "scavBaseGroup2",
			detectMsg: "C1C_BASE2",
			detectSnd: camSounds.project.scavBase,
			eliminateSnd: camSounds.project.scavBaseErad,
		},
		"scavBase3": {
			cleanup: "scavBaseGroup3", // overlaps with clipBaseGroup3
			detectMsg: "C1C_BASE3",
			detectSnd: camSounds.project.scavBase,
			eliminateSnd: camSounds.project.scavBaseErad,
			player: CAM_SCAV_7 // hence discriminate by player filter
		},
		"clipBase1": {
			cleanup: "clipBaseGroup1",
			detectMsg: "C1C_BASE4",
			detectSnd: camSounds.project.enemyBase,
			eliminateSnd: camSounds.project.enemyBaseErad,
		},
		"clipBase2": {
			cleanup: "clipBaseGroup2",
			detectMsg: "C1C_BASE5",
			detectSnd: camSounds.project.enemyBase,
			eliminateSnd: camSounds.project.enemyBaseErad,
		},
		"clipBase3": {
			cleanup: "clipBaseGroup3", // overlaps with scavBaseGroup3
			detectMsg: "C1C_BASE6",
			detectSnd: camSounds.project.enemyBase,
			eliminateSnd: camSounds.project.enemyBaseErad,
			player: CAM_CLIPPY // hence discriminate by player filter
		},
		"clipBase4": {
			cleanup: "clipBaseGroup4",
			detectMsg: "C1C_BASE7",
			detectSnd: camSounds.project.enemyBase,
			eliminateSnd: camSounds.project.enemyBaseErad,
		},
		"clipBase5": {
			cleanup: "clipBaseGroup5",
			detectMsg: "C1C_BASE8",
			detectSnd: camSounds.project.enemyBase,
			eliminateSnd: camSounds.project.enemyBaseErad,
		},
	});

	hackAddMessage("C1C_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER, false); // initial beacon
	camPlayVideos({video: "SPAM_ALPHA4_MSG", type: CAMP_MSG});

	camSetArtifacts({
		"synapticCrate": { tech: "R-Comp-SynapticLink" }, // Synaptic Link
		"clipFactory1": { tech: "R-Wpn-Rocket03-HvAT" }, // Bunker Buster
		"clipResearch1": { tech: "R-Struc-Research-Module" }, // Research Module
		"clipResearch2": { tech: "R-Defense-HardcreteWall" }, // Hardcrete
		"clipCybFactory1": { tech: "R-Cyborg-Wpn-MGCool" }, // Cooler Machinegunner Cyborg
	});
	
	camSetFactories({
		"scavFactory1": {
			assembly: "scavAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(15)),
			templates: [ cTempl.bloke, cTempl.bjeep, cTempl.trike, cTempl.buggy ]
		},
		"scavFactory2": {
			assembly: "scavAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(25)),
			templates: [ cTempl.buscan, cTempl.rbjeep8, cTempl.bjeep, cTempl.bloke ]
		},
		"clipFactory1": {
			assembly: "clipAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			data: {
				regroup: false,
				count: -1,
			},
			templates: [ cTempl.crlmgw, cTempl.crlmgw, cTempl.crlscorchw ]
		},
		"clipFactory2": {
			assembly: "clipAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(50)),
			data: {
				regroup: false,
				repair: 30,
				count: -1,
			},
			templates: [ cTempl.crlmgw, cTempl.crlmgw, cTempl.crlscorchw, cTempl.crlbbw ]
		},
		"clipCybFactory1": {
			assembly: "clipCybAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			data: {
				regroup: false,
				repair: 30,
				count: -1,
			},
			templates: [ cTempl.crcybmg, cTempl.crcybmg, cTempl.crcybcool ]
		},
		"clipCybFactory2": {
			assembly: "clipCybAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(50)),
			data: {
				regroup: false,
				count: -1,
			},
			templates: [ cTempl.crcybmg, cTempl.crcybmg, cTempl.crcybpyro ]
		},
	});	

	camEnableFactory("scavFactory1");
	camManageGroup(camMakeGroup("scavAttackGroup"), CAM_ORDER_ATTACK);

	initializePatterns();

	// Replace all snowy trees with funny explosive barrels
	camUpgradeOnMapFeatures("TreeSnow3", "ExplosiveDrum");

	// Add the gigantic doors (and signs)
	camUpgradeOnMapFeatures("TreeSnow1", "GiantDoorHoriz");
	camUpgradeOnMapFeatures("TreeSnow2", "GiantDoorVert");
	camUpgradeOnMapFeatures("Pylon", "Sign2");
	camUpgradeOnMapFeatures("OilTower", "Sign3");
	camUpgradeOnMapFeatures("Pipe1A", "Sign7");

	// HACK: Automatic label transfer doesn't seem to work for features...
	addLabel(getObject(87, 86), "door1");
	addLabel(getObject(98, 50), "door2");
	addLabel(getObject(106, 18), "door3");

	// Make Clippy's structures funny
	camUpgradeOnMapStructures("GuardTower1", "GuardTower1MG", CAM_CLIPPY);
	camUpgradeOnMapStructures("WallTower05", "WallTowerMG", CAM_CLIPPY);
	camUpgradeOnMapStructures("PillBox6", "PillBox-BB", CAM_CLIPPY);
	camUpgradeOnMapStructures("A0RepairCentre3", "A0RepairCentre1", CAM_CLIPPY);
	camUpgradeOnMapStructures("A0CommandCentre", "A0CommandCentreNP", CAM_CLIPPY);

	setTimer("checkPatterns", camSecondsToMilliseconds(1));

	// Spamton items
	camQueueDialogue("New research options are available!", camSecondsToMilliseconds(1), camSounds.spamton.laugh);
	enableResearch("R-Wpn-RailGun01"); // Needler
}
