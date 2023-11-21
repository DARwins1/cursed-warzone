include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_bonziRes = [
	"R-Wpn-MG-Damage02", "R-Vehicle-Metals01", "R-Cyborg-Metals01",
	"R-Defense-WallUpgrade01", "R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage01",
	"R-Wpn-Cannon-Damage01", "R-Wpn-MG-ROF01", "R-Struc-RprFac-Upgrade01",
];
const mis_hardPatterns = [
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
		[0,1,0,1,0,1,0,1,0,1,0,0],
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
		[0,1,0,0,1,1,0,1,0,0,1,0],
		[1,0,0,0,1,0,1,1,0,0,0,1],
		[1,0,0,0,1,1,0,1,0,0,0,1],
		[1,0,0,0,1,0,1,1,0,0,0,1],
		[1,0,0,0,1,1,0,1,0,0,0,1],
		[0,1,0,0,1,0,1,1,0,0,1,0],
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
		[1,0,0,0,0,1,1,0,0,0,0,1],
		[1,0,0,0,0,1,1,0,0,0,0,1],
		[1,0,0,0,0,1,1,0,0,0,0,1],
		[0,1,1,1,1,0,0,1,1,1,1,0],
		[1,1,1,1,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,1,1,0],
		[0,0,0,0,0,0,0,0,0,1,1,0],
		[1,1,1,1,1,1,1,1,1,1,0,0],
		[0,0,0,1,0,0,0,0,1,0,0,0],
		[0,0,0,0,1,1,1,1,0,0,0,0],
		[0,0,0,0,1,0,0,1,0,0,0,0],
	],
];
var bossGroup; // Used to control Bonzi Buddy's ultra cyborg thingy (and his guards)

function camEnemyBaseEliminated_bbGateBase()
{
	camCallOnce("activateBonziBoss");
}

function camEnemyBaseDetected_bbGateBase()
{
	camCallOnce("activateSecondFactories");
}

camAreaEvent("bbBossTrigger", function(droid)
{
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		camCallOnce("activateBonziBoss");
	}
	else
	{
		resetLabel("bbBossTrigger", CAM_HUMAN_PLAYER);
	}
});

function activateFirstFactories()
{
	camEnableFactory("bbFactory1"); // General factory
	camEnableFactory("bbFactory3"); // Drift wheel factory
	camEnableFactory("bbCybFactory3"); // General factory
}

function activateSecondFactories()
{
	camEnableFactory("bbFactory2"); // Thick wheel factory
	camEnableFactory("bbFactory4"); // Pepperspray factory
	camEnableFactory("bbCybFactory1"); // Sword cyborg factory
	camEnableFactory("bbNormFactory1"); // Light factory
}

// Get Bonzi Buddy's gigantic super cyborg moving
// Also activate some factories
function activateBonziBoss()
{
	camManageGroup(bossGroup, CAM_ORDER_ATTACK);

	camEnableFactory("bbCybFactory2"); // Many-Rocket Pod factory
	camEnableFactory("bbNormFactory2"); // Heavy factory
}

