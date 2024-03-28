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
const MIS_SPAMTON_REAL = 5;
// Default throttles for Spamton's factories
const mis_defaultThrottles = [
	camChangeOnDiff(camSecondsToMilliseconds(90)), // Scary factory
	camChangeOnDiff(camSecondsToMilliseconds(45)), // Drift factory
	camChangeOnDiff(camSecondsToMilliseconds(6)), // Mini swarm factory
	camChangeOnDiff(camSecondsToMilliseconds(30)), // Bison factory
	camChangeOnDiff(camSecondsToMilliseconds(35)), // Bison drift factory
	camChangeOnDiff(camSecondsToMilliseconds(45)), // Misc. factory
	camChangeOnDiff(camSecondsToMilliseconds(90)), // Super Excessive Flamers
	camChangeOnDiff(camSecondsToMilliseconds(50)), // Cannons and needlers
	camChangeOnDiff(camSecondsToMilliseconds(40)), // Spies
	camChangeOnDiff(camSecondsToMilliseconds(35)), // Bisons
	camChangeOnDiff(camSecondsToMilliseconds(35)), // Many rockets
	camChangeOnDiff(camSecondsToMilliseconds(8)), // Minis
	camChangeOnDiff(camSecondsToMilliseconds(50)), // Anvils
	camChangeOnDiff(camSecondsToMilliseconds(60)), // Misc.
];

var enabledFactoryGroups; // Increases as groups of factories are activated
var altEndScene; // Whether to use an alternate ending scene
var endSceneComplete; // True when the level can end

