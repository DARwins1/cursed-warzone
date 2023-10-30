// the actual level script for Beta 2

include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

// this could be changed
const BONZI_RES = [
	"R-Wpn-MG-Damage02", "R-Vehicle-Metals01", "R-Cyborg-Metals01",
	"R-Defense-WallUpgrade01", "R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage01",
	"R-Wpn-Cannon-Damage01", "R-Wpn-MG-ROF01", "R-Defense-WallUpgrade01",
	"R-Struc-RprFac-Upgrade01",
];

// Sword Zone event
function eventDestroyed(obj)
{
	if (obj.type === FEATURE && obj.name === _("Sign 5")) // NOTE: Sign name will NOT be changed later
	{
		const numCyborgs = 20; // Set to however many cyborgs you want
		let cyborgGroup = camNewGroup(); // Create a new group to place the cyborgs into
		for (let i = 0; i < numCyborgs; i++)
		{
			let newCyborg = addDroid(MOBS, 6, 60, "Sword Cyborg", "CyborgLightBody", "CyborgLegs", "", "", "Cyb-Wpn-Sword");
			groupAdd(cyborgGroup, newCyborg); // Place the newly created cyborg into a group
		}
		camManageGroup(cyborgGroup, CAM_ORDER_ATTACK); // Tell the new group of cyborgs to attack the player
		
		// remove the door
		const doorList = enumFeature(ALL_PLAYERS, "GiantDoorHoriz");
		for (let i = 0; i < doorList.length; i++)
  		{
  			fireWeaponAtObj("VanishSFX", doorList[i]);
  			camSafeRemoveObject(doorList[i], true);
		}
	}
}

function activateTempleFactories()
{
	camEnableFactory("templeFactory");
}

function activateFarmFactories()
{
	camEnableFactory("farmFactory1");
	camEnableFactory("farmFactory2");
}

function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "BRING_AN_UMBRELLA", {
		area: "compromiseZone",
  		reinforcements: camMinutesToSeconds(2),
		eliminateBases: true
	});

	var startpos = camMakePos(getObject("landingZone"));
	var lz = getObject("landingZone"); //player lz
	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(31, 62, CAM_HUMAN_PLAYER);
	setTransporterExit(31, 62, CAM_HUMAN_PLAYER);

	// Make structures funny
	camUpgradeOnMapStructures("Sys-SensoTower01", "Spawner-Zombie", MOBS);
	camUpgradeOnMapStructures("Sys-SensoTower02", "Spawner-Skeleton", MOBS);
	camUpgradeOnMapStructures("Sys-NX-SensorTower", "Spawner-Creeper", MOBS);
	camUpgradeOnMapStructures("PillBox5", "PillBox-BB", BONZI_BUDDY);
	camUpgradeOnMapStructures("A0RepairCentre3", "A0RepairCentre1", BONZI_BUDDY);
	//fix wacky walls
	camUpgradeOnMapStructures("A0HardcreteMk1Wall", "A0HardcreteMk1Wall", BONZI_BUDDY);

	// Add a funny sign and the giant door for the Sword area
	// NOTE: this sign is a placeholder
	camUpgradeOnMapFeatures("Pylon", "Sign5");
	camUpgradeOnMapFeatures("TreeSnow2", "GiantDoorHoriz");
	
	camSetArtifacts({
		"templeFactory": { tech: "R-Struc-Factory-Module" }, // Factory Module
		"shotgun": { tech: "R-Wpn-Rocket01-LtAT" }, // Sawed-Off Lancer
		"castleFactory1": { tech: "R-Wpn-Cannon-Damage01" }, // Brighter Cannons
	});

	camCompleteRequiredResearch(BONZI_RES, BONZI_BUDDY);
	
	camSetEnemyBases({
		"bbLeftBase": {
			cleanup: "baseTemple",
			detectMsg: "C22_BASE1",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"bbCenterBase": {
			cleanup: "baseCastle",
			detectMsg: "C22_BASE2",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
		"bbRightBase": {
			cleanup: "baseFarm",
			detectMsg: "C22_BASE3",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg",
		},
	});

	camSetFactories({
		"templeFactory": {
			assembly: "tankAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			data: {
				regroup: false,
				repair: 20,
				count: -1,
			},
			templates: [ cTempl.crmmcant, cTempl.crmhmgt, cTempl.crmbb2t, cTempl.crmmcant ] // Thick-wheeled units
		},
		"castleFactory1": {
			assembly: "tankAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			data: {
				regroup: false,
				repair: 60,
				count: -1,
			},
			templates: [ cTempl.crlmortw, cTempl.crlsensdw, cTempl.crlmortw, cTempl.crlslancedw, cTempl.crlhmgdw, cTempl.crlslancedw, cTempl.crmbb2dw ] // Drift Wheel harassers
		},
		"castleFactory2": {
			assembly: "tankAssembly3",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			data: {
				regroup: true,
				repair: 40,
				count: -1,
			},
			templates: [ cTempl.crlhmght, cTempl.crmbb2ht, cTempl.crlcanht ]
		},
		"farmFactory1": {
			assembly: "cybAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(30)),
			data: {
				regroup: false,
				repair: 40,
				count: -1,
			},
			templates: [ cTempl.crcybbb, cTempl.crcybsword, cTempl.crcybbow ]
		},
		"farmFactory2": {
			assembly: "cybAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 7,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(30)),
			data: {
				regroup: true,
				repair: 40,
				count: -1,
			},
			templates: [ cTempl.crcybmg, cTempl.crcybcool, cTempl.crcybcan, cTempl.crcybmg ]
		},
	});


	// enable the Castle
	camEnableFactory("castleFactory1");
	camEnableFactory("castleFactory2");

	// set up timers for other bases
	queue("activateTempleFactories", camChangeOnDiff(camMinutesToMilliseconds(2)));
	queue("activateFarmFactories", camChangeOnDiff(camMinutesToMilliseconds(1.5)));

}