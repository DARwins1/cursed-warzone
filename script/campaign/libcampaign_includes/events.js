
////////////////////////////////////////////////////////////////////////////////
// Campaign library events.
////////////////////////////////////////////////////////////////////////////////

function cam_eventPickup(feature, droid)
{
	if (feature.stattype === ARTIFACT)
	{
		__camPickupArtifact(feature);
	}
}

function cam_eventGroupLoss(obj, group, newsize)
{
	if (__camSaveLoading === true)
	{
		return;
	}
	if (newsize === 0)
	{
		__camCheckBaseEliminated(group);
	}
	if (camDef(__camGroupInfo[group]))
	{
		profile("__camCheckGroupMorale", group);
	}
}

function cam_eventCheatMode(entered)
{
	if (entered)
	{
		__camCheatMode = true;
		camTrace("Cheats enabled!");
	}
	else
	{
		camTrace("Cheats disabled!");
		__camCheatMode = false;
	}
	__camUpdateMarkedTiles();
}

function cam_eventChat(from, to, message)
{
	if (message === "win info")
	{
		__camShowVictoryConditions();
	}
	if (!camIsCheating())
	{
		return;
	}
	camTrace(from, to, message);
	if (message === "let me win" && __camNextLevel !== "SURFACE_TENSION")
	{
		__camLetMeWin();
	}
	if (message === "make cc")
	{
		setMiniMap(true);
		setDesign(true);
	}
	if (message.lastIndexOf("ascend ", 0) === 0)
	{
		__camNextLevel = message.substring(7).toUpperCase().replace(/-/g, "_");
		__camLetMeWin();
	}
	if (message === "deity")
	{
		for (const baseLabel in __camEnemyBases)
		{
			camDetectEnemyBase(baseLabel);
		}
	}
	if (message === "research available")
	{
		while (true) // eslint-disable-line no-constant-condition
		{
			var research = enumResearch();
			if (research.length === 0)
			{
				break;
			}
			for (let i = 0, len = research.length; i < len; ++i)
			{
				var researchName = research[i].name;
				completeResearch(researchName, CAM_HUMAN_PLAYER);
			}
		}
	}
}

function cam_eventStartLevel()
{
	receiveAllEvents(true);
	// Variables initialized here are the ones that should not be
	// re-initialized on save-load. Otherwise, they are initialized
	// on the global scope (or wherever necessary).
	__camGroupInfo = {};
	__camFactoryInfo = {};
	__camFactoryQueue = {};
	__camTruckInfo = {};
	__camNeedBonusTime = false;
	__camDefeatOnTimeout = false;
	__camRTLZTicker = 0;
	__camLZCompromisedTicker = 0;
	__camLastAttackTriggered = false;
	__camLevelEnded = false;
	__camPlayerTransports = {};
	__camIncomingTransports = {};
	__camTransporterQueue = [];
	__camNumArtifacts = 0;
	__camArtifacts = {};
	__camNumEnemyBases = 0;
	__camEnemyBases = {};
	__camVtolDataSystem = [];
	__camLastNexusAttack = 0;
	__camNexusActivated = false;
	__camNewGroupCounter = 0;
	__camVideoSequences = [];
	__camSaveLoading = false;
	__camNeverGroupDroids = [];
	__camNumTransporterExits = 0;
	__camAllowVictoryMsgClear = true;
	__camNeedlerLog = [];
	__camPrimedCreepers = [];
	__camBlackOut = false;
	__camSunPosition = {x: 225.0, y: -600.0, z: 450.0};
	__camSunIntensity = {ar: 0.5, ag: 0.5, ab: 0.5, dr: 1, dg: 1, db: 1, sr: 1, sg: 1, sb: 1};
	__camRandomizeFungibleCannons(); // Randomize all the Fungible Cannons on the map
	camSetPropulsionTypeLimit(); //disable the propulsion changer by default
	__camAiPowerReset(); //grant power to the AI
	setTimer("__camSpawnVtols", camSecondsToMilliseconds(0.5));
	setTimer("__camRetreatVtols", camSecondsToMilliseconds(0.9));
	setTimer("__checkVtolSpawnObject", camSecondsToMilliseconds(5));
	setTimer("__checkEnemyFactoryProductionTick", camSecondsToMilliseconds(0.8));
	setTimer("__camTick", camSecondsToMilliseconds(1)); // campaign pollers
	setTimer("__camTruckTick", camSecondsToMilliseconds(10) + camSecondsToMilliseconds(0.1)); // some slower campaign pollers
	setTimer("__camAiPowerReset", camMinutesToMilliseconds(3)); //reset AI power every so often
	setTimer("__camShowVictoryConditions", camMinutesToMilliseconds(5));
	setTimer("__camTacticsTick", camSecondsToMilliseconds(0.1));
	setTimer("__camScanCreeperRadii", camSecondsToMilliseconds(0.2));
	setTimer("__updateNeedlerLog", camSecondsToMilliseconds(8));
	setTimer("__camMonsterSpawnerTick", camSecondsToMilliseconds(16));
	queue("__camShowBetaHintEarly", camSecondsToMilliseconds(4));
	queue("__camGrantSpecialResearch", camSecondsToMilliseconds(6));
}

