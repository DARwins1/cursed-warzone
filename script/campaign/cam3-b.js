include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/transitionTech.js");

const SILOS = 1; // Owns the Missile Silos until captured by the player.
const SPAMTON_RES = [
	"R-Wpn-MG-Damage02", "R-Vehicle-Metals02", "R-Cyborg-Metals02",
	"R-Defense-WallUpgrade02", "R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage02",
	"R-Wpn-Cannon-Damage01", "R-Wpn-MG-ROF01", "R-Struc-RprFac-Upgrade01",
	"R-Wpn-RocketSlow-Damage01", "R-Wpn-Flamer-ROF01",
];
const BLASTER_LIMITS = [ 80, 112, 147, 200 ]; // How far east the blaster can travel, increases with each missile code researched
var defensePhase; // Whether the defense stage of the mission has begun
var codeCount; // How many missile codes have been researched in the defense phase
var failure; // Whether the player has fallen for a little tomfoolery (or ran out of time)
var blasterX; // How far east the blaster zone has expanded
var blasterTargets;
var markedTiles;
var defenseTime; // The game time when the defense phase started

// Enable factories in bases if the player enters them early
camAreaEvent("spamBase1", function(droid)
{
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		camEnableFactory("spamFactory1");
		camEnableFactory("spamCybFactory1");
		camEnableFactory("spamCybFactory2");
	}
	else
	{
		resetLabel("spamBase1", CAM_HUMAN_PLAYER);
	}
});

camAreaEvent("spamBase2", function(droid)
{
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		camEnableFactory("spamNormFactory1");
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
		camEnableFactory("spamFactory2");
		camEnableFactory("spamCybFactory3");
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
	}
	else
	{
		resetLabel("spamBase4", CAM_HUMAN_PLAYER);
	}
});

camAreaEvent("spamBase5", function(droid)
{
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		camEnableFactory("spamFactory4");
		camEnableFactory("spamCybFactory4");
	}
	else
	{
		resetLabel("spamBase5", CAM_HUMAN_PLAYER);
	}
});

//Remove Spamton Normal droids.
camAreaEvent("normalRemoveZone", function(droid)
{
	if (droid.player !== CAM_HUMAN_PLAYER)
	{
		if (isVTOL(droid))
		{
			camSafeRemoveObject(droid, false);
		}
	}

	resetLabel("normalRemoveZone", SPAMTON);
});

// Set up ambush and patrol groups
function setupMapGroups()
{
	// Patrols...
	camManageGroup(camMakeGroup("spamPatrolGroup1"), CAM_ORDER_PATROL, {
		pos: [ "spamPatrolPos1", "spamPatrolPos2" ],
		interval: camSecondsToMilliseconds(25),
		repair: 40
	});

	camManageGroup(camMakeGroup("spamPatrolGroup2"), CAM_ORDER_PATROL, {
		pos: [ "spamPatrolPos3", "spamPatrolPos4" ],
		interval: camSecondsToMilliseconds(25),
		repair: 40
	});

	// Ambushes...
	camManageGroup(camMakeGroup("spamAmbushGroup1"), CAM_ORDER_ATTACK, {
		repair: 40
	});

	camManageGroup(camMakeGroup("spamAmbushGroup2"), CAM_ORDER_ATTACK, {
		repair: 40
	});
}

// Activate the Bison and Mini factories
function activateFirstFactories()
{
	camEnableFactory("spamFactory4");
	camEnableFactory("spamCybFactory4");
	camEnableFactory("spamFactory3");
}

// Activate the Drift, Normal, and north Cyborg factory
function activateSecondFactories()
{
	camEnableFactory("spamFactory2");
	camEnableFactory("spamCybFactory3");
	camEnableFactory("spamNormFactory1");
}

// Activate the factories around the silos
function activateFinalFactories()
{
	camEnableFactory("spamFactory1");
	camEnableFactory("spamCybFactory2");
	camEnableFactory("spamCybFactory1");
}

function camEnemyBaseEliminated_spamSiloBase()
{
	camCallOnce("startDefensePhase");
}

function startDefensePhase()
{
	defensePhase = true;
	setMissionTime(-1); // Get rid of the mission timer
	// Let the player start researching the missile codes
	enableResearch("R-Comp-MissileCodes01", CAM_HUMAN_PLAYER);
	setTimer("sendSpamtonGroundWave", camChangeOnDiff(camSecondsToMilliseconds(30)));
	defenseTime = gameTime;
	camAbsorbPlayer(SILOS, CAM_HUMAN_PLAYER); // Give silos to the player

	var lz2 = getObject("landingZone2");
	setNoGoArea(lz2.x, lz2.y, lz2.x2, lz2.y2, CAM_HUMAN_PLAYER);

	hackRemoveMessage("CM3B_SILOS", PROX_MSG, CAM_HUMAN_PLAYER);
}

