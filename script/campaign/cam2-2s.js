include("script/campaign/libcampaign.js");

function eventStartLevel()
{
	camSetupTransporter(87, 100, 70, 1);
	centreView(88, 101);
	setNoGoArea(86, 99, 88, 101, CAM_HUMAN_PLAYER);
	setMissionTime(camChangeOnDiff(camMinutesToSeconds(70)));
	camPlayVideos([{video: "MB2_2_MSG", type: CAMP_MSG}, {video:"MB2_2_MSG2", type: CAMP_MSG}, {video: "MB2_2_MSG3", type: MISS_MSG}]);
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "SUB_2_2");

	// Spamton items
	enableResearch("R-Vehicle-BodyDragon", CAM_HUMAN_PLAYER); // Dragon
	enableResearch("R-Wpn-Cannon2Mk1", CAM_HUMAN_PLAYER); // Fungible Cannon
}
