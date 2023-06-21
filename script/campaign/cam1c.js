
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const ENEMY_RES = [
	"R-Wpn-Flamer-Damage01", "R-Wpn-MG-Damage02",
];

function getDroidsForClippyLZ(args)
{
	var scouts = [ cTempl.nppod, cTempl.nphmg ];
	var heavies = [ cTempl.npslc, cTempl.npsmct ];
	var useArtillery = (camRand(100) < 50);

	var numScouts = camRand(5) + 1;
	var heavy = heavies[camRand(heavies.length)];
	var list = [];

	if (useArtillery)
	{
		list[list.length] = cTempl.npsens; //sensor will count towards scout total
		numScouts -= 1;
		heavy = cTempl.npmor;
	}

	for (let i = 0; i < numScouts; ++i)
	{
		list[list.length] = scouts[camRand(scouts.length)];
	}

	for (let a = numScouts; a < 8; ++a)
	{
		list[list.length] = heavy;
	}

	return list;
}

// camAreaEvent("NPLZ1Trigger", function()
// {
// 	// Message4 here, Message3 for the second LZ, and
// 	// please don't ask me why they did it this way
// 	camPlayVideos({video: "MB1C4_MSG", type: MISS_MSG});
// 	camDetectEnemyBase("NPLZ1Group");

// 	camSetBaseReinforcements("NPLZ1Group", camChangeOnDiff(camMinutesToMilliseconds(5)), "getDroidsForClippyLZ",
// 		CAM_REINFORCE_TRANSPORT, {
// 			entry: { x: 126, y: 76 },
// 			exit: { x: 126, y: 36 }
// 		}
// 	);
// });

function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "CAM_1CA");
	var startpos = getObject("startPosition");
	var lz = getObject("landingZone");
	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);

	setMissionTime(camChangeOnDiff(camHoursToSeconds(1)));

	setReinforcementTime(-1);
	setAlliance(CLIPPY, SCAV_7, true);
	camCompleteRequiredResearch(ENEMY_RES, CLIPPY);
	camCompleteRequiredResearch(ENEMY_RES, SCAV_7);

	camSetEnemyBases({
		"scavBase1": {
			cleanup: "scavBaseGroup1",
			detectMsg: "C1C_BASE1",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv391.ogg"
		},
		"scavBase2": {
			cleanup: "scavBaseGroup2",
			detectMsg: "C1C_BASE2",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv391.ogg"
		},
		"scavBase3": {
			cleanup: "scavBaseGroup3", // overlaps with clipBaseGroup3
			detectMsg: "C1C_BASE3",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv391.ogg",
			player: SCAV_7 // hence discriminate by player filter
		},
		"clipBase1": {
			cleanup: "clipBaseGroup1",
			detectMsg: "C1C_BASE4",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg"
		},
		"clipBase2": {
			cleanup: "clipBaseGroup2",
			detectMsg: "C1C_BASE5",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"clipBase3": {
			cleanup: "clipBaseGroup3", // overlaps with scavBaseGroup3
			detectMsg: "C1C_BASE6",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
			player: CLIPPY // hence discriminate by player filter
		},
		"clipBase4": {
			cleanup: "clipBaseGroup4",
			detectMsg: "C1C_BASE7",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"clipBase5": {
			cleanup: "clipBaseGroup5",
			detectMsg: "C1C_BASE8",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
	});

	hackAddMessage("C1C_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER, false); // initial beacon
	camPlayVideos([{video: "MB1C_MSG", type: CAMP_MSG}, {video: "MB1C2_MSG", type: CAMP_MSG}]);

	camSetArtifacts({
		"synapticCrate": { tech: "R-Comp-SynapticLink" }, // Synaptic Link
		"clipFactory1": { tech: "R-Wpn-Rocket03-HvAT" }, // Bunker Buster
		"clipResearch1": { tech: "R-Struc-Research-Module" }, // Research Module
		"clipResearch2": { tech: "R-Defense-HardcreteWall" }, // Hardcrete
		"clipCybFactory1": { tech: "R-Vehicle-Engine01" }, // TODO: Cooler Machinegunner Cyborg
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
			throttle: camChangeOnDiff(camSecondsToMilliseconds(60)),
			data: {
				regroup: false,
				repair: 30,
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

	// Replace all snowy trees with funny explosive barrels
	camUpgradeOnMapFeatures("TreeSnow3", "ExplosiveDrum");

	// Add the gigantic doors
	camUpgradeOnMapFeatures("TreeSnow1", "GiantDoorHoriz");
	camUpgradeOnMapFeatures("TreeSnow2", "GiantDoorVert");

	// Make Clippy's structures funny
	camUpgradeOnMapStructures("GuardTower1", "GuardTower1MG", CLIPPY);
	camUpgradeOnMapStructures("WallTower05", "WallTowerMG", CLIPPY);
	camUpgradeOnMapStructures("PillBox6", "PillBox-BB", CLIPPY);
}
