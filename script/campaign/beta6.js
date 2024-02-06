include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const startpos = {x: 92, y: 99};
var nextbotGroup;

// See if the player has completed the (correct) pattern
function checkPattern()
{
	// First, figure out which puzzle we're checking for
	let pattern = [];
	if (camIsResearched("Script-Labyrinth-Puzzle-1"))
	{
		pattern = camHardPatterns[0]; // Heart
	}
	else if (camIsResearched("Script-Labyrinth-Puzzle-2"))
	{
		pattern = camHardPatterns[1]; // Sans
	}
	else if (camIsResearched("Script-Labyrinth-Puzzle-3"))
	{
		pattern = camHardPatterns[2]; // Creeper
	}
	else if (camIsResearched("Script-Labyrinth-Puzzle-4"))
	{
		pattern = camHardPatterns[3]; // Eye
	}
	else if (camIsResearched("Script-Labyrinth-Puzzle-5"))
	{
		pattern = camHardPatterns[4]; // Spamton
	}
	else
	{
		return;
	}

	const pZone = {x: 67, y: 31, x2: 79, y2: 43};
	// A pattern is complete if both:
	// 1: Each "1" on the pattern template is aligned to a player structure on the grid.
	// 2: The number of player structures on the grid equals the total amount of "1"s in the pattern template.

	// Count the number of structures on the grid
	const PATTERN_STRUCT_COUNT = enumArea(pZone.x, pZone.y, pZone.x2, pZone.y2, ALL_PLAYERS, false).filter((obj) => (
		obj.type === STRUCTURE || (obj.type === FEATURE && obj.name === _("Explosive Drum"))
	)).length;

	// Run through the pattern template...
	let patternCount = 0;
	for (let y = 0; y < pattern.length; y++)
	{
		for (let x = 0; x < pattern[y].length; x++)
		{
			if (pattern[y][x] === 1)
			{
				patternCount++;
				const object = getObject(pZone.x + x, pZone.y + y);
				if (object === null 
					|| !(object.type === STRUCTURE && object.player === CAM_HUMAN_PLAYER)
					|| !(obj.type === FEATURE && obj.name === _("Explosive Drum")))
				{
					// Didn't find a structure where one should have been, no need to check further
					return;
				}
			}
		}
	}

	// Finally, check that the amount of structures matches the amount of "1"s
	if (PATTERN_STRUCT_COUNT !== patternCount)
	{
		return; // Mismatch
	}

	// If we made it to this point, then everything checks out.
	camCallOnce("openDoor");
	removeTimer("checkPattern");
}

function openDoor()
{
	door1Open = true;
	cameraSlide(64 * 128, 26 * 128); // Center the camera on the door dramatically
	queue("doorEffects", camSecondsToMilliseconds(2));

	setTimer("manageNextbot", camSecondsToMilliseconds(0.5));
}

function doorEffects()
{
	const doorList = enumFeature(ALL_PLAYERS, "GiantDoorVert");
	for (let i = 0; i < doorList.length; i++)
	{
		fireWeaponAtObj("VanishSFX", doorList[i]);
		camSafeRemoveObject(doorList[i], true);
	}
	setScrollLimits(0, 0, 128, 128);
	setMissionTime(getMissionTime() + camChangeOnDiff(camMinutesToSeconds(30)));

	// Add the Remover artifact
	camSetArtifacts({
		"labyrinthChest": { tech: "R-Wpn-SpyTurret" }, // Remover Tool
	});
}

