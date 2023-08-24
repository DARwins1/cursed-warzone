
////////////////////////////////////////////////////////////////////////////////
// Misc useful stuff.
////////////////////////////////////////////////////////////////////////////////

//;; ## camDef(something)
//;;
//;; Returns `false` if something is JavaScript-undefined, `true` otherwise.
//;;
//;; @param {*} something
//;; @returns {boolean}
//;;
function camDef(something)
{
	return typeof something !== "undefined";
}

//;; ## camIsString(something)
//;;
//;; Returns `true` if something is a string, `false` otherwise.
//;;
//;; @param {*} something
//;; @returns {boolean}
//;;
function camIsString(something)
{
	return typeof something === "string";
}

//;; ## camRand(max)
//;;
//;; A non-synchronous random integer in range [0, max - 1].
//;;
//;; @param {number} max
//;; @returns {number}
//;;
function camRand(max)
{
	if (max > 0)
	{
		return Math.floor(Math.random() * max);
	}
	camDebug("Max should be positive");
}

//;; ## camCallOnce(functionName)
//;;
//;; Call a function by name, but only if it has not been called yet.
//;;
//;; @param {string} functionName
//;; @returns {void}
//;;
function camCallOnce(functionName)
{
	if (camDef(__camCalledOnce[functionName]) && __camCalledOnce[functionName])
	{
		return;
	}
	__camCalledOnce[functionName] = true;
	__camGlobalContext()[functionName]();
}

//;; ## camSafeRemoveObject(obj[, specialEffects])
//;;
//;; Remove a game object (by value or label) if it exists, do nothing otherwise.
//;;
//;; @param {string|Object} obj
//;; @param {boolean} [specialEffects]
//;; @returns {void}
//;;
function camSafeRemoveObject(obj, specialEffects)
{
	if (__camLevelEnded)
	{
		return;
	}
	if (camIsString(obj))
	{
		obj = getObject(obj);
	}
	if (camDef(obj) && obj)
	{
		removeObject(obj, specialEffects);
	}
}

//;; ## camMakePos(label|object|x[, y])
//;;
//;; Make a `POSITION`-like object, unless already done.
//;; Often useful for making functions that would accept positions in both `x,y` and `{x: x, y: y}` forms.
//;; Also accepts labels. If label of `AREA` is given, returns the center of the area.
//;; If an existing object or label of such is given, returns a safe JavaScript object containing its `x`, `y` and `id`.
//;;
//;; @param {number|string|Object|undefined} x
//;; @param {number} [y]
//;; @returns {Object|undefined}
//;;
function camMakePos(x, y)
{
	if (camDef(y))
	{
		return { x: x, y: y };
	}
	if (!camDef(x))
	{
		return undefined;
	}
	var obj = x;
	if (camIsString(x))
	{
		obj = getObject(x);
	}
	if (!camDef(obj) || !obj)
	{
		camDebug("Failed at", x);
		return undefined;
	}
	switch (obj.type)
	{
		case DROID:
		case STRUCTURE:
		case FEATURE:
			// store ID for those as well.
			return { x: obj.x, y: obj.y, id: obj.id };
		case POSITION:
		case RADIUS:
			return obj;
		case AREA:
			return {
				x: Math.floor((obj.x + obj.x2) / 2),
				y: Math.floor((obj.y + obj.y2) / 2)
			};
		case GROUP:
		default:
			// already a pos-like object?
			if (camDef(obj.x) && camDef(obj.y))
			{
				return { x: obj.x, y: obj.y };
			}
			camDebug("Not implemented:", obj.type);
			return undefined;
	}
}

//;; ## camDist(x1, y1, x2, y2 | pos1, x2, y2 | x1, y1, pos2 | pos1, pos2)
//;;
//;; A wrapper for `distBetweenTwoPoints()`.
//;;
//;; @param {number|Object} x1
//;; @param {number|Object} y1
//;; @param {number} [x2]
//;; @param {number} [y2]
//;; @returns {number}
//;;
function camDist(x1, y1, x2, y2)
{
	if (camDef(y2)) // standard
	{
		return distBetweenTwoPoints(x1, y1, x2, y2);
	}
	if (!camDef(x2)) // pos1, pos2
	{
		return distBetweenTwoPoints(x1.x, x1.y, y1.x, y1.y);
	}
	var pos2 = camMakePos(x2);
	if (camDef(pos2.x)) // x2 is pos2
	{
		return distBetweenTwoPoints(x1, y1, pos2.x, pos2.y);
	}
	else // pos1, x2, y2
	{
		return distBetweenTwoPoints(x1.x, x1.y, y1, x2);
	}
}

//;; ## camPlayerMatchesFilter(playerId, playerFilter)
//;;
//;; A function to handle player filters in a way similar to how JS API functions (eg. `enumDroid(filter, ...)`) handle them.
//;;
//;; @param {number} playerId
//;; @param {number} playerFilter
//;; @returns {boolean}
//;;
function camPlayerMatchesFilter(playerId, playerFilter)
{
	switch (playerFilter) {
		case ALL_PLAYERS:
			return true;
		case ALLIES:
			return allianceExistsBetween(CAM_HUMAN_PLAYER, playerId);
		case ENEMIES:
			return playerId >= 0 && playerId < CAM_MAX_PLAYERS && playerId !== CAM_HUMAN_PLAYER;
		default:
			return playerId === playerFilter;
	}
}

//;; ## camRemoveDuplicates(items)
//;;
//;; Remove duplicate items from an array.
//;;
//;; @param {*[]} items
//;; @returns {*[]}
//;;
function camRemoveDuplicates(items)
{
	var prims = {"boolean":{}, "number":{}, "string":{}};
	var objs = [];

	return items.filter((item) => {
		var type = typeof item;
		if (type in prims)
		{
			return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true);
		}
		else
		{
			return objs.indexOf(item) >= 0 ? false : objs.push(item);
		}
	});
}

//;; ## camCountStructuresInArea(label[, playerFilter])
//;;
//;; Mimics wzscript's `numStructsButNotWallsInArea()`.
//;;
//;; @param {string} label
//;; @param {number} [playerFilter]
//;; @returns {number}
//;;
function camCountStructuresInArea(label, playerFilter)
{
	if (!camDef(playerFilter))
	{
		playerFilter = CAM_HUMAN_PLAYER;
	}
	var list = enumArea(label, playerFilter, false);
	var ret = 0;
	for (let i = 0, l = list.length; i < l; ++i)
	{
		var object = list[i];
		if (object.type === STRUCTURE && object.stattype !== WALL && object.status === BUILT)
		{
			++ret;
		}
	}
	return ret;
}

