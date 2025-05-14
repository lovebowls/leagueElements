// Define custom event types
class LeagueEvent extends CustomEvent {
  constructor(detail) {
    super('league-event', { 
      detail,
      bubbles: true,
      composed: true 
    });
  }
}

// Import the new LeagueMatchesRecent component
import './LeagueMatchesRecent.js';
// Import the new LeagueMatchesUpcoming component
import './LeagueMatchesUpcoming.js';
// Import the new LeagueMatchesAttention component
import './LeagueMatchesAttention.js';
// Import the new LeagueMatch component
import './leagueMatch.js';

class LeagueElement extends HTMLElement {
  // Base styles shared between mobile and desktop layouts
  static get BASE_STYLES() {
    return `
      :host {
        display: block;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-family: 'Open Sans', Helvetica, Arial, sans-serif;
        box-sizing: border-box;
        --main-content-font-size: 1.3em; /* Define the constant font size */
      }
      .title {
        font-weight: bold;
        background: #f5f5f5;
        border-bottom: 1px solid #ddd;
      }
      .settings-icon {
        cursor: pointer;
        color: #555;
        margin-left: auto;
        padding: 0.75rem 1rem;
        transition: color 0.2s;
        font-size: 1.2rem; /* Match desktop title size */
      }
      .settings-icon:hover {
        color: #2196f3;
      }
      .content {
        color: #666;
        overflow-x: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        text-align: left;
        border-bottom: 1px solid #ddd;
        font-size: var(--main-content-font-size); /* Apply constant font size */
      }
      th:not(:first-child),
      td:not(:first-child) {
        text-align: center;
      }
      th {
        background-color: #f5f5f5;
        position: sticky;
        top: 0;
      }
      .form-cell {
        white-space: nowrap;
      }
      .form-icon {
        display: inline-block;
        width: 5px; 
        height: 12px;
        margin: 0 1px 0 1px;
        vertical-align: middle;
        min-width: 0;
        padding: 0;
        border: 0;
        box-sizing: border-box;
      }
      .form-w { background-color: #4CAF50; }
      .form-d { background-color: #FFC107; /* Amber for Draw */ }
      .form-l { background-color: #F44336; }
      /* New styles for recent result scores */
      /* .score-w { color: #4CAF50; background-color: transparent; } */
      /* .score-d { color: #FFC107; background-color: transparent; } */ /* Amber text */
      /* .score-l { color: #F44336; background-color: transparent; } */
      .error {
        color: #ff0000;
        padding: 0.5rem;
        background-color: #fff0f0;
        border-radius: 4px;
      }
      .match-link {
        color: #2196f3;
        text-decoration: none;
        transition: color 0.2s;
      }
      .match-link:hover {
        color: #1976d2;
        text-decoration: underline;
      }
      .match-item {
        padding: 0.5rem; /* Default/Desktop padding */
        border-bottom: 1px solid #eee;
        font-size: var(--main-content-font-size); /* Apply constant font size */
      }
      .match-item:last-child {
        border-bottom: none;
      }
      .match-date {
        color: #666; /* Centralized color */
        font-size: 0.7em; /* Relative to parent (now 1.3em for match-items) */
        margin-bottom: 0.2em; /* Add small vertical space below the date */
      }
      /* Tab Styles */
      .tab-bar {
        display: flex;
        border-bottom: 1px solid #ddd;
        background-color: #f9f9f9;
      }
      .tab-button {
        padding: 0.75rem 1.5rem;
        cursor: pointer;
        border: none;
        background: none;
        font-size: 1rem;
        color: #555;
        border-bottom: 3px solid transparent;
        transition: color 0.2s, border-bottom-color 0.2s;
      }
      .tab-button:hover {
        color: #000;
      }
      .tab-button.active {
        color: #2196f3;
        border-bottom-color: #2196f3;
        font-weight: bold;
      }

      /* Matrix Styles */
      .matrix-container {
        overflow: auto; /* For scrolling */
        flex: 1; /* Take available space if parent is flex column */
        padding: 1rem; /* Padding for the container */
      }
      .matrix-grid {
        display: grid;
        /* grid-template-columns will be set dynamically */
        /* grid-template-rows will be set dynamically (implicitly) */
        border: 1px solid #ccc; /* Border for the whole grid */
      }
      .matrix-cell {
        border: 1px solid #eee; /* Light border for each cell */
        display: flex;
        align-items: center;
        justify-content: center;
        aspect-ratio: 1 / 1; /* Keep cells square */
        position: relative; /* For tooltip positioning */
        font-size: var(--main-content-font-size); /* Apply constant font size to matrix cells */
        box-sizing: border-box; /* Ensure border is included in width/height */
      }
      .matrix-header-cell {
        font-weight: bold;
        background-color: #f5f5f5; /* Light grey background for header cells */
      }
      .matrix-team-name-x { /* Away teams - top row */
        transform: rotate(-45deg);
        white-space: nowrap;
        font-size: 0.9em;
        display: inline-block; /* Needed for transform to work well in flex */
      }
      .matrix-team-name-y { /* Home teams - first column */
        text-align: right;
        padding-right: 0.5em;
        font-size: 0.9em;
        width: 100%; /* Ensure it takes full cell width for alignment */
      }
      .matrix-cell-played { background-color: #e3f2fd; color: #1976d2; }
      .matrix-cell-scheduled { background-color: #f5f5f5; } /* Light grey for scheduled */
      .matrix-cell-none { background-color: #ffffff; } /* White for no match */
      .matrix-cell-same-team { background-color: #eeeeee; } /* Grey for diagonal */
      .matrix-cell:hover {
        filter: brightness(0.95); /* Subtle hover effect */
      }
      .matrix-score {
        font-size: var(--main-content-font-size); /* Apply constant font size to scores */
        font-weight: bold;
      }

      /* Tooltip Styles */
      .tooltip {
        position: absolute;
        background-color: #333;
        color: white;
        padding: 0.3em 0.6em;
        border-radius: 3px;
        font-size: 0.8em;
        white-space: nowrap;
        z-index: 10;
        visibility: hidden;
        opacity: 0;
        transition: opacity 0.2s, visibility 0.2s;
        bottom: 100%; /* Position above the cell */
        left: 50%;
        transform: translateX(-50%) translateY(-5px); /* Center and add a small gap */
      }
      .matrix-cell:hover .tooltip {
        visibility: visible;
        opacity: 1;
      }
      .view-container {
        flex: 1; /* Allow view to take remaining vertical space in left-panel */
        display: flex; /* To allow matrix-container to use flex:1 and manage title/content */
        flex-direction: column;
        min-height: 0; /* Important for flex children that scroll */
      }

      /* Trends View Styles */
      .trends-view-wrapper {
        display: flex;
        flex-direction: column;
        padding: 1rem; /* Padding for the overall trends view */
        gap: 1rem; /* Space between controls and content area */
        height: 100%;
        box-sizing: border-box;
      }
      .trends-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem; /* Space below the controls */
      }
      #graph-type-select {
        padding: 0.3rem 0.5rem;
        border-radius: 3px;
        border: 1px solid #ccc;
        font-size: 0.9em;
      }
      .trends-content-area {
        flex: 1; /* Allow this area to take available space */
        display: flex;
        flex-direction: column; /* Stack toggles, graph, legend vertically */
        gap: 1rem; /* Space between toggles, graph, and legend */
        min-height: 0; /* Important for flex children that scroll */
      }
      /* .trends-team-toggles { */
      /*   padding: 0.5rem; */
      /*   border: 1px solid #eee; */
      /*   border-radius: 3px; */
      /*   max-height: 150px; */ /* Limit height and allow scroll if many teams */
      /*   overflow-y: auto; */
      /* } */
      /* .trends-team-toggles label { */
      /*   display: block; */ /* Each team on a new line */
      /*   margin-bottom: 0.3rem; */
      /* } */
      .trends-graph-area {
        flex: 1; /* Graph takes most of the space */
        border: 1px solid #ddd;
        border-radius: 3px;
        overflow: hidden; /* For SVG clipping if necessary */
        position: relative; /* For potential absolute positioning inside */
      }
      .trends-graph-area svg {
        display: block; /* Remove extra space below SVG */
        width: 100%;
        height: 100%;
      }
      .trends-graph-legend {
        padding: 0.5rem;
        border: 1px solid #eee;
        border-radius: 3px;
        font-size: 0.9em;
      }
      .trends-graph-legend .legend-item {
        display: flex;
        align-items: center;
        margin-bottom: 0.3rem;
      }
      .trends-graph-legend .legend-color-box {
        width: 12px;
        height: 12px;
        margin-right: 0.5rem;
        border: 1px solid #ccc;
      }

      /* Basic SVG styles (can be overridden or augmented in JS) */
      .trends-graph-area .axis path,
      .trends-graph-area .axis line {
        fill: none;
        stroke: #666;
        shape-rendering: crispEdges;
      }
      .trends-graph-area .axis text {
        font-size: 10px;
        fill: #333;
      }
      .trends-graph-area .line {
        fill: none;
        stroke-width: 2px;
      }
      .trends-graph-area .grid-line {
        stroke: #e0e0e0;
        stroke-dasharray: 2,2;
        shape-rendering: crispEdges;
      }

      /* Table View Filter Styles */
      .title-with-filter {
        display: flex;
        justify-content: space-between;
        align-items: center;
        /* Existing .title padding will apply here */
      }
      .table-view-filter {
        padding: 0.2rem 0.4rem;
        border-radius: 3px;
        border: 1px solid #ccc;
        font-size: 0.8em;
        margin-left: 1rem;
        background-color: white; /* Ensure it's visible on different backgrounds */
        flex-shrink: 0; /* Prevent shrinking too much */
      }
      .rank-up { color: green; }
      .rank-down { color: red; }
      /* Align position numbers */
      td.position-cell {
        text-align: left;
        width: 30px; /* Fixed width */
        min-width: 30px; /* Ensure minimum width */
        max-width: 30px; /* Ensure maximum width */
      }
      /* Ensure movement indicators are properly spaced from position number */
      .position-cell .rank-up,
      .position-cell .rank-down {
        margin-left: 5px;
        display: inline-block;
      }
      /* New styles for position cell backgrounds */
      .pos-cell-promotion {
        background-color:rgb(102, 212, 128);
        color: white;
        font-weight: bold;
      }
      .pos-cell-relegation {
        background-color: #f8d7da; /* Light Red */
        color: #721c24; /* Darker Red text */
        font-weight: bold;
      }
      .pos-cell-default {
        background-color: #f0f0f0; /* Light Grey */
        color: #333;
        border: 1px solid #e0e0e0; /* Subtle border */
      }
    `;
  }

  // Mobile-specific styles
  static get MOBILE_STYLES() {
    return `
      ${LeagueElement.BASE_STYLES}
      :host {
        padding: 0.5rem;
        background: #fff;
        border: none;
        border-radius: 0;
      }
      .dashboard-mobile {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .left-panel {
        border: none;
        border-radius: 0;
        background: none;
        padding: 0;
        margin: 0;
      }
      .panel {
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
        padding: 0.5rem;
        margin: 0;
      }
      .title {
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
        padding: 0.5rem 0 0.5rem 0;
      }
      .content {
        padding: 0;
      }
      table {
        width: 100vw;
        max-width: 100vw;
        margin: 0;
        border-collapse: collapse;
      }
      th, td {
        padding: 0.4rem;
        /* font-size is now inherited from BASE_STYLES */
      }
      th:nth-child(3),
      td:nth-child(3) {
        font-weight: bold;
      }
      /* Ensure .form-icon is not defined here, it should inherit from BASE_STYLES */
      .panel-header {
        font-size: 1rem;
        margin-bottom: 0.3rem;
        color: #333;
      }
      .match-item {
        padding: 0.3rem 0.2rem; /* Mobile specific padding */
        /* border-bottom is inherited from BASE_STYLES */
        /* font-size is now inherited from BASE_STYLES */
      }
      .match-score {
        color: #4CAF50;
        font-weight: bold;
      }
      .matrix-container { /* Mobile specific matrix container scroll */
        overflow-x: auto;
        overflow-y: hidden;
      }
      .settings-icon {
        font-size: 1.1rem; /* Match mobile title size */
      }
    `;
  }

