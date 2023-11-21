include("script/campaign/transitionTech.js");
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const MIS_TRANSPORT_LIMIT = 4; // Number of transports brought when starting from the menu
var transporterIndex; // Number of transport loads sent into the level by the player
var mobWaveIndex; // Number mob attack waves 
var startedFromMenu;

// Changing the player's colour only updates playerData after save-loading or level progression.
var playerColour;

// Triggered when the player moves north past the spawners
camAreaEvent("bbAttackTrigger", function(droid)
{
	// Only trigger if the player moves a droid in
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		// Attack the player with the two ambush groups
		camManageGroup(camMakeGroup("bbAmbushGroup1"), CAM_ORDER_ATTACK, {
			repair: 60
		});
		camManageGroup(camMakeGroup("bbAmbushGroup2"), CAM_ORDER_ATTACK, {
			fallback: camMakePos("bbBaseGroup3"),
			morale: 50
		});

		// Get the patrol groups moving
		camManageGroup(camMakeGroup("bbPatrolGroup1"), CAM_ORDER_PATROL, {
			pos: ["patrolPos13", "patrolPos14", "patrolPos15"],
			interval: camSecondsToMilliseconds(20)
		});
		camManageGroup(camMakeGroup("bbPatrolGroup2"), CAM_ORDER_PATROL, {
			pos: ["patrolPos16", "patrolPos17", "patrolPos18"],
			interval: camSecondsToMilliseconds(20)
		});

		// Get the factories started
		camEnableFactory("bbFactory1");
		camEnableFactory("bbFactory2");
		camEnableFactory("bbCybFactory1");
		camEnableFactory("bbCybFactory2");
		camEnableFactory("bbCybFactory3");

		// Start calling in transports
		setTimer("sendBBTransporter", camChangeOnDiff(camMinutesToMilliseconds(5.5)));
	}
	else
	{
		resetLabel("bbAttackTrigger", CAM_HUMAN_PLAYER);
	}
});

function getDroidsForBBLZ()
{
	const droids = [];
	const COUNT = 6 + difficulty; // 6 to 10 units
	let list;
	const groupTypes = ["drift", "heavy", "artillery"];

	switch (groupTypes[camRand(groupTypes.length)]) // Choose a random group template
	{
		case "drift": // All drifty boys
			list = [
				cTempl.crmmbb2dw, cTempl.crmmbb2dw, cTempl.crlhmgdw, cTempl.crlslancedw, cTempl.crlhmgdw,
				cTempl.crlslancedw, cTempl.crlhmgdw, cTempl.crlslancedw, cTempl.crlhmgdw, cTempl.crlslancedw,
			];
			break;
		case "heavy": // Various halftracks
			list = [
				cTempl.crmbb2ht, cTempl.crmbb2ht, cTempl.crlbbht, cTempl.crlbbht, cTempl.crlcanht,
				cTempl.crlhmght, cTempl.crlhmght, cTempl.crlcanht, cTempl.crlhmght, cTempl.crmbb2ht,
			];
			break;
		case "artillery": // Almost all artillery
			list = [
				cTempl.crlsensht, cTempl.crlsensht, cTempl.crmmortht, cTempl.crcybbb, cTempl.crcybbb,
				cTempl.crmmortht, cTempl.crmmortht, cTempl.crmmortht, cTempl.crmmortht, cTempl.crmmortht,
			];
			break;
	}

	for (let i = 0; i < COUNT; ++i)
	{
		droids.push(list[i]);
	}

	return droids;
}

//Send a Bonzi Buddy transport
function sendBBTransporter()
{
	const nearbyDefense = enumArea("bbBaseGroup2", CAM_BONZI_BUDDY, false);

	if (nearbyDefense.length > 0)
	{
		camSendReinforcement(CAM_BONZI_BUDDY, camMakePos("bbLandingZone"), getDroidsForBBLZ(),
			CAM_REINFORCE_TRANSPORT, {
				entry: { x: 124, y: 20 },
				exit: { x: 124, y: 20 }
			}
		);
	}
	else
	{
		removeTimer("sendBBTransporter");
	}
}