// Progress the defense phase on missile code research
// Or game over the player on funny research
function eventResearched(research, structure, player)
{
	if (research.name.substring(0, 12) === "R-Comp-Death") // e.g. "R-Comp-Death01"
	{
		// Fire the blaster at every player object and then trigger a game over
		let objects = enumDroid(CAM_HUMAN_PLAYER).concat(enumStruct(CAM_HUMAN_PLAYER));
		for (let i = 0; i < objects.length; i++)
		{
			fireWeaponAtObj("LasSat", objects[i], SPAMTON);
		}
		failure = true;
	}
	else if (research.name.substring(0, 19) === "R-Comp-MissileCodes") // e.g. "R-Comp-MissileCodes01"
	{
		codeCount++;

		// Missile code logic
		if (codeCount === 1) 
		{
			// 3 total funnies
			enableResearch("R-Comp-Death02", CAM_HUMAN_PLAYER);
			enableResearch("R-Comp-Death03", CAM_HUMAN_PLAYER);
			camPlayVideos({video: "MB3_B_MSG4", type: CAMP_MSG});
			removeTimer("sendSpamtonGroundWave");
			setTimer("sendSpamtonGroundWave", camChangeOnDiff(camSecondsToMilliseconds(40)));
			// TODO: Start sending normal units here
			const normList = [cTempl.spmanvilnw, cTempl.sptwin2lcannw, cTempl.spmhmgnw, cTempl.splbisonnw, cTempl.sptwin2podnw];
			camSetVtolData(SPAMTON, ["normalSpawn1", "normalSpawn2"], "normalRemovePos", normList, camChangeOnDiff(camMinutesToMilliseconds(1.5)), {
				minVTOLs: 3,
				maxRandomVTOLs: 2,
			});
		}
		else if (codeCount === 2) 
		{
			// 6 total funnies
			enableResearch("R-Comp-Death04", CAM_HUMAN_PLAYER);
			enableResearch("R-Comp-Death05", CAM_HUMAN_PLAYER);
			enableResearch("R-Comp-Death06", CAM_HUMAN_PLAYER);
			camPlayVideos({video: "MB3_B_MSG5", type: CAMP_MSG});
			// Ground wave come at the same rate, but are a bit tougher
			// Start sending Anvils
			const normList = [cTempl.spmanvilnw, cTempl.spminimgnw, cTempl.spminimgnw, cTempl.spminimgnw, cTempl.spminimgnw, cTempl.spminimgnw, cTempl.spminimgnw];
			camSetVtolData(SPAMTON, ["normalSpawn1", "normalSpawn2"], "normalRemovePos", normList, camChangeOnDiff(camMinutesToMilliseconds(2)), {
				minVTOLs: 8,
				maxRandomVTOLs: 0,
			});
		}
		else if (codeCount === 3) 
		{
			// 12 total funnies (one whole page)
			enableResearch("R-Comp-Death07", CAM_HUMAN_PLAYER);
			enableResearch("R-Comp-Death08", CAM_HUMAN_PLAYER);
			enableResearch("R-Comp-Death09", CAM_HUMAN_PLAYER);
			enableResearch("R-Comp-Death10", CAM_HUMAN_PLAYER);
			enableResearch("R-Comp-Death11", CAM_HUMAN_PLAYER);
			enableResearch("R-Comp-Death12", CAM_HUMAN_PLAYER);

			// Just go absolutely nuts
			playSound("pcv447.ogg"); // Spamton creepy laugh
			setTimer("blasterFrenzy", camSecondsToMilliseconds(0.2));
			removeTimer("sendSpamtonGroundWave");
			setTimer("sendSpamtonGroundWave", camChangeOnDiff(camSecondsToMilliseconds(3)));
			camSetVtolSpawnStateAll(false);
			camSetVtolData(SPAMTON, undefined, "normalRemovePos", [cTempl.spminimgnw], camSecondsToMilliseconds(3), {
				minVTOLs: 12,
				maxRandomVTOLs: 4,
			});
		}
		else if (codeCount === 4)
		{
			camPlayVideos({video: "MB3_B_MSG6", type: CAMP_MSG}); // Missile launch video
		}
	}
}

