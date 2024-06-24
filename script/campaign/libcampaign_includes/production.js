
////////////////////////////////////////////////////////////////////////////////
// Factory production management.
////////////////////////////////////////////////////////////////////////////////

// To use this feature, call camSetFactories() with a list of factories.
// This assumes tactical management of groups of units produced from them.
// Factories won't start production immediately; call camEnableFactory()
// to turn them on.

//;; ## camSetFactories(factories)
//;;
//;; Tell `libcampaign.js` to manage a certain set of enemy factories.
//;; Management assumes producing droids, packing them into groups and
//;; executing orders once the group becomes large-enough.
//;; The argument is a JavaScript map from group labels to factory descriptions.
//;; Each label points to a factory object.
//;; Factory description is a JavaScript object with the following fields:
//;; * `assembly` A rally point position label, where the group would gather.
//;; * `order` An order to execute for every group produced in the factory. Same as the order parameter for `camManageGroup()`.
//;; * `data` Order data. Same as the data parameter for `camManageGroup()`.
//;; * `groupSize` Number of droids to produce before executing the order.
//;;   Also, if order is `CAM_ORDER_ATTACK`, data.count defaults to this value.
//;; * `maxSize` Halt production when reaching that many droids in the factory group.
//;;   Resume when some droids die. Unlimited if unspecified.
//;; * `throttle` If defined, produce droids only every that many milliseconds, and keep the factory idle between ticks.
//;; * `group` If defined, make the factory manage this group, otherwise create a new empty group to manage.
//;;   Droids produced in the factory would automatically be added to the group,
//;;   and order and data parameters would be applied to this group.
//;; * `templates` List of droid templates to produce in the factory.
//;;   Each template is a JavaScript object with the following fields:
//;;   * `body` Body stat name.
//;;   * `prop` Propulsion stat name.
//;;   * `weap` Weapon stat name. Only single-turret droids are currently supported.
//;;   Note that all template components are automatically made available to the factory owner.
//;; Factories won't start production immediately; call `camEnableFactory()` to turn them on when necessary.
//;;
//;; @param {Object} factories
//;; @returns {void}
//;;
function camSetFactories(factories)
{
	for (const factoryLabel in factories)
	{
		camSetFactoryData(factoryLabel, factories[factoryLabel]);
	}
}

//;; ## camSetFactoryData(factoryLabel, factoryData)
//;;
//;; Similar to `camSetFactories()`, but one factory at a time.
//;; If the factory was already managing a group of droids, it keeps managing it.
//;; If a new group is specified in the description, the old group is merged into it.
//;; NOTE: This function disables the factory. You would need to call `camEnableFactory()` again.
//;;
//;; @param {string} factoryLabel
//;; @param {Object} factoryData
//;; @returns {void}
//;;
function camSetFactoryData(factoryLabel, factoryData)
{
	const structure = getObject(factoryLabel);
	if (!camDef(structure) || !structure)
	{
		// Not an error! It's ok if the factory is already destroyed
		// when its data was updated.
		camTrace("Factory", factoryLabel, "not found");
		return;
	}
	// remember the old factory group, if any
	let droids = [];
	if (camDef(__camFactoryInfo[factoryLabel]))
	{
		droids = enumGroup(__camFactoryInfo[factoryLabel].group);
	}
	__camFactoryInfo[factoryLabel] = factoryData;
	const fi = __camFactoryInfo[factoryLabel];
	if (!camDef(fi.data))
	{
		fi.data = {};
	}
	fi.enabled = false;
	fi.state = 0;
	if (!camDef(fi.group))
	{
		fi.group = camNewGroup();
	}
	for (let i = 0, l = droids.length; i < l; ++i)
	{
		const droid = droids[i];
		groupAdd(fi.group, droid);
	}
	if (!camDef(fi.data.count))
	{
		fi.data.count = fi.groupSize;
	}
}

