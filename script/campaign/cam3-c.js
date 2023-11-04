include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/transitionTech.js");

const SPAMTON_RES = [
	"R-Wpn-MG-Damage02", "R-Vehicle-Metals02", "R-Cyborg-Metals02",
	"R-Defense-WallUpgrade02", "R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage02",
	"R-Wpn-Cannon-Damage01", "R-Wpn-MG-ROF01", "R-Struc-RprFac-Upgrade01",
	"R-Wpn-RocketSlow-Damage01", "R-Wpn-Flamer-ROF01", "R-Wpn-Rocket-ROF01"
];
var enabledFactoryGroups; // Increases as groups of factories are activated
// Default throttles for Spamton's factories
const fact1throttle = camChangeOnDiff(camSecondsToMilliseconds(90)); // Scary factory
const fact2throttle = camChangeOnDiff(camSecondsToMilliseconds(45)); // Drift factory
const fact3throttle = camChangeOnDiff(camSecondsToMilliseconds(6)); // Mini swarm factory
const fact4throttle = camChangeOnDiff(camSecondsToMilliseconds(30)); // Bison factory
const fact5throttle = camChangeOnDiff(camSecondsToMilliseconds(35)); // Bison drift factory
const fact6throttle = camChangeOnDiff(camSecondsToMilliseconds(45)); // Misc. factory
const cyb1throttle = camChangeOnDiff(camSecondsToMilliseconds(90)); // Super flamers
const cyb2throttle = camChangeOnDiff(camSecondsToMilliseconds(50)); // Cannons and needlers
const cyb3throttle = camChangeOnDiff(camSecondsToMilliseconds(40)); // Spies
const cyb4throttle = camChangeOnDiff(camSecondsToMilliseconds(35)); // Bisons
const cyb5throttle = camChangeOnDiff(camSecondsToMilliseconds(35)); // Many rockets
const norm1throttle = camChangeOnDiff(camSecondsToMilliseconds(8)); // Minis
const norm2throttle = camChangeOnDiff(camSecondsToMilliseconds(50)); // Anvils
const norm3throttle = camChangeOnDiff(camSecondsToMilliseconds(60)); // Misc.
const defaultThrottles = [
	fact1throttle, fact2throttle, fact3throttle, fact4throttle, fact5throttle, fact6throttle,
	cyb1throttle, cyb2throttle, cyb3throttle, cyb4throttle, cyb5throttle,
	norm1throttle, norm2throttle, norm3throttle,
];;

// If a Spamton factory is destroyed, make the remaining ones run faster
function eventDestroyed(obj)
{
	if (obj.player === SPAMTON && obj.type === STRUCTURE 
		&& (obj.stattype === FACTORY || obj.stattype === CYBORG_FACTORY || obj.stattype === VTOL_FACTORY))
	{
		// Count how many factories are left
		// TODO: If we eventually give Spamton unique factories, then these names will need to be changed
		const factoryCount = countStruct("A0LightFactory", SPAMTON) + countStruct("A0CyborgFactory", SPAMTON) + countStruct("A0VTolFactory1", SPAMTON);

		// Calculate new factory throttles
		let newThrottles = []
		for (let i = 0; i < defaultThrottles.length; i++)
		{
			// At the start of the mission, there are 14 factories
			// On Normal difficulty, factories will have a x1.2 throttle multiplier at the start, decreasing with each factory destroyed.
			// Increasing or decreasing the difficulty is equivalent to decreasing or increasing the amount of factories respectively.
			newThrottles[i] = defaultThrottles[i] * (0.5 + (0.05 * (factoryCount - difficulty + 2)));
		}

		// Update factory throttles
		setSpamtonFactoryData(newThrottles);

		// Re-enable factories (since updating factory data disables them automatically)
		if (enabledFactoryGroups < 1) return; // No factories active
		camEnableFactory("spamFactory4"); // NE Factory 1
		camEnableFactory("spamCybFactory5"); // NW Cyborg Factory
		camEnableFactory("spamNormFactory1"); // SE Normal Factory
		if (enabledFactoryGroups < 2) return;
		camEnableFactory("spamFactory3"); // SE Factory
		camEnableFactory("spamFactory6"); // N Factory
		camEnableFactory("spamCybFactory3"); // SE Cyborg Factory 2
		camEnableFactory("spamCybFactory4"); // NE Cyborg Factory
		camEnableFactory("spamNormFactory3"); // NW Normal Factory 2
		if (enabledFactoryGroups < 3) return;
		camEnableFactory("spamFactory2"); // S Factory
		camEnableFactory("spamFactory5"); // NE Factory 2
		camEnableFactory("spamCybFactory1"); // SW Cyborg Factory
		if (enabledFactoryGroups < 4) return;
		camEnableFactory("spamFactory1"); // SW Factory
		camEnableFactory("spamCybFactory2"); // SE Cyborg Factory 1
		camEnableFactory("spamNormFactory2"); // NW Normal Factory 1
	}
}