// Send off-map attack groups against the player
function sendSpamtonGroundWave()
{
	/*
		(The first 3 missile codes take about 8 minutes to research (24 minutes total))
		NW spawn is active immediately
		SW spawn is active after ~6 minutes
		NE spawn is active after ~12 minutes
		SE spawn is active after ~16 minutes
		East spawn is active after ~20 minutes
	*/
	const spawn1 = camMakePos("spamSpawn1");
	const spawn2 = camMakePos("spamSpawn2");
	const spawn3 = camMakePos("spamSpawn3");
	const spawn4 = camMakePos("spamSpawn4");
	const spawn5 = camMakePos("spamSpawn5");

	// NW spawn
	camSendReinforcement(SPAMTON, spawn1, chooseSpamtonGroundUnits(), CAM_REINFORCE_GROUND);
	// Add a Pipis Truck if there's not enough on the map
	if (notEnoughPipisTrucks())
	{
		let tTemp = getPipisTruckTemplate();
		addDroid(SPAMTON, spawn1.x, spawn1.y, _("Pipis Truck"), tTemp.body, tTemp.prop, "", "", "Spade1Mk1Spam");
	}

	// SW spawn
	if (gameTime >= defenseTime + camChangeOnDiff(camMinutesToMilliseconds(6)))
	{
		camSendReinforcement(SPAMTON, spawn2, chooseSpamtonGroundUnits(), CAM_REINFORCE_GROUND);
		if (notEnoughPipisTrucks())
		{
			let tTemp = getPipisTruckTemplate();
			addDroid(SPAMTON, spawn2.x, spawn2.y, _("Pipis Truck"), tTemp.body, tTemp.prop, "", "", "Spade1Mk1Spam");
		}
	}

	// NE spawn
	if (gameTime >= defenseTime + camChangeOnDiff(camMinutesToMilliseconds(12)))
	{
		camSendReinforcement(SPAMTON, spawn3, chooseSpamtonGroundUnits(), CAM_REINFORCE_GROUND);
		if (notEnoughPipisTrucks())
		{
			let tTemp = getPipisTruckTemplate();
			addDroid(SPAMTON, spawn3.x, spawn3.y, _("Pipis Truck"), tTemp.body, tTemp.prop, "", "", "Spade1Mk1Spam");
		}
	}

	// SE spawn
	if (gameTime >= defenseTime + camChangeOnDiff(camMinutesToMilliseconds(16)))
	{
		camSendReinforcement(SPAMTON, spawn4, chooseSpamtonGroundUnits(), CAM_REINFORCE_GROUND);
		if (notEnoughPipisTrucks())
		{
			let tTemp = getPipisTruckTemplate();
			addDroid(SPAMTON, spawn4.x, spawn4.y, _("Pipis Truck"), tTemp.body, tTemp.prop, "", "", "Spade1Mk1Spam");
		}
	}

	// East spawn
	if (gameTime >= defenseTime + camChangeOnDiff(camMinutesToMilliseconds(20)))
	{
		camSendReinforcement(SPAMTON, spawn5, chooseSpamtonGroundUnits(), CAM_REINFORCE_GROUND);
		if (notEnoughPipisTrucks())
		{
			let tTemp = getPipisTruckTemplate();
			addDroid(SPAMTON, spawn5.x, spawn5.y, _("Pipis Truck"), tTemp.body, tTemp.prop, "", "", "Spade1Mk1Spam");
		}
	}
}

