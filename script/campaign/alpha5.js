
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_clippyRes = [
	"R-Wpn-MG-Damage02", "R-Vehicle-Metals01", "R-Cyborg-Metals01",
];

camAreaEvent("attackTrigger1", function(droid)
{
	// Only trigger if the player moves a droid in
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		// Attack the player with the first attack group
		camManageGroup(camMakeGroup("attackGroup1"), CAM_ORDER_ATTACK, {
			fallback: camMakePos("clipBase1"),
			morale: 50
		});
		// Activate the first vehicle factory
		camEnableFactory("clipFact1");
	}
	else
	{
		resetLabel("attackTrigger1", CAM_HUMAN_PLAYER);
	}
});

camAreaEvent("attackTrigger2", function(droid)
{
	// Only trigger if the player moves a droid in
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		// Ambush the player with the second drift group
		camManageGroup(camMakeGroup("driftAmbushGroup2"), CAM_ORDER_ATTACK, {
			repair: 40
		});
		// Activate the second vehicle and cyborg factories
		camEnableFactory("clipFact2");
		camEnableFactory("clipCybFact2");
	}
	else
	{
		resetLabel("attackTrigger2", CAM_HUMAN_PLAYER);
	}
});

camAreaEvent("attackTrigger3", function(droid)
{
	// Only trigger if the player moves a droid in
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		// Ambush the player with the third drift group
		camManageGroup(camMakeGroup("driftAmbushGroup3"), CAM_ORDER_ATTACK, {
			repair: 20
		});
	}
	else
	{
		resetLabel("attackTrigger3", CAM_HUMAN_PLAYER);
	}
});

camAreaEvent("attackTrigger4", function(droid)
{
	// Only trigger if the player moves a droid in
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		// Ambush the player with the cyborg attack group
		camManageGroup(camMakeGroup("attackGroup2"), CAM_ORDER_ATTACK, {
			repair: 40
		});
	}
	else
	{
		resetLabel("attackTrigger3", CAM_HUMAN_PLAYER);
	}
});

camAreaEvent("doorTrigger", function(droid)
{
	// Only trigger if the player moves a droid in
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		// Play a message from Clippy
		camPlayVideos({video: "CLIP_ALPHA5_MSG2", type: MISS_MSG});
		camSetExtraObjectiveMessage(["Find a way to open the inconvenient doors", "Defeat Clippy"]);
	}
	else
	{
		resetLabel("doorTrigger", CAM_HUMAN_PLAYER);
	}
});

function eventDestroyed(obj)
{
	if (camDef(obj) && obj !== null && getLabel(obj) === "clipCC")
	{
		// The Command Center has been destroyed
		camCallOnce("openDoors");
	}
}

// Open doors and activate final bases once the CC has been destroyed
function openDoors()
{
	// "Open" the doors
	for (const door of enumFeature(ALL_PLAYERS, "GiantDoorHoriz").concat(enumFeature(ALL_PLAYERS, "GiantDoorVert")))
	{
		fireWeaponAtObj("VanishSFX", door);
		camSafeRemoveObject(door, true);
	}

	console(_("The doors have been unlocked!"));

	// Activate remaining factories
	camEnableFactory("clipFact3");
	camEnableFactory("clipFact4");
	camEnableFactory("clipCybFact3");
	camEnableFactory("clipCybFact4");

	// Enable Clippy's repair structures
	camUpgradeOnMapStructures("A0VtolPad", "A0RepairCentre1", CAM_CLIPPY);

	// Activate the remaining groups
	camManageGroup(camMakeGroup("driftAmbushGroup4"), CAM_ORDER_ATTACK, {
		repair: 20
	});
	camManageGroup(camMakeGroup("attackGroup3"), CAM_ORDER_ATTACK, {
		repair: 30,
		regroup: true,
		count: -1
	});

	camSetExtraObjectiveMessage("Defeat Clippy");
}

