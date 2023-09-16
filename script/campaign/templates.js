var cTempl = {
////////////////////////////////////////////////////////////////////////////////

// Cursed Vehicles
// Wheels
crlsens: { body: "Body1REC", prop: "wheeled01", weap: "SensorTurret1Mk1" }, // Sensor Viper Wheels
crltruckw: { body: "Body1REC", prop: "wheeled01", weap: "Spade1Mk1" }, // Truck Viper Wheels
crbigmg: { body: "Body1BIG", prop: "wheeled01", weap: "MG3Mk2" }, // Big Machinegun Viper Wheels
crminimg: { body: "Body1Mini", prop: "wheeled01", weap: "MGMini" }, // Mini Machinegun Viper Wheels
crlmgw: { body: "Body1REC", prop: "wheeled01", weap: "MG1Mk1" }, // Machinegun Viper Wheels
crtmgw: { body: "Body1REC", prop: "wheeled01", weap: "MG2Mk1" }, // Twin nugenihcaM Viper Wheels
crlscorchw: { body: "Body1REC", prop: "wheeled01", weap: "BabaFlame" }, // Scorch Shot Viper Wheels
crlcanw: { body: "Body1REC", prop: "wheeled01", weap: "Cannon1Mk1" }, // "Light" Cannon Viper Wheels
crlbbw: { body: "Body1REC", prop: "wheeled01", weap: "Rocket-BB" }, // Bunker Buster Viper Wheels
crlpodw: { body: "Body1REC", prop: "wheeled01", weap: "Rocket-Pod" }, // Many-Rocket Pod Viper Wheels
crlmortw: { body: "Body1REC", prop: "wheeled01", weap: "Mortar1Mk1" }, // Catapult Viper Wheels
crlslancew: { body: "Body1REC", prop: "wheeled01", weap: "Rocket-LtA-T" }, // Sawed-Off Lancer Viper Wheels

// Drift Wheels
crlsensdw: { body: "Body1REC", prop: "wheeledskiddy", weap: "SensorTurret1Mk1" }, // Sensor Viper Drift Wheels
crlmgdw: { body: "Body1REC", prop: "wheeledskiddy", weap: "MG1Mk1" }, // Machinegun Viper Drift Wheels
crlscorchdw: { body: "Body1REC", prop: "wheeledskiddy", weap: "BabaFlame" }, // Scorch Shot Viper Drift Wheels
crlcandw: { body: "Body1REC", prop: "wheeledskiddy", weap: "Cannon1Mk1" }, // "Light" Cannon Viper Drift Wheels
crlbbdw: { body: "Body1REC", prop: "wheeledskiddy", weap: "Rocket-BB" }, // Bunker Buster Viper Drift Wheels
crlpoddw: { body: "Body1REC", prop: "wheeledskiddy", weap: "Rocket-Pod" }, // Many-Rocket Pod Viper Drift Wheels
crlhmgdw: { body: "Body1REC", prop: "wheeledskiddy", weap: "MG3Mk1" }, // Realistic Heavy Machinegun Viper Drift Wheels
crlslancedw: { body: "Body1REC", prop: "wheeledskiddy", weap: "Rocket-LtA-T" }, // Sawed-Off Lancer Viper Drift Wheels
crmbb2dw: { body: "Body5REC", prop: "wheeledskiddy", weap: "Rocket-BB2" }, // Bunker Buster II Viper II Drift Wheels
crmhmgdw: { body: "Body5REC", prop: "wheeledskiddy", weap: "MG3Mk1" }, // Realistic Heavy Machinegun Viper II Drift Wheels
crmslancedw: { body: "Body5REC", prop: "wheeledskiddy", weap: "Rocket-LtA-T" }, // Sawed-Off Lancer Viper II Drift Wheels

// Half-wheels (Half-tracks)
crlsensht: { body: "Body1REC", prop: "HalfTrack", weap: "SensorTurret1Mk1" }, // Sensor Viper Half-wheels
crlmght: { body: "Body1REC", prop: "HalfTrack", weap: "MG1Mk1" }, // Machinegun Viper Half-wheels
crlscorchht: { body: "Body1REC", prop: "HalfTrack", weap: "BabaFlame" }, // Scorch Shot Viper Half-wheels
crlcanht: { body: "Body1REC", prop: "HalfTrack", weap: "Cannon1Mk1" }, // "Light" Cannon Viper Half-wheels
crlbbht: { body: "Body1REC", prop: "HalfTrack", weap: "Rocket-BB" }, // Bunker Buster Viper Half-wheels
crlpodht: { body: "Body1REC", prop: "HalfTrack", weap: "Rocket-Pod" }, // Many-Rocket Pod Viper Half-wheels
crlmrlht: { body: "Body1REC", prop: "HalfTrack", weap: "Rocket-MRL" }, // Mono-Rocket Array Viper Half-wheels
crlhmght: { body: "Body1REC", prop: "HalfTrack", weap: "MG3Mk1" }, // Realistic Heavy Machinegun Viper Half-wheels
crlslanceht: { body: "Body1REC", prop: "HalfTrack", weap: "Rocket-LtA-T" }, // Sawed-Off Lancer Viper Half-wheels
crmsensht: { body: "Body5REC", prop: "HalfTrack", weap: "SensorTurret1Mk1" }, // Sensor Viper II Half-wheels
crmpillarht: { body: "Body5REC", prop: "HalfTrack", weap: "Rocket-LtA-TPillar" }, // Towering Pillar Of Lancers Viper II Half-wheels
crmmortht: { body: "Body5REC", prop: "HalfTrack", weap: "Mortar1Mk1" }, // Catapult Viper II Half-wheels
crmbb2ht: { body: "Body5REC", prop: "HalfTrack", weap: "Rocket-BB2" }, // Bunker Buster II Viper II Half-wheels
crmpepht: { body: "Body5REC", prop: "HalfTrack", weap: "Mortar3ROTARYMk1" }, // Pepperspray Viper II Half-wheels
crmhmght: { body: "Body5REC", prop: "HalfTrack", weap: "MG3Mk1" }, // Realistic Heavy Machinegun Viper II Half-wheels
crmtruckht: { body: "Body5REC", prop: "HalfTrack", weap: "Spade1Mk1" }, // Truck Viper II Half-wheels
crtwinhmgcanht: { body: "Body1RECTwin", prop: "HalfTrack", weap: ["MG3Mk1", "Cannon1Mk1"] }, // Realistic Heavy Machinegun Hydra Twin Viper Half-wheels
crtwinscorchpodht: { body: "Body1RECTwin", prop: "HalfTrack", weap: ["BabaFlame", "Rocket-Pod"] }, // Scorch Shot Hydra Twin Viper Half-wheels

// Thick Wheels (Tracks)
crmsenst: { body: "Body5REC", prop: "tracked01", weap: "SensorTurret1Mk1" }, // Sensor Viper II Thick Wheels
crmbb2t: { body: "Body5REC", prop: "tracked01", weap: "Rocket-BB2" }, // Bunker Buster II Viper II Thick Wheels
crmhmgt: { body: "Body5REC", prop: "tracked01", weap: "MG3Mk1" }, // Realistic Heavy Machinegun Viper II Thick Wheels
crmmcant: { body: "Body5REC", prop: "tracked01", weap: "Cannon2A-TMk1" }, // Fungible Cannon Viper II Thick Wheels
crhbbat: { body: "Body11ABT", prop: "tracked01", weap: "Rocket-BB-IDF" }, // Bunker Buster Array Viper III Thick Wheels

// Normal Wheels (basically VTOLs)
crlmgnw: { body: "Body1REC", prop: "wheelednormal", weap: "MG1-VTOL" }, // Machinegun Viper Normal Wheels
crlhmgnw: { body: "Body1REC", prop: "wheelednormal", weap: "MG3-VTOL" }, // Realistic Heavy Machinegun Viper Normal Wheels
crllcannw: { body: "Body1REC", prop: "wheelednormal", weap: "Cannon1-VTOL" }, // "Light" Cannon Viper Normal Wheels
crlpodnw: { body: "Body1REC", prop: "wheelednormal", weap: "Rocket-VTOL-Pod" }, // Many-Rocket Pod Viper Normal Wheels
crmbb2nw: { body: "Body5REC", prop: "wheelednormal", weap: "Rocket-VTOL-BB2" }, // Bunker Buster II Viper II Normal Wheels
crmhmgnw: { body: "Body5REC", prop: "wheelednormal", weap: "MG3-VTOL" }, // Realistic Heavy Machinegun Viper II Normal Wheels

// Cursed Cyborgs/Infantry
crcybmg: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgChaingun" }, // Machinegunner Cyborg
crcybcool: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "NX-CyborgChaingun" }, // Cooler Machinegunner Cyborg
crcybbb: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgBB" }, // Bunker Buster Cyborg
crcybsword: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "Cyb-Wpn-Sword" }, // Sword Cyborg
crcybbow: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "Cyb-Wpn-Bow" }, // Archer Cyborg
crcybbison: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgBison" }, // Bison Cyborg
crcybpyro: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgFlamer01" }, // Pyro Cyborg
crcybpod: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgMiniRocket" }, // Many-Rocket Cyborg
crcybcan: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgCannon" }, // "Light" Gunner Cyborg
crcybneedle: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "Cyb-Wpn-Rail1" }, // Needler Cyborg
crcybspy: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgSpyChaingun" }, // Spy Cyborg
creeper: { body: "CreeperBody", prop: "CyborgLegs", weap: "Cyb-Wpn-CreeperDud" }, // Creeper
zombie: { body: "ZombieBody", prop: "CyborgLegs", weap: "Cyb-Wpn-ZmbieMelee" }, // Zombie
babyzombie: { body: "BabyZombieBody", prop: "CyborgLegs", weap: "Cyb-Wpn-BabyZmbieMelee" }, // Baby Zombie
skeleton: { body: "SkeletonBody", prop: "CyborgLegs", weap: "Cyb-Wpn-SkelBow" }, // Skeleton
enderman: { body: "EndermanBody", prop: "CyborgLegs", weap: "Cyb-Wpn-EnderMelee" }, // Enderman
silverfish: { body: "SilverfishBody", prop: "CyborgLegs", weap: "Cyb-Wpn-SilvFishMelee" }, // Silverfish
crscybcan: { body: "CyborgUltraHeavyBody", prop: "CyborgLegs", weap: "Cyb-Hvywpn-Hcannon" }, // Ultra Heavy-Gunner Cyborg