//;; ## camChangeOnDiff(numericValue)
//;;
//;; Change a numeric value based on campaign difficulty.
//;;
//;; @param {number} numericValue
//;; @returns {number}
//;;
function camChangeOnDiff(numericValue)
{
	var modifier = 0;

	switch (difficulty)
	{
		case SUPEREASY:
			modifier = 2;
			break;
		case EASY:
			modifier = 1.5;
			break;
		case MEDIUM:
			modifier = 1;
			break;
		case HARD:
			modifier = 0.85;
			break;
		case INSANE:
			modifier = 0.70;
			break;
		default:
			modifier = 1;
			break;
	}

	return Math.floor(numericValue * modifier);
}

//;; ## camIsSystemDroid(gameObject)
//;;
//;; Determine if the passed in object is a non-weapon based droid.
//;;
//;; @param {Object} gameObject
//;; @returns {boolean}
//;;
function camIsSystemDroid(gameObject)
{
	if (!camDef(gameObject) || !gameObject)
	{
		return false;
	}

	if (gameObject.type !== DROID)
	{
		camTrace("Non-droid: " + gameObject.type + " pl: " + gameObject.name);
		return false;
	}

	return (gameObject.droidType === DROID_SENSOR || gameObject.droidType === DROID_CONSTRUCT || gameObject.droidType === DROID_REPAIR);
}

//;; ## camMakeGroup(what[, playerFilter])
//;;
//;; Make a new group out of array of droids, single game object, or label string,
//;; with fuzzy auto-detection of argument type.
//;; Only droids would be added to the group. `playerFilter` can be one of a
//;; player index, `ALL_PLAYERS`, `ALLIES` or `ENEMIES`; defaults to `ENEMIES`.
//;;
//;; @param {string|Object|Object[]} what
//;; @param {number} [playerFilter]
//;; @returns {number|void}
//;;
function camMakeGroup(what, playerFilter)
{
	if (!camDef(playerFilter))
	{
		playerFilter = ENEMIES;
	}
	var array;
	var obj;
	if (camIsString(what)) // label
	{
		obj = getObject(what);
	}
	else if (camDef(what.length)) // array
	{
		array = what;
	}
	else if (camDef(what.type)) // object
	{
		obj = what;
	}
	if (camDef(obj))
	{
		switch (obj.type) {
			case POSITION:
				obj = getObject(obj.x, obj.y);
				// fall-through
			case DROID:
			case STRUCTURE:
			case FEATURE:
				array = [ obj ];
				break;
			case AREA:
				array = enumArea(obj.x, obj.y, obj.x2, obj.y2, ALL_PLAYERS, false);
				break;
			case RADIUS:
				array = enumRange(obj.x, obj.y, obj.radius, ALL_PLAYERS, false);
				break;
			case GROUP:
				array = enumGroup(obj.id);
				break;
			default:
				camDebug("Unknown object type", obj.type);
		}
	}
	if (camDef(array))
	{
		var group = camNewGroup();
		for (let i = 0, l = array.length; i < l; ++i)
		{
			var o = array[i];
			if (!camDef(o) || !o)
			{
				camDebug("Trying to add", o);
				continue;
			}
			if (o.type === DROID && o.droidType !== DROID_CONSTRUCT && camPlayerMatchesFilter(o.player, playerFilter))
			{
				groupAdd(group, o);
			}
		}
		return group;
	}
	camDebug("Cannot parse", what);
}

//;; ## camBreakAlliances()
//;;
//;; Break alliances between all players.
//;;
//;; @returns {void}
//;;
function camBreakAlliances()
{
	for (let i = 0; i < CAM_MAX_PLAYERS; ++i)
	{
		for (let c = 0; c < CAM_MAX_PLAYERS; ++c)
		{
			if (i !== c && allianceExistsBetween(i, c) === true)
			{
				setAlliance(i, c, false);
			}
		}
	}
}

//;; ## camGenerateRandomMapEdgeCoordinate(reachPosition)
//;;
//;; Returns a random coordinate anywhere on the edge of the map that reachs a position.
//;;
//;; @param {Object} reachPosition
//;; @returns {Object}
//;;
function camGenerateRandomMapEdgeCoordinate(reachPosition)
{
	let limits = getScrollLimits();
	let loc;

	do
	{
		let location = {x: 0, y: 0};
		let xWasRandom = false;

		if (camRand(100) < 50)
		{
			location.x = camRand(limits.x2 + 1);
			if (location.x < (limits.x + 2))
			{
				location.x = limits.x + 2;
			}
			else if (location.x > (limits.x2 - 2))
			{
				location.x = limits.x2 - 2;
			}
			xWasRandom = true;
		}
		else
		{
			location.x = (camRand(100) < 50) ? (limits.x2 - 2) : (limits.x + 2);
		}

		if (!xWasRandom && (camRand(100) < 50))
		{
			location.y = camRand(limits.y2 + 1);
			if (location.y < (limits.y + 2))
			{
				location.y = limits.y + 2;
			}
			else if (location.y > (limits.y2 - 2))
			{
				location.y = limits.y2 - 2;
			}
		}
		else
		{
			location.y = (camRand(100) < 50) ? (limits.y2 - 2) : (limits.y + 2);
		}

		loc = location;
	} while (camDef(reachPosition) && reachPosition && !propulsionCanReach("wheeled01", reachPosition.x, reachPosition.y, loc.x, loc.y));

	return loc;
}