//Extra transport units are only awarded to those who start Beta campaign
//from the main menu. Otherwise a player can just bring in there Alpha units
function sendPlayerTransporter()
{
	if (!camDef(transporterIndex))
	{
		transporterIndex = 0;
	}

	if (transporterIndex === MIS_TRANSPORT_LIMIT)
	{
		removeTimer("sendPlayerTransporter");
		return;
	}

	let droids = [];
	if (transporterIndex === 0)
	{
		droids = [
			cTempl.crltruckw, cTempl.crltruckw, cTempl.crltruckw, cTempl.crltruckw,
			cTempl.crlscorchw, cTempl.crlscorchw, cTempl.crcybcool, cTempl.crcybcool,
			cTempl.crcybcan, cTempl.crcybcan
		];
	}
	else
	{
		const list = [
			cTempl.crlbbw, cTempl.crlcanw, cTempl.crlmgw, cTempl.crlscorchw,
			cTempl.crcybbb, cTempl.crcybcan, cTempl.crcybpyro, cTempl.crcybcool
		];

		for (let i = 0; i < 10; ++i)
		{
			droids.push(list[camRand(list.length)]);
		}
	}

	camSendReinforcement(CAM_HUMAN_PLAYER, camMakePos("landingZone"), droids,
		CAM_REINFORCE_TRANSPORT, {
			entry: { x: 87, y: 100 },
			exit: { x: 94, y: 121 }
		}
	);
}

// Periodically spawn a wave of mobs from the east spawner cluster
function mobAttackWave()
{
	if (getObject("waveZombieSpawner") === null 
		&& getObject("waveSkeletonSpawner") === null 
		&& getObject("waveCreeperSpawner") === null)
	{
		// All spawners destroyed
		removeTimer("mobAttackWave");
		return;
	}

	let spawnPos = camMakePos("mobAttackPos")
	if (enumRange(spawnPos.x, spawnPos.y, 16, CAM_HUMAN_PLAYER, false).length > 0)
	{
		// Player too close, let the spawners do their thing on their own
		mobWaveIndex++;
		return;
	}

	const MOB_COUNT = Math.min(mobWaveIndex + 3, difficulty + 5);
	const list = [];
	// Allow zombies if the zombie spawner is alive
	if (getObject("waveZombieSpawner") !== null) list.push(cTempl.zombie);
	// Allow baby zombies if the zombie spawner is alive and 4 waves have already occured
	if (getObject("waveZombieSpawner") !== null && mobWaveIndex >= 4) list.push(cTempl.babyzombie);
	// Allow skeletons if the skeleton spawner is alive
	if (getObject("waveSkeletonSpawner") !== null) list.push(cTempl.skeleton); 
	// Allow creepers if the creeper spawner is alive and 2 waves have already occured
	if (getObject("waveCreeperSpawner") !== null && mobWaveIndex >= 2) list.push(cTempl.creeper); 

	const droids = [];
	for (let i = 0; i < MOB_COUNT; ++i)
	{
		droids.push(list[camRand(list.length)]);
	}

	mobWaveIndex++;
	camSendReinforcement(CAM_MOBS, spawnPos, droids, CAM_REINFORCE_GROUND);
}

//Gives starting tech and research.
function cam2Setup()
{
	const bonziRes = [
		"R-Wpn-MG-Damage02", "R-Vehicle-Metals01", "R-Cyborg-Metals01",
		"R-Defense-WallUpgrade01", "R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage01",
	];

	for (let x = 0, l = mis_structsAlpha.length; x < l; ++x)
	{
		enableStructure(mis_structsAlpha[x], CAM_HUMAN_PLAYER);
	}

	camCompleteRequiredResearch(bonziRes, CAM_BONZI_BUDDY);
	camCompleteRequiredResearch(mis_alphaResearchNew, CAM_HUMAN_PLAYER);
}

//Get some higher rank droids.
function setUnitRank(transport)
{
	const droidEXP = [32, 16, 8, 4];
	let droids;

	droids = enumCargo(transport);

	for (let i = 0, len = droids.length; i < len; ++i)
	{
		const droid = droids[i];
		if (!camIsSystemDroid(droid))
		{
			setDroidExperience(droid, droidEXP[transporterIndex - 1]);
		}
	}
}

//Bump the rank of the first batch of transport droids as a reward.
function eventTransporterLanded(transport)
{
	if (transport.player === CAM_HUMAN_PLAYER)
	{
		if (!camDef(transporterIndex))
		{
			transporterIndex = 0;
		}

		if (transporterIndex === 0)
		{
			// Attack the player from the northwest
			camManageGroup(camMakeGroup("mobAttackGroup1"), CAM_ORDER_ATTACK);

			// Start mob patrols
			camManageGroup(camMakeGroup("mobPatrolGroup1"), CAM_ORDER_PATROL, {
				pos: ["patrolPos1", "patrolPos2", "patrolPos3"],
				interval: camSecondsToMilliseconds(20)
			});
			camManageGroup(camMakeGroup("mobPatrolGroup2"), CAM_ORDER_PATROL, {
				pos: ["patrolPos4", "patrolPos5", "patrolPos6"],
				interval: camSecondsToMilliseconds(20)
			});
			camManageGroup(camMakeGroup("mobPatrolGroup3"), CAM_ORDER_PATROL, {
				pos: ["patrolPos7", "patrolPos8", "patrolPos9"],
				interval: camSecondsToMilliseconds(20)
			});
			camManageGroup(camMakeGroup("mobPatrolGroup4"), CAM_ORDER_PATROL, {
				pos: ["patrolPos10", "patrolPos11", "patrolPos12"],
				interval: camSecondsToMilliseconds(20)
			});
		}
		else if (transporterIndex === 1)
		{
			// Attack the player from the southwest
			camManageGroup(camMakeGroup("mobAttackGroup2"), CAM_ORDER_ATTACK);
		}

		transporterIndex += 1;

		if (startedFromMenu)
		{
			setUnitRank(transport);
		}
	}
}