// Spamton Vehicles
// Wheels
spbigmg: { body: "Body1BIGSpam", prop: "wheeled01", weap: "MG3Mk2" }, // Big Machinegun Spamaconda Wheels
spminimg: { body: "Body1MiniSpam", prop: "wheeled01", weap: "MGMini" }, // Mini Machinegun Spamaconda Wheels
splmgw: { body: "Body1RECSpam", prop: "wheeled01", weap: "MG1Mk1" }, // Machinegun Spamaconda Wheels
splneedlew: { body: "Body1RECSpam", prop: "wheeled01", weap: "RailGun1Mk1" }, // Needler Spamaconda Wheels
splcanw: { body: "Body1RECSpam", prop: "wheeled01", weap: "Cannon1Mk1" }, // "Light" Cannon Spamaconda Wheels
splbisonw: { body: "Body1RECSpam", prop: "wheeled01", weap: "CannonBison" }, // Righteous Bison Spamaconda Wheels
sptwin2mgw: { body: "Body1RECTwinSpam", prop: "wheeled01", weap: ["MG1Mk1", "MG1Mk1"] }, // Machinegun Hydra Twin Spamaconda Wheels
sphmonow: { body: "Body11ABTSpam", prop: "wheeled01", weap: "Rocket-MRL" }, // Mono-Rocket Array Spamaconda III Wheels

