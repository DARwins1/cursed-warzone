
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

var CScout; // Sensor scout
const mis_scavengerRes = [
	"R-Wpn-MG-Damage01",
];

camAreaEvent("AttackArea1", function(droid)
{
	queue("camCallOnce", camSecondsToMilliseconds(2), "doClippyRetreat");
	camManageGroup(camMakeGroup("enemy1Force1", CAM_SCAV_6), CAM_ORDER_ATTACK, {
		pos: camMakePos("enemy1Force1Pos"),
		fallback: camMakePos("enemy1Force1Fallback"),
		morale: 50
	});
	// pink factory
	camEnableFactory("base1factory");
	// sic! hill factory
	camSetFactoryData("base2factory", {
		assembly: "assembly2",
		order: CAM_ORDER_ATTACK, // changes
		data: { pos: "playerBase" }, // changes
		groupSize: 10, // changes
		maxSize: 10,
		throttle: camChangeOnDiff(camSecondsToMilliseconds((difficulty <= MEDIUM) ? 20 : 15)),
		templates: [ cTempl.triketwin, cTempl.bloketwin, cTempl.buggytwin, cTempl.bloketwin, ] // changes
	});
	camEnableFactory("base2factory"); // re-enable
});

camAreaEvent("AttackArea2", function(droid)
{
	camEnableFactory("base4factory");
});

function doClippyRetreat()
{
	const pos = camMakePos("NPSensorTurn");
	if (CScout)
	{
		camTrace("Clippy sensor droid is retreating");
		orderDroidLoc(CScout, DORDER_MOVE, pos.x, pos.y);
	}
	else
	{
		camTrace("Sensor droid died before retreating.");
	}
}

function eventDestroyed(obj)
{
	if (CScout && (obj.id === CScout.id))
	{
		CScout = null;
		camUnmarkTiles("NPSensorTurn");
		camUnmarkTiles("NPSensorRemove");
	}
}

camAreaEvent("NPSensorTurn", function(droid)
{
	const pos = camMakePos("NPSensorRemove");
	orderDroidLoc(CScout, DORDER_MOVE, pos.x, pos.y);
});

camAreaEvent("NPSensorRemove", function(droid)
{
	removeObject(CScout, false);
});

function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "SUB_1_1S");
	const startpos = getObject("startPosition");
	const lz = getObject("landingZone");
	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);

	setMissionTime(camChangeOnDiff(camHoursToSeconds(1)));
	setAlliance(CAM_CLIPPY, CAM_SCAV_6, true);
	setAlliance(CAM_CLIPPY, CAM_SCAV_7, true);
	setAlliance(CAM_SCAV_6, CAM_SCAV_7, true);

	// Change Clippy to white if the player is not white
	// otherwise, set them to gray
	if (playerData[0].colour != 10)
	{
		changePlayerColour(CAM_CLIPPY, 10); // Set Clippy to white
	}
	else
	{
		changePlayerColour(CAM_CLIPPY, 2); // Set Clippy to gray
	}

	if (difficulty === INSANE)
	{
		camCompleteRequiredResearch(mis_scavengerRes, 6);
		camCompleteRequiredResearch(mis_scavengerRes, 7);
	}

	camSetArtifacts({
		// "base1factory": { tech: "R-Wpn-Flamer-Damage02" },
		"base2factory": { tech: "R-Wpn-MG2Mk1" }, // Twin nugenihcaM
		"base3sensor": { tech: "R-Sys-Sensor-Turret01" }, // Sensor Turret
		"base4gen": { tech: "R-Struc-PowerModuleMk1" }, // Power Module
	});

	camSetEnemyBases({
		"base1group": {
			cleanup: "enemybase1",
			detectMsg: "C1B_BASE1",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg",
		},
		"base2group": {
			cleanup: "enemybase2",
			detectMsg: "C1B_BASE0",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg",
		},
		"base3group": {
			cleanup: "enemybase3",
			detectMsg: "C1B_OBJ1",
			detectSnd: "pcv375.ogg",
			eliminateSnd: "pcv391.ogg",
		},
		"base4group": {
			cleanup: "enemybase4",
			detectMsg: "C1B_BASE2",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg",
		},
	});

	camPlayVideos({video: "MB1B_MSG", type: MISS_MSG});
	camDetectEnemyBase("base4group"); // power surge detected

	camSetFactories({
		"base1factory": {
			assembly: "assembly1",
			order: CAM_ORDER_ATTACK,
			data: { pos: "playerBase" },
			groupSize: 6,
			maxSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds((difficulty <= MEDIUM) ? 11 : 8)),
			templates: [ cTempl.triketwin, cTempl.bloketwin, cTempl.buggytwin, cTempl.bloketwin ]
		},
		"base2factory": { // the hill harass factory
			assembly: "assembly2",
			order: CAM_ORDER_PATROL, // will override later
			data: { // will override later
				pos: [ "patrol1", "patrol2", "patrol3", "patrol4" ],
				interval: camSecondsToMilliseconds(20)
			},
			group: camMakeGroup("hillForce"), // will override later
			groupSize: 4, // will override later
			maxSize: 10,
			throttle: camChangeOnDiff(camSecondsToMilliseconds((difficulty <= MEDIUM) ? 24 : 18)),
			templates: [ cTempl.bloketwin ] // will override later
		},
		"base4factory": {
			assembly: "assembly4",
			order: CAM_ORDER_ATTACK,
			data: { pos: "playerBase" },
			groupSize: 8,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds((difficulty <= MEDIUM) ? 16 : 12)),
			templates: [ cTempl.trike, cTempl.bloketwin, cTempl.buggytwin, cTempl.bjeeptwin ]
		},
	});
	camEnableFactory("base2factory");

	//Timed attacks if player dawdles
	queue("eventAreaAttackArea2", camChangeOnDiff(camMinutesToMilliseconds(6)));

	// Clippy sensor scout.
	CScout = getObject("npscout");
	camNeverGroupDroid(CScout);
	const pos = getObject("NPSensorWatch");
	orderDroidLoc(CScout, DORDER_MOVE, pos.x, pos.y);

	// Replace all snowy trees with funny explosive barrels
	camUpgradeOnMapFeatures("TreeSnow3", "ExplosiveDrum");

	// Spamton items
	enableResearch("R-Vehicle-Prop-DriftWheels"); // Drift Wheels
	enableResearch("R-Wpn-Flamer01Extended"); // Extended Flamer
}