// Allow the player to change to colors
function eventChat(from, to, message)
{
	let colour = 0;
	switch (message)
	{
		case "green me":
			colour = 0; // Green
			break;
		case "orange me":
			colour = 1; // Orange
			break;
		case "grey me":
		case "gray me":
			colour = 2; // Gray
			break;
		case "black me":
			colour = 3; // Black
			break;
		case "red me":
			colour = 4; // Red
			break;
		case "blue me":
			colour = 5; // Blue
			break;
		case "pink me":
			colour = 6; // Pink
			break;
		case "aqua me":
		case "cyan me":
			colour = 7; // Cyan
			break;
		case "yellow me":
			colour = 8; // Yellow
			break;
		case "purple me":
			colour = 9; // Purple
			break;
		case "white me":
			colour = 10; // White
			break;
		case "bright blue me":
		case "bright me":
			colour = 11; // Bright Blue
			break;
		case "neon green me":
		case "neon me":
		case "bright green me":
			colour = 12; // Neon Green
			break;
		case "infrared me":
		case "infra red me":
		case "infra me":
		case "dark red me":
			colour = 13; // Infrared
			break;
		case "ultraviolet me":
		case "ultra violet me":
		case "ultra me":
		case "uv me":
		case "dark blue me":
			colour = 14; // Ultraviolet
			break;
		case "brown me":
		case "dark green me":
			colour = 15; // Brown
			break;
		default:
			return; // Some other message; do nothing
	}

	playerColour = colour;
	changePlayerColour(CAM_HUMAN_PLAYER, colour);

	// Make sure enemies aren't choosing conflicting colours with the player
	if (colour === 4)
	{
		changePlayerColour(CAM_MOBS, 5); // Switch to blue
	}
	else
	{
		changePlayerColour(CAM_MOBS, 4); // Keep as red
	}

	if (colour === 9)
	{
		changePlayerColour(CAM_BONZI_BUDDY, 3); // Switch to black
	}
	else
	{
		changePlayerColour(CAM_BONZI_BUDDY, 9); // Keep as purple
	}

	playSound("beep6.ogg");
}