// Drift Wheels
splmgdw: { body: "Body1RECSpam", prop: "wheeledskiddy", weap: "MG1Mk1" }, // Machinegun Spamaconda Drift Wheels
spleflamdw: { body: "Body1RECSpam", prop: "wheeledskiddy", weap: "Flame1Mk2" }, // Extended Flamer Spamaconda Drift Wheels
splcandw: { body: "Body1RECSpam", prop: "wheeledskiddy", weap: "Cannon1Mk1" }, // "Light" Cannon Spamaconda Drift Wheels
splpoddw: { body: "Body1RECSpam", prop: "wheeledskiddy", weap: "Rocket-Pod" }, // Many-Rocket Pod Spamaconda Drift Wheels
spmhmgdw: { body: "Body5RECSpam", prop: "wheeledskiddy", weap: "MG3Mk1" }, // Realistic Heavy Machinegun Spamaconda II Drift Wheels
spmbisondw: { body: "Body5RECSpam", prop: "wheeledskiddy", weap: "CannonBison" }, // Righteous Bison Spamaconda II Drift Wheels
sptwin2eflamdw: { body: "Body1RECTwinSpam", prop: "wheeledskiddy", weap: ["Flame1Mk2", "Flame1Mk2"] }, // Extended Flamer Hydra Twin Spamaconda Drift Wheels
sptwin2hmgdw: { body: "Body1RECTwinSpam", prop: "wheeledskiddy", weap: ["MG3Mk1", "MG3Mk1"] }, // Realistic Heavy Machinegun Hydra Twin Spamaconda Drift Wheels
sptwinlcanhmgdw: { body: "Body1RECTwinSpam", prop: "wheeledskiddy", weap: ["Cannon1Mk1", "MG3Mk1"] }, // "Light" Cannon Hydra Twin Spamaconda Drift Wheels
sptwin2lmgdw: { body: "Body1RECTwinSpam", prop: "wheeledskiddy", weap: ["MG1Mk1", "MG1Mk1"] }, // Machinegun Hydra Twin Spamaconda Drift Wheels
sphmcandw: { body: "Body11ABTSpam", prop: "wheeledskiddy", weap: "Cannon2A-TMk1" }, // Fungible Cannon Spamaconda III Drift Wheels
sptriplcan2hmgdw: { body: "Body1RECTripleSpam", prop: "wheeledskiddy", weap: ["Cannon1Mk1", "MG3Mk1", "MG3Mk1"] }, // "Light" Cannon Hydra Triple Spamaconda Drift Wheels

