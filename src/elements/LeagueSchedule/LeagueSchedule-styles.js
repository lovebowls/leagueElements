import { panelStyles, buttonStyles, dropdownStyles } from '../shared-styles.js';

const BASE_STYLES = `
  ${panelStyles}
  ${buttonStyles}
  ${dropdownStyles}
  
  :host {
    display: block;
    font-family: var(--le-font-family-main, 'Open Sans', Helvetica, Arial, sans-serif);
    box-sizing: border-box;
    color: var(--le-text-color-primary, #333);
  }
  
  .schedule-container {
    display: flex;
    flex-direction: column;
  }
  
  .controls-panel {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--le-padding-m, 1rem);
    padding: var(--le-padding-s, 0.5rem) 0;
  }
  
  .filter-controls {
    display: flex;
    align-items: center;
    gap: var(--le-padding-s, 0.5rem);
  }
  
  .filter-panel {
    padding: 0;
    margin-bottom: 0;
    background: transparent;
    border: none;
  }
    
  .calendar-filter {
    padding: var(--le-padding-s, 0.5rem) 0;
  }
  
  .schedule-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    margin-top: var(--le-padding-s, 0.5rem);
    display: table;
  }
  
  .schedule-table tr {
    display: table-row;
    margin: 0;
    padding: 0;
  }
  
  .schedule-table td,
  .schedule-table th {
    display: table-cell;
    margin: 0;
    padding: 0.25rem 0.5rem;
    line-height: 1.4;
  }
  
  .schedule-table th {
    background-color: var(--le-background-color-header, #f5f5f5);
    color: var(--le-text-color-primary, #333);
    font-weight: 600;
    text-align: center;
    padding: 0.25rem 0.5rem;
    border-bottom: 2px solid var(--le-border-color-medium, #ddd);
    display: table-cell;
    vertical-align: middle;
    line-height: 1.4;
  }
  
  .schedule-table th.date-col,
  .schedule-table th.team-col {
    text-align: left;
  }
  
  .schedule-table th.rink-col,
  .schedule-table th.result-col {
    text-align: center;
  }
  
  .schedule-table td {
    padding: 0.25rem 0.5rem;
    border-bottom: 1px solid var(--le-border-color-light, #eee);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
    display: table-cell;
    vertical-align: middle;
    line-height: 1.4;
    margin: 0;
    border-left: none;
    border-right: none;
    border-top: none;
  }
  
  .schedule-table td:first-child,
  .schedule-table td:nth-child(3),
  .schedule-table td:nth-child(4) {
    text-align: left;
  }
  
  .schedule-table tr:hover {
    background-color: var(--le-background-color-row-hover, #f9f9f9);
  }
  
  .match-row {
    cursor: pointer;
    display: table-row;
    line-height: 1.4;
    padding: 0;
    margin: 0;
    border: none;
    background: none;
  }
  
  .match-row.selected {
    background-color: var(--le-background-color-selected, #e6f7ff);
  }
  
  /* Match state styles */
  .match-row.past-with-result {
    opacity: 0.6;
    color: var(--le-text-color-secondary, #666);
  }
  
  .match-row.past-with-result td {
    color: var(--le-text-color-secondary, #666);
  }
  
  .match-row.past-with-result:hover {
    background-color: rgba(249, 249, 249, 0.8);
  }
  
  .match-row.past-no-result {
    background-color: #fff5f5;
    border-left: 4px solid #ff6b6b;
  }
  
  .match-row.past-no-result:hover {
    background-color: #ffebeb;
  }
  
  .match-row.past-no-result td {
    color: #d63031;
    font-weight: 500;
  }
  
  .match-row.past-no-result .result-col {
    font-style: normal;
    font-weight: 600;
    text-align: center;
  }
  
  .match-row.future {
    /* Keep normal styling for future matches */
  }
  
  .date-col {
    width: 15%;
  }
  
  .team-col {
    width: 30%;
  }
  
  .result-col {
    width: 15%;
  }
  
  .rink-col {
    width: 10%;
    text-align: center;
  }
  
   
  .paging-controls {
    /* Layout properties moved to mobile/desktop sections */
    margin-top: var(--le-padding-s, 0.5rem);
    padding: var(--le-padding-xs, 0.25rem) 0;
    background-color: transparent;
    border: none;
    gap: var(--le-padding-s, 0.5rem);
  }
  
  .paging-info {
    color: var(--le-text-color-secondary, #666);
  }
  
  .paging-settings {
    /* Layout properties moved to mobile/desktop sections */
    gap: var(--le-padding-xs, 0.25rem);
  }
  
  .paging-settings label {
    color: var(--le-text-color-secondary, #666);
    white-space: nowrap;
  }
  
  .paging-settings input[type="number"] {
    width: 60px;
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--le-border-color-medium, #ddd);
    border-radius: var(--le-border-radius-small, 3px);
    text-align: center;
  }
  
  .paging-settings input[type="number"]:focus {
    outline: none;
    border-color: var(--le-border-color-focus, #007cba);
    box-shadow: 0 0 0 2px rgba(0, 124, 186, 0.2);
  }
  
  .paging-buttons {
    /* Layout properties moved to mobile/desktop sections */
    gap: var(--le-padding-xs, 0.25rem);
  }
  
  .paging-buttons button {
    padding: 0.25rem 0.5rem;
    background-color: var(--le-background-color-button, #f0f0f0);
    border: 1px solid var(--le-border-color-medium, #ddd);
    border-radius: var(--le-border-radius-standard, 4px);
    color: var(--le-text-color-primary, #333);
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .paging-buttons button:hover:not(:disabled) {
    background-color: var(--le-background-color-button-hover, #e0e0e0);
    border-color: var(--le-border-color-dark, #ccc);
  }
  
  .paging-buttons button:disabled {
    background-color: var(--le-background-color-button-disabled, #f5f5f5);
    color: var(--le-text-color-secondary, #999);
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  .no-matches {
    padding: var(--le-padding-m, 1rem);
    text-align: center;
    color: var(--le-text-color-secondary, #666);
    background-color: transparent;
    border: none;
  }
  
  .error {
    color: var(--le-text-color-error, #ff0000);
    padding: var(--le-padding-s, 0.5rem);
    background-color: var(--le-background-color-error, #fff0f0);
    border-radius: var(--le-border-radius-standard, 4px);
    margin-bottom: var(--le-padding-s, 0.5rem);
  }
  
  /* Needs attention styles */
  .match-row.needs-attention {
    background-color: #fff8e1; /* Light yellow background for attention */
    border-left: 4px solid #ff9800; /* Orange border for attention */
  }

  .match-row.needs-attention:hover {
    background-color: #ffecb3; /* Slightly darker yellow on hover */
  }

  .match-row.needs-attention td {
    color: #e65100; /* Dark orange text for attention */
    font-weight: 500;
  }

  .match-row.needs-attention .result-col {
    font-style: normal;
    font-weight: 600;
    text-align: center;
  }

  /* Mobile needs attention styles */
  .schedule-table .match-row.needs-attention {
    border-left: 4px solid #ff9800;
    background-color: #fff8e1;
  }
  
  /* Editable date link styles */
  .date-link {
    color: var(--le-color-primary, #007bff);
    text-decoration: underline;
    cursor: pointer;
    transition: color 0.2s ease;
  }
  
  .date-link:hover {
    color: var(--le-color-primary-dark, #0056b3);
    text-decoration: underline;
  }
  
  .date-link:active {
    color: var(--le-color-primary-darker, #004085);
  }
  
  /* Editable rink link styles */
  .rink-link {
    color: var(--le-color-primary, #007bff);
    text-decoration: underline;
    cursor: pointer;
    transition: color 0.2s ease;
  }
  
  .rink-link:hover {
    color: var(--le-color-primary-dark, #0056b3);
    text-decoration: underline;
  }
  
  .rink-link:active {
    color: var(--le-color-primary-darker, #004085);
  }
`;

