include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const BONZI_RES = [
	"R-Wpn-MG-Damage02", "R-Vehicle-Metals01", "R-Cyborg-Metals01",
	"R-Defense-WallUpgrade01", "R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage01",
	"R-Wpn-Cannon-Damage01", "R-Wpn-MG-ROF01", "R-Defense-WallUpgrade01",
	"R-Struc-RprFac-Upgrade01",
];

const SPECTATORS = 1; // Player number of the spectators/misc. arena objects.
const SPAWN_ZONES = ["spawnZone1", "spawnZone2", "spawnZone3", "spawnZone4", 
	"spawnZone5", "spawnZone6", "spawnZone7", "spawnZone8", 
	"spawnZone9", "spawnZone10", "spawnZone11", "spawnZone12", 
	"spawnZone13", "spawnZone14", "spawnZone15", "spawnZone16"]; // List of every spawning zone label
const LEFT_SPAWN_ZONES = ["spawnZone1", "spawnZone2", "spawnZone3", "spawnZone4", 
	"spawnZone5", "spawnZone6", "spawnZone7", "spawnZone8"]; // List of spawning zones on the left side of the arena.
const RIGHT_SPAWN_ZONES = ["spawnZone9", "spawnZone10", "spawnZone11", "spawnZone12", 
	"spawnZone13", "spawnZone14", "spawnZone15", "spawnZone16"]; // List of spawning zones on the right side of the arena.
const BILLBOARD_TEXTURES = [ null, 
	"page-506-cursedsignsarena1.png", "page-506-cursedsignsarena2.png", "page-506-cursedsignsarena3.png",
	"page-506-cursedsignsarena4.png", "page-506-cursedsignsarena5.png", "page-506-cursedsignsarena6.png",
	"page-506-cursedsignsarena7.png", "page-506-cursedsignsarena8.png", "page-506-cursedsignsarena9.png",
	"page-506-cursedsignsarena10.png", "page-506-cursedsignsarena11.png", "page-506-cursedsignsarena12.png"
]; // List of textures used to show the contents of the next wave
var waveIndex; // The number of the currently active wave.
var coreIndex; // Increments every time the function responsible for spawning core units is called.
var supportIndex; // Increments every time the function responsible for spawning support units is called.
var doneSpawning; // Whether the wave is done spawning more "core" enemies, allows the wave to end.
var setupTime; // True when it is currently the setup period between waves.
var coreGroup; // Group of "core" wave units. Wave ends when group is empty and spawning is done.
var spectatorGroup; // Group containing all spectator units. Made so they don't get automatically regrouped.

camAreaEvent("vtolRemoveZone", function(droid)
{
	camSafeRemoveObject(droid, false);
	resetLabel("vtolRemoveZone", BONZI_BUDDY);
});

function eventDestroyed(obj)
{
	// Check if the player has cleared the wave
	// The wave is cleared if all "core" units are gone and no more will spawn.
	if (!doneSpawning || setupTime)
	{
		return;
	}
	// Check if the wave 
	if (waveIndex === 0)
	{
		// For wave 0, just make sure there's no mobs left in the arena
		if (enumDroid(MOBS).concat(enumStruct(MOBS)).length > 0)
		{
			return; // Still some stuff left.
		}
	}
	else
	{
		if (groupSize(coreGroup) != 0)
		{
			return; // Core units still alive
		}
	}

	advanceWave(); // Prepare for the next wave
}

function eventGameLoaded()
{
	// Make sure the billboard texture is correct
	if (waveIndex !== 0 && waveIndex < 13)
	{
		replaceTexture("page-506-cursedsignsarena1.png", BILLBOARD_TEXTURES[waveIndex]);
	}
}

// Clear anything left of this wave and prepare for the next one
function advanceWave()
{
	// Clear out any leftover enemies
	let mobList = enumDroid(MOBS).concat(enumStruct(MOBS));
	for (let i = 0; i < mobList.length; i++)
	{
		var leftover = mobList[i];
		if (!camIsTransporter(leftover)) camSafeRemoveObject(leftover, true);
	}
	let bbList = enumDroid(BONZI_BUDDY).concat(enumStruct(BONZI_BUDDY));
	for (let i = 0; i < bbList.length; i++)
	{
		var leftover = bbList[i];
		if (!camIsTransporter(leftover)) camSafeRemoveObject(leftover, true);
	}

	// Prevent any more units from spawning (the core unit timer gets removed once core unit spawning is done)
	if (waveIndex > 2 && waveIndex !== 11)
	{
		removeTimer("spawnSupportUnits");
	}

	waveIndex++;
	doneSpawning = true;
	setupTime = true;

	// Change the billboard texture
	if (waveIndex < 13)
	{
		replaceTexture("page-506-cursedsignsarena1.png", BILLBOARD_TEXTURES[waveIndex]);
	}

	// Enable player reinforcements
	setReinforcementTime(10);
	playSound("pcv440.ogg"); // "Reinforcements are available"

	// Set the mission timer to 59 seconds
	setMissionTime(59);

	// Grant the player temporary full visibility
	addSpotter(48, 38, 0, 8192, false, gameTime + camSecondsToMilliseconds(59));

	queue("beginWave", camSecondsToMilliseconds(59));
}

// WAVE LIST
// WAVE 0
// 2 spawners pre-placed in the arena.
// The "wave" ends once the arena is clear of spawners and mobs
// WAVE 1
// Core Units: Zombies, Skeletons, and a few Creepers
// WAVE 2
// Core Units: Cooler MG Cyborgs, BB Cyborgs, Realistic MG (half-tracks)
// WAVE 3
// Core Units: Fungible Cannon (half-tracks), "Light" Cannon Cyborgs
// Support Units: Transporter (Explosive Drums)
// WAVE 4
// Core Units: Realistic MG (drift), Sawed-Off Lancer (drift), Twin BB (half-track)
// Support Units: Transporter (Many-Rocket Cyborgs)
// WAVE 5
// Core Units: Endermen
// Support Units: Skeletons and Creepers
// WAVE 6 (BOSS)
// Core Units: Big Machinegun Viper Wheels
// Support Units: Mini MGVs, Nuclear Drums (not really)
// Notes: Bonzi Buddy will rig the arena to explode if the player can't beat the wave within about 2 minutes.
// WAVE 7
// Core Units: Sword Cyborgs and Archer Cyborgs
// Support Units: Transporter ("Light" Cannon (half-wheels))
// WAVE 8
// Core Units: Sensors (tracked), "Light" Cannon (half-wheels)
// Support Units: Catapults (half-tracked), Rain Rocket Batteries (from outside)
// WAVE 9
// Core Units: Zombies, Baby Zombies, Sword Cyborgs and Cool Cyborgs
// Support Units: Creepers, Skeletons, Archer Cyborgs, Twin BB (half-tracked), and Transporter (Many-Rocket Pods (drift))
// Notes: Mobs and Bonzi Buddy's units approach from opposite sides of the arena.
// WAVE 10
// Core Units: Endermen, Fungible Cannon (tracks), Many-Rocket Pod (tracks), Realistic MG (tracks)
// Support Units: Twin BB (drift), Sawed-Off Lancer (drift), Sensors (half-tracked), Catapults (half-tracked)
// WAVE 11
// Core Units: 400 Defective Lancer VTOLs, the wave automatically ends once they leave.
// WAVE 12 (BOSS)
// Core Units: Giant Freddy Fazbear
// Support Units: Defective Lancer VTOLs, Mini MGVs, BB Cyborgs, Many-Rocket Pod (half-track), and Transporter (Explosive Drums)
// Notes: A "Blackout" event will be triggered on the start of the round (might be reserved for higher difficulties).

