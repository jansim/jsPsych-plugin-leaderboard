import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";
import { version } from "../package.json";

const info = <const>{
  name: "leaderboard",
  version: version,
  parameters: {
    /** An array of objects containing leaderboard data. Each object should have properties that will be displayed as columns.
     * Example: [{rank: 1, score: 1000, name: "Player 1"}] */
    leaderboard_data: {
      type: ParameterType.OBJECT,
      default: null,
    },
    /** The LeaderboardId in World-Wide-Lab (https://worldwidelab.org/).
     * If specified, this will automatically download and display leaderboard data.
     * Requires jsPsychWorldWideLab to be set.
     * See https://worldwidelab.org/guides/leaderboards.html for more information.
     * */
    wwl_leaderboard_id: {
      type: ParameterType.STRING,
      default: null,
    },
    /** The jsPsych-WorldWideLab integration.
     * You will need to import and load this yourself and then just pass it here.
     * See https://worldwidelab.org/guides/integration-jsPsych.html for more information.
    */
    jsPsychWorldWideLab: {
      type: ParameterType.FUNCTION,
      default: null,
    },
    /** Array with information about the table columns. Should match the property names in the data objects.
     * The order of the columns will be the order in which they are displayed and the supplied names will be used as headers.
     * If no name is supplied, the property name itself will be used as header.
     * Example: [{col: "name", name: "Player Name"}, {col: score}] */
    columns: {
      type: ParameterType.OBJECT,
      default: null,
    },
    /**
     * The level of the scores to retrieve from WWL. Either "individual" or "groups".
     * Requires wwl_leaderboard_id.
     */
    wwl_score_level: {
      type: ParameterType.STRING,
      default: "individual",
    },
    /**
     * Options to specify how scores should be retrieved from WWL. See: https://worldwidelab.org/reference/client.getleaderoardscoresoptions.html
     * Requires wwl_leaderboard_id.
     */
    wwl_score_options: {
      type: ParameterType.OBJECT,
      default: {},
    },
    /** The refresh interval in seconds to update the leaderboard data. If null, will not refresh. */
    refresh_interval: {
      type: ParameterType.INT,
      default: null,
    },
    /** Message to display while loading leaderboard data. Only displayed when dynamically loading data. */
    loading_message: {
      type: ParameterType.STRING,
      default: "Loading leaderboard data.",
    },
    /** Custom CSS styles for the table (optional) */
    table_styles: {
      type: ParameterType.STRING,
      default: `
        .jspsych-leaderboard-table {
          border-collapse: collapse;
          margin: 25px auto;
          font-family: sans-serif;
          min-width: 400px;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
        }
        .jspsych-leaderboard-table thead tr {
          background-color: #009879;
          color: #ffffff;
          text-align: left;
        }
        .jspsych-leaderboard-table th,
        .jspsych-leaderboard-table td {
          padding: 12px 15px;
          text-align: left;
        }
        .jspsych-leaderboard-table tbody tr {
          border-bottom: 1px solid #dddddd;
        }
        .jspsych-leaderboard-table tbody tr:nth-of-type(even) {
          background-color: #f3f3f3;
        }
        .jspsych-leaderboard-table tbody tr:last-of-type {
          border-bottom: 2px solid #009879;
        }`,
    },
    /** Duration to display the leaderboard in milliseconds. If null, will require button press. */
    duration: {
      type: ParameterType.INT,
      default: null,
    },
  },
  data: {
    /** The leaderboard data displayed in the table. */
    leaderboard_data: {
      type: ParameterType.OBJECT,
      default: null,
    },
  },
};

type Info = typeof info;

type ColumnInfo = {
  col: string;
  name?: string;
}

/**
 * **leaderboard**
 *
 * jsPsych plugin for displaying a leaderboard table
 *
 * @author Jan Simson
 * @see {@link https://github.com/jansim/jsPsych-leaderboard}
 */
class LeaderboardPlugin implements JsPsychPlugin<Info> {
  static info = info;

  constructor(private jsPsych: JsPsych) {}

