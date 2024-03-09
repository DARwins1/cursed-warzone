include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/transitionTech.js");

const mis_spamtonRes = [
	"R-Wpn-MG-Damage02", "R-Vehicle-Metals02", "R-Cyborg-Metals02",
	"R-Defense-WallUpgrade02", "R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage02",
	"R-Wpn-Cannon-Damage01", "R-Wpn-MG-ROF01", "R-Struc-RprFac-Upgrade01",
	"R-Wpn-RocketSlow-Damage01", "R-Wpn-Flamer-ROF01", "R-Wpn-Rocket-ROF01",
	"R-Struc-VTOLPad-Upgrade01",
];
var enabledFactoryGroups; // Increases as groups of factories are activated
// Default throttles for Spamton's factories
const mis_fact1throttle = camChangeOnDiff(camSecondsToMilliseconds(90)); // Scary factory
const mis_fact2throttle = camChangeOnDiff(camSecondsToMilliseconds(45)); // Drift factory
const mis_fact3throttle = camChangeOnDiff(camSecondsToMilliseconds(6)); // Mini swarm factory
const mis_fact4throttle = camChangeOnDiff(camSecondsToMilliseconds(30)); // Bison factory
const mis_fact5throttle = camChangeOnDiff(camSecondsToMilliseconds(35)); // Bison drift factory
const mis_fact6throttle = camChangeOnDiff(camSecondsToMilliseconds(45)); // Misc. factory
const mis_cyb1throttle = camChangeOnDiff(camSecondsToMilliseconds(90)); // Super Excessive Flamers
const mis_cyb2throttle = camChangeOnDiff(camSecondsToMilliseconds(50)); // Cannons and needlers
const mis_cyb3throttle = camChangeOnDiff(camSecondsToMilliseconds(40)); // Spies
const mis_cyb4throttle = camChangeOnDiff(camSecondsToMilliseconds(35)); // Bisons
const mis_cyb5throttle = camChangeOnDiff(camSecondsToMilliseconds(35)); // Many rockets
const mis_norm1throttle = camChangeOnDiff(camSecondsToMilliseconds(8)); // Minis
const mis_norm2throttle = camChangeOnDiff(camSecondsToMilliseconds(50)); // Anvils
const mis_norm3throttle = camChangeOnDiff(camSecondsToMilliseconds(60)); // Misc.
const mis_defaultThrottles = [
	mis_fact1throttle, mis_fact2throttle, mis_fact3throttle, mis_fact4throttle, mis_fact5throttle, mis_fact6throttle,
	mis_cyb1throttle, mis_cyb2throttle, mis_cyb3throttle, mis_cyb4throttle, mis_cyb5throttle,
	mis_norm1throttle, mis_norm2throttle, mis_norm3throttle,
];;

