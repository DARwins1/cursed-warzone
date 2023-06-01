
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
		(enumRange(pos.x, pos.y, scanObjectRadius, ALL_PLAYERS, false).length > 0)));

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
	} while (camDef(center) &&
		center &&
		(!propulsionCanReach("wheeled01", center.x, center.y, pos.x, pos.y) ||
		(camDist(pos, center) > radius) ||
		(enumRange(pos.x, pos.y, scanObjectRadius, ALL_PLAYERS, false).length > 0)));

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
		fireWeaponAtObj("ExplosiveDrumBlast", bait);
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
		if (camDef(target))
		{
			break;
		}
	}
	
	if (!camDef(target))
	{
		return;
	}
	else
	{
		fireWeaponAtObj("TeleportSFX", target);
	}
}

// Detonate a Creeper, if it's still alive
function __camDetonateCreeper(targetId)
{
	// Find our target
	var target;
	for (let i = 0; i < CAM_MAX_PLAYERS; i++)
	{
		target = getObject(DROID, i, targetId);
		if (camDef(target))
		{
			break;
		}
	}

	// Remove the Creeper from the list of primed ones
	__camPrimedCreepers.splice(__camPrimedCreepers.indexOf(targetId), 1);
	
	if (!camDef(target))
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