//Contains the campaign transition technology definitions.

//This array should give a player all the research from Alpha.
const ALPHA_RESEARCH_NEW = [
	// 1
	"R-Wpn-MG1Mk1", "R-Vehicle-Body01", "R-Sys-Spade1Mk1", "R-Vehicle-Prop-Wheels",
	"R-Struc-ImmobileRepair", "R-Sys-Engineering01", "R-Wpn-MG-Damage01", "R-Defense-Tower01",
	"R-Defense-TankTrap01", "R-Struc-BlackBox",

	// 2
	"R-Wpn-MG2Mk1", "R-Wpn-MG-Damage02", "R-Sys-Sensor-Turret01", "R-Struc-PowerModuleMk1",
	"R-Sys-Sensor-Tower01", "R-Wpn-Flamer01Extended", "R-Vehicle-Prop-DriftWheels",

	// 3
	"R-Struc-ExplosiveDrum",

	// 4
	"R-Wpn-RailGun01", "R-Defense-HardcreteWall", "R-Defense-WallTowerMG", "R-Defense-PillboxBB",
	"R-Struc-Research-Module", "R-Wpn-Rocket03-HvAT", "R-Comp-SynapticLink", "R-Wpn-Flamer-Damage01",
	"R-Struc-Factory-Cyborg", "R-Cyborg-Wpn-MG", "R-Cyborg-Wpn-MGCool", "R-Defense-GuardTower-Rail1",
	"R-Defense-Tower04Extended", "R-Cyborg-Wpn-BB", "R-Sys-Sensor-Tower02", "R-Defense-HardcreteGate",

	// 5
	"R-Wpn-Mortar01Lt", "R-Defense-MortarPit", "R-Wpn-Rocket05-MiniPod",
	"R-Wpn-Cannon1Mk1", "R-Defense-Pillbox04", "R-Defense-WallTower02",
	"R-Vehicle-Metals01", "R-Cyborg-Metals01", "R-Cyborg-Wpn-Cannon", "R-Cyborg-Wpn-Flamer",
	"R-Wpn-ScorchShot", "R-Defense-TowerScorch",

	// 6

	// 7

	// 8

	// 9

	// 10

	// 11

	//12
];

//Basic base structures.
const STRUCTS_ALPHA = [
	"A0CommandCentre",
	"A0PowerGenerator",
	"A0ResourceExtractor",
	"A0ResearchFacility",
	"A0LightFactory",
];

//BETA 2-A bonus research
const PLAYER_RES_BETA = [];

//This array should give a player all the research from Beta.
const BETA_RESEARCH_NEW = [
	// 1
	"R-Cyborg-Wpn-Bow", "R-Cyborg-Wpn-Sword", "R-Sys-Engineering02",
	"R-Vehicle-Prop-Halftracks", "R-Wpn-Mortar-Damage01", "R-Wpn-Rocket01-LtAT-Def",
	"R-Wpn-Flamer-ROF01", "R-Defense-WallUpgrade01",

	// 2
	"R-Struc-Factory-Module", "R-Wpn-Rocket01-LtAT", "R-Wpn-Cannon-Damage01",
	"R-Wpn-MG3Mk1", "R-Wpn-RocketSlow-Damage01", "R-Struc-Factory-Upgrade01",
	"R-Struc-RprFac-Upgrade01", "R-Vehicle-Body05", "R-Wpn-RocketSlow-Damage01",
	"R-Defense-Pillbox06", "R-Defense-WallTower06",

	// 3
	"R-Vehicle-BodyDragon", "R-Wpn-Cannon2Mk1", "R-Wpn-MG-ROF01",
	"R-Vehicle-Prop-Tracks", "R-Wpn-Mortar02Hvy", "R-Wpn-Rocket06-IDF",
	"R-Defense-HvyMor", "R-Defense-IDFRocket",

	// 4
	"R-Vehicle-BodyTwin",

	// 5
	"R-Wpn-Rocket03-HvAT2", "R-Vehicle-Prop-VTOL", "R-Wpn-Mortar3",
	"R-Struc-VTOLFactory", "R-Struc-VTOLPad", "R-Defense-PillboxBB2",
	"R-Cyborg-Wpn-Rocket",

	// 6
	

	// 7
	

	// 8
	

	// 9
	

	// 10
	

	// 11
];

//This is used for giving allies in Gamma technology (3-b/3-2/3-c)
const GAMMA_ALLY_RES = ALPHA_RESEARCH_NEW.concat(PLAYER_RES_BETA).concat(BETA_RESEARCH_NEW);