// Start the wave!
function beginWave()
{
	// Make sure the player can't call in reinforcements during the wave (if they didn't call any during the setup)
	setReinforcementTime(-1);

	setupTime = false;
	doneSpawning = false;

	// Reset spawning indexes
	coreIndex = 0;
	supportIndex = 0;

	// Call core and support unit spawning functions as needed
	switch (waveIndex)
	{
		case 1: // No support units
			spawnCoreUnits();
			setTimer("spawnCoreUnits", camChangeOnDiff(camSecondsToMilliseconds(15)));
			break;
		case 2: // No support units
			spawnCoreUnits();
			setTimer("spawnCoreUnits", camChangeOnDiff(camSecondsToMilliseconds(15)));
			break;
		case 3:
			spawnCoreUnits();
			spawnSupportUnits();
			setTimer("spawnCoreUnits", camChangeOnDiff(camSecondsToMilliseconds(15)));
			setTimer("spawnSupportUnits", camChangeOnDiff(camSecondsToMilliseconds(25)));
			break;
		case 4:
			spawnCoreUnits();
			spawnSupportUnits();
			setTimer("spawnCoreUnits", camChangeOnDiff(camSecondsToMilliseconds(15)));
			setTimer("spawnSupportUnits", camChangeOnDiff(camSecondsToMilliseconds(45)));
			break;
		case 5:
			spawnCoreUnits();
			spawnSupportUnits();
			setTimer("spawnCoreUnits", camChangeOnDiff(camSecondsToMilliseconds(20)));
			setTimer("spawnSupportUnits", camChangeOnDiff(camSecondsToMilliseconds(5)));
			break;
		case 6: // Boss wave: Core unit are spawned shortly after the start
			queue("spawnCoreUnits", camSecondsToMilliseconds(10));
			spawnSupportUnits();
			setMissionTime(camMinutesToSeconds(2));
			queue("detonateArena", camMinutesToMilliseconds(2)); // Gameover if the wave isn't cleared within 2 minutes
			setTimer("spawnSupportUnits", camChangeOnDiff(camSecondsToMilliseconds(6)));
			break;
		case 7:
			spawnCoreUnits();
			spawnSupportUnits();
			setTimer("spawnCoreUnits", camChangeOnDiff(camSecondsToMilliseconds(15)));
			setTimer("spawnSupportUnits", camChangeOnDiff(camSecondsToMilliseconds(45)));
			break;
		case 8:
			spawnCoreUnits();
			spawnSupportUnits();
			placeRainRockets();
			setTimer("spawnCoreUnits", camChangeOnDiff(camSecondsToMilliseconds(15)));
			setTimer("spawnSupportUnits", camChangeOnDiff(camSecondsToMilliseconds(25)));
			// HACK: For some reason, the sensor units can't pathfind through the arena gates, so just remove them so they don't get stuck.
			// This should be fixed in 4.4.0
			let gateList = enumStruct(SPECTATORS);
			for (let i = 0; i < gateList.length; i++)
			{
				var gate = gateList[i];
				camSafeRemoveObject(gate, false);
			}
			break;
		case 9:
			spawnCoreUnits();
			spawnSupportUnits();
			setTimer("spawnCoreUnits", camChangeOnDiff(camSecondsToMilliseconds(15)));
			setTimer("spawnSupportUnits", camChangeOnDiff(camSecondsToMilliseconds(10)));
			break;
		case 10:
			spawnCoreUnits();
			spawnSupportUnits();
			setTimer("spawnCoreUnits", camChangeOnDiff(camSecondsToMilliseconds(25)));
			setTimer("spawnSupportUnits", camChangeOnDiff(camSecondsToMilliseconds(20)));
			break;
		case 11: // This wave is just a bunch of VTOLs
			camSetVtolData(BONZI_BUDDY, undefined, camMakePos("vtolRemoveZone"), [cTempl.colatv],
				camSecondsToMilliseconds(0.5), undefined, {minVTOLs: 50, maxRandomVTOLs: 0}
			);
			queue("stopVtols", camSecondsToMilliseconds(8.1));
			queue("advanceWave", camSecondsToMilliseconds(35));
			break;
		case 12: // Boss wave: Core unit is spawned immediately
			spawnCoreUnits();
			spawnSupportUnits();
			setTimer("spawnSupportUnits", camChangeOnDiff(camSecondsToMilliseconds(10)));
			camSetVtolData(BONZI_BUDDY, undefined, camMakePos("vtolRemoveZone"), [cTempl.colatv],
				camSecondsToMilliseconds(10), undefined, {minVTOLs: 20, maxRandomVTOLs: 0}
			);
			break;
		default:
			break;
	}
}

