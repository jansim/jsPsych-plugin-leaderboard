import { startTimeline } from "@jspsych/test-utils";
import LeaderboardPlugin from ".";
import { jsPsychWorldWideLab } from "../__mocks__/@world-wide-lab/integration-jspsych";

jest.useFakeTimers();

describe("leaderboard plugin", () => {
  const sampleData = [
    { rank: 1, name: "John", score: 1000 },
    { rank: 2, name: "Alice", score: 950 },
    { rank: 3, name: "Bob", score: 900 }
  ];

  const columns = [
    { col: "rank", name: ""},
    { col: "name", name: "Player Name"},
    { col: "score", name: "ASDF"}
  ];

  it("should load and display the leaderboard", async () => {
    const { expectFinished, getHTML, getData } = await startTimeline([
      {
        type: LeaderboardPlugin,
        leaderboard_data: sampleData,
        columns: columns,
      },
    ]);

    // Check if table is rendered
    expect(getHTML()).toContain('jspsych-leaderboard-table');

    // Check if columns are present
    columns.forEach(header => {
      expect(getHTML()).toContain(header.name);
    });

    // Check if data is displayed
    sampleData.forEach(row => {
      Object.values(row).forEach(value => {
        expect(getHTML()).toContain(value.toString());
      });
    });

    // Click continue button
    const continueButton = document.querySelector('.jspsych-btn');
    continueButton.click();

    await expectFinished();
  });

  it("should load and display a leaderboard from WWL", async () => {
    const wwl_leaderboard_id = "test-leaderboard";
    const { expectFinished, getHTML, getData } = await startTimeline([
      {
        type: LeaderboardPlugin,
        wwl_leaderboard_id,
        jsPsychWorldWideLab,
      },
    ]);

    // Check if table is rendered
    expect(getHTML()).toContain('jspsych-leaderboard-table');

    expect(getHTML()).toContain(wwl_leaderboard_id);

    // Click continue button
    const continueButton = document.querySelector('.jspsych-btn');
    continueButton.click();

    expect(getData().trials[0].leaderboard_data).toEqual([
      {
        "publicIndividualName": "test-leaderboard",
        "score": "individual",
      }
    ]);

    await expectFinished();
  });

  it("should support automatic refreshing", async () => {
    const interval = 1000;
    const wwl_leaderboard_id = "test-leaderboard";
    const { expectFinished, getHTML, getData } = await startTimeline([
      {
        type: LeaderboardPlugin,
        wwl_leaderboard_id,
        jsPsychWorldWideLab,
        refresh_interval: interval / 1000,
      },
    ]);

    // Check if table is rendered
    expect(getHTML()).toContain('jspsych-leaderboard-table');

    expect(getHTML()).toContain(wwl_leaderboard_id);

    const newLeaderboardData = [
      { publicIndividualName: "Maali Almeida", score: 100 },
    ];
    jsPsychWorldWideLab.client.__LEADERBOARD_DATA__ = newLeaderboardData;
    jest.advanceTimersByTime(interval);
    console.log(jsPsychWorldWideLab.client.getLeaderboardScores(wwl_leaderboard_id, "individual", {}));
    expect(getHTML()).toContain("Maali Almeida");

    // Click continue button
    const continueButton = document.querySelector('.jspsych-btn');
    continueButton.click();

    // Data should match the latest data
    expect(getData().trials[0].leaderboard_data).toEqual(newLeaderboardData);

    await expectFinished();
  });

  it("should end automatically after duration", async () => {
    const duration = 1000;

    const { expectFinished, getData } = await startTimeline([
      {
        type: LeaderboardPlugin,
        leaderboard_data: sampleData,
        columns: columns,
        duration: duration,
      },
    ]);

    // No continue button should be present
    expect(document.querySelector('.jspsych-btn')).toBeNull();

    // Advance timers
    jest.advanceTimersByTime(duration);

    expect(getData().trials[0].leaderboard_data).toEqual(sampleData);

    await expectFinished();
  });

  it("should handle empty data gracefully", async () => {
    const emptyData = [];

    const { expectFinished, getHTML } = await startTimeline([
      {
        type: LeaderboardPlugin,
        leaderboard_data: emptyData,
        columns: columns,
      },
    ]);

    // Table should still be created
    expect(getHTML()).toContain('jspsych-leaderboard-table');

    // columns should be present
    columns.forEach(header => {
      expect(getHTML()).toContain(header.name);
    });

    // Click continue button
    const continueButton = document.querySelector('.jspsych-btn');
    continueButton.click();

    await expectFinished();
  });

  it("should fail gracefully when required parameters are missing", async () => {
    const { expectFinished, getHTML } = await startTimeline([
      {
        type: LeaderboardPlugin,
      },
    ]);

    expect(getHTML()).toContain('Error');
  });

  it("should apply custom styles when provided", async () => {
    const customStyles = `
      .jspsych-leaderboard-table {
        background-color: red;
      }
    `;

    const { expectFinished, getHTML } = await startTimeline([
      {
        type: LeaderboardPlugin,
        leaderboard_data: sampleData,
        columns: columns,
        table_styles: customStyles,
      },
    ]);

    // Check if custom styles are applied
    const styleElement = document.querySelector('style');
    expect(styleElement.textContent).toContain('background-color: red');

    // Click continue button
    const continueButton = document.querySelector('.jspsych-btn');
    continueButton.click();

    await expectFinished();
  });
});
