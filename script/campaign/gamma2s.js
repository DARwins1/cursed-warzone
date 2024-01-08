include("script/campaign/libcampaign.js");

function eventStartLevel()
{
	camSetupTransporter(15, 83, 5, 73);
	centreView(15, 83);
	setNoGoArea(14, 82, 16, 84, CAM_HUMAN_PLAYER);
	setMissionTime(camChangeOnDiff(camMinutesToSeconds(20)));
	// camPlayVideos([{video: "MB3_1A_MSG", type: CAMP_MSG}, {video: "MB3_1A_MSG2", type: MISS_MSG}]);
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "THE_BIG_ONE");
}