// Spawns a group of core units.
// These units must all be destroyed for the wave to be completed.
// A finite amount of core units can be spawned per wave.
function spawnCoreUnits()
{
	coreIndex++;

	switch (waveIndex)
	{
		case 1: // Spawn a total of 10 Zombies, 10 Skeletons, and 2 Creepers
			switch (coreIndex)
			{
				case 1: 
				case 4: // Spawn 5 Zombies
					var spawnArea = SPAWN_ZONES[camRand(SPAWN_ZONES.length)];
					for (let i = 0; i < 5; i++)
					{
						var pos = camRandPosInArea(spawnArea);
						groupAdd(coreGroup, addDroid(MOBS, pos.x, pos.y, 
							_("Zombie"), "ZombieBody", "CyborgLegs", "", "", "Cyb-Wpn-ZmbieMelee"
						));
					}
					break;
				case 2: 
				case 5: // Spawn 5 Skeletons
					var spawnArea = SPAWN_ZONES[camRand(SPAWN_ZONES.length)];
					for (let i = 0; i < 5; i++)
					{
						var pos = camRandPosInArea(spawnArea);
						groupAdd(coreGroup, addDroid(MOBS, pos.x, pos.y, 
							_("Skeleton"), "SkeletonBody", "CyborgLegs", "", "", "Cyb-Wpn-SkelBow"
						));
					}
					break;
				case 3: 
				case 6: // Spawn a Creeper
					var spawnArea = SPAWN_ZONES[camRand(SPAWN_ZONES.length)];
					var pos = camRandPosInArea(spawnArea);
					groupAdd(coreGroup, addDroid(MOBS, pos.x, pos.y, 
						_("Creeper"), "CreeperBody", "CyborgLegs", "", "", "Cyb-Wpn-CreeperDud"
					));

					if (coreIndex === 6)
					{
						// Spawning is done
						doneSpawning = true;
						removeTimer("spawnCoreUnits");
					}
					break;
				default:
					break;
			}
			break;
		case 2: // Spawn a total of 12 Realistic MGs, 10 BB Cyborgs, and 10 Cool Cyborgs
			switch (coreIndex) // Note that nothing happens on case 3:
			{
				case 1: 
				case 4: // Spawn 6 Realistic MGs
					var spawnArea = SPAWN_ZONES[camRand(SPAWN_ZONES.length)];
					for (let i = 0; i < 5; i++)
					{
						var pos = camRandPosInArea(spawnArea);
						groupAdd(coreGroup, addDroid(BONZI_BUDDY, pos.x, pos.y, 
							_("Realistic Heavy Machinegun Viper II Half-wheels"), "Body5REC", "HalfTrack", "", "", "MG3Mk1"
						));
					}
					break;
				case 2: 
				case 5: // Spawn 5 BB Cyborgs and 5 Cool Cyborgs (split into two groups)
					var spawnArea1 = SPAWN_ZONES[camRand(SPAWN_ZONES.length)];
					var spawnArea2 = SPAWN_ZONES[camRand(SPAWN_ZONES.length)];
					for (let i = 0; i < 5; i++)
					{
						var pos1;
						var pos2;
						if (i % 2 === 0)
						{
							pos1 = camRandPosInArea(spawnArea1);
							pos2 = camRandPosInArea(spawnArea2);
						}
						else
						{
							pos1 = camRandPosInArea(spawnArea2);
							pos2 = camRandPosInArea(spawnArea1);
						}
						groupAdd(coreGroup, addDroid(BONZI_BUDDY, pos1.x, pos1.y, 
							_("Cooler Machinegunner Cyborg"), "CyborgLightBody", "CyborgLegs", "", "", "NX-CyborgChaingun"
						));
						groupAdd(coreGroup, addDroid(BONZI_BUDDY, pos2.x, pos2.y, 
							_("Bunker Buster Cyborg"), "CyborgLightBody", "CyborgLegs", "", "", "CyborgBB"
						));
					}
					if (coreIndex === 5)
					{
						// Spawning is done
						doneSpawning = true;
						removeTimer("spawnCoreUnits");
					}
					break;
				default:
					break;
			}
			break;
		case 3: // Spawn a total of 16 Fungible Cannons and 32 "Light" Cannon Cyborgs
			if (coreIndex <= 8)
			{
				// Spawn a group of 2 Fungible Cannons and 4 "Light" Cannon Cyborgs 8 times
				var spawnArea = SPAWN_ZONES[camRand(SPAWN_ZONES.length)];
				for (let i = 0; i < 2; i++)
				{
					var pos = camRandPosInArea(spawnArea);
					groupAdd(coreGroup, addDroid(BONZI_BUDDY, pos.x, pos.y, 
						_("Fungible Cannon Viper II Half-wheels"), "Body5REC", "HalfTrack", "", "", camRandomFungibleCannon()
					));
				}
				for (let i = 0; i < 4; i++)
				{
					var pos = camRandPosInArea(spawnArea);
					groupAdd(coreGroup, addDroid(BONZI_BUDDY, pos.x, pos.y, 
						_("\"Light\" Gunner Cyborg"), "CyborgLightBody", "CyborgLegs", "", "", "CyborgCannon"
					));
				}
				break;
			}
			else
			{
				// Spawning is done
				doneSpawning = true;
				removeTimer("spawnCoreUnits");
			}
			break;
		case 4: // Spawn a total of 12 Twin BBs, 42 Realistic MGs, and 42 Sawed-Off Lancers
			var spawnArea = SPAWN_ZONES[camRand(SPAWN_ZONES.length)];
			var weapon;
			var name;
			if (coreIndex % 2 === 1)
			{
				// Spawn Sawed-Off Lancers on odd indexes
				weapon = "Rocket-LtA-T";
				name = "Sawed-Off Lancer Viper Drift Wheels";
			}
			else
			{
				// Spawn Realistic MGs on even indexes
				weapon = "MG3Mk1";
				name = "Realistic Heavy Machinegun Viper Drift Wheels";
			}
			for (let i = 0; i < 7; i++) // Spawn 7 of the chosen vehicle
			{
				var pos = camRandPosInArea(spawnArea);
				groupAdd(coreGroup, addDroid(BONZI_BUDDY, pos.x, pos.y, 
					_(name), "Body1REC", "wheeledskiddy", "", "", weapon));
			}
			var pos = camRandPosInArea(spawnArea);
			groupAdd(coreGroup, addDroid(BONZI_BUDDY, pos.x, pos.y, 
				_("Bunker Buster II Viper II Half-wheels"), "Body5REC", "HalfTrack", "", "", "Rocket-BB2"
			));
			if (coreIndex >= 12)
			{
				// Spawning is done
				doneSpawning = true;
				removeTimer("spawnCoreUnits");
			}
			break;
		case 5: // Spawn a total of 8 Endermen
			var spawnArea = SPAWN_ZONES[camRand(SPAWN_ZONES.length)];
			var pos = camRandPosInArea(spawnArea);
			groupAdd(coreGroup, addDroid(MOBS, pos.x, pos.y, 
				_("Enderman"), "EndermanBody", "CyborgLegs", "", "", "Cyb-Wpn-EnderMelee"
			));
			if (coreIndex >= 8)
			{
				// Spawning is done
				doneSpawning = true;
				removeTimer("spawnCoreUnits");
			}
			break;
		case 6: // Spawn 2 Big Machinegun Viper Wheels on opposite sides of the arena
			var pos1 = camRandPosInArea("spawnZone4");
			var pos2 = camRandPosInArea("spawnZone12");
			groupAdd(coreGroup, addDroid(MOBS, pos1.x, pos1.y, 
				_("Big Machinegun Viper Wheels"), "Body1BIG", "wheeled01", "", "", "MG3Mk2"
			));
			groupAdd(coreGroup, addDroid(MOBS, pos2.x, pos2.y, 
				_("Big Machinegun Viper Wheels"), "Body1BIG", "wheeled01", "", "", "MG3Mk2"
			));
			doneSpawning = true;
			break;
		case 7: // Spawn a total of 64 Sword Cyborgs and 64 Archer Cyborgs
			var spawnArea1 = SPAWN_ZONES[camRand(SPAWN_ZONES.length)];
			for (let i = 0; i < 8; i++)
			{
				// Spawn 8 Sword Cyborgs
				var pos = camRandPosInArea(spawnArea1);
				groupAdd(coreGroup, addDroid(BONZI_BUDDY, pos.x, pos.y, 
					_("Sword Cyborg"), "CyborgLightBody", "CyborgLegs", "", "", "Cyb-Wpn-Sword"
				));
			}
			var spawnArea2 = SPAWN_ZONES[camRand(SPAWN_ZONES.length)];
			for (let i = 0; i < 8; i++)
			{
				// Spawn 8 Archer Cyborgs
				var pos = camRandPosInArea(spawnArea2);
				groupAdd(coreGroup, addDroid(BONZI_BUDDY, pos.x, pos.y, 
					_("Archer Cyborg"), "CyborgLightBody", "CyborgLegs", "", "", "Cyb-Wpn-Bow"
				));
			}
			if (coreIndex >= 8)
			{
				// Spawning is done
				doneSpawning = true;
				removeTimer("spawnCoreUnits");
			}
			break;
		case 8: // Spawn a total of 20 Sensors and 40 "Light" Cannons
			var spawnArea1 = SPAWN_ZONES[camRand(SPAWN_ZONES.length)];
			for (let i = 0; i < 4; i++)
			{
				// Spawn 5 "Light" Cannons
				var pos = camRandPosInArea(spawnArea1);
				groupAdd(coreGroup, addDroid(BONZI_BUDDY, pos.x, pos.y, 
					_("\"Light\" Cannon Viper Half-wheels"), "Body1REC", "HalfTrack", "", "", "Cannon1Mk1"
				));
			}
			// Include a Sensor with the cannons
			var pos1 = camRandPosInArea(spawnArea1);
			groupAdd(coreGroup, addDroid(BONZI_BUDDY, pos1.x, pos1.y, 	
				_("Sensor Viper II Thick Wheels"), "Body5REC", "tracked01", "", "", "SensorTurret1Mk1"
			));
			// Spawn an additional Sensor somewhere else
			var spawnArea2 = SPAWN_ZONES[camRand(SPAWN_ZONES.length)];
			var pos2 = camRandPosInArea(spawnArea2);
			groupAdd(coreGroup, addDroid(BONZI_BUDDY, pos2.x, pos2.y, 	
				_("Sensor Viper II Thick Wheels"), "Body5REC", "tracked01", "", "", "SensorTurret1Mk1"
			));
			if (coreIndex >= 10)
			{
				// Spawning is done
				doneSpawning = true;
				removeTimer("spawnCoreUnits");
			}
			break;
		case 9: // Spawn a total of 64 Zombies, 32 Baby Zombies, 48 Sword Cyborgs, and 48 Cool Cyborgs
			// Mobs spawn from the left, BB's units spawn from the right.
			var spawnArea1 = LEFT_SPAWN_ZONES[camRand(LEFT_SPAWN_ZONES.length)];
			for (let i = 0; i < 4; i++)
			{
				// Spawn 4 Zombies and 2 Baby Zombies
				var pos1 = camRandPosInArea(spawnArea1);
				groupAdd(coreGroup, addDroid(MOBS, pos1.x, pos1.y, 
					_("Zombie"), "ZombieBody", "CyborgLegs", "", "", "Cyb-Wpn-ZmbieMelee"
				));
				if (i % 2 === 0)
				{
					var pos2 = camRandPosInArea(spawnArea1);
					groupAdd(coreGroup, addDroid(MOBS, pos2.x, pos2.y, 
						_("Baby Zombie"), "BabyZombieBody", "CyborgLegs", "", "", "Cyb-Wpn-BabyZmbieMelee"
					));
				}
			}
			var spawnArea2 = RIGHT_SPAWN_ZONES[camRand(RIGHT_SPAWN_ZONES.length)];
			for (let i = 0; i < 3; i++)
			{
				// Spawn 3 Sword Cyborgs and 3 Cool Cyborgs
				var pos1 = camRandPosInArea(spawnArea2);
				groupAdd(coreGroup, addDroid(BONZI_BUDDY, pos1.x, pos1.y, 
					_("Sword Cyborg"), "CyborgLightBody", "CyborgLegs", "", "", "Cyb-Wpn-Sword"
				));
				var pos2 = camRandPosInArea(spawnArea2);
				groupAdd(coreGroup, addDroid(BONZI_BUDDY, pos2.x, pos2.y, 
					_("Cooler Machinegunner Cyborg"), "CyborgLightBody", "CyborgLegs", "", "", "NX-CyborgChaingun"
				));
			}
			if (coreIndex >= 16)
			{
				// Spawning is done
				doneSpawning = true;
				removeTimer("spawnCoreUnits");
			}
			break;
		case 10: // Spawn a total of 4 Endermen, 80 Fungible Cannons, 20 Many-Rocket Pods, and 20 Realistic MGs
			if (coreIndex === 1)
			{
				// Spawn 4 Endermen from 4 different directions
				let zoneList = ["spawnZone1", "spawnZone5", "spawnZone9", "spawnZone13"];
				for (let i = 0; i < zoneList.length; i++)
				{
					var pos = camRandPosInArea(zoneList[i]);
					groupAdd(coreGroup, addDroid(MOBS, pos.x, pos.y, 
						_("Enderman"), "EndermanBody", "CyborgLegs", "", "", "Cyb-Wpn-EnderMelee"
					));
				}
			}
			// Wait a bit before spawning more core units.
			else if (coreIndex >= 4)
			{
				var spawnArea = SPAWN_ZONES[camRand(SPAWN_ZONES.length)];
				if (coreIndex % 2 === 0)
				{
					// Spawn 8 Fungible Cannons on even indexes
					for (let i = 0; i < 8; i++)
					{
						var pos = camRandPosInArea(spawnArea);
						groupAdd(coreGroup, addDroid(BONZI_BUDDY, pos.x, pos.y, 
							_("Fungible Cannon Viper II Thick Wheels"), "Body5REC", "tracked01", "", "", camRandomFungibleCannon()
						));
					}
					
				}
				else
				{
					// Spawn 5 Many-Rocket Pods and 5 Realistic MGs on odd indexes
					for (let i = 0; i < 4; i++)
					{
						if (i % 2 === 0)
						{
							// Spawn a Many-Rocket Pod
							weapon = "Rocket-Pod";
							name = "Many-Rocket Pod Viper Thick Wheels";
						}
						else
						{
							// Spawn Realistic MGs on even indexes
							weapon = "MG3Mk1";
							name = "Realistic Heavy Machinegun Viper Thick Wheels";
						}
						var pos = camRandPosInArea(spawnArea);
						groupAdd(coreGroup, addDroid(BONZI_BUDDY, pos.x, pos.y, 
							_(name), "Body1REC", "tracked01", "", "", weapon));
					}
				}
				if (coreIndex >= 23)
				{
					// Spawning is done
					doneSpawning = true;
					removeTimer("spawnCoreUnits");
				}
			}
			break;
			break;
		case 12: // Spawn a giant bear
			var spawnArea = SPAWN_ZONES[camRand(SPAWN_ZONES.length)];
			var pos = camRandPosInArea(spawnArea);
			groupAdd(coreGroup, addDroid(BONZI_BUDDY, pos.x, pos.y, 
				_("Freddy Fazbear"), "FreddyBody", "CyborgLegs", "", "", ["CannonBison", "CannonBison"]
			));
			doneSpawning = true;
			break;
		default:
			break;
	}
}

