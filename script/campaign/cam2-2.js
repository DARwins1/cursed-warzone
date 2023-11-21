include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_bonziRes = [
	"R-Wpn-MG-Damage02", "R-Vehicle-Metals01", "R-Cyborg-Metals01",
	"R-Defense-WallUpgrade01", "R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage01",
	"R-Wpn-Cannon-Damage01", "R-Wpn-MG-ROF01", "R-Struc-RprFac-Upgrade01",
];

camAreaEvent("bbFactoryTrigger", function(droid)
{
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		// Start calling in transports
		setTimer("sendBBTransporter", camChangeOnDiff(camMinutesToMilliseconds(4.5)));
		queue("activateSecondFactories", camChangeOnDiff(camMinutesToMilliseconds(2.5)));
	}
	else
	{
		resetLabel("bbFactoryTrigger", CAM_HUMAN_PLAYER);
	}
});

//Send a Bonzi Buddy transport
function sendBBTransporter()
{
	const nearbyDefense = enumArea("bbBase3", CAM_BONZI_BUDDY, false);

	if (nearbyDefense.length > 0)
	{
		camSendReinforcement(CAM_BONZI_BUDDY, camMakePos("bbLandingZone"), getDroidsForBBLZ(),
			CAM_REINFORCE_TRANSPORT, {
				entry: { x: 49, y: 3 },
				exit: { x: 49, y: 3 }
			}
		);
	}
	else
	{
		removeTimer("sendBBTransporter");
	}
}

function getDroidsForBBLZ()
{
	const droids = [];
	const COUNT = 6 + difficulty; // 6 to 10 units
	const list = [cTempl.crmbb2t, cTempl.crmhmgt, cTempl.crmmcant];

	for (let i = 0; i < COUNT; ++i)
	{
		droids.push(list[camRand(list.length)]);
	}

	return droids;
}

// Start moving patrols around
function startPatrols()
{
	camManageGroup(camMakeGroup("bbPatrolGroup1"), CAM_ORDER_PATROL, {
		pos: ["patrolPos1", "patrolPos2", "patrolPos3"],
		interval: camSecondsToMilliseconds(30)
	});
	camManageGroup(camMakeGroup("bbPatrolGroup2"), CAM_ORDER_PATROL, {
		pos: ["patrolPos4", "patrolPos5", "patrolPos6"],
		interval: camSecondsToMilliseconds(30)
	});
	camManageGroup(camMakeGroup("bbPatrolGroup3"), CAM_ORDER_PATROL, {
		pos: ["patrolPos7", "patrolPos8"],
		interval: camSecondsToMilliseconds(20)
	});
}

// Ambush the player's LZ
function sensorAmbush()
{
	camManageGroup(camMakeGroup("bbAmbushGroup"), CAM_ORDER_COMPROMISE, {
		pos: camMakePos("landingZone"),
		interval: camSecondsToMilliseconds(30)
	});
}

// Activate the SW factory and one of the NW cyborg factories
function activateFirstFactories()
{
	camEnableFactory("bbFactory1");
	camEnableFactory("bbCybFactory2");
}

// Activate the two remaining NW factories
function activateSecondFactories()
{
	camEnableFactory("bbFactory2");
	camEnableFactory("bbCybFactory3");
}

