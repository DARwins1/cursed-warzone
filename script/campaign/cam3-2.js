include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/transitionTech.js");

const SPAMTON_RES = [
	"R-Wpn-MG-Damage02", "R-Vehicle-Metals02", "R-Cyborg-Metals02",
	"R-Defense-WallUpgrade02", "R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage02",
	"R-Wpn-Cannon-Damage01", "R-Wpn-MG-ROF01", "R-Struc-RprFac-Upgrade01",
	"R-Wpn-RocketSlow-Damage01", "R-Wpn-Flamer-ROF01",
];
// Keep track of which towers have been destroyed
var centerTowerDestroyed;
var nwTowerDestroyed;
var seTowerDestroyed;
// var northTowerDestroyed;
var neTowerDestroyed;
// var eastTowerDestroyed;

// Set up patrol and ambuhs groups
function setupMapGroups()
{
	camManageGroup(camMakeGroup("bisonAmbushGroup1"), CAM_ORDER_ATTACK, {
		regroup: false,
		count: 6,
		morale: 30,
		fallback: camMakePos("patrolPos1")
	});

	camManageGroup(camMakeGroup("bisonAmbushGroup2"), CAM_ORDER_ATTACK, {
		regroup: false,
		count: 6,
		morale: 30,
		fallback: camMakePos("patrolPos4")
	});

	camManageGroup(camMakeGroup("spamPatrolGroup1"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("patrolPos1"),
			camMakePos("patrolPos2"),
			camMakePos("patrolPos3"),
		],
		interval: camSecondsToMilliseconds(25),
		regroup: true,
		repair: 30,
		count: -1
	});

	camManageGroup(camMakeGroup("spamPatrolGroup2"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("patrolPos4"),
			camMakePos("patrolPos5"),
			camMakePos("patrolPos6"),
		],
		interval: camSecondsToMilliseconds(25),
		regroup: false,
		repair: 50,
		count: -1
	});

	camManageGroup(camMakeGroup("spamPatrolGroup3"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("patrolPos7"),
			camMakePos("patrolPos8"),
			camMakePos("patrolPos9"),
		],
		interval: camSecondsToMilliseconds(25),
		regroup: true,
		repair: 60,
		count: -1
	});
}

// Activate the bison factories and the SE vehicle factory
function activateFirstFactories()
{
	camEnableFactory("spamFactory1");
	camEnableFactory("spamFactory4");
	camEnableFactory("spamCybFactory1");
}

// Activate the drift factory, the 2 east cyborg factories, and the first normal factory
function activateSecondFactories()
{
	camEnableFactory("spamFactory3");
	camEnableFactory("spamCybFactory3");
	camEnableFactory("spamCybFactory4");
	camEnableFactory("spamNormFactory1");
}

// Activate the NE factories and the second normal factory
function activateFinalFactories()
{
	camEnableFactory("spamFactory2");
	camEnableFactory("spamCybFactory2");
	camEnableFactory("spamNormFactory2");
}

// Check if there are any remaining towers
function checkTowers()
{
	// Check the central tower
	if (!centerTowerDestroyed && getObject("centralTower") === null)
	{
		centerTowerDestroyed = true;
		hackRemoveMessage("TOWER_C", PROX_MSG, CAM_HUMAN_PLAYER);
	}

	// Check the NW tower
	if (!nwTowerDestroyed && getObject("nwTower") === null)
	{
		nwTowerDestroyed = true;
		hackRemoveMessage("TOWER_NW", PROX_MSG, CAM_HUMAN_PLAYER);
	}

	// Check the north tower
	// if (!northTowerDestroyed && getObject("northTower") === null)
	// {
	// 	northTowerDestroyed = true;
	// 	hackRemoveMessage("TOWER_N", PROX_MSG, CAM_HUMAN_PLAYER);
	// }

	// Check the NE tower
	if (!neTowerDestroyed && getObject("neTower") === null)
	{
		neTowerDestroyed = true;
		hackRemoveMessage("TOWER_NE", PROX_MSG, CAM_HUMAN_PLAYER);
	}

	// Check the east tower
	// if (!eastTowerDestroyed && getObject("eastTower") === null)
	// {
	// 	eastTowerDestroyed = true;
	// 	hackRemoveMessage("TOWER_E", PROX_MSG, CAM_HUMAN_PLAYER);
	// }

	// Check the SE tower
	if (!seTowerDestroyed && getObject("seTower") === null)
	{
		seTowerDestroyed = true;
		hackRemoveMessage("TOWER_SE", PROX_MSG, CAM_HUMAN_PLAYER);
	}

	if (centerTowerDestroyed && nwTowerDestroyed /*&& northTowerDestroyed*/
		&& neTowerDestroyed /*&& eastTowerDestroyed*/ && seTowerDestroyed)
	{
		camSetExtraObjectiveMessage();
		return true; // None remaining
	}
}