// Calls camSetFactories(), wrapped here so we can update factory throttles as the player progresses
function setSpamtonFactoryData(throttles)
{
	camSetFactories({
		"spamFactory1": {
			assembly: "spamAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: throttles[0],
			data: {
				regroup: true,
				repair: 25,
				count: -1,
			},
			templates: [ cTempl.sphhcant, cTempl.sptriplemono2needle, cTempl.sphhflamt, cTempl.sphhcant, cTempl.sptriplelcan2bb3t ] // Scary stuff
		},
		"spamFactory2": {
			assembly: "spamAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: throttles[1],
			data: {
				regroup: false,
				repair: 60,
				count: -1,
			},
			templates: [ cTempl.sptwin2eflamdw, cTempl.spmhmgdw, cTempl.splcandw, cTempl.sptriplcan2hmgdw, cTempl.spleflamdw, cTempl.sphbb3dw ] // Drift wheels
		},
		"spamFactory3": {
			assembly: "spamAssembly3",
			order: CAM_ORDER_ATTACK,
			groupSize: 18,
			throttle: throttles[2],
			data: {
				regroup: false,
				count: -1,
			},
			templates: [ 
				cTempl.spminimg, cTempl.spminimg, cTempl.spminimg, cTempl.spminimg, cTempl.spminimg, cTempl.spminimg,
				cTempl.spminimg, cTempl.spminimg, cTempl.spminimg, cTempl.spminimg, cTempl.spminimg, cTempl.spminimg,
				cTempl.spminimg, cTempl.spminimg, cTempl.spminimg, cTempl.spminimg, cTempl.spminimg, cTempl.spbigmg 
			] // Big groups of Mini MGs with a Big MG
		},
		"spamFactory4": {
			assembly: "spamAssembly4",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: throttles[3],
			data: {
				regroup: false,
				repair: 40,
				count: -1,
			},
			templates: [ cTempl.sphbisonht, cTempl.spmbisonht, cTempl.sptwin2bisonht, cTempl.splbisont, cTempl.splbisonht ] // Bisons only
		},
		"spamFactory5": {
			assembly: "spamAssembly5",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: throttles[4],
			data: {
				regroup: false,
				repair: 60,
				count: -1,
			},
			templates: [ cTempl.spmbisondw, cTempl.sptrip3bisondw, cTempl.sptwin2bisondw, cTempl.splbisondw, cTempl.splbisondw ] // Bisons Drift Wheels only
		},
		"spamFactory6": {
			assembly: "spamAssembly6",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: throttles[5],
			data: {
				regroup: false,
				repair: 40,
				count: -1,
			},
			templates: [ cTempl.sphlinkht, cTempl.spmlcanht, cTempl.spmpodht, cTempl.sptwinlcanhmght, cTempl.ssplneedleht, ] // Misc. tanks
		},
		"spamCybFactory1": {
			assembly: "spamCybAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: throttles[6],
			data: {
				regroup: false,
				repair: 40,
				count: -1,
			},
			templates: [ cTempl.spscybflame, cTempl.spscybflame, cTempl.spcybneedle ] // Super Flamer Cyborgs and Needlers
		},
		"spamCybFactory2": {
			assembly: "spamCybAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 6,
			throttle: throttles[7],
			data: {
				regroup: false,
				repair: 75,
				count: -1,
			},
			templates: [ cTempl.spcybcan, cTempl.spcybneedle ] // "Light" Gunners and Needlers
		},
		"spamCybFactory3": {
			assembly: "spamCybAssembly3",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: throttles[8],
			data: {
				regroup: false,
				repair: 40,
				count: -1,
			},
			templates: [ cTempl.spcybspy ] // Spies only
		},
		"spamCybFactory4": {
			assembly: "spamCybAssembly4",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: throttles[9],
			data: {
				regroup: false,
				repair: 40,
				count: -1,
			},
			templates: [ cTempl.spcybbison ] // Bison Cyborgs only
		},
		"spamCybFactory5": {
			assembly: "spamCybAssembly5",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: throttles[10],
			data: {
				regroup: false,
				repair: 40,
				count: -1,
			},
			templates: [ cTempl.spcybpod ] // Many-Rocket Cyborgs only
		},
		"spamNormFactory1": {
			assembly: "spamNormAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 6,
			throttle: throttles[11],
			data: {
				regroup: false,
				count: -1,
			},
			templates: [ cTempl.spminimgnw ] // Mini MGs only
		},
		"spamNormFactory2": {
			assembly: "spamNormAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: throttles[12],
			data: {
				regroup: false,
				repair: 20,
				count: -1,
			},
			templates: [ cTempl.sptwin2lcannw, cTempl.spmhmgnw, cTempl.splbisonnw, cTempl.sptwin2podnw, cTempl.sptriplelcan2podnw ] // Various stuff
		},
		"spamNormFactory3": {
			assembly: "spamNormAssembly3",
			order: CAM_ORDER_ATTACK,
			groupSize: 2,
			throttle: throttles[13],
			data: {
				regroup: false,
				repair: 20,
				count: -1,
			},
			templates: [ cTempl.spmanvilnw ] // Anvils
		},
	});
}

