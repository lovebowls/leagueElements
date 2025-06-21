import { panelStyles, buttonStyles, mobileStyles, dropdownStyles } from '../shared-styles.js';

export const BASE_STYLES = `
  ${panelStyles}
  ${buttonStyles}
  ${dropdownStyles}
  
  :host {
    display: block;
    font-family: var(--le-font-family-main, 'Open Sans', Helvetica, Arial, sans-serif);
    box-sizing: border-box;
    color: var(--le-text-color-primary, #333);
    font-size: var(--le-font-size-base, 1em);
  }
  
  /* Reset any inherited styles that might affect the table */
  :host * {
    box-sizing: border-box;
  }
  
  .schedule-container {
    /* Layout properties moved to mobile/desktop sections */
  }
  
  .filter-panel {
    /* Layout properties moved to mobile/desktop sections */
    padding: 0;
    margin-bottom: 0;
    background: transparent;
    border: none;
  }
  
  .filter-controls {
    /* Layout properties moved to mobile/desktop sections */
    gap: var(--le-padding-s, 0.5rem);
  }
  

  
  .schedule-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    margin-top: var(--le-padding-s, 0.5rem);
    font-size: 1em;
    display: table;
  }
  
  .schedule-table * {
    font-size: 1em;
  }
  
  .schedule-table tr {
    display: table-row;
    margin: 0;
    padding: 0;
    font-size: 1em;
  }
  
  .schedule-table td,
  .schedule-table th {
    display: table-cell;
    margin: 0;
    padding: 0.25rem 0.5rem;
    font-size: 1em;
    line-height: 1.4;
  }
  
  .schedule-table th {
    background-color: var(--le-background-color-header, #f5f5f5);
    color: var(--le-text-color-primary, #333);
    font-weight: 600;
    text-align: center;
    padding: 0.25rem 0.5rem;
    border-bottom: 2px solid var(--le-border-color-medium, #ddd);
    font-size: 1em;
    display: table-cell;
    vertical-align: middle;
    line-height: 1.4;
  }
  
  .schedule-table th:first-child,
  .schedule-table th:nth-child(3),
  .schedule-table th:nth-child(4) {
    text-align: left;
  }
  
  .schedule-table td {
    padding: 0.25rem 0.5rem;
    border-bottom: 1px solid var(--le-border-color-light, #eee);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
    font-size: 1em;
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
    font-size: 1em;
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
    font-size: 1.2em;
  }
  
  .match-row.future {
    /* Keep normal styling for future matches */
  }
  
  .match-actions {
    /* Layout properties moved to mobile/desktop sections */
    gap: var(--le-padding-xs, 0.25rem);
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
  }
  
  .match-row:hover .match-actions,
  .match-row.selected .match-actions {
    opacity: 1;
  }
  
  /* Show actions immediately for past matches without results */
  .match-row.past-no-result .match-actions {
    opacity: 1;
  }
  
  .date-col {
    width: 15%;
  }
  
  .team-col {
    width: 25%;
  }
  
  .result-col {
    width: 15%;
  }
  
  .rink-col {
    width: 10%;
    text-align: center;
  }
  
  .actions-col {
    width: 10%;
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
    font-size: 0.9em;
    color: var(--le-text-color-secondary, #666);
  }
  
  .paging-settings {
    /* Layout properties moved to mobile/desktop sections */
    gap: var(--le-padding-xs, 0.25rem);
    font-size: 0.9em;
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
    font-size: 0.9em;
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
    font-size: 0.85em;
  }
  
  .clear-filters {
    margin-left: 0.5rem;
    padding: 0.25rem 0.5rem;
    font-size: 0.85em;
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
    font-size: 1.2em;
  }

  /* Mobile needs attention styles */
  .schedule-table .match-row.needs-attention {
    border-left: 4px solid #ff9800;
    background-color: #fff8e1;
  }
`;