export const MOBILE_STYLES = `
  ${BASE_STYLES}
  
  /* Mobile-specific controls panel adjustments */
  .controls-panel {
    flex-direction: column;
    gap: var(--le-padding-s, 0.5rem);
    align-items: stretch;
  }
  
  .controls-panel .dropdown-shared {
    width: 100%;
  }
  
  .controls-panel .dropdown-select-shared {
    width: 100%;
    min-width: auto;
  }
  
  .calendar-filter {
    width: 100%;
  }
  
  
  .paging-controls {
    display: flex;
    flex-direction: column;
    gap: var(--le-padding-s, 0.5rem);
  }
  
  .paging-settings {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .paging-buttons {
    display: flex;
    justify-content: center;
    width: 100%;
  }
  
  .schedule-cards {
    display: block;
    font-size: var(--le-font-size-xs);
  }
  
  .match-card {
    display: block;
    width: 100%;
    margin-bottom: 1rem;
    border: none;
    border-radius: 12px;
    padding: var(--le-padding-s);
    position: relative;
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06);
    border-left: 4px solid #e9ecef;
    transition: all 0.2s ease-in-out;
    cursor: pointer;
    box-sizing: border-box;
  }
  
  .match-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08);
  }
  
  /* Enhanced mobile match state styles */
  .match-card.past-no-result {
    border-left: 4px solid #ff6b6b;
    background: linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%);
    box-shadow: 0 2px 8px rgba(255, 107, 107, 0.15), 0 1px 3px rgba(255, 107, 107, 0.1);
  }
  
  .match-card.past-with-result {
    border-left: 4px solid #28a745;
    background: linear-gradient(135deg, #f8fff9 0%, #e6f7e6 100%);
    opacity: 0.85;
  }
  
  .match-card.today {
    border-left: 4px solid #ffc107;
    background: linear-gradient(135deg, #fffbf0 0%, #fff3cd 100%);
    box-shadow: 0 2px 8px rgba(255, 193, 7, 0.2), 0 1px 3px rgba(255, 193, 7, 0.1);
  }
  
  .match-card.future {
    border-left: 4px solid #007bff;
    background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
  }
  
  .match-card.needs-attention {
    border-left: 4px solid #ff9800;
    background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
    box-shadow: 0 2px 8px rgba(255, 152, 0, 0.15), 0 1px 3px rgba(255, 152, 0, 0.1);
  }
  
  .card-row {
    display: flex;
    align-items: center;
    padding: 0.4rem 0;
    min-height: 2.2rem;
    line-height: 1.4;
  }
  
  .card-label {
    font-weight: 600;
    width: 5%;
    margin-right: 0.75rem;
    color: var(--le-text-color-secondary, #6c757d);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    flex-shrink: 0;
  }
  
  .card-value {
    flex: 1;
    font-weight: 500;
    color: var(--le-text-color-primary, #333);
    position: relative;
  }
  
  .card-row:after {
    content: '';
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    width: calc(100% - 15% - 0.75rem);
    height: 1px;
    background: linear-gradient(to right, rgba(0,0,0,0.1) 0%, transparent 100%);
    z-index: 0;
  }
  
  /* Remove the line for the last row */
  .card-row:last-child:after {
    display: none;
  }
  
  .card-row:not(:last-child) {
    margin-bottom: 0.2rem;
  }
  
  /* Date styling */
  .card-row:first-child .card-value {
    font-weight: 700;
    color: var(--le-color-primary, #007bff);
  }
  
  .match-card.today .card-row:first-child .card-value {
    color: #e67e22;
    text-shadow: 0 1px 2px rgba(230, 126, 34, 0.3);
  }
  
  /* Date and rink container styling */
  .date-rink-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  
  .date-section {
    text-align: left;
    flex: 1;
  }
  
  .rink-section {
    text-align: right;
    color: var(--le-text-color-secondary, #666);
    font-weight: 500;
    margin-left: 0.5rem;
  }
  
  /* Teams and result grid layout */
  .teams-result-row {
    display: grid;
    grid-template-columns: auto 1fr 1rem auto 1rem 1fr auto;
    align-items: center;
    width: 100%;
    gap: 0;
  }
  
  .home-label {
    font-weight: 600;
    color: var(--le-text-color-secondary, #6c757d);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    grid-column: 1;
    margin-right: 0.25rem;
  }
  
  .team-name-home {
    font-weight: 500;
    color: var(--le-text-color-primary, #2c3e50);
    text-align: right;
    grid-column: 2;
  }
  
  .result-score {
    font-weight: 700;
    color: var(--le-color-primary, #007bff);
    background: none !important;
    white-space: nowrap;
    grid-column: 4;
    justify-self: center;
  }
  
  .team-name-away {
    font-weight: 500;
    color: var(--le-text-color-primary, #2c3e50);
    text-align: left;
    grid-column: 6;
  }
  
  .away-label {
    font-weight: 600;
    color: var(--le-text-color-secondary, #6c757d);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    grid-column: 7;
    margin-left: 0.25rem;
  }
  
  /* Winner team styling */
  .team-name-home.winner,
  .team-name-away.winner {
    font-weight: 700;
  }
  
  /* Result styling for different match states */
  .match-card.past-no-result .result-score,
  .match-card.needs-attention .result-score {
    background-color: rgba(214, 48, 49, 0.1);
    color: #d63031;
  }
  
  .match-card.past-with-result .result-score {
    background-color: rgba(40, 167, 69, 0.1);
    color: #28a745;
  }
  
  .paging-info {
    text-align: center;
  }
`;