  // Desktop-specific styles
  static get DESKTOP_STYLES() {
    return `
      ${LeagueElement.BASE_STYLES}
      :host {
        padding: 1rem;
        height: 100%;
      }
      .dashboard {
        display: flex;
        height: 100%;
        gap: 1rem;
      }
      .left-panel {
        flex: 0 0 70%;
        min-width: 0;
        display: flex;
        flex-direction: column;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
      }
      .right-panel {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        min-width: 0;
      }
      .panel {
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
        padding: 1rem;
      }
      .panel-header {
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
        color: #333;
      }
      .resizer {
        width: 5px;
        background: #ddd;
        cursor: col-resize;
        transition: background 0.2s;
      }
      .resizer:hover {
        background: #999;
      }
      .title {
        font-size: 1.2rem;
        margin-bottom: 0.5rem;
        padding: 1rem;
      }
      .content {
        flex: 1;
        padding: 1rem;
      }
      th, td {
        padding: 0.75rem;
        /* font-size is now inherited from BASE_STYLES */
      }
      th:nth-child(3),
      td:nth-child(3) {
        font-weight: bold;
      }

      /* Column width adjustments */
      th:nth-child(1), /* Position */
      td:nth-child(1) {
        /* Already has fixed width via .position-cell, no change here but noted */
      }
      th:nth-child(2), /* Team */
      td:nth-child(2) {
        width: 35%; /* Increased width for Team column */
        text-align: left; /* Ensure team name is left aligned */
      }
      th:nth-child(3), /* Pts */
      td:nth-child(3),
      th:nth-child(4), /* MP */
      td:nth-child(4),
      th:nth-child(5), /* W */
      td:nth-child(5),
      th:nth-child(6), /* D */
      td:nth-child(6),
      th:nth-child(7), /* L */
      td:nth-child(7) {
        width: 5%; /* Reduced width for single/double digit columns */
      }
      th:nth-child(8), /* SF */
      td:nth-child(8),
      th:nth-child(9), /* SA */
      td:nth-child(9),
      th:nth-child(10), /* SD */
      td:nth-child(10) {
        width: 7%; /* Adjusted width for up to three digit columns */
      }
      th:nth-child(11), /* Form */
      td:nth-child(11) {
        width: 15%; /* Adjusted width for Form column */
        min-width: 100px; /* Ensure form icons have enough space */
      }

      tr:hover {
        background-color: #f9f9f9;
      }
      /* Ensure .form-icon is not defined here, it should inherit from BASE_STYLES */
      /* .match-item block to be removed from DESKTOP_STYLES */
      .match-score {
        color: #4CAF50;
        font-weight: bold;
      }
    `;
  }

  // Table header template
  static get TABLE_HEADER() {
    return `
      <thead>
        <tr>
          <th class="position-cell"></th>
          <th>Team</th>
          <th>Pts</th>
          <th>MP</th>
          <th>W</th>
          <th>D</th>
          <th>L</th>
          <th>SF</th>
          <th>SA</th>
          <th>SD</th>
          <th>Form</th>
        </tr>
      </thead>
    `;
  }

  // Mobile layout template
  static get MOBILE_TEMPLATE() {
    return `
      <div class="dashboard-mobile">
        <div class="left-panel">
          <div class="tab-bar">
            <button class="tab-button active" data-view="table">Table</button>
            <button class="tab-button" data-view="matrix">Matrix</button>
            <button class="tab-button" data-view="trends">Trends</button>
            <span class="settings-icon" title="Edit League Settings">⚙️</span>
          </div>
          <div class="view-container" id="mobile-table-view">
            <div class="title title-with-filter">
              <span>{{title}}</span>
              <select id="table-filter-select" class="table-view-filter">
                <option value="overall" {{overallSelected}}>Overall</option>
                <option value="home" {{homeSelected}}>Home</option>
                <option value="away" {{awaySelected}}>Away</option>
              </select>
            </div>
            <div class="content">
              <table>
                ${LeagueElement.TABLE_HEADER}
                <tbody>
                  {{tableRows}}
                </tbody>
              </table>
            </div>
          </div>
          <div class="view-container" id="mobile-matrix-view" style="display: none;">
            <div class="title">{{title}} - Matrix</div>
            <div class="matrix-container">
              {{matrixView}}
            </div>
          </div>
          <div class="view-container" id="mobile-trends-view" style="display: none;">
            {{trendsViewContent}}
          </div>
        </div>
        <div class="panel">
          <league-matches-upcoming id="mobile-upcoming-fixtures" is-mobile="true"></league-matches-upcoming>
          <!-- Calendar and its filter are now inside league-matches-upcoming -->
        </div>
        <div class="panel">
          <league-matches-recent id="mobile-recent-matches" is-mobile="true"></league-matches-recent>
        </div>
        <div class="panel">
          <league-matches-attention id="mobile-attention-matches" is-mobile="true"></league-matches-attention>
        </div>
      </div>
    `;
  }

  // Desktop layout template
  static get DESKTOP_TEMPLATE() {
    return `
      <div class="dashboard">
        <div class="left-panel">
          <div class="tab-bar">
            <button class="tab-button active" data-view="table">Table</button>
            <button class="tab-button" data-view="matrix">Matrix</button>
            <button class="tab-button" data-view="trends">Trends</button>
            <span class="settings-icon" title="Edit League Settings">⚙️</span>
          </div>
          <div class="view-container" id="desktop-table-view">
            <div class="title title-with-filter">
              <span>{{title}}</span>
              <select id="table-filter-select" class="table-view-filter">
                <option value="overall" {{overallSelected}}>Overall</option>
                <option value="home" {{homeSelected}}>Home</option>
                <option value="away" {{awaySelected}}>Away</option>
              </select>
            </div>
            <div class="content">
              <table>
                ${LeagueElement.TABLE_HEADER}
                <tbody>
                  {{tableRows}}
                </tbody>
              </table>
            </div>
          </div>
          <div class="view-container" id="desktop-matrix-view" style="display: none;">
            <!-- Title for matrix can be dynamic or part of renderMatrix -->
            <div class="matrix-container">
              {{matrixView}}
            </div>
          </div>
          <div class="view-container" id="desktop-trends-view" style="display: none;">
            {{trendsViewContent}}
          </div>
        </div>
        <div class="resizer"></div>
        <div class="right-panel">
          <div class="panel">
            <league-matches-upcoming id="desktop-upcoming-fixtures"></league-matches-upcoming>
            <!-- Calendar and its filter are now inside league-matches-upcoming -->
          </div>
          <div class="panel">
            <league-matches-recent id="desktop-recent-matches"></league-matches-recent>
          </div>
          <div class="panel">
            <league-matches-attention id="desktop-attention-matches"></league-matches-attention>
          </div>
        </div>
      </div>
    `;
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.data = null;
    this.selectedResultDate = null; // Retained for LeagueMatchesRecent filtering if needed
    this.leftPanelFlexBasis = null;
    this.minRightPanelPixelWidth = null;
    this.activeView = 'table'; // Default to table view
    this.pointsOverTimeChartData = null;
    this.selectedTeamsForGraph = new Set();
    this.teamColors = {};
    this.activeTrendGraphType = 'pointsOverTime';
    this.tableFilter = 'overall'; // Default filter state
    this.matchModalOpen = false;
    this.matchModalData = null;
    this.matchModalTeams = [];
    this.matchModalMode = 'new';
  }

  static get observedAttributes() {
    return ['data', 'selectedMatch'];
  }