function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "GET_READY_TO_RUMBLE", {
		area: "compromiseZone",
		message: "C22_LZ",
		reinforcements: camMinutesToSeconds(2),
		eliminateBases: true
	});

	const startpos = camMakePos(getObject("landingZone"));
	const lz = getObject("landingZone"); //player lz
	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(81, 81, CAM_HUMAN_PLAYER);
	setTransporterExit(81, 81, CAM_HUMAN_PLAYER);

	const enemyLz = getObject("bbLandingZone");
	setNoGoArea(enemyLz.x, enemyLz.y, enemyLz.x2, enemyLz.y2, CAM_BONZI_BUDDY);

	camSetArtifacts({
		"bbResearch": { tech: "R-Wpn-MG-ROF01" }, // MG go brrr (yes i know very funny)
		"bbFactory1": { tech: "R-Vehicle-Prop-Tracks" }, // Thick Wheels
		"chest": { tech: "R-Wpn-Mortar02Hvy" }, // TNT Cannon
		"bbRocketEmp": { tech: "R-Wpn-Rocket06-IDF" }, // Rain Rockets
	});

	camCompleteRequiredResearch(mis_bonziRes, CAM_BONZI_BUDDY);

	camSetEnemyBases({
		"bbSEBase": {
			cleanup: "bbBase1",
			detectMsg: "C22_BASE1",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"bbSWBase": {
			cleanup: "bbBase2",
			detectMsg: "C22_BASE2",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"bbCenterBase": {
			cleanup: "bbBase3",
			detectMsg: "C22_BASE3",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"bbNWBase": {
			cleanup: "bbBase4",
			detectMsg: "C22_BASE4",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
	});

	camSetFactories({
		"bbFactory1": {
			assembly: "bbAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			data: {
				regroup: false,
				repair: 20,
				count: -1,
			},
			templates: [ cTempl.crmmcant, cTempl.crmhmgt, cTempl.crmbb2t, cTempl.crmmcant ] // Thick-wheeled units
		},
		"bbFactory2": {
			assembly: "bbAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			data: {
				regroup: false,
				repair: 60,
				count: -1,
			},
			templates: [ cTempl.crlsensdw, cTempl.crmslancedw, cTempl.crmhmgdw, cTempl.crmslancedw, cTempl.crmbb2dw ] // Drift Wheel harassers
		},
		"bbCybFactory1": {
			assembly: "bbCybAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			data: {
				regroup: true,
				repair: 40,
				count: -1,
			},
			templates: [ cTempl.crcybcool, cTempl.crcybbb, cTempl.crcybcan ]
		},
		"bbCybFactory2": {
			assembly: "bbCybAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 9,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(35)),
			data: {
				regroup: false,
				repair: 40,
				count: -1,
			},
			templates: [ cTempl.crcybsword, cTempl.crcybsword, cTempl.crcybbow ] // Builds up large groups
		},
		"bbCybFactory3": {
			assembly: "bbCybAssembly3",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			data: {
				regroup: true,
				repair: 40,
				count: -1,
			},
			templates: [ cTempl.crcybcool, cTempl.crcybpod, cTempl.crcybcool ]
		},
	});

	camEnableFactory("bbCybFactory1");

	// Replace all snowy trees with funny explosive barrels
	camUpgradeOnMapFeatures("TreeSnow3", "ExplosiveDrum");

	// Add a funny sign
	camUpgradeOnMapFeatures("Pylon", "Sign4");

	// Make units funny
	camUpgradeOnMapTemplates(cTempl.crlslancew, cTempl.crlslanceht, CAM_BONZI_BUDDY);
	camUpgradeOnMapTemplates(cTempl.crlpodw, cTempl.crlpodht, CAM_BONZI_BUDDY);
	camUpgradeOnMapTemplates(cTempl.npcybr, cTempl.crcybpod, CAM_BONZI_BUDDY);
	camUpgradeOnMapTemplates(cTempl.crlmgw, cTempl.enderman, CAM_MOBS);

	// Make structures funny
	camUpgradeOnMapStructures("Sys-SensoTower01", "Spawner-Zombie", CAM_MOBS);
	camUpgradeOnMapStructures("Sys-SensoTower02", "Spawner-Skeleton", CAM_MOBS);
	camUpgradeOnMapStructures("Sys-NX-SensorTower", "Spawner-Creeper", CAM_MOBS);
	camUpgradeOnMapStructures("A0HardcreteMk1CWall", "A0Chest", CAM_MOBS);
	camUpgradeOnMapStructures("PillBox5", "PillBox-BB", CAM_BONZI_BUDDY);
	camUpgradeOnMapStructures("A0RepairCentre3", "A0RepairCentre1", CAM_BONZI_BUDDY);

	queue("startPatrols", camSecondsToMilliseconds(3));
	queue("sensorAmbush", camSecondsToMilliseconds(30));
	queue("activateFirstFactories", camChangeOnDiff(camMinutesToMilliseconds(2)));
}
