include("script/campaign/libcampaign.js");

function eventStartLevel()
{
	camSetupTransporter(87, 100, 32, 1);
	centreView(88, 101);
	setNoGoArea(86, 99, 88, 101, CAM_HUMAN_PLAYER);
	setMissionTime(camChangeOnDiff(camMinutesToSeconds(20)));
	camPlayVideos({video: "BETA_4_MSG", type: CAMP_MSG});
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "THE_COLOSSEUM");
	camSetGameOverScenePool([
		"GAMEOVER_CRASH", "GAMEOVER_UT", "GAMEOVER_UK",
		"GAMEOVER_EXPLODE", "GAMEOVER_JET", "GAMEOVER_MISSILE",
	]);

	// Spamton items
	camQueueDialogue("New research options are available!", camSecondsToMilliseconds(1), camSounds.spamton.laugh);
	enableResearch("R-Vehicle-BodyTwin", CAM_HUMAN_PLAYER); // Twin Viper
}