//;; ## camGenerateRandomMapCoordinate(reachPosition)
//;;
//;; Returns a random coordinate anywhere on the map
//;;
//;; @param {Object} reachPosition
//;; @returns {Object}
//;;
function camGenerateRandomMapCoordinate(reachPosition, distFromReach, scanObjectRadius)
{
	if (!camDef(distFromReach))
	{
		distFromReach = 10;
	}
	if (!camDef(scanObjectRadius))
	{
		scanObjectRadius = 2;
	}

	let limits = getScrollLimits();
	let pos;

	do
	{
		let randomPos = {x: camRand(limits.x2), y: camRand(limits.y2)};

		if (randomPos.x < (limits.x + 2))
		{
			randomPos.x = limits.x + 2;
		}
		else if (randomPos.x > (limits.x2 - 2))
		{
			randomPos.x = limits.x2 - 2;
		}

		if (randomPos.y < (limits.y + 2))
		{
			randomPos.y = limits.y;
		}
		else if (randomPos.y > (limits.y2 - 2))
		{
			randomPos.y = limits.y2 - 2;
		}

		pos = randomPos;
	} while (camDef(reachPosition) &&
		reachPosition &&
		(!propulsionCanReach("wheeled01", reachPosition.x, reachPosition.y, pos.x, pos.y) ||
		(camDist(pos, reachPosition) < distFromReach) ||
		(enumRange(pos.x, pos.y, scanObjectRadius, ALL_PLAYERS, false).length > 0) ||
		(terrainType(pos.x, pos.y) === TER_CLIFFFACE) ||
		(terrainType(pos.x, pos.y) === TER_WATER)));

	return pos;
}

//;; ## camGenerateRandomMapCoordinateWithinRadius(center[, radius[, scanObjectRadius]])
//;;
//;; Returns a random coordinate anywhere on the map within a given radius
//;;
//;; @param {Object} center
//;; @param {number} radius
//;; @param {number} radius
//;; @returns {Object}
//;;
function camGenerateRandomMapCoordinateWithinRadius(center, radius, scanObjectRadius)
{
	if (!camDef(radius))
	{
		radius = 10;
	}
	if (!camDef(scanObjectRadius))
	{
		scanObjectRadius = 2;
	}

	let limits = getScrollLimits();
	let pos;

	do
	{
		let randomPos = {x: center.x + camRand(radius * 2) - radius, y: center.y + camRand(radius * 2) - radius};

		if (randomPos.x < (limits.x + 2))
		{
			randomPos.x = limits.x + 2;
		}
		else if (randomPos.x > (limits.x2 - 2))
		{
			randomPos.x = limits.x2 - 2;
		}

		if (randomPos.y < (limits.y + 2))
		{
			randomPos.y = limits.y;
		}
		else if (randomPos.y > (limits.y2 - 2))
		{
			randomPos.y = limits.y2 - 2;
		}

		pos = randomPos;
	} while (camDef(center) &&
		center &&
		(!propulsionCanReach("wheeled01", center.x, center.y, pos.x, pos.y) ||
		(camDist(pos, center) > radius) ||
		(enumRange(pos.x, pos.y, scanObjectRadius, ALL_PLAYERS, false).length > 0) ||
		(terrainType(pos.x, pos.y) === TER_CLIFFFACE) ||
		(terrainType(pos.x, pos.y) === TER_WATER)));

	return pos;
}

//;; ## camDiscoverCampaign()
//;;
//;; Figures out what campaign we are in without reliance on the source at all.
//;;
//;; @returns {number}
//;;
function camDiscoverCampaign()
{
	for (let i = 0, len = ALPHA_LEVELS.length; i < len; ++i)
	{
		if (__camNextLevel === ALPHA_LEVELS[i] || __camNextLevel === BETA_LEVELS[0])
		{
			return ALPHA_CAMPAIGN_NUMBER;
		}
	}
	for (let i = 0, len = BETA_LEVELS.length; i < len; ++i)
	{
		if (__camNextLevel === BETA_LEVELS[i] || __camNextLevel === GAMMA_LEVELS[0])
		{
			return BETA_CAMPAIGN_NUMBER;
		}
	}
	for (let i = 0, len = GAMMA_LEVELS.length; i < len; ++i)
	{
		if (__camNextLevel === GAMMA_LEVELS[i] || __camNextLevel === CAM_GAMMA_OUT)
		{
			return GAMMA_CAMPAIGN_NUMBER;
		}
	}

	return UNKNOWN_CAMPAIGN_NUMBER;
}