  connectedCallback() {
    this.data = this.getAttribute('data');
    if (this.data) {
      this.loadLeagueData(this.data);
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    this.dispatchEvent(new LeagueEvent({console: [name, oldValue, newValue]}));

    if (name === 'data') {
      this.data = newValue;
      if (newValue) {
        this.loadLeagueData(newValue);
      } else {
        this.showError('data is required');
        this.dispatchEvent(new LeagueEvent({data: '',error: 'data is required'}));
      }
    } else if (name === 'selectedMatch') {
      if (newValue) {
        try {
          const matchData = JSON.parse(newValue);
          const teamsArray = (this.data && this.data.table && Array.isArray(this.data.table.leagueData))
                            ? this.data.table.leagueData.map(t => t.teamName)
                            : [];
          this.openMatchModal(matchData, teamsArray, 'edit');
        } catch (error) {
          console.error('Error parsing match data for selectedMatch attribute:', error);
        }
      }
    }
  }

  async loadLeagueData(data) {
    try {
      // Parse data if it's a string
      console.log('[loadLeagueData] Started. Data type:', typeof data);
      if (typeof data === 'string') {
        try {
          this.data = JSON.parse(data);
        } catch (e) {
          // If parsing fails, use the string as is (or handle as error)
          // For now, we'll assume if it's a string it should be parseable or it's an error state
          this.showError('Invalid data format: Expected JSON object or stringified JSON.');
          this.dispatchEvent(new LeagueEvent({ data: '', error: 'Invalid data format' }));
          return;
        }
      } else {
        // If it's already an object, use it directly
        this.data = data;
      }

      // Basic validation of the data structure needed for trends
      if (!this.data || typeof this.data !== 'object' || !this.data.table || !Array.isArray(this.data.table.leagueData) || !Array.isArray(this.data.matches)) {
        // this.showError('League data is missing or incomplete for trends analysis.');
        // Don't fully block rendering, but trends might be empty or show an error later
        console.warn('League data is missing or incomplete for trends analysis. Trends tab might not display correctly.');
      } else {
        // Proceed with data preparation for trends if essential data is present
        this.ensureTeamColors(); 
        this._preparePointsOverTimeData();

        // Initialize selectedTeamsForGraph with top 3 teams if possible
        this.selectedTeamsForGraph.clear(); // Clear previous selections
        if (this.data.table.leagueData.length > 0) {
          const sortedTeams = [...this.data.table.leagueData].sort((a, b) => b.points - a.points);
          for (let i = 0; i < Math.min(sortedTeams.length, 3); i++) {
            this.selectedTeamsForGraph.add(sortedTeams[i].teamName);
          }
        }
      }
      
      this.render();
      // Dispatch success event
      this.dispatchEvent(new LeagueEvent({data: this.data}));
    } catch (error) {
      const errorMessage = 'Failed to load league data';
      this.showError(errorMessage);
      console.error('Error loading league:', error);
      
      // Dispatch error event
      this.dispatchEvent(new LeagueEvent({data,error: errorMessage}));
    }
  }

  showError(message) {
    const content = this.shadow.querySelector('.content');
    if (content) {
      content.innerHTML = `<div class="error">${message}</div>`;
    }
  }

  // Helper method to replace placeholders in template
  _fillTemplate(template) {
    // Check if paging controls should be visible
    // const showFixturesPaging = this.upcomingFixturesPage > 0 || this._upcomingFixturesHasNext(); // Moved to LeagueMatchesUpcoming
    // const showAttentionPaging = this.attentionMatchesPage > 0 || this._attentionMatchesHasNext(); // Moved to LeagueMatchesAttention
    
    const currentTitle = (this.data && this.data.name ? this.data.name : 'League Table') || 'League Table';

    return template
      .replace(/\{\{title\}\}/g, currentTitle)
      .replace('{{tableRows}}', this.tableRows)
      // .replace('{{upcomingFixtures}}', this.renderUpcomingFixtures()) // Handled by LeagueMatchesUpcoming element
      // .replace('{{fixturesPrevDisabled}}', this.upcomingFixturesPage === 0 ? 'disabled' : '')
      // .replace('{{fixturesNextDisabled}}', this._upcomingFixturesHasNext() ? '' : 'disabled')
      // .replace('{{showFixturesPaging}}', showFixturesPaging ? '' : 'style="display: none;"')
      // .replace('{{calendar}}', this.renderCalendar()) // Moved to LeagueMatchesUpcoming
      // .replace('{{calendarFilter}}', this.renderCalendarFilter()) // Moved to LeagueMatchesUpcoming
      // .replace('{{attentionMatches}}', this.renderMatchesRequiringAttention()) // Handled by LeagueMatchesAttention element
      // .replace('{{attentionPrevDisabled}}', this.attentionMatchesPage === 0 ? 'disabled' : '')
      // .replace('{{attentionNextDisabled}}', this._attentionMatchesHasNext() ? '' : 'disabled')
      // .replace('{{showAttentionPaging}}', showAttentionPaging ? '' : 'style="display: none;"')
      .replace('{{matrixView}}', this.activeView === 'matrix' ? this.renderMatrix() : '')
      .replace('{{trendsViewContent}}', this.activeView === 'trends' ? this.renderTrendsViewContent() : '')
      .replace('{{overallSelected}}', this.tableFilter === 'overall' ? 'selected' : '')
      .replace('{{homeSelected}}', this.tableFilter === 'home' ? 'selected' : '')
      .replace('{{awaySelected}}', this.tableFilter === 'away' ? 'selected' : '');
  }

  render() {
    // Generate table rows based on data if available
    let tableRows = '';
    const isMobile = this.getAttribute('isMobile') === 'true';
    console.log('[LeagueElement] render START. isMobile:', isMobile);
    
    if (this.data && this.data.table) {
      const processedLeagueData = this._getFilteredLeagueData();

      if (Array.isArray(processedLeagueData)) {
        tableRows = processedLeagueData.map(team => {
          let positionCellClass = 'pos-cell-default';
          
          // Apply promotion/relegation styling ONLY if mode is 'overall'
          // and based on league settings and the team's current rank in the displayed table.
          if (this.tableFilter === 'overall') {
            if (this.data && this.data.settings && processedLeagueData.length > 0) {
              const numTeams = processedLeagueData.length;
              const promotionSpots = parseInt(this.data.settings.promotionPositions, 10) || 0;
              const relegationSpots = parseInt(this.data.settings.relegationPositions, 10) || 0;

              // team.currentRank is 1-indexed and reflects the rank in the currently displayed table
              if (promotionSpots > 0 && team.currentRank <= promotionSpots) {
                positionCellClass = 'pos-cell-promotion';
              } else if (relegationSpots > 0 && team.currentRank >= (numTeams - relegationSpots + 1)) {
                // This condition correctly identifies teams in relegation spots from the bottom.
                // e.g., if 10 teams and 2 relegation spots, teams ranked 9 and 10 are caught.
                // (10 - 2 + 1 = 9). So rank >= 9.
                positionCellClass = 'pos-cell-relegation';
              }
            }
          }

          // Generate movement indicator HTML
          const movementIndicator = this.renderRankMovementIndicator(team.rankMovement);

          // Row class for promotion/relegation is removed here
          return `
          <tr> 
            <td class="position-cell ${positionCellClass}">${team.currentRank !== undefined ? team.currentRank : '-'} ${movementIndicator}</td>
            <td>${team.teamName}</td>
            <td>${team.points}</td>
            <td title="${this.formatMatchList(team.allMatchesForTooltip, undefined, true)}">${team.played}</td>
            <td title="${this.formatMatchList(team.allMatchesForTooltip, 'W', false)}">${team.won}</td>
            <td title="${this.formatMatchList(team.allMatchesForTooltip, 'D', false)}">${team.drawn}</td>
            <td title="${this.formatMatchList(team.allMatchesForTooltip, 'L', false)}">${team.lost}</td>
            <td>${team.shotsFor}</td>
            <td>${team.shotsAgainst}</td>
            <td>${team.shotDifference}</td>
            <td class="form-cell">${this.renderForm(team.matches)}</td>
          </tr>
        `; // Note: The template literal for each row ends here
        }).join(''); // .join('') should be called on the result of .map()
      } else {
        tableRows = `
          <tr>
            <td colspan="11">Error loading filtered table data.</td>
          </tr>`;
      }

      // Store the title and tableRows for use in templates
      this.tableRows = tableRows;

      // Render based on device type
      const baseTemplate = isMobile ? LeagueElement.MOBILE_TEMPLATE : LeagueElement.DESKTOP_TEMPLATE;
      this.shadow.innerHTML = `
        <style>${isMobile ? LeagueElement.MOBILE_STYLES : LeagueElement.DESKTOP_STYLES}</style>
        ${this._fillTemplate(baseTemplate)}
      `;
      
      // Configure the recent matches components
      const recentMatchesElement = this.shadow.querySelector(isMobile ? '#mobile-recent-matches' : '#desktop-recent-matches');
      if (recentMatchesElement) {
        recentMatchesElement.setAttribute('is-mobile', isMobile);
        recentMatchesElement.setAttribute('data', JSON.stringify(this.data.matches));
        if (this.selectedResultDate) {
          recentMatchesElement.setAttribute('selected-date', this.selectedResultDate);
        }
        
        recentMatchesElement.removeEventListener('league-matches-recent-event', this._handleRecentMatchClick);
        this._handleRecentMatchClickBound = this._handleRecentMatchClick.bind(this);
        recentMatchesElement.addEventListener('league-matches-recent-event', this._handleRecentMatchClickBound);
      }
      
      // Configure the attention matches components
      const attentionMatchesElement = this.shadow.querySelector(isMobile ? '#mobile-attention-matches' : '#desktop-attention-matches');
      if (attentionMatchesElement) {
        attentionMatchesElement.setAttribute('is-mobile', isMobile);
        attentionMatchesElement.setAttribute('data', JSON.stringify(this.data.matches));

        attentionMatchesElement.removeEventListener('league-matches-attention-event', this._handleAttentionMatchClick);
        this._handleAttentionMatchClickBound = this._handleAttentionMatchClick.bind(this);
        attentionMatchesElement.addEventListener('league-matches-attention-event', this._handleAttentionMatchClickBound);
      }
      
      if (!isMobile) {
        const renderedLeftPanel = this.shadow.querySelector('.left-panel');
        if (renderedLeftPanel && this.leftPanelFlexBasis) {
          renderedLeftPanel.style.flex = this.leftPanelFlexBasis;
        }
        this.setupResizer();
      }
      this.setupPaging(); // Paging for sub-components is handled by them
      // this.setupCalendar(); // Calendar is now in LeagueMatchesUpcoming
      this.setupTabs();
      this.setupTableFilterDropdown();
      if (this.activeView === 'trends') { // If trends tab is active by default (e.g. on reload/state persistence)
        this.setupTrendsViewInteractivity(); // Ensure interactivity is set up
      }

      console.log('[LeagueElement] render: Attempting to find upcomingFixturesElement');
      // Configure the upcoming fixtures component
      const upcomingFixturesElement = this.shadow.querySelector(isMobile ? '#mobile-upcoming-fixtures' : '#desktop-upcoming-fixtures');
      if (upcomingFixturesElement) {
        console.log('[LeagueElement] render: upcomingFixturesElement FOUND.');
        upcomingFixturesElement.setAttribute('is-mobile', isMobile.toString());
        if (this.data && this.data.matches) {
            console.log('[LeagueElement] render: Setting data attribute on upcomingFixturesElement with:', JSON.stringify(this.data.matches).substring(0,100) + '...');
            upcomingFixturesElement.setAttribute('data', JSON.stringify(this.data.matches));
            console.log('[LeagueElement] render: data attribute SET on upcomingFixturesElement.');
        } else {
            console.log('[LeagueElement] render: this.data.matches is NOT available for upcomingFixturesElement.');
        }
        // Listen to date changes from the upcoming fixtures calendar
        upcomingFixturesElement.removeEventListener('league-matches-upcoming-event', this._handleUpcomingFixtureDateChange); // Remove if it was mistakenly added for date changes before
        upcomingFixturesElement.addEventListener('league-matches-upcoming-event', this._handleUpcomingFixtureDateChange); // Keep for date changes
        
        // Add listener for match clicks
        this._handleUpcomingMatchClickBound = this._handleUpcomingMatchClick.bind(this);
        upcomingFixturesElement.removeEventListener('league-matches-upcoming-event', this._handleUpcomingMatchClickBound); // Remove previous if any
        upcomingFixturesElement.addEventListener('league-matches-upcoming-event', this._handleUpcomingMatchClickBound); // Listen for general events

      }
    } else {
      // Show error if data is missing or invalid
      this.shadow.innerHTML = `<div class="error">Invalid or missing league data</div>`;
    }

    // After main content rendering:
    if (this.matchModalOpen) {
      // Remove any existing modal first
      let modal = this.shadow.querySelector('league-match');
      if (modal) modal.remove();
      modal = document.createElement('league-match');
      modal.match = this.matchModalData;
      modal.teams = (this.data && this.data.table && Array.isArray(this.data.table.leagueData)) ? this.data.table.leagueData.map(t => t.teamName) : [];
      modal.open = true;
      modal.isMobile = this.getAttribute('isMobile') === 'true';
      modal.mode = this.matchModalMode;
      modal.addEventListener('match-save', (e) => {
        const savedMatch = e.detail.match;
        if (!this.data || !this.data.matches) {
          // Should not happen if modal was opened with data, but safety check
          console.error('Cannot save match, league data or matches array is missing.');
          this.closeMatchModal();
          return;
        }

        const updatedLeagueData = JSON.parse(JSON.stringify(this.data));
        const matchIndex = updatedLeagueData.matches.findIndex(m => m.key === savedMatch.key);

        if (matchIndex > -1) {
          // Existing match, update it
          updatedLeagueData.matches[matchIndex] = savedMatch;
        } else {
          // New match (could be from matrix with a temp key, or a completely new match if UI allowed)
          // The parent/handler of requestUpdateLeague will be responsible for assigning a final key if temp
          updatedLeagueData.matches.push(savedMatch);
        }
        
        this.data = updatedLeagueData; // Update internal state
        this.dispatchEvent(new LeagueEvent({ type: 'requestUpdateLeague', league: this.data }));
        this.loadLeagueData(this.data); // Reprocess and re-render
        this.closeMatchModal();
      });
      modal.addEventListener('match-cancel', () => {
        this.closeMatchModal();
      });
      this.shadow.appendChild(modal);
    } else {
      // Remove modal if not open
      let modal = this.shadow.querySelector('league-match');
      if (modal) modal.remove();
    }
  }

  setupPaging() {
    // Setup Settings icon click event
    const settingsIcons = this.shadow.querySelectorAll('.settings-icon');
    settingsIcons.forEach(icon => {
      icon.onclick = () => {
        this.dispatchEvent(new LeagueEvent({
          type: 'editLeague',
          league: this.data
        }));
      };
    });
    
    // Upcoming Fixtures paging is now handled by LeagueMatchesUpcoming.js
    // Attention Matches Paging is now handled by LeagueMatchesAttention.js

    // Match links from sub-components will be handled by them dispatching events
    // if LeagueElement needs to act (e.g. open a modal from a central place)
  }

  setupResizer() {
    const resizer = this.shadow.querySelector('.resizer');
    const leftPanel = this.shadow.querySelector('.left-panel');
    const rightPanel = this.shadow.querySelector('.right-panel');
    
    if (!resizer || !leftPanel || !rightPanel) {
      console.warn('Resizer or panels not found, skipping setupResizer.');
      return;
    }

    // Calculate and store minimum right panel width if not already done (first-time setup)
    if (this.minRightPanelPixelWidth === null) {
      const initialRightWidth = rightPanel.getBoundingClientRect().width;
      const ASSUMED_INITIAL_RIGHT_PANEL_WIDTH_PX = 300; // Increased fallback
      this.minRightPanelPixelWidth = 
        (initialRightWidth > 0 ? initialRightWidth : ASSUMED_INITIAL_RIGHT_PANEL_WIDTH_PX) * 1.0; // Changed multiplier to 1.0
    }

    let x = 0;
    let leftWidthAtMouseDown = 0;

    const mouseDownHandler = (e) => {
      x = e.clientX;
      leftWidthAtMouseDown = leftPanel.getBoundingClientRect().width;

      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
    };

    const mouseMoveHandler = (e) => {
      const dx = e.clientX - x;
      const hostWidth = this.shadow.host.getBoundingClientRect().width;
      
      if (hostWidth === 0) return;

      let finalLeftPanelPixelWidth = leftWidthAtMouseDown + dx;

      // 1. Apply left panel's own min/max percentage constraints
      const minLeftPanelBoundPx = hostWidth * 0.20;
      const maxLeftPanelBoundPx = hostWidth * 0.80;
      finalLeftPanelPixelWidth = Math.max(minLeftPanelBoundPx, finalLeftPanelPixelWidth);
      finalLeftPanelPixelWidth = Math.min(maxLeftPanelBoundPx, finalLeftPanelPixelWidth);

      // 2. Apply right panel's minimum pixel width constraint (if set)
      if (this.minRightPanelPixelWidth !== null && this.minRightPanelPixelWidth > 0) {
        const maxAllowedLeftForRightMinPx = hostWidth - this.minRightPanelPixelWidth;
        finalLeftPanelPixelWidth = Math.min(finalLeftPanelPixelWidth, maxAllowedLeftForRightMinPx);
      }
      
      // 3. Re-ensure left panel meets its own minimum after adjustments for right panel
      finalLeftPanelPixelWidth = Math.max(minLeftPanelBoundPx, finalLeftPanelPixelWidth);
      
      // Convert final pixel width to percentage for flex-basis
      const newLeftFlexPercentage = (finalLeftPanelPixelWidth / hostWidth) * 100;
      
      leftPanel.style.flex = `0 0 ${newLeftFlexPercentage}%`;
    };

    const mouseUpHandler = () => {
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
      if (leftPanel) {
        this.leftPanelFlexBasis = leftPanel.style.flex;
      }
    };

    resizer.addEventListener('mousedown', mouseDownHandler);
  }

  /**
   * Renders the form icons with tooltips for recent matches.
   * @param {Array<Object>|string} [matches=[]] - An array of recent match objects or a form string
   *                                Each object should have 'result' (W/D/L)
   *                                and 'description' (the tooltip text).
   * @returns {string} HTML string for the form icons.
   */
  renderForm(matches = []) {
    // Check if matches data is valid
    if (!Array.isArray(matches)) {
        // Check if the data passed might be the old form string for backward compatibility or error state
        if (typeof matches === 'string') {
            const matchesStr = String(matches); // Ensure it's a string
            if (matchesStr.length <= 5) {
                console.warn('Received string instead of matches array for form rendering. Displaying basic icons.');
                // Fallback to basic rendering if it looks like a form string
                return matchesStr.split('').map(result => {
                    const lowerResult = result.toLowerCase();
                    let symbol = '?';
                    if (lowerResult === 'w') symbol = '✔';
                    if (lowerResult === 'd') symbol = '-';
                    if (lowerResult === 'l') symbol = '✖';
                    // No title attribute in this fallback
                    return `<span class="form-icon form-${lowerResult}">${symbol}</span>`;
                }).join('');
            }
        }
        console.warn('Invalid matches data provided to renderForm:', matches);
        return ''; // Return empty string for other invalid data
    }
  
    return matches.map(match => {
      // Ensure match object and properties exist
      if (!match || typeof match.result !== 'string' || typeof match.description !== 'string') {
          console.warn('Invalid match object within matches array:', match);
          // Add a title attribute indicating invalid data for the placeholder too
          return '<span class="form-icon" title="Invalid match data">?</span>'; 
      }
  
      const lowerResult = match.result.toLowerCase();
      let symbol = '?';
      // Use match.result to determine symbol and class
      if (lowerResult === 'w') symbol = '✔';
      if (lowerResult === 'd') symbol = '-';
      if (lowerResult === 'l') symbol = '✖';
  
      // Add the title attribute with escaped match.description for the tooltip
      // Symbol is removed to allow CSS to render a colored block
      return `<span class="form-icon form-${lowerResult}" title="${this.escapeHtml(match.description)}"></span>`;
    }).join('');
  }

  /**
   * Basic HTML escaping function to prevent XSS issues in tooltips.
   * @param {string} unsafe - The string to escape.
   * @returns {string} The escaped string.
   */
  escapeHtml(unsafe = '') {
      // Ensure input is a string
      const str = String(unsafe);
      return str
           .replace(/&/g, "&amp;")
           .replace(/</g, "&lt;")
           .replace(/>/g, "&gt;")
           .replace(/"/g, "&quot;")
           .replace(/'/g, "&#039;");
  }

  /**
   * Formats a list of matches for tooltip display.
   * If resultType is provided, only matches of that type are included.
   * If not, all matches are included.
   * @param {Array<Object>} matches - Array of match objects
   * @param {string} [resultType] - Optional: 'W', 'D', or 'L'
   * @param {boolean} [displayVerb=true] - Whether to show the verb (Won/Lost/Drew)
   * @returns {string} Tooltip string
   */
  formatMatchList(matches = [], resultType, displayVerb = true) {
    if (!Array.isArray(matches) || matches.length === 0) {
      if (resultType) {
        return `No ${resultType === 'W' ? 'wins' : resultType === 'L' ? 'losses' : 'draws'} recorded`;
      }
      return 'No matches played';
    }

    // Filter if resultType is provided
    let filtered = matches;
    if (resultType) {
      filtered = matches.filter(
        match => match && match.result && match.result.toUpperCase() === resultType
      );
    }

    // Sort by date ascending - matches should already have a valid 'date' property
    filtered = [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));

    const tooltipContent = filtered.map(match => {
      if (!match || !match.result || !match.date || !match.homeTeamName || !match.awayTeamName || typeof match.homeScore !== 'number' || typeof match.awayScore !== 'number') {
        return 'Invalid match data for tooltip';
      }
      let resultVerb = '';
      if (match.result.toUpperCase() === 'W') resultVerb = 'Won';
      else if (match.result.toUpperCase() === 'L') resultVerb = 'Lost';
      else if (match.result.toUpperCase() === 'D') resultVerb = 'Drew';

      const dateStr = new Date(match.date).toLocaleDateString();
      const matchDetails = `${match.homeTeamName} ${match.homeScore}-${match.awayScore} ${match.awayTeamName}`;
      return `${displayVerb ? resultVerb + ' ' : ''}${matchDetails} on ${dateStr}`;
    }).join('\n');

    if (!tooltipContent) {
      if (resultType) {
        return `No ${resultType === 'W' ? 'wins' : resultType === 'L' ? 'losses' : 'draws'} recorded`;
      }
      return 'No matches played';
    }

    return this.escapeHtml(tooltipContent);
  }

  // Add the new helper method here
  _getConflictingMatchKeys() {
    if (!this.data?.matches) return new Set();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    // 1. Filter for future matches without results
    const futureFixtures = this.data.matches.filter(match => {
        if (match.result || !match.date) return false;
        const matchDate = new Date(match.date);
        matchDate.setHours(0, 0, 0, 0);
        return matchDate.getTime() >= todayTimestamp;
    });

    // 2. Group by date (using timestamp as key)
    const matchesByDate = futureFixtures.reduce((acc, match) => {
        const matchDate = new Date(match.date);
        matchDate.setHours(0, 0, 0, 0);
        const dateKey = matchDate.getTime();
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(match);
        return acc;
    }, {});

    const conflictingKeys = new Set();

    // 3. Check each date for conflicts
    for (const dateKey in matchesByDate) {
        const matchesOnDay = matchesByDate[dateKey];
        if (matchesOnDay.length < 2) continue; // Need at least 2 matches to have a conflict

        const teamCounts = {};
        matchesOnDay.forEach(match => {
            teamCounts[match.homeTeamName] = (teamCounts[match.homeTeamName] || 0) + 1;
            teamCounts[match.awayTeamName] = (teamCounts[match.awayTeamName] || 0) + 1;
        });

        // Find teams playing more than once on this day
        const conflictingTeams = Object.keys(teamCounts).filter(team => teamCounts[team] > 1);

        // If conflicts exist, add keys of all matches involving those teams on that day
        if (conflictingTeams.length > 0) {
            matchesOnDay.forEach(match => {
                if (conflictingTeams.includes(match.homeTeamName) || conflictingTeams.includes(match.awayTeamName)) {
                    conflictingKeys.add(match.key);
                }
            });
        }
    }

    return conflictingKeys;
  }

  _getMatchesRequiringAttention() {
    // This method logic will be in LeagueMatchesAttention.js
    // For now, assuming it was similar to _upcomingFixturesHasNext
    // const list = this._getMatchesRequiringAttention();
    // return (this.attentionMatchesPage + 1) * 5 < list.length;
    return []; // Placeholder, as the actual component will manage this
  }

  // Render matches requiring attention
  renderMatchesRequiringAttention() {
    // This method logic will be in LeagueMatchesAttention.js
    // For now, assuming it was similar to _upcomingFixturesHasNext
    // const matches = this._getMatchesRequiringAttention();
    // const start = this.attentionMatchesPage * 5;
    // const pageItems = matches.slice(start, start + 5);
    // if (pageItems.length === 0) {
    //     if (matches.length > 0) { // Items exist, but current page is empty
    //         return '<div class="match-item">No more matches requiring attention</div>';
    //     }
    //     return '<div class="match-item">No matches requiring attention</div>';
    // }
    // const today = new Date();
    // today.setHours(0, 0, 0, 0);
    // const conflictingMatchKeys = this._getConflictingMatchKeys(); // Get conflicting keys again for rendering logic
    // return pageItems.map(match => {
    //   const matchKey = match.key || `${match.homeTeamName}_${match.awayTeamName}_unscheduled`;
    //   let warning = '';
    //   let tooltipText = '';
    //   
    //   if (match.result && match.date) { // Case 1: Future date with result
    //     const matchDate = new Date(match.date);
    //     matchDate.setHours(0, 0, 0, 0);
    //     if (matchDate > today) {
    //       tooltipText = "Result entered for a future match date";
    //       warning = `<span title="${tooltipText}" style="color:#f39c12;font-size:1.2em;vertical-align:middle;margin-right:0.5em;">&#9888;</span>`; // Orange warning
    //     }
    //   } else if (conflictingMatchKeys.has(match.key)) { // Case 2: Scheduling conflict
    //      tooltipText = "Scheduling conflict on this date.";
    //      warning = `<span title="${tooltipText}" style="color:#e67e22;font-size:1.2em;vertical-align:middle;margin-right:0.5em;">&#9888;</span>`; // Different Orange/Red warning maybe?
    //   } else if (match.date && !match.result) { // Case 3: Past date, no result
    //     const matchDate = new Date(match.date);
    //     matchDate.setHours(0, 0, 0, 0);
    //     if (matchDate < today) {
    //       tooltipText = "Match date passed, result pending.";
    //       warning = `<span title="${tooltipText}" style="color:#e74c3c;font-size:1.2em;vertical-align:middle;margin-right:0.5em;">&#9203;</span>`; // Hourglass icon
    //     }
    //   } else if (!match.date && !match.result) { // Case 4: No date and no result
    //     tooltipText = "No date set for match";
    //     warning = `<span title="${tooltipText}" style="color:#2196f3;font-size:1.2em;vertical-align:middle;margin-right:0.5em;">&#128197;</span>`; // Calendar icon
    //   }
    //   
    //   const titleAttr = tooltipText ? ` title="${this.escapeHtml(tooltipText)}"` : '';
    //   const dataAttr = tooltipText ? ` data-attention-reason="${this.escapeHtml(tooltipText)}"` : '';
    //   
    //   return `
    //     <div class="match-item">
    //       ${warning}<a href="#" class="match-link" data-match-key="${matchKey}"${titleAttr}${dataAttr}>
    //         ${match.homeTeamName} vs ${match.awayTeamName}
    //       </a>
    //     </div>
    //   `;
    // }).join('');
    return '<div class="match-item">No matches requiring attention</div>';
  }

  // Render calendar
  renderCalendar() {
    // This method logic will be in LeagueMatchesUpcoming.js
    // For now, assuming it was similar to _upcomingFixturesHasNext
    // const year = this.calendarDate.getFullYear();
    // const month = this.calendarDate.getMonth();
    // const matchDates = this._getMatchDates();
    // const resultDates = this._getResultDates();
    // 
    // // Get first day of month and total days
    // const firstDay = new Date(year, month, 1);
    // const lastDay = new Date(year, month + 1, 0);
    // const totalDays = lastDay.getDate();
    // 
    // // Get starting day of week (0 = Sunday)
    // const startDay = firstDay.getDay();
    // 
    // // Get previous month's last days
    // const prevMonthLastDay = new Date(year, month, 0).getDate();
    // 
    // // Generate calendar grid
    // let calendarHTML = `
    //   <div class="calendar-header">
    //     <span class="calendar-nav" id="calendar-prev">&lt;</span>
    //     <span>${firstDay.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
    //     <span class="calendar-nav" id="calendar-next">&gt;</span>
    //   </div>
    //   <div class="calendar-grid">
    //     <div>Su</div>
    //     <div>Mo</div>
    //     <div>Tu</div>
    //     <div>We</div>
    //     <div>Th</div>
    //     <div>Fr</div>
    //     <div>Sa</div>
    // `;
    // 
    // // Add previous month's days
    // for (let i = startDay - 1; i >= 0; i--) {
    //   const day = prevMonthLastDay - i;
    //   calendarHTML += `<div class="calendar-day other-month">${day}</div>`;
    // }
    // 
    // // Add current month's days
    // const today = new Date();
    // today.setHours(0, 0, 0, 0);
    // 
    // for (let day = 1; day <= totalDays; day++) {
    //   const date = new Date(year, month, day);
    //   date.setHours(0, 0, 0, 0);
    //   const isToday = date.getTime() === today.getTime();
    //   const hasMatch = matchDates.has(date.getTime());
    //   const hasResult = resultDates.has(date.getTime());
    //   const isSelected = this.selectedDate && date.getTime() === this.selectedDate.getTime();
    //   
    //   let classes = ['calendar-day'];
    //   if (isToday) classes.push('today');
    //   if (hasMatch) classes.push('has-match');
    //   if (hasResult) classes.push('has-result');
    //   if (isSelected) classes.push('selected');
    //
    //   // Style for days
    //   let style = '';
    //   if (hasResult && hasMatch) {
    //     // Split diagonal background: green for result, blue for fixture
    //     style = 'background: linear-gradient(135deg, #c8e6c9 50%, #bbdefb 50%); border: 2px solid #388e3c; font-weight: bold;';
    //   } else if (hasResult) {
    //     style = 'background-color: #c8e6c9; border: 2px solid #388e3c; font-weight: bold;';
    //   } else if (hasMatch) {
    //     style = 'background-color: #bbdefb; border: 2px solid #1976d2; font-weight: bold;';
    //   }
    //
    //   // Tooltip logic
    //   let tooltip = '';
    //   if (this.data?.matches) {
    //     const matchesOnDay = this.data.matches.filter(match => {
    //       if (!match.date) return false;
    //       const matchDate = new Date(match.date);
    //       matchDate.setHours(0, 0, 0, 0);
    //       return matchDate.getTime() === date.getTime();
    //     });
    //     const results = matchesOnDay.filter(m => m.result);
    //     const fixtures = matchesOnDay.filter(m => !m.result);
    //
    //     let tooltipLines = [];
    //     if (results.length > 0) {
    //       tooltipLines.push('Results:');
    //       tooltipLines.push(...results.map(m => `${m.homeTeamName} ${m.result.homeScore}\u2013${m.result.awayScore} ${m.awayTeamName}`));
    //     }
    //     if (fixtures.length > 0) {
    //       if (results.length > 0) tooltipLines.push(''); // blank line between
    //       tooltipLines.push('Fixtures:');
    //       tooltipLines.push(...fixtures.map(m => `${m.homeTeamName} vs ${m.awayTeamName}`));
    //     }
    //     if (tooltipLines.length > 0) {
    //       tooltip = 'title="' + this.escapeHtml(tooltipLines.join('\n')) + '"';
    //     }
    //   }
    //
    //   calendarHTML += `
    //     <div class="${classes.join(' ')}" data-date="${date.toISOString()}" style="${style}" ${tooltip}>
    //       ${day}
    //     </div>
    //   `;
    // }
    // 
    // // Add next month's days
    // const remainingDays = 42 - (startDay + totalDays); // 42 = 6 rows * 7 days
    // for (let day = 1; day <= remainingDays; day++) {
    //   calendarHTML += `<div class="calendar-day other-month">${day}</div>`;
    // }
    // 
    // calendarHTML += '</div>';
    // return calendarHTML;
    return ''; // Placeholder, as the actual component will manage this
  }

  // Render calendar filter buttons
  renderCalendarFilter() {
    // This method logic will be in LeagueMatchesUpcoming.js
    // For now, assuming it was similar to _upcomingFixturesHasNext
    // const hasFilter = this.selectedDate || this.selectedResultDate;
    // return `
    //   <button class="${!hasFilter ? 'active' : ''}" id="calendar-all">All Dates</button>
    //   ${hasFilter ? `
    //     <button id="calendar-clear">Clear Filter</button>
    //   ` : ''}
    // `;
    return ''; // Placeholder, as the actual component will manage this
  }

  // Setup calendar event listeners
  setupCalendar() {
    // This method logic will be in LeagueMatchesUpcoming.js
    // For now, assuming it was similar to _upcomingFixturesHasNext
    // const calendar = this.shadow.querySelector('.calendar');
    // if (!calendar) return;
    //
    // // Previous/Next month navigation
    // const prevBtn = calendar.querySelector('#calendar-prev');
    // const nextBtn = calendar.querySelector('#calendar-next');
    // 
    // if (prevBtn) {
    //   prevBtn.onclick = () => {
    //     this.calendarDate.setMonth(this.calendarDate.getMonth() - 1);
    //     this.render();
    //   };
    // }
    // 
    // if (nextBtn) {
    //   nextBtn.onclick = () => {
    //     this.calendarDate.setMonth(this.calendarDate.getMonth() + 1);
    //     this.render();
    //   };
    // }
    //
    // // Date selection
    // const days = calendar.querySelectorAll('.calendar-day:not(.other-month)');
    // days.forEach(day => {
    //   day.onclick = () => {
    //     const date = new Date(day.dataset.date);
    //     // Check for matches or results on this date
    //     const matchDates = this._getMatchDates();
    //     const resultDates = this._getResultDates();
    //     const dateTime = date.getTime();
    //     
    //     if (matchDates.has(dateTime)) {
    //       // Handle fixture date selection
    //       this.selectedDate = date;
    //       this.upcomingFixturesPage = 0;
    //       this.render();
    //     } else if (resultDates.has(dateTime)) {
    //       // Handle result date selection
    //       this.selectedResultDate = date;
    //       
    //       // Update the recent matches component with the selected date
    //       const isMobile = this.getAttribute('isMobile') === 'true';
    //       const recentMatchesElement = this.shadow.querySelector(isMobile ? '#mobile-recent-matches' : '#desktop-recent-matches');
    //       if (recentMatchesElement) {
    //         recentMatchesElement.setAttribute('selected-date', date.toISOString());
    //       }
    //       
    //       this.render();
    //     }
    //   };
    // });
    //
    // // Filter buttons
    // const allBtn = this.shadow.querySelector('#calendar-all');
    // const clearBtn = this.shadow.querySelector('#calendar-clear');
    // 
    // if (allBtn) {
    //   allBtn.onclick = () => {
    //     this.selectedDate = null;
    //     this.selectedResultDate = null;
    //     this.upcomingFixturesPage = 0;
    //     
    //     // Clear filter on recent matches component
    //     const isMobile = this.getAttribute('isMobile') === 'true';
    //     const recentMatchesElement = this.shadow.querySelector(isMobile ? '#mobile-recent-matches' : '#desktop-recent-matches');
    //     if (recentMatchesElement && recentMatchesElement.clearDateFilter) {
    //       recentMatchesElement.clearDateFilter();
    //     }
    //     
    //     this.render();
    //   };
    // }
    // 
    // if (clearBtn) {
    //   clearBtn.onclick = () => {
    //     this.selectedDate = null;
    //     this.selectedResultDate = null;
    //     this.upcomingFixturesPage = 0;
    //     
    //     // Clear filter on recent matches component
    //     const isMobile = this.getAttribute('isMobile') === 'true';
    //     const recentMatchesElement = this.shadow.querySelector(isMobile ? '#mobile-recent-matches' : '#desktop-recent-matches');
    //     if (recentMatchesElement && recentMatchesElement.clearDateFilter) {
    //       recentMatchesElement.clearDateFilter();
    //     }
    //     
    //     this.render();
    //   };
    // }
  }

  _attentionMatchesHasNext() {
    // This method logic will be in LeagueMatchesAttention.js
    // For now, assuming it was similar to _upcomingFixturesHasNext
    // const list = this._getMatchesRequiringAttention();
    // return (this.attentionMatchesPage + 1) * 5 < list.length;
    return false; // Placeholder, as the actual component will manage this
  }

  setupTabs() {
    const tabs = this.shadow.querySelectorAll('.tab-button');
    const tableViewDesktop = this.shadow.querySelector('#desktop-table-view');
    const matrixViewDesktop = this.shadow.querySelector('#desktop-matrix-view');
    const trendsViewDesktop = this.shadow.querySelector('#desktop-trends-view');
    const tableViewMobile = this.shadow.querySelector('#mobile-table-view');
    const matrixViewMobile = this.shadow.querySelector('#mobile-matrix-view');
    const trendsViewMobile = this.shadow.querySelector('#mobile-trends-view');

    // Part 1: Reflect current state (this.activeView) onto the DOM
    tabs.forEach(t => {
      if (t.dataset.view === this.activeView) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });

    const isTableActive = this.activeView === 'table';
    const isMatrixActive = this.activeView === 'matrix';
    const isTrendsActive = this.activeView === 'trends';

    if (tableViewDesktop) tableViewDesktop.style.display = isTableActive ? '' : 'none';
    if (matrixViewDesktop) matrixViewDesktop.style.display = isMatrixActive ? '' : 'none';
    if (trendsViewDesktop) trendsViewDesktop.style.display = isTrendsActive ? '' : 'none';
    if (tableViewMobile) tableViewMobile.style.display = isTableActive ? '' : 'none';
    if (matrixViewMobile) matrixViewMobile.style.display = isMatrixActive ? '' : 'none';
    if (trendsViewMobile) trendsViewMobile.style.display = isTrendsActive ? '' : 'none';
    
    // Part 2: Attach click handlers for future state changes
    tabs.forEach(tab => {
      tab.onclick = () => {
        if (this.activeView !== tab.dataset.view) { // Only act if view is actually changing
          this.activeView = tab.dataset.view;
          this.render(); // Change state, then re-render. Render will call setupTabs again.
          // After re-render, if the new active view is trends, set up its interactivity.
          // This ensures elements are in the DOM before attaching listeners.
          if (this.activeView === 'trends') {
            // Defer slightly to ensure DOM update cycle is complete from render()
            Promise.resolve().then(() => {
                this.setupTrendsViewInteractivity();
            });
          }
        }
      };
    });
  }

  _prepareMatrixData() {
    if (!this.data || !this.data.table || !Array.isArray(this.data.table.leagueData) || !Array.isArray(this.data.matches)) {
      return null;
    }

    const teams = [...new Set(this.data.table.leagueData.map(t => t.teamName))].sort();
    const matchesMap = new Map();
    this.data.matches.forEach(match => {
      // Ensure matches are mapped consistently, e.g., always home vs away based on names
      // This simple keying assumes homeTeamName and awayTeamName are reliably present.
      if (match.homeTeamName && match.awayTeamName) {
        matchesMap.set(`${match.homeTeamName}_vs_${match.awayTeamName}`, match);
      }
    });

    const matrix = {};
    teams.forEach(homeTeam => {
      matrix[homeTeam] = {};
      teams.forEach(awayTeam => {
        let match = null;
        let status = 'none';
        let tooltip = '';
        const matchKey = `${homeTeam}_vs_${awayTeam}`;

        if (homeTeam === awayTeam) {
          status = 'same';
          tooltip = '-';
        } else if (matchesMap.has(matchKey)) {
          match = matchesMap.get(matchKey);
          if (match.result && typeof match.result.homeScore === 'number' && typeof match.result.awayScore === 'number') {
            status = 'played';
            tooltip = `${new Date(match.date).toLocaleDateString()}: ${match.homeTeamName} ${match.result.homeScore} - ${match.result.awayScore} ${match.awayTeamName}`;
          } else {
            status = 'scheduled';
            tooltip = match.date ? `Scheduled: ${new Date(match.date).toLocaleDateString()}` : 'Scheduled (No date)';
          }
        } else {
          status = 'none';
          tooltip = `${homeTeam} vs ${awayTeam} - No match scheduled`;
        }
        matrix[homeTeam][awayTeam] = { match, status, tooltip };
      });
    });

    return { teams, matrix };
  }

  renderMatrix() {
    const matrixData = this._prepareMatrixData();

    if (!matrixData) {
      return '<div class="error">Matrix data is unavailable or incomplete.</div>';
    }

    const { teams, matrix } = matrixData;
    if (teams.length === 0) {
        return '<div class="error">No teams available for matrix.</div>';
    }

    const isMobile = this.getAttribute('isMobile') === 'true';
    const cellSize = isMobile ? '60px' : '80px'; // Adjusted desktop size
    const numColumns = 1 + teams.length;
    const gridMinWidth = numColumns * parseFloat(cellSize); // Calculate min-width for the grid

    let html = `<div class="matrix-grid" style="grid-template-columns: ${cellSize} repeat(${teams.length}, ${cellSize}); min-width: ${gridMinWidth}px;">`;

    // Header row (top-left empty cell + away teams)
    html += '<div class="matrix-cell matrix-header-cell"></div>'; // Top-left empty
    teams.forEach(awayTeam => {
      html += `<div class="matrix-cell matrix-header-cell"><div class="matrix-team-name-x">${this.escapeHtml(awayTeam)}</div></div>`;
    });

    // Matrix rows (home teams + match cells)
    teams.forEach(homeTeam => {
      html += `<div class="matrix-cell matrix-header-cell"><div class="matrix-team-name-y">${this.escapeHtml(homeTeam)}</div></div>`; // Home team header
      teams.forEach(awayTeam => {
        const cellData = matrix[homeTeam][awayTeam];
        let content = '';
        if (cellData.status === 'played') {
          content = `<span class="matrix-score">${cellData.match.result.homeScore}-${cellData.match.result.awayScore}</span>`;
        }

        html += `
          <div 
            class="matrix-cell matrix-cell-${cellData.status}" 
            data-home-team="${this.escapeHtml(homeTeam)}" 
            data-away-team="${this.escapeHtml(awayTeam)}"
          >
            ${content}
            <div class="tooltip">${this.escapeHtml(cellData.tooltip)}</div>
          </div>
        `;
      });
    });

    html += '</div>';
    // Need to defer event listener setup until after this HTML is in the DOM.
    // This can be done by calling a setup method from render() after innerHTML is set.
    // Or, more robustly, use a mutation observer or attach listeners when render() calls this.
    // For now, we will call a setup method after render.
    Promise.resolve().then(() => this.setupMatrixEventListeners());
    return html;
  }

  setupMatrixEventListeners() {
    const matrixCells = this.shadow.querySelectorAll('.matrix-grid .matrix-cell:not(.matrix-header-cell)');
    matrixCells.forEach(cell => {
      cell.onclick = () => {
        const homeTeamName = cell.dataset.homeTeam;
        const awayTeamName = cell.dataset.awayTeam;
        if (homeTeamName === awayTeamName) return;
        const matrixData = this._prepareMatrixData();
        if (!matrixData || !matrixData.matrix[homeTeamName] || !matrixData.matrix[homeTeamName][awayTeamName]) return;
        let matchObject = matrixData.matrix[homeTeamName][awayTeamName].match;
        if (!matchObject) {
          matchObject = {
            homeTeamName: homeTeamName,
            awayTeamName: awayTeamName,
            date: null,
            result: null,
            key: `temp_${homeTeamName}_vs_${awayTeamName}_${Date.now()}`
          };
        }
        // Use openMatchModal instead of event
        const teams = matrixData.teams;
        this.openMatchModal(matchObject, teams, matchObject.key && !matchObject.key.startsWith('temp_') ? 'edit' : 'new');
      };
    });
  }

  // START - Placeholder for Trends View Methods
  renderTrendsViewContent() {
    // This will be expanded in the next steps
    let teamTogglesHTML = '<p>No teams available for graphing.</p>'; // This will be removed
    let legendHTML = ''; // Legend is now fully populated by drawPointsOverTimeSVG
    let graphAreaHTML = '<svg id="points-over-time-svg" width="100%" height="100%"></svg>'; // Height 100% to fill parent

    // Data availability checks for graph area, not for toggles anymore
    if (!this.pointsOverTimeChartData || !this.pointsOverTimeChartData.dates || this.pointsOverTimeChartData.dates.length === 0) {
        if (this.pointsOverTimeChartData && this.pointsOverTimeChartData.allTeamNames && this.pointsOverTimeChartData.allTeamNames.length === 0) {
            graphAreaHTML = '<p style="text-align:center; padding-top: 20px;">Graph cannot be displayed: No team data.</p>';
        } else if (this.pointsOverTimeChartData && this.pointsOverTimeChartData.dates.length === 0 && this.pointsOverTimeChartData.allTeamNames && this.pointsOverTimeChartData.allTeamNames.length > 0) {
            graphAreaHTML = '<p style="text-align:center; padding-top: 20px;">Graph cannot be displayed: No match data with results found.</p>';
        } else {
            graphAreaHTML = '<p style="text-align:center; padding-top: 20px;">Graph cannot be displayed: Data unavailable or insufficient.</p>';
        }
    }
    
    // Defer drawing the SVG until after this content is in the DOM
    // and if the trends tab is actually active.
    if (this.activeView === 'trends') {
        Promise.resolve().then(() => {
            if (this.shadow.querySelector('#points-over-time-svg')) { // Ensure element exists
                this.drawPointsOverTimeSVG();
            }
        });
    }

    return `
      <div class="trends-view-wrapper">
        <div class="trends-controls">
          <label for="graph-type-select">Graph Type:</label>
          <select id="graph-type-select" class="trends-graph-type-select">
            <option value="pointsOverTime" selected>Points Over Time</option>
            <!-- Future graph types will be added here -->
          </select>
        </div>
        <div class="trends-content-area">
          <!-- trends-team-toggles div is removed -->
          <div class="trends-graph-area">
            ${graphAreaHTML}
          </div>
          <div class="trends-graph-legend">
            ${legendHTML} <!-- Initially empty, populated by drawPointsOverTimeSVG -->
          </div>
        </div>
      </div>
    `;
  }

  _preparePointsOverTimeData() {
    if (!this.data || 
        !this.data.matches || !Array.isArray(this.data.matches) || 
        !this.data.table || !this.data.table.leagueData || !Array.isArray(this.data.table.leagueData)) {
      console.warn('_preparePointsOverTimeData: Essential data is missing. Clearing chart data.');
      this.pointsOverTimeChartData = { dates: [], teamSeries: {}, allTeamNames: [] };
      return;
    }

    const allTeamNames = this.data.table.leagueData.map(team => team.teamName);
    if (allTeamNames.length === 0) {
      console.warn('_preparePointsOverTimeData: No teams found in leagueData. Clearing chart data.');
      this.pointsOverTimeChartData = { dates: [], teamSeries: {}, allTeamNames: [] };
      return;
    }

    const validMatches = this.data.matches.filter(match => {
      return match.date && 
             match.result && 
             typeof match.result.homeScore === 'number' && 
             typeof match.result.awayScore === 'number' &&
             allTeamNames.includes(match.homeTeamName) &&
             allTeamNames.includes(match.awayTeamName);
    });

    if (validMatches.length === 0) {
      console.warn('_preparePointsOverTimeData: No valid matches with results found for trend analysis.');
      this.pointsOverTimeChartData = { dates: [], teamSeries: {}, allTeamNames: allTeamNames };
      // Initialize series for all teams with empty points array if no dates
      allTeamNames.forEach(teamName => {
        this.pointsOverTimeChartData.teamSeries[teamName] = [];
      });
      return;
    }

    const uniqueDateTimestamps = [...new Set(
      validMatches.map(match => {
        const d = new Date(match.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
    )].sort((a, b) => a - b);

    if (uniqueDateTimestamps.length === 0) {
      // Should be caught by validMatches.length === 0, but as a safeguard
      this.pointsOverTimeChartData = { dates: [], teamSeries: {}, allTeamNames: allTeamNames };
      allTeamNames.forEach(teamName => {
        this.pointsOverTimeChartData.teamSeries[teamName] = [];
      });
      return;
    }

    this.pointsOverTimeChartData = {
      dates: uniqueDateTimestamps,
      teamSeries: {},
      allTeamNames: allTeamNames
    };

    allTeamNames.forEach(teamName => {
      this.pointsOverTimeChartData.teamSeries[teamName] = Array(uniqueDateTimestamps.length).fill(0);
    });

    const currentTeamPoints = {};
    allTeamNames.forEach(teamName => {
      currentTeamPoints[teamName] = 0;
    });

    uniqueDateTimestamps.forEach((dateTimestamp, dateIndex) => {
      validMatches.forEach(match => {
        const matchDate = new Date(match.date);
        matchDate.setHours(0, 0, 0, 0);
        const matchTimestamp = matchDate.getTime();

        if (matchTimestamp === dateTimestamp) {
          const homeTeam = match.homeTeamName;
          const awayTeam = match.awayTeamName;
          const homeScore = match.result.homeScore;
          const awayScore = match.result.awayScore;

          if (homeScore > awayScore) {
            currentTeamPoints[homeTeam] += 3;
          } else if (awayScore > homeScore) {
            currentTeamPoints[awayTeam] += 3;
          } else { // Draw
            currentTeamPoints[homeTeam] += 1;
            currentTeamPoints[awayTeam] += 1;
          }
        }
      });

      // After processing all matches for this dateTimestamp, store the cumulative points
      allTeamNames.forEach(teamName => {
        this.pointsOverTimeChartData.teamSeries[teamName][dateIndex] = currentTeamPoints[teamName];
      });
    });
    console.log("Prepared pointsOverTimeChartData:", JSON.parse(JSON.stringify(this.pointsOverTimeChartData)));
  }

  ensureTeamColors() {
    if (!this.data || !this.data.table || !Array.isArray(this.data.table.leagueData)) {
      console.warn('Cannot ensure team colors: leagueData is missing.');
      this.teamColors = {}; // Reset or ensure it's an empty object
      return;
    }

    const PREDEFINED_COLORS = [
      '#1f77b4',  // Muted Blue
      '#ff7f0e',  // Safety Orange
      '#2ca02c',  // Cooked Asparagus Green
      '#d62728',  // Brick Red
      '#9467bd',  // Muted Purple
      '#8c564b',  // Chestnut Brown
      '#e377c2',  // Raspberry Sorbet Pink
      '#7f7f7f',  // Middle Gray
      '#bcbd22',  // Curry Yellow-Green
      '#17becf',  // Dark Cyan
      '#aec7e8',  // Light Blue
      '#ffbb78',  // Light Orange
      '#98df8a',  // Light Green
      '#ff9896',  // Light Red
      '#c5b0d5',  // Light Purple
    ];

    let colorIndex = 0;
    const teams = this.data.table.leagueData;

    // First, assign colors to teams that are already in teamColors but might have an old color
    // (or ensure existing tracked teams get a color if they somehow missed out)
    // This part is more about maintaining consistency if teams are already tracked.
    // For a fresh assignment, the loop below is key.

    teams.forEach(team => {
      if (!this.teamColors[team.teamName]) {
        this.teamColors[team.teamName] = PREDEFINED_COLORS[colorIndex % PREDEFINED_COLORS.length];
        colorIndex++;
      }
    });

    // Ensure any team in selectedTeamsForGraph (even if not in current leagueData, though unlikely) has a color
    // This is a defensive step.
    this.selectedTeamsForGraph.forEach(teamName => {
      if (!this.teamColors[teamName]) {
        this.teamColors[teamName] = PREDEFINED_COLORS[colorIndex % PREDEFINED_COLORS.length];
        colorIndex++;
      }
    });
    console.log("Team colors assigned:", JSON.parse(JSON.stringify(this.teamColors)));
  }

  drawPointsOverTimeSVG() {
    const svg = this.shadow.querySelector('#points-over-time-svg');
    const legendDiv = this.shadow.querySelector('.trends-graph-legend');

    if (!svg || !legendDiv) {
      console.error('SVG or Legend container not found for trends graph.');
      return;
    }

    // Clear previous content
    svg.innerHTML = '';
    legendDiv.innerHTML = '';

    if (!this.pointsOverTimeChartData || 
        !this.pointsOverTimeChartData.dates || 
        !this.pointsOverTimeChartData.teamSeries) {
      svg.innerHTML = '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">Graph data is unavailable.</text>';
      legendDiv.innerHTML = '<p>Legend cannot be displayed: Data unavailable.</p>'; // Also update legend message
      return;
    }

    const { dates, teamSeries, allTeamNames } = this.pointsOverTimeChartData;

    // Always populate the legend first, so controls are available
    if (allTeamNames && allTeamNames.length > 0) {
        allTeamNames.forEach(teamName => {
            const color = this.teamColors[teamName] || '#ccc';
            const isChecked = this.selectedTeamsForGraph.has(teamName);

            const legendItemLabel = document.createElement('label');
            legendItemLabel.className = 'legend-item';
            legendItemLabel.title = `Toggle visibility for ${this.escapeHtml(teamName)}`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'trends-team-toggle-cb';
            checkbox.value = teamName;
            checkbox.checked = isChecked;
            
            const colorBox = document.createElement('span');
            colorBox.className = 'legend-color-box';
            colorBox.style.backgroundColor = color;

            const nameSpan = document.createElement('span');
            nameSpan.textContent = this.escapeHtml(teamName);

            legendItemLabel.appendChild(checkbox);
            legendItemLabel.appendChild(colorBox);
            legendItemLabel.appendChild(nameSpan);
            legendDiv.appendChild(legendItemLabel);
        });
    } else {
        legendDiv.innerHTML = '<p>No teams available for legend.</p>';
        // If no teams at all, SVG also can reflect this, though earlier checks might catch it.
        svg.innerHTML = '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">No teams available in data.</text>';
        return; // Nothing further to draw if no teams
    }

    if (dates.length === 0) {
      svg.innerHTML = '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">No dates available for graphing.</text>';
      // Legend is already populated, so just return for SVG part
      return;
    }

    const selectedTeams = Array.from(this.selectedTeamsForGraph);
    if (selectedTeams.length === 0) {
      svg.innerHTML = '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">No teams selected for the graph. Use legend to select.</text>';
      // Legend is populated, SVG message is set, so return.
      return;
    }

    // Dimensions and margins
    const svgWidth = svg.clientWidth;
    const svgHeight = svg.clientHeight;
    const margin = { top: 20, right: 20, bottom: 50, left: 50 }; // Adjusted bottom for date labels
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    if (width <= 0 || height <= 0) { // Not enough space to draw
        svg.innerHTML = '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">Not enough space to render graph.</text>';
        return;
    }

    // Create main group element
    const mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    mainGroup.setAttribute('transform', `translate(${margin.left},${margin.top})`);
    svg.appendChild(mainGroup);

    // Scales
    const minDate = dates[0];
    const maxDate = dates[dates.length - 1];
    
    let maxPoints = 0;
    selectedTeams.forEach(teamName => {
      if (teamSeries[teamName]) {
        const teamMaxPoints = Math.max(...teamSeries[teamName], 0);
        if (teamMaxPoints > maxPoints) maxPoints = teamMaxPoints;
      }
    });
    if (maxPoints === 0 && dates.length > 0) maxPoints = 10; // Default if all points are 0 but there are dates
    if (selectedTeams.length > 0 && maxPoints === 0 && dates.length === 0 ) {
        // This case should be caught earlier, but as a fallback
        svg.innerHTML = '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">No data points to plot.</text>';
        return;
    }

    const xScale = (date) => (date - minDate) / (maxDate - minDate || 1) * width;
    const yScale = (points) => height - (points / (maxPoints || 1)) * height;

    // Helper to create SVG elements
    const createSVGElement = (name, attributes) => {
      const el = document.createElementNS('http://www.w3.org/2000/svg', name);
      for (const key in attributes) {
        el.setAttribute(key, attributes[key]);
      }
      return el;
    };

    // Draw X-axis
    mainGroup.appendChild(createSVGElement('line', { x1: 0, y1: height, x2: width, y2: height, class: 'axis' }));
    const numXTicks = Math.min(dates.length, 5); // Max 5 X-axis ticks
    let lastDisplayedMonth = null; // Variable to track the last displayed month for mobile

    if (dates.length > 0) {
        for (let i = 0; i < numXTicks; i++) {
            const tickDateIndex = Math.floor(i * (dates.length -1) / (numXTicks -1 < 1 ? 1 : numXTicks -1));
            const dateVal = dates[tickDateIndex];
            const x = xScale(dateVal);
            mainGroup.appendChild(createSVGElement('line', { x1: x, y1: height, x2: x, y2: height + 6, class: 'axis' }));
            
            const isMobile = this.getAttribute('isMobile') === 'true';
            let dateLabelText;
            if (isMobile) {
                const currentMonthName = new Date(dateVal).toLocaleDateString(undefined, { month: 'short' });
                if (currentMonthName !== lastDisplayedMonth) {
                    dateLabelText = currentMonthName;
                    lastDisplayedMonth = currentMonthName;
                } else {
                    dateLabelText = ''; // Show empty string if month is the same as the last one
                }
            } else {
                dateLabelText = new Date(dateVal).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            }

            const xTickText = createSVGElement('text', { x: x, y: height + 20, 'text-anchor': 'middle', class: 'axis-text' });
            xTickText.textContent = dateLabelText;
            mainGroup.appendChild(xTickText);
        }
    }
    const xAxisLabel = createSVGElement('text', {x: width / 2, y: height + 40, 'text-anchor': 'middle', class: 'axis-label'});
    xAxisLabel.textContent = 'Date';
    mainGroup.appendChild(xAxisLabel);

    // Draw Y-axis
    mainGroup.appendChild(createSVGElement('line', { x1: 0, y1: 0, x2: 0, y2: height, class: 'axis' }));
    const numYTicks = 5;
    for (let i = 0; i <= numYTicks; i++) {
      const pointsVal = (maxPoints / numYTicks) * i;
      const y = yScale(pointsVal);
      mainGroup.appendChild(createSVGElement('line', { x1: -6, y1: y, x2: 0, y2: y, class: 'axis' }));
      // Grid line
      mainGroup.appendChild(createSVGElement('line', { x1: 0, y1: y, x2: width, y2: y, class: 'grid-line' }));
      const yTickText = createSVGElement('text', { x: -10, y: y, 'text-anchor': 'end', 'dominant-baseline': 'middle', class: 'axis-text' });
      yTickText.textContent = Math.round(pointsVal).toString();
      mainGroup.appendChild(yTickText);
    }
    const yAxisLabel = createSVGElement('text', {
        transform: `translate(-35, ${height/2}) rotate(-90)`,
        'text-anchor': 'middle', class: 'axis-label'
    });
    yAxisLabel.textContent = 'Points';
    mainGroup.appendChild(yAxisLabel);

    // Draw lines for selected teams
    selectedTeams.forEach(teamName => {
      const teamPointData = teamSeries[teamName];
      const color = this.teamColors[teamName] || '#ccc';

      if (teamPointData && teamPointData.length === dates.length && dates.length > 1) {
        let pathData = 'M';
        for (let i = 0; i < dates.length; i++) {
          pathData += `${xScale(dates[i])},${yScale(teamPointData[i])} `;
          if (i < dates.length - 1) pathData += 'L';
        }
        mainGroup.appendChild(createSVGElement('path', { d: pathData.trim(), stroke: color, fill: 'none', 'stroke-width': 2, class: 'line' }));
      }
    });
    
    // Legend population was moved to the top

    console.log("SVG graph drawn and legend populated.");
  }

  setupTrendsViewInteractivity() {
    // Graph Type Selector
    const graphTypeSelect = this.shadow.querySelector('.trends-graph-type-select');
    if (graphTypeSelect) {
      graphTypeSelect.addEventListener('change', (event) => {
        this.activeTrendGraphType = event.target.value;
        // Re-render or update the specific graph content
        // For now, if we had multiple graph types, this would trigger a different draw function
        // or pass type to a generic draw function.
        if (this.activeTrendGraphType === 'pointsOverTime') {
          this.drawPointsOverTimeSVG(); // Redraw the current graph type
        } else {
          // Handle other graph types in the future
          const svg = this.shadow.querySelector('#points-over-time-svg');
          if (svg) svg.innerHTML = `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">Selected graph type '${this.activeTrendGraphType}' is not yet implemented.</text>`;
          const legendDiv = this.shadow.querySelector('.trends-graph-legend');
          if (legendDiv) legendDiv.innerHTML = '';
        }
        console.log(`Active trend graph type changed to: ${this.activeTrendGraphType}`);
      });
    }

    // Team Toggle Checkboxes (event delegation on legend container)
    const legendDiv = this.shadow.querySelector('.trends-graph-legend');
    if (legendDiv) {
      legendDiv.addEventListener('change', (event) => {
        if (event.target.matches('.trends-team-toggle-cb')) {
          const teamName = event.target.value;
          if (event.target.checked) {
            this.selectedTeamsForGraph.add(teamName);
          } else {
            this.selectedTeamsForGraph.delete(teamName);
          }
          this.drawPointsOverTimeSVG(); // Redraw graph with new team selection
          console.log(`Selected teams for graph updated:`, Array.from(this.selectedTeamsForGraph));
        }
      });
    }

    // Call this once during setup if the trends view is active, to ensure interactivity is live
    // However, render() / _fillTemplate handles calling drawPointsOverTimeSVG which populates legend,
    // so event listeners should be set up after legend is populated.
    // The best place to call this is after render has completed and if the trends tab is active.
    // We can also ensure it's called from setupTabs when trends tab becomes active.
  }
  // END - Placeholder for Trends View Methods

  // START - New methods for table filtering and data processing

  _getFilteredLeagueData() {
    if (!this.data || !this.data.matches || !this.data.table || !this.data.table.leagueData) {
      return [];
    }

    const allTeamNamesInLeague = this.data.table.leagueData.map(t => t.teamName);
    const allMatchesWithResults = this.data.matches.filter(m => m.result && typeof m.result.homeScore === 'number' && typeof m.result.awayScore === 'number');

    // First, calculate the full current league table based on this.tableFilter
    // This logic remains largely the same, generating stats for each team
    const currentFilteredLeague = allTeamNamesInLeague.map(teamName => {
      let played = 0;
      let won = 0;
      let drawn = 0;
      let lost = 0;
      let shotsFor = 0;
      let shotsAgainst = 0;
      let points = 0;
      const teamFilteredMatches = []; // For form icons and tooltips

      allMatchesWithResults.forEach(match => {
        if (!match.result || typeof match.result.homeScore !== 'number' || typeof match.result.awayScore !== 'number') {
          return; // Skip matches without results
        }

        const homeScore = match.result.homeScore;
        const awayScore = match.result.awayScore;
        let matchResultForTeam = ''; // W, D, L for the current team in this match

        if (this.tableFilter === 'home') {
          if (match.homeTeamName === teamName) {
            played++;
            shotsFor += homeScore;
            shotsAgainst += awayScore;
            if (homeScore > awayScore) {
              won++; points += 3; matchResultForTeam = 'W';
            } else if (homeScore === awayScore) {
              drawn++; points += 1; matchResultForTeam = 'D';
            } else {
              lost++; matchResultForTeam = 'L';
            }
            teamFilteredMatches.push({ result: matchResultForTeam, date: match.date, homeTeamName: match.homeTeamName, awayTeamName: match.awayTeamName, homeScore, awayScore });
          }
        } else if (this.tableFilter === 'away') {
          if (match.awayTeamName === teamName) {
            played++;
            shotsFor += awayScore;
            shotsAgainst += homeScore;
            if (awayScore > homeScore) {
              won++; points += 3; matchResultForTeam = 'W';
            } else if (awayScore === homeScore) {
              drawn++; points += 1; matchResultForTeam = 'D';
            } else {
              lost++; matchResultForTeam = 'L';
            }
            teamFilteredMatches.push({ result: matchResultForTeam, date: match.date, homeTeamName: match.homeTeamName, awayTeamName: match.awayTeamName, homeScore, awayScore });
          }
        } else { // 'overall'
          if (match.homeTeamName === teamName) {
            played++;
            shotsFor += homeScore;
            shotsAgainst += awayScore;
            if (homeScore > awayScore) {
              won++; points += 3; matchResultForTeam = 'W';
            } else if (homeScore === awayScore) {
              drawn++; points += 1; matchResultForTeam = 'D';
            } else {
              lost++; matchResultForTeam = 'L';
            }
            teamFilteredMatches.push({ result: matchResultForTeam, date: match.date, homeTeamName: match.homeTeamName, awayTeamName: match.awayTeamName, homeScore, awayScore });
          } else if (match.awayTeamName === teamName) {
            played++;
            shotsFor += awayScore;
            shotsAgainst += homeScore;
            if (awayScore > homeScore) {
              won++; points += 3; matchResultForTeam = 'W';
            } else if (awayScore === homeScore) {
              drawn++; points += 1; matchResultForTeam = 'D';
            } else {
              lost++; matchResultForTeam = 'L';
            }
            teamFilteredMatches.push({ result: matchResultForTeam, date: match.date, homeTeamName: match.homeTeamName, awayTeamName: match.awayTeamName, homeScore, awayScore });
          }
        }
      });

      teamFilteredMatches.sort((a, b) => new Date(b.date) - new Date(a.date));

      return {
        teamName,
        played,
        won,
        drawn,
        lost,
        shotsFor,
        shotsAgainst,
        shotDifference: shotsFor - shotsAgainst,
        points,
        matches: teamFilteredMatches.slice(0, 5).map(m => ({
          result: m.result,
          description: `${new Date(m.date).toLocaleDateString()}: ${m.homeTeamName} ${m.homeScore}-${m.awayScore} ${m.awayTeamName}`
        })),
        allMatchesForTooltip: teamFilteredMatches,
        inPromotionPosition: false,
        inRelegationPosition: false
      };
    });

    // Sort teams to establish their rank based on points, shotDifference, etc.
    currentFilteredLeague.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.shotDifference !== a.shotDifference) return b.shotDifference - a.shotDifference;
      if (b.shotsFor !== a.shotsFor) return b.shotsFor - a.shotsFor;
      return a.teamName.localeCompare(b.teamName);
    });

    // Assign currentRank based on the primary sort for the current view (overall, home, away)
    currentFilteredLeague.forEach((team, index) => {
      team.currentRank = index + 1;
    });

    // Rank movement and promotion/relegation logic, primarily for 'overall' view
    if (this.tableFilter === 'overall') {
      let effectivePreviousRanks = null;

      // Always calculate effectivePreviousRanks based on data before the last match day
      const uniqueResultDates = [...new Set(allMatchesWithResults.map(m => {
        if (!m.date) return null; // Should not happen if filtered by result, but defensive
        return new Date(m.date).setHours(0,0,0,0);
      }).filter(date => date !== null))].sort((a,b) => a - b);

      if (uniqueResultDates.length >= 2) {
          const lastActualMatchDayTimestamp = uniqueResultDates[uniqueResultDates.length - 1];
          const matchesForBaseline = allMatchesWithResults.filter(match => {
              if (!match.date) return false; // Ensure match.date exists
              const matchDateTimestamp = new Date(match.date).setHours(0,0,0,0);
              return matchDateTimestamp < lastActualMatchDayTimestamp;
          });
          if (matchesForBaseline.length > 0) {
              effectivePreviousRanks = this._calculateRanksFromMatches(matchesForBaseline, allTeamNamesInLeague);
          }
      }
      // If uniqueResultDates < 2 or matchesForBaseline is empty, effectivePreviousRanks remains null.

      // Apply movement and promotion/relegation to the currentFilteredLeague (which is already sorted for 'overall')
      currentFilteredLeague.forEach(team => {
        // currentRank is already set from the main sort
        if (effectivePreviousRanks && effectivePreviousRanks[team.teamName] !== undefined) {
          const previousRank = effectivePreviousRanks[team.teamName];
          team.rankMovement = previousRank - team.currentRank;
        } else {
          team.rankMovement = 0; // No previous data or team not in baseline
        }

        // Promotion/relegation for overall table
        if (this.data && this.data.table && this.data.table.metaData) {
          const promotionPlaces = this.data.table.metaData.promotionPlaces || 0;
          const relegationPlaces = this.data.table.metaData.relegationPlaces || 0;
          team.inPromotionPosition = promotionPlaces > 0 && team.currentRank <= promotionPlaces;
          team.inRelegationPosition = relegationPlaces > 0 && team.currentRank >= (currentFilteredLeague.length - relegationPlaces + 1);
        } else {
          team.inPromotionPosition = false;
          team.inRelegationPosition = false;
        }
      });

    } else { // For 'home' or 'away' filters, rank is per that table, no overall movement shown
      currentFilteredLeague.forEach(team => {
        team.rankMovement = 0;
        team.inPromotionPosition = false;
        team.inRelegationPosition = false;
      });
    }
    
    // The promotion/relegation logic was moved inside the loop above
    // to use the calculated currentRank directly.
    return currentFilteredLeague;
  }

  setupTableFilterDropdown() {
    const filterSelect = this.shadow.querySelector('#table-filter-select');
    if (filterSelect) {
      filterSelect.value = this.tableFilter; // Ensure dropdown reflects current state
      filterSelect.onchange = (event) => {
        this.tableFilter = event.target.value;
        this.render(); // Re-render with the new filter
      };
    }
  }

  // END - New methods for table filtering

  /**
   * Renders the rank movement indicator to be placed next to the position.
   * @param {number|undefined} movement - The change in rank. Positive for up, negative for down, 0 for no change.
   * @returns {string} HTML string for the movement indicator.
   */
  renderRankMovementIndicator(movement) {
    let content = ''; // Default is empty for no change
    
    // Only show indicators for actual movement
    if (typeof movement === 'number' && movement !== 0 && this.tableFilter === 'overall') {
      if (movement > 0) { // Moved up
        content = `<span class="rank-up" title="Moved up ${movement} position${movement !== 1 ? 's' : ''}">▲</span>`;
      } else { // Moved down
        const absMovement = Math.abs(movement);
        content = `<span class="rank-down" title="Moved down ${absMovement} position${absMovement !== 1 ? 's' : ''}">▼</span>`;
      }
    }
    return content;
  }

  /**
   * @param {Array<Object>} matchesSubset - Array of match objects to calculate ranks from.
   * @param {Array<string>} allTeamNamesInLeague - Array of all team names in the league.
   * @returns {Object|null} A map of { teamName: rank }, or null if calculation isn't possible.
   */
  _calculateRanksFromMatches(matchesSubset, allTeamNamesInLeague) {
    if (!matchesSubset || matchesSubset.length === 0 || !allTeamNamesInLeague || allTeamNamesInLeague.length === 0) {
      return null;
    }

    const stats = allTeamNamesInLeague.map(teamName => {
      let played = 0;
      let won = 0;
      let drawn = 0;
      let lost = 0;
      let shotsFor = 0;
      let shotsAgainst = 0;
      let points = 0;

      matchesSubset.forEach(match => {
        // Ensure match has a result and valid scores
        if (!match.result || typeof match.result.homeScore !== 'number' || typeof match.result.awayScore !== 'number') {
          return; 
        }
        
        const homeScore = match.result.homeScore;
        const awayScore = match.result.awayScore;

        if (match.homeTeamName === teamName) {
          played++;
          shotsFor += homeScore;
          shotsAgainst += awayScore;
          if (homeScore > awayScore) { won++; points += 3; }
          else if (homeScore === awayScore) { drawn++; points += 1; }
          else { lost++; }
        } else if (match.awayTeamName === teamName) {
          played++;
          shotsFor += awayScore;
          shotsAgainst += homeScore;
          if (awayScore > homeScore) { won++; points += 3; }
          else if (awayScore === homeScore) { drawn++; points += 1; }
          else { lost++; }
        }
      });
      return {
        teamName,
        played,
        won,
        drawn,
        lost,
        shotsFor,
        shotsAgainst,
        shotDifference: shotsFor - shotsAgainst,
        points
      };
    });

    // Sort teams based on points, shotDifference, shotsFor (standard league sorting)
    stats.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.shotDifference !== a.shotDifference) return b.shotDifference - a.shotDifference;
      if (b.shotsFor !== a.shotsFor) return b.shotsFor - a.shotsFor;
      return a.teamName.localeCompare(b.teamName);
    });