function cam_eventDroidBuilt(droid, structure)
{
	if ((camDef(droid.weapons[0]) && droid.weapons[0].name === "Cannon2A-TMk1") 
		|| (camDef(droid.weapons[1]) && droid.weapons[1].name === "Cannon2A-TMk1"))
	{
		// Swap the standard Fungible Cannon for a random varient
		completeResearch(__camFungibleCanSwapList[camRand(__camFungibleCanSwapList.length)], droid.player, true);
		makeComponentAvailable("Cannon2A-TMk1", droid.player); // Prevent the Fungible Cannon from being marked obsolete
	}

	if (!camDef(structure)) // "clone wars" cheat
	{
		return;
	}
	if (!camPlayerMatchesFilter(structure.player, ENEMIES))
	{
		return;
	}
	if (!camPlayerMatchesFilter(droid.player, ENEMIES))
	{
		return;
	}
	if (!camDef(__camFactoryInfo))
	{
		return;
	}
	__camAddDroidToFactoryGroup(droid, structure);
}

function cam_eventStructureBuilt(structure, droid)
{
	if (!camDef(structure))
	{
		return;
	}
	if (structure.name === _("Explosive Drum"))
	{
		// Swap out the structure for the feature object
		let pos = {x: structure.x, y: structure.y};
		camSafeRemoveObject(structure);
		addFeature("ExplosiveDrum", pos.x, pos.y);
	}
	if (structure.name === _("Nuclear Drum"))
	{
		// Swap out the structure for the feature object
		let pos = {x: structure.x, y: structure.y};
		camSafeRemoveObject(structure);
		addFeature("NuclearDrum", pos.x, pos.y);
	}
	else if (structure.name === _("Fungible Cannon Hardpoint"))
	{
		// Check if this structure has a label and/or group assigned to it
		// FIXME: O(n) lookup here
		let label = (getLabel(structure));
		let group = (structure.group);

		// Replace the structure
		let structInfo = {x: structure.x * 128, y: structure.y * 128, player: structure.player};
		camSafeRemoveObject(structure, false);
		let newStruct = addStructure(__camFungibleCanHardList[camRand(__camFungibleCanHardList.length)], structInfo.player, structInfo.x, structInfo.y);

		if (camDef(label)) 
		{
			addLabel(newStruct, label);
		}
		if (group !== null)
		{
			groupAdd(group, newStruct);
		}
	}
	else if (structure.name === _("Mystery Box"))
	{
		// Destroy the box and cause a random effect at its location
		let pos = {x: structure.x, y: structure.y};
		camSafeRemoveObject(structure, true);
		camRandomEffect(pos);
	}
}

function cam_eventDestroyed(obj)
{
	__camCheckPlaceArtifact(obj);
	if (obj.type === DROID)
	{
		if (obj.droidType === DROID_CONSTRUCT)
		{
			__camCheckDeadTruck(obj);
		}
		else if (camIsTransporter(obj))
		{
			__camRemoveIncomingTransporter(obj.player);
			if (obj.player === CAM_HUMAN_PLAYER)
			{
				// Player will lose if their transporter gets destroyed
				__camGameLost();
				return;
			}
			if (camDef(__camPlayerTransports[obj.player]))
			{
				delete __camPlayerTransports[obj.player];
			}
		}
	}
	else if (obj.type === FEATURE)
	{
		if (obj.name === _("Explosive Drum"))
		{
			var boomBaitId = addDroid(10, obj.x, obj.y, "Boom Bait",
				"B4body-sml-trike01", "BaBaProp", "", "", "BabaTrikeMG").id; // Spawn a trike...
			queue("__camDetonateDrum", CAM_TICKS_PER_FRAME, boomBaitId + ""); // ...then blow it up
		}
		else if (obj.name === _("Nuclear Drum"))
		{
			var boomBaitId = addDroid(10, obj.x, obj.y, "Boom Bait",
				"B4body-sml-trike01", "BaBaProp", "", "", "BabaTrikeMG").id; // Spawn a trike...
			queue("__camDetonateNukeDrum", CAM_TICKS_PER_FRAME, boomBaitId + ""); // ...then blow it up
		}
	}
}