export const DESKTOP_STYLES = `
  ${BASE_STYLES}
  
  /* Desktop-specific controls panel adjustments */
  .controls-panel {
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0 var(--le-padding-s, 0.5rem);
    box-sizing: border-box;
  }
  
  .filter-controls {
    display: flex;
    align-items: center;
    gap: var(--le-padding-s, 0.5rem);
    flex: 1;
    justify-content: space-between;
  }
  
  /* Desktop-specific dropdown styling for filter controls */
  .filter-controls .dropdown-shared {
    width: auto;
    min-width: 120px;
  }
  
  .filter-controls .dropdown-shared:last-child {
    text-align: right;
  }
  
  .filter-controls .dropdown-select-shared {
    width: 100%;
    min-width: 120px;
  }
  
  .filter-controls .dropdown-shared:last-child .dropdown-select-shared {
    width: auto;
    min-width: 120px;
  }
      
  .calendar-filter {
    max-width: 400px;
    margin: 0;
  }
  
  .paging-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .paging-settings {
    display: flex;
    align-items: center;
  }
  
  .paging-buttons {
    display: flex;
  }
  
  /* Desktop table layout */
  .schedule-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    margin-top: var(--le-padding-s, 0.5rem);
    display: table;
  }
  
  .schedule-table tr {
    display: table-row;
    margin: 0;
    padding: 0;
  }
  
  .schedule-table td,
  .schedule-table th {
    display: table-cell;
    margin: 0;
    padding: 0.25rem 0.5rem;
    line-height: 1.4;
  }
  
  .schedule-table th {
    background-color: var(--le-background-color-header, #f5f5f5);
    color: var(--le-text-color-primary, #333);
    font-weight: 600;
    text-align: center;
    padding: 0.25rem 0.5rem;
    border-bottom: 2px solid var(--le-border-color-medium, #ddd);
    display: table-cell;
    vertical-align: middle;
    line-height: 1.4;
  }
  
  .schedule-table th.date-col,
  .schedule-table th.team-col {
    text-align: left;
  }
  
  .schedule-table th.rink-col,
  .schedule-table th.result-col {
    text-align: center;
  }
  
  .schedule-table td {
    padding: 0.25rem 0.5rem;
    border-bottom: 1px solid var(--le-border-color-light, #eee);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
    display: table-cell;
    vertical-align: middle;
    line-height: 1.4;
    margin: 0;
    border-left: none;
    border-right: none;
    border-top: none;
  }
  
  .schedule-table td[data-label="Date"],
  .schedule-table td[data-label="H"] {
    text-align: left;
  }
  
  .schedule-table td[data-label="Rink"],
  .schedule-table td[data-label="Result"] {
    text-align: center;
  }
  
  .schedule-table td[data-label="A"] {
    text-align: left;
  }
  
  .schedule-table tr:hover {
    background-color: var(--le-background-color-row-hover, #f9f9f9);
  }
  
  .schedule-table thead {
    display: table-header-group;
  }
  
  .schedule-table tbody {
    display: table-row-group;
  }
  
  .schedule-table tr {
    display: table-row;
    margin-bottom: 0;
    border: none;
    border-radius: 0;
    padding: 0;
  }
  
  .schedule-table td::before {
    content: none;
  }
  
  /* Desktop column widths */
  .date-col {
    width: 15%;
  }
  
  .team-col {
    width: 30%;
  }
  
  .result-col {
    width: 15%;
  }
  
  .rink-col {
    width: 10%;
    text-align: center;
  }
  
  /* Desktop match row styles */
  .match-row {
    cursor: pointer;
    display: table-row;
    line-height: 1.4;
    padding: 0;
    margin: 0;
    border: none;
    background: none;
  }
  
  .match-row.selected {
    background-color: var(--le-background-color-selected, #e6f7ff);
  }
  
  .match-row.past-with-result {
    opacity: 0.6;
    color: var(--le-text-color-secondary, #666);
  }
  
  .match-row.past-with-result td {
    color: var(--le-text-color-secondary, #666);
  }
  
  .match-row.past-with-result:hover {
    background-color: rgba(249, 249, 249, 0.8);
  }
  
  .match-row.past-no-result {
    background-color: #fff5f5;
    border-left: 4px solid #ff6b6b;
  }
  
  .match-row.past-no-result:hover {
    background-color: #ffebeb;
  }
  
  .match-row.past-no-result td {
    color: #d63031;
    font-weight: 500;
  }
  
  .match-row.past-no-result .result-col {
    font-style: normal;
    font-weight: 600;
    text-align: center;
  }
  
  .match-row.needs-attention {
    background-color: #fff8e1;
    border-left: 4px solid #ff9800;
  }

  .match-row.needs-attention:hover {
    background-color: #ffecb3;
  }

  .match-row.needs-attention td {
    color: #e65100;
    font-weight: 500;
  }

  .match-row.needs-attention .result-col {
    font-style: normal;
    font-weight: 600;
    text-align: center;
  }
  
  /* Desktop-specific column alignments */
  .home-col {
    text-align: right !important;
  }
  
  .center-align {
    text-align: center !important;
  }
  
  /* Desktop winner styling */
  .winner {
    font-weight: 700 !important;
  }
  
  /* Desktop dropdowns - ensure consistency */
  .controls-panel .dropdown-shared {
    width: auto;
    min-width: 160px;
  }
`;