// If a Spamton factory is destroyed, make the remaining ones run faster
function eventDestroyed(obj)
{
	if (obj.player === CAM_SPAMTON && obj.type === STRUCTURE 
		&& (obj.stattype === FACTORY || obj.stattype === CYBORG_FACTORY || obj.stattype === VTOL_FACTORY))
	{
		// Count how many factories are left
		// TODO: If we eventually give Spamton unique factories, then these names will need to be changed
		const factoryCount = countStruct("A0LightFactory", CAM_SPAMTON) + countStruct("A0CyborgFactory", CAM_SPAMTON) + countStruct("A0VTolFactory1", CAM_SPAMTON);

		// Calculate new factory throttles
		const newThrottles = [];
		for (let i = 0; i < mis_defaultThrottles.length; i++)
		{
			// At the start of the mission, there are 14 factories
			// On Normal difficulty, factories will have a x1.2 throttle multiplier at the start, decreasing with each factory destroyed.
			// Increasing or decreasing the difficulty is equivalent to decreasing or increasing the amount of factories respectively.
			newThrottles[i] = mis_defaultThrottles[i] * (0.5 + (0.05 * (factoryCount - difficulty + 2)));
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
			templates: [ cTempl.sphlinkht, cTempl.spmlcanht, cTempl.spmpodht, cTempl.sptwinlcanhmght, cTempl.splneedleht, ] // Misc. tanks
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
			templates: [ cTempl.spscybflame, cTempl.spscybflame, cTempl.spcybneedle ] // Super Excessive Flamer Cyborgs and Needlers
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
	camSetVtolData(CAM_SPAMTON, undefined, camMakePos("spamNormAssembly1"), [cTempl.colatv],
		camSecondsToMilliseconds(0.5), undefined, {minVTOLs: 50, maxRandomVTOLs: 0}
	);
	queue("stopVtolSwarm", camSecondsToMilliseconds(12.1));
	queue("destroyVtolSwarm", camSecondsToMilliseconds(35));

	camQueueDialogues([
		{text: "SPAMTON: GO!!!", delay: 0, sound: camSounds.spamton.talk1},
		{text: "SPAMTON: FETCH ME THEIR [Money]!!!", delay: camSecondsToMilliseconds(3), sound: camSounds.spamton.talk2},
	]);
}

// Disable VTOL spawning
function stopVtolSwarm()
{
	camSetVtolSpawnStateAll(false);
}

// Blow up all the funny VTOLs
function destroyVtolSwarm()
{
	const vtolList = enumDroid(CAM_SPAMTON).filter((droid) => {
		return droid.isVTOL;
	});

	for (let i = 0; i < vtolList.length; i++)
	{
		camSafeRemoveObject(vtolList[i], true);
	}

	camQueueDialogues([
		{text: "SPAMTON: GODD4MMIT", delay: camSecondsToMilliseconds(3), sound: camSounds.spamton.talk1},
		{text: "SPAMTON: LOOKS L1KE WE'R3 DOING THIS THE[[Old Fashion Cowboy]] WAY...", delay: camSecondsToMilliseconds(6), sound: camSounds.spamton.talk2},
	]);
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
	const truckList = enumDroid(CAM_SPAMTON, DROID_CONSTRUCT);
	for (let i = 0, l = truckList.length; i < l; ++i)
	{
		const truck = truckList[i];
		if (truck.order !== DORDER_BUILD && truck.order !== DORDER_HELPBUILD && truck.order !== DORDER_LINEBUILD)
		{
			// First, see if we're close enough to the player (12 tiles)
			if (enumRange(truck.x, truck.y, 12, CAM_HUMAN_PLAYER, false).filter((obj) => (obj.type === DROID && !isVTOL(obj))).length > 0) // Ignore flyers
			{
				// If so, place Pipis at this location
				camQueueBuilding(CAM_SPAMTON, "A0Pipis", camMakePos(truck));
			}
			else
			{
				// If not, then move towards the player
				const targets = enumDroid(CAM_HUMAN_PLAYER).filter((obj) => (
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
	const hqs = enumStruct(CAM_SPAMTON, HQ).length;
	if (hqs === 3)
	{
		camCallOnce("spamton3HQDialogue");
	}
	else if (hqs === 2)
	{
		camCallOnce("spamton2HQDialogue");
	}
	else if (hqs === 1)
	{
		camCallOnce("spamton1HQDialogue");
	}

	if (hqs === 0)
	{
		return true; // All HQs are destroyed
	}
}

function spamton3HQDialogue()
{
	camQueueDialogues([
		{text: "SPAMTON: HAEAHAEAHAEAHAEAH!!", delay: camSecondsToMilliseconds(3), sound: camSounds.spamton.laugh},
		{text: "SPAMTON: DON\"TYA KNOW I NEVER PUT ALL MY", delay: camSecondsToMilliseconds(6), sound: camSounds.spamton.talk2},
		{text: "SPAMTON: IN ONE [[BeutiFAl HAndmaDe bASKet]]???", delay: camSecondsToMilliseconds(9), sound: camSounds.spamton.talk2},
		{text: "SPAMTON: NOW HOLD STILL WHILE I [Demolish] YOU", delay: camSecondsToMilliseconds(12), sound: camSounds.spamton.talk2},
	]);
}

function spamton2HQDialogue()
{
	camQueueDialogues([
		{text: "SPAMTON: DID YOUREALLY TH1NK I WOULD [[stand there and take it?]]", delay: camSecondsToMilliseconds(3), sound: camSounds.spamton.talk2},
		{text: "SPAMTON: WRONG!!!", delay: camSecondsToMilliseconds(6), sound: camSounds.spamton.talk1},
		{text: "SPAMTON: I B3T YOU'RE [Hunched Over] YOUR [Furniture]", delay: camSecondsToMilliseconds(9), sound: camSounds.spamton.talk2},
		{text: "SPAMTON: [Begging] AND [Praying] FOR [Good 'Ol] SPAMTON TO", delay: camSecondsToMilliseconds(12), sound: camSounds.spamton.talk2},
		{text: "SPAMTON: [Kill] YOU", delay: camSecondsToMilliseconds(15), sound: camSounds.spamton.talk1},
	]);
}

function spamton1HQDialogue()
{
	camQueueDialogues([
		{text: "SPAMTON: DON'T YOU HAVE ANYTHING [[Better for your SOUL]] TO DO???", delay: camSecondsToMilliseconds(3), sound: camSounds.spamton.talk2},
		{text: "SPAMTON: GO SPEND YOUR [[Ant-sized]] LIFE [Frolicking] IN THE FIELDS OF [Burning acid]", delay: camSecondsToMilliseconds(6), sound: camSounds.spamton.talk2},
		{text: "SPAMTON: AND LEAVE MY [[Rapidly-shrinking]] BASE ALONE!!!", delay: camSecondsToMilliseconds(9), sound: camSounds.spamton.talk2},
	]);
}

function eventStartLevel()
{
	hackMarkTiles(); // Clear any marked tiles from Gamma 4
	camSetExtraObjectiveMessage([_("Find Spamton"), _("Defeat Spamton")]);

	const startpos = camMakePos(getObject("landingZone"));
	const lz = getObject("landingZone");
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);

	camSetStandardWinLossConditions(CAM_VICTORY_SCRIPTED, "GAMMA_OUT", {
		callback: "checkHqs" // Player wins if all 4 HQs are destroyed
	});

	centreView(startpos.x, startpos.y);

	camCompleteRequiredResearch(mis_spamtonRes, CAM_SPAMTON);

	camSetEnemyBases({
		"spamSWBase": {
			cleanup: "spamBase1",
			detectMsg: "CM3C_BASE1",
			detectSnd: camSounds.project.enemyBase,
			eliminateSnd: camSounds.project.enemyBaseErad,
		},
		"spamSBase": {
			cleanup: "spamBase2",
			detectMsg: "CM3C_BASE2",
			detectSnd: camSounds.project.enemyBase,
			eliminateSnd: camSounds.project.enemyBaseErad,
		},
		"spamSEBase": {
			cleanup: "spamBase3",
			detectMsg: "CM3C_BASE3",
			detectSnd: camSounds.project.enemyBase,
			eliminateSnd: camSounds.project.enemyBaseErad,
		},
		"spamWBase": {
			cleanup: "spamBase4",
			detectMsg: "CM3C_BASE4",
			detectSnd: camSounds.project.enemyBase,
			eliminateSnd: camSounds.project.enemyBaseErad,
		},
		"spamNEBase": {
			cleanup: "spamBase5",
			detectMsg: "CM3C_BASE5",
			detectSnd: camSounds.project.enemyBase,
			eliminateSnd: camSounds.project.enemyBaseErad,
		},
		"spamNBase": {
			cleanup: "spamBase6",
			detectMsg: "CM3C_BASE6",
			detectSnd: camSounds.project.enemyBase,
			eliminateSnd: camSounds.project.enemyBaseErad,
		},
		"spamNWBase": {
			cleanup: "spamBase7",
			detectMsg: "CM3C_BASE7",
			detectSnd: camSounds.project.enemyBase,
			eliminateSnd: camSounds.project.enemyBaseErad,
		},
	});

	// Remove a bunch of the last level's research items from the menu
	const removableResearch = [
		"R-Comp-MissileCodes04", // Only need the final missile code here
		"R-Comp-Death01", "R-Comp-Death02", "R-Comp-Death03", "R-Comp-Death04",
		"R-Comp-Death05", "R-Comp-Death06", "R-Comp-Death07", "R-Comp-Death08",
		"R-Comp-Death09", "R-Comp-Death10", "R-Comp-Death11", "R-Comp-Death12",
	];
	camCompleteRequiredResearch(removableResearch, CAM_HUMAN_PLAYER);

	// Destroy everything outside limits
	const scrollLimits = getScrollLimits();
	// Get everything to the left of the current map limit (0 < x < scrollLimits.x)
	const destroyZone = enumArea(0, scrollLimits.y, scrollLimits.x, scrollLimits.y2, CAM_HUMAN_PLAYER, false);
	for (let i = 0; i < destroyZone.length; i++)
	{
		camSafeRemoveObject(destroyZone[i], false);
	}

	enabledFactoryGroups = 0;
	setSpamtonFactoryData(mis_defaultThrottles);

	let body = "Body1RECSpam"; // Spamaconda
	if (difficulty >= HARD) body = "Body5RECSpam"; // Upgrade to Spamaconda II
	addDroid(CAM_SPAMTON, 160, 15, "Pipis Truck", body, "HalfTrack", "", "", "Spade1Mk1Spam"); // Place in the North base
	addDroid(CAM_SPAMTON, 232, 80, "Pipis Truck", body, "wheeledskiddy", "", "", "Spade1Mk1Spam"); // Place in the East base
	addDroid(CAM_SPAMTON, 150, 125, "Pipis Truck", body, "HalfTrack", "", "", "Spade1Mk1Spam"); // Place in the South base
	camManageTrucks(CAM_SPAMTON);

	camPlayVideos({video: "SPAM_GAMMA5", type: CAMP_MSG});

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
	camUpgradeOnMapTemplates(cTempl.crlmgw, cTempl.sphlinkht, CAM_SPAMTON);
	camUpgradeOnMapTemplates(cTempl.crcybmg, cTempl.spcybspy, CAM_SPAMTON);
	camUpgradeOnMapTemplates(cTempl.crcybpyro, cTempl.spscybflame, CAM_SPAMTON);
	camUpgradeOnMapTemplates(cTempl.crcybcan, cTempl.spcybbison, CAM_SPAMTON);
	camUpgradeOnMapTemplates(cTempl.crtmgw, cTempl.spminimg, CAM_SPAMTON);
	camUpgradeOnMapTemplates(cTempl.crlhmght, cTempl.spbigmg, CAM_SPAMTON);

	// Make structures funny
	camUpgradeOnMapStructures("GuardTower4", "GuardTowerEH", CAM_SPAMTON);
	camUpgradeOnMapStructures("A0RepairCentre3", "A0RepairCentre2", CAM_SPAMTON);
	camUpgradeOnMapStructures("X-Super-Cannon", "Pillbox-Big", CAM_SPAMTON);
	camUpgradeOnMapStructures("PillBox4", "PillBoxBison", CAM_SPAMTON);
	camUpgradeOnMapStructures("WallTower05", "Sys-SensoTower03", CAM_SPAMTON);
	camUpgradeOnMapStructures("Sys-NX-SensorTower", "Spawner-ZombieSpamton", CAM_SPAMTON);
	camUpgradeOnMapStructures("Sys-NX-CBTower", "Spawner-SkeletonSpamton", CAM_SPAMTON);
	camUpgradeOnMapStructures("Sys-NX-VTOL-RadTow", "Spawner-CreeperSpamton", CAM_SPAMTON);
	camUpgradeOnMapStructures("A0CommandCentre", "A0CommandCentreNE", CAM_SPAMTON);
}
