include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_bonziRes = [
	"R-Wpn-MG-Damage02", "R-Vehicle-Metals01", "R-Cyborg-Metals01",
	"R-Defense-WallUpgrade01", "R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage01",
	"R-Wpn-Cannon-Damage01", "R-Wpn-MG-ROF01", "R-Struc-RprFac-Upgrade01",
];

const MIS_SPECTATORS = 1; // Player number of the spectators/misc. arena objects.
const mis_spawnZones = ["spawnZone1", "spawnZone2", "spawnZone3", "spawnZone4", 
	"spawnZone5", "spawnZone6", "spawnZone7", "spawnZone8", 
	"spawnZone9", "spawnZone10", "spawnZone11", "spawnZone12", 
	"spawnZone13", "spawnZone14", "spawnZone15", "spawnZone16"]; // List of every spawning zone label
const mis_leftSpawnZones = ["spawnZone1", "spawnZone2", "spawnZone3", "spawnZone4", 
	"spawnZone5", "spawnZone6", "spawnZone7", "spawnZone8"]; // List of spawning zones on the left side of the arena.
const mis_rightSpawnZones = ["spawnZone9", "spawnZone10", "spawnZone11", "spawnZone12", 
	"spawnZone13", "spawnZone14", "spawnZone15", "spawnZone16"]; // List of spawning zones on the right side of the arena.
