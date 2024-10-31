import jsPsychWorldWideLab from "@world-wide-lab/integration-jspsych";

// Trampling all over the typing system in this mock

// @ts-ignore
jsPsychWorldWideLab.client = {
  // @ts-ignore
  __LEADERBOARD_DATA__: undefined,

  getLeaderboardScores: async function (leaderboardId, level, options) {
    // @ts-ignore
    return jsPsychWorldWideLab.client.__LEADERBOARD_DATA__ || [{
      publicIndividualName: leaderboardId,
      score: level,
    }];
  }
}

export {
  jsPsychWorldWideLab
}