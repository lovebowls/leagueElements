import { panelStyles, buttonStyles, mobileStyles, desktopStyles, dropdownStyles } from '../shared-styles.js';

const BASE_STYLES = `
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
    font-size: var(--le-font-size-table-cell, 1em);
    display: table;
  }
  
  .schedule-table * {
    font-size: inherit;
  }
  
  .schedule-table tr {
    display: table-row;
    margin: 0;
    padding: 0;
    font-size: inherit;
  }
  
  .schedule-table td,
  .schedule-table th {
    display: table-cell;
    margin: 0;
    padding: 0.25rem 0.5rem;
    font-size: inherit;
    line-height: 1.4;
  }
  
  .schedule-table th {
    background-color: var(--le-background-color-header, #f5f5f5);
    color: var(--le-text-color-primary, #333);
    font-weight: 600;
    text-align: center;
    padding: 0.25rem 0.5rem;
    border-bottom: 2px solid var(--le-border-color-medium, #ddd);
    font-size: var(--le-font-size-table-header, 1em);
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
    font-size: var(--le-font-size-table-cell, 1em);
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
    font-size: inherit;
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
    font-size: var(--le-font-size-medium, 1.2em);
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
    font-size: var(--le-font-size-paging, 0.9em);
    color: var(--le-text-color-secondary, #666);
  }
  
  .paging-settings {
    /* Layout properties moved to mobile/desktop sections */
    gap: var(--le-padding-xs, 0.25rem);
    font-size: var(--le-font-size-paging, 0.9em);
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
    font-size: var(--le-font-size-paging, 0.9em);
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
    font-size: var(--le-font-size-button-sm, 0.85em);
  }
  
  .clear-filters {
    margin-left: 0.5rem;
    padding: 0.25rem 0.5rem;
    font-size: var(--le-font-size-button-sm, 0.85em);
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
    font-size: var(--le-font-size-medium, 1.2em);
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
    font-size: var(--le-font-size-dropdown, 1.1em); /* Use consistent dropdown font size */
  }
  
  /* Export dropdown - make it smaller */
  .export-select {
    font-size: var(--le-font-size-small, 0.9em); /* Use consistent small font size */
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
    margin-bottom: 1rem;
    border: none;
    border-radius: 12px;
    padding: 1rem;
    font-size: var(--le-font-size-medium, 1em);
    position: relative;
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06);
    border-left: 4px solid #e9ecef;
    transition: all 0.2s ease-in-out;
  }
  
  .schedule-table tr:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08);
  }
  
  /* Enhanced mobile match state styles */
  .match-row.past-no-result {
    border-left: 4px solid #ff6b6b;
    background: linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%);
    box-shadow: 0 2px 8px rgba(255, 107, 107, 0.15), 0 1px 3px rgba(255, 107, 107, 0.1);
  }
  
  .match-row.past-with-result {
    border-left: 4px solid #28a745;
    background: linear-gradient(135deg, #f8fff9 0%, #e6f7e6 100%);
    opacity: 0.85;
  }
  
  .match-row.today {
    border-left: 4px solid #ffc107;
    background: linear-gradient(135deg, #fffbf0 0%, #fff3cd 100%);
    box-shadow: 0 2px 8px rgba(255, 193, 7, 0.2), 0 1px 3px rgba(255, 193, 7, 0.1);
  }
  
  .match-row.future {
    border-left: 4px solid #007bff;
    background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
  }
  
  .match-row.needs-attention {
    border-left: 4px solid #ff9800;
    background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
    box-shadow: 0 2px 8px rgba(255, 152, 0, 0.15), 0 1px 3px rgba(255, 152, 0, 0.1);
  }
  
  .schedule-table td {
    display: flex;
    align-items: center;
    padding: 0.4rem 0;
    border: none;
    text-align: left;
    min-height: 2.2rem;
  }
  
  .schedule-table td::before {
    content: attr(data-label);
    font-weight: 600;
    width: 28%;
    margin-right: 0.75rem;
    font-size: var(--le-font-size-small, 0.85em);
    color: var(--le-text-color-secondary, #6c757d);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    flex-shrink: 0;
  }
  
  .schedule-table td:after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, rgba(0,0,0,0.1) 0%, transparent 100%);
    margin-left: auto;
    margin-right: 0.5rem;
  }
  
  /* Remove the line for the last cell */
  .schedule-table td:last-child:after {
    display: none;
  }
  
  /* Style the actual data content */
  .schedule-table td {
    font-weight: 500;
    color: var(--le-text-color-primary, #333);
    font-size: var(--le-font-size-small, 0.95em);
    line-height: 1.4;
  }
  
  /* Special styling for result cells with attention indicators */
  .schedule-table .match-row.past-no-result td[data-label="Result"],
  .schedule-table .match-row.needs-attention td[data-label="Result"] {
    font-weight: 700;
    font-size: var(--le-font-size-large, 1.2em);
    color: #d63031;
  }
  
  /* Team name styling - make them stand out more */
  .schedule-table td[data-label="Home"],
  .schedule-table td[data-label="Away"] {
    font-weight: 700;
    color: var(--le-text-color-primary, #2c3e50);
    font-size: var(--le-font-size-medium, 1.05em);
  }
  
  /* Date styling - make it more prominent */
  .schedule-table td[data-label="Date"] {
    font-weight: 700;
    color: var(--le-color-primary, #007bff);
    font-size: var(--le-font-size-medium, 1.05em);
  }
  
  /* Rink styling */
  .schedule-table td[data-label="Rink"] {
    font-weight: 600;
    color: var(--le-text-color-secondary, #6c757d);
    font-size: var(--le-font-size-small, 0.9em);
    font-style: italic;
  }
  
  /* Result styling for completed matches */
  .schedule-table .match-row.past-with-result td[data-label="Result"] {
    font-weight: 700;
    font-size: var(--le-font-size-medium, 1.1em);
    color: #28a745;
  }
  
  /* Today's match special styling */
  .schedule-table .match-row.today td[data-label="Date"] {
    color: #e67e22;
    text-shadow: 0 1px 2px rgba(230, 126, 34, 0.3);
  }
  
  /* Add some breathing room between content sections */
  .schedule-table td:not(:last-child) {
    margin-bottom: 0.2rem;
  }
  
  /* Enhance the visual hierarchy with better spacing */
  .schedule-table td::before {
    line-height: 1.2;
    display: flex;
    align-items: center;
  }
  
  /* Enhanced edit button positioning for card design */
  .match-actions {
    display: flex;
    opacity: 1;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    z-index: 2;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    width: 36px;
    height: 36px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    transition: all 0.2s ease-in-out;
  }
  
  .match-actions:hover {
    background: rgba(255, 255, 255, 1);
    transform: scale(1.05);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
  }
  
  .edit-match-btn {
    font-size: var(--le-font-size-medium, 1.1em);
    padding: 0;
    min-height: 36px;
    min-width: 36px;
    border: none;
    background: transparent;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.1s ease-in-out;
  }
  
  .edit-match-btn:hover {
    transform: scale(1.1);
  }
  
  .edit-match-btn:active {
    transform: scale(0.95);
  }
  
  .paging-info {
    text-align: center;
  }
`;

export const DESKTOP_STYLES = `
  ${BASE_STYLES}
  
  /* Desktop-specific overrides - following the same pattern as other components */
  :host {
    ${desktopStyles}
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
    font-size: var(--le-font-size-table-cell, 1em);
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