const mis_billboardTextures = [ null, 
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
var winFlag; // Whether the player has won.
var blackOut; // Whether the arena has been blacked out.

camAreaEvent("vtolRemoveZone", function(droid)
{
	camSafeRemoveObject(droid, false);
	resetLabel("vtolRemoveZone", CAM_BONZI_BUDDY);
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
		if (enumDroid(CAM_MOBS).concat(enumStruct(CAM_MOBS)).length > 0)
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
	updateBillboardTexture(true);
}

// Clear anything left of this wave and prepare for the next one
function advanceWave()
{
	// Clear out any leftover enemies
	const mobList = enumDroid(CAM_MOBS).concat(enumStruct(CAM_MOBS));
	for (let i = 0; i < mobList.length; i++)
	{
		const leftover = mobList[i];
		if (!camIsTransporter(leftover)) camSafeRemoveObject(leftover, true);
	}
	const bbList = enumDroid(CAM_BONZI_BUDDY).concat(enumStruct(CAM_BONZI_BUDDY));
	for (let i = 0; i < bbList.length; i++)
	{
		const leftover = bbList[i];
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

	updateBillboardTexture(false);

	// Play dialogue scenes...
	let dialogue = [];
	switch(waveIndex)
	{
		case 1:
			dialogue = [
				{text: "ARENA ANNOUNCER: Hello and welcome to The Colosseum.", delay: camSecondsToMilliseconds(3), sound: camSounds.announcer.w1_1},
				{text: "ARENA ANNOUNCER: *crowdcheer.ogg*", delay: camSecondsToMilliseconds(6), sound: camSounds.announcer.cCheer},
				{text: "ARENA ANNOUNCER: You have been summoned here by Lord BonziBUDDY to complete a series of challenges.", delay: camSecondsToMilliseconds(10), sound: camSounds.announcer.w1_2},
				{text: "ARENA ANNOUNCER: The rules of The Colosseum are simple.", delay: camSecondsToMilliseconds(16), sound: camSounds.announcer.w1_3},
				{text: "ARENA ANNOUNCER: Defeat the enemies in each wave to continue to the next.", delay: camSecondsToMilliseconds(19), sound: camSounds.announcer.w1_4},
				{text: "ARENA ANNOUNCER: You must survive all twelve waves in order to succeed.", delay: camSecondsToMilliseconds(23), sound: camSounds.announcer.w1_5},
				{text: "ARENA ANNOUNCER: Do not approach the edges of the arena, as this will damage your units.", delay: camSecondsToMilliseconds(27), sound: camSounds.announcer.w1_6},
				{text: "ARENA ANNOUNCER: The sign on the north side of the arena will show you what enemies you will face in the upcoming wave.", delay: camSecondsToMilliseconds(32), sound: camSounds.announcer.w1_7},
				{text: "ARENA ANNOUNCER: Finally, you may call one transport of reinforcements between each wave.", delay: camSecondsToMilliseconds(39), sound: camSounds.announcer.w1_8},
				{text: "ARENA ANNOUNCER: You may begin preparing for the first wave now.", delay: camSecondsToMilliseconds(44), sound: camSounds.announcer.w1_9},
			];
			queue("highlightBillboard", camSecondsToMilliseconds(32));
			queue("delayedSetup", camSecondsToMilliseconds(44));
			break;
		case 2:
			dialogue = [
				{text: "ARENA ANNOUNCER: *crowdcheer.ogg*", delay: camSecondsToMilliseconds(2), sound: camSounds.announcer.cCheer},
				{text: "ARENA ANNOUNCER: Very good. You are still alive.", delay: camSecondsToMilliseconds(6), sound: camSounds.announcer.w2_1},
				{text: "ARENA ANNOUNCER: You may begin preparing for the second wave.", delay: camSecondsToMilliseconds(9), sound: camSounds.announcer.w2_2},
			];
			break;
		case 3:
			dialogue = [
				{text: "ARENA ANNOUNCER: *crowdcheer.ogg*", delay: camSecondsToMilliseconds(2), sound: camSounds.announcer.cCheer},
				{text: "BONZI BUDDY: You have not fallen yet, Commander?", delay: camSecondsToMilliseconds(6), sound: camSounds.bonzi.w3_1},
				{text: "BONZI BUDDY: Then let's shake things up a bit...", delay: camSecondsToMilliseconds(9), sound: camSounds.bonzi.w3_2},
				{text: "ARENA ANNOUNCER: *crowdsuspense.ogg*", delay: camSecondsToMilliseconds(12), sound: camSounds.announcer.cGasp},
			];
			break;
		case 4:
			dialogue = [
				{text: "ARENA ANNOUNCER: *crowdcheer.ogg*", delay: camSecondsToMilliseconds(2), sound: camSounds.announcer.cCheer},
				{text: "ARENA ANNOUNCER: Congratulations. You are not dead.", delay: camSecondsToMilliseconds(6), sound: camSounds.announcer.w4_1},
				{text: "ARENA ANNOUNCER: You should keep doing that.", delay: camSecondsToMilliseconds(10), sound: camSounds.announcer.w4_2},
			];
			break;
		case 5:
			dialogue = [
				{text: "ARENA ANNOUNCER: *crowdcheer.ogg*", delay: camSecondsToMilliseconds(2), sound: camSounds.announcer.cCheer},
				{text: "ARENA ANNOUNCER: A reminder to all spectators to not look contestants directly in the eyes.", delay: camSecondsToMilliseconds(6), sound: camSounds.announcer.w5_1},
				{text: "ARENA ANNOUNCER: The Colosseum is not responsible for injuries caused by agitating the contestants.", delay: camSecondsToMilliseconds(12), sound: camSounds.announcer.w5_2},
				{text: "ARENA ANNOUNCER: The Colosseum is also not responsible for any heartbreaks caused by forming emotional ", delay: camSecondsToMilliseconds(19), sound: camSounds.announcer.w5_3},
				{text: "attachments to contestants who are then inevitably riddled with bullets.", delay: camSecondsToMilliseconds(19.1)},
			];
			break;
		case 6:
			dialogue = [
				{text: "ARENA ANNOUNCER: *crowdcheer.ogg*", delay: camSecondsToMilliseconds(2), sound: camSounds.announcer.cCheer},
				{text: "ARENA ANNOUNCER: Congratulations, you have reached the half-way point.", delay: camSecondsToMilliseconds(6), sound: camSounds.announcer.w6_1},
				{text: "BONZI BUDDY: This is growing tiresome, Commander. So I will add an extra challenge for this next wave.", delay: camSecondsToMilliseconds(11), sound: camSounds.bonzi.w6_1},
				{text: "BONZI BUDDY: If you do not finish the wave within the time limit, I will wipe this arena with nuclear fire.", delay: camSecondsToMilliseconds(18), sound: camSounds.bonzi.w6_2},
				{text: "ARENA ANNOUNCER: Please do not blow up The Colosseum.", delay: camSecondsToMilliseconds(25), sound: camSounds.announcer.w6_2},
			];
			break;
		case 7:
			dialogue = [
				{text: "ARENA ANNOUNCER: *crowdcheer.ogg*", delay: camSecondsToMilliseconds(2), sound: camSounds.announcer.cCheer},
				{text: "ARENA ANNOUNCER: Congratulations on not blowing up.", delay: camSecondsToMilliseconds(6), sound: camSounds.announcer.w7_1},
				{text: "ARENA ANNOUNCER: Please prepare for the next wave.", delay: camSecondsToMilliseconds(9), sound: camSounds.announcer.w7_2},
			];
			break;
		case 8:
			dialogue = [
				{text: "ARENA ANNOUNCER: *crowdcheer.ogg*", delay: camSecondsToMilliseconds(2), sound: camSounds.announcer.cCheer},
				{text: "ARENA ANNOUNCER: A reminder to all spectators that The Colosseum is not responsible for any injuries ", delay: camSecondsToMilliseconds(6), sound: camSounds.announcer.w8_1},
				{text: "caused by rockets, shells, large rocks, or other projectiles that are hurled into the spectator gallery.", delay: camSecondsToMilliseconds(6.1)},

			];
			break;
		case 9:
			dialogue = [
				{text: "ARENA ANNOUNCER: *crowdcheer.ogg*", delay: camSecondsToMilliseconds(2), sound: camSounds.announcer.cCheer},
				{text: "ARENA ANNOUNCER: Please do not refer to The Colosseum as a \"Circle of Slaughter\".", delay: camSecondsToMilliseconds(6), sound: camSounds.announcer.w9_1},
				{text: "ARENA ANNOUNCER: We cannot afford the legal fees, since the majority of our funds are spent feeding the contestants.", delay: camSecondsToMilliseconds(12), sound: camSounds.announcer.w9_2},
				{text: "ARENA ANNOUNCER: With the funds.", delay: camSecondsToMilliseconds(20), sound: camSounds.announcer.w9_3},
				{text: "ARENA ANNOUNCER: We feed them money.", delay: camSecondsToMilliseconds(26), sound: camSounds.announcer.w9_4},
				{text: "ARENA ANNOUNCER: We are financially unstable.", delay: camSecondsToMilliseconds(34), sound: camSounds.announcer.w9_5},
			];
			break;
		case 10:
			dialogue = [
				{text: "ARENA ANNOUNCER: *crowdcheer.ogg*", delay: camSecondsToMilliseconds(2), sound: camSounds.announcer.cCheer},
				{text: "ARENA ANNOUNCER: This next wave is by far the most challenging yet, Commander.", delay: camSecondsToMilliseconds(6), sound: camSounds.announcer.w10_1},
				{text: "ARENA ANNOUNCER: But you have done well up to now, hopefully you can persevere.", delay: camSecondsToMilliseconds(11), sound: camSounds.announcer.w10_2},
				{text: "BONZI BUDDY: Or don't.", delay: camSecondsToMilliseconds(16), sound: camSounds.bonzi.w10_1},
				{text: "BONZI BUDDY: You could just die now.", delay: camSecondsToMilliseconds(17), sound: camSounds.bonzi.w10_2},
				{text: "ARENA ANNOUNCER: Please do not die yet. Our ratings have never been higher.", delay: camSecondsToMilliseconds(20), sound: camSounds.announcer.w10_3},
			];
			break;
		case 11:
			dialogue = [
				{text: "ARENA ANNOUNCER: *crowdcheer.ogg*", delay: camSecondsToMilliseconds(2), sound: camSounds.announcer.cCheer},
				{text: "BONZI BUDDY: Enough. This is the end for you.", delay: camSecondsToMilliseconds(6), sound: camSounds.bonzi.w11_1},
				{text: "BONZI BUDDY: Prepare to bow before the might of Lord BonziBUDDY!", delay: camSecondsToMilliseconds(10), sound: camSounds.bonzi.w11_2},
			];
			break;
		case 12:
			dialogue = [
				{text: "ARENA ANNOUNCER: *crowdsurprise.ogg*", delay: camSecondsToMilliseconds(2), sound: camSounds.announcer.cGasp},
				{text: "BONZI BUDDY: I should've known that slimy salesman couldn't be trusted.", delay: camSecondsToMilliseconds(5), sound: camSounds.bonzi.w12_1},
				{text: "SPAMTON: HAEAHAEAHAEAHAEAH!!", delay: camSecondsToMilliseconds(10), sound: camSounds.spamton.laugh},
				{text: "SPAMTON: THAT'SW HAT YOU GET FOR [[#!@% my face]]!!!", delay: camSecondsToMilliseconds(12), sound: camSounds.spamton.talk2},
				{text: "BONZI BUDDY: Nonetheless, this is as far as you go, Commander.", delay: camSecondsToMilliseconds(15), sound: camSounds.bonzi.w12_2},
				{text: "BONZI BUDDY: For you will not stand against my most valiant warrior.", delay: camSecondsToMilliseconds(20), sound: camSounds.bonzi.w12_3},
				{text: "BONZI BUDDY: Prepare to meet your end!", delay: camSecondsToMilliseconds(25), sound: camSounds.bonzi.w12_4},
			];
			break;
		case 13:
			dialogue = [
				{text: "ARENA ANNOUNCER: *crowdcheer.ogg*", delay: camSecondsToMilliseconds(2), sound: camSounds.announcer.cCheer},
				{text: "BONZI BUDDY: Impossible!", delay: camSecondsToMilliseconds(6), sound: camSounds.bonzi.end_1},
				{text: "ARENA ANNOUNCER: Congratulations, Commander.", delay: camSecondsToMilliseconds(9), sound: camSounds.announcer.end_1},
				{text: "ARENA ANNOUNCER: You have successfully overcome the challenges and are now the Colosseum champion.", delay: camSecondsToMilliseconds(12), sound: camSounds.announcer.end_2},
				{text: "BONZI BUDDY: No!", delay: camSecondsToMilliseconds(18), sound: camSounds.bonzi.end_2},
				{text: "ARENA ANNOUNCER: We will now grant you your hard-earned victory prize.", delay: camSecondsToMilliseconds(20), sound: camSounds.announcer.end_3},
				{text: "ARENA ANNOUNCER: 5$ have been wired to your account.", delay: camSecondsToMilliseconds(24), sound: camSounds.announcer.end_4},
			];
			queue("allowVictory", camSecondsToMilliseconds(29));
			if (blackOut) camEndBlackOut();
			break;
	}
	camQueueDialogues(dialogue);

	if (waveIndex > 1)
	{
		// Enable player reinforcements
		setReinforcementTime(10);
		// playSound(camSounds.project.reinforceAvail); // "Reinforcements are available"

		// Setup phase is 119 seconds (~2 minutes)
		const PREP_PHASE_DURATION = 119;
		setMissionTime(PREP_PHASE_DURATION);

		// Grant the player temporary full visibility
		addSpotter(48, 38, 0, 8192, false, gameTime + camSecondsToMilliseconds(PREP_PHASE_DURATION));

		queue("beginWave", camSecondsToMilliseconds(PREP_PHASE_DURATION));
	}
	else
	{
		// Grant the player temporary full visibility
		// The delay is the wave 1 setup duration plus the length of the announcer dialogue
		// Yes, I know magic numbers are bad but I'm feeling lazy right now
		addSpotter(48, 38, 0, 8192, false, gameTime + camSecondsToMilliseconds(59 + 44));
	}
}

function updateBillboardTexture(gameLoad)
{
	if (waveIndex > 0 && waveIndex < 13)
	{
		let oldTexture = (gameLoad) ? "page-506-cursedsignsarena1.png" : mis_billboardTextures[waveIndex - 1];
		let newTexture = mis_billboardTextures[waveIndex];
		// These waves have varying unit compositions depending on the difficulty
		if (waveIndex === 4 || waveIndex === 7 || waveIndex === 8
			|| waveIndex === 9 || waveIndex === 10 || waveIndex === 12)
		{
			if (difficulty <= EASY)
			{
				newTexture = newTexture.substring(0, newTexture.length - 4).concat("easy.png");
			}
			else if (difficulty >= HARD)
			{
				newTexture = newTexture.substring(0, newTexture.length - 4).concat("hard.png");
			}
		}
		// Also check the previous wave
		const PREV_WAVE_INDEX = waveIndex - 1;
		if (!gameLoad && (PREV_WAVE_INDEX === 4 || PREV_WAVE_INDEX === 7 || PREV_WAVE_INDEX === 8
			|| PREV_WAVE_INDEX === 9 || PREV_WAVE_INDEX === 10 || PREV_WAVE_INDEX === 12))
		{
			if (difficulty <= EASY)
			{
				oldTexture = oldTexture.substring(0, oldTexture.length - 4).concat("easy.png");
			}
			else if (difficulty >= HARD)
			{
				oldTexture = oldTexture.substring(0, oldTexture.length - 4).concat("hard.png");
			}
		}

		replaceTexture(oldTexture, newTexture);
	}
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
// Support Units: Cooler MG Cyborgs, BB Cyborgs, Many-Rocket Pod (half-track), Peppersprays (half-track), and Transporter (Explosive Drums)
// Notes: A "Blackout" event will be triggered when Freddy reaches half health (might be reserved for higher difficulties).

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
			// Remove the beacon by the billboard
			hackRemoveMessage("C24_SIGN", PROX_MSG, CAM_HUMAN_PLAYER);
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
			queue("spawnCoreUnits", camSecondsToMilliseconds(20));
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
			// const gateList = enumStruct(MIS_SPECTATORS);
			// for (let i = 0; i < gateList.length; i++)
			// {
			// 	const gate = gateList[i];
			// 	camSafeRemoveObject(gate, false);
			// }
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
			setTimer("spawnSupportUnits", camChangeOnDiff(camSecondsToMilliseconds(30)));
			break;
		case 11: // This wave is just a bunch of VTOLs
			camSetVtolData(CAM_BONZI_BUDDY, undefined, camMakePos("vtolRemoveZone"), [cTempl.colatv],
				camSecondsToMilliseconds(0.5), undefined, {minVTOLs: 50, maxRandomVTOLs: 0}
			);
			queue("stopVtols", camSecondsToMilliseconds(8.1));
			queue("advanceWave", camSecondsToMilliseconds(30));
			break;
		case 12: // Boss wave: Core unit is spawned immediately
			spawnCoreUnits();
			spawnSupportUnits();
			setTimer("spawnSupportUnits", camChangeOnDiff(camSecondsToMilliseconds(10)));
			setTimer("checkFreddyHP", camSecondsToMilliseconds(2));
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
	clearSpawnZones();

	switch (waveIndex)
	{
		case 1: // Spawn a total of 10 Zombies, 10 Skeletons, and 2 Creepers
		{
			let SPAWN_AREA = mis_spawnZones[camRand(mis_spawnZones.length)];
			switch (coreIndex)
			{
				case 1: 
				case 4: // Spawn 5 Zombies
					for (let i = 0; i < 5; i++)
					{
						const pos = camRandPosInArea(SPAWN_AREA);
						groupAdd(coreGroup, addDroid(CAM_MOBS, pos.x, pos.y, 
							_("Zombie"), "ZombieBody", "CyborgLegs", "", "", "Cyb-Wpn-ZmbieMelee"
						));
					}
					break;
				case 2: 
				case 5: // Spawn 5 Skeletons
					for (let i = 0; i < 5; i++)
					{
						const pos = camRandPosInArea(SPAWN_AREA);
						groupAdd(coreGroup, addDroid(CAM_MOBS, pos.x, pos.y, 
							_("Skeleton"), "SkeletonBody", "CyborgLegs", "", "", "Cyb-Wpn-SkelBow"
						));
					}
					break;
				case 3: 
				case 6: // Spawn a Creeper
					const pos = camRandPosInArea(SPAWN_AREA);
					groupAdd(coreGroup, addDroid(CAM_MOBS, pos.x, pos.y, 
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
		}
		case 2: // Spawn a total of 12 Realistic MGs, 10 BB Cyborgs, and 10 Cool Cyborgs
		{
			switch (coreIndex) // Note that nothing happens on case 3:
			{
				case 1: 
				case 4: // Spawn 6 Realistic MGs
					const SPAWN_AREA = mis_spawnZones[camRand(mis_spawnZones.length)];
					for (let i = 0; i < 5; i++)
					{
						const pos = camRandPosInArea(SPAWN_AREA);
						groupAdd(coreGroup, addDroid(CAM_BONZI_BUDDY, pos.x, pos.y, 
							_("Realistic Heavy Machinegun Viper II Half-wheels"), "Body5REC", "HalfTrack", "", "", "MG3Mk1"
						));
					}
					break;
				case 2: 
				case 5: // Spawn 5 BB Cyborgs and 5 Cool Cyborgs (split into two spawns)
					const SPAWN_AREA1 = mis_spawnZones[camRand(mis_spawnZones.length)];
					const SPAWN_AREA2 = mis_spawnZones[camRand(mis_spawnZones.length)];
					for (let i = 0; i < 5; i++)
					{
						let pos1;
						let pos2;
						if (i % 2 === 0)
						{
							pos1 = camRandPosInArea(SPAWN_AREA1);
							pos2 = camRandPosInArea(SPAWN_AREA2);
						}
						else
						{
							pos1 = camRandPosInArea(SPAWN_AREA2);
							pos2 = camRandPosInArea(SPAWN_AREA1);
						}
						groupAdd(coreGroup, addDroid(CAM_BONZI_BUDDY, pos1.x, pos1.y, 
							_("Cooler Machinegunner Cyborg"), "CyborgLightBody", "CyborgLegs", "", "", "NX-CyborgChaingun"
						));
						groupAdd(coreGroup, addDroid(CAM_BONZI_BUDDY, pos2.x, pos2.y, 
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
		}
		case 3: // Spawn a total of 16 Fungible Cannons and 32 "Light" Cannon Cyborgs
		{
			if (coreIndex <= 8)
			{
				// Spawn a group of 2 Fungible Cannons and 4 "Light" Cannon Cyborgs 8 times
				const SPAWN_AREA = mis_spawnZones[camRand(mis_spawnZones.length)];
				for (let i = 0; i < 2; i++)
				{
					const pos = camRandPosInArea(SPAWN_AREA);
					groupAdd(coreGroup, addDroid(CAM_BONZI_BUDDY, pos.x, pos.y, 
						_("Fungible Cannon Viper II Half-wheels"), "Body5REC", "HalfTrack", "", "", camRandomFungibleCannon()
					));
				}
				for (let i = 0; i < 4; i++)
				{
					const pos = camRandPosInArea(SPAWN_AREA);
					groupAdd(coreGroup, addDroid(CAM_BONZI_BUDDY, pos.x, pos.y, 
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
		}
		case 4:
		{
			// Spawn a total of:
			// (Easy-) 8 Twin BBs, 20 Realistic MGs, and 20 Sawed-Off Lancers
			// (Normal) 12 Twin BBs, 30 Realistic MGs, and 30 Sawed-Off Lancers
			// (Hard+) 12 Twin BBs, 42 Realistic MGs, and 42 Sawed-Off Lancers
			const SPAWN_AREA = mis_spawnZones[camRand(mis_spawnZones.length)];
			let weapon;
			let name;
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
			const NUM_UNITS = (difficulty <= MEDIUM) ? 5 : 7;
			for (let i = 0; i < NUM_UNITS; i++) // Spawn the chosen vehicles
			{
				const pos = camRandPosInArea(SPAWN_AREA);
				groupAdd(coreGroup, addDroid(CAM_BONZI_BUDDY, pos.x, pos.y, 
					_(name), "Body1REC", "wheeledskiddy", "", "", weapon));
			}
			const pos = camRandPosInArea(SPAWN_AREA);
			groupAdd(coreGroup, addDroid(CAM_BONZI_BUDDY, pos.x, pos.y, 
				_("Bunker Buster II Viper II Half-wheels"), "Body5REC", "HalfTrack", "", "", "Rocket-BB2"
			));
			if ((coreIndex >= 12) || (difficulty <= EASY && coreIndex >= 8))
			{
				// Spawning is done
				doneSpawning = true;
				removeTimer("spawnCoreUnits");
			}
			break;
		}
		case 5: // Spawn a total of 8 Endermen
		{
			const SPAWN_AREA = mis_spawnZones[camRand(mis_spawnZones.length)];
			const pos = camRandPosInArea(SPAWN_AREA);
			groupAdd(coreGroup, addDroid(CAM_MOBS, pos.x, pos.y, 
				_("Enderman"), "EndermanBody", "CyborgLegs", "", "", "Cyb-Wpn-EnderMelee"
			));
			if (coreIndex >= 8)
			{
				// Spawning is done
				doneSpawning = true;
				removeTimer("spawnCoreUnits");
			}
			break;
		}
		case 6: // Spawn 2 Big Machinegun Viper Wheels on opposite sides of the arena
		{
			const pos1 = camRandPosInArea("spawnZone4");
			const pos2 = camRandPosInArea("spawnZone12");
			groupAdd(coreGroup, addDroid(CAM_MOBS, pos1.x, pos1.y, 
				_("Big Machinegun Viper Wheels"), "Body1BIG", "wheeled01", "", "", "MG3Mk2"
			));
			groupAdd(coreGroup, addDroid(CAM_MOBS, pos2.x, pos2.y, 
				_("Big Machinegun Viper Wheels"), "Body1BIG", "wheeled01", "", "", "MG3Mk2"
			));
			doneSpawning = true;
			break;
		}
		case 7: // Spawn a total of: 
		{
			// (Easy-) 32 Sword Cyborgs and 32 Archer Cyborgs
			// (Normal) 48 Sword Cyborgs and 48 Archer Cyborgs
			// (Hard+) 64 Sword Cyborgs and 64 Archer Cyborgs
			const SPAWN_AREA1 = mis_spawnZones[camRand(mis_spawnZones.length)];
			for (let i = 0; i < 8; i++)
			{
				// Spawn 8 Sword Cyborgs
				const pos = camRandPosInArea(SPAWN_AREA1);
				groupAdd(coreGroup, addDroid(CAM_BONZI_BUDDY, pos.x, pos.y, 
					_("Sword Cyborg"), "CyborgLightBody", "CyborgLegs", "", "", "Cyb-Wpn-Sword"
				));
			}
			const SPAWN_AREA2 = mis_spawnZones[camRand(mis_spawnZones.length)];
			for (let i = 0; i < 8; i++)
			{
				// Spawn 8 Archer Cyborgs
				const pos = camRandPosInArea(SPAWN_AREA2);
				groupAdd(coreGroup, addDroid(CAM_BONZI_BUDDY, pos.x, pos.y, 
					_("Archer Cyborg"), "CyborgLightBody", "CyborgLegs", "", "", "Cyb-Wpn-Bow"
				));
			}
			if ((difficulty >= HARD && coreIndex >= 8) || (difficulty === MEDIUM && coreIndex >= 6) || (difficulty <= EASY && coreIndex >= 4))
			{
				// Spawning is done
				doneSpawning = true;
				removeTimer("spawnCoreUnits");
			}
			break;
		}
		case 8: // Spawn a total of:
		{
			// (Normal-) 16 Sensors and 32 "Light" Cannons
			// (Hard+) 20 Sensors and 40 "Light" Cannons
			const SPAWN_AREA1 = mis_spawnZones[camRand(mis_spawnZones.length)];
			for (let i = 0; i < 4; i++)
			{
				// Spawn 4 "Light" Cannons
				const pos = camRandPosInArea(SPAWN_AREA1);
				groupAdd(coreGroup, addDroid(CAM_BONZI_BUDDY, pos.x, pos.y, 
					_("\"Light\" Cannon Viper Half-wheels"), "Body1REC", "HalfTrack", "", "", "Cannon1Mk1"
				));
			}
			// Include a Sensor with the cannons
			const pos1 = camRandPosInArea(SPAWN_AREA1);
			groupAdd(coreGroup, addDroid(CAM_BONZI_BUDDY, pos1.x, pos1.y, 	
				_("Sensor Viper II Thick Wheels"), "Body5REC", "tracked01", "", "", "SensorTurret1Mk1"
			));
			// Spawn an additional Sensor somewhere else
			const SPAWN_AREA2 = mis_spawnZones[camRand(mis_spawnZones.length)];
			const pos2 = camRandPosInArea(SPAWN_AREA2);
			groupAdd(coreGroup, addDroid(CAM_BONZI_BUDDY, pos2.x, pos2.y, 	
				_("Sensor Viper II Thick Wheels"), "Body5REC", "tracked01", "", "", "SensorTurret1Mk1"
			));
			if (coreIndex >= 10 || (difficulty <= EASY && coreIndex >= 8))
			{
				// Spawning is done
				doneSpawning = true;
				removeTimer("spawnCoreUnits");
			}
			break;
		}
		case 9: // Spawn a total of:
		{
			// (Normal-) 48 Zombies, 24 Baby Zombies, 36 Sword Cyborgs, and 36 Cool Cyborgs
			// (Hard+) 64 Zombies, 32 Baby Zombies, 48 Sword Cyborgs, and 48 Cool Cyborgs
			// Mobs spawn from the left, BB's units spawn from the right.
			const SPAWN_AREA1 = mis_leftSpawnZones[camRand(mis_leftSpawnZones.length)];
			for (let i = 0; i < 4; i++)
			{
				// Spawn 4 Zombies and 2 Baby Zombies
				const pos1 = camRandPosInArea(SPAWN_AREA1);
				groupAdd(coreGroup, addDroid(CAM_MOBS, pos1.x, pos1.y, 
					_("Zombie"), "ZombieBody", "CyborgLegs", "", "", "Cyb-Wpn-ZmbieMelee"
				));
				if (i % 2 === 0)
				{
					const pos2 = camRandPosInArea(SPAWN_AREA1);
					groupAdd(coreGroup, addDroid(CAM_MOBS, pos2.x, pos2.y, 
						_("Baby Zombie"), "BabyZombieBody", "CyborgLegs", "", "", "Cyb-Wpn-BabyZmbieMelee"
					));
				}
			}
			const SPAWN_AREA2 = mis_rightSpawnZones[camRand(mis_rightSpawnZones.length)];
			for (let i = 0; i < 3; i++)
			{
				// Spawn 3 Sword Cyborgs and 3 Cool Cyborgs
				const pos1 = camRandPosInArea(SPAWN_AREA2);
				groupAdd(coreGroup, addDroid(CAM_BONZI_BUDDY, pos1.x, pos1.y, 
					_("Sword Cyborg"), "CyborgLightBody", "CyborgLegs", "", "", "Cyb-Wpn-Sword"
				));
				const pos2 = camRandPosInArea(SPAWN_AREA2);
				groupAdd(coreGroup, addDroid(CAM_BONZI_BUDDY, pos2.x, pos2.y, 
					_("Cooler Machinegunner Cyborg"), "CyborgLightBody", "CyborgLegs", "", "", "NX-CyborgChaingun"
				));
			}
			if (coreIndex >= 16 || (difficulty <= MEDIUM && coreIndex >= 12))
			{
				// Spawning is done
				doneSpawning = true;
				removeTimer("spawnCoreUnits");
			}
			break;
		}
		case 10: // Spawn a total of:
		{
			// (Easy-) 4 Endermen, 32 Fungible Cannons, 16 Many-Rocket Pods, and 16 Realistic MGs
			// (Normal) 4 Endermen, 40 Fungible Cannons, 20 Many-Rocket Pods, and 20 Realistic MGs
			// (Hard+) 4 Endermen, 80 Fungible Cannons, 20 Many-Rocket Pods, and 20 Realistic MGs
			if (coreIndex === 1)
			{
				// Spawn 4 Endermen from 4 different directions
				const zoneList = ["spawnZone1", "spawnZone5", "spawnZone9", "spawnZone13"];
				for (let i = 0; i < zoneList.length; i++)
				{
					const pos = camRandPosInArea(zoneList[i]);
					groupAdd(coreGroup, addDroid(CAM_MOBS, pos.x, pos.y, 
						_("Enderman"), "EndermanBody", "CyborgLegs", "", "", "Cyb-Wpn-EnderMelee"
					));
				}
			}
			// Wait a bit before spawning more core units.
			else if (coreIndex >= 4)
			{
				const SPAWN_AREA = mis_spawnZones[camRand(mis_spawnZones.length)];
				if (coreIndex % 2 === 0)
				{
					// Spawn Fungible Cannons on even indexes
					const NUM_UNITS = (difficulty <= MEDIUM) ? 4 : 8;
					for (let i = 0; i < NUM_UNITS; i++)
					{
						const pos = camRandPosInArea(SPAWN_AREA);
						groupAdd(coreGroup, addDroid(CAM_BONZI_BUDDY, pos.x, pos.y, 
							_("Fungible Cannon Viper II Thick Wheels"), "Body5REC", "tracked01", "", "", camRandomFungibleCannon()
						));
					}
				}
				else
				{
					// Spawn 2 Many-Rocket Pods and 2 Realistic MGs on odd indexes
					for (let i = 0; i < 4; i++)
					{
						let weapon;
						let name;
						if (i % 2 === 0)
						{
							// Spawn a Many-Rocket Pod
							weapon = "Rocket-Pod";
							name = "Many-Rocket Pod Viper Thick Wheels";
						}
						else
						{
							// Spawn a Realistic MG
							weapon = "MG3Mk1";
							name = "Realistic Heavy Machinegun Viper Thick Wheels";
						}
						const pos = camRandPosInArea(SPAWN_AREA);
						groupAdd(coreGroup, addDroid(CAM_BONZI_BUDDY, pos.x, pos.y, 
							_(name), "Body1REC", "tracked01", "", "", weapon));
					}
				}
				if (coreIndex >= 23 || (difficulty <= EASY && coreIndex >= 19))
				{
					// Spawning is done
					doneSpawning = true;
					removeTimer("spawnCoreUnits");
				}
			}
			break;
			break;
		}
		case 12: // Spawn a giant bear
		{
			const SPAWN_AREA = mis_spawnZones[camRand(mis_spawnZones.length)];
			const pos = camRandPosInArea(SPAWN_AREA);
			groupAdd(coreGroup, addDroid(CAM_BONZI_BUDDY, pos.x, pos.y, 
				_("Freddy Fazbear"), "FreddyBody", "CyborgLegs", "", "", "CannonBison", "CannonBison"
			));
			doneSpawning = true;
			break;
		}
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
		{
			if (!camTransporterOnMap(CAM_BONZI_BUDDY))
			{
				const pos = camGenerateRandomMapCoordinate(camMakePos("landingZone"), 5);
				const list = [cTempl.crltruckw, cTempl.crltruckw, cTempl.crltruckw, cTempl.crltruckw];
				camSendReinforcement(CAM_BONZI_BUDDY, pos, list,
					CAM_REINFORCE_TRANSPORT, {
					entry: camGenerateRandomMapEdgeCoordinate(),
					exit: camGenerateRandomMapEdgeCoordinate()
				});
			}
			break;
		}
		case 4: // Send transports carrying Many-Rocket Cyborgs
		{
			if (!camTransporterOnMap(CAM_BONZI_BUDDY))
			{
				const pos = camGenerateRandomMapCoordinate(camMakePos("landingZone"), 5);
				const list = [];
				for (let i = 0; i < difficulty + 6; i++)
				{
					list.push(cTempl.crcybpod);
				}
				camSendReinforcement(CAM_BONZI_BUDDY, pos, list, CAM_REINFORCE_TRANSPORT, {
					entry: camGenerateRandomMapEdgeCoordinate(),
					exit: camGenerateRandomMapEdgeCoordinate()
				});
			}
			break;
		}
		case 5: // Spawn Creepers and Skeletons
		{
			const NEW_GROUP = camNewGroup();
			const SPAWN_AREA = mis_spawnZones[camRand(mis_spawnZones.length)];
			if (supportIndex % 2 === 0)
			{
				// Spawn Skeletons on even indexes
				let numMobs = 2;
				if (difficulty >= HARD) numMobs++;
				if (difficulty >= INSANE) numMobs++;
				for (let i = 0; i < numMobs; i++)
				{
					const pos = camRandPosInArea(SPAWN_AREA);
					groupAdd(NEW_GROUP, addDroid(CAM_MOBS, pos.x, pos.y, 
						_("Skeleton"), "SkeletonBody", "CyborgLegs", "", "", "Cyb-Wpn-SkelBow"
					));
				}
			}
			else
			{
				// Spawn a Creeper on odd indexes
				let numMobs = 1;
				if (difficulty >= INSANE) numMobs++;
				for (let i = 0; i < numMobs; i++)
				{
					const pos = camRandPosInArea(SPAWN_AREA);
					groupAdd(NEW_GROUP, addDroid(CAM_MOBS, pos.x, pos.y, 
						_("Creeper"), "CreeperBody", "CyborgLegs", "", "", "Cyb-Wpn-CreeperDud"
					));
				}
			}
			camManageGroup(NEW_GROUP, CAM_ORDER_ATTACK);
			break;
		}
		case 6: // Spawn four groups of Mini MGV's
		{
			const SPAWN_AREA1 = mis_spawnZones[camRand(mis_spawnZones.length)];
			const SPAWN_AREA2 = mis_spawnZones[camRand(mis_spawnZones.length)];
			const SPAWN_AREA3 = mis_spawnZones[camRand(mis_spawnZones.length)];
			const SPAWN_AREA4 = mis_spawnZones[camRand(mis_spawnZones.length)];
			const NEW_GROUP = camNewGroup();
			for (let i = 0; i < difficulty + 6; i++)
			{
				const pos1 = camRandPosInArea(SPAWN_AREA1);
				groupAdd(NEW_GROUP, addDroid(CAM_MOBS, pos1.x, pos1.y, 
					_("Mini Machinegun Viper Wheels"), "Body1Mini", "wheeled01", "", "", "MGMini"
				));
				const pos2 = camRandPosInArea(SPAWN_AREA2);
				groupAdd(NEW_GROUP, addDroid(CAM_MOBS, pos2.x, pos2.y, 
					_("Mini Machinegun Viper Wheels"), "Body1Mini", "wheeled01", "", "", "MGMini"
				));
				const pos3 = camRandPosInArea(SPAWN_AREA3);
				groupAdd(NEW_GROUP, addDroid(CAM_MOBS, pos3.x, pos3.y, 
					_("Mini Machinegun Viper Wheels"), "Body1Mini", "wheeled01", "", "", "MGMini"
				));
				const pos4 = camRandPosInArea(SPAWN_AREA4);
				groupAdd(NEW_GROUP, addDroid(CAM_MOBS, pos4.x, pos4.y, 
					_("Mini Machinegun Viper Wheels"), "Body1Mini", "wheeled01", "", "", "MGMini"
				));
			}
			camManageGroup(NEW_GROUP, CAM_ORDER_ATTACK);
			break;
		}
		case 7:
		{
			// Send transports carrying "Light" Cannons
			// If on Hard+, instead send BB 2's
			if (!camTransporterOnMap(CAM_BONZI_BUDDY))
			{
				// Send a transport every third index
				const pos = camGenerateRandomMapCoordinate(camMakePos("landingZone"), 5);
				const list = [];
				if (difficulty <= MEDIUM)
				{
					for (let i = 0; i < difficulty + 6; i++)
					{
						list.push(cTempl.crlcanht);
					}
				}
				else
				{
					for (let i = 0; i < difficulty - 1; i++)
					{
						// 2 on Hard, 3 on Insane
						list.push(cTempl.crmbb2ht);
					}
				}
				camSendReinforcement(CAM_BONZI_BUDDY, pos, list, CAM_REINFORCE_TRANSPORT, {
					entry: camGenerateRandomMapEdgeCoordinate(),
					exit: camGenerateRandomMapEdgeCoordinate()
				});
			}
			break;
		}
		case 8: // Spawn Catapults (except on Easy-)
		{
			if (difficulty >= MEDIUM)
			{
				const NEW_GROUP = camNewGroup();
				const SPAWN_AREA = mis_spawnZones[camRand(mis_spawnZones.length)];
				const NUM_UNITS = 1 + difficulty;
				for (let i = 0; i < NUM_UNITS; i++)
				{
					const pos = camRandPosInArea(SPAWN_AREA);
					groupAdd(NEW_GROUP, addDroid(CAM_BONZI_BUDDY, pos.x, pos.y, 
						_("Catapult Viper II Half-wheels"), "Body5REC", "HalfTrack", "", "", "Mortar1Mk1"
					));
				}
				camManageGroup(NEW_GROUP, CAM_ORDER_ATTACK);
			}
			break;
		}
		case 9: // Spawn Creepers, Skeletons, Archer Cyborgs, Twin BBs, and transports carrying Many-Rocket Pods
		{
			if (supportIndex % 2 === 1)
			{
				// Spawn mobs on odd indexes
				const NEW_GROUP = camNewGroup();
				const SPAWN_AREA = mis_leftSpawnZones[camRand(mis_leftSpawnZones.length)];
				let numMobs = 2;
				if (difficulty >= HARD) numMobs++;
				if (difficulty >= INSANE) numMobs++;
				for (let i = 0; i < numMobs; i++)
				{
					// Spawn Skeletons
					const pos = camRandPosInArea(SPAWN_AREA);
					groupAdd(NEW_GROUP, addDroid(CAM_MOBS, pos.x, pos.y, 
						_("Skeleton"), "SkeletonBody", "CyborgLegs", "", "", "Cyb-Wpn-SkelBow"
					));
				}
				if (supportIndex % 4 === 0 || difficulty >= HARD)
				{
					// Add a Creeper every other mob spawn (or every spawn if on Hard+)
					const pos = camRandPosInArea(SPAWN_AREA);
					groupAdd(NEW_GROUP, addDroid(CAM_MOBS, pos.x, pos.y, 
						_("Creeper"), "CreeperBody", "CyborgLegs", "", "", "Cyb-Wpn-CreeperDud"
					));
				}
				camManageGroup(NEW_GROUP, CAM_ORDER_ATTACK);
			}
			else
			{
				// Spawn Bonzi Buddy units on even indexes
				if (supportIndex % 4 === 0)
				{
					// Spawn Archer Cyborgs and Twin BBs every other Bonzi Buddy spawn
					const NEW_GROUP = camNewGroup();
					const SPAWN_AREA = mis_rightSpawnZones[camRand(mis_rightSpawnZones.length)];
					let numCyborgs = 2;
					if (difficulty >= HARD) numCyborgs++;
					if (difficulty >= INSANE) numCyborgs++;
					for (let i = 0; i < numCyborgs; i++)
					{
						// Spawn Archer Cyborgs
						const pos = camRandPosInArea(SPAWN_AREA);
						groupAdd(NEW_GROUP, addDroid(CAM_BONZI_BUDDY, pos.x, pos.y, 
							_("Archer Cyborg"), "CyborgLightBody", "CyborgLegs", "", "", "Cyb-Wpn-Bow"
						));
					}
					// Add a Twin BB (if Normal+)
					if (difficulty >= MEDIUM)
					{
						const pos = camRandPosInArea(SPAWN_AREA);
						groupAdd(NEW_GROUP, addDroid(CAM_BONZI_BUDDY, pos.x, pos.y, 
							_("Bunker Buster II Viper II Half-wheels"), "Body5REC", "HalfTrack", "", "", "Rocket-BB2"
						));
					}
					camManageGroup(NEW_GROUP, CAM_ORDER_ATTACK);
				}
				else if (!camTransporterOnMap(CAM_BONZI_BUDDY))
				{
					// Send a transport with Many-Rocket Pods
					const pos = camGenerateRandomMapCoordinate(camMakePos("landingZone"), 5);
					const list = [];
					for (let i = 0; i < difficulty + 6; i++)
					{
						list.push(cTempl.crlpoddw);
					}
					camSendReinforcement(CAM_BONZI_BUDDY, pos, list, CAM_REINFORCE_TRANSPORT, {
						entry: camGenerateRandomMapEdgeCoordinate(),
						exit: camGenerateRandomMapEdgeCoordinate()
					});
				}
			}
			break;
		}
		case 10: // Spawn Twin BB/Sawed-Off Lancers and Sensors/Catapults
		{
			const NEW_GROUP = camNewGroup();
			const SPAWN_AREA = mis_spawnZones[camRand(mis_spawnZones.length)];
			if (supportIndex % 3 === 0)
			{
				// Spawn a Sensor + group of Catapults every third index
				
				for (let i = 0; i < 1 + difficulty; i++)
				{
					const pos = camRandPosInArea(SPAWN_AREA);
					groupAdd(NEW_GROUP, addDroid(CAM_BONZI_BUDDY, pos.x, pos.y, 
						_("Catapult Viper II Half-wheels"), "Body5REC", "HalfTrack", "", "", "Mortar1Mk1"
					));
				}
				// Also add a Sensor
				const pos = camRandPosInArea(SPAWN_AREA);
				groupAdd(NEW_GROUP, addDroid(CAM_BONZI_BUDDY, pos.x, pos.y, 
					_("Sensor Viper II Half-wheels"), "Body5REC", "HalfTrack", "", "", "SensorTurret1Mk1"
				));
			}
			else
			{
				// Spawn a group of Twin BBs and Sawed-Off Lancers
				for (let i = 1; i <= 4 + difficulty; i++)
				{
					const pos = camRandPosInArea(SPAWN_AREA);
					if (i % 4 === 0)
					{
						groupAdd(NEW_GROUP, addDroid(CAM_BONZI_BUDDY, pos.x, pos.y, 
							_("Bunker Buster II Viper II Drift Wheels"), "Body5REC", "wheeledskiddy", "", "", "Rocket-BB2"
						));
					}
					else
					{
						groupAdd(NEW_GROUP, addDroid(CAM_BONZI_BUDDY, pos.x, pos.y, 
							_("Sawed-Off Lancer Viper I Drift Wheels"), "Body1REC", "wheeledskiddy", "", "", "Rocket-LtA-T"
						));
					}
				}
			}
			camManageGroup(NEW_GROUP, CAM_ORDER_ATTACK);
			break;
		}
		case 12: // Spawn:
		{
			// Cool Cyborgs, MRP Half-wheels, and an Explosive Drum Transport
			// (Normal+) Also Bunker Buster Cyborgs
			// (Hard+) Also Pepperspray Half-wheels
			const NEW_GROUP = camNewGroup();
			const SPAWN_AREA = mis_spawnZones[camRand(mis_spawnZones.length)];
			if (supportIndex % 2 === 0)
			{
				// Spawn Cool Cyborgs
				for (let i = 0; i < difficulty + 2; i++)
				{
					const pos = camRandPosInArea(SPAWN_AREA);
					groupAdd(NEW_GROUP, addDroid(CAM_BONZI_BUDDY, pos.x, pos.y, 
						_("Cooler Machinegunner Cyborg"), "CyborgLightBody", "CyborgLegs", "", "", "NX-CyborgChaingun"
					));
				}
				// Spawn BB Cyborgs (if Normal+)
				if (difficulty >= MEDIUM)
				{
					for (let i = 0; i < difficulty - 1; i++)
					{
						const pos = camRandPosInArea(SPAWN_AREA);
						groupAdd(NEW_GROUP, addDroid(CAM_BONZI_BUDDY, pos.x, pos.y, 
							_("Bunker Buster Cyborg"), "CyborgLightBody", "CyborgLegs", "", "", "CyborgBB"
						));
					}
				}
			}
			else // Spawn Many-Rocket Pods and Peppersprays on odd indexes
			{
				// Spawn Many-Rocket Pods
				for (let i = 0; i < difficulty + 2; i++)
				{
					const pos = camRandPosInArea(SPAWN_AREA);
					groupAdd(NEW_GROUP, addDroid(CAM_BONZI_BUDDY, pos.x, pos.y, 
						_("Many-Rocket Pod Viper Half-wheels"), "Body1REC", "HalfTrack", "", "", "Rocket-Pod"
					));
				}
				// Spawn Peppersprays (if Hard+)
				if (difficulty >= HARD)
				{
					for (let i = 0; i < difficulty - 2; i++)
					{
						const pos = camRandPosInArea(SPAWN_AREA);
						groupAdd(NEW_GROUP, addDroid(CAM_BONZI_BUDDY, pos.x, pos.y, 
							_("Pepperspray Viper II Half-wheels"), "Body5REC", "HalfTrack", "", "", "Mortar3ROTARYMk1"
						));
					}
				}
			}
			camManageGroup(NEW_GROUP, CAM_ORDER_ATTACK);
			if (supportIndex % 4 === 0 && !camTransporterOnMap(CAM_BONZI_BUDDY))
			{
				// Send a transport every 4th index
				const pos = camGenerateRandomMapCoordinate(camMakePos("landingZone"), 5);
				const list = [cTempl.crltruckw, cTempl.crltruckw, cTempl.crltruckw, cTempl.crltruckw];
				camSendReinforcement(CAM_BONZI_BUDDY, pos, list,
					CAM_REINFORCE_TRANSPORT, {
					entry: camGenerateRandomMapEdgeCoordinate(),
					exit: camGenerateRandomMapEdgeCoordinate()
				});
			}
			break;
		}
		default:
			break;
	}
}

// Remove any features from spawn zones
function clearSpawnZones()
{
	for (let i = 0; i < mis_spawnZones.length; i++)
	{
		const features = enumArea(mis_spawnZones[i]).filter((obj) => (obj.type === FEATURE));
		for (let j = 0; j < features.length; j++)
		{
			camSafeRemoveObject(features[j], true);
		}
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
		addStructure("Emplacement-Rocket06-IDF", CAM_BONZI_BUDDY, x1*128, y1*128);

		let x2 = 93 - i;
		let y2 = 66 + i;
		addStructure("Emplacement-Rocket06-IDF", CAM_BONZI_BUDDY, x2*128, y2*128);
	}

	// Place lines at the NE and SW corners
	for (let i = 0; i < 8; i ++)
	{
		let x1 = 85 + i;
		let y1 = 3 + i;
		addStructure("Emplacement-Rocket06-IDF", CAM_BONZI_BUDDY, x1*128, y1*128);
		
		let x2 = 3 + i;
		let y2 = 66 + i;
		addStructure("Emplacement-Rocket06-IDF", CAM_BONZI_BUDDY, x2*128, y2*128);
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
		const mobList = enumDroid(CAM_MOBS)
		for (let i = 0; i < mobList.length; i++)
		{
			const unit = mobList[i];
			if (!camIsTransporter(unit)) camSafeRemoveObject(unit, false);
		}
		const bbList = enumDroid(CAM_BONZI_BUDDY)
		for (let i = 0; i < bbList.length; i++)
		{
			const unit = bbList[i];
			if (!camIsTransporter(unit)) camSafeRemoveObject(unit, false);
		}
	}
	else if (transport.player === CAM_BONZI_BUDDY)
	{
		// Replace all of the placeholder trucks with explosive drums
		const truckList = enumDroid(CAM_BONZI_BUDDY).filter((obj) => (
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

// Perform events based on the bear's current health
function checkFreddyHP()
{
	if (groupSize(coreGroup) > 0 && camDef(enumGroup(coreGroup)[0]))
	{
		// Freddy should be the only unit in this group
		const freddy = enumGroup(coreGroup)[0];
		if (freddy.health < 50 && difficulty >= HARD)
		{
			// Turn off the lights
			camCallOnce("arenaBlackOut");
		}
		if (freddy.health < 1)
		{
			// Fix weird bug where Freddy doesn't die :/
			camSafeRemoveObject(freddy, true);
		}
	}
}

// Cut the lights
function arenaBlackOut()
{
	camStartBlackOut();
	blackOut = true;
}

// Deal damage to any player object too close to the edge of the arena (marked by polished deepslate)
// Warning: Very bad code
function enforceArenaBoundry()
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

// Move the camera towards the giant sign and place a green beacon
function highlightBillboard()
{
	// Add the beacon by the sign
	hackAddMessage("C24_SIGN", PROX_MSG, CAM_HUMAN_PLAYER, false);
	// Slide the camera over
	cameraSlide(48 * 128, 11 * 128);
}

// Starts the pre-wave 1 setup phase
function delayedSetup()
{
	// Enable player reinforcements
	setReinforcementTime(10);

	// Set the mission timer to 59 seconds (~1 minute)
	const PREP_PHASE_DURATION = 59;
	setMissionTime(59);

	queue("beginWave", camSecondsToMilliseconds(PREP_PHASE_DURATION));
}

// Allows the player to finish the level
function allowVictory()
{
	winFlag = true;
}

// Allow the player to win once all 12 waves are completed
function victoryCheck()
{
	if (winFlag)
	{
		return true;
	}
	return undefined;
}

function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_SCRIPTED, "HOW_2_UNINSTALL",{
		callback: "victoryCheck"
	});

	const startpos = camMakePos(getObject("landingZone"));
	const lz = getObject("landingZone"); //player lz
	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(40, 50, CAM_HUMAN_PLAYER);
	setTransporterExit(60, 30, CAM_HUMAN_PLAYER);

	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_BONZI_BUDDY);

	setTimer("enforceArenaBoundry", camSecondsToMilliseconds(2));

	waveIndex = 0;
	coreIndex = 0;
	supportIndex = 0;
	doneSpawning = true;
	setupTime = false;
	winFlag = false;
	blackOut = false;

	// Create a persistent group to put core wave units into.
	// The wave will end when all of the units in this group die.
	coreGroup = camNewGroup();
	camManageGroup(coreGroup, CAM_ORDER_ATTACK, {removable: false});

	// Also put all the spectators into a group so they don't automatically get grouped up.
	spectatorGroup = camMakeGroup(enumDroid(MIS_SPECTATORS));

	camCompleteRequiredResearch(mis_bonziRes, CAM_BONZI_BUDDY);

	setAlliance(MIS_SPECTATORS, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_SPECTATORS, CAM_BONZI_BUDDY, true);
	setAlliance(MIS_SPECTATORS, CAM_MOBS, true);

	if (playerData[CAM_HUMAN_PLAYER].colour !== 8)
	{
		// Set spectators to yellow
		changePlayerColour(MIS_SPECTATORS, 8);
	}
	else
	{
		// Set spectators to orange
		changePlayerColour(MIS_SPECTATORS, 1);
	}

	// Add the wave billboard (and signs)
	camUpgradeOnMapFeatures("TreeSnow1", "SignArena");
	camUpgradeOnMapFeatures("Pylon", "Sign11");
	camUpgradeOnMapFeatures("Pipe1A", "Sign11Alt");

	// Make structures funny
	camUpgradeOnMapStructures("Sys-SensoTower01", "Spawner-Zombie", CAM_MOBS);
	camUpgradeOnMapStructures("Sys-SensoTower02", "Spawner-Skeleton", CAM_MOBS);
}