// Half-wheels (Half-tracks)
spleflamht: { body: "Body1RECSpam", prop: "HalfTrack", weap: "Flame1Mk2" }, // Extended Flamer Spamaconda Half-wheels
splneedleht: { body: "Body1RECSpam", prop: "HalfTrack", weap: "RailGun1Mk1" }, // Needler Spamaconda Half-wheels
splpodht: { body: "Body1RECSpam", prop: "HalfTrack", weap: "Rocket-Pod" }, // Many-Rocket Pod Spamaconda Half-wheels
splbisonht: { body: "Body1RECSpam", prop: "HalfTrack", weap: "CannonBison" }, // Righteous Bison Spamaconda Half-wheels
spmlcanht: { body: "Body5RECSpam", prop: "HalfTrack", weap: "Cannon1Mk1" }, // "Light" Cannon Spamaconda II Half-wheels
spmpodht: { body: "Body5RECSpam", prop: "HalfTrack", weap: "Rocket-Pod" }, // Many-Rocket Pod Spamaconda II Half-wheels
spmbisonht: { body: "Body5RECSpam", prop: "HalfTrack", weap: "CannonBison" }, // Righteous Bison Spamaconda II Half-wheels
sptwinneedlereflamht: { body: "Body1RECTwinSpam", prop: "HalfTrack", weap: ["RailGun1Mk1", "Flame1Mk2"] }, // Needler Hydra Twin Spamaconda Half-wheels
sptwin2bisonht: { body: "Body1RECTwinSpam", prop: "HalfTrack", weap: ["CannonBison", "CannonBison"] }, // Righteous Bison Hydra Twin Spamaconda Half-wheels
sptwinlcanhmght: { body: "Body1RECTwinSpam", prop: "HalfTrack", weap: ["Cannon1Mk1", "MG3Mk1"] }, // "Light" Cannon Hydra Twin Spamaconda Half-wheels
sptwin2eflamht: { body: "Body1RECTwinSpam", prop: "HalfTrack", weap: ["Flame1Mk2", "Flame1Mk2"] }, // Extended Flamer Hydra Twin Spamaconda Half-wheels
sptwin2podht: { body: "Body1RECTwinSpam", prop: "HalfTrack", weap: ["Rocket-Pod", "Rocket-Pod"] }, // Many-Rocket Pod Hydra Twin Spamaconda Half-wheels
sphhflamht: { body: "Body11ABTSpam", prop: "HalfTrack", weap: "Flame2" }, // Excessive Flamer Spamaconda III Half-wheels
sphhbb3ht: { body: "Body11ABTSpam", prop: "HalfTrack", weap: "Rocket-BB3" }, // Bunker Buster III Spamaconda III Half-wheels
sphmcanht: { body: "Body11ABTSpam", prop: "HalfTrack", weap: "Cannon2A-TMk1" }, // Fungible Cannon Spamaconda III Half-wheels
sphlinkht: { body: "Body11ABTSpam", prop: "HalfTrack", weap: "NEXUSlink" }, // Spamton Link Turret Spamaconda III Half-wheels
sphmonoht: { body: "Body11ABTSpam", prop: "HalfTrack", weap: "Rocket-MRL" }, // Mono-Rocket Array Spamaconda III Half-wheels
sptrip3bisonht: { body: "Body1RECTripleSpam", prop: "HalfTrack", weap: ["CannonBison", "CannonBison", "CannonBison"] }, // Righteous Bison Hydra Triple Spamaconda Half-wheels
sptrip3eflamht: { body: "Body1RECTripleSpam", prop: "HalfTrack", weap: ["Flame1Mk2", "Flame1Mk2", "Flame1Mk2"] }, // Extended Flamer Hydra Triple Spamaconda Half-wheels

