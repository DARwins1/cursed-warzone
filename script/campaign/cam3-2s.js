include("script/campaign/libcampaign.js");

function eventStartLevel()
{
	camSetupTransporter(15, 35, 5, 25);
	centreView(15, 35);
	setNoGoArea(14, 34, 16, 36, CAM_HUMAN_PLAYER);
	setMissionTime(camChangeOnDiff(camHoursToSeconds(2)));
	// camPlayVideos([{video: "MB3_2_MSG", type: CAMP_MSG}, {video: "MB3_2_MSG2", type: MISS_MSG}]);
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "SPAMTOPIA");
}
