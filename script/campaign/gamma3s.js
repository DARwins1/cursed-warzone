include("script/campaign/libcampaign.js");

function eventStartLevel()
{
	camSetupTransporter(15, 83, 5, 73);
	centreView(15, 83);
	setNoGoArea(14, 82, 16, 84, CAM_HUMAN_PLAYER);
	setMissionTime(camChangeOnDiff(camHoursToSeconds(2)));
	camPlayVideos({video: "SPAM_GAMMA3", type: CAMP_MSG});
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "SPAMTOPIA");
}
