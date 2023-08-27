include("script/campaign/transitionTech.js");
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

var transporterIndex; //Number of bonus transports that have flown in.
var startedFromMenu;

// Changing the player's colour only updates playerData after save-loading or level progression.
var playerColour;

// Enable factories in bases if the player enters them early
// Note that factory 1 and cyborg factory 1 are activated at around the start of the mission and are not included here 
camAreaEvent("spamBase2", function(droid)
{
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		camEnableFactory("spamNormFactory1");
		camEnableFactory("spamCybFactory4");
	}
	else
	{
		resetLabel("spamBase2", CAM_HUMAN_PLAYER);
	}
});

camAreaEvent("spamBase3", function(droid)
{
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		// NOTE: Factory 1 is already active at the start of the mission
		camEnableFactory("spamFactory2");
		camEnableFactory("spamCybFactory2");
	}
	else
	{
		resetLabel("spamBase3", CAM_HUMAN_PLAYER);
	}
});

camAreaEvent("spamBase4", function(droid)
{
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		camEnableFactory("spamFactory3");
		camEnableFactory("spamCybFactory3");
	}
	else
	{
		resetLabel("spamBase4", CAM_HUMAN_PLAYER);
	}
});

function setUnitRank(transport)
{
	const DROID_EXP = [128, 64, 32, 16];
	var droids = enumCargo(transport);

	for (let i = 0, len = droids.length; i < len; ++i)
	{
		var droid = droids[i];
		if (!camIsSystemDroid(droid))
		{
			setDroidExperience(droid, DROID_EXP[transporterIndex - 1]);
		}
	}
}

function eventTransporterLanded(transport)
{
	if (startedFromMenu)
	{
		setUnitRank(transport);
	}
}

//Extra transport units are only awarded to those who start Gamma campaign
//from the main menu.
function sendPlayerTransporter()
{
	const transportLimit = 4; //Max of four transport loads if starting from menu.
	if (!camDef(transporterIndex))
	{
		transporterIndex = 0;
	}

	if (transporterIndex === transportLimit)
	{
		removeTimer("sendPlayerTransporter");
		return;
	}

	var droids = [];
	if (transporterIndex === 0)
	{
		droids = [
			cTempl.crmtruckht, cTempl.crmtruckht, cTempl.crmtruckht, cTempl.crmtruckht,
			cTempl.crtwinhmgcanht, cTempl.crtwinhmgcanht, cTempl.crcybcool, cTempl.crcybcool,
			cTempl.crcybcan, cTempl.crcybcan
		];
	}
	else
	{
		var list = [
			cTempl.crmbb2ht, cTempl.crtwinhmgcanht, cTempl.crcybpod, cTempl.crtwinscorchpodht,
			cTempl.crcybbb, cTempl.crcybcan, cTempl.crcybpyro, cTempl.crcybcool
		];

		for (let i = 0; i < 10; ++i)
		{
			droids.push(list[camRand(list.length)]);
		}
	}

	camSendReinforcement(CAM_HUMAN_PLAYER, camMakePos("landingZone"), droids,
		CAM_REINFORCE_TRANSPORT, {
			entry: {x: 5, y: 25},
			exit: {x: 5, y: 25}
		}
	);

	transporterIndex += 1;
}

//Gives starting tech and research.
function cam3Setup()
{
	const SPAMTON_RES = [
		"R-Wpn-MG-Damage02", "R-Vehicle-Metals02", "R-Cyborg-Metals02",
		"R-Defense-WallUpgrade02", "R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage02",
		"R-Wpn-Cannon-Damage01", "R-Wpn-MG-ROF01", "R-Struc-RprFac-Upgrade01",
		"R-Wpn-RocketSlow-Damage01",
	];

	for (let x = 0, l = STRUCTS_ALPHA.length; x < l; ++x)
	{
		enableStructure(STRUCTS_ALPHA[x], CAM_HUMAN_PLAYER);
	}

	camCompleteRequiredResearch(ALPHA_RESEARCH_NEW, CAM_HUMAN_PLAYER);
	camCompleteRequiredResearch(BETA_RESEARCH_NEW, CAM_HUMAN_PLAYER);
	camCompleteRequiredResearch(SPAMTON_RES, SPAMTON);
}

// Move the group of Spamacondas from the east
function spamAmbush1()
{
	camManageGroup(camMakeGroup("spamAmbushGroup1"), CAM_ORDER_ATTACK);
	
	// Also start patrolling
	camManageGroup(camMakeGroup("spamPatrolGroup"), CAM_ORDER_PATROL, {
		pos: [ "patrolPos1", "patrolPos2", "patrolPos3" ],
		interval: camSecondsToMilliseconds(20),
		repair: 40
	});
}