// Thick Wheels (Tracks)
sphmcant: { body: "Body11ABTSpam", prop: "tracked01", weap: "Cannon2A-TMk1" }, // Fungible Cannon Spamaconda III Thick Wheels
sphhflamt: { body: "Body11ABTSpam", prop: "tracked01", weap: "Flame2" }, // Excessive Flamer Spamaconda III Thick Wheels
sphhcant: { body: "Body11ABTSpam", prop: "tracked01", weap: "Cannon375mmMk1" }, // Very Heavy Cannon Spamaconda III Thick Wheels

// Normal Wheels (basically VTOLs)
spminimgnw: { body: "Body1MiniSpam", prop: "wheelednormal", weap: "MGMini-VTOL" }, // Mini Machinegun Spamaconda Normal Wheels
splmgnw: { body: "Body1RECSpam", prop: "wheelednormal", weap: "MG1-VTOL" }, // Machinegun Spamaconda Normal Wheels
splneedlenw: { body: "Body1RECSpam", prop: "wheelednormal", weap: "RailGun1-VTOL" }, // Needler Spamaconda Normal Wheels
splhmgnw: { body: "Body1RECSpam", prop: "wheelednormal", weap: "MG3-VTOL" }, // Realistic Heavy Machinegun Spamaconda Normal Wheels
splbisonnw: { body: "Body1RECSpam", prop: "wheelednormal", weap: "CannonBison-VTOL" }, // Righteous Bison Spamaconda Normal Wheels
splcannw: { body: "Body1RECSpam", prop: "wheelednormal", weap: "Cannon1-VTOL" }, // Righteous Bison Spamaconda Normal Wheels
spmanvilnw: { body: "Body5RECSpam", prop: "wheelednormal", weap: "Bomb-VTOL-Anvil" }, // Anvil Spamaconda II Normal Wheels
spmhmgnw: { body: "Body5RECSpam", prop: "wheelednormal", weap: "MG3-VTOL" }, // Realistic Heavy Machinegun Spamaconda II Normal Wheels
sptwin2lcannw: { body: "Body1RECTwinSpam", prop: "wheelednormal", weap: ["Cannon1-VTOL", "Cannon1-VTOL"] }, // "Light" Cannon Hydra Twin Spamaconda Normal Wheels
sptwin2podnw: { body: "Body1RECTwinSpam", prop: "wheelednormal", weap: ["Rocket-VTOL-Pod", "Rocket-VTOL-Pod"] }, // Many-Rocket Pod Hydra Twin Spamaconda Normal Wheels