//Send a Bonzi Buddy transport
function sendBBTransporter()
{
	const nearbyDefense = enumArea("bbBase3", CAM_BONZI_BUDDY, false);

	if (nearbyDefense.length > 0)
	{
		camSendReinforcement(CAM_BONZI_BUDDY, camMakePos("bbLandingZone"), getDroidsForBBLZ(),
			CAM_REINFORCE_TRANSPORT, {
				entry: { x: 8, y: 8 },
				exit: { x: 8, y: 8 }
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
	const list = [cTempl.crmpepht, cTempl.crlslanceht, cTempl.crmbb2ht];

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
		pos: ["patrolPos1", "patrolPos2"],
		interval: camSecondsToMilliseconds(20),
		repair: 50
	});
	camManageGroup(camMakeGroup("bbPatrolGroup2"), CAM_ORDER_PATROL, {
		pos: ["patrolPos3", "patrolPos4", "patrolPos5"],
		interval: camSecondsToMilliseconds(30)
	});
	camManageGroup(camMakeGroup("bbPatrolGroup3"), CAM_ORDER_PATROL, {
		pos: ["patrolPos6", "patrolPos7", "patrolPos8", "patrolPos9"],
		interval: camSecondsToMilliseconds(20),
		repair: 35
	});
}

// Activate the boss if the player tries to build a nuclear drum nearby
function nukeDrumCheck()
{
	const NUKE_DRUM_NEARBY = enumArea("bbBase4", ALL_PLAYERS, false).filter((obj) => (
		obj.type === STRUCTURE && obj.player === CAM_HUMAN_PLAYER && obj.name === _("Nuclear Drum")
	)).length > 0;
	if (NUKE_DRUM_NEARBY)
	{
		camCallOnce("activateBonziBoss");
		removeTimer("nukeDrumCheck");
	}
}

// Create a pattern out of orange rocks
function setPattern()
{
	// Choose a random pattern from the list
	const PATTERN_NUM = camRand(mis_hardPatterns.length);
	const pattern = mis_hardPatterns[PATTERN_NUM];
	completeResearch("Script-Labyrinth-Puzzle-" + (PATTERN_NUM + 1));

	// Possible rock types to place
	const rockTypes = ["Boulder1", "Boulder2", "Boulder3"];
	const patternPos = {x: 62, y: 36};

	// Place rocks in the pattern grid
	for (let y = 0; y < pattern.length; y++)
	{
		for (let x = 0; x < pattern[y].length; x++)
		{
			if (pattern[y][x] === 1)
			{
				addFeature(rockTypes[camRand(rockTypes.length)], patternPos.x + x, patternPos.y + y);
			}
		}
	}
}

function bonziBossStatus()
{
	let boss = getObject("bonziBoss");
	if (!camDef(boss) || boss === null)
	{
		camSetExtraObjectiveMessage(["Defeat Bonzi Buddy", "...And his various goons"]);
		return true; // Boss is destroyed
	}
	else
	{
		return undefined; // Boss isn't destroyed yet
	}
}

function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "KILL_YOUR_TV", {
		area: "compromiseZone",
		message: "C26_LZ",
		reinforcements: camMinutesToSeconds(2),
		callback: "bonziBossStatus"
	});
	camSetExtraObjectiveMessage("Defeat Bonzi Buddy");

	const startpos = camMakePos(getObject("landingZone"));
	const lz = getObject("landingZone"); //player lz
	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(25, 90, CAM_HUMAN_PLAYER);
	setTransporterExit(25, 90, CAM_HUMAN_PLAYER);

	const enemyLz = getObject("bbLandingZone");
	setNoGoArea(enemyLz.x, enemyLz.y, enemyLz.x2, enemyLz.y2, CAM_BONZI_BUDDY);

	bossGroup = camMakeGroup("bbBossGroup");

	camSetArtifacts({
		"bbFactory1": { tech: "R-Wpn-Rocket03-HvAT2" }, // Bunker Buster 2
		"bbNormFactory1": { tech: "R-Vehicle-Prop-VTOL" }, // Normal Wheels
		"bbFactory4": { tech: "R-Wpn-Mortar3" }, // Pepperspray
		"bbChest": { tech: "R-Cyborg-Wpn-Rocket" }, // Firework Cyborg
	});

	camCompleteRequiredResearch(mis_bonziRes, CAM_BONZI_BUDDY);

	camSetEnemyBases({
		"bbSWBase": {
			cleanup: "bbBase1",
			detectMsg: "C26_BASE1",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"bbSBase": {
			cleanup: "bbBase2",
			detectMsg: "C26_BASE2",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"bbLZBase": {
			cleanup: "bbBase3",
			detectMsg: "C26_BASE3",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"bbGateBase": {
			cleanup: "bbBase4",
			detectMsg: "C26_BASE4",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"bbNWBase": {
			cleanup: "bbBase5",
			detectMsg: "C26_BASE5",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"bbNEBase": {
			cleanup: "bbBase6",
			detectMsg: "C26_BASE6",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
	});

	camSetFactories({
		"bbFactory1": {
			assembly: "bbAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			data: {
				regroup: false,
				repair: 20,
				count: -1,
			},
			templates: [ cTempl.crmbb2ht, cTempl.crmhmght, cTempl.crlpodht ] // General units
		},
		"bbFactory2": {
			assembly: "bbAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(65)),
			data: {
				regroup: false,
				count: -1,
			},
			templates: [ cTempl.crmmcant, cTempl.crmmcant, cTempl.crmhmgt ] // Thick-wheeled units
		},
		"bbFactory3": {
			assembly: "bbAssembly3",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(35)),
			data: {
				regroup: false,
				repair: 55,
				count: -1,
			},
			templates: [ cTempl.crmbb2dw, cTempl.crmslancedw, cTempl.crmhmgdw, cTempl.crmslancedw, cTempl.crmhmgdw ] // Drift Wheel harassers
		},
		"bbFactory4": {
			assembly: "bbAssembly4",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			data: {
				regroup: false,
				count: -1,
			},
			templates: [ cTempl.crmhmght, cTempl.crmpepht ] // MGs and Peppersprays
		},
		"bbCybFactory1": {
			assembly: "bbCybAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 9,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			data: {
				regroup: false,
				repair: 40,
				count: -1,
			},
			templates: [ cTempl.crcybsword, cTempl.crcybsword, cTempl.crcybbow ] // Sword and Archer Cyborgs
		},
		"bbCybFactory2": {
			assembly: "bbCybAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(35)),
			data: {
				regroup: false,
				repair: 40,
				count: -1,
			},
			templates: [ cTempl.crcybpod, cTempl.crcybfirew, cTempl.crcybpod ] // Many-Rocket and Firework Cyborgs
		},
		"bbCybFactory3": {
			assembly: "bbCybAssembly3",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(35)),
			data: {
				regroup: true,
				repair: 40,
				count: -1,
			},
			templates: [ cTempl.crcybcan, cTempl.crcybcool ] // "Light" Cannons and Cool MGs
		},
		"bbNormFactory1": {
			assembly: "bbNormAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(25)),
			data: {
				regroup: false,
				repair: 20,
				count: -1,
			},
			templates: [ cTempl.crlmgnw, cTempl.crllcannw, cTempl.crlpodnw ] // Light stuff
		},
		"bbNormFactory2": {
			assembly: "bbNormAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(50)),
			data: {
				regroup: false,
				repair: 20,
				count: -1,
			},
			templates: [ cTempl.crmbb2nw, cTempl.crmhmgnw ] // Tougher stuff
		},
	});

	setPattern();

	// Replace all snowy trees with funny explosive barrels
	camUpgradeOnMapFeatures("TreeSnow3", "ExplosiveDrum");

	// Make units funny
	camUpgradeOnMapTemplates(cTempl.npsbb, cTempl.crmbb2ht, CAM_BONZI_BUDDY);
	camUpgradeOnMapTemplates(cTempl.crcybpyro, cTempl.crcybsword, CAM_BONZI_BUDDY);
	camUpgradeOnMapTemplates(cTempl.crlmgw, cTempl.bonziscybcan, CAM_BONZI_BUDDY);
	camUpgradeOnMapTemplates(cTempl.crlmgw, cTempl.enderman, CAM_MOBS);

	// Make structures funny
	camUpgradeOnMapStructures("Sys-NX-SensorTower", "Spawner-Creeper", CAM_MOBS);
	camUpgradeOnMapStructures("PillBox5", "PillBox-BB2", CAM_BONZI_BUDDY);
	camUpgradeOnMapStructures("A0RepairCentre3", "A0RepairCentre1", CAM_BONZI_BUDDY);
	camUpgradeOnMapStructures("A0HardcreteMk1CWall", "A0Chest", CAM_BONZI_BUDDY);

	queue("startPatrols", camSecondsToMilliseconds(3));
	setTimer("nukeDrumCheck", camSecondsToMilliseconds(2));

	// Set up queues for factory/LZ activation
	queue("activateFirstFactories", camChangeOnDiff(camMinutesToMilliseconds(2.5)));
	queue("activateSecondFactories", camChangeOnDiff(camMinutesToMilliseconds(12)));
	setTimer("sendBBTransporter", camChangeOnDiff(camMinutesToMilliseconds(4)));
}