// Check if the Nextbot is near any waypoints, and send it to the next one if so
// Also damage any player objects too close to the Nextbot
function manageNextbot()
{
	const nextbot = getObject("nextbot");
	if (!camDef(nextbot) || nextbot === null)
	{
		// Nextbot is dead
		removeTimer("manageNextbot");
		return;
	}

	setHealth(nextbot, 100);

	// Deal damage to any nearby non-mobs
	const nbPos = camMakePos(nextbot);
	const targetList = enumRange(nbPos.x, nbPos.y, 2, ALL_PLAYERS, false).filter((obj) => (
		!(obj.type !== FEATURE && obj.player === CAM_MOBS)
	));
	for (let i = 0; i < targetList.length; i++)
	{
		const obj = targetList[i];
		if (Math.floor(obj.health) > 40)
		{
			// Remove 40% HP
			setHealth(obj, obj.health - 40);
			fireWeaponAtObj("UTHurtSFX", obj);
		}
		else
		{
			// Destroy the object
			camSafeRemoveObject(obj, true);
		}
	}

	// See if any waypoints are nearby
	const waypoints = ["waypoint1", "waypoint2", "waypoint3", "waypoint4", "waypoint5"];
	for (let i = 0; i < waypoints.length; i++)
	{
		if (nextbotNearWaypoint(waypoints[i]))
		{
			let nextWaypoint = "";
			if (waypoints[i] === "waypoint3")
			{
				// For waypoint 3, go to either waypoint 4 or 5
				if (camRand(2) === 0)
				{
					nextWaypoint = "waypoint4";
				}
				else
				{
					nextWaypoint = "waypoint5";
				}
			}
			else if (waypoints[i] === "waypoint5" || waypoints[i] === "waypoint4")
			{
				// Loop back to the first waypoint
				nextWaypoint = waypoints[0];
			}
			else
			{
				// Travel to the next waypoint
				nextWaypoint = waypoints[i + 1];
			}
			// Update the Nextbot's orders
			const nextPos = camMakePos(nextWaypoint);
			orderDroidLoc(nextbot, DORDER_MOVE, nextPos.x, nextPos.y);
			return; // All done
		}
	}
	// If we got to this point, then the Nextbot isn't near any waypoints
}

// Return true if the Nextbot is near the given waypoint
function nextbotNearWaypoint(waypointLabel)
{
	const pos = camMakePos(waypointLabel);
	const nextbotPos = camMakePos(getObject("nextbot"));

	return (Math.abs(pos.x - nextbotPos.x) < 3 && Math.abs(pos.y - nextbotPos.y) < 3);
}

function eventStartLevel()
{
	const lz = {x: 86, y: 99, x2: 88, y2: 101};
	const tCoords = {xStart: 87, yStart: 100, xOut: 0, yOut: 55};

	nextbotGroup = camMakeGroup(getObject("nextbot"));
	setScrollLimits(64, 0, 128, 128);

	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "HOLY_CUNGADERO");
	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	camSetupTransporter(tCoords.xStart, tCoords.yStart, tCoords.xOut, tCoords.yOut);

	camPlayVideos({video: "BETA6_MSG", type: CAMP_MSG});

	// Hack to prevent spamtonized mob units
	// TODO: Figure out why units are getting spamtonized in the first place
	camCompleteRequiredResearch(["Script-Spamtonize-Undo"], CAM_MOBS);

	// Add Endermen
	camUpgradeOnMapTemplates(cTempl.crlmgw, cTempl.enderman, CAM_MOBS);
	// Choose a random Nextbot type
	const nextbotType = camRand(3);
	if (nextbotType === 0)
	{
		camUpgradeOnMapTemplates(cTempl.crcybmg, cTempl.crnextbot1, CAM_MOBS); // "Sans" Nextbot
	}
	else if (nextbotType === 1)
	{
		camUpgradeOnMapTemplates(cTempl.crcybmg, cTempl.crnextbot2, CAM_MOBS); // "Amogus" Nextbot
	}
	else if (nextbotType === 2)
	{
		camUpgradeOnMapTemplates(cTempl.crcybmg, cTempl.crnextbot3, CAM_MOBS); // "Trollface" Nextbot
	}

	// Make structures funny
	camUpgradeOnMapStructures("Sys-SensoTower01", "Spawner-Zombie", CAM_MOBS);
	camUpgradeOnMapStructures("Sys-SensoTower02", "Spawner-Skeleton", CAM_MOBS);
	camUpgradeOnMapStructures("Sys-NX-SensorTower", "Spawner-Creeper", CAM_MOBS);
	camUpgradeOnMapStructures("A0HardcreteMk1CWall", "A0Chest", CAM_MOBS);

	setMissionTime(camMinutesToSeconds(15));
	setTimer("checkPattern", camSecondsToMilliseconds(1));
}