// Set up defensive patrols
function setupPatrolGroups()
{
	camManageGroup(camMakeGroup("spamPatrolGroup1"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("spamPatrolPos1"),
			camMakePos("spamPatrolPos2"),
			camMakePos("spamPatrolPos3"),
			camMakePos("spamPatrolPos4"),
		],
		interval: camSecondsToMilliseconds(35),
		repair: 60,
		regroup: false
	});

	camManageGroup(camMakeGroup("spamPatrolGroup2"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("spamPatrolPos5"),
			camMakePos("spamPatrolPos6"),
			camMakePos("spamPatrolPos7"),
			camMakePos("spamPatrolPos8"),
		],
		interval: camSecondsToMilliseconds(35),
		repair: 60,
		regroup: false
	});

	camManageGroup(camMakeGroup("spamPatrolGroup3"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("spamPatrolPos9"),
			camMakePos("spamPatrolPos10"),
			camMakePos("spamPatrolPos11"),
			camMakePos("spamPatrolPos12"),
			camMakePos("spamPatrolPos13"),
		],
		interval: camSecondsToMilliseconds(35),
		repair: 60,
		regroup: false
	});

	camManageGroup(camMakeGroup("spamMiniPatrolGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("spamMiniPatrolPos1"),
			camMakePos("spamMiniPatrolPos2"),
			camMakePos("spamMiniPatrolPos3"),
		],
		interval: camSecondsToMilliseconds(25),
		regroup: false
	});
}