// Choose units to send in ground attack waves
function chooseSpamtonGroundUnits()
{
	let mainTemplates = []; // Mandatory units in an attack group
	let supportTemplates = []; // Randomly chosen units in an attack group
	let supportSize = 0; // Amount of randomly chosen support units
	// NOTE: Some groups may only have "support" units

	switch (codeCount)
	{
		case 0:
			// Various heavy units with Mini MG escorts
			supportTemplates = [cTempl.spminimg];
			supportSize = 4 + difficulty;
			if (difficulty >= HARD || gameTime >= defenseTime + camChangeOnDiff(camMinutesToMilliseconds(3)))
			{
				let temps = [
					cTempl.sphhflamht, cTempl.sphhbb3ht, cTempl.sphlinkht
				];
				if (difficulty >= HARD) temps.push(cTempl.spbigmg);
				mainTemplates.push(temps[camRand(temps.length)]);
			}
			break;
		case 1:
		case 2:
			// Various units
			let groupTypes = [
				"bisons", "spies", "heavyCan", "drift",
				"rockets",
			];
			if (codeCount === 2) groupTypes.push("bunkerBuster", "minis", "flamers");

			switch (groupTypes[camRand(groupTypes.length)])
			{
				case "bisons":
					// All Righteous Bisons
					if (codeCount === 2 || difficulty >= HARD) mainTemplates = [cTempl.sptrip3bisonht];
					supportTemplates = [cTempl.spcybbison, cTempl.splbisonht, cTempl.spmbisonht, cTempl.sptwin2bisonht];
					supportSize = 6 + difficulty;
					break;
				case "spies":
					// Spy Cyborg (and friends)
					if (codeCount === 2 || difficulty >= HARD) mainTemplates = [cTempl.sphlinkht];
					supportTemplates = [cTempl.spcybspy, cTempl.spcybspy, cTempl.spcybspy, cTempl.spcybbison];
					supportSize = 6 + difficulty;
					break;
				case "heavyCan":
					// One Very Heavy Cannon and some escorts
					mainTemplates = [cTempl.sphhcant];
					if (codeCount === 2 || difficulty >= HARD) mainTemplates.push(cTempl.sphmcant, cTempl.sphmcant);
					supportTemplates = [cTempl.spcybcan, cTempl.spmlcanht, cTempl.spcybcan];
					if (codeCount === 2 || difficulty >= HARD) supportTemplates.push(cTempl.sptwinlcanhmght);
					supportSize = 3 + difficulty;
					break;
				case "drift":
					// Slip'n sliders
					if (codeCount === 1 || camRand(2) === 0)
					{
						if (codeCount === 2 || difficulty >= HARD) mainTemplates = [cTempl.sptriplcan2hmgdw];
						supportTemplates = [cTempl.spleflamdw, cTempl.spmbisondw, cTempl.spmhmgdw, cTempl.sptwinlcanhmgdw];
						supportSize = 6 + difficulty;
					}
					else
					{
						// All Fungible Cannons
						supportTemplates = [cTempl.sphmcandw];
						supportSize = 4 + difficulty;
					}
					break;
				case "rockets":
					// Many-Rocket spam
					if (codeCount === 2 || difficulty >= HARD) mainTemplates = [cTempl.sphmonow];
					supportTemplates = [cTempl.spcybpod, cTempl.sptwin2podht, cTempl.spmpodht];
					supportSize = 5 + difficulty;
					break;
				case "bunkerBuster":
					// Bunker Buster III with escorts
					mainTemplates = [cTempl.sphhbb3ht];
					if (difficulty === INSANE) mainTemplates.push(cTempl.sphhbb3ht);
					supportTemplates = [cTempl.spcybneedle, cTempl.splneedleht, cTempl.spcybneedle];
					if (codeCount === 2 || difficulty >= HARD) supportTemplates.push(cTempl.sptwinneedlereflamht);
					supportSize = 3 + difficulty;
					break;
				case "minis":
					// One Big Machinegun escorted by a bunch of Mini MGs
					mainTemplates = [cTempl.spbigmg];
					supportTemplates = [cTempl.spminimg];
					supportSize = 12 + difficulty;
					break;
				case "flamers":
					// Extended and Excessive Flamers
					mainTemplates = [cTempl.sphhflamht, cTempl.spscybflame, cTempl.spscybflame];
					if (difficulty === INSANE) mainTemplates.push(cTempl.sphhflamht);
					supportTemplates = [cTempl.spleflamht, cTempl.sptwin2eflamht, cTempl.spleflamht];
					if (difficulty >= HARD) supportTemplates.push(cTempl.sptrip3eflamht);
					supportSize = 2 + difficulty;
					break;
			}
			break;
		case 3:
			// Just Mini MGs
			supportTemplates = [cTempl.spminimg];
			supportSize = 12 + (difficulty * 2);
			break;
		default:
			break;
	}

	let list = mainTemplates;
	for (let i = 0; i < supportSize; i++)
	{
		// Add a random support unit
		list.push(supportTemplates[camRand(supportTemplates.length)]);
	}

	return list;
}

// Returns true if an additional Pipis Truck should be deployed
function notEnoughPipisTrucks()
{
	const truckCount = countDroid(DROID_CONSTRUCT, SPAMTON);
	const truckGoal = (codeCount * 2 + difficulty - 2); // Increases by 2 per missile code, +/- on difficulties
	if (codeCount > 0 && truckCount < truckGoal)
	{
		return true; // MORE Trucks !!!
	}
	return false; // Satisfactory amount of Trucks
}

// Returns a body and propulsion for a new Pipis Truck, which can vary on difficulty and progression
function getPipisTruckTemplate()
{
	let body = "Body1RECSpam"; // Spamaconda (Reskinned Viper)
	let prop = "wheeled01"; // Wheels

	if (difficulty + codeCount >= 5)
	{
		body = "Body5RECSpam"; // Spamaconda II
	}
	if (difficulty + codeCount >= 4)
	{
		if (camRand(3) !== 0)
		{
			prop = "HalfTrack"; // Half-wheels
		}
		else
		{
			prop = "wheeledskiddy"; // Chance of Drift Wheels
		}
	}

	return {body: body, prop: prop};
}

