import { JsPsych, JsPsychPlugin, ParameterType, TrialType } from "jspsych";
import { version } from "../package.json";

const info = <const>{
  name: "leaderboard",
  version: version,
  parameters: {
    /** An array of objects containing leaderboard data. Each object should have properties that will be displayed as columns.
     * Example: [{rank: 1, score: 1000, name: "Player 1"}] */
    data: {
      type: ParameterType.OBJECT,
      default: undefined,
    },
    /** Array with information about the table columns. Should match the property names in the data objects.
     * The order of the columns will be the order in which they are displayed and the supplied names will be used as headers.
     * If no name is supplied, the property name itself will be used as header.
     * Example: [{col: "name", name: "Player Name"}, {col: score}] */
    columns: {
      type: ParameterType.OBJECT,
      default: null,
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

  trial(display_element: HTMLElement, trial: TrialType<Info>) {
    // Validate required parameters
    if (!trial.data) {
      console.error("Required parameter 'data' must be provided");
      this.jsPsych.finishTrial();
      return;
    }
    if (!Array.isArray(trial.data) || !(Array.isArray(trial.columns) || trial.columns == null)) {
      console.error("Parameters 'data' and 'columns' must be arrays");
      this.jsPsych.finishTrial();
      return;
    }

    let columns: Array<ColumnInfo> = trial.columns as Array<ColumnInfo>;
    // Default to just use inherent order of first row if no column info provided
    if (columns == null) {
      columns = Object.keys(trial.data[0]).map(col => ({ col }));
    }

    // Add CSS styles
    const styleElement = document.createElement('style');
    styleElement.textContent = trial.table_styles;
    display_element.appendChild(styleElement);

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
    trial.data.forEach(row => {
      const tr = document.createElement('tr');
      columns.forEach(column => {
        const td = document.createElement('td');
        td.textContent = row[column.col];
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    // Add table to display element
    display_element.appendChild(table);

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
      // clear the display
      display_element.innerHTML = '';

      // end trial
      this.jsPsych.finishTrial();
    };

    // End trial after duration if specified
    if (trial.duration !== null) {
      this.jsPsych.pluginAPI.setTimeout(end_trial, trial.duration);
    }
  }
}

export default LeaderboardPlugin;