// Spawns a group of support units.
// These units do not have to be destroyed and will be removed when the wave is completed.
// Support units will spawn infinitely until the wave is completed.
function spawnSupportUnits()
{
	supportIndex++;

	switch (waveIndex)
	{
		// NOTE: The first 2 waves don't have any support units
		case 3: // Send transports which place Explosive Drums where it lands
			if (!camTransporterOnMap(BONZI_BUDDY))
			{
				var pos = camGenerateRandomMapCoordinate(camMakePos("landingZone"), 5);
				var list = [cTempl.crltruckw, cTempl.crltruckw, cTempl.crltruckw, cTempl.crltruckw];
				camSendReinforcement(BONZI_BUDDY, pos, list,
					CAM_REINFORCE_TRANSPORT, {
					entry: camGenerateRandomMapEdgeCoordinate(),
					exit: camGenerateRandomMapEdgeCoordinate()
				});
			}
			break;
		case 4: // Send transports carrying Many-Rocket Cyborgs
			if (!camTransporterOnMap(BONZI_BUDDY))
			{
				var pos = camGenerateRandomMapCoordinate(camMakePos("landingZone"), 5);
				var list = [];
				for (let i = 0; i < difficulty + 6; i++)
				{
					list.push(cTempl.crcybpod);
				}
				camSendReinforcement(BONZI_BUDDY, pos, list, CAM_REINFORCE_TRANSPORT, {
					entry: camGenerateRandomMapEdgeCoordinate(),
					exit: camGenerateRandomMapEdgeCoordinate()
				});
			}
			break;
		case 5: // Spawn Creepers and Skeletons
			var newGroup = camNewGroup();
			var spawnArea = SPAWN_ZONES[camRand(SPAWN_ZONES.length)];
			if (supportIndex % 2 === 0)
			{
				// Spawn Skeletons on even indexes
				var numMobs = 2;
				if (difficulty >= HARD) numMobs++;
				if (difficulty >= INSANE) numMobs++;
				for (let i = 0; i < numMobs; i++)
				{
					var pos = camRandPosInArea(spawnArea);
					groupAdd(newGroup, addDroid(MOBS, pos.x, pos.y, 
						_("Skeleton"), "SkeletonBody", "CyborgLegs", "", "", "Cyb-Wpn-SkelBow"
					));
				}
			}
			else
			{
				// Spawn a Creeper on odd indexes
				var numMobs = 1;
				if (difficulty >= INSANE) numMobs++;
				for (let i = 0; i < numMobs; i++)
				{
					var pos = camRandPosInArea(spawnArea);
					groupAdd(newGroup, addDroid(MOBS, pos.x, pos.y, 
						_("Creeper"), "CreeperBody", "CyborgLegs", "", "", "Cyb-Wpn-CreeperDud"
					));
				}
			}
			camManageGroup(newGroup, CAM_ORDER_ATTACK);
			break;
		case 6: // Spawn four groups of Mini MGV's
			var spawnArea1 = SPAWN_ZONES[camRand(SPAWN_ZONES.length)];
			var spawnArea2 = SPAWN_ZONES[camRand(SPAWN_ZONES.length)];
			var spawnArea3 = SPAWN_ZONES[camRand(SPAWN_ZONES.length)];
			var spawnArea4 = SPAWN_ZONES[camRand(SPAWN_ZONES.length)];
			var newGroup = camNewGroup();
			for (let i = 0; i < difficulty + 6; i++)
			{
				var pos1 = camRandPosInArea(spawnArea1);
				groupAdd(newGroup, addDroid(MOBS, pos1.x, pos1.y, 
					_("Mini Machinegun Viper Wheels"), "Body1Mini", "wheeled01", "", "", "MGMini"
				));
				var pos2 = camRandPosInArea(spawnArea2);
				groupAdd(newGroup, addDroid(MOBS, pos2.x, pos2.y, 
					_("Mini Machinegun Viper Wheels"), "Body1Mini", "wheeled01", "", "", "MGMini"
				));
				var pos3 = camRandPosInArea(spawnArea3);
				groupAdd(newGroup, addDroid(MOBS, pos3.x, pos3.y, 
					_("Mini Machinegun Viper Wheels"), "Body1Mini", "wheeled01", "", "", "MGMini"
				));
				var pos4 = camRandPosInArea(spawnArea4);
				groupAdd(newGroup, addDroid(MOBS, pos4.x, pos4.y, 
					_("Mini Machinegun Viper Wheels"), "Body1Mini", "wheeled01", "", "", "MGMini"
				));
			}
			camManageGroup(newGroup, CAM_ORDER_ATTACK);
			break;
		case 7: // Send transports carrying "Light" Cannons
			if (!camTransporterOnMap(BONZI_BUDDY))
			{
				// Send a transport every third index
				var pos = camGenerateRandomMapCoordinate(camMakePos("landingZone"), 5);
				var list = [];
				for (let i = 0; i < difficulty + 6; i++)
				{
					list.push(cTempl.crlcanht);
				}
				camSendReinforcement(BONZI_BUDDY, pos, list, CAM_REINFORCE_TRANSPORT, {
					entry: camGenerateRandomMapEdgeCoordinate(),
					exit: camGenerateRandomMapEdgeCoordinate()
				});
			}
			break;
		case 8: // Spawn Catapults
			var newGroup = camNewGroup();
			var spawnArea = SPAWN_ZONES[camRand(SPAWN_ZONES.length)];
			var numUnits = 1 + difficulty;
			for (let i = 0; i < numUnits; i++)
			{
				var pos = camRandPosInArea(spawnArea);
				groupAdd(newGroup, addDroid(BONZI_BUDDY, pos.x, pos.y, 
					_("Catapult Viper II Half-wheels"), "Body5REC", "HalfTrack", "", "", "Mortar1Mk1"
				));
			}
			camManageGroup(newGroup, CAM_ORDER_ATTACK);
			break;
		case 9: // Spawn Creepers, Skeletons, Archer Cyborgs, Twin BBs, and transports carrying Many-Rocket Pods
			if (supportIndex % 2 === 1)
			{
				// Spawn mobs on odd indexes
				var newGroup = camNewGroup();
				var spawnArea = LEFT_SPAWN_ZONES[camRand(LEFT_SPAWN_ZONES.length)];
				var numMobs = 2;
				if (difficulty >= HARD) numMobs++;
				if (difficulty >= INSANE) numMobs++;
				for (let i = 0; i < numMobs; i++)
				{
					// Spawn Skeletons
					var pos = camRandPosInArea(spawnArea);
					groupAdd(newGroup, addDroid(MOBS, pos.x, pos.y, 
						_("Skeleton"), "SkeletonBody", "CyborgLegs", "", "", "Cyb-Wpn-SkelBow"
					));
				}
				if (supportIndex % 4 === 0 || difficulty >= HARD)
				{
					// Add a Creeper every other mob spawn (or every spawn if on Hard+)
					var pos = camRandPosInArea(spawnArea);
					groupAdd(newGroup, addDroid(MOBS, pos.x, pos.y, 
						_("Creeper"), "CreeperBody", "CyborgLegs", "", "", "Cyb-Wpn-CreeperDud"
					));
				}
				camManageGroup(newGroup, CAM_ORDER_ATTACK);
			}
			else
			{
				// Spawn Bonzi Buddy units on even indexes
				if (supportIndex % 4 === 0)
				{
					// Spawn Archer Cyborgs and Twin BBs every other Bonzi Buddy spawn
					var newGroup = camNewGroup();
					var spawnArea = RIGHT_SPAWN_ZONES[camRand(RIGHT_SPAWN_ZONES.length)];
					var numCyborgs = 2;
					if (difficulty >= HARD) numCyborgs++;
					if (difficulty >= INSANE) numCyborgs++;
					for (let i = 0; i < numMobs; i++)
					{
						// Spawn Archer Cyborgs
						var pos = camRandPosInArea(spawnArea);
						groupAdd(newGroup, addDroid(BONZI_BUDDY, pos.x, pos.y, 
							_("Archer Cyborg"), "CyborgLightBody", "CyborgLegs", "", "", "Cyb-Wpn-Bow"
						));
					}
					// Add a Twin BB
					var pos = camRandPosInArea(spawnArea);
					groupAdd(newGroup, addDroid(BONZI_BUDDY, pos.x, pos.y, 
						_("Bunker Buster II Viper II Half-wheels"), "Body5REC", "HalfTrack", "", "", "Rocket-BB2"
					));
					camManageGroup(newGroup, CAM_ORDER_ATTACK);
				}
				else if (!camTransporterOnMap(BONZI_BUDDY))
				{
					// Send a transport with Many-Rocket Pods
					var pos = camGenerateRandomMapCoordinate(camMakePos("landingZone"), 5);
					var list = [];
					for (let i = 0; i < difficulty + 6; i++)
					{
						list.push(cTempl.crlpoddw);
					}
					camSendReinforcement(BONZI_BUDDY, pos, list, CAM_REINFORCE_TRANSPORT, {
						entry: camGenerateRandomMapEdgeCoordinate(),
						exit: camGenerateRandomMapEdgeCoordinate()
					});
				}
			}
			break;
		case 10: // Spawn Twin BB/Sawed-Off Lancers and Sensors/Catapults
			var newGroup = camNewGroup();
			if (supportIndex % 3 === 0)
			{
				// Spawn a Sensor + group of Catapults every third index
				var spawnArea = SPAWN_ZONES[camRand(SPAWN_ZONES.length)];
				var numUnits = 2 + difficulty;
				for (let i = 0; i < numUnits; i++)
				{
					var pos = camRandPosInArea(spawnArea);
					groupAdd(newGroup, addDroid(BONZI_BUDDY, pos.x, pos.y, 
						_("Catapult Viper II Half-wheels"), "Body5REC", "HalfTrack", "", "", "Mortar1Mk1"
					));
				}
				// Also add a Sensor
				var pos = camRandPosInArea(spawnArea);
				groupAdd(newGroup, addDroid(BONZI_BUDDY, pos.x, pos.y, 
					_("Sensor Viper II Half-wheels"), "Body5REC", "HalfTrack", "", "", "SensorTurret1Mk1"
				));
			}
			else
			{
				// Spawn a group of Twin BBs and Sawed-Off Lancers
				var spawnArea = SPAWN_ZONES[camRand(SPAWN_ZONES.length)];
				var numUnits = 4 + difficulty;
				for (let i = 1; i <= numUnits; i++)
				{
					var pos = camRandPosInArea(spawnArea);
					if (i % 4 === 0)
					{
						groupAdd(newGroup, addDroid(BONZI_BUDDY, pos.x, pos.y, 
							_("Bunker Buster II Viper II Drift Wheels"), "Body5REC", "wheeledskiddy", "", "", "Rocket-BB2"
						));
					}
					else
					{
						groupAdd(newGroup, addDroid(BONZI_BUDDY, pos.x, pos.y, 
							_("Sawed-Off Lancer Viper I Drift Wheels"), "Body1REC", "wheeledskiddy", "", "", "Rocket-LtA-T"
						));
					}
				}
			}
			camManageGroup(newGroup, CAM_ORDER_ATTACK);
			break;
		case 12: // Spawn Mini MGV's, BB Cyborgs, Many-Rocket Pods, and send transports which place Explosive Drums where it lands
			var newGroup = camNewGroup();
			var spawnArea1 = SPAWN_ZONES[camRand(SPAWN_ZONES.length)];
			var spawnArea2 = SPAWN_ZONES[camRand(SPAWN_ZONES.length)];
			if (supportIndex % 2 === 0)
			{
				// Spawn 2 groups of Mini MGV's on even indexes
				for (let i = 0; i < difficulty + 8; i++)
				{
					var pos1 = camRandPosInArea(spawnArea1);
					groupAdd(newGroup, addDroid(BONZI_BUDDY, pos1.x, pos1.y, 
						_("Mini Machinegun Viper Wheels"), "Body1Mini", "wheeled01", "", "", "MGMini"
					));
					var pos2 = camRandPosInArea(spawnArea2);
					groupAdd(newGroup, addDroid(BONZI_BUDDY, pos2.x, pos2.y, 
						_("Mini Machinegun Viper Wheels"), "Body1Mini", "wheeled01", "", "", "MGMini"
					));
				}
			}
			else
			{
				// Spawn BB Cyborgs and Many-Rocket Pods on odd indexes
				for (let i = 0; i < difficulty + 2; i++)
				{
					var pos1 = camRandPosInArea(spawnArea1);
					groupAdd(newGroup, addDroid(BONZI_BUDDY, pos1.x, pos1.y, 
						_("Many-Rocket Pod Viper Half-wheels"), "Body1REC", "HalfTrack", "", "", "Rocket-Pod"
					));
					var pos2 = camRandPosInArea(spawnArea2);
					groupAdd(newGroup, addDroid(BONZI_BUDDY, pos2.x, pos2.y, 
						_("Bunker Buster Cyborg"), "CyborgLightBody", "CyborgLegs", "", "", "CyborgBB"
					));
				}
			}
			camManageGroup(newGroup, CAM_ORDER_ATTACK);
			if (supportIndex % 4 === 0 && !camTransporterOnMap(BONZI_BUDDY))
			{
				// Send a transport every 4th index
				var pos = camGenerateRandomMapCoordinate(camMakePos("landingZone"), 5);
				let list = [cTempl.crltruckw, cTempl.crltruckw, cTempl.crltruckw, cTempl.crltruckw];
				camSendReinforcement(BONZI_BUDDY, pos, list,
					CAM_REINFORCE_TRANSPORT, {
					entry: camGenerateRandomMapEdgeCoordinate(),
					exit: camGenerateRandomMapEdgeCoordinate()
				});
			}
			break;
		default:
			break;
	}
}

