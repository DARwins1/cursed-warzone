
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_scavengerRes = [
	"R-Wpn-MG-Damage01",
];
var tipGiven; // Whether the player has been told that they can skip this level (EASY or below only)

function eventPickup(feature, droid)
{
	if (droid.player === CAM_HUMAN_PLAYER && feature.stattype === ARTIFACT)
	{
		hackRemoveMessage("C1-1_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER);
	}
}

// Send a small group after the player
function scavAttack()
{
	const AMBUSH_GROUP = camMakeGroup(enumArea("eastScavsNorth", CAM_SCAV_7, false));
	camManageGroup(AMBUSH_GROUP, CAM_ORDER_ATTACK);
}

function eventTransporterLanded(transport)
{
	camPlayVideos({video: "CLIP_ALPHA3_MSG", type: MISS_MSG});
}

function eventGameLoaded()
{
	if (difficulty <= EASY && !tipGiven)
	{
		playSound("beep7.ogg");
		console("TIP: This level can be skipped on EASY or below by typing \"let me win\"");
		tipGiven = true;
	}
}

//Mission setup stuff
function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "CP_DUSTBOWL", {
		area: "RTLZ",
		message: "C1-1_LZ",
		reinforcements: -1, //No reinforcements
		retlz: true
	});
	// NOTE: No game over cutscenes for this level
	// They could get annoying quickly, since it's 
	// very easy to die here!

	const startpos = getObject("startPosition");
	const lz = getObject("landingZone"); //player lz
	const tent = getObject("transporterEntry");
	const text = getObject("transporterExit");
	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tent.x, tent.y, CAM_HUMAN_PLAYER);
	setTransporterExit(text.x, text.y, CAM_HUMAN_PLAYER);

	camCompleteRequiredResearch(mis_scavengerRes, CAM_SCAV_7);

	camSetArtifacts({
		"drumCrate": { tech: "R-Struc-ExplosiveDrum" }, // Explosive Drum
	});

	camPlayVideos({video: "FLIGHT", type: CAMP_MSG});
	hackAddMessage("C1-1_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER, false);

	tipGiven = false;

	// Replace all snowy trees with funny explosive barrels
	camUpgradeOnMapFeatures("TreeSnow3", "ExplosiveDrum");
	camUpgradeOnMapFeatures("TreeSnow1", "NuclearDrum");

	queue("scavAttack", camSecondsToMilliseconds(1));
}