// Spamton Cyborgs/Infantry
spcybmg: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgChaingunSpam" }, // Spamton Machinegunner Cyborg
spcybbb: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgBBSpam" }, // Spamton Bunker Buster Cyborg
spcybbison: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgBisonSpam" }, // Spamton Bison Cyborg
spcybpyro: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgFlamer01Spam" }, // Spamton Pyro Cyborg
spcybpod: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgMiniRocketSpam" }, // Spamton Many-Rocket Cyborg
spcybcan: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgCannonSpam" }, // Spamton "Light" Gunner Cyborg
spcybneedle: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "Cyb-Wpn-Rail1Spam" }, // Spamton Needler Cyborg
spcybspy: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgSpyChaingunSpam" }, // Spamton Spy Cyborg
spscybflame: { body: "CyborgHeavyBody", prop: "CyborgLegs", weap: "Cyb-Hvywpn-HFlamerSpam" }, // Spamton Super Flamer Cyborg
spamcreeper: { body: "CreeperBodySpam", prop: "CyborgLegs", weap: "Cyb-Wpn-CreeperDudSpam" }, // Spamton Creeper
spamzombie: { body: "ZombieBodySpam", prop: "CyborgLegs", weap: "Cyb-Wpn-ZmbieMeleeSpam" }, // Spamton Zombie
spambabyzombie: { body: "BabyZombieBodySpam", prop: "CyborgLegs", weap: "Cyb-Wpn-BabyZmbieMeleeSpam" }, // Spamton Baby Zombie
spamskeleton: { body: "SkeletonBodySpam", prop: "CyborgLegs", weap: "Cyb-Wpn-SkelBowSpam" }, // Spamton Skeleton
spamenderman: { body: "EndermanBodySpam", prop: "CyborgLegs", weap: "Cyb-Wpn-EnderMeleeSpam" }, // Spamton Enderman

// Nextbots
crnextbot1: { body: "NextbotBody1", prop: "hover01", weap: "Cyb-Wpn-SilvFishMelee" }, // Nextbot (Sans)
crnextbot2: { body: "NextbotBody2", prop: "hover01", weap: "Cyb-Wpn-SilvFishMelee" }, // Nextbot (Amogus)
crnextbot3: { body: "NextbotBody3", prop: "hover01", weap: "Cyb-Wpn-SilvFishMelee" }, // Nextbot (Trollface)

// Normal Campaign Templates
// CAM_1A
bloke: { body: "B1BaBaPerson01", prop: "BaBaLegs", weap: "BabaMG" },
trike: { body: "B4body-sml-trike01", prop: "BaBaProp", weap: "BabaTrikeMG" },
buggy: { body: "B3body-sml-buggy01", prop: "BaBaProp", weap: "BabaBuggyMG" },
bjeep: { body: "B2JeepBody", prop: "BaBaProp", weap: "BabaJeepMG" },

// CAM_1B
bloketwin: { body: "B1BaBaPerson01", prop: "BaBaLegs", weap: "BabaMG" },
triketwin: { body: "B4body-sml-trike01", prop: "BaBaProp", weap: "BabaTrikeMG" },
buggytwin: { body: "B3body-sml-buggy01", prop: "BaBaProp", weap: "BabaBuggyMG" },
bjeeptwin: { body: "B2JeepBody", prop: "BaBaProp", weap: "BabaJeepMG" },

// SUB_1_1
blokeheavy: { body: "B1BaBaPerson01", prop: "BaBaLegs", weap: "BabaMG" },
trikeheavy: { body: "B4body-sml-trike01", prop: "BaBaProp", weap: "BabaTrikeMG" },
buggyheavy: { body: "B3body-sml-buggy01", prop: "BaBaProp", weap: "BabaBuggyMG" },
bjeepheavy: { body: "B2JeepBody", prop: "BaBaProp", weap: "BabaJeepMG" },

// SUB_1_2

// SUB_1_3
rbjeep8: { body: "B2RKJeepBody", prop: "BaBaProp", weap: "BabaRocket" },
rbjeep: { body: "B2RKJeepBody", prop: "BaBaProp", weap: "BabaRocket" },
rbuggy: { body: "B3bodyRKbuggy01", prop: "BaBaProp", weap: "BabaRocket" },
nppod: { body: "Body4ABT", prop: "wheeled01", weap: "Rocket-Pod" },
npblc: { body: "Body4ABT", prop: "HalfTrack", weap: "Cannon1Mk1" },
nphmg: { body: "Body4ABT", prop: "HalfTrack", weap: "MG3Mk1" },
npsmc: { body: "Body8MBT", prop: "HalfTrack", weap: "Cannon2A-TMk1" },
buscan: { body: "BusBody", prop: "BaBaProp", weap: "BabaBusCannon" },
firecan: { body: "FireBody", prop: "BaBaProp", weap: "BabaBusCannon" },