//;; ## camRandomEffect(pos)
//;;
//;; Cause a random effect at the given position.
//;;
//;; @param {Object} pos
//;; @returns {void}
//;;
function camRandomEffect(pos)
{
	// Set a default list of effects
	let effects = [
		"oilDrum", "oilDrum", "oilDrums",
		"explosiveDrum", "twinHostile", "explode",
		"miniVipers", "manyPodTower", "scavScorchShot",
		"trees", "driftVipers", "fungHardpoint",
	];

	// Additional effects with conditions
	if (camRand(101) < (15 * camDiscoverCampaign()))
	{
		// Reduce the chances of this event by omitting it from the list:
		// 85% of the time in alpha
		// 70% of the time in beta
		// 55% of the time in gamma
		effects.push("bigViper");
	}
	if (!__camBlackOut && camRand(101) < 15)
	{
		// 15% chance to allow a black out if one isn't currently active
		effects.push("blackOut");
	}
	if (camDiscoverCampaign() > 1)
	{
		// Allow mob spawning after alpha campaign
		effects.push("monsterSpawner");
		effects.push("enderman");
		effects.push("babyZombies");
		effects.push("silverfish");
	}
	if (camIsResearched("R-Struc-ExplosiveDrum") && !camIsResearched("R-Struc-NuclearDrum"))
	{
		// Allow Nuclear Drum Artifact if Explosive Drum is researched
		effects.push("nukeDrumArti");
	}
	if (camIsResearched("R-Vehicle-BodyTwin") && camIsResearched("R-Vehicle-Body11") && !camIsResearched("R-Vehicle-BodyTriple"))
	{
		// Allow Triple Viper Artifact if Twin Viper and Viper III is researched
		effects.push("tripleViperArti");
	}
	if (camIsResearched("R-Vehicle-Body05"))
	{
		// Allow Towering Pillar Of Lancers if Viper II is researched
		effects.push("lancerPillar");
	}
	if (camIsResearched("R-Vehicle-Body11"))
	{
		// Allow Bunker Buster Array if Viper III is researched
		effects.push("bbArray");
	}
	if (camIsResearched("R-Comp-SynapticLink"))
	{
		// Allow Sword and BB cyborgs if Synaptic Link is researched
		effects.push("bbCyb");
		effects.push("swordCyb");
	}
	if (camIsResearched("R-Wpn-MG3Mk1"))
	{
		// Allow Realistic-er Heavy Machinegun if Realistic Heavy Machinegun is researched
		effects.push("realerMG");
	}
	if (camIsResearched("R-Vehicle-Prop-VTOL"))
	{
		// Allow Hurricane AAA artifact if Normal Wheels is researched
		effects.push("hurricaneArti");
	}

	// Choose an effect
	switch (effects[camRand(effects.length)])
	{
		case "oilDrum":
			// Spawn a single oil drum
			addFeature("OilDrum", pos.x, pos.y);
			break;
		case "oilDrums":
			// Spawn several oil drums
			for (let i = -1; i <= 1; i++)
			{
				for (let j = -1; j <= 1; j++)
				{
					addFeature("OilDrum", pos.x + i, pos.y + j);
				}
			}
			break;
		case "explosiveDrum":
			// Spawn an explosive drum
			addFeature("ExplosiveDrum", pos.x, pos.y);
			break;
		case "trees":
			// Spawn a group of trees
			for (let i = -1; i <= 1; i++)
			{
				for (let j = -1; j <= 1; j++)
				{
					if (camRand(101) < 50)
					{
						addFeature("Tree3", pos.x + i, pos.y + j);
					}
				}
			}
			break;
		case "twinHostile":
			// Spawn a group of hostile Twin snugenihcaM
			for (let i = -1; i <= 1; i++)
			{
				for (let j = -1; j <= 1; j++)
				{
					addDroid(MOBS, pos.x + i, pos.y + j, 
						_("Twin nugenihcaM Viper Half-wheels"), "Body1REC", "HalfTrack", "", "", "MG2Mk1"
					);
				}
			}
			break;
		case "scavScorchShot":
			// Spawn a grid of 4 scav Scorch Shot towers
			addStructure("A0BaBaFlameTower", SCAV_7, (pos.x - 1) * 128, (pos.y) * 128);
			addStructure("A0BaBaFlameTower", SCAV_7, (pos.x) * 128, (pos.y - 1) * 128);
			addStructure("A0BaBaFlameTower", SCAV_7, (pos.x + 1) * 128, (pos.y) * 128);
			addStructure("A0BaBaFlameTower", SCAV_7, (pos.x) * 128, (pos.y + 1) * 128);
			break;
		case "bbCyb":
			// Spawn a grid of 4 Bunker Buster Cyborgs
			addDroid(MOBS, pos.x - 1, pos.y, 
				_("Bunker Buster Cyborg"), "CyborgLightBody", "CyborgLegs", "", "", "CyborgBB"
			);
			addDroid(MOBS, pos.x + 1, pos.y, 
				_("Bunker Buster Cyborg"), "CyborgLightBody", "CyborgLegs", "", "", "CyborgBB"
			);
			addDroid(MOBS, pos.x, pos.y - 1, 
				_("Bunker Buster Cyborg"), "CyborgLightBody", "CyborgLegs", "", "", "CyborgBB"
			);
			addDroid(MOBS, pos.x, pos.y + 1, 
				_("Bunker Buster Cyborg"), "CyborgLightBody", "CyborgLegs", "", "", "CyborgBB"
			);
			break;
		case "swordCyb":
			// Spawn a grid of 4 Sword Cyborgs
			addDroid(MOBS, pos.x - 1, pos.y, 
				_("Sword Cyborg"), "CyborgLightBody", "CyborgLegs", "", "", "Cyb-Wpn-Sword"
			);
			addDroid(MOBS, pos.x + 1, pos.y, 
				_("Sword Cyborg"), "CyborgLightBody", "CyborgLegs", "", "", "Cyb-Wpn-Sword"
			);
			addDroid(MOBS, pos.x, pos.y - 1, 
				_("Sword Cyborg"), "CyborgLightBody", "CyborgLegs", "", "", "Cyb-Wpn-Sword"
			);
			addDroid(MOBS, pos.x, pos.y + 1, 
				_("Sword Cyborg"), "CyborgLightBody", "CyborgLegs", "", "", "Cyb-Wpn-Sword"
			);
			break;
		case "bigViper":
			// Spawn a Big Machinegun Viper Wheels for the player
			addDroid(CAM_HUMAN_PLAYER, pos.x, pos.y, 
				_("Big Machinegun Viper Wheels"), "Body1BIG", "wheeled01", "", "", "MG3Mk2"
			);
			break;
		case "bbArray":
			// Spawn a Bunker Buster Array for the player
			addDroid(CAM_HUMAN_PLAYER, pos.x, pos.y, 
				_("Bunker Buster Array Viper III Thick Wheels"), "Body11ABT", "tracked01", "", "", "Rocket-BB-IDF"
			);
			break;
		case "lancerPillar":
			// Spawn a Towering Pillar Of Lancers for the player
			addDroid(CAM_HUMAN_PLAYER, pos.x, pos.y, 
				_("Towering Pillar Of Lancers Viper II Half-wheels"), "Body5REC", "HalfTrack", "", "", "Rocket-LtA-TPillar"
			);
			break;
		case "realerMG":
			// Spawn a Realistic-er Heavy Machinegun Viper Half-wheels for the player
			addDroid(CAM_HUMAN_PLAYER, pos.x, pos.y, 
				_("Realistic-er Heavy Machinegun Viper Half-wheels"), "Body1REC", "HalfTrack", "", "", "MG3Mk3"
			);
			break;
		case "manyPodTower":
			// Spawn a hostile Many-Rocket tower
			addStructure("GuardTower6", MOBS, pos.x * 128, pos.y * 128);
			break;
		case "fungHardpoint":
			// Spawn a Fungible Cannon Hardpoint for the player
			addStructure(__camFungibleCanHardList[camRand(__camFungibleCanHardList.length)], CAM_HUMAN_PLAYER, pos.x * 128, pos.y * 128);
			break;
		case "explode":
			// Cause a drum explosion
			let boomBaitId = addDroid(10, pos.x, pos.y, "Boom Bait",
				"B4body-sml-trike01", "BaBaProp", "", "", "BabaTrikeMG").id; // Spawn a trike...
			queue("__camDetonateDrum", CAM_TICKS_PER_FRAME, boomBaitId + ""); // ...then blow it up
			break;
		case "monsterSpawner":
			// Spawn a Monster Spawner
			if (camRand(101) < 50)
			{
				// 50% chance for Zombie Spawner
				addStructure("Spawner-Zombie", MOBS, pos.x * 128, pos.y * 128);
			}
			else if (camRand(101) < 50)
			{
				// 25% chance for Skeleton Spawner
				addStructure("Spawner-Skeleton", MOBS, pos.x * 128, pos.y * 128);
			}
			else
			{
				// 25% chance for Creeper Spawner
				addStructure("Spawner-Creeper", MOBS, pos.x * 128, pos.y * 128);
			}
			break;
		case "enderman":
			// Spawn an Enderman
			addDroid(MOBS, pos.x, pos.y, 
				_("Enderman"), "EndermanBody", "CyborgLegs", "", "", "Cyb-Wpn-EnderMelee"
			);
			break;
		case "babyZombies":
			// Spawn a bunch of baby zombies
			for (let i = -1; i <= 1; i++)
			{
				for (let j = -1; j <= 1; j++)
				{
					addDroid(MOBS, pos.x + i, pos.y + j, 
						_("Baby Zombie"), "BabyZombieBody", "CyborgLegs", "", "", "Cyb-Wpn-BabyZmbieMelee"
					);
				}
			}
			break;
		case "silverfish":
			// Spawn a bunch of walls that break into Silverfish
			for (let i = -1; i <= 1; i++)
			{
				for (let j = -1; j <= 1; j++)
				{
					addStructure("A0HardcreteMk1CWall", MOBS, pos.x + i * 128, pos.y + j * 128)
				}
			}
			break;
		case "miniVipers":
			// Spawn 18 Mini Machinegun Viper Wheels
			var player = CAM_HUMAN_PLAYER;
			if (camRand(101) < 20)
			{
				// 20% chance for the swarm to be hostile
				player = MOBS;
			}
			for (let i = -1; i <= 1; i++)
			{
				for (let j = -1; j <= 1; j++)
				{
					addDroid(player, pos.x + i, pos.y + j, 
						_("Mini Machinegun Viper Wheels"), "Body1Mini", "wheeled01", "", "", "MGMini"
					);
					addDroid(player, pos.x + i, pos.y + j, 
						_("Mini Machinegun Viper Wheels"), "Body1Mini", "wheeled01", "", "", "MGMini"
					);
				}
			}
			break;
		case "driftVipers":
			// Spawn 9 Machinegun Viper Drift Wheels
			var player = CAM_HUMAN_PLAYER;
			if (camRand(101) < 50)
			{
				// 50% chance for the vipers to be hostile
				player = MOBS;
			}
			for (let i = -1; i <= 1; i++)
			{
				for (let j = -1; j <= 1; j++)
				{
					addDroid(player, pos.x + i, pos.y + j, 
						_("Machinegun Viper Drift Wheels"), "Body1REC", "wheeledskiddy", "", "", "MG1Mk1"
					);
				}
			}
			break;
		case "nukeDrumArti":
			// Spawn an artifact for the Nuclear Drum
			if (camDef(__camArtifacts["nukeDrumCrate"]))
			{
				break; // Don't place if an artifact was already placed
			}
			addLabel(addFeature("Crate", pos.x, pos.y), "nukeDrumCrate");
			__camArtifacts["nukeDrumCrate"] = {tech: "R-Struc-NuclearDrum", placed: true };
			break;
		case "tripleViperArti":
			// Spawn an artifact for the Triple Viper
			if (camDef(__camArtifacts["tripleViperCrate"]))
			{
				break; // Don't place if an artifact was already placed
			}
			addLabel(addFeature("Crate", pos.x, pos.y), "tripleViperCrate");
			__camArtifacts["tripleViperCrate"] = {tech: "R-Vehicle-BodyTriple", placed: true };
			break;
		case "hurricaneArti":
			// Spawn an artifact for the Hurricane AAA
			if (camDef(__camArtifacts["hurricaneCrate"]))
			{
				break; // Don't place if an artifact was already placed
			}
			addLabel(addFeature("Crate", pos.x, pos.y), "hurricaneCrate");
			__camArtifacts["hurricaneCrate"] = {tech: "R-Wpn-AAGun03", placed: true };
			break;
		case "blackOut":
			// Make the whole map go dark
			__camBlackOut = true;
			camSetSunPosition(0, 0, 0);
			camSetSunIntensity(0.2, 0.2, 0.2, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4);
			playSound("Powerdown.ogg");
			setTimer("__camPlayCaveSounds", camSecondsToMilliseconds(30));
			queue("__camEndBlackOut", camMinutesToMilliseconds(4));
			break;
		default:
			return;
	}
}

