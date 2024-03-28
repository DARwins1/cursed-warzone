include("script/campaign/libcampaign.js");

function eventStartLevel()
{
	centreView(13, 52);
	setNoGoArea(10, 51, 12, 53, CAM_HUMAN_PLAYER);
	camSetupTransporter(11, 52, 1, 32);
	setMissionTime(camChangeOnDiff(camMinutesToSeconds(20)));
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "SURFACE_TENSION");
	camSetGameOverScenePool([
		"GAMEOVER_CRASH", "GAMEOVER_UT", "GAMEOVER_UK",
		"GAMEOVER_EXPLODE", "GAMEOVER_JET", "GAMEOVER_MISSILE",
	]);
	camPlayVideos({video: "SPAM_LEGEND_MSG", type: CAMP_MSG});
}
