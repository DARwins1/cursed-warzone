include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_spamtonRes = [
	"R-Wpn-MG-Damage02", "R-Vehicle-Metals01", "R-Cyborg-Metals01",
	"R-Defense-WallUpgrade02", "R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage02",
	"R-Wpn-Cannon-Damage01", "R-Wpn-MG-ROF01", "R-Struc-RprFac-Upgrade01",
	"R-Wpn-RocketSlow-Damage01",
];
var pipisRoute1;
var pipisRoute2;
var escaping;

var tonySpawned;
var tonyGroup;
var tonyMourned;

function eventTransporterLanded(transport)
{
	camQueueDialogues([
		{text: "SPAMTON: HAEAHAEAHAEAHAEAH!!", delay: camSecondsToMilliseconds(3), sound: camSounds.spamton.laugh},
		{text: "SPAMTON: WELCOME TO [[The Hole]] !!", delay: camSecondsToMilliseconds(6), sound: camSounds.spamton.talk1},
		{text: "SPAMTON: I\"MSURE YOU'LL [Have a Blast!] BEFORE YOU REACH THE", delay: camSecondsToMilliseconds(9), sound: camSounds.spamton.talk2},
	]);

	// Set up Tony
	tonyGroup = camNewGroup();
	tonyMourned = false;
	setAlliance(CAM_SPAMTON, CAM_SCAV_7, true);
	if (!camIsResearched("Script-Tony-Encountered"))
	{
		// 100% chance of Tony being encountered on this level (if not encountered yet)
		completeResearch("Script-Tony-Encountered");
		// Spawn Tony
		const pos = camMakePos("tonyGroup");
		groupAdd(tonyGroup, addDroid(CAM_SCAV_7, pos.x, pos.y, 
			_("Tony"), "B1BaBaPerson01", "BaBaLegs", "", "", "BabaMG"
		));
		tonySpawned = true;
	}
	else
	{
		tonySpawned = false;
	}
}

camAreaEvent("tonyTrigger", function(droid)
{
	if (droid.player === CAM_HUMAN_PLAYER && tonySpawned && !tonyMourned)
	{
		camPlayVideos({video: "TONY_ENCOUNTER", type: MISS_MSG});

		// Tell Tony to attack
		camManageGroup(tonyGroup, CAM_ORDER_ATTACK);
	}
	else
	{
		resetLabel("tonyTrigger", CAM_HUMAN_PLAYER);
	}
});

// RIP Tony :(
function tonyDeathMessage()
{
	camPlayVideos({video: "TONY_DEATH", type: MISS_MSG});
}

function eventDestroyed(obj)
{
	if (obj.type === FEATURE && obj.name === _("Nuclear Drum"))
	{
		// Destroy all the player's air units, since they would otherwise avoid the blast while airborne
		let vtols = enumDroid(CAM_HUMAN_PLAYER).filter((obj) => (
			isVTOL(obj) && (obj.droidType !== DROID_SUPERTRANSPORTER)
		));
		for (let i = 0; i < vtols.length; i++)
		{
			camSafeRemoveObject(vtols[i], true);
		}
	}

	if (tonySpawned && !tonyMourned && obj.type === DROID && groupSize(tonyGroup) < 1)
	{
		// Mourn the loss of Tony
		queue("tonyDeathMessage", camSecondsToMilliseconds(1));
		tonyMourned = true;
	}
}

// Remember the route the player takes towards the artifact
camAreaEvent("routeTrigger1", function(droid)
{
	if (droid.player === CAM_HUMAN_PLAYER && !isVTOL(droid) && !(droid.droidType === DROID_SUPERTRANSPORTER))
	{
		if (pipisRoute1 == null) pipisRoute1 = "left";

		if (!escaping)
		{
			camCallOnce("spamtonHalfWayDialogue");
		}
		else
		{
			camCallOnce("spamtonEscapeDialogue");
		}
	}
	else
	{
		resetLabel("routeTrigger1", CAM_HUMAN_PLAYER);
	}
});

camAreaEvent("routeTrigger2", function(droid)
{
	if (droid.player === CAM_HUMAN_PLAYER && !isVTOL(droid) && !(droid.droidType === DROID_SUPERTRANSPORTER))
	{
		if (pipisRoute1 == null) pipisRoute1 = "right";

		if (!escaping)
		{
			camCallOnce("spamtonHalfWayDialogue");
		}
		else
		{
			camCallOnce("spamtonEscapeDialogue");
		}
	}
	else
	{
		resetLabel("routeTrigger2", CAM_HUMAN_PLAYER);
	}
});

camAreaEvent("routeTrigger3", function(droid)
{
	if (droid.player === CAM_HUMAN_PLAYER && !isVTOL(droid) && !(droid.droidType === DROID_SUPERTRANSPORTER))
	{
		if (pipisRoute2 == null) pipisRoute2 = "right";
	}
	else
	{
		resetLabel("routeTrigger3", CAM_HUMAN_PLAYER);
	}
});

camAreaEvent("routeTrigger4", function(droid)
{
	if (droid.player === CAM_HUMAN_PLAYER && !isVTOL(droid) && !(droid.droidType === DROID_SUPERTRANSPORTER))
	{
		if (pipisRoute2 == null) pipisRoute2 = "left";
	}
	else
	{
		resetLabel("routeTrigger4", CAM_HUMAN_PLAYER);
	}
});