//;; ## camSetSunPosition(x, y, z)
//;;
//;; A wrapper for `setSunPosition()`, allows the sun to stay persistent between saves.
//;;
//;; @param {number} x
//;; @param {number} y
//;; @param {number} z
//;; @returns {void}
//;;
function camSetSunPosition(x, y, z)
{
	__camSunPosition = {x: x, y: y, z: z};
	setSunPosition(x, y, z);
}

//;; ## camSetSunIntensity(ar, ag, ab, dr, dg, db, sr, sg, sb)
//;;
//;; A wrapper for `setSunIntensity()`, allows the sun to stay persistent between saves.
//;;
//;; @param {number} ar
//;; @param {number} ag
//;; @param {number} ab
//;; @param {number} dr
//;; @param {number} dg
//;; @param {number} db
//;; @param {number} sr
//;; @param {number} sg
//;; @param {number} sb
//;; @returns {void}
//;;
function camSetSunIntensity(ar, ag, ab, dr, dg, db, sr, sg, sb)
{
	__camSunIntensity = {ar: ar, ag: ag, ab: ab, dr: dr, dg: dg, db: db, sr: sr, sg: sg, sb: sb};
	setSunIntensity(ar, ag, ab, dr, dg, db, sr, sg, sb);
}

//;; ## camResetSun()
//;;
//;; Reset the sun back to its default position and intensity
//;;
//;; @returns {void}
//;;
function camResetSun()
{
	let camNum = camDiscoverCampaign();
	var sp;
	var si;
	
	switch (camNum)
	{
		case 1:
			sp = CAM_ALPHA_SUN_POSITION;
			si = CAM_ALPHA_SUN_INTENSITY;
			break;
		case 2:
			sp = CAM_BETA_SUN_POSITION;
			si = CAM_BETA_SUN_INTENSITY;
			break;
		case 3:
			sp = CAM_GAMMA_SUN_POSITION;
			si = CAM_GAMMA_SUN_INTENSITY;
			break;
		default:
			sp = CAM_ALPHA_SUN_POSITION;
			si = CAM_ALPHA_SUN_INTENSITY;
			break;
	}

	// Set the sun correctly
	camSetSunPosition(sp.x, sp.y, sp.z);
	camSetSunIntensity(
		si.ar, si.ag, si.ab, 
		si.dr, si.dg, si.db, 
		si.sr, si.sg, si.sb
	);
}