// Blows up the arena if wave 6 isn't completed in time
function detonateArena()
{
	if (waveIndex !== 6 || setupTime)
	{
		return; // Wave completed
	}
	else
	{
		// Nuke some random player object
		fireWeaponAtObj("NuclearDrumBlast", enumDroid(CAM_HUMAN_PLAYER).concat(enumStruct(CAM_HUMAN_PLAYER))[0])
		queue("detonateArena", camSecondsToMilliseconds(0.5)); // Try again if the player survives somehow
	}
}

// Place a bunch of Rain Rocket Batteries around the outside of the arena
function placeRainRockets()
{
	// Place lines at the NW and SE corners
	for (let i = 0; i < 8; i ++)
	{
		let x1 = 10 - i;
		let y1 = 3 + i;
		addStructure("Emplacement-Rocket06-IDF", BONZI_BUDDY, x1*128, y1*128);

		let x2 = 93 - i;
		let y2 = 66 + i;
		addStructure("Emplacement-Rocket06-IDF", BONZI_BUDDY, x2*128, y2*128);
	}

	// Place lines at the NE and SW corners
	for (let i = 0; i < 8; i ++)
	{
		let x1 = 85 + i;
		let y1 = 3 + i;
		addStructure("Emplacement-Rocket06-IDF", BONZI_BUDDY, x1*128, y1*128);
		
		let x2 = 3 + i;
		let y2 = 66 + i;
		addStructure("Emplacement-Rocket06-IDF", BONZI_BUDDY, x2*128, y2*128);
	}
}