    const rankMap = {};
    stats.forEach((team, index) => {
      rankMap[team.teamName] = index + 1; // 1-indexed rank
    });
    
    return rankMap;
  }

  /**
   * Open the match modal dialog.
   * @param {Object} matchData
   * @param {Array<string>} teams
   * @param {'edit'|'new'} mode
   */
  openMatchModal(matchData, teams, mode = 'edit') {
    this.matchModalOpen = true;
    this.matchModalData = matchData;
    this.matchModalTeams = teams;
    this.matchModalMode = mode;
    this.render();
  }

  /**
   * Close the match modal dialog.
   */
  closeMatchModal() {
    this.matchModalOpen = false;
    this.matchModalData = null;
    this.matchModalTeams = [];
    this.matchModalMode = 'new';
    this.render();
  }

  _handleRecentMatchClick(e) {
    if (e.detail.type === 'matchClick' && e.detail.match) {
      const teamsArray = (this.data && this.data.table && Array.isArray(this.data.table.leagueData))
                        ? this.data.table.leagueData.map(t => t.teamName)
                        : [];
      this.openMatchModal(e.detail.match, teamsArray, 'edit');
    }
  }

  _handleAttentionMatchClick(e) {
    if (e.detail.type === 'matchClick' && e.detail.match) {
      const teamsArray = (this.data && this.data.table && Array.isArray(this.data.table.leagueData))
                        ? this.data.table.leagueData.map(t => t.teamName)
                        : [];
      this.openMatchModal(e.detail.match, teamsArray, 'edit');
    }
  }

  // New handler for match clicks from league-matches-upcoming
  _handleUpcomingMatchClick(e) {
    // Check if the event is specifically a matchClick event
    if (e.detail.type === 'matchClick' && e.detail.match) {
        const teamsArray = (this.data && this.data.table && Array.isArray(this.data.table.leagueData))
                            ? this.data.table.leagueData.map(t => t.teamName)
                            : [];
        this.openMatchModal(e.detail.match, teamsArray, 'edit');
    }
  }

  // New handler for date changes from league-matches-upcoming calendar
  _handleUpcomingFixtureDateChange(e) {
    // Check if the event is specifically a dateChange event
    if (e.detail.type === 'dateChange') {
      const selectedDateFromUpcoming = e.detail.selectedDate;
      // console.log('Date selected in upcoming fixtures calendar:', selectedDateFromUpcoming);
      // If LeagueMatchesRecent or other components need to react to this specific date selection,
      // you would update their 'selected-date' attributes here and re-render them or parts of the UI.
      // For example, if LeagueMatchesRecent should also filter by this date:
      // const recentMatchesEl = this.shadow.querySelector(this.getAttribute('isMobile') === 'true' ? '#mobile-recent-matches' : '#desktop-recent-matches');
      // if (recentMatchesEl) {
      //   if (selectedDateFromUpcoming) {
      //     recentMatchesEl.setAttribute('selected-date', new Date(selectedDateFromUpcoming).toISOString().split('T')[0]);
      //   } else {
      //     recentMatchesEl.removeAttribute('selected-date');
      //   }
      // }
      // Currently, selectedResultDate is distinct. If desired, we could unify them or sync them here.
    }
  }
}

// Register the custom element
customElements.define('league-element', LeagueElement);

export default LeagueElement; 