//;; ## camRandPosInArea(area)
//;;
//;; Returns a random coordinate located within the given area.
//;;
//;; @param {string|Object} area
//;;
//;; @returns {void}
//;;
function camRandPosInArea(area)
{
	if (camIsString(area))
	{
		area = getObject(area);
	}
	return {x: area.x + camRand(area.x2 - area.x), y: area.y + camRand(area.y2 - area.y)};
}

//;; ## camRandomFungibleCannon()
//;;
//;; Returns the name of a random varient of the Fungible Cannon.
//;;
//;; @returns {string}
//;;
function camRandomFungibleCannon()
{
	return __camFungibleCannonList[camRand(__camFungibleCannonList.length)];
}

//;; ## camFeignCooldownCheck(spyId)
//;;
//;; Returns true if the given spy ID can feign death, false otherwise.
//;;
//;; @param {number} spyId
//;;
//;; @returns {boolean}
//;;
function camFeignCooldownCheck(spyId)
{
	for (let i = 0; i < __camSpyCooldowns.length; i++)
	{
		if (__camSpyCooldowns[i].id === spyId)
		{
			return false; // This spy is still on cooldown
		}
	}
	return true; // This spy is not on cooldown
}

//////////// privates

function __camGlobalContext()
{
	return Function('return this')(); // eslint-disable-line no-new-func
}

function __camFindClusters(list, size)
{
	// The good old cluster analysis algorithm taken from NullBot AI.
	var ret = { clusters: [], xav: [], yav: [], maxIdx: 0, maxCount: 0 };
	for (let i = list.length - 1; i >= 0; --i)
	{
		var x = list[i].x;
		var y = list[i].y;
		var found = false;
		var n = 0;
		for (let j = 0; j < ret.clusters.length; ++j)
		{
			if (camDist(ret.xav[j], ret.yav[j], x, y) < size)
			{
				n = ret.clusters[j].length;
				ret.clusters[j][n] = list[i];
				ret.xav[j] = Math.floor((n * ret.xav[j] + x) / (n + 1));
				ret.yav[j] = Math.floor((n * ret.yav[j] + y) / (n + 1));
				if (ret.clusters[j].length > ret.maxCount)
				{
					ret.maxIdx = j;
					ret.maxCount = ret.clusters[j].length;
				}
				found = true;
				break;
			}
		}
		if (!found)
		{
			n = ret.clusters.length;
			ret.clusters[n] = [list[i]];
			ret.xav[n] = x;
			ret.yav[n] = y;
			if (1 > ret.maxCount)
			{
				ret.maxIdx = n;
				ret.maxCount = 1;
			}
		}
	}
	return ret;
}

/* Called every second after eventStartLevel(). */
function __camTick()
{
	if (camDef(__camWinLossCallback))
	{
		__camGlobalContext()[__camWinLossCallback]();
	}
	__camBasesTick();
}

//Reset AI power back to highest storage possible.
function __camAiPowerReset()
{
	for (let i = 1; i < CAM_MAX_PLAYERS; ++i)
	{
		setPower(AI_POWER, i);
	}
}

// Increment a unit's needle count by one.
// If the unit's needle count reaches 3, cause an explosion and reset the count.
// If no arguments are passed, decrement all needle counts by 1.
function __updateNeedlerLog(target)
{
	if (camDef(target))
	{
		// Find if the target is already in the log
		for (var i = 0; i < __camNeedlerLog.length; i++)
		{
			if (__camNeedlerLog[i].droid.id === target.id)
			{
				// Found the unit already in the log
				__camNeedlerLog[i].needleCount++;
				if (__camNeedlerLog[i].needleCount >= 3)
				{
					// Cause an explosion
					fireWeaponAtObj("NeedlerSC", target);
					__camNeedlerLog[i].needleCount = 0;
				}
				return; // All done
			}
		}
		// Didn't find the target in the log; add it
		__camNeedlerLog.push({droid: target, needleCount: 1});
	}
	else
	{
		var newNeedlerLog = [];
		for (var i = 0; i < __camNeedlerLog.length; i++)
		{
			__camNeedlerLog[i].needleCount--;
			if (__camNeedlerLog[i].needleCount > 0)
			{
				// Continue to track this unit
				newNeedlerLog.push(__camNeedlerLog[i]);
			}
		}
		__camNeedlerLog = newNeedlerLog;
	}
}

// Cause an explosion after an explosive drum is destroyed
function __camDetonateDrum(boomBaitId)
{
	var bait = getObject(DROID, 10, boomBaitId);
	if (!camDef(bait))
	{
		return;
	}
	else
	{
		switch (camRand(3))
		{
		case 0:
			fireWeaponAtObj("ExplosiveDrumBlast1", bait);
			break;
		case 1:
			fireWeaponAtObj("ExplosiveDrumBlast2", bait);
			break;
		case 2:
			fireWeaponAtObj("ExplosiveDrumBlast3", bait);
			break;
		default:
			fireWeaponAtObj("ExplosiveDrumBlast1", bait);
		}
	}
}

// Cause an explosion after a nuclear drum is destroyed
function __camDetonateNukeDrum(boomBaitId)
{
	var bait = getObject(DROID, 10, boomBaitId);
	if (!camDef(bait))
	{
		return;
	}
	else
	{
		fireWeaponAtObj("NuclearDrumBlast", bait);
	}
}

// Play an Enderman's teleportation sound effect
function __camPlayTeleportSfx(targetId)
{
	// Find our target
	var target;
	for (let i = 0; i < CAM_MAX_PLAYERS; i++)
	{
		target = getObject(DROID, i, targetId);
		if (target !== null)
		{
			break;
		}
	}
	
	if (!camDef(target) || target === null)
	{
		return;
	}
	else
	{
		fireWeaponAtObj("TeleportSFX", target);
	}
}

// Play a decloaking sound effect for Spy Cyborgs
function __camPlayDecloakSfx(targetId)
{
	// Find our target
	var target;
	for (let i = 0; i < CAM_MAX_PLAYERS; i++)
	{
		target = getObject(DROID, i, targetId);
		if (target !== null)
		{
			break;
		}
	}
	
	if (!camDef(target) || target === null)
	{
		return;
	}
	else
	{
		fireWeaponAtObj("DeadRingerSFX", target);
	}
}