// If any trucks are near the player, place Pipis around themselves
function placePipis()
{
	var truckList = enumDroid(SPAMTON, DROID_CONSTRUCT);
	for (let i = 0, l = truckList.length; i < l; ++i)
	{
		var truck = truckList[i];
		if (truck.order !== DORDER_BUILD && truck.order !== DORDER_HELPBUILD && truck.order !== DORDER_LINEBUILD)
		{
			// First, see if we're close enough to the player (10 tiles)
			if (enumRange(truck.x, truck.y, 10, CAM_HUMAN_PLAYER, false).filter((obj) => (obj.type === DROID && !isVTOL(obj))).length > 0) // Ignore flyers
			{
				// If so, place Pipis at this location
				camQueueBuilding(SPAMTON, "A0Pipis", camMakePos(truck));
			}
			else
			{
				// If not, then move towards the player
				let targets = enumDroid(CAM_HUMAN_PLAYER).filter((obj) => (
					propulsionCanReach("wheeled01", truck.x, truck.y, obj.x, obj.y) &&
						(obj.type === STRUCTURE || (obj.type === DROID && !isVTOL(obj)))
				));
				if (targets.length > 0)
				{
					// Sort by distance
					targets.sort((obj1, obj2) => 
						distBetweenTwoPoints(truck.x, truck.y, obj1.x, obj1.y) - distBetweenTwoPoints(truck.x, truck.y, obj2.x, obj2.y)
					);
					const pos = camMakePos(targets[0]);
					orderDroidLoc(truck, DORDER_MOVE, pos.x, pos.y); // Move the truck towards the closest player object
				}
			}
		}
	}
}

