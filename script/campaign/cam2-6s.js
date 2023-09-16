include("script/campaign/libcampaign.js");

function eventStartLevel()
{
	camSetupTransporter(87, 100, 16, 126);
	centreView(88, 101);
	setNoGoArea(86, 99, 88, 101, CAM_HUMAN_PLAYER);
	setMissionTime(camChangeOnDiff(camHoursToSeconds(1.75)));
	// camPlayVideos([{video: "MB2_6_MSG", type: CAMP_MSG}, {video: "MB2_6_MSG2", type: CAMP_MSG}, {video: "MB2_6_MSG3", type: MISS_MSG}]);
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "BONZI_BUDDY");
}