// Move the group of Spy Cyborgs from the north
function spamAmbush2()
{
	camManageGroup(camMakeGroup("spamAmbushGroup2"), CAM_ORDER_ATTACK);
}

// Activate the north cyborg factory, and the central factory
function activateFirstFactories()
{
	camEnableFactory("spamFactory1");
	camEnableFactory("spamCybFactory1");
}

// Activate the drift factory, the normal factory, and the south cyborg factory
function activateSecondFactories()
{
	camEnableFactory("spamFactory2");
	camEnableFactory("spamCybFactory2");
	camEnableFactory("spamNormFactory1");
}

// Activate the nw factory and the east and nw cyborg factories
function activateFinalFactories()
{
	camEnableFactory("spamFactory3");
	camEnableFactory("spamCybFactory3");
	camEnableFactory("spamCybFactory4");
}

// Allow the player to change to colors
function eventChat(from, to, message)
{
	var colour = 0;
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
		default:
			return; // Some other message
	}

	playerColour = colour;
	changePlayerColour(CAM_HUMAN_PLAYER, colour);

	// Make sure enemies aren't choosing conflicting colours with the player
	if (colour === 4)
	{
		changePlayerColour(MOBS, 5); // Switch to blue
	}
	else
	{
		changePlayerColour(MOBS, 4); // Keep as red
	}

	if (colour === 6)
	{
		changePlayerColour(SPAMTON, 8); // Switch to yellow
	}
	else
	{
		changePlayerColour(SPAMTON, 6); // Keep as pink
	}

	playSound("beep6.ogg");
}