function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "BYE_BYE");
	camSetExtraObjectiveMessage("Defeat Clippy");
	const startpos = getObject("startPosition");
	const lz = getObject("landingZone");
	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);

	setMissionTime(camChangeOnDiff(camHoursToSeconds(1.25)));
	camPlayVideos({video: "CLIP_ALPHA5_MSG1", type: MISS_MSG});

	camCompleteRequiredResearch(mis_clippyRes, CAM_CLIPPY);

	camSetEnemyBases({
		"clipBaseOilN": {
			cleanup: "clipBase1",
			detectMsg: "C1C_BASE1",
			detectSnd: camSounds.project.enemyBase,
			eliminateSnd: camSounds.project.enemyBaseErad
		},
		"clipBaseHill": {
			cleanup: "clipBase2",
			detectMsg: "C1C_BASE2",
			detectSnd: camSounds.project.enemyBase,
			eliminateSnd: camSounds.project.enemyBaseErad
		},
		"clipBaseStation": {
			cleanup: "clipBase3",
			detectMsg: "C1C_BASE3",
			detectSnd: camSounds.project.enemyBase,
			eliminateSnd: camSounds.project.enemyBaseErad
		},
		"clipBaseOilS": {
			cleanup: "clipBase4",
			detectMsg: "C1C_BASE4",
			detectSnd: camSounds.project.enemyBase,
			eliminateSnd: camSounds.project.enemyBaseErad
		},
		"clipBaseOilHill": {
			cleanup: "clipBase5",
			detectMsg: "C1C_BASE5",
			detectSnd: camSounds.project.enemyBase,
			eliminateSnd: camSounds.project.enemyBaseErad
		},
		"clipBaseCybS": {
			cleanup: "clipBase6",
			detectMsg: "C1C_BASE6",
			detectSnd: camSounds.project.enemyBase,
			eliminateSnd: camSounds.project.enemyBaseErad
		},
		"clipBaseDoorCC": {
			cleanup: "clipBase7",
			detectMsg: "C1C_BASE7",
			detectSnd: camSounds.project.enemyBase,
			eliminateSnd: camSounds.project.enemyBaseErad
		},
		"clipBasePlateau": {
			cleanup: "clipBase8",
			detectMsg: "C1C_BASE8",
			detectSnd: camSounds.project.enemyBase,
			eliminateSnd: camSounds.project.enemyBaseErad
		},
		"clipBaseMain": {
			cleanup: "clipBase9",
			detectMsg: "C1C_BASE9",
			detectSnd: camSounds.project.enemyBase,
			eliminateSnd: camSounds.project.enemyBaseErad
		},
	});

	camSetArtifacts({
		"clipPillBox": { tech: "R-Wpn-Cannon1Mk1" }, // Light Cannon
		"clipCatapult": { tech: "R-Wpn-Mortar01Lt" }, // Catapult
		"clipResearch": { tech: "R-Vehicle-Metals01" }, // Composite Alloys
		"clipFact2": { tech: "R-Wpn-ScorchShot" }, // Scorch Shot
	});
	
	camSetFactories({
		"clipFact1": {
			assembly: "clipAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			data: {
				regroup: true,
				count: -1,
			},
			templates: [ cTempl.crlmgw, cTempl.crlmgw, cTempl.crlbbw, cTempl.crlcanw ] // General units
		},
		"clipFact2": {
			assembly: "clipAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			data: {
				regroup: false,
				repair: 30,
				count: -1,
			},
			templates: [ cTempl.crlmgdw, cTempl.crlcandw, cTempl.crlpoddw, cTempl.crlmgdw ] // Drift units
		},
		"clipFact3": {
			assembly: "clipAssembly3",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			data: {
				regroup: true,
				count: -1,
			},
			templates: [ cTempl.crlsens, cTempl.crlmortw, cTempl.crlmortw, cTempl.crlcanw, cTempl.crlpodw, cTempl.crlscorchw ] // General units + artillery
		},
		"clipFact4": {
			assembly: "clipAssembly3",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(35)),
			data: {
				regroup: false,
				repair: 30,
				count: -1,
			},
			templates: [ cTempl.crlpoddw, cTempl.crlcandw, cTempl.crlscorchdw, cTempl.crlscorchdw ] // Drift units
		},
		"clipCybFact1": {
			assembly: "clipCybAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(35)),
			data: {
				regroup: true,
				count: -1,
			},
			templates: [ cTempl.crcybmg, cTempl.crcybmg, cTempl.crcybbb ]
		},
		"clipCybFact2": {
			assembly: "clipCybAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			data: {
				regroup: true,
				repair: 40,
				count: -1,
			},
			templates: [ cTempl.crcybmg, cTempl.crcybpod, cTempl.crcybpyro ]
		},
		"clipCybFact3": {
			assembly: "clipCybAssembly3",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			data: {
				regroup: false,
				repair: 30,
				count: -1,
			},
			templates: [ cTempl.crcybbb, cTempl.crcybcan, cTempl.crcybpod ]
		},
		"clipCybFact4": {
			assembly: "clipAssembly3",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			data: {
				regroup: true,
				repair: 50,
				count: -1,
			},
			templates: [ cTempl.crcybcool, cTempl.crcybcool, cTempl.crcybpyro ]
		},
	});

	camEnableFactory("clipCybFact1");
	camManageGroup(camMakeGroup("driftAmbushGroup1"), CAM_ORDER_ATTACK);
	camManageGroup(camMakeGroup("patrolGroup1"), CAM_ORDER_PATROL, {
		pos: ["patrolPos1", "patrolPos2", "patrolPos3"],
		interval: camSecondsToMilliseconds(25)
	});
	camManageGroup(camMakeGroup("patrolGroup2"), CAM_ORDER_PATROL, {
		pos: ["patrolPos4", "patrolPos5", "patrolPos6"],
		interval: camSecondsToMilliseconds(25)
	});
	camManageGroup(camMakeGroup("patrolGroup3"), CAM_ORDER_PATROL, {
		pos: ["patrolPos7", "patrolPos8"],
		interval: camSecondsToMilliseconds(20)
	});

	// If there's any doors from the previous mission (if the player cheated), remove them
	for (const door of enumFeature(ALL_PLAYERS, "GiantDoorHoriz").concat(enumFeature(ALL_PLAYERS, "GiantDoorVert")))
	{
		camSafeRemoveObject(door, true);
	}

	// Replace all snowy trees with funny explosive barrels
	camUpgradeOnMapFeatures("TreeSnow3", "ExplosiveDrum");

	// Add the gigantic doors (and signs)
	camUpgradeOnMapFeatures("TreeSnow1", "GiantDoorHoriz");
	camUpgradeOnMapFeatures("TreeSnow2", "GiantDoorVert");
	camUpgradeOnMapFeatures("Pylon", "Sign1");

	// Make Clippy's structures funny
	camUpgradeOnMapStructures("GuardTower1", "GuardTower1MG", CAM_CLIPPY);
	camUpgradeOnMapStructures("WallTower05", "WallTowerMG", CAM_CLIPPY);
	camUpgradeOnMapStructures("GuardTower4", "GuardTower4H", CAM_CLIPPY);
	camUpgradeOnMapStructures("A0RepairCentre3", "A0RepairCentre1", CAM_CLIPPY);
	// camUpgradeOnMapStructures("A0VTolFactory1", "", CAM_CLIPPY); // TODO: Clippy's Computer

	// Make Clippy's units funny
	camUpgradeOnMapTemplates(cTempl.crlmght, cTempl.crlmgdw, CAM_CLIPPY);
	camUpgradeOnMapTemplates(cTempl.crlcanht, cTempl.crlcandw, CAM_CLIPPY);
	camUpgradeOnMapTemplates(cTempl.crlscorchht, cTempl.crlscorchdw, CAM_CLIPPY);
	camUpgradeOnMapTemplates(cTempl.crmmortht, cTempl.crlmortw, CAM_CLIPPY);
	camUpgradeOnMapTemplates(cTempl.npcybr, cTempl.crcybbb, CAM_CLIPPY);

	// Spamton items
	camQueueDialogue("New research options are available!", camSecondsToMilliseconds(1), camSounds.spamton.laugh);
	enableResearch("R-Wpn-Rocket05-MiniPod"); // Many-Rocket Pod
}