function spamtonHalfWayDialogue()
{
	camQueueDialogues([
		{text: "SPAMTON: [Did you know?]", delay: camSecondsToMilliseconds(3), sound: camSounds.spamton.talk1},
		{text: "SPAMTON: THIS [Hole] HAS ENOUGH [[Hyperlink Blocked]]", delay: camSecondsToMilliseconds(6), sound: camSounds.spamton.talk2},
		{text: "SPAMTON: TO [Blow up Nebraska 7 times] !!!!", delay: camSecondsToMilliseconds(9), sound: camSounds.spamton.talk2},
	]);
}

function spamtonEscapeDialogue()
{
	camQueueDialogues([
		{text: "SPAMTON: HEY!!!", delay: camSecondsToMilliseconds(3), sound: camSounds.spamton.talk1},
		{text: "SPAMTON: YOU\"RE SUPP0SED TO [Have a Blast!]", delay: camSecondsToMilliseconds(6), sound: camSounds.spamton.talk2},
		{text: "SPAMTON: DON't LE4VE !!!", delay: camSecondsToMilliseconds(9), sound: camSounds.spamton.talk1},
		{text: "SPAMTON: G3T BACK AND [Boogie]", delay: camSecondsToMilliseconds(12), sound: camSounds.spamton.talk2},
	]);
}

// Block the route the player took with Pipis
function eventPickup(feature, droid)
{
	if (droid.player === CAM_HUMAN_PLAYER && feature.stattype === ARTIFACT)
	{
		escaping = true;
		hackRemoveMessage("C3-1_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER);
		playSound(camSounds.spamton.deepLaugh); // Spamton creepy laugh

		// Start harassing the player after a delay
		queue("activateMiniFactory", camChangeOnDiff(camSecondsToMilliseconds(45)));

		// Choose where the Pipis shall be placed
		let buildPos1;
		let buildPos2;
		if (pipisRoute1 === "left")
		{
			buildPos1 = camMakePos("pipisPos1");
		}
		else
		{
			buildPos1 = camMakePos("pipisPos2");
		}
		if (pipisRoute2 === "left")
		{
			buildPos2 = camMakePos("pipisPos4");
		}
		else
		{
			buildPos2 = camMakePos("pipisPos3");
		}

		// Order the trucks to place the Pipis
		enableStructure("A0Pipis", CAM_SPAMTON);
		const truck1 = getObject("truck1");
		const truck2 = getObject("truck2");
		if (camDef(truck1) && truck1 !== null)
		{
			orderDroidBuild(truck1, DORDER_BUILD, "A0Pipis", buildPos1.x, buildPos1.y);
		}
		if (camDef(truck2) && truck2 !== null)
		{
			orderDroidBuild(truck2, DORDER_BUILD, "A0Pipis", buildPos2.x, buildPos2.y);
		}
	}
}

// Start building Mini MGVs
function activateMiniFactory()
{
	camEnableFactory("spamFactory");
}

function eventStartLevel()
{
	const startpos = camMakePos("landingZone");
	const lz = getObject("landingZone");
	escaping = false;

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "WELCOME_TO_THE", {
		area: "compromiseZone",
		message: "C3-1_LZ",
		reinforcements: -1, //No reinforcements
		retlz: true
	});
	// NOTE: No game over cutscenes for this level
	// For the same reasons as on Alpha 3

	// centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(47, 57, CAM_HUMAN_PLAYER);
	setTransporterExit(60, 5, CAM_HUMAN_PLAYER);

	// Get the camera to follow the transporter
	// Transporter is the only droid of the player's on the map at this point
	const transporter = enumDroid();
	cameraTrack(transporter[0]);

	camCompleteRequiredResearch(mis_spamtonRes, CAM_SPAMTON);

	camSetArtifacts({
		"crate": { tech: "R-Wpn-Cannon3Mk1" }, // Very Heavy Cannon
	});

	pipisRoute1 = null;
	pipisRoute2 = null;

	hackAddMessage("C3-1_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER, false);

	camSetFactories({
		"spamFactory": {
			assembly: "spamAssembly",
			order: CAM_ORDER_COMPROMISE,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(12)),
			data: {
				regroup: false,
				pos: camMakePos("landingZone")
			},
			templates: [cTempl.spminimg] // Only produce mini MGs
		},
	});

	// Add funny explosives
	camUpgradeOnMapFeatures("Boulder1", "ExplosiveDrum");
	camUpgradeOnMapFeatures("Boulder2", "Pipis");
	camUpgradeOnMapFeatures("Boulder3", "PipisDummy"); // Pipis that doesn't scan for enemies (to reduce script lag)
	camUpgradeOnMapFeatures("Advmaterialslab", "NuclearDrum");
	camUpgradeOnMapFeatures("Pylon", "Sign9");
	camUpgradeOnMapFeatures("Pipe1A", "Sign14");

	// Extend the flamer tower
	camUpgradeOnMapStructures("GuardTower4", "GuardTowerEH", CAM_SPAMTON);
}