//;; ## camEnableFactory(factoryLabel)
//;;
//;; Enable a managed factory by the given label.
//;; Once the factory is enabled, it starts producing units and executing orders as given.
//;;
//;; @param {string} factoryLabel
//;; @returns {void}
//;;
function camEnableFactory(factoryLabel)
{
	const fi = __camFactoryInfo[factoryLabel];
	if (!camDef(fi) || !fi)
	{
		camDebug("Factory not managed", factoryLabel);
		return;
	}
	if (fi.enabled)
	{
		// safe, no error
		camTrace("Factory", factoryLabel, "enabled again");
		return;
	}
	camTrace("Enabling", factoryLabel);
	fi.enabled = true;
	const obj = getObject(factoryLabel);
	if (!camDef(obj) || !obj)
	{
		camTrace("Factory", factoryLabel, "not found, probably already dead");
		return;
	}
	__camContinueProduction(factoryLabel);
	__camFactoryUpdateTactics(factoryLabel);
}

//;; ## camQueueDroidProduction(playerId, template)
//;;
//;; Queues up an extra droid template for production.
//;; It would be produced in the first factory that is capable of producing it,
//;; at the end of its production loop, first queued first served.
//;;
//;; @param {number} playerId
//;; @param {Object} template
//;; @returns {void}
//;;
function camQueueDroidProduction(playerId, template)
{
	if (!camDef(__camFactoryQueue[playerId]))
	{
		__camFactoryQueue[playerId] = [];
	}
	__camFactoryQueue[playerId][__camFactoryQueue[playerId].length] = template;
}

//;; ## camSetPropulsionTypeLimit([limit])
//;;
//;; This function can automatically augment units to use Type I/II/III propulsions.
//;; If nothing or zero is passed in then the type limit will match what is in templates.json.
//;;
//;; @param {number} [limit]
//;; @returns {void}
//;;
function camSetPropulsionTypeLimit(limit)
{
	if (!camDef(limit) || !limit)
	{
		__camPropulsionTypeLimit = "NO_USE";
	}
	else if (limit === 1)
	{
		__camPropulsionTypeLimit = "01";
	}
	else if (limit === 2)
	{
		__camPropulsionTypeLimit = "02";
	}
	else if (limit === 3)
	{
		__camPropulsionTypeLimit = "03";
	}
	else
	{
		camTrace("Unknown propulsion level specified. Use 1 - 3 to force the propulsion type, 0 to disable.");
	}
}

//;; ## camUpgradeOnMapTemplates(template1, template2, playerId[, excluded])
//;;
//;; Search for `template1`, save its coordinates, remove it, and then replace with it with `template2`.
//;; Template objects are expected to follow the component properties as used in `templates.js`.
//;; A fourth parameter can be specified to ignore specific object IDs.
//;; Useful if a droid is assigned to an object label. It can be either an array or a single ID number.
//;;
//;; @param {Object} template1
//;; @param {Object} template2
//;; @param {number} playerId
//;; @param {number|number[]} [excluded]
//;; @returns {void}
//;;
function camUpgradeOnMapTemplates(template1, template2, playerId, excluded)
{
	if (!camDef(template1) || !camDef(template2) || !camDef(playerId))
	{
		camDebug("Not enough parameters specified for upgrading on map templates");
		return;
	}

	const droidsOnMap = enumDroid(playerId);

	for (let i = 0, l = droidsOnMap.length; i < l; ++i)
	{
		const dr = droidsOnMap[i];
		if (!camDef(dr.weapons[0]))
		{
			continue; //don't handle systems
		}
		const __BODY = dr.body;
		const __PROP = dr.propulsion;
		const __WEAP = dr.weapons[0].name;
		let skip = false;
		if (__BODY === template1.body && __PROP === template1.prop && __WEAP === template1.weap)
		{
			//Check if this object should be excluded from the upgrades
			if (camDef(excluded))
			{
				if (excluded instanceof Array)
				{
					for (let j = 0, c = excluded.length; j < c; ++j)
					{
						if (dr.id === excluded[j])
						{
							skip = true;
							break;
						}
					}
					if (skip === true)
					{
						continue;
					}
				}
				else if (dr.id === excluded)
				{
					continue;
				}
			}

			//Check if this object has a label and/or group assigned to it
			// FIXME: O(n) lookup here
			const __DROID_LABEL = getLabel(dr);
			const __DROID_GROUP = dr.group;

			//Replace it
			const droidInfo = {x: dr.x, y: dr.y, name: dr.name};
			camSafeRemoveObject(dr, false);
			const newDroid = addDroid(playerId, droidInfo.x, droidInfo.y, droidInfo.name, template2.body,
				__camChangePropulsion(template2.prop, playerId), "", "", template2.weap);

			if (camDef(__DROID_LABEL)) 
			{
				addLabel(newDroid, __DROID_LABEL);
			}
			if (__DROID_GROUP !== null)
			{
				groupAdd(__DROID_GROUP, newDroid);
			}
			camSetDroidExperience(newDroid);
		}
	}
}

