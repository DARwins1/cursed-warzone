include("script/campaign/transitionTech.js");
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

var transporterIndex; //Number of bonus transports that have flown in.
var startedFromMenu;
var dialogueIndex;

// Changing the player's colour only updates playerData after save-loading or level progression.
var playerColour;

// Enable factories in bases if the player enters them early
// camAreaEvent("spamBase1", function(droid)
// {
// 	if (droid.player === CAM_HUMAN_PLAYER)
// 	{
// 		camEnableFactory("spamCybFactory1");
// 	}
// 	else
// 	{
// 		resetLabel("spamBase1", CAM_HUMAN_PLAYER);
// 	}
// });

// camAreaEvent("spamBase2", function(droid)
// {
// 	if (droid.player === CAM_HUMAN_PLAYER)
// 	{
// 		camEnableFactory("spamNormFactory1");
// 		camEnableFactory("spamCybFactory4");
// 	}
// 	else
// 	{
// 		resetLabel("spamBase2", CAM_HUMAN_PLAYER);
// 	}
// });

// camAreaEvent("spamBase3", function(droid)
// {
// 	if (droid.player === CAM_HUMAN_PLAYER)
// 	{
// 		camEnableFactory("spamFactory1");
// 		camEnableFactory("spamFactory2");
// 		camEnableFactory("spamCybFactory2");
// 	}
// 	else
// 	{
// 		resetLabel("spamBase3", CAM_HUMAN_PLAYER);
// 	}
// });

// camAreaEvent("spamBase4", function(droid)
// {
// 	if (droid.player === CAM_HUMAN_PLAYER)
// 	{
// 		camEnableFactory("spamFactory3");
// 		camEnableFactory("spamCybFactory3");
// 	}
// 	else
// 	{
// 		resetLabel("spamBase4", CAM_HUMAN_PLAYER);
// 	}
// });

// Play dialogue when bases are eradicated...
function camEnemyBaseEliminated_spamNBase()
{
	spamtonDialogue();
}

function camEnemyBaseEliminated_spamEBase()
{
	spamtonDialogue();
}

function camEnemyBaseEliminated_spamSEBase()
{
	spamtonDialogue();
}

function camEnemyBaseEliminated_spamSWBase()
{
	spamtonDialogue();
}

function camEnemyBaseEliminated_spamNEBase()
{
	spamtonDialogue();
}

function camEnemyBaseEliminated_spamAABase()
{
	spamtonDialogue();
}

function spamtonDialogue()
{
	dialogueIndex++;
	switch (dialogueIndex)
	{
		case 1:
			camQueueDialogues([
				{text: "SPAMTON: DID YOU COME 4LL THIS WAY JUST FOR AN [Autograph] ???", delay: camSecondsToMilliseconds(3), sound: camSounds.spamton.talk2},
				{text: "SPAMTON: WOW!!!", delay: camSecondsToMilliseconds(6), sound: camSounds.spamton.talk1},
				{text: "SPAMTON: YOU COULD HAVE JUST [[ClIck HERe fOR FrEe m0ney!!!]]", delay: camSecondsToMilliseconds(9), sound: camSounds.spamton.talk2},
				{text: "SPAMTON: AND I WOULD HAVE [Accept the Terms of Service?]", delay: camSecondsToMilliseconds(12), sound: camSounds.spamton.talk2},
			]);
			break;
		case 2:
			camQueueDialogues([
				{text: "SPAMTON: WHAT HAPPENED?!", delay: camSecondsToMilliseconds(3), sound: camSounds.spamton.talk1},
				{text: "SPAMTON: YOU WERE MY [Esteemed Customer],", delay: camSecondsToMilliseconds(6), sound: camSounds.spamton.talk2},
				{text: "SPAMTON: AND I W4S YOUR [[person who gets all the money]]", delay: camSecondsToMilliseconds(9), sound: camSounds.spamton.talk2},
				{text: "SPAMTON: I TH0UGHT WEHAD SOMETHING [Specil]!!!", delay: camSecondsToMilliseconds(12), sound: camSounds.spamton.talk2},
			]);
			break;
		case 3:
			camQueueDialogues([
				{text: "SPAMTON: WAIT!!!", delay: camSecondsToMilliseconds(3), sound: camSounds.spamton.talk1},
				{text: "SPAMTON: IF YOU [Go Back] RIGHT NOW", delay: camSecondsToMilliseconds(6), sound: camSounds.spamton.talk1},
				{text: "SPAMTON: I CAN GIVE YOU [[Machinegun 2]] FOr [[A LimiTed Time Only!]]!!!", delay: camSecondsToMilliseconds(9), sound: camSounds.spamton.talk2},
				{text: "SPAMTON: AND IF YOU [Order Now], I'LL ALSO INCLUDE A [Commemorative] P4IR OF", delay: camSecondsToMilliseconds(12), sound: camSounds.spamton.talk2},
				{text: "[Big Shot Glasses] AND [Big Shot Face Paint]!", delay: camSecondsToMilliseconds(12.1)},
			]);
			break;
		case 4:
			camQueueDialogues([
				{text: "SPAMTON: HEY!1!", delay: camSecondsToMilliseconds(3), sound: camSounds.spamton.talk1},
				{text: "SPAMTON: WHY ARE YOU STILL [BreaKing] MY [Furniture]?!?", delay: camSecondsToMilliseconds(6), sound: camSounds.spamton.talk2},
				{text: "SPAMTON: I ALREADY [Offered] YOU [[Hyperlink Blocked]]", delay: camSecondsToMilliseconds(9), sound: camSounds.spamton.talk2},
				{text: "SPAMTON: SO STOP [Eating us out of house and home!]!!", delay: camSecondsToMilliseconds(12), sound: camSounds.spamton.talk2},
			]);
			break;
	}
}

