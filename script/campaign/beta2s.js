// convert this to JS file later
// this is the setup level for Beta 2

include("script/campaign/libcampaign.js");

function eventStartLevel()
{
	camSetupTransporter(87, 100, 70, 1);
	centreView(88, 101);
	setNoGoArea(86, 99, 88, 101, CAM_HUMAN_PLAYER);
	setMissionTime(camChangeOnDiff(camMinutesToSeconds(70)));
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "XBOX_LIVE");
	camPlayVideos({video: "SPAM_BETA2_MSG", type: CAMP_MSG});

	// Spamton items
	camQueueDialogue("New research options are available!", camSecondsToMilliseconds(1), camSounds.spamton.laugh);
	enableResearch("R-Wpn-MG3Mk1", CAM_HUMAN_PLAYER); // Realistic Heavy Machinegun (from Spamton)
}