// CAM_1C
npsens: { body: "Body4ABT", prop: "wheeled01", weap: "SensorTurret1Mk1" },
npslc: { body: "Body8MBT", prop: "HalfTrack", weap: "Cannon1Mk1" },
npmor: { body: "Body8MBT", prop: "HalfTrack", weap: "Mortar1Mk1" },
npsmct: { body: "Body8MBT", prop: "tracked01", weap: "Cannon2A-TMk1" },

// CAM_1CA
npmrl: { body: "Body4ABT", prop: "HalfTrack", weap: "Rocket-MRL" },
npmmct: { body: "Body12SUP", prop: "tracked01", weap: "Cannon2A-TMk1" },
npsbb: { body: "Body8MBT", prop: "HalfTrack", weap: "Rocket-BB" },
npltat: { body: "Body4ABT", prop: "HalfTrack", weap: "Rocket-LtA-T" },

// SUB_1_4A

// CAM_1_5
nphmgt: { body: "Body8MBT", prop: "tracked01", weap: "MG3Mk1" },
npcybc: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgCannon" },
npcybf: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgFlamer01" },
npcybm: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgChaingun" },

// CAM_1AC
nphct: { body: "Body12SUP", prop: "tracked01", weap: "Cannon375mmMk1" },
npmorb: { body: "Body8MBT", prop: "HalfTrack", weap: "Mortar2Mk1" },
npmsens: { body: "Body8MBT", prop: "HalfTrack", weap: "SensorTurret1Mk1" },

// SUB_1_7

// CAM_1_D
npcybr: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgRocket" },
nphmgh: { body: "Body8MBT", prop: "hover01", weap: "MG3Mk1" },
npltath: { body: "Body8MBT", prop: "hover01", weap: "Rocket-LtA-T" },
nphch: { body: "Body12SUP", prop: "hover01", weap: "Cannon375mmMk1" },
nphbb: { body: "Body12SUP", prop: "hover01", weap: "Rocket-BB" },

// CAM_2_A
commgt: { body: "Body6SUPP", prop: "tracked01", weap: "MG3Mk1" },
comsens: { body: "Body6SUPP", prop: "tracked01", weap: "SensorTurret1Mk1" },
cohct: { body: "Body9REC", prop: "tracked01", weap: "Cannon375mmMk1" },
commc: { body: "Body6SUPP", prop: "tracked01", weap: "Cannon2A-TMk1" },
commrl: { body: "Body6SUPP", prop: "HalfTrack", weap: "Rocket-MRL" },
commrp: { body: "Body6SUPP", prop: "tracked01", weap: "Rocket-Pod" },
comorb: { body: "Body6SUPP", prop: "HalfTrack", weap: "Mortar2Mk1" },
colcbv: { body: "Body2SUP", prop: "V-Tol", weap: "Bomb1-VTOL-LtHE" },
prhct: { body: "Body11ABT", prop: "tracked01", weap: "Cannon375mmMk1" },
prltat: { body: "Body5REC", prop: "tracked01", weap: "Rocket-LtA-T" },
prrept: { body: "Body5REC", prop: "tracked01", weap: "LightRepair1" },

// SUB_2_1

// CAM_2_B
comatt: { body: "Body6SUPP", prop: "tracked01", weap: "Rocket-LtA-T" },
comit: { body: "Body6SUPP", prop: "tracked01", weap: "Flame2" },
colatv: { body: "Body2SUP", prop: "V-Tol", weap: "Rocket-VTOL-LtA-TDef" },

// SUB_2_2
comtath: { body: "Body6SUPP", prop: "hover01", weap: "Rocket-LtA-T" },
comtathh: { body: "Body6SUPP", prop: "HalfTrack", weap: "Rocket-LtA-T" },

// CAM_2_C
commorv: { body: "Body6SUPP", prop: "V-Tol", weap: "Bomb2-VTOL-HvHE" },
colagv: { body: "Body2SUP", prop: "V-Tol", weap: "MG4ROTARY-VTOL" },
comhpv: { body: "Body6SUPP", prop: "tracked01", weap: "Cannon4AUTOMk1" },
cohbbt: { body: "Body9REC", prop: "tracked01", weap: "Rocket-BB" },

// SUB_2_5
cocybag: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgRotMG" },