function setUnitRank(transport)
{
	const droidEXP = [128, 64, 32, 16];
	const droids = enumCargo(transport);

	for (let i = 0, len = droids.length; i < len; ++i)
	{
		const droid = droids[i];
		if (!camIsSystemDroid(droid))
		{
			setDroidExperience(droid, droidEXP[transporterIndex - 1]);
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

	let droids = [];
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
		const list = [
			cTempl.crmbb2ht, cTempl.crtwinhmgcanht, cTempl.crcybpod, cTempl.crtwinscorchpodht,
			cTempl.crcybbb, cTempl.crcybcan, cTempl.crcybfirew, cTempl.crcybcool
		];

		for (let i = 0; i < 10; ++i)
		{
			droids.push(list[camRand(list.length)]);
		}
	}

	camSendReinforcement(CAM_HUMAN_PLAYER, camMakePos("landingZone"), droids,
		CAM_REINFORCE_TRANSPORT, {
			entry: {x: 5, y: 73},
			exit: {x: 5, y: 73}
		}
	);

	transporterIndex += 1;
}

//Gives starting tech and research.
function cam3Setup()
{
	const mis_spamtonRes = [
		"R-Wpn-MG-Damage02", "R-Vehicle-Metals01", "R-Cyborg-Metals01",
		"R-Defense-WallUpgrade02", "R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage02",
		"R-Wpn-Cannon-Damage01", "R-Wpn-MG-ROF01", "R-Struc-RprFac-Upgrade01",
		"R-Wpn-RocketSlow-Damage01",
	];

	for (let x = 0, l = mis_structsAlpha.length; x < l; ++x)
	{
		enableStructure(mis_structsAlpha[x], CAM_HUMAN_PLAYER);
	}

	camCompleteRequiredResearch(mis_alphaResearchNew, CAM_HUMAN_PLAYER);
	camCompleteRequiredResearch(mis_betaResearchNew, CAM_HUMAN_PLAYER);
	camCompleteRequiredResearch(mis_spamtonRes, CAM_SPAMTON);
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

	camQueueDialogues([
		{text: "SPAMTON: CAN'T YOU [Respect] [Squatter's Rights] ???", delay: camSecondsToMilliseconds(40), sound: camSounds.spamton.talk2},
		{text: "SPAMTON: THAT\"S NOT VERY [Big Shot] OF YOU, COMMANDER", delay: camSecondsToMilliseconds(43), sound: camSounds.spamton.talk2},
	]);
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

	if (colour === 6)
	{
		changePlayerColour(CAM_SPAMTON, 8); // Switch to yellow
	}
	else
	{
		changePlayerColour(CAM_SPAMTON, 6); // Keep as pink
	}

	playSound("beep6.ogg");
}

function eventStartLevel()
{
	const startpos = camMakePos(getObject("landingZone"));
	const lz = getObject("landingZone");

	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "NO_DONT_STEAL_MY_");
	setMissionTime(camChangeOnDiff(camHoursToSeconds(1.25)));

	dialogueIndex = 0;

	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(5, 73, CAM_HUMAN_PLAYER);
	setTransporterExit(5, 73, CAM_HUMAN_PLAYER);

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
		changePlayerColour(CAM_MOBS, 5); // Switch to blue
	}
	else
	{
		changePlayerColour(CAM_MOBS, 4); // Keep as red
	}

	if (playerColour === 6)
	{
		changePlayerColour(CAM_SPAMTON, 8); // Switch to yellow
	}
	else
	{
		changePlayerColour(CAM_SPAMTON, 6); // Keep as pink
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

	camPlayVideos({video: "GAMMA_INTRO", type: CAMP_MSG});

	camSetEnemyBases({
		"spamNBase": {
			cleanup: "spamBase1",
			detectMsg: "CM3A_BASE1",
			detectSnd: camSounds.project.enemyBase,
			eliminateSnd: camSounds.project.enemyBaseErad,
		},
		"spamEBase": {
			cleanup: "spamBase2",
			detectMsg: "CM3A_BASE2",
			detectSnd: camSounds.project.enemyBase,
			eliminateSnd: camSounds.project.enemyBaseErad,
		},
		"spamSEBase": {
			cleanup: "spamBase3",
			detectMsg: "CM3A_BASE3",
			detectSnd: camSounds.project.enemyBase,
			eliminateSnd: camSounds.project.enemyBaseErad,
		},
		"spamSWBase": {
			cleanup: "spamBase4",
			detectMsg: "CM3A_BASE4",
			detectSnd: camSounds.project.enemyBase,
			eliminateSnd: camSounds.project.enemyBaseErad,
		},
		"spamAABase": {
			cleanup: "spamBase5",
			detectMsg: "CM3A_BASE5",
			detectSnd: camSounds.project.enemyBase,
			eliminateSnd: camSounds.project.enemyBaseErad,
		},
		"spamNEBase": {
			cleanup: "spamBase6",
			detectMsg: "CM3A_BASE6",
			detectSnd: camSounds.project.enemyBase,
			eliminateSnd: camSounds.project.enemyBaseErad,
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

	// Replace all boulders with explosives
	camUpgradeOnMapFeatures("Boulder1", "ExplosiveDrum");
	camUpgradeOnMapFeatures("Boulder2", "Pipis");

	// Make units funny
	camUpgradeOnMapTemplates(cTempl.crlmgw, cTempl.splmgw, CAM_SPAMTON);
	camUpgradeOnMapTemplates(cTempl.crcybmg, cTempl.spcybspy, CAM_SPAMTON);
	camUpgradeOnMapTemplates(cTempl.crcybneedle, cTempl.spcybneedle, CAM_SPAMTON);
	camUpgradeOnMapTemplates(cTempl.crtmgw, cTempl.spminimg, CAM_SPAMTON);

	// Make structures funny
	camUpgradeOnMapStructures("GuardTower4", "GuardTowerEH", CAM_SPAMTON);
	camUpgradeOnMapStructures("A0RepairCentre3", "A0RepairCentre2", CAM_SPAMTON);
	camUpgradeOnMapStructures("X-Super-Cannon", "Pillbox-Big", CAM_SPAMTON);

	queue("spamAmbush1", camSecondsToMilliseconds(35)); // Also sets up patrols
	camQueueDialogues([
		{text: "SPAMTON: HEY !!!!", delay: camSecondsToMilliseconds(26), sound: camSounds.spamton.talk1},
		{text: "SPAMTON: [Water] YOU DOING HERE !?!", delay: camSecondsToMilliseconds(29), sound: camSounds.spamton.talk1},
		{text: "SPAMTON: [Attention Customers! Clean up on Aisle 3!]", delay: camSecondsToMilliseconds(32), sound: camSounds.spamton.talk2},
		{text: "SPAMTON: SOMEONE LET [The Dogs] IN !!!", delay: camSecondsToMilliseconds(35), sound: camSounds.spamton.talk1},
	]);
	queue("spamAmbush2", camSecondsToMilliseconds(65));
	queue("activateFirstFactories", camChangeOnDiff(camMinutesToMilliseconds(3))); // North cyborgs and central factory
	queue("activateSecondFactories", camChangeOnDiff(camMinutesToMilliseconds(7))); // Drift wheels, normal wheels and more cyborgs
	queue("activateFinalFactories", camChangeOnDiff(camMinutesToMilliseconds(11))); // Everything else
}
