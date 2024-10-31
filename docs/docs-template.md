# plugin-leaderboard

A jsPsych plugin for displaying a leaderboard table.

## Parameters

In addition to the [parameters available in all plugins](https://jspsych.org/latest/overview/plugins.md#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter           | Type             | Default Value      | Description                              |
| ------------------- | ---------------- | ------------------ | ---------------------------------------- |
| data                | OBJECT           | null               | An array of objects containing leaderboard data. Each object should have properties that will be displayed as columns. Example: [{rank: 1, score: 1000, name: "Player 1"}] |
| wwl_leaderboard_id  | STRING           | null               | The LeaderboardId in World-Wide-Lab (https://worldwidelab.org/). If specified, this will automatically download and display leaderboard data. Requires jsPsychWorldWideLab to be set. See https://worldwidelab.org/guides/leaderboards.html for more information. |
| jsPsychWorldWideLab | FUNCTION         | null               | The jsPsych-WorldWideLab integration. You will need to import and load this yourself and then just pass it here. See https://worldwidelab.org/guides/integration-jsPsych.html for more information. |
| columns             | OBJECT           | null               | Array with information about the table columns. Should match the property names in the data objects. The order of the columns will be the order in which they are displayed and the supplied names will be used as headers. If no name is supplied, the property name itself will be used as header. Example: [{col: "name", name: "Player Name"}, {col: score}] |
| wwl_score_level     | STRING           | "individual"       | The level of the scores to retrieve from WWL. Either "individual" or "groups". Requires wwl_leaderboard_id. |
| wwl_score_options   | OBJECT           | {}                 | Options to specify how scores should be retrieved from WWL. See: https://worldwidelab.org/reference/client.getleaderoardscoresoptions.html Requires wwl_leaderboard_id. |
| loading_message     | STRING           | "Loading leaderboard data." | Message to display while loading leaderboard data. Only displayed when dynamically loading data. |
| table_styles        | STRING           | `.jspsych-leaderboard-table { border-collapse: collapse; margin: 25px auto; font-family: sans-serif; min-width: 400px; box-shadow: 0 0 20px rgba(0, 0, 0, 0.15); } .jspsych-leaderboard-table thead tr { background-color: #009879; color: #ffffff; text-align: left; } .jspsych-leaderboard-table th, .jspsych-leaderboard-table td { padding: 12px 15px; text-align: left; } .jspsych-leaderboard-table tbody tr { border-bottom: 1px solid #dddddd; } .jspsych-leaderboard-table tbody tr:nth-of-type(even) { background-color: #f3f3f3; } .jspsych-leaderboard-table tbody tr:last-of-type { border-bottom: 2px solid #009879; }` | Custom CSS styles for the table (optional) |
| duration            | INT              | null               | Duration to display the leaderboard in milliseconds. If null, will require button press. |

## Data Generated

In addition to the [default data collected by all plugins](https://jspsych.org/latest/overview/plugins.md#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
|           |         |                                          |

## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-leaderboard"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-leaderboard.js"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-leaderboard
```

```js
import jsPsychLeaderboard from '@jspsych-contrib/plugin-leaderboard';
```

## Examples

### Basic Example

```javascript
const jsPsych = initJsPsych({
  display_element: 'jspsych-target'
});

const leaderboardData = [
  { rank: 1, player: "John Doe", score: 1000, time: "1:23" },
  { rank: 2, player: "Alice Smith", score: 950, time: "1:25" },
  { rank: 3, player: "Bob Johnson", score: 900, time: "1:28" },
  { rank: 4, player: "Emma Davis", score: 850, time: "1:30" },
  { rank: 5, player: "Michael Wilson", score: 800, time: "1:32" }
];

const timeline = [];

timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <h2>Welcome to the Leaderboard Demo</h2>
    <p>Press any key to see the current standings.</p>
  `
});

timeline.push({
  type: jsPsychLeaderboard,
  data: leaderboardData,
  columns: [{ col: "rank", name: ""}, { col: "player", name: "Name"}, { col: "score", name: "Score"}, {col: "time", name: "Time"}],
});

timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <h2>Demo Complete!</h2>
  `
});

jsPsych.run(timeline);
```