function eventStartLevel()
{
	camSetExtraObjectiveMessage(_("Destroy Spamton's stupid towers"));

	var startpos = camMakePos(getObject("landingZone"));
	var lz = getObject("landingZone");

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "THE_G_STANDS_FOR_", {
		area: "compromiseZone",
		message: "C32_LZ",
		reinforcements: camMinutesToSeconds(1),
		callback: "checkTowers"
	});

	camSetArtifacts({
		"spamCC": { tech: "R-Sys-Engineering03" }, // what nerds call "Advanced Engineering"
		"spamFactory1": { tech: "R-Wpn-CannonBison" }, // Righteous Bison
		"spamFactory2": { tech: "R-Wpn-Flame2" }, // Excessive Flamer
	});

	camSetFactories({
		"spamFactory1": {
			assembly: "spamAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(42)),
			data: {
				regroup: false,
				repair: 30,
				count: -1,
			},
			templates: [ cTempl.splbisonw, cTempl.spmbisonht, cTempl.splbisonht, cTempl.spmbisonht, cTempl.sptwin2bisonht ] // Righteous Bisons only
		},
		"spamFactory2": {
			assembly: "spamAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(90)),
			data: {
				regroup: true,
				repair: 75,
				count: -1,
			},
			templates: [ cTempl.sptwinlcanhmght, cTempl.sphhflamht, cTempl.sphhbb3ht, cTempl.sphmcanht ] // Tough stuff
		},
		"spamFactory3": {
			assembly: "spamAssembly3",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(35)),
			data: {
				regroup: false,
				repair: 60,
				count: -1,
			},
			templates: [ cTempl.spmbisondw, cTempl.sptwinlcanhmgdw, cTempl.splpoddw, cTempl.splmgdw, cTempl.sptwin2eflamdw, cTempl.sptwin2lmgdw ] // Drift wheels
		},
		"spamFactory4": {
			assembly: "spamAssembly4",
			order: CAM_ORDER_ATTACK,
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(15)),
			data: {
				regroup: false,
				count: -1,
			},
			templates: [ 
				cTempl.spminimg, cTempl.spminimg, cTempl.spminimg, cTempl.spminimg, cTempl.spminimg, cTempl.spminimg,
				cTempl.spminimg, cTempl.spminimg, cTempl.spminimg, cTempl.spminimg, cTempl.spminimg, cTempl.spminimg,
				cTempl.spminimg, cTempl.spminimg, cTempl.spminimg, cTempl.spminimg, cTempl.spminimg, cTempl.spbigmg 
			] // Mini MG spam with an occasional Big Machinegun
		},
		"spamCybFactory1": {
			assembly: "spamCybAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(42)),
			data: {
				regroup: false,
				repair: 30,
				count: -1,
			},
			templates: [ cTempl.spcybbison ] // Righteous Bisons only
		},
		"spamCybFactory2": {
			assembly: "spamCybAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(67.5)),
			data: {
				regroup: false,
				repair: 75,
				count: -1,
			},
			templates: [ cTempl.spcybpod, cTempl.spscybflame ] // Many-Rocket Cyborgs and Super Flamer Cyborgs
		},
		"spamCybFactory3": {
			assembly: "spamCybAssembly3",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(60)),
			data: {
				regroup: true,
				repair: 40,
				count: -1,
			},
			templates: [ cTempl.spcybneedle ] // Needlers only
		},
		"spamCybFactory4": {
			assembly: "spamCybAssembly4",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(67.5)),
			data: {
				regroup: true,
				repair: 40,
				count: -1,
			},
			templates: [ cTempl.spcybbison, cTempl.spcybspy, cTempl.spcybbison ] // Spy Cyborgs and Bison Cyborgs
		},
		"spamNormFactory1": {
			assembly: "spamNormAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			data: {
				regroup: false,
				count: -1,
			},
			templates: [ cTempl.spminimgnw, cTempl.spminimgnw, cTempl.spminimgnw, cTempl.spminimgnw, cTempl.spminimgnw, cTempl.spmanvilnw ] // Minis and Anvils
		},
		"spamNormFactory2": {
			assembly: "spamNormAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(60)),
			data: {
				regroup: false,
				count: -1,
			},
			templates: [ cTempl.splhmgnw, cTempl.splbisonnw, cTempl.sptwin2lcannw, cTempl.splcannw ] // Bisons, Cannons, and MGs
		},
	});

	camSetEnemyBases({
		"spamBisonBase": {
			cleanup: "spamBase1",
			detectMsg: "CM32_BASE1",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"spamNormalBase": {
			cleanup: "spamBase2",
			detectMsg: "CM32_BASE2",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"spamNEBase": {
			cleanup: "spamBase3",
			detectMsg: "CM32_BASE3",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"spamCyborgBase": {
			cleanup: "spamBase4",
			detectMsg: "CM32_BASE4",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"spamSEBase": {
			cleanup: "spamBase5",
			detectMsg: "CM32_BASE5",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"spamCentralBase": {
			cleanup: "spamBase6",
			detectMsg: "CM32_BASE6",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
	});

	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(5, 80, CAM_HUMAN_PLAYER);
	setTransporterExit(5, 80, CAM_HUMAN_PLAYER);

	camCompleteRequiredResearch(SPAMTON_RES, SPAMTON);

	if (difficulty >= EASY)
	{
		let body = "Body1RECSpam"; // Spamaconda
		let prop = "wheeled01"; // Wheels
		if (difficulty === INSANE) body = "Body5RECSpam"; // Upgrade to Spamaconda II
		if (difficulty >= HARD) prop = "HalfTrack"; // Upgrade to Half-wheels
		addDroid(SPAMTON, 4, 8, "Pipis Truck", body, prop, "", "", "Spade1Mk1Spam"); // One truck in the Bison base
		addDroid(SPAMTON, 88, 75, "Pipis Truck", body, prop, "", "", "Spade1Mk1Spam"); // Another in the SE base

		camManageTrucks(SPAMTON);

		setTimer("placePipis", camSecondsToMilliseconds(3));
	}

	// Replace all boulders with explosives
	camUpgradeOnMapFeatures("Boulder1", "Pipis");
	camUpgradeOnMapFeatures("Wreck1", "Wreck1"); // I know this looks stupid but it's to align the pile positions better

	// Make units funny
	camUpgradeOnMapTemplates(cTempl.crlcanw, cTempl.splbisonht, SPAMTON);
	camUpgradeOnMapTemplates(cTempl.crlcanht, cTempl.spmbisonht, SPAMTON);
	camUpgradeOnMapTemplates(cTempl.crlscorchw, cTempl.sphhflamht, SPAMTON);
	camUpgradeOnMapTemplates(cTempl.crlbbw, cTempl.sphhbb3ht, SPAMTON);
	camUpgradeOnMapTemplates(cTempl.crcybcan, cTempl.spcybbison, SPAMTON);
	camUpgradeOnMapTemplates(cTempl.crcybmg, cTempl.spcybspy, SPAMTON);
	camUpgradeOnMapTemplates(cTempl.crcybneedle, cTempl.spcybneedle, SPAMTON);

	// Make structures funny
	camUpgradeOnMapStructures("GuardTower4", "GuardTowerEH", SPAMTON);
	camUpgradeOnMapStructures("PillBox4", "PillBoxBison", SPAMTON);
	camUpgradeOnMapStructures("A0RepairCentre3", "A0RepairCentre2", SPAMTON);
	camUpgradeOnMapStructures("X-Super-Cannon", "Pillbox-Big", SPAMTON);
	camUpgradeOnMapStructures("X-Super-Rocket", "GuardTower-MEGA", SPAMTON);
	camUpgradeOnMapStructures("Sys-NX-SensorTower", "Spawner-ZombieSpamton", SPAMTON);
	camUpgradeOnMapStructures("Sys-NX-CBTower", "Spawner-SkeletonSpamton", SPAMTON);
	camUpgradeOnMapStructures("Sys-NX-VTOL-RadTow", "Spawner-CreeperSpamton", SPAMTON);

	// Place beacons on all the towers
	hackAddMessage("TOWER_C", PROX_MSG, CAM_HUMAN_PLAYER);
	hackAddMessage("TOWER_NW", PROX_MSG, CAM_HUMAN_PLAYER);
	// hackAddMessage("TOWER_N", PROX_MSG, CAM_HUMAN_PLAYER);
	hackAddMessage("TOWER_NE", PROX_MSG, CAM_HUMAN_PLAYER);
	// hackAddMessage("TOWER_E", PROX_MSG, CAM_HUMAN_PLAYER);
	hackAddMessage("TOWER_SE", PROX_MSG, CAM_HUMAN_PLAYER);

	queue("setupMapGroups", camChangeOnDiff(camSecondsToMilliseconds(25)));
	queue("activateFirstFactories", camChangeOnDiff(camMinutesToMilliseconds(2.5)));
	queue("activateSecondFactories", camChangeOnDiff(camMinutesToMilliseconds(8)));
	queue("activateFinalFactories", camChangeOnDiff(camMinutesToMilliseconds(16)));
}