export const MOBILE_STYLES = `
  ${BASE_STYLES}
  :host {
    ${mobileStyles}
  }
  
  /* Mobile-specific layout styles */
  .schedule-container {
    display: flex;
    flex-direction: column;
  }
  
  .filter-panel {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: var(--le-padding-s, 0.5rem);
    margin-bottom: var(--le-padding-s, 0.5rem);
  }
  
  .filter-controls {
    display: flex;
    align-items: center;
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
  
  .filter-panel .dropdown-shared {
    width: 100%;
  }
  
  .filter-panel .dropdown-shared .dropdown-select-shared {
    width: 100%;
    font-size: var(--le-font-size-medium, 1.1em); /* Increase font size for filter dropdown */
  }
  
  /* Export dropdown - make it smaller */
  .export-select {
    font-size: var(--le-font-size-small, 0.9em); /* Reduce font size for export dropdown */
    padding: var(--le-padding-xs, 0.25rem) var(--le-padding-s, 0.5rem); /* Reduce padding */
  }
  
  .schedule-table {
    display: block;
  }
  
  .schedule-table thead {
    display: none;
  }
  
  .schedule-table tbody, 
  .schedule-table tr {
    display: block;
    width: 100%;
  }
  
  .schedule-table tr {
    margin-bottom: var(--le-padding-s, 0.5rem);
    border: 1px solid var(--le-border-color-medium, #ddd);
    border-radius: var(--le-border-radius-standard, 4px);
    padding: var(--le-padding-xs, 0.25rem);
    font-size: var(--le-font-size-small, 0.9em); /* Reduce font size for match rows */
    position: relative; /* For positioning the edit button */
  }
  
  /* Mobile match state styles */
  .match-row.past-no-result {
    border-left: 4px solid #ff6b6b;
    background-color: #fff5f5;
    font-size: var(--le-font-size-small, 0.9em);
  }
  
  .schedule-table td {
    display: flex;
    padding: var(--le-padding-xs, 0.25rem);
    border: none;
    text-align: left;
  }
  
  .schedule-table td::before {
    content: attr(data-label);
    font-weight: bold;
    width: 40%;
    margin-right: var(--le-padding-s, 0.5rem);
    font-size: var(--le-font-size-small, 0.9em); /* Consistent smaller font size */
  }
  
  /* Position edit button in top right corner of match row panel */
  .match-actions {
    display: flex;
    opacity: 1;
    justify-content: flex-end; /* Move to right side */
    position: absolute; /* Position absolutely within the match row */
    top: var(--le-padding-xs, 0.25rem); /* Small gap from top */
    right: var(--le-padding-xs, 0.25rem); /* Small gap from right */
    z-index: 1; /* Ensure it's above other content */
  }
  
  .edit-match-btn {
    font-size: var(--le-font-size-small, 0.9em); /* Smaller button */
    padding: var(--le-padding-xs, 0.25rem); /* Compact padding */
    min-height: 28px; /* Smaller minimum height */
    min-width: 28px; /* Square button */
  }
  
  .paging-info {
    text-align: center;
  }
`;

export const DESKTOP_STYLES = `
  ${BASE_STYLES}
  
  /* Desktop-specific overrides - following the same pattern as other components */
  :host {
  }
  
  /* Desktop-specific layout styles */
  .schedule-container {
    display: flex;
    flex-direction: column;
  }
  
  .filter-panel {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .filter-controls {
    display: flex;
    align-items: center;
  }
  
  .filter-controls .dropdown-shared {
    width: auto;
    min-width: 200px;
  }
  
  .match-actions {
    display: flex;
    justify-content: center;
    opacity: 0;
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
  
  .schedule-table {
    display: table;
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
  
  .schedule-table td {
    display: table-cell;
    padding: 0.25rem 0.5rem;
    border-bottom: 1px solid var(--le-border-color-light, #eee);
    text-align: center;
    font-size: 1em;
  }
  
  .schedule-table td:first-child,
  .schedule-table td:nth-child(3),
  .schedule-table td:nth-child(4) {
    text-align: left;
  }
  
  .schedule-table td::before {
    content: none;
  }
  
  .match-actions {
    opacity: 0;
    justify-content: center;
  }
  
  .match-row:hover .match-actions,
  .match-row.selected .match-actions {
    opacity: 1;
  }
  
  /* Show actions immediately for past matches without results */
  .match-row.past-no-result .match-actions {
    opacity: 1;
  }
  
  /* Desktop dropdowns - consistent sizing */
  .filter-panel .dropdown-shared {
    width: auto;
    min-width: 200px;
  }
  
  .filter-panel .dropdown-shared .dropdown-select-shared {
    width: 100%;
  }
`;

// These template constants are no longer used with the new implementation
export const TEMPLATE = '';
export const TABLE_TEMPLATE = '';
export const NO_MATCHES_TEMPLATE = ''; 