  renderTable(data: Array<{[key: string]: string | number}>, columns: Array<ColumnInfo>) {
    // Create table element
    const table = document.createElement('table');
    table.className = 'jspsych-leaderboard-table';

    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    columns.forEach(column => {
      const th = document.createElement('th');
      th.textContent = column.name === undefined ? column.col : column.name;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');
    data.forEach(row => {
      const tr = document.createElement('tr');
      columns.forEach(column => {
        const td = document.createElement('td');
        td.textContent = String(row[column.col]);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    return table;
  }

  async downloadLeaderboardData(jsPsychWorldWideLab: typeof import("@world-wide-lab/integration-jspsych").default, wwl_leaderboard_id: string, wwl_score_level: "individual" | "groups", wwl_score_options: {[key: string]: string | number}) {
    const client = jsPsychWorldWideLab.client;
    if (!client) {
      console.error("You must initialize the World-Wide-Lab integration before using the leaderboard plugin.");
      this.jsPsych.finishTrial();
    }

    const response = await client.getLeaderboardScores(wwl_leaderboard_id, wwl_score_level, wwl_score_options);
    return response.scores || [];
  }

  async trial(display_element: HTMLElement, trial: TrialType<Info>, on_load: () => void) {
    const onError = (errorMessage: string) => {
      display_element.innerHTML = "Error: " + errorMessage;
      this.jsPsych.finishTrial();
    }

    // Validate required parameters
    if (!trial.leaderboard_data && !trial.wwl_leaderboard_id) {
      onError("You must specify either 'data' or 'wwl_leaderboard_id'");
      return;
    }
    if (trial.leaderboard_data && trial.wwl_leaderboard_id) {
      onError("You must exclusively specify either 'data' OR 'wwl_leaderboard_id'");
      return;
    }
    if (trial.wwl_leaderboard_id && !trial.jsPsychWorldWideLab) {
      onError("You must pass in 'jsPsychWorldWideLab' when using 'wwl_leaderboard_id'");
      return;
    }
    if (!(Array.isArray(trial.leaderboard_data) || trial.leaderboard_data == null) || !(Array.isArray(trial.columns) || trial.columns == null)) {
      onError("Parameters 'data' and 'columns' must be arrays or null");
      return;
    }
    if (trial.wwl_score_level !== "individual" && trial.wwl_score_level !== "groups") {
      onError("Parameter 'wwl_score_level' must be either 'individual' or 'groups'");
      return;
    }

    let data: Array<{[key: string]: string | number}>;
    let columns: Array<ColumnInfo> = trial.columns as Array<ColumnInfo>;

    // Download leaderboard data from WWL
    if (trial.wwl_leaderboard_id) {
      // Load leaderboard scores
      display_element.innerHTML = trial.loading_message;
      data = await this.downloadLeaderboardData(trial.jsPsychWorldWideLab as any, trial.wwl_leaderboard_id, trial.wwl_score_level, trial.wwl_score_options as any);
      console.log("Leaderboard data loaded:", data);
      display_element.innerHTML = '';

      // Generate column info if not provided
      if (columns == null) {
        const nameKey = trial.wwl_score_level === "individual" ? "publicIndividualName" : "publicGroupName";
        columns = [
          { col: nameKey, name: "Name" },
          { col: "score", name: "Score" },
        ]
      }
    } else {
      data = trial.leaderboard_data as Array<{[key: string]: string | number}>;
      // Default to just use inherent order of first row if no column info provided
      if (columns == null) {
        columns = Object.keys(trial.leaderboard_data[0]).map(col => ({ col }));
      }
    }
    on_load();

    // Add CSS styles
    const styleElement = document.createElement('style');
    styleElement.textContent = trial.table_styles;
    display_element.appendChild(styleElement);

    let currentTable = this.renderTable(data, columns);
    display_element.appendChild(currentTable);

    let interval
    if (trial.refresh_interval !== null) {
      if (!trial.wwl_leaderboard_id) {
        onError("You must specify 'wwl_leaderboard_id' to use 'refresh_interval'");
      }
      // Set interval to refresh leaderboard data
      interval = setInterval(async () => {
        // Refresh data
        data = await this.downloadLeaderboardData(
          trial.jsPsychWorldWideLab as any,
          trial.wwl_leaderboard_id,
          trial.wwl_score_level as any,
          trial.wwl_score_options as any
        );
        // Replace table
        const newTable = this.renderTable(data, columns);
        currentTable.replaceWith(newTable);
        currentTable = newTable;
      }, trial.refresh_interval * 1000);
    }

    // Add continue button if duration is null
    if (trial.duration === null) {
      const button = document.createElement('button');
      button.textContent = 'Continue';
      button.className = 'jspsych-btn';
      button.addEventListener('click', () => {
        end_trial();
      });
      display_element.appendChild(button);
    }

    // Function to end trial
    const end_trial = () => {
      if (interval) {
        clearInterval(interval);
      }

      // clear the display
      display_element.innerHTML = '';

      // end trial
      this.jsPsych.finishTrial({ leaderboard_data: data });
    };

    // End trial after duration if specified
    if (trial.duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(end_trial, trial.duration);
    }

    // Don't close trial function as this will trigger finishTrial
    await new Promise((resolve) => {});
  }
}

export default LeaderboardPlugin;