function eventStartLevel()
{
	var startpos = camMakePos(getObject("landingZone"));
	var lz = getObject("landingZone");
	var tent = {x: 5, y: 25};
	var text = {x: 5, y: 25};

	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "NO_DONT_STEAL_MY_");
	setMissionTime(camChangeOnDiff(camHoursToSeconds(1.25)));

	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tent.x, tent.y, CAM_HUMAN_PLAYER);
	setTransporterExit(text.x, text.y, CAM_HUMAN_PLAYER);

	camSetArtifacts({
		"spamCybFactory1": { tech: "R-Cyborg-Wpn-MGSpy" }, // Spy Cyborg
		"sansburstSite": { tech: "R-Wpn-Missile-LtSAM" }, // Sansburst AA
		"spamNormFactory1": { tech: "R-Wpn-Bomb01" }, // ACME Anvil
		"spamFactory3": { tech: "R-Vehicle-Body11" }, // Viper III
	});

	playerColour = playerData[0].colour;

	// Make sure enemies aren't choosing conflicting colours with the player
	if (playerColour === 4)
	{
		changePlayerColour(MOBS, 5); // Switch to blue
	}
	else
	{
		changePlayerColour(MOBS, 4); // Keep as red
	}

	if (playerColour === 6)
	{
		changePlayerColour(SPAMTON, 8); // Switch to yellow
	}
	else
	{
		changePlayerColour(SPAMTON, 6); // Keep as pink
	}

	let playerPower = 12000;
	if (difficulty === HARD)
	{
		playerPower = 10000;
	}
	else if (difficulty === INSANE)
	{
		playerPower = 8000;
	}
	else if (playerPower <= EASY)
	{
		playerPower = 16000;
	}
	setPower(playerPower, CAM_HUMAN_PLAYER);
	cam3Setup();

	camSetEnemyBases({
		"spamNBase": {
			cleanup: "spamBase1",
			detectMsg: "CM3A_BASE1",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"spamEBase": {
			cleanup: "spamBase2",
			detectMsg: "CM3A_BASE2",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"spamSEBase": {
			cleanup: "spamBase3",
			detectMsg: "CM3A_BASE3",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"spamSWBase": {
			cleanup: "spamBase4",
			detectMsg: "CM3A_BASE4",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"spamAABase": {
			cleanup: "spamBase5",
			detectMsg: "CM3A_BASE5",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"spamNEBase": {
			cleanup: "spamBase6",
			detectMsg: "CM3A_BASE6",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
	});

	camSetFactories({
		"spamFactory1": {
			assembly: "spamAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(25)),
			data: {
				regroup: false,
				repair: 15,
				count: -1,
			},
			templates: [ cTempl.sphhflamt, cTempl.spminimg, cTempl.spmlcanht, cTempl.splmgw, cTempl.spleflamht, cTempl.spminimg, cTempl.sptwinneedlereflamht, cTempl.splneedleht ] // A bunch of random stuff
		},
		"spamFactory2": {
			assembly: "spamAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(30)),
			data: {
				regroup: false,
				repair: 60,
				count: -1,
			},
			templates: [ cTempl.sptwin2eflamdw, cTempl.spmhmgdw, cTempl.splcandw, cTempl.splpoddw ] // Drift wheels
		},
		"spamFactory3": {
			assembly: "spamAssembly3",
			order: CAM_ORDER_ATTACK,
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(35)),
			data: {
				regroup: false,
				count: -1,
			},
			templates: [ cTempl.spbigmg, cTempl.spminimg, cTempl.spminimg, cTempl.splneedlew, cTempl.spminimg, cTempl.spminimg, cTempl.splcanw, cTempl.spminimg ] // Mostly light units with an occasional Big Machinegun
		},
		"spamCybFactory1": {
			assembly: "spamCybAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(25)),
			data: {
				regroup: false,
				count: -1,
			},
			templates: [ cTempl.spcybspy, cTempl.spcybspy, cTempl.spcybneedle, cTempl.spcybspy ] // Spy Cyborgs (and some Needlers)
		},
		"spamCybFactory2": {
			assembly: "spamCybAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(35)),
			data: {
				regroup: false,
				repair: 40,
				count: -1,
			},
			templates: [ cTempl.spcybpod, cTempl.spcybpod, cTempl.spcybspy, cTempl.spcybpod ] // Many-Rocket Cyborgs (and Spies)
		},
		"spamCybFactory3": {
			assembly: "spamCybAssembly3",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			data: {
				regroup: true,
				repair: 40,
				count: -1,
			},
			templates: [ cTempl.spcybcan, cTempl.spcybspy ] // "Light" Cannons and Spies
		},
		"spamCybFactory4": {
			assembly: "spamCybAssembly4",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			data: {
				regroup: true,
				repair: 40,
				count: -1,
			},
			templates: [ cTempl.spcybneedle ] // Needler Cyborgs only
		},
		"spamNormFactory1": {
			assembly: "spamNormAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(35)),
			data: {
				regroup: false,
				count: -1,
			},
			templates: [ cTempl.spminimgnw, cTempl.spminimgnw, cTempl.splneedlenw, cTempl.spminimgnw, cTempl.spminimgnw, cTempl.spmanvilnw ] // Light stuff with the occasional Anvil
		},
	});

	startedFromMenu = false;
	//Only if starting Gamma directly rather than going through Beta
	if (enumDroid(CAM_HUMAN_PLAYER, DROID_SUPERTRANSPORTER).length === 0)
	{
		startedFromMenu = true;
		setReinforcementTime(LZ_COMPROMISED_TIME);
		sendPlayerTransporter();
		setTimer("sendPlayerTransporter", camMinutesToMilliseconds(2));
	}
	else
	{
		setReinforcementTime(camMinutesToSeconds(2));
	}

	// Replace all boulder with explosives
	camUpgradeOnMapFeatures("Boulder1", "ExplosiveDrum");
	camUpgradeOnMapFeatures("Boulder2", "Pipis");

	// Make units funny
	camUpgradeOnMapTemplates(cTempl.crlmgw, cTempl.splmgw, SPAMTON);
	camUpgradeOnMapTemplates(cTempl.crcybmg, cTempl.spcybspy, SPAMTON);
	camUpgradeOnMapTemplates(cTempl.crtmgw, cTempl.spminimg, SPAMTON);

	// Make structures funny
	camUpgradeOnMapStructures("GuardTower4", "GuardTowerEH", SPAMTON);
	camUpgradeOnMapStructures("A0RepairCentre3", "A0RepairCentre1", SPAMTON);
	camUpgradeOnMapStructures("X-Super-Cannon", "Pillbox-Big", SPAMTON);

	queue("spamAmbush1", camSecondsToMilliseconds(35)); // Also sets up patrols
	queue("spamAmbush2", camSecondsToMilliseconds(65)); // Also activates the first two factories
	queue("activateFirstFactories", camChangeOnDiff(camMinutesToMilliseconds(3))); // North cyborgs and central factory
	queue("activateSecondFactories", camChangeOnDiff(camMinutesToMilliseconds(7))); // Drift wheels, normal wheels and more cyborgs
	queue("activateFinalFactories", camChangeOnDiff(camMinutesToMilliseconds(11))); // Everything else
}