// Spawn a bajillion Defective Lancer VTOLs
function vtolSwarm()
{
	camSetVtolData(SPAMTON, undefined, camMakePos("spamNormAssembly1"), [cTempl.colatv],
		camSecondsToMilliseconds(0.5), undefined, {minVTOLs: 50, maxRandomVTOLs: 0}
	);
	queue("stopVtolSwarm", camSecondsToMilliseconds(12.1));
	queue("destroyVtolSwarm", camSecondsToMilliseconds(35));
}

// Disable VTOL spawning
function stopVtolSwarm()
{
	camSetVtolSpawnStateAll(false);
}

// Blow up all the funny VTOLs
function destroyVtolSwarm()
{
	let vtolList = enumDroid(SPAMTON).filter((droid) => {
		return droid.isVTOL;
	});

	for (let i = 0; i < vtolList.length; i++)
	{
		camSafeRemoveObject(vtolList[i], true);
	}
}

// Activate a few factories
function activateFirstFactories()
{
	enabledFactoryGroups = 1;
	camEnableFactory("spamFactory4"); // NE Factory 1
	camEnableFactory("spamCybFactory5"); // NW Cyborg Factory
	camEnableFactory("spamNormFactory1"); // SE Normal Factory
}

// Activate a few more factories
function activateSecondFactories()
{
	enabledFactoryGroups = 2;
	camEnableFactory("spamFactory3"); // SE Factory
	camEnableFactory("spamFactory6"); // N Factory
	camEnableFactory("spamCybFactory3"); // SE Cyborg Factory 2
	camEnableFactory("spamCybFactory4"); // NE Cyborg Factory
	camEnableFactory("spamNormFactory3"); // NW Normal Factory 2
}

// Activate even more factories
function activateThirdFactories()
{
	enabledFactoryGroups = 3;
	camEnableFactory("spamFactory2"); // S Factory
	camEnableFactory("spamFactory5"); // NE Factory 2
	camEnableFactory("spamCybFactory1"); // SW Cyborg Factory
}

// Activate all the factories
function activateFinalFactories()
{
	enabledFactoryGroups = 4;
	camEnableFactory("spamFactory1"); // SW Factory
	camEnableFactory("spamCybFactory2"); // SE Cyborg Factory 1
	camEnableFactory("spamNormFactory2"); // NW Normal Factory 1
}