function eventTransporterExit(transport)
{
	if (transport.player === CAM_HUMAN_PLAYER)
	{
		// Don't let the player call in any more reinforcements
		setReinforcementTime(-1);
	}
}

function eventTransporterLanded(transport)
{
	if (transport.player === CAM_HUMAN_PLAYER)
	{
		return;
	} 

	if (setupTime)
	{
		// Don't allow enemy transports to deliver more units during setup
		let mobList = enumDroid(MOBS)
		for (let i = 0; i < mobList.length; i++)
		{
			var unit = mobList[i];
			if (!camIsTransporter(unit)) camSafeRemoveObject(unit, false);
		}
		let bbList = enumDroid(BONZI_BUDDY)
		for (let i = 0; i < bbList.length; i++)
		{
			var unit = bbList[i];
			if (!camIsTransporter(unit)) camSafeRemoveObject(unit, false);
		}
	}
	else if (transport.player === BONZI_BUDDY)
	{
		// Replace all of the placeholder trucks with explosive drums
		var truckList = enumDroid(BONZI_BUDDY).filter((obj) => (
			obj.droidType === DROID_CONSTRUCT
		));;
		for (let i = 0; i < truckList.length; i++)
		{
			let truck = truckList[i];
			addFeature("ExplosiveDrum", truck.x, truck.y);
			camSafeRemoveObject(truck);
		}
	}
}