// SUB_2_D
comhltat: { body: "Body6SUPP", prop: "tracked01", weap: "Rocket-HvyA-T" },
commorvt: { body: "Body6SUPP", prop: "V-Tol", weap: "Bomb4-VTOL-HvyINC" },
cohhpv: { body: "Body9REC", prop: "tracked01", weap: "Cannon4AUTOMk1" },
comagt: { body: "Body6SUPP", prop: "tracked01", weap: "MG4ROTARYMk1" },

// SUB_2_6
cohact: { body: "Body9REC", prop: "tracked01", weap: "Cannon5VulcanMk1" },
comrotm: { body: "Body6SUPP", prop: "HalfTrack", weap: "Mortar3ROTARYMk1" },
comsensh: { body: "Body6SUPP", prop: "HalfTrack", weap: "SensorTurret1Mk1" },

// SUB_2_7
comrotmh: { body: "Body6SUPP", prop: "tracked01", weap: "Mortar3ROTARYMk1" },
comltath: { body: "Body6SUPP", prop: "hover01", weap: "Rocket-HvyA-T" },

// SUB_2_8
comhvat: { body: "Body6SUPP", prop: "V-Tol", weap: "Rocket-VTOL-HvyA-T" },

// CAM_2_END
cowwt: { body: "Body9REC", prop: "tracked01", weap: "QuadRotAAGun" },

// CAM_3_A
nxmscouh: { body: "Body7ABT", prop: "hover02", weap: "Missile-A-T" },
nxcyrail: { body: "CybNXRail1Jmp", prop: "CyborgLegs02", weap: "NX-Cyb-Rail1" },
nxcyscou: { body: "CybNXMissJmp", prop: "CyborgLegs02", weap: "NX-CyborgMiss" },
nxlneedv: { body: "Body3MBT", prop: "V-Tol02", weap: "RailGun1-VTOL" },
nxlscouv: { body: "Body3MBT", prop: "V-Tol02", weap: "Missile-VTOL-AT" },
nxmtherv: { body: "Body7ABT", prop: "V-Tol02", weap: "Bomb4-VTOL-HvyINC" },
prhasgnt: { body: "Body11ABT", prop: "tracked01", weap: "MG4ROTARYMk1" },
prhhpvt: { body: "Body11ABT", prop: "tracked01", weap: "Cannon4AUTOMk1" },
prhaacnt: { body: "Body11ABT", prop: "tracked01", weap: "AAGun2Mk1" },
prtruck: { body: "Body5REC", prop: "tracked01", weap: "Spade1Mk1" },

// SUB_3_1
nxcylas: { body: "CybNXPulseLasJmp", prop: "CyborgLegs02", weap: "NX-CyborgPulseLas" },
nxmrailh: { body: "Body7ABT", prop: "hover02", weap: "RailGun2Mk1" },

// CAM_3_B
nxmlinkh: { body: "Body7ABT", prop: "hover02", weap: "NEXUSlink" },
nxmsamh: { body: "Body7ABT", prop: "hover02", weap: "Missile-HvySAM" },
nxmheapv: { body: "Body7ABT", prop: "V-Tol02", weap: "Bomb2-VTOL-HvHE" },

// SUB_3_2
nxlflash: { body: "Body3MBT", prop: "hover02", weap: "Laser3BEAMMk1" },

// CAM_3_A_B
nxmsens: { body: "Body7ABT", prop: "hover02", weap: "SensorTurret1Mk1" },
nxmangel: { body: "Body7ABT", prop: "hover02", weap: "Missile-MdArt" },

// CAM_3_C

// CAM_3_A_D_1
nxmpulseh: { body: "Body7ABT", prop: "hover02", weap: "Laser2PULSEMk1" },

// CAM_3_A_D_2
nxhgauss: { body: "Body10MBT", prop: "hover02", weap: "RailGun3Mk1" },
nxlpulsev: { body: "Body3MBT", prop: "V-Tol02", weap: "Laser2PULSE-VTOL" },

// SUB_3_4
nxllinkh: { body: "Body3MBT", prop: "hover02", weap: "NEXUSlink" },
nxmpulsev: { body: "Body7ABT", prop: "V-Tol02", weap: "Laser2PULSE-VTOL" },


////////////////////////////////////////////////////////////////////////////////
};