// Play a sound to signify Spy Cyborgs that are ready to feign death once again
function __camPlayFeignReadySfx(targetId)
{
	// Find our target
	var target;
	for (let i = 0; i < CAM_MAX_PLAYERS; i++)
	{
		target = getObject(DROID, i, targetId);
		if (target !== null)
		{
			break;
		}
	}
	
	if (!camDef(target) || target === null)
	{
		return;
	}
	else
	{
		fireWeaponAtObj("DeadRingerReadySFX", target);
	}
}

// Detonate a Creeper, if it's still alive
function __camDetonateCreeper(targetId)
{
	// Find our target
	var target = null;
	for (let i = 0; i < CAM_MAX_PLAYERS; i++)
	{
		target = getObject(DROID, i, targetId); // Try to find the Creeper
		if (target !== null)
		{
			break;
		}
	}

	// Remove the Creeper from the list of primed ones
	__camPrimedCreepers.splice(__camPrimedCreepers.indexOf(targetId), 1);
	
	if (target === null)
	{
		// Creeper is already dead
		return;
	}
	else
	{
		// Kaboom
		fireWeaponAtObj("CreeperBlast", target, target.player);
	}
}

// Check if any Creepers should prime themselves
function __camScanCreeperRadii()
{
	// Loop through every Creeper on the map
	for (let i = 0; i < CAM_MAX_PLAYERS; i++)
	{
		let creepList = enumDroid(i, DROID_CYBORG, false).filter((dr) => (dr.body === "CreeperBody"));
		for (let j = 0; j < creepList.length; j++)
		{
			if (__camPrimedCreepers.indexOf(creepList[j].id) !== -1)
			{
				// Creeper is already primed!
				continue;
			}

			let creepPos = camMakePos(creepList[j]);

			// Check if any enemies are within 2 tiles
			if (enumRange(creepPos.x, creepPos.y, 2, ALL_PLAYERS, false).filter((obj) => (
				obj.type !== FEATURE && !allianceExistsBetween(creepList[j].player, obj.player)
			)).length > 0)
			{
				// Enemy in range, prepare for detonation!
				__camPrimedCreepers.push(creepList[j].id);
				fireWeaponAtObj("CreeperHissSFX", creepList[j]); // Play a gamer's nightmare-fuel
				queue("__camDetonateCreeper", camSecondsToMilliseconds(1.5), creepList[j].id + "");
			}
		}
	}
}

// See if any Monster Spawners should spawn anything
function __camMonsterSpawnerTick()
{
	// Loop through every Spawner on the map
	for (let i = 0; i < CAM_MAX_PLAYERS; i++)
	{
		let spawnerList = enumStruct(i, DEFENSE).filter((obj) => (
			obj.name === _("Creeper Spawner") || obj.name === _("Skeleton Spawner")
			|| obj.name === _("Zombie Spawner")
		));
		for (let j = 0; j < spawnerList.length; j++)
		{
			let spawnerPos = camMakePos(spawnerList[j]);

			// Check if any enemies are within range
			if (enumRange(spawnerPos.x, spawnerPos.y, CAM_SPAWNER_RANGE, CAM_HUMAN_PLAYER, false).filter((obj) => (
				obj.type !== FEATURE && !allianceExistsBetween(spawnerList[j].player, obj.player)
			)).length > 0)
			{
				// Enemy in range, try to spawn some mobs
				let numMobs = difficulty + camRand(1); // 3-4 on Normal
				let spawnedMobs = [];
				for (let k = 0; k < numMobs; k++)
				{
					let spawnPos = camGenerateRandomMapCoordinateWithinRadius(spawnerPos, 3, 1);
					var mob;
					switch (spawnerList[j].name)
					{
						case "Creeper Spawner":
							mob = {name: _("Creeper"), body: "CreeperBody", weap: "Cyb-Wpn-CreeperDud"};
							break;
						case "Skeleton Spawner":
							mob = {name: _("Skeleton"), body: "SkeletonBody", weap: "Cyb-Wpn-SkelBow"};
							break;
						case "Zombie Spawner":
							if (camRand(camChangeOnDiff(101)) < 5)
							{
								// Around a 5% chance to spawn a Baby Zombie instead
								mob = {name: _("Baby Zombie"), body: "BabyZombieBody", weap: "Cyb-Wpn-BabyZmbieMelee"};
							}
							else
							{
								mob = {name: _("Zombie"), body: "ZombieBody", weap: "Cyb-Wpn-ZmbieMelee"};
							}
							break;
						default:
							mob = {name: _("Zombie"), body: "ZombieBody", weap: "Cyb-Wpn-ZmbieMelee"};
							break;
					}
					// Spawn the mob
					spawnedMobs.push(addDroid(spawnerList[j].player, spawnPos.x, spawnPos.y, mob.name, mob.body, "CyborgLegs", "", "", mob.weap));
				}

				// Get the new mobs moving around
				camManageGroup(camMakeGroup(spawnedMobs), CAM_ORDER_ATTACK);
			}
		}
	}
}

// Called at the start of a mission
function __camRandomizeFungibleCannons()
{
	for (let i = 0; i < CAM_MAX_PLAYERS; i++)
	{
		// Replace units
		let drList = enumDroid(i);
		for (let j = 0; j < drList.length; j++)
		{
			let dr = drList[j];

			// Check if the droid has a Fungible Cannon
			if (camDef(dr.weapons[0]) && dr.weapons[0].name === "Cannon2A-TMk1")
			{
				// Check if this droid has a label and/or group assigned to it
				// FIXME: O(n) lookup here
				let label = (getLabel(dr));
				let group = (dr.group);

				// Replace the droid
				var newWeapon = __camFungibleCannonList[camRand(__camFungibleCannonList.length)];
				let droidInfo = {x: dr.x, y: dr.y, name: dr.name, body: dr.body, prop: dr.propulsion};
				camSafeRemoveObject(dr, false);
				let newDroid = addDroid(i, droidInfo.x, droidInfo.y, droidInfo.name, droidInfo.body,
					__camChangePropulsionOnDiff(droidInfo.prop), "", "", newWeapon);

				if (camDef(label)) 
				{
					addLabel(newDroid, label);
				}
				if (group !== null)
				{
					groupAdd(group, newDroid);
				}
			}
		}

		// Replace structures
		let strList = enumStruct(i, "WallTower03");
		for (let j = 0; j < strList.length; j++)
		{
			let str = strList[j];

			// Check if this structure has a label and/or group assigned to it
			// FIXME: O(n) lookup here
			let label = (getLabel(str));
			let group = (str.group);

			// Replace the structure
			let structInfo = {x: str.x * 128, y: str.y * 128};
			camSafeRemoveObject(str, false);
			let newStruct = addStructure(__camFungibleCanHardList[camRand(__camFungibleCanHardList.length)], i, structInfo.x, structInfo.y);

			if (camDef(label)) 
			{
				addLabel(newStruct, label);
			}
			if (group !== null)
			{
				groupAdd(group, newStruct);
			}
		}
	}
}