// Expand the blaster zone further east
function advanceBlasterZone()
{
	if (codeCount < 4 && blasterX < BLASTER_LIMITS[codeCount])
	{
		// TODO: Values may need to change after Gamma 5 map is done
		unmarkTiles(blasterX - 1, 0, blasterX, 64);
		blasterX++;
		markTiles(blasterX - 1, 0, blasterX, 64);
	}
}

// See if any player object is within the blaster zone. If there is, set up an attack pattern
function scanBlasterZone()
{
	// TODO: Values may need to change after Gamma 5 map is done
	let targets = enumArea(0, 0, blasterX, 64, ALL_PLAYERS, false).filter((obj) => (obj.type !== FEATURE && obj.player !== SPAMTON));
	let target;
	if (targets.length > 0)
	{
		var dr = targets.filter((obj) => (obj.type === DROID && !isVTOL(obj)));
		var vt = targets.filter((obj) => (obj.type === DROID && isVTOL(obj)));
		var st = targets.filter((obj) => (obj.type === STRUCTURE));

		if (dr.length)
		{
			target = dr[0];
		}
		if (vt.length && (camRand(100) < 15))
		{
			target = vt[0]; // Don't care about flyers as much
		}
		if (st.length && !camRand(2)) // Chance to focus on a structure
		{
			target = st[0];
		}
	}

	if (camDef(target) && codeCount < 4)
	{
		// Blast the target's coordinates
		randomBlasterPattern(target.x, target.y);
	}
}

// Choose a random excessive blaster attack pattern to bombard the target area with
function randomBlasterPattern(x, y)
{
	let blasterPatterns = [
		"cross", "crossDiagonal", "circle", "square",
	];
	const pd = camChangeOnDiff(4); // How long until the blaster starts firing (pattern delay)
	const bd = 0.1; // Standard delay between blasts in a pattern (blast delay)

	// Choose a random pattern
	switch (blasterPatterns[camRand(blasterPatterns.length)])
	{
		case "cross":
			// '+' shaped pattern
			// Vertical line
			setBlasterTarget(camMakePos(x, y - 4), pd);
			setBlasterTarget(camMakePos(x, y - 2), pd + (bd * 1));
			setBlasterTarget(camMakePos(x, y + 0), pd + (bd * 2));
			setBlasterTarget(camMakePos(x, y + 2), pd + (bd * 3));
			setBlasterTarget(camMakePos(x, y + 4), pd + (bd * 4));
			// Horizontal line
			setBlasterTarget(camMakePos(x - 4, y), pd + 2);
			setBlasterTarget(camMakePos(x - 2, y), pd + (bd * 1) + 2);
			setBlasterTarget(camMakePos(x + 0, y), pd + (bd * 2) + 2);
			setBlasterTarget(camMakePos(x + 2, y), pd + (bd * 3) + 2);
			setBlasterTarget(camMakePos(x + 4, y), pd + (bd * 4) + 2);
			break;
		case "crossDiagonal":
			// 'X' shaped pattern
			// Top-left to bottom-right line
			setBlasterTarget(camMakePos(x - 4, y - 4), pd);
			setBlasterTarget(camMakePos(x - 2, y - 2), pd + (bd * 1));
			setBlasterTarget(camMakePos(x + 0, y + 0), pd + (bd * 2));
			setBlasterTarget(camMakePos(x + 2, y + 2), pd + (bd * 3));
			setBlasterTarget(camMakePos(x + 4, y + 4), pd + (bd * 4));
			// Bottom-right to top-left line
			setBlasterTarget(camMakePos(x - 4, y + 4), pd + 2);
			setBlasterTarget(camMakePos(x - 2, y + 2), pd + (bd * 1) + 2);
			setBlasterTarget(camMakePos(x + 0, y + 0), pd + (bd * 2) + 2);
			setBlasterTarget(camMakePos(x + 2, y - 2), pd + (bd * 3) + 2);
			setBlasterTarget(camMakePos(x + 4, y - 4), pd + (bd * 4) + 2);
			break;
		case "circle":
			// Tight circle around the target
			setBlasterTarget(camMakePos(x - 3, y + 0), pd);
			setBlasterTarget(camMakePos(x - 1, y - 2), pd + (bd * 1));
			setBlasterTarget(camMakePos(x + 1, y - 2), pd + (bd * 2));
			setBlasterTarget(camMakePos(x + 3, y + 0), pd + (bd * 3));
			setBlasterTarget(camMakePos(x + 1, y + 2), pd + (bd * 4));
			setBlasterTarget(camMakePos(x - 1, y + 2), pd + (bd * 5));
			break;
		case "square":
			// Wide box around the target (and shots into the center)
			// Center shot 1
			setBlasterTarget(camMakePos(x, y), pd);
			// Left side (bottom to top)
			setBlasterTarget(camMakePos(x - 4, y + 4), pd + 2);
			setBlasterTarget(camMakePos(x - 4, y + 2), pd + (bd * 3) + 2);
			setBlasterTarget(camMakePos(x - 4, y + 0), pd + (bd * 6) + 2);
			setBlasterTarget(camMakePos(x - 4, y - 2), pd + (bd * 9) + 2);
			// Top side (left to right)
			setBlasterTarget(camMakePos(x - 4, y - 4), pd + 2);
			setBlasterTarget(camMakePos(x - 2, y - 4), pd + (bd * 3) + 2);
			setBlasterTarget(camMakePos(x + 0, y - 4), pd + (bd * 6) + 2);
			setBlasterTarget(camMakePos(x + 2, y - 4), pd + (bd * 9) + 2);
			// Right side (top to bottom)
			setBlasterTarget(camMakePos(x + 4, y - 4), pd + 2);
			setBlasterTarget(camMakePos(x + 4, y - 2), pd + (bd * 3) + 2);
			setBlasterTarget(camMakePos(x + 4, y + 0), pd + (bd * 6) + 2);
			setBlasterTarget(camMakePos(x + 4, y + 2), pd + (bd * 9) + 2);
			// Bottom side (right to left)
			setBlasterTarget(camMakePos(x + 4, y + 4), pd + 2);
			setBlasterTarget(camMakePos(x + 2, y + 4), pd + (bd * 3) + 2);
			setBlasterTarget(camMakePos(x + 0, y + 4), pd + (bd * 6) + 2);
			setBlasterTarget(camMakePos(x - 2, y + 4), pd + (bd * 9) + 2);
			// Center shot 2
			setBlasterTarget(camMakePos(x, y), pd + 5);
			break;
	}
}