// Get the Pipis Trucks moving around
function activatePipisTrucks()
{
	setTimer("placePipis", camSecondsToMilliseconds(3));
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
			// First, see if we're close enough to the player (12 tiles)
			if (enumRange(truck.x, truck.y, 12, CAM_HUMAN_PLAYER, false).filter((obj) => (obj.type === DROID && !isVTOL(obj))).length > 0) // Ignore flyers
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

function checkHqs()
{
	if (enumStruct(SPAMTON, HQ).length === 0)
	{
		return true; // All HQs are destroyed
	}
}

function eventStartLevel()
{
	camSetExtraObjectiveMessage([_("Find Spamton"), _("Defeat Spamton")]);

	var startpos = camMakePos(getObject("landingZone"));
	var lz = getObject("landingZone");

	camSetStandardWinLossConditions(CAM_VICTORY_SCRIPTED, "GAMMA_OUT", {
		callback: "checkHqs" // Player wins if all 4 HQs are destroyed
	});

	centreView(startpos.x, startpos.y);
	// setMissionTime(camChangeOnDiff(camMinutesToSeconds(10)));

	camCompleteRequiredResearch(SPAMTON_RES, SPAMTON);

	camSetEnemyBases({
		"spamSWBase": {
			cleanup: "spamBase1",
			detectMsg: "CM3C_BASE1",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"spamSBase": {
			cleanup: "spamBase2",
			detectMsg: "CM3C_BASE2",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"spamSEBase": {
			cleanup: "spamBase3",
			detectMsg: "CM3C_BASE3",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"spamWBase": {
			cleanup: "spamBase4",
			detectMsg: "CM3C_BASE4",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"spamNEBase": {
			cleanup: "spamBase5",
			detectMsg: "CM3C_BASE5",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"spamNBase": {
			cleanup: "spamBase6",
			detectMsg: "CM3C_BASE6",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"spamNWBase": {
			cleanup: "spamBase7",
			detectMsg: "CM3C_BASE7",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
	});

	enabledFactoryGroups = 0;
	setSpamtonFactoryData(defaultThrottles);

	let body = "Body1RECSpam"; // Spamaconda
	if (difficulty >= HARD) body = "Body5RECSpam"; // Upgrade to Spamaconda II
	addDroid(SPAMTON, 160, 15, "Pipis Truck", body, "HalfTrack", "", "", "Spade1Mk1Spam"); // Place in the North base
	addDroid(SPAMTON, 232, 80, "Pipis Truck", body, "wheeledskiddy", "", "", "Spade1Mk1Spam"); // Place in the East base
	addDroid(SPAMTON, 150, 125, "Pipis Truck", body, "HalfTrack", "", "", "Spade1Mk1Spam"); // Place in the South base
	camManageTrucks(SPAMTON);

	// camPlayVideos([{video: "MB3_C_MSG", type: CAMP_MSG}, {video: "MB3_C_MSG2", type: MISS_MSG}]);

	queue("setupPatrolGroups", camSecondsToMilliseconds(5));
	queue("vtolSwarm", camSecondsToMilliseconds(8));
	queue("activateFirstFactories", camChangeOnDiff(camMinutesToMilliseconds(2)));
	queue("activatePipisTrucks", camChangeOnDiff(camMinutesToMilliseconds(6)));
	queue("activateSecondFactories", camChangeOnDiff(camMinutesToMilliseconds(10)));
	queue("activateThirdFactories", camChangeOnDiff(camMinutesToMilliseconds(18)));
	queue("activateFinalFactories", camChangeOnDiff(camMinutesToMilliseconds(26)));

	// Replace all boulders with explosives
	camUpgradeOnMapFeatures("Boulder1", "ExplosiveDrum");
	camUpgradeOnMapFeatures("Boulder2", "Pipis");

	// Make units funny
	camUpgradeOnMapTemplates(cTempl.crlmgw, cTempl.sphlinkht, SPAMTON);
	camUpgradeOnMapTemplates(cTempl.crcybmg, cTempl.spcybspy, SPAMTON);
	camUpgradeOnMapTemplates(cTempl.crcybpyro, cTempl.spscybflame, SPAMTON);
	camUpgradeOnMapTemplates(cTempl.crcybcan, cTempl.spcybbison, SPAMTON);
	camUpgradeOnMapTemplates(cTempl.crtmgw, cTempl.spminimg, SPAMTON);
	camUpgradeOnMapTemplates(cTempl.crlhmght, cTempl.spbigmg, SPAMTON);

	// Make structures funny
	camUpgradeOnMapStructures("GuardTower4", "GuardTowerEH", SPAMTON);
	camUpgradeOnMapStructures("A0RepairCentre3", "A0RepairCentre2", SPAMTON);
	camUpgradeOnMapStructures("X-Super-Cannon", "Pillbox-Big", SPAMTON);
	camUpgradeOnMapStructures("PillBox4", "PillBoxBison", SPAMTON);
	camUpgradeOnMapStructures("WallTower05", "Sys-SensoTower03", SPAMTON);
	camUpgradeOnMapStructures("Sys-NX-SensorTower", "Spawner-ZombieSpamton", SPAMTON);
	camUpgradeOnMapStructures("Sys-NX-CBTower", "Spawner-SkeletonSpamton", SPAMTON);
	camUpgradeOnMapStructures("Sys-NX-VTOL-RadTow", "Spawner-CreeperSpamton", SPAMTON);
}