// If a Spamton factory is destroyed, make the remaining ones run faster
function eventDestroyed(obj)
{
	const hqs = enumStruct(CAM_SPAMTON, HQ).length;

	if (obj.type === FEATURE && obj.name === _("Nuclear Drum"))
	{
		const NUKE_RADIUS = 40;
		const pos = camMakePos(obj);
		const HQ_IN_RANGE = enumRange(pos.x, pos.y, NUKE_RADIUS, ALL_PLAYERS, false).filter((object) => (
				object.type === STRUCTURE && object.player === CAM_SPAMTON && object.stattype === HQ)).length > 0;

		if (HQ_IN_RANGE && hqs === 1)
		{
			// Spamton's HQ is about to get nuked, play a special cutscene instead.
			altEndScene == true; // Don't try to start the normal end sequence
			camCallOnce("spamtonNukeScene");
		}
	}
	else if (obj.type === STRUCTURE && obj.stattype === HQ)
	{
		switch (hqs)
		{
			case 3:
				camCallOnce("spamton3HQDialogue");
				break;
			case 2:
				camCallOnce("spamton2HQDialogue");
				break;
			case 1:
				camCallOnce("spamton1HQDialogue");
				break;
			case 0:
				if (!altEndScene)
				{
					const pos = camMakePos(obj);

					// Place Spamton at the destroyed HQ
					addLabel(addDroid(MIS_SPAMTON_REAL, pos.x, pos.y, 
						_("Spamton"), "SpamtonBody", "CyborgLegs", "", "", "Cyb-Wpn-CreeperDudSpam"
					), "spamton");

					camCallOnce("spamtonEndSequence");
				}
				break;
		}
	}
	else if (obj.type === DROID && obj.player === MIS_SPAMTON_REAL && obj.body === "SpamtonBody")
	{
		// Spamton is die :(
		camCallOnce("spamtonDeathScene");
	}
	else if (obj.player === CAM_SPAMTON && obj.type === STRUCTURE 
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
		{text: "SPAMTON: LOOKS L1KE WE'R3 DOING THIS [[Classic Style]]...", delay: camSecondsToMilliseconds(6), sound: camSounds.spamton.talk2},
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

function eventAttacked(victim, attacker)
{
	if (camDef(victim) && victim)
	{
		// Check if Spamton was hit by the Remover Tool
		if (attacker.weapons[0].id === "SpyTurret01")
		{
			if (victim.type === DROID && victim.player === MIS_SPAMTON_REAL && victim.body === "SpamtonBody")
			{
				// Skip directly to the credits
				// Don't play any other cutscenes
				camPlayVideos({video: "END_CREDITS", type: MISS_MSG});
				altEndScene = true;
				endSceneComplete = true;
			}
		}
	}
}

function spamton3HQDialogue()
{
	camQueueDialogues([
		{text: "SPAMTON: HAEAHAEAHAEAHAEAH!!", delay: camSecondsToMilliseconds(3), sound: camSounds.spamton.laugh},
		{text: "SPAMTON: DON\"TYA KNOW I NEVER PUT ALL MY", delay: camSecondsToMilliseconds(6), sound: camSounds.spamton.talk2},
		{text: "SPAMTON: IN ONE [[BeutiFAl HAndmaDe bASKet]]???", delay: camSecondsToMilliseconds(9), sound: camSounds.spamton.talk2},
		{text: "SPAMTON: NOW H0LD STILL WHILE I [Demolish] YOU", delay: camSecondsToMilliseconds(12), sound: camSounds.spamton.talk2},
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
		{text: "SPAMTON: GO SPEND YOUR [[Ant-sized]] LIFE [Frolicking] IN TH3 FIELDS OF [Burning acid]", delay: camSecondsToMilliseconds(6), sound: camSounds.spamton.talk2},
		{text: "SPAMTON: AND LE4VE MY [[Rapidly-shrinking]] BASE ALONE!!!", delay: camSecondsToMilliseconds(9), sound: camSounds.spamton.talk2},
	]);
}

function spamtonEndSequence()
{
	setAlliance(CAM_SPAMTON, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_SPAMTON_REAL, CAM_HUMAN_PLAYER, true);

	// Destroy all of Spamton's units, factories, and spawners
	const units = enumDroid(CAM_SPAMTON);
	const structs = enumStruct(CAM_SPAMTON).filter((struct) => (
		struct.stattype === FACTORY || struct.stattype === CYBORG_FACTORY 
		|| struct.stattype === VTOL_FACTORY || struct.name === "Spamton Creeper Spawner"
		|| struct.name === "Spamton Skeleton Spawner" || struct.name === "Spamton Zombie Spawner"));
	const toDestroy = units.concat(structs);
	for (let i = 0; i < toDestroy.length; i++)
	{
		camSafeRemoveObject(toDestroy[i], true);
	}

	// Start talking
	camQueueDialogues([
		{text: "SPAMTON: H-HEY!!!", delay: camSecondsToMilliseconds(3), sound: camSounds.spamton.talk1},
		{text: "SPAMTON: WAIT! [Officer, I can explain!]!!!", delay: camSecondsToMilliseconds(6), sound: camSounds.spamton.talk2},
		{text: "SPAMTON: I D1DN\"T MEAN TO [Kill] YOU! I JUST NEEDED YOU TO [Die]!!", delay: camSecondsToMilliseconds(9), sound: camSounds.spamton.talk2},
		{text: "SPAMTON: BESIDES,,, YOU WERE [so mean to me :( ]!", delay: camSecondsToMilliseconds(12), sound: camSounds.spamton.talk2},
		{text: "SPAMTON: ALL THE [Hard Work] THAT I [Steal]", delay: camSecondsToMilliseconds(15), sound: camSounds.spamton.talk2},
		{text: "SPAMTON: ALL THE [Money] THAT I [Steal]", delay: camSecondsToMilliseconds(18), sound: camSounds.spamton.talk2},
		{text: "SPAMTON: I COULDN'T JUST L3T YOU TAKE ALL MY [[Hyperlink Blocked]]!!!", delay: camSecondsToMilliseconds(21), sound: camSounds.spamton.talk2},
		{text: "SPAMTON: BUT WAIT!!! THIS DOESN\"T [Needs to end NOW!]!!", delay: camSecondsToMilliseconds(24), sound: camSounds.spamton.talk2},
		{text: "SPAMTON: I JUST RECE1VE A NEW [Fresh Item] [ From The Source] !", delay: camSecondsToMilliseconds(27), sound: camSounds.spamton.talk2},
		{text: "SPAMTON: AND ITS 4LL YOURS FOR [The Low Low Price Of]", delay: camSecondsToMilliseconds(30), sound: camSounds.spamton.talk2},
		{text: "SPAMTON: JUST CHECK YOURE[Search History]!!", delay: camSecondsToMilliseconds(33), sound: camSounds.spamton.talk2},
		{text: "SPAMTON: THEN YOU CAN [Relapse] BACK TO [Esteemed Customer]!!", delay: camSecondsToMilliseconds(36), sound: camSounds.spamton.talk2},
		{text: "SPAMTON: THINK OF ALL YOU [Des1re]...", delay: camSecondsToMilliseconds(39), sound: camSounds.spamton.talk2},
		{text: "SPAMTON: W1LD PR1ZES, HOTSINGLE, 100 CUSTOMER, AND MOST OF ALL...", delay: camSecondsToMilliseconds(42), sound: camSounds.spamton.talk2},
		{text: "SPAMTON: ME!!!!", delay: camSecondsToMilliseconds(45), sound: camSounds.spamton.talk1},
		{text: "SPAMTON: HAEAHAEAHAEAHAEAH!!", delay: camSecondsToMilliseconds(47), sound: camSounds.spamton.laugh},
		// Delay here
		{text: "SPAMTON: ...", delay: camSecondsToMilliseconds(56), sound: camSounds.spamton.talk1},
		{text: "SPAMTON: PLEASE", delay: camSecondsToMilliseconds(58), sound: camSounds.spamton.talk1},
		// Bigger delay here
		{text: "SPAMTON: ...DID YOU [Buy] YET???", delay: camSecondsToMilliseconds(72), sound: camSounds.spamton.talk2},
	]);

	queue("grantMachinegunTwo", camSecondsToMilliseconds(33));
	queue("allowSpamtonAttack", camSecondsToMilliseconds(60));
	queue("startSpamtonWalk", camSecondsToMilliseconds(70));
}

// Allow the player to research Spamton's offering
function grantMachinegunTwo()
{
	enableResearch("R-Wpn-MG1Mk1-Two");
}

// Allow the player to target Spamton
function allowSpamtonAttack()
{
	setAlliance(CAM_HUMAN_PLAYER, MIS_SPAMTON_REAL, false);
}

// Start moving Spamton towards the player's base
function startSpamtonWalk()
{
	setTimer("moveSpamton", camSecondsToMilliseconds(6));
}

// Order spamton to go to the player's LZ and say a random funny line
function moveSpamton()
{
	const spamton = getObject("spamton");
	const pos = camMakePos("landingZone");

	orderDroidLoc(spamton, DORDER_MOVE, pos.x, pos.y);

	const dialogues = [
		{text: "SPAMTON: HOW ABOUT NOW?", delay: 0, sound: camSounds.spamton.talk1},
		{text: "SPAMTON: [Pretty Please]", delay: 0, sound: camSounds.spamton.talk1},
		{text: "SPAMTON: ARE WE [Friend Request Accepted] YET???", delay: 0, sound: camSounds.spamton.talk2},
		{text: "SPAMTON: COMMANDER?/??", delay: 0, sound: camSounds.spamton.talk1},
	];

	// Choose a dialogue from the array and play it
	const rDialogue = dialogues[camRand(dialogues.length)];
	camQueueDialogue(rDialogue.text, rDialogue.delay, rDialogue.sound);
}

// Play Spamton's defeat cutscene
function spamtonDeathScene()
{
	if (!altEndScene)
	{
		// Play the ending and credits
		camPlayVideos([{video: "SPAMTON_DEATH", type: MISS_MSG}, {video: "END_CREDITS", type: MISS_MSG}]);
		endSceneComplete = true; // Allow this mod to end
	}
}

// Play Spamton's alternate defeat cutscene
function spamtonNukeScene()
{
	// Play the ending and credits
	camPlayVideos([{video: "SPAMTON_NUKE", type: MISS_MSG}, {video: "END_CREDITS", type: MISS_MSG}]);
	endSceneComplete = true;
}

function allowVictory()
{
	if (endSceneComplete === true)
	{
		return true; // The mod now ends. Thanks for playing!
	}
	else
	{
		return undefined;
	}
}

function eventStartLevel()
{
	hackMarkTiles(); // Clear any marked tiles from Gamma 4
	camSetExtraObjectiveMessage([_("Find Spamton"), _("Defeat Spamton")]);

	const startpos = camMakePos(getObject("landingZone"));
	const lz = getObject("landingZone");
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);

	camSetStandardWinLossConditions(CAM_VICTORY_SCRIPTED, "GAMMA_OUT", {
		callback: "allowVictory" // Player wins if all 4 HQs are destroyed
	});
	camSetGameOverScenePool([
		"GAMEOVER_CRASH", "GAMEOVER_UTALT", "GAMEOVER_UK",
		"GAMEOVER_EXPLODE", "GAMEOVER_JET", "GAMEOVER_MISSILE",
		"GAMEOVER_MICROWAVE",
	]);

	centreView(startpos.x, startpos.y);

	camCompleteRequiredResearch(mis_spamtonRes, CAM_SPAMTON);
	setAlliance(CAM_SPAMTON, MIS_SPAMTON_REAL, true);
	changePlayerColour(MIS_SPAMTON_REAL, playerData[CAM_SPAMTON].colour);

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
	altEndScene = false;
	endSceneComplete = false;

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
