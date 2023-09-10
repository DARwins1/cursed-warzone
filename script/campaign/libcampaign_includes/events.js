
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
	__camSpyFeigns = [];
	__camSpyCooldowns = [];
	__camPrimedCreepers = [];
	__camBlackOut = false;
	__camMobGlobalGroup = camNewGroup();
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
	setTimer("__camScanPipisRadii", camSecondsToMilliseconds(0.5));
	setTimer("__camScanWreckRadii", camSecondsToMilliseconds(1));
	setTimer("__updateNeedlerLog", camSecondsToMilliseconds(8));
	setTimer("__camSpyFeignTick", camSecondsToMilliseconds(0.5));
	setTimer("__camMonsterSpawnerTick", camSecondsToMilliseconds(16));
	queue("__camShowBetaHintEarly", camSecondsToMilliseconds(4));
	queue("__camGrantSpecialResearch", camSecondsToMilliseconds(6));
	queue("camResetSun", camSecondsToMilliseconds(0.1)); // Set the sun correctly for the current campaign
	queue("__camRandomizeFungibleCannons", camSecondsToMilliseconds(0.1)); // This is done on a delay so that bases can initialize

	camManageGroup(__camMobGlobalGroup, CAM_ORDER_ATTACK, {removable: false});
}

function cam_eventDroidBuilt(droid, structure)
{
	if ((camDef(droid.weapons[0]) && droid.weapons[0].name === "Cannon2A-TMk1") 
		|| (camDef(droid.weapons[1]) && droid.weapons[1].name === "Cannon2A-TMk1")
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
	else if (structure.name === _("Nuclear Drum"))
	{
		// Swap out the structure for the feature object
		let pos = {x: structure.x, y: structure.y};
		camSafeRemoveObject(structure);
		addFeature("NuclearDrum", pos.x, pos.y);
	}
	else if (structure.name === _("Pipis"))
	{
		// Swap out the structure for the feature object
		let pos = {x: structure.x, y: structure.y};
		camSafeRemoveObject(structure);
		if (camRand(101) < 1)
		{
			addFeature("PipisM", pos.x, pos.y);
		}
		else
		{
			addFeature("Pipis", pos.x, pos.y);
		}
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
			if (obj.body === "Body1RECSpam" || obj.body === "Body5RECSpam" || obj.body === "Body11ABTSpam")
			{
				// Explode the Pipis Truck
				var boomBaitId = addDroid(10, obj.x, obj.y, "Boom Bait",
					"BaitBody", "BaBaProp", "", "", "BabaMG").id; // Spawn a bloke...
				queue("__camDetonatePipis", CAM_TICKS_PER_FRAME, boomBaitId + ""); // ...then blow it up
			}
		}
		else if (camDef(obj.weapons[0]) && (obj.weapons[0].id === "CyborgSpyChaingun" || obj.weapons[0].id === "CyborgSpyChaingunSpam")
			&& camFeignCooldownCheck(obj.id))
		{
			__camSpyFeignDeath(obj);
			return;
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
				"BaitBody", "BaBaProp", "", "", "BabaMG").id; // Spawn a bloke...
			queue("__camDetonateDrum", CAM_TICKS_PER_FRAME, boomBaitId + ""); // ...then blow it up
		}
		else if (obj.name === _("Nuclear Drum"))
		{
			var boomBaitId = addDroid(10, obj.x, obj.y, "Boom Bait",
				"BaitBody", "BaBaProp", "", "", "BabaMG").id; // Spawn a bloke...
			queue("__camDetonateNukeDrum", CAM_TICKS_PER_FRAME, boomBaitId + ""); // ...then blow it up
		}
		else if (obj.name === _("Pipis") || obj.name === _("Ms. Pipis") || obj.name === _("Pipis (Dummy)") || obj.name === _("Ms. Pipis (Dummy)"))
		{
			var boomBaitId = addDroid(10, obj.x, obj.y, "Boom Bait",
				"BaitBody", "BaBaProp", "", "", "BabaMG").id; // Spawn a bloke...
			queue("__camDetonatePipis", CAM_TICKS_PER_FRAME, boomBaitId + ""); // ...then blow it up
		}
		else if (obj.name === _("*Wreck0*") || obj.name === _("*Wreck1*"))
		{
			// Spawn Spamton unit(s)
			const unitChoices = [
				"zombie", "skeleton", "creeper",
			 	"bison", "spy", "needler",
			 	"miniMGs",
			];

			switch (unitChoices[camRand(unitChoices.length)])
			{
				case "zombie":
					// Spawn a Zombie
					groupAdd(__camMobGlobalGroup, addDroid(SPAMTON, obj.x - camRand(2), obj.y - camRand(2), // Wreck features are 2x2
						_("Spamton Zombie"), "ZombieBodySpam", "CyborgLegs", "", "", "Cyb-Wpn-ZmbieMeleeSpam"
					));
					break;
				case "skeleton":
					// Spawn a Skeleton
					groupAdd(__camMobGlobalGroup, addDroid(SPAMTON, obj.x - camRand(2), obj.y - camRand(2), 
						_("Spamton Skeleton"), "SkeletonBodySpam", "CyborgLegs", "", "", "Cyb-Wpn-SkelBowSpam"
					));
					break;
				case "creeper":
					// Spawn a Creeper
					groupAdd(__camMobGlobalGroup, addDroid(SPAMTON, obj.x - camRand(2), obj.y - camRand(2), 
						_("Spamton Creeper"), "CreeperBodySpam", "CyborgLegs", "", "", "Cyb-Wpn-CreeperDudSpam"
					));
					break;
				case "bison":
					// Spawn a Bison Cyborg
					groupAdd(__camMobGlobalGroup, addDroid(SPAMTON, obj.x - camRand(2), obj.y - camRand(2), 
						_("Spamton Bison Cyborg"), "CyborgLightBody", "CyborgLegs", "", "", "CyborgBisonSpam"
					));
					break;
				case "spy":
					// Spawn a Spy Cyborg
					groupAdd(__camMobGlobalGroup, addDroid(SPAMTON, obj.x - camRand(2), obj.y - camRand(2), 
						_("Spamton Spy Cyborg"), "CyborgLightBody", "CyborgLegs", "", "", "CyborgSpyChaingunSpam"
					));
					break;
				case "needler":
					// Spawn a Needler Cyborg
					groupAdd(__camMobGlobalGroup, addDroid(SPAMTON, obj.x - camRand(2), obj.y - camRand(2), 
						_("Spamton Needler Cyborg"), "CyborgLightBody", "CyborgLegs", "", "", "Cyb-Wpn-Rail1Spam"
					));
					break;
				case "miniMGs":
					// Spawn 4 Mini Spamacondas
					for (let i = 0; i < 4; i++)
					{
						groupAdd(__camMobGlobalGroup, addDroid(SPAMTON, obj.x - camRand(2), obj.y - camRand(2), 
							_("Mini Machinegun Spamaconda Wheels"), "Body1MiniSpam", "wheeled01", "", "", "MGMini"
						));
					}
					break;
			}
		}
	}
	else if (obj.type === STRUCTURE)
	{
		if (obj.stattype === WALL && obj.id === "A0ExplosiveDrum" 
			&& obj.id === "A0NuclearDrum" && obj.id === "A0Pipis")
		{
			// See if a Silverfish should spawn out of the destroyed wall
			let spawnChance = 0;
			switch (obj.player)
			{
				case BONZI_BUDDY:
					spawnChance = 20;
					break;
				case SPAMTON:
					spawnChance = 50;
					break;
				case MOBS:
					spawnChance = 100;
					break;
				default:
					break;
			}

			if (camRand(101) < spawnChance)
			{
				// Spawn a Silverfish out of the destroyed wall
				groupAdd(__camMobGlobalGroup, addDroid(MOBS, obj.x, obj.y, 
					_("Silverfish"), "SilverfishBody", "CyborgLegs", "", "", "Cyb-Wpn-SilvFishMelee"
				));
			}
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
	else if (__camWinLossCallback !== CAM_VICTORY_SCRIPTED)
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
			if (attacker.weapons[0].id === "RailGun1Mk1" || attacker.weapons[0].id === "Cyb-Wpn-Rail1" || attacker.weapons[0].id === "RailGun1-VTOL")
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
				if (tpPos === null) tpPos = camMakePos(victim);

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
					// The Enderman didn't have a group, so add it to the global group
					groupAdd(__camMobGlobalGroup, newMan);
				}
				queue("__camPlayTeleportSfx", CAM_TICKS_PER_FRAME, newMan.id + "");
				return;
			}
			// Feign death for Spy Cyborgs (if they aren't on cooldown)
			if (camDef(victim.weapons[0]) && victim.weapons[0].id === "CyborgSpyChaingun"
			 && camDef(attacker) && victim.health < 40 && camFeignCooldownCheck(victim.id))
			{
				__camSpyFeignDeath(victim, attacker);
				return;
			}
			if (victim.body === "SilverfishBody")
			{
				// Try spawning more Silverfish out of nearby structures

				let structList = enumRange(victim.x, victim.y, 5, ALL_PLAYERS, false).filter((obj) =>
					obj.type === STRUCTURE && (obj.health < 50 || (obj.player === MOBS && !obj.isSensor))
				);
				for (let i = 0; i < structList.length; i++)
				{
					// Spawn a new Silverfish
					let pos = camMakePos(structList[i]);
					groupAdd(__camMobGlobalGroup, addDroid(MOBS, pos.x, pos.y, 
						_("Silverfish"), "SilverfishBody", "CyborgLegs", "", "", "Cyb-Wpn-SilvFishMelee"
					));

					camSafeRemoveObject(structList[i], true); // And blow up the structure
				}
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