function cam_eventObjectSeen(viewer, seen)
{
	__camCheckBaseSeen(seen);
}

function cam_eventGroupSeen(viewer, group)
{
	__camCheckBaseSeen(group);
}

function cam_eventTransporterExit(transport)
{
	camTrace("Transporter for player", transport.player + " has exited");

	if (transport.player === CAM_HUMAN_PLAYER)
	{
		__camNumTransporterExits += 1;

		//Audio cue to let the player know they can bring in reinforcements. This
		//assumes the player can bring in reinforcements immediately after the first
		//transporter leaves the map. Mission scripts can handle special situations.
		if (__camNumTransporterExits === 1 &&
			((__camWinLossCallback === CAM_VICTORY_OFFWORLD &&
			__camVictoryData.reinforcements > -1) ||
			__camWinLossCallback === CAM_VICTORY_STANDARD))
		{
			const REINFORCEMENTS_AVAILABLE_SOUND = "pcv440.ogg";
			playSound(REINFORCEMENTS_AVAILABLE_SOUND);
		}
	}

	if (transport.player !== CAM_HUMAN_PLAYER ||
		(__camWinLossCallback === CAM_VICTORY_STANDARD &&
		transport.player === CAM_HUMAN_PLAYER))
	{
		__camRemoveIncomingTransporter(transport.player);
	}
	else if (__camWinLossCallback === CAM_VICTORY_PRE_OFFWORLD)
	{
		camTrace("Transporter is away.");
		__camGameWon();
	}
}

function cam_eventTransporterLanded(transport)
{
	if (transport.player !== CAM_HUMAN_PLAYER)
	{
		__camLandTransporter(transport.player, camMakePos(transport));
	}
}

function cam_eventMissionTimeout()
{
	if (__camDefeatOnTimeout)
	{
		camTrace("0 minutes remaining.");
		__camGameLost();
	}
	else
	{
		var won = camCheckExtraObjective();
		if (!won)
		{
			__camGameLost();
			return;
		}
		__camGameWon();
	}
}

function cam_eventAttacked(victim, attacker)
{
	if (camDef(victim) && victim)
	{
		// Remove victim if hit by a Remover Tool
		if (attacker.weapons[0].id === "SpyTurret01")
		{
			camSafeRemoveObject(victim);
			return;
		}

		if (victim.type === DROID)
		{
			// Needler schenanigans
			if (attacker.weapons[0].id === "RailGun1Mk1" || attacker.weapons[0].id === "Cyb-Wpn-Rail1")
			{
				__updateNeedlerLog(victim);
			}
			// Teleport Enderman
			if (victim.body === "EndermanBody" && camDef(attacker) && camRand(101) > 50)
			{
				// Store Enderman health and group
				let endermanInfo = {health: victim.health, group: victim.group};
				// Find a random point within 8 tiles of the attacker
				let tpPos = camGenerateRandomMapCoordinateWithinRadius(camMakePos(attacker), 8);

				// "Teleport" the Enderman there by making a copy at the position and then removing the original
				let newMan = addDroid(victim.player, tpPos.x, tpPos.y, "Enderman",
				"EndermanBody", "CyborgLegs", "", "", "Cyb-Wpn-EnderMelee");
				camSafeRemoveObject(victim);

				// Give the cloned Enderman the same health and group
				setHealth(newMan, endermanInfo.health);
				if (endermanInfo.group !== null)
				{
					groupAdd(endermanInfo.group, newMan);
				}
				else
				{
					// The Enderman didn't have a group, so make one for itself
					let newGroup = camNewGroup();
					groupAdd(newGroup, newMan);
					camManageGroup(newGroup, CAM_ORDER_ATTACK);
				}
				queue("__camPlayTeleportSfx", CAM_TICKS_PER_FRAME, newMan.id + "");
				return;
			}
			if (victim.player !== CAM_HUMAN_PLAYER && !allianceExistsBetween(CAM_HUMAN_PLAYER, victim.player))
			{
				//Try dynamically creating a group of nearby droids not part
				//of a group. Only supports those who can hit ground units.
				if (victim.group === null)
				{
					const DEFAULT_RADIUS = 6;
					var loc = {x: victim.x, y: victim.y};
					var droids = enumRange(loc.x, loc.y, DEFAULT_RADIUS, victim.player, false).filter((obj) => (
						obj.type === DROID &&
						obj.group === null &&
						(obj.canHitGround || obj.isSensor) &&
						obj.droidType !== DROID_CONSTRUCT &&
						!camIsTransporter(obj) &&
						!camInNeverGroup(obj)
					));
					if (droids.length === 0)
					{
						return;
					}
					camManageGroup(camMakeGroup(droids), CAM_ORDER_ATTACK, {
						count: -1,
						regroup: false
						// repair: 70
					});
				}

				if (camDef(__camGroupInfo[victim.group]))
				{
					__camGroupInfo[victim.group].lastHit = gameTime;

					//Increased Nexus intelligence if struck on cam3-4
					if (__camNextLevel === CAM_GAMMA_OUT)
					{
						if (__camGroupInfo[victim.group].order === CAM_ORDER_PATROL)
						{
							__camGroupInfo[victim.group].order = CAM_ORDER_ATTACK;
						}
					}
				}
			}
		}
	}
}