// Mark a position that will blasted after a delay (in seconds)
function setBlasterTarget(pos, delay)
{
	// Make sure the coordinates are valid
	if (pos.x < 0 || pos.y < 0 || pos.x > mapWidth || pos.y > mapHeight)
	{
		return; // Coordinates are outside of the map
	}

	fireWeaponAtLoc("PipisDetonate", pos.x, pos.y, CAM_HUMAN_PLAYER);
	markTiles(pos.x, pos.y); // Visually mark the position ahead of time (as a warning to the player)
	blasterTargets.push({x: pos.x, y: pos.y, time: gameTime + camSecondsToMilliseconds(delay)});
}

// Fire the blaster at any valid targets
function fireBlaster()
{
	for (let i = blasterTargets.length - 1; i >= 0; i--)
	{
		if (gameTime >= blasterTargets[i].time)
		{
			fireWeaponAtLoc("LasSat", blasterTargets[i].x, blasterTargets[i].y, SPAMTON);
			unmarkTiles(blasterTargets[i].x, blasterTargets[i].y)
			blasterTargets.splice(i, 1); // Remove this target
		}
	}
}

// Start spam-queuing blaster shots around the missile silo area
function blasterFrenzy()
{
	let pos1 = camGenerateRandomMapCoordinateWithinRadius(camMakePos("spamBase1"), 22, 0);
	let pos2 = camGenerateRandomMapCoordinateWithinRadius(camMakePos("spamBase1"), 22, 0);

	// Relatively long delay to give the player a chance to react
	setBlasterTarget(pos1, camChangeOnDiff(10));
	setBlasterTarget(pos2, camChangeOnDiff(10));
}

// Visually mark positions or areas
// FIXME: This totally conflicts with debug mode's tile-marking system.
// There's definitely a way to make this neatly co-exist but I'm too lazy for that right now
function markTiles(x, y, x2, y2)
{
	markedTiles.push({x: x, y: y, x2: x2, y2: y2});

	if (camDef(x2))
	{
		hackMarkTiles(x, y, x2, y2); // Area
	}
	else
	{
		hackMarkTiles(x, y); // Position
	}
}