// Play a random cave sound
function __camPlayCaveSounds()
{
	let caveSounds = [
		"Cave1.ogg", "Cave2.ogg", "Cave3.ogg",
		"Cave4.ogg", "Cave5.ogg", "Cave6.ogg",
		"Cave7.ogg", "Cave8.ogg", "Cave9.ogg",
		"Cave10.ogg", "Cave11.ogg", "Cave12.ogg",
		"Cave13.ogg", "Cave14.ogg", "Cave15.ogg",
		"Cave16.ogg", "Cave17.ogg", "Cave18.ogg",
		"Cave19.ogg", 
	];

	playSound(caveSounds[camRand(caveSounds.length)]);
}

// Reset the sun back to its standard position and intensity, and end all black out effects
function __camEndBlackOut()
{
	camResetSun();
	removeTimer("__camPlayCaveSounds");
	__camBlackOut = false;
}

// Fake a Spy Cyborg's demise
function __camSpyFeignDeath(spy, attacker)
{
	// Check if this cyborg is already feigning (since this function also gets called from cam_eventDestroyed())
	for (let i = 0; i < __camSpyFeigns.length; i++)
	{
		if (__camSpyFeigns[i].id === spy.id)
		{
			return; // Already feigning
		}
	}

	// Store Spy Cyborg stats
	if (spy.player !== CAM_HUMAN_PLAYER)
	{
		// Store ID, XP, group, attacker, feign position, player owner, and "death" time
		__camSpyFeigns.push({id: spy.id, xp: spy.experience, group: spy.group,
			attacker: attacker, pos: camMakePos(spy), player: spy.player,
			time: gameTime});
	}
	else
	{
		// Store ID, XP, player owner, and "death" time
		__camSpyFeigns.push({id: spy.id, xp: spy.experience, player: spy.player, time: gameTime});
	}

	if (camDef(attacker))
	{
		// Explode the Spy Cyborg
		camSafeRemoveObject(spy, true);
	}
}

// Check if any "dead" Spy Cyborgs are due to reappear
// Also allow Spy Cyborgs to feign death if their cooldowns have expired
function __camSpyFeignTick()
{
	// Check for any not-so-dead Spy Cyborgs
	for (let i = __camSpyFeigns.length - 1; i >= 0; i--)
	{
		if (gameTime >= __camSpyFeigns[i].time + CAM_SPY_FEIGN_DURATION)
		{
			// Make the Spy reappear...
			let pos = null;
			if (__camSpyFeigns[i].player === CAM_HUMAN_PLAYER)
			{
				// ...At the player's HQ / LZ
				let hqs = enumStruct(CAM_HUMAN_PLAYER, HQ);
				if (camDef(hqs[0]))
				{
					// Pick somewhere near the HQ
					pos = camGenerateRandomMapCoordinateWithinRadius(camMakePos(hqs[0]), 3, 1);
				}
				else
				{
					// Pick somehwere at the LZ
					const LZ_NAMES = ["landingZone", "LZ"]; // Bit of a brain-dead solution but oh well
					for (let j = 0; j < LZ_NAMES.length; j++)
					{
						if (camDef(getObject(LZ_NAMES[j])) && getObject(LZ_NAMES[j]) !== null)
						{
							pos = camRandPosInArea(LZ_NAMES[j]);
							break;
						}
					}
					if (pos === null)
					{
						console("Could not find an LZ to place Spy Cyborg at!");
						__camSpyFeigns.splice(i, 1);
						continue;
					}
				}
			}
			else
			{
				// ...Near it's "killer"
				let killer = __camSpyFeigns[i].attacker;
				if (camDef(killer) && killer !== null)
				{
					// Pick somewhere near the attacker
					pos = camGenerateRandomMapCoordinateWithinRadius(camMakePos(killer), 6, 1);
				}
				else
				{
					// Pick somewhere near where the spy feigned
					pos = camGenerateRandomMapCoordinateWithinRadius(__camSpyFeigns[i].pos, 6, 1);
				}
			}
			let newSpy = addDroid(__camSpyFeigns[i].player, pos.x, pos.y, 
				_("Spy Cyborg"), "CyborgLightBody", "CyborgLegs", "", "", "CyborgSpyChaingun"
			);
			queue("__camPlayDecloakSfx", CAM_TICKS_PER_FRAME, newSpy.id + "");
			setHealth(newSpy, 40);
			setDroidExperience(newSpy, __camSpyFeigns[i].xp); // Restore the spy's experience
			if (__camSpyFeigns[i].player != CAM_HUMAN_PLAYER)
			{
				let spyGroup = __camSpyFeigns[i].group;
				// Try placing the spy back into it's old group (if it's still active)
				if (camDef(__camGroupInfo[spyGroup]))
				{
					groupAdd(spyGroup, newSpy);
				}
				else
				{
					// Make a new group
					camManageGroup(camMakeGroup(newSpy), CAM_ORDER_ATTACK);
				}
			}
			__camSpyCooldowns.push({id: newSpy.id, time: gameTime}); // Prevent the spy from feigning again for a bit
			__camSpyFeigns.splice(i, 1); // Remove this spy from the list of "dead" spies
		}
	}

	// Remove Spy Cyborgs off the cooldown list if enough time has passed
	for (let i = __camSpyCooldowns.length - 1; i >= 0; i--)
	{
		if (gameTime >= __camSpyCooldowns[i].time + CAM_SPY_FEIGN_COOLDOWN)
		{
			// Play an effect signifying that the Cyborg can feign death again
			__camPlayFeignReadySfx(__camSpyCooldowns[i].id);
			__camSpyCooldowns.splice(i, 1); // Remove this spy from the cooldown list
		}
	}
}