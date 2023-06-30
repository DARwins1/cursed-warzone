
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const SCAVENGER_RES = [
	"R-Wpn-MG-Damage01",
];

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
	var ambushGroup = camMakeGroup(enumArea("eastScavsNorth", SCAV_7, false));
	camManageGroup(ambushGroup, CAM_ORDER_ATTACK);
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

	var startpos = getObject("startPosition");
	var lz = getObject("landingZone"); //player lz
	var tent = getObject("transporterEntry");
	var text = getObject("transporterExit");
	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tent.x, tent.y, CAM_HUMAN_PLAYER);
	setTransporterExit(text.x, text.y, CAM_HUMAN_PLAYER);

	camCompleteRequiredResearch(SCAVENGER_RES, SCAV_7);

	camUpgradeOnMapTemplates(cTempl.bloke, cTempl.blokeheavy, SCAV_7);
	camUpgradeOnMapTemplates(cTempl.trike, cTempl.triketwin, SCAV_7);
	camUpgradeOnMapTemplates(cTempl.buggy, cTempl.buggytwin, SCAV_7);
	camUpgradeOnMapTemplates(cTempl.bjeep, cTempl.bjeeptwin, SCAV_7);

	camSetArtifacts({
		"drumCrate": { tech: "R-Struc-ExplosiveDrum" }, // Explosive Drum
	});

	camPlayVideos({video: "FLIGHT", type: CAMP_MSG});
	hackAddMessage("C1-1_OBJ1", PROX_MSG, CAM_HUMAN_PLAYER, false);

	// Replace all snowy trees with funny explosive barrels
	camUpgradeOnMapFeatures("TreeSnow3", "ExplosiveDrum");
	camUpgradeOnMapFeatures("TreeSnow1", "NuclearDrum");

	queue("scavAttack", camSecondsToMilliseconds(2));
}
