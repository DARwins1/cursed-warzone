include("script/campaign/libcampaign.js");

function eventStartLevel()
{
	camSetupTransporter(15, 35, 5, 25);
	centreView(15, 35);
	setNoGoArea(14, 34, 16, 36, CAM_HUMAN_PLAYER);
	setMissionTime(camChangeOnDiff(camMinutesToSeconds(20)));
	// camPlayVideos([{video: "MB3_1A_MSG", type: CAMP_MSG}, {video: "MB3_1A_MSG2", type: MISS_MSG}]);
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "THE_BIG_ONE");
}
