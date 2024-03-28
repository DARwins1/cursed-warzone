include("script/campaign/libcampaign.js");

function eventStartLevel()
{
	camSetupTransporter(11, 52, 40, 1);
	centreView(13, 52);
	setNoGoArea(10, 51, 12, 53, CAM_HUMAN_PLAYER);
	setMissionTime(camMinutesToSeconds(15));
	camPlayVideos({video: "SPAM_ALPHA6_MSG", type: CAMP_MSG});
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "how_was_the_fall");
	camSetGameOverScenePool([
		"GAMEOVER_CRASH", "GAMEOVER_UT", "GAMEOVER_UK",
		"GAMEOVER_EXPLODE", "GAMEOVER_JET", "GAMEOVER_MISSILE",
	]);
	camSetExtraObjectiveMessage(["Move out to find the next Guardian", "Bring at least one truck"]);
}