// Disable VTOL spawning after wave 11
function stopVtols()
{
	camSetVtolSpawnStateAll(false);
}

// Deal damage to any player object too close to the edge of the arena (marked by polished deepslate)
// Warning: Very bad code
function enforceNoGoArea()
{
	let list = [];
	// 4 corners of the arena
	let nw = {x: 12, y: 10};
	list = list.concat(enumArea(nw.x, nw.y, 20 + 1, 35 + 1, ALL_PLAYERS, false));
	list = list.concat(enumArea(nw.x, nw.y, 21 + 1, 30 + 1, ALL_PLAYERS, false));
	list = list.concat(enumArea(nw.x, nw.y, 22 + 1, 28 + 1, ALL_PLAYERS, false));
	list = list.concat(enumArea(nw.x, nw.y, 23 + 1, 26 + 1, ALL_PLAYERS, false));
	list = list.concat(enumArea(nw.x, nw.y, 24 + 1, 24 + 1, ALL_PLAYERS, false));
	list = list.concat(enumArea(nw.x, nw.y, 25 + 1, 23 + 1, ALL_PLAYERS, false));
	list = list.concat(enumArea(nw.x, nw.y, 27 + 1, 22 + 1, ALL_PLAYERS, false));
	list = list.concat(enumArea(nw.x, nw.y, 29 + 1, 21 + 1, ALL_PLAYERS, false));
	list = list.concat(enumArea(nw.x, nw.y, 31 + 1, 20 + 1, ALL_PLAYERS, false));
	list = list.concat(enumArea(nw.x, nw.y, 36 + 1, 19 + 1, ALL_PLAYERS, false));
	list = list.concat(enumArea(nw.x, nw.y, 59 + 1, 18 + 1, ALL_PLAYERS, false));
	let ne = {x: 84, y: 10};
	list = list.concat(enumArea(60, ne.y, ne.x, 19 + 1, ALL_PLAYERS, false));
	list = list.concat(enumArea(65, ne.y, ne.x, 20 + 1, ALL_PLAYERS, false));
	list = list.concat(enumArea(67, ne.y, ne.x, 21 + 1, ALL_PLAYERS, false));
	list = list.concat(enumArea(69, ne.y, ne.x, 22 + 1, ALL_PLAYERS, false));
	list = list.concat(enumArea(71, ne.y, ne.x, 23 + 1, ALL_PLAYERS, false));
	list = list.concat(enumArea(72, ne.y, ne.x, 24 + 1, ALL_PLAYERS, false));
	list = list.concat(enumArea(73, ne.y, ne.x, 26 + 1, ALL_PLAYERS, false));
	list = list.concat(enumArea(74, ne.y, ne.x, 28 + 1, ALL_PLAYERS, false));
	list = list.concat(enumArea(75, ne.y, ne.x, 30 + 1, ALL_PLAYERS, false));
	list = list.concat(enumArea(76, ne.y, ne.x, 35 + 1, ALL_PLAYERS, false));
	list = list.concat(enumArea(77, ne.y, ne.x, 40 + 1, ALL_PLAYERS, false));
	let se = {x: 84, y: 66};
	list = list.concat(enumArea(76, 41, se.x, se.y, ALL_PLAYERS, false));
	list = list.concat(enumArea(75, 46, se.x, se.y, ALL_PLAYERS, false));
	list = list.concat(enumArea(74, 48, se.x, se.y, ALL_PLAYERS, false));
	list = list.concat(enumArea(73, 50, se.x, se.y, ALL_PLAYERS, false));
	list = list.concat(enumArea(72, 52, se.x, se.y, ALL_PLAYERS, false));
	list = list.concat(enumArea(71, 53, se.x, se.y, ALL_PLAYERS, false));
	list = list.concat(enumArea(69, 54, se.x, se.y, ALL_PLAYERS, false));
	list = list.concat(enumArea(67, 55, se.x, se.y, ALL_PLAYERS, false));
	list = list.concat(enumArea(65, 56, se.x, se.y, ALL_PLAYERS, false));
	list = list.concat(enumArea(60, 57, se.x, se.y, ALL_PLAYERS, false));
	list = list.concat(enumArea(37, 58, se.x, se.y, ALL_PLAYERS, false));
	let sw = {x: 12, y: 66};
	list = list.concat(enumArea(sw.x, 57, 36 + 1, sw.y, ALL_PLAYERS, false));
	list = list.concat(enumArea(sw.x, 56, 31 + 1, sw.y, ALL_PLAYERS, false));
	list = list.concat(enumArea(sw.x, 55, 29 + 1, sw.y, ALL_PLAYERS, false));
	list = list.concat(enumArea(sw.x, 54, 27 + 1, sw.y, ALL_PLAYERS, false));
	list = list.concat(enumArea(sw.x, 53, 25 + 1, sw.y, ALL_PLAYERS, false));
	list = list.concat(enumArea(sw.x, 52, 24 + 1, sw.y, ALL_PLAYERS, false));
	list = list.concat(enumArea(sw.x, 50, 23 + 1, sw.y, ALL_PLAYERS, false));
	list = list.concat(enumArea(sw.x, 48, 22 + 1, sw.y, ALL_PLAYERS, false));
	list = list.concat(enumArea(sw.x, 46, 21 + 1, sw.y, ALL_PLAYERS, false));
	list = list.concat(enumArea(sw.x, 41, 20 + 1, sw.y, ALL_PLAYERS, false));
	list = list.concat(enumArea(sw.x, 36, 19 + 1, sw.y, ALL_PLAYERS, false));

	list = list.filter((obj) => (
		obj.type !== FEATURE && obj.player === CAM_HUMAN_PLAYER
	));
	let idList = []; // Don't punish the same object twice
	for (let i = 0; i < list.length; i++)
	{
		let obj = list[i];
		if (idList.indexOf(obj.id) === -1)
		{
			idList.push(obj.id);
		}
		else
		{
			continue;
		}

		if (obj.type === DROID)
		{
			// Deal a bit of damage (10% HP)
			if (Math.floor(obj.health) > 10)
			{
				setHealth(obj, obj.health - 10);
				fireWeaponAtObj("UTHurtSFX", obj);
			}
			else
			{
				camSafeRemoveObject(obj, true);
			}
		}
		else if (obj.type === STRUCTURE)
		{
			// Deal a lot of damage (50% HP)
			if (Math.floor(obj.health) > 50)
			{
				setHealth(obj, obj.health - 50);
				fireWeaponAtObj("UTHurtSFX", obj);
			}
			else
			{
				camSafeRemoveObject(obj, true);
			}
		}
	}
}