// Remove marked positions or areas
function unmarkTiles(x, y, x2, y2)
{
	for (let i = 0; i < markedTiles.length; i++)
	{
		let m = markedTiles[i];
		if (camDef(x2))
		{
			// Area
			if (m.x === x && m.y === y && m.x2 === x2 && m.y2 === y2)
			{
				markedTiles.splice(i, 1); // Remove this marking
				break;
			}
		}
		else
		{
			// Position
			if (m.x === x && m.y === y)
			{
				markedTiles.splice(i, 1); // Remove this marking
				break;
			}
		}
	}

	hackMarkTiles(); // Clear marked tiles

	// Re-mark all the remaining tiles
	for (let i = 0; i < markedTiles.length; i++)
	{
		let m = markedTiles[i];
		if (camDef(m.x2))
		{
			hackMarkTiles(m.x, m.y, m.x2, m.y2); // Area
		}
		else
		{
			hackMarkTiles(m.x, m.y); // Position
		}
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

// Fire a blaster cross centered on the player's LZ
function blastLZ()
{
	const lzPos = camMakePos(getObject("landingZone1"));
	const x = lzPos.x;
	const y = lzPos.y;

	// 'X' shaped pattern
	// Top-left to bottom-right line
	setBlasterTarget(camMakePos(x - 4, y - 4), 10);
	setBlasterTarget(camMakePos(x - 2, y - 2), 10 + (0.1 * 1));
	setBlasterTarget(camMakePos(x + 0, y + 0), 10 + (0.1 * 2));
	setBlasterTarget(camMakePos(x + 2, y + 2), 10 + (0.1 * 3));
	setBlasterTarget(camMakePos(x + 4, y + 4), 10 + (0.1 * 4));
	// Bottom-right to top-left line
	setBlasterTarget(camMakePos(x - 4, y + 4), 10 + 2);
	setBlasterTarget(camMakePos(x - 2, y + 2), 10 + (0.1 * 1) + 2);
	setBlasterTarget(camMakePos(x + 0, y + 0), 10 + (0.1 * 2) + 2);
	setBlasterTarget(camMakePos(x + 2, y - 2), 10 + (0.1 * 3) + 2);
	setBlasterTarget(camMakePos(x + 4, y - 4), 10 + (0.1 * 4) + 2);
}

// If the player runs out of time during the attack segment
function eventMissionTimeout()
{
	if (!defensePhase)
	{
		failure = true;
	}
}

function victoryCallback()
{
	if (!defensePhase)
	{
		camSetExtraObjectiveMessage(["Comandeer Spamton's missile silos", "Avoid getting blasted"]);
	}
	else if (defensePhase)
	{
		camSetExtraObjectiveMessage(["Defend the missile silos", "Avoid getting blasted"]);
	}

	if (failure || !countStruct("NX-ANTI-SATSite", ALL_PLAYERS))
	{
		return false; // Game over
	}

	if (codeCount >= 4)
	{
		return true; // Victory
	}
	
	return undefined;
}

function eventStartLevel()
{
	camSetExtraObjectiveMessage(_("Avoid getting blasted"));
	var startpos = camMakePos(getObject("landingZone1"));
	var lz = getObject("landingZone1");

	camSetStandardWinLossConditions(CAM_VICTORY_SCRIPTED, "BIG_SHOT", {
		callback: "victoryCallback"
	});
	setMissionTime(camChangeOnDiff(camMinutesToSeconds(60))); // For the attack phase.

	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);

	camCompleteRequiredResearch(SPAMTON_RES, SPAMTON);
	camCompleteRequiredResearch(SPAMTON_RES, SILOS);

	setAlliance(SILOS, CAM_HUMAN_PLAYER, true);
	setAlliance(SILOS, SPAMTON, true);

	defensePhase = false;
	codeCount = 0;
	failure = false;
	blasterX = 0;
	blasterTargets = [];
	markedTiles = [];

	camSetArtifacts({
		"spamFactory1": { tech: "R-Wpn-Rocket03-HvAT3" }, // Bunker Buster III
		"spamMonoEmp": { tech: "R-Wpn-Rocket02-MRL" }, // Mono-Rocket Array
		"spamFactory2": { tech: "R-Wpn-Rocket-ROF01" }, // Moar Rockets
	});

	camSetEnemyBases({
		"spamSiloBase": {
			cleanup: "spamBase1",
			detectMsg: "CM3B_BASE1",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"spamNormalBase": {
			cleanup: "spamBase2",
			detectMsg: "CM3B_BASE2",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"spamNorthBase": {
			cleanup: "spamBase3",
			detectMsg: "CM3B_BASE3",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"spamSouthBase": {
			cleanup: "spamBase4",
			detectMsg: "CM3B_BASE4",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"spamBisonBase": {
			cleanup: "spamBase5",
			detectMsg: "CM3B_BASE5",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		}
	});

	camSetFactories({
		"spamFactory1": {
			assembly: "spamAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(90)),
			data: {
				regroup: true,
				repair: 75,
				count: -1,
			},
			templates: [ cTempl.sphlinkht, cTempl.sptwinlcanhmght, cTempl.sphhflamht, cTempl.sphmcanht, cTempl.sphhbb3ht ] // Tough stuff
		},
		"spamFactory2": {
			assembly: "spamAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			data: {
				regroup: false,
				repair: 60,
				count: -1,
			},
			templates: [ cTempl.sptwin2eflamdw, cTempl.spmhmgdw, cTempl.splcandw, cTempl.spmbisondw, cTempl.spleflamdw ] // Drift wheels
		},
		"spamFactory3": {
			assembly: "spamAssembly3",
			order: CAM_ORDER_ATTACK,
			groupSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(6)),
			data: {
				regroup: false,
				count: -1,
			},
			templates: [ cTempl.spminimg ] // Minis only
		},
		"spamFactory4": {
			assembly: "spamAssembly4",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(35)),
			data: {
				regroup: false,
				count: -1,
			},
			templates: [ cTempl.splbisonw, cTempl.spmbisonht, cTempl.sptwin2bisonht, cTempl.splbisonw, cTempl.splbisonht ] // Bisons only
		},
		"spamCybFactory1": {
			assembly: "spamCybAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(90)),
			data: {
				regroup: false,
				repair: 40,
				count: -1,
			},
			templates: [ cTempl.spscybflame ] // Super Flamer Cyborgs only
		},
		"spamCybFactory2": {
			assembly: "spamCybAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(60)),
			data: {
				regroup: false,
				repair: 75,
				count: -1,
			},
			templates: [ cTempl.spcybspy, cTempl.spcybpod ] // Spies and Many-Rocket Pods
		},
		"spamCybFactory3": {
			assembly: "spamCybAssembly3",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			data: {
				regroup: false,
				repair: 40,
				count: -1,
			},
			templates: [ cTempl.spcybcan, cTempl.spcybcan, cTempl.spcybneedle ] // "Light" Gunners and Needler Cyborgs
		},
		"spamCybFactory4": {
			assembly: "spamAssembly4",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(35)),
			data: {
				regroup: false,
				repair: 40,
				count: -1,
			},
			templates: [ cTempl.spcybbison ] // Bison Cyborgs only
		},
		"spamNormFactory1": {
			assembly: "spamNormAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(60)),
			data: {
				regroup: false,
				repair: 20,
				count: -1,
			},
			templates: [ cTempl.spmanvilnw, cTempl.sptwin2lcannw, cTempl.spmhmgnw, cTempl.splbisonnw, cTempl.sptwin2podnw ] // Various stuff
		},
	});

	if (difficulty >= EASY)
	{
		let body = "Body1RECSpam"; // Spamaconda
		if (difficulty >= HARD) body = "Body5RECSpam"; // Upgrade to Spamaconda II
		addDroid(SPAMTON, 183, 11, "Pipis Truck", body, "HalfTrack", "", "", "Spade1Mk1Spam"); // Place in the Silo base

		camManageTrucks(SPAMTON);
	}
	setTimer("placePipis", camSecondsToMilliseconds(3));

	enableResearch("R-Comp-Death01", CAM_HUMAN_PLAYER);

	hackAddMessage("CM3B_SILOS", PROX_MSG, CAM_HUMAN_PLAYER, false);
	// camPlayVideos([{video: "MB3_B_MSG", type: CAMP_MSG}, {video: "MB3_B_MSG2", type: MISS_MSG}]);

	changePlayerColour(SILOS, playerData[SPAMTON].colour);

	setTimer("scanBlasterZone", camChangeOnDiff(camSecondsToMilliseconds(15)));
	setTimer("advanceBlasterZone", camChangeOnDiff(camSecondsToMilliseconds(45)));
	setTimer("fireBlaster", camSecondsToMilliseconds(0.1));

	queue("blastLZ", camSecondsToMilliseconds(5));
	queue("setupMapGroups", camChangeOnDiff(camSecondsToMilliseconds(5)));
	queue("activateFirstFactories", camChangeOnDiff(camMinutesToMilliseconds(0.5)));
	queue("activateSecondFactories", camChangeOnDiff(camMinutesToMilliseconds(8)));
	queue("activateFinalFactories", camChangeOnDiff(camMinutesToMilliseconds(16)));

	// Replace all boulders with explosives
	camUpgradeOnMapFeatures("Boulder1", "ExplosiveDrum");
	camUpgradeOnMapFeatures("Boulder2", "Pipis");

	// Make units funny
	camUpgradeOnMapTemplates(cTempl.crlmgw, cTempl.sphlinkht, SPAMTON);
	camUpgradeOnMapTemplates(cTempl.crcybmg, cTempl.spcybspy, SPAMTON);
	camUpgradeOnMapTemplates(cTempl.crcybpyro, cTempl.spscybflame, SPAMTON);
	camUpgradeOnMapTemplates(cTempl.crcybcan, cTempl.spcybbison, SPAMTON);

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