//Work around some things that break on save-load.
function cam_eventGameLoaded()
{
	receiveAllEvents(true);
	__camSaveLoading = true;
	const SCAV_KEVLAR_MISSIONS = [
		"CAM_1CA", "SUB_1_4AS", "SUB_1_4A", "SUB_1_5S", "SUB_1_5",
		"CAM_1A-C", "SUB_1_7S", "SUB_1_7", "SUB_1_DS", "CAM_1END", "SUB_2_5S"
	];

	//Need to set the scavenger kevlar vests when loading a save from later Alpha
	//missions or else it reverts to the original texture.
	for (let i = 0, l = SCAV_KEVLAR_MISSIONS.length; i < l; ++i)
	{
		var mission = SCAV_KEVLAR_MISSIONS[i];
		if (__camNextLevel === mission)
		{
			if (tilesetType === "ARIZONA")
			{
				replaceTexture("page-7-barbarians-arizona.png",
							"page-7-barbarians-kevlar.png");
			}
			else if (tilesetType === "URBAN")
			{
				replaceTexture("page-7-barbarians-arizona.png",
							"page-7-barbarians-urban.png");
			}
			break;
		}
	}

	// Set the sun correctly
	setSunPosition(__camSunPosition.x, __camSunPosition.y, __camSunPosition.z);
	setSunIntensity(
		__camSunIntensity.ar, __camSunIntensity.ag, __camSunIntensity.ab, 
		__camSunIntensity.dr, __camSunIntensity.dg, __camSunIntensity.db, 
		__camSunIntensity.sr, __camSunIntensity.sg, __camSunIntensity.sb
	);

	//Subscribe to eventGroupSeen again.
	camSetEnemyBases();

	//Reset any vars
	__camCheatMode = false;

	__camSaveLoading = false;
}

//Plays Nexus sounds if nexusActivated is true.
function cam_eventObjectTransfer(obj, from)
{
	if (from === CAM_HUMAN_PLAYER && obj.player === NEXUS && __camNexusActivated === true)
	{
		var snd;
		if (obj.type === STRUCTURE)
		{
			if (obj.stattype === DEFENSE)
			{
				snd = DEFENSE_ABSORBED;
			}
			else if (obj.stattype === RESEARCH_LAB)
			{
				snd = RES_ABSORBED;
			}
			else
			{
				snd = STRUCTURE_ABSORBED;
			}
		}
		else if (obj.type === DROID)
		{
			snd = UNIT_ABSORBED;
		}

		if (camDef(snd))
		{
			playSound(snd);
		}
		queue("camNexusLaugh", camSecondsToMilliseconds(1.5));
	}
}

function cam_eventVideoDone()
{
	__camEnqueueVideos(); //Play any remaining videos automatically.
}