const GAMMA_RESEARCH_NEW = [
	// 1
	"R-Wpn-Howitzer03-Rot", "R-Wpn-MG-Damage08", "R-Struc-Power-Upgrade02", "R-Sys-Engineering03",
	"R-Wpn-Cannon-Damage07", "R-Wpn-AAGun-Damage04", "R-Defense-WallUpgrade07", "R-Defense-WallUpgrade08",
	"R-Defense-WallUpgrade09", "R-Struc-Materials07", "R-Struc-Materials08", "R-Struc-Materials09",
	"R-Defense-RotHow", "R-Wpn-Howitzer-Damage04",

	// 2
	"R-Wpn-MG-Damage09", "R-Wpn-Cannon-Damage08", "R-Wpn-AAGun-Damage05", "R-Wpn-Howitzer-Damage05",

	// 3
	"R-Struc-Research-Upgrade07", "R-Wpn-Laser01", "R-Wpn-Mortar-Acc03", "R-Vehicle-Body03",
	"R-Wpn-Cannon-ROF04", "R-Struc-Research-Upgrade08", "R-Struc-Research-Upgrade09",
	"R-Cyborg-Wpn-Laser1", "R-Defense-PrisLas", "R-Defense-WallTower-PulseLas",
	"R-Wpn-Energy-Accuracy01", "R-Wpn-Bomb-Damage03", "R-Vehicle-Metals07",
	"R-Vehicle-Engine07", "R-Wpn-AAGun-ROF04", "R-Wpn-Mortar-ROF04", "R-Wpn-Energy-Damage01",
	"R-Wpn-Energy-Damage02", "R-Wpn-Energy-ROF01", "R-Cyborg-Metals07", "R-Vehicle-Armor-Heat04",
	"R-Wpn-Howitzer-ROF04", "R-Cyborg-Armor-Heat04", "R-Wpn-RocketSlow-ROF04",

	// 4
	"R-Wpn-Cannon-ROF05", "R-Wpn-Cannon-ROF06", "R-Wpn-Cannon-Damage09", "R-Wpn-AAGun-Damage06",
	"R-Wpn-Howitzer-Damage06", "R-Wpn-AAGun-ROF05", "R-Wpn-AAGun-ROF06", "R-Wpn-RocketSlow-ROF05",
	"R-Wpn-RocketSlow-ROF06",

	// 5
	"R-Sys-Resistance-Upgrade01", "R-Sys-Resistance-Upgrade02", "R-Sys-Resistance-Upgrade03",
	"R-Sys-Resistance-Upgrade04",

	// 6
	"R-Vehicle-Body07", "R-Wpn-RailGun01", "R-Struc-VTOLPad-Upgrade04", "R-Wpn-Missile-LtSAM",
	"R-Vehicle-Metals08", "R-Vehicle-Engine08", "R-Cyborg-Wpn-Rail1", "R-Defense-GuardTower-Rail1",
	"R-Wpn-Rail-Damage01", "R-Struc-VTOLPad-Upgrade05", "R-Struc-VTOLPad-Upgrade06", "R-Defense-SamSite1",
	"R-Wpn-Missile-Damage01", "R-Vehicle-Armor-Heat05", "R-Wpn-Rail-Accuracy01", "R-Wpn-Missile-Accuracy01",
	"R-Wpn-AAGun-Accuracy03", "R-Wpn-Howitzer-Accuracy03", "R-Wpn-Rail-ROF01", "R-Wpn-Missile2A-T",
	"R-Cyborg-Wpn-ATMiss", "R-Defense-GuardTower-ATMiss", "R-Defense-WallTower-A-Tmiss", "R-Wpn-Missile-Damage02",
	"R-Wpn-Missile-ROF01",

	// 7
	"R-Wpn-MdArtMissile", "R-Wpn-Laser02", "R-Wpn-RailGun02",
	"R-Wpn-Missile-HvSAM", "R-Defense-SamSite2", "R-Wpn-Missile-Accuracy02",
	"R-Defense-PulseLas", "R-Wpn-Energy-ROF02", "R-Wpn-Energy-Damage03", "R-Wpn-Energy-ROF03",
	"R-Defense-MdArtMissile", "R-Wpn-Missile-ROF02", "R-Defense-Rail2", "R-Defense-WallTower-Rail2",
	"R-Wpn-Rail-Damage02", "R-Wpn-Rail-ROF02",

	// 8
	"R-Sys-Resistance", "R-Comp-MissileCodes01", "R-Comp-MissileCodes02", "R-Comp-MissileCodes03",

	// 9
	"R-Wpn-RailGun03", "R-Vehicle-Body10", "R-Wpn-HvArtMissile",
	"R-Wpn-Rail-Damage03", "R-Defense-Rail3", "R-Defense-WallTower-Rail3", "R-Wpn-Rail-ROF03",
	"R-Vehicle-Metals09", "R-Vehicle-Engine09", "R-Defense-HvyArtMissile", "R-Wpn-Missile-Damage03",
	"R-Wpn-Missile-ROF03", "R-Cyborg-Metals09", "R-Vehicle-Armor-Heat06", "R-Cyborg-Armor-Heat06",

];

//...