// Allow the player to win once all 12 waves are completed
function victoryCheck()
{
	if (waveIndex >= 13)
	{
		return true;
	}
	return undefined;
}

function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_SCRIPTED, "SUB_2_6S",{
		callback: "victoryCheck"
	});

	var startpos = camMakePos(getObject("landingZone"));
	var lz = getObject("landingZone"); //player lz
	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(40, 50, CAM_HUMAN_PLAYER);
	setTransporterExit(60, 30, CAM_HUMAN_PLAYER);

	setTimer("enforceNoGoArea", camSecondsToMilliseconds(2));

	waveIndex = 0;
	coreIndex = 0;
	supportIndex = 0;
	doneSpawning = true;
	setupTime = false;

	// Create a persistent group to put core wave units into.
	// The wave will end when all of the units in this group die.
	coreGroup = camNewGroup();
	camManageGroup(coreGroup, CAM_ORDER_ATTACK, {removable: false});

	// Also put all the spectators into a group so they don't automatically get grouped up.
	spectatorGroup = camMakeGroup(enumDroid(SPECTATORS));

	camCompleteRequiredResearch(BONZI_RES, BONZI_BUDDY);

	setAlliance(SPECTATORS, CAM_HUMAN_PLAYER, true);
	setAlliance(SPECTATORS, BONZI_BUDDY, true);
	setAlliance(SPECTATORS, MOBS, true);

	if (playerData[CAM_HUMAN_PLAYER].colour !== 8)
	{
		// Set spectators to yellow
		changePlayerColour(SPECTATORS, 8);
	}
	else
	{
		// Set spectators to orange
		changePlayerColour(SPECTATORS, 1);
	}

	// Add the wave billboard	
	camUpgradeOnMapFeatures("TreeSnow1", "SignArena");

	// Make structures funny
	camUpgradeOnMapStructures("Sys-SensoTower01", "Spawner-Zombie", MOBS);
	camUpgradeOnMapStructures("Sys-SensoTower02", "Spawner-Skeleton", MOBS);
}