//;; ## camUpgradeOnMapStructures(struct1, struct2, playerId[, excluded])
//;;
//;; Search for struct1, save its coordinates, remove it, and then replace with it
//;; with struct2. A fourth parameter can be specified to ignore specific object
//;; IDs. Useful if a structure is assigned to an object label. It can be either an array
//;; or a single ID number. Unortunatly, structure rotation is not preserved.
//;; If a structure has a label or group, it will be transferred to the replacement, but if the
//;; structure has multiple labels, then only one label will be transferred.
//;;
//;; @param {Object} struct1
//;; @param {Object} struct2
//;; @param {number} playerId
//;; @param {number|number[]} [excluded]
//;; @returns {void}
//;;
function camUpgradeOnMapStructures(struct1, struct2, playerId, excluded)
{
	if (!camDef(struct1) || !camDef(struct2) || !camDef(playerId))
	{
		camDebug("Not enough parameters specified for upgrading on map structures");
		return;
	}

	const structsOnMap = enumStruct(playerId, struct1);

	for (let i = 0, l = structsOnMap.length; i < l; ++i)
	{
		const structure = structsOnMap[i];
		let skip = false;
		
		//Check if this object should be excluded from the upgrades
		if (camDef(excluded))
		{
			if (excluded instanceof Array)
			{
				for (let j = 0, c = excluded.length; j < c; ++j)
				{
					if (structure.id === excluded[j])
					{
						skip = true;
						break;
					}
				}
				if (skip === true)
				{
					continue;
				}
			}
			else if (structure.id === excluded)
			{
				continue;
			}
		}

		//Check if this object has a label and/or group assigned to it
		// FIXME: O(n) lookup here
		const label = getLabel(structure);
		const group = structure.group;

		//Replace it
		const structInfo = {x: structure.x * 128, y: structure.y * 128};
		camSafeRemoveObject(structure, false);
		const newStruct = addStructure(struct2, playerId, structInfo.x, structInfo.y);

		// Re-add label/group if applicable
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

//;; ## camUpgradeOnMapFeatures(feat1, feat2[, excluded])
//;;
//;; Search for feat1, save its coordinates, remove it, and then replace with it
//;; with feat2. A third parameter can be specified to ignore specific object
//;; IDs. Useful if a feature is assigned to an object label. It can be either an array
//;; or a single ID number. Unortunatly, feature rotation is not preserved.
//;; If a feature has a label or group, it will be transferred to the replacement, but if the
//;; feature has multiple labels, then only one label will be transferred.
//;;
//;; @param {Object} struct1
//;; @param {Object} struct2
//;; @param {number|number[]} [excluded]
//;; @returns {void}
//;;
function camUpgradeOnMapFeatures(feat1, feat2, excluded)
{
	if (!camDef(feat1) || !camDef(feat2))
	{
		camDebug("Not enough parameters specified for upgrading on map features");
		return;
	}

	const featsOnMap = enumFeature(ALL_PLAYERS, feat1);

	for (let i = 0, l = featsOnMap.length; i < l; ++i)
	{
		const feature = featsOnMap[i];
		let skip = false;
		
		//Check if this object should be excluded from the upgrades
		if (camDef(excluded))
		{
			if (excluded instanceof Array)
			{
				for (let j = 0, c = excluded.length; j < c; ++j)
				{
					if (feature.id === excluded[j])
					{
						skip = true;
						break;
					}
				}
				if (skip === true)
				{
					continue;
				}
			}
			else if (feature.id === excluded)
			{
				continue;
			}
		}

		//Check if this object has a label assigned to it
		// FIXME: O(n) lookup here
		const label = getLabel(feature);

		//Replace it
		camSafeRemoveObject(feature, false);
		let featName;
		if (feat2 === "Pipis" && camRand(100) < 1)
		{
			// 1/100 chance to place a Ms. Pipis instead of a normal Pipis
			featName = "PipisM";
		}
		else if (feat2 === "PipisDummy" && camRand(100) < 1)
		{
			// 1/100 chance to place a Ms. Pipis Dummy instead of a normal Pipis Dummy
			featName = "PipisMDummy";
		}
		else if (feat2 === "SpamSign")
		{
			// Choose a random Spamton Sign from the list
			featName = __camSpamtonSigns[camRand(__camSpamtonSigns.length)];
		}
		else
		{
			featName = feat2;
		}

		// Compile all the needed information into a string
		let infoString = 
			"__FEATNAME" + featName
			+ "__XPOS" + feature.x
			+ "__YPOS" + feature.y;
		if (camDef(label)) infoString += "__LABEL" + label;
		// Queue up a replacement
		queue("__camQueueReplacementFeat", __CAM_TICKS_PER_FRAME, infoString);
	}
}

//////////// privates

function __camFactoryUpdateTactics(flabel)
{
	const fi = __camFactoryInfo[flabel];
	if (!fi.enabled)
	{
		camDebug("Factory", flabel, "was not enabled");
		return;
	}
	const droids = enumGroup(fi.group);
	if (droids.length >= fi.groupSize)
	{
		camManageGroup(fi.group, fi.order, fi.data);
		fi.group = camNewGroup();
	}
	else
	{
		let pos = camMakePos(fi.assembly);
		if (!camDef(pos))
		{
			pos = camMakePos(flabel);
		}
		camManageGroup(fi.group, CAM_ORDER_DEFEND, { pos: pos });
	}
}

function __camAddDroidToFactoryGroup(droid, structure)
{
	// don't manage trucks in this function
	if (droid.droidType === DROID_CONSTRUCT)
	{
		return;
	}
	// FIXME: O(n) lookup here
	const __FLABEL = getLabel(structure);
	if (!camDef(__FLABEL) || !__FLABEL)
	{
		return;
	}
	const fi = __camFactoryInfo[__FLABEL];
	groupAdd(fi.group, droid);
	if (camDef(fi.assembly))
	{
		// this is necessary in case droid is regrouped manually
		// in the scenario code, and thus DORDER_DEFEND for assembly
		// will not be applied in __camFactoryUpdateTactics()
		const pos = camMakePos(fi.assembly);
		orderDroidLoc(droid, DORDER_MOVE, pos.x, pos.y);
	}
	__camFactoryUpdateTactics(__FLABEL);
}

function __camChangePropulsion(propulsion, playerId)
{
	if (__camPropulsionTypeLimit === "NO_USE" || playerId === CAM_HUMAN_PLAYER)
	{
		return propulsion;
	}

	let name = propulsion;
	const validProp = ["CyborgLegs", "HalfTrack", "V-Tol", "hover", "tracked", "wheeled"];
	const specProps = ["CyborgLegs", "HalfTrack", "V-Tol"]; //Some have "01" at the end and others don't for the base ones.

	const __LAST_TWO = name.substring(name.length - 2);
	if (__LAST_TWO === "01" || __LAST_TWO === "02" || __LAST_TWO === "03")
	{
		name = name.substring(0, name.length - 2);
	}

	for (let i = 0, l = validProp.length; i < l; ++i)
	{
		const __CURRENT_PROP = validProp[i];
		if (name === __CURRENT_PROP)
		{
			if ((__camPropulsionTypeLimit === "01") && (specProps.indexOf(__CURRENT_PROP) !== -1))
			{
				return __CURRENT_PROP;
			}
			return __CURRENT_PROP.concat(__camPropulsionTypeLimit);
		}
	}

	//If all else fails then return the propulsion that came with the template
	return propulsion;
}

function __camBuildDroid(template, structure)
{
	if (!camDef(structure))
	{
		return false;
	}
	//if not a normal factory and the template is a constructor then keep it in the
	//queue until a factory can deal with it.
	if ((template.weap === "Spade1Mk1" || template.weap === "Spade1Mk1Spam") && structure.stattype !== FACTORY)
	{
		return false;
	}
	const __PROP = __camChangePropulsion(template.prop, structure.player);
	makeComponentAvailable(template.body, structure.player);
	makeComponentAvailable(__PROP, structure.player);
	const __NAME = camNameTemplate(template.weap, template.body, __PROP);
	// multi-turret templates are NOW supported :)
	if (typeof template.weap === "object" && camDef(template.weap[2]))
	{
		makeComponentAvailable(template.weap[0], structure.player);
		makeComponentAvailable(template.weap[1], structure.player);
		makeComponentAvailable(template.weap[2], structure.player);
		return buildDroid(structure, __NAME, template.body, __PROP, "", "", template.weap[0], template.weap[1], template.weap[2]);
	}
	else if (typeof template.weap === "object" && camDef(template.weap[1]))
	{
		makeComponentAvailable(template.weap[0], structure.player);
		makeComponentAvailable(template.weap[1], structure.player);
		return buildDroid(structure, __NAME, template.body, __PROP, "", "", template.weap[0], template.weap[1]);
	}
	else
	{
		makeComponentAvailable(template.weap, structure.player);
		return buildDroid(structure, __NAME, template.body, __PROP, "", "", template.weap);
	}
}

//Check if an enabled factory can begin manufacturing something. Doing this
//by timer has the perk of not breaking production if something went wrong in
//cam_eventDroidBuilt (or the mere act of reloading saves).
function __checkEnemyFactoryProductionTick()
{
	for (const flabel in __camFactoryInfo)
	{
		if (getObject(flabel) !== null && __camFactoryInfo[flabel].enabled === true)
		{
			__camContinueProduction(flabel);
		}
	}
}

function __camContinueProduction(structure)
{
	let flabel;
	let struct;
	if (camIsString(structure))
	{
		flabel = structure;
		struct = getObject(flabel);
		if (!camDef(struct) || !struct)
		{
			camTrace("Factory not found");
			return;
		}
	}
	else
	{
		// FIXME: O(n) lookup here
		flabel = getLabel(structure);
		struct = structure;
	}
	if (!camDef(flabel) || !flabel)
	{
		return;
	}
	if (!structureIdle(struct))
	{
		return;
	}
	const fi = __camFactoryInfo[flabel];
	if (camDef(fi.maxSize) && groupSize(fi.group) >= fi.maxSize)
	{
		// retry later
		return;
	}
	if (camDef(fi.throttle) && camDef(fi.lastprod))
	{
		const __THROTTLE = gameTime - fi.lastprod;
		if (__THROTTLE < fi.throttle)
		{
			// do throttle
			return;
		}
	}
	// check factory queue after every loop
	if (fi.state === -1)
	{
		fi.state = 0;
		const __PL = struct.player;
		if (camDef(__camFactoryQueue[__PL]) && __camFactoryQueue[__PL].length > 0)
		{
			if (__camBuildDroid(__camFactoryQueue[__PL][0], struct))
			{
				__camFactoryQueue[__PL].shift();
				return;
			}
		}
	}
	__camBuildDroid(fi.templates[fi.state], struct);
	// loop through templates
	++fi.state;
	if (fi.state >= fi.templates.length)
	{
		fi.state = -1;
	}
	fi.lastprod = gameTime;
}

// Add a feature with the information given in the string
function __camQueueReplacementFeat(infoString)
{
	// Parse the info string
	const nameMarker = "__FEATNAME";
	const xMarker = "__XPOS";
	const yMarker = "__YPOS";
	const labelMarker = "__LABEL";
	const __NAMEINDEX = infoString.indexOf(nameMarker);
	const __XINDEX = infoString.indexOf(xMarker);
	const __YINDEX = infoString.indexOf(yMarker);
	const __LABELINDEX = infoString.indexOf(labelMarker);

	const featName = infoString.substring(__NAMEINDEX + nameMarker.length, __XINDEX);
	const __XPOS = parseInt(infoString.substring(__XINDEX + xMarker.length, __YINDEX));
	const __YPOS = parseInt(infoString.substring(__YINDEX + yMarker.length, ((__LABELINDEX > 0) ? __LABELINDEX : undefined)));
	const label = (__LABELINDEX > 0) ? infoString.substring(__LABELINDEX + labelMarker.length) : undefined;

	// Add the feature
	const newFeat = addFeature(featName, __XPOS, __YPOS);
	// Apply label/group
	if (camDef(label)) 
	{
		addLabel(newFeat, label);
	}
}
