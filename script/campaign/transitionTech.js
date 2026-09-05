//Contains the campaign transition technology definitions.

//Basic base structures.
const mis_structsAlpha = [
	"A0CommandCentre",
	"A0PowerGenerator",
	"A0ResourceExtractor",
	"A0ResearchFacility",
	"A0LightFactory",
];

//This array should give a player all the research from Alpha.
const mis_alphaResearchNew = [
	// 1
	"R-Wpn-MG1Mk1", "R-Vehicle-Body01", "R-Sys-Spade1Mk1", "R-Vehicle-Prop-Wheels", // Starting tech
	"R-Sys-Engineering01", // Artifact
	"R-Struc-ImmobileRepair", "R-Defense-TankTrap01",
	"R-Wpn-MG-Damage01", // Artifact
	"R-Defense-Tower01", // Artifact

	// 2
	"R-Wpn-MG2Mk1", // Artifact
	"R-Wpn-MG-Damage02",
	"R-Sys-Sensor-Turret01", // Artifact
	"R-Sys-Sensor-Tower01",
	"R-Struc-PowerModuleMk1", // Artifact
	"R-Wpn-Flamer01Extended", // Spamton
	"R-Vehicle-Prop-DriftWheels", // Spamton

	// 3
	"R-Struc-ExplosiveDrum", // Artifact

	// 4
	"R-Wpn-RailGun01", // Spamton
	"R-Defense-HardcreteWall", // Artifact
	"R-Defense-WallTowerMG", "R-Defense-PillboxBB", "R-Defense-GuardTower-Rail1",
	"R-Defense-Tower04Extended", "R-Sys-Sensor-Tower02", "R-Defense-HardcreteGate",
	"R-Defense-Pillbox04", "R-Defense-WallTower02",
	"R-Struc-Research-Module", // Artifact
	"R-Wpn-Flamer-Damage01",
	"R-Wpn-Rocket03-HvAT", // Artifact
	"R-Comp-SynapticLink", // Artifact
	"R-Struc-Factory-Cyborg", "R-Cyborg-Wpn-MG", "R-Cyborg-Wpn-BB",
	"R-Cyborg-Wpn-Cannon",
	"R-Cyborg-Wpn-MGCool", // Artifact
	"R-Wpn-Cannon1Mk1", // Artifact

	// 5
	"R-Wpn-Rocket05-MiniPod", // Spamton
	"R-Wpn-Cannon-Damage01", // Artifact
	"R-Wpn-Mortar01Lt", // Artifact
	"R-Defense-MortarPit",
	"R-Vehicle-Metals01", // Artifact
	"R-Cyborg-Metals01", 
	"R-Wpn-ScorchShot", // Artifact
	"R-Cyborg-Wpn-Flamer", "R-Defense-TowerScorch",
];

//This array should give a player all the research from Beta.
const mis_betaResearchNew = [
	// 1
	"R-Wpn-Rocket01-LtAT-Def", // Spamton
	"R-Wpn-MG3Mk1", // Spamton
	"R-Cyborg-Wpn-Bow", // Artifact
	"R-Cyborg-Wpn-Sword", // Artifact
	"R-Sys-Engineering02", // Artifact
	"R-Wpn-Flamer-ROF01", "R-Defense-WallUpgrade01",
	"R-Vehicle-Prop-Halftracks", // Artifact
	"R-Wpn-Mortar-Damage01", // Artifact
	"R-Wpn-Rocket01-LtAT", // Artifact
	"R-Wpn-RocketSlow-Damage01", "R-Defense-Pillbox06", "R-Defense-WallTower06",

	// 2
	"R-Struc-Factory-Module", // Artifact
	"R-Struc-Factory-Upgrade01", "R-Struc-RprFac-Upgrade01", "R-Vehicle-Body05",
	"R-Wpn-Rocket01-LtATPile1", // Artifact

	// 3
	"R-Vehicle-BodyDragon", // Spamton
	"R-Wpn-Cannon2Mk1", // Spamton
	"R-Wpn-MG-ROF01", // Artifact
	"R-Vehicle-Prop-Tracks", // Artifact
	"R-Wpn-Mortar02Hvy", // Artifact
	"R-Defense-HvyMor",
	"R-Wpn-Rocket06-IDF", // Artifact
	"R-Defense-IDFRocket",
	"R-Wpn-Rocket01-LtATPile2", // Artifact

	// 4
	"R-Vehicle-BodyTwin", // Spamton

	// 5
	"R-Defense-SamSite2", // Spamton
	"R-Wpn-Rocket03-HvAT2", // Artifact
	"R-Defense-PillboxBB2",
	"R-Vehicle-Prop-VTOL", // Artifact
	"R-Struc-VTOLFactory", "R-Struc-VTOLPad",
	"R-Wpn-Mortar3", // Artifact
	"R-Cyborg-Wpn-Rocket", // Artifact
	"R-Wpn-Rocket01-LtATPile3", // Artifact
];

// This array contains all the research from Gamma. (for documentation only)
const mis_gammaResearchNew = [
	// 1
	"R-Cyborg-Wpn-MGSpy", // Artifact
	"R-Wpn-Missile-LtSAM", // Artifact
	"R-Defense-SamSite1",
	"R-Wpn-Bomb01", // Artifact
	"R-Vehicle-Body11", // Artifact
	"R-Vehicle-Metals02", "R-Cyborg-Metals02",

	// 2
	"R-Wpn-Cannon3Mk1", // Artifact
	"R-Defense-WallTower04",

	// 3
	"R-Sys-Engineering03", // Artifact
	"R-Defense-WallUpgrade02", "R-Struc-Landmine", "R-Struc-ImmobileHeavyRepair",
	"R-Struc-VTOLPad-Upgrade01",
	"R-Wpn-CannonBison", // Artifact
	"R-Cyborg-Wpn-Bison", "R-Defense-BisonEmp", "R-Defense-PillboxBison",
	"R-Defense-TowerBison", "R-Defense-WallTowerBison",
	"R-Wpn-Rocket03-HvAT3", // Artifact
	"R-Defense-PillboxBB3",

	// 4
	"R-Wpn-Flame2", // Artifact
	"R-Cyborg-Hvywpn-HFlamer", "R-Wpn-Flamer-Damage02", "R-Defense-HvyFlamer",
	"R-Wpn-Rocket02-MRL", // Artifact
	"R-Defense-MRL",
	"R-Wpn-Rocket-ROF01", // Artifact
	"R-Wpn-Rocket-IDF-ROF01", 
	"R-Vehicle-BodyTriple", // Artifact

	// 5
	// Nothin'
];

//...
