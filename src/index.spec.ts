import { startTimeline } from "@jspsych/test-utils";
import LeaderboardPlugin from ".";

jest.useFakeTimers();

describe("leaderboard plugin", () => {
  const sampleData = [
    { rank: 1, name: "John", score: 1000 },
    { rank: 2, name: "Alice", score: 950 },
    { rank: 3, name: "Bob", score: 900 }
  ];

  const headers = ["rank", "name", "score"];

  it("should load and display the leaderboard", async () => {
    const { expectFinished, getHTML, getData } = await startTimeline([
      {
        type: LeaderboardPlugin,
        data: sampleData,
        headers: headers,
      },
    ]);

    // Check if table is rendered
    expect(getHTML()).toContain('jspsych-leaderboard-table');

    // Check if headers are present
    headers.forEach(header => {
      expect(getHTML()).toContain(header);
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

  it("should end automatically after duration", async () => {
    const duration = 1000;

    const { expectFinished, getData } = await startTimeline([
      {
        type: LeaderboardPlugin,
        data: sampleData,
        headers: headers,
        duration: duration,
      },
    ]);

    // No continue button should be present
    expect(document.querySelector('.jspsych-btn')).toBeNull();

    // Advance timers
    jest.advanceTimersByTime(duration);

    await expectFinished();
  });

  it("should handle empty data gracefully", async () => {
    const emptyData = [];

    const { expectFinished, getHTML } = await startTimeline([
      {
        type: LeaderboardPlugin,
        data: emptyData,
        headers: headers,
      },
    ]);

    // Table should still be created
    expect(getHTML()).toContain('jspsych-leaderboard-table');

    // Headers should be present
    headers.forEach(header => {
      expect(getHTML()).toContain(header);
    });

    // Click continue button
    const continueButton = document.querySelector('.jspsych-btn');
    continueButton.click();

    await expectFinished();
  });

  it("should fail gracefully when required parameters are missing", async () => {
    const { expectFinished, getData } = await startTimeline([
      {
        type: LeaderboardPlugin,
      },
    ]);

    await expectFinished();
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
        data: sampleData,
        headers: headers,
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