function eventStartLevel()
{
	const PLAYER_POWER = 5000;
	const startpos = camMakePos(getObject("landingZone"));
	const lz = getObject("landingZone"); //player lz
	const enemyLz = getObject("bbLandingZone");

	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "CAVE_UPDATE_PART_4");
	setReinforcementTime(LZ_COMPROMISED_TIME);

	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	setNoGoArea(enemyLz.x, enemyLz.y, enemyLz.x2, enemyLz.y2, 5);
	startTransporterEntry(87, 100, CAM_HUMAN_PLAYER);
	setTransporterExit(94, 121, CAM_HUMAN_PLAYER);

	camSetArtifacts({
		"chest1": { tech: "R-Cyborg-Wpn-Bow" }, // Archer Cyborg
		"chest2": { tech: "R-Cyborg-Wpn-Sword" }, // Sword Cyborg
		"bbHQ": { tech: "R-Sys-Engineering02" }, // Engineer Gaming
		"bbFactory1": { tech: "R-Vehicle-Prop-Halftracks" }, // Half-wheels
		"bbResearch": { tech: "R-Wpn-Mortar-Damage01" }, // Improved Rocks
	});

	setMissionTime(camChangeOnDiff(camHoursToSeconds(1.5)));
	setPower(PLAYER_POWER, CAM_HUMAN_PLAYER);
	cam2Setup();

	playerColour = playerData[0].colour;

	// Make sure enemies aren't choosing conflicting colours with the player
	if (playerColour === 4)
	{
		changePlayerColour(CAM_MOBS, 5); // Switch to blue
	}
	else
	{
		changePlayerColour(CAM_MOBS, 4); // Keep as red
	}

	if (playerColour === 9)
	{
		changePlayerColour(CAM_BONZI_BUDDY, 3); // Switch to black
	}
	else
	{
		changePlayerColour(CAM_BONZI_BUDDY, 9); // Keep as purple
	}

	camSetEnemyBases({
		"bbNorthWestBase": {
			cleanup: "bbBaseGroup1",
			detectMsg: "C2A_BASE1",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"bbNorthLZ": {
			cleanup: "bbBaseGroup2",
			detectMsg: "C2A_BASE2",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"bbNorthEastBase": {
			cleanup: "bbBaseGroup3",
			detectMsg: "C2A_BASE3",
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
			templates: [ cTempl.crlbbht, cTempl.crlhmght, cTempl.crlbbht, cTempl.crlcanht ] // General units
		},
		"bbFactory2": {
			assembly: "bbAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			data: {
				regroup: true,
				count: -1,
			},
			templates: [ cTempl.crlsensht, cTempl.crlmortw, cTempl.crlmortw, cTempl.crlcanw ] // Mostly artillery
		},
		"bbCybFactory1": {
			assembly: "bbCybAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			data: {
				regroup: true,
				count: -1,
			},
			templates: [ cTempl.crcybpod, cTempl.crcybbb, cTempl.crcybcan ] // Attacks in large groups
		},
		"bbCybFactory2": {
			assembly: "bbCybAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(35)),
			data: {
				regroup: true,
				repair: 40,
				count: -1,
			},
			templates: [ cTempl.crcybcool, cTempl.crcybcan, cTempl.crcybbb ] // Harasses in small groups
		},
		"bbCybFactory3": {
			assembly: "bbCybAssembly3",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			data: {
				regroup: false,
				count: -1,
			},
			templates: [ cTempl.crcybcool, cTempl.crcybcan, cTempl.crcybcool ]
		},
	});

	camPlayVideos({video: "MB2A_MSG", type: MISS_MSG});
	startedFromMenu = false;

	//Only if starting Beta directly rather than going through Alpha
	if (enumDroid(CAM_HUMAN_PLAYER, DROID_SUPERTRANSPORTER).length === 0)
	{
		startedFromMenu = true;
		sendPlayerTransporter();
		setTimer("sendPlayerTransporter", camMinutesToMilliseconds(2));
	}
	else
	{
		setReinforcementTime(camMinutesToSeconds(2)); // 2 min.
	}

	mobWaveIndex = 0;
	setTimer("mobAttackWave", camChangeOnDiff(camMinutesToMilliseconds(2.5)));

	// Replace all snowy trees with funny explosive barrels
	camUpgradeOnMapFeatures("TreeSnow3", "ExplosiveDrum");

	// Add a funny sign and the giant door (for later)
	camUpgradeOnMapFeatures("Pylon", "Sign4");
	camUpgradeOnMapFeatures("TreeSnow1", "GiantDoorVert");

	// Make on-map units funny
	camUpgradeOnMapTemplates(cTempl.npcybr, cTempl.skeleton, CAM_MOBS);
	camUpgradeOnMapTemplates(cTempl.crcybmg, cTempl.zombie, CAM_MOBS);
	camUpgradeOnMapTemplates(cTempl.crcybpyro, cTempl.creeper, CAM_MOBS);
	camUpgradeOnMapTemplates(cTempl.crlmgw, cTempl.enderman, CAM_MOBS);
	camUpgradeOnMapTemplates(cTempl.npsbb, cTempl.crmbb2ht, CAM_BONZI_BUDDY);
	camUpgradeOnMapTemplates(cTempl.crcybmg, cTempl.crcybcool, CAM_BONZI_BUDDY);
	camUpgradeOnMapTemplates(cTempl.crlmrlht, cTempl.crlbbdw, CAM_BONZI_BUDDY);
	camUpgradeOnMapTemplates(cTempl.crlhmght, cTempl.crlhmgdw, CAM_BONZI_BUDDY);
	camUpgradeOnMapTemplates(cTempl.crlpodht, cTempl.crlpoddw, CAM_BONZI_BUDDY);
	camUpgradeOnMapTemplates(cTempl.npcybr, cTempl.crcybbb, CAM_BONZI_BUDDY);

	// Make structures funny
	camUpgradeOnMapStructures("Sys-SensoTower01", "Spawner-Zombie", CAM_MOBS);
	camUpgradeOnMapStructures("Sys-SensoTower02", "Spawner-Skeleton", CAM_MOBS);
	camUpgradeOnMapStructures("Sys-NX-SensorTower", "Spawner-Creeper", CAM_MOBS);
	camUpgradeOnMapStructures("A0HardcreteMk1CWall", "A0Chest", CAM_MOBS);
	camUpgradeOnMapStructures("PillBox6", "PillBox-BB", CAM_BONZI_BUDDY);
	camUpgradeOnMapStructures("A0RepairCentre3", "A0RepairCentre1", CAM_BONZI_BUDDY);

	// Spamton items
	enableResearch("R-Wpn-Rocket01-LtAT-Def", CAM_HUMAN_PLAYER); // Defective Lancer
}
