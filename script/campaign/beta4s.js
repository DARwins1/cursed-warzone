include("script/campaign/libcampaign.js");

function eventStartLevel()
{
	camSetupTransporter(87, 100, 32, 1);
	centreView(88, 101);
	setNoGoArea(86, 99, 88, 101, CAM_HUMAN_PLAYER);
	setMissionTime(camChangeOnDiff(camMinutesToMilliseconds(20)));
	// camPlayVideos([{video: "MB2_5_MSG", type: CAMP_MSG}, {video: "MB2_5_MSG2", type: MISS_MSG}]);
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "THE_COLOSSEUM");

	// Spamton items
	camQueueDialogue("New research options are available!", camSecondsToMilliseconds(1), camSounds.spamton.laugh);
	enableResearch("R-Vehicle-BodyTwin", CAM_HUMAN_PLAYER); // Twin Viper
}
