import { panelStyles, buttonStyles, dropdownStyles, getMobileStyles, getDesktopStyles, tabStyles, formStyles} from '../shared-styles.js';

// Base styles shared between mobile and desktop layouts
const BASE_STYLES = `
      ${panelStyles}
      ${buttonStyles}
      ${dropdownStyles}
      ${tabStyles}
      ${formStyles}
      :host {
        display: block;
        border: 1px solid var(--le-border-color-medium, #ccc); 
        border-radius: var(--le-border-radius-standard, 4px); 
        font-family: var(--le-font-family-main, 'Open Sans', Helvetica, Arial, sans-serif); 
        box-sizing: border-box;
        color: var(--le-text-color-primary, #333); 

        /* THEME VARIABLES */
        --le-font-family-main: 'Open Sans', Helvetica, Arial, sans-serif;

        --le-text-color-primary: #333;
        --le-text-color-secondary: #666;
        --le-text-color-accent: #2196f3;
        --le-text-color-accent-hover: #1976d2;
        --le-text-color-error: #ff0000; /* General text error */
        --le-text-color-on-primary: #fff; /* Text on primary color background */
        --le-text-color-on-accent: #fff; /* Text on accent color background */

        /* Status Colors */
        --le-color-status-warning: #f39c12; /* Orange for general warnings, future results */
        --le-color-status-conflict: #e67e22; /* Darker Orange/Brown for scheduling conflicts */
        --le-color-status-pending: #e74c3c; /* Reddish for pending results (past due) */
        --le-color-status-info: #2196f3;    /* Blue for informational, like no date set */
        --le-color-status-success: #4CAF50; /* Green for success, already used by form-w */

        --le-background-color-host: #fff; /* Default host background */
        --le-background-color-panel: #fff;
        --le-background-color-header: #f5f5f5;
        --le-background-color-row-hover: #f9f9f9;
        --le-background-color-error: #fff0f0;
        --le-background-color-tooltip: #333;
        --le-background-color-promotion: rgb(102, 212, 128);
        --le-background-color-relegation: #f8d7da;
        --le-background-color-default-pos: #f0f0f0;
        --le-background-color-button: #f0f0f0;
        --le-background-color-button-hover: #e0e0e0;
        
        --le-border-color-light: #eee;
        --le-border-color-medium: #ddd;
        --le-border-color-dark: #ccc; /* For main host border */
        --le-border-color-accent: #2196f3;

        --le-border-radius-standard: 4px;
        --le-border-radius-small: 3px;

        --le-spacing-unit: 0.25rem;
        --le-padding-xs: calc(1 * var(--le-spacing-unit)); /* 0.25rem */
        --le-padding-s: calc(2 * var(--le-spacing-unit));  /* 0.5rem */
        --le-padding-m: calc(4 * var(--le-spacing-unit)); /* 1rem */
        --le-padding-l: calc(6 * var(--le-spacing-unit));  /* 1.5rem */

        /* Specifics */
        --le-table-header-background: var(--le-background-color-header);
        --le-tab-text-color: var(--le-text-color-secondary);
        --le-tab-text-color-hover: var(--le-text-color-primary);
        --le-tab-border-color-active: var(--le-text-color-accent);
        
        /* Form icon colors (could be themed further if needed) */
        --le-form-color-w: #4CAF50;
        --le-form-color-d: #FFC107;
        --le-form-color-l: #F44336;

        /* Rank movement colors */
        --le-rank-up-color: green;
        --le-rank-down-color: red;
      }
      .title {
        font-weight: bold;
        background: var(--le-background-color-header); 
        border-bottom: 1px solid var(--le-border-color-medium); 
      }
      .settings-icon {
        cursor: pointer;
        color: var(--le-text-color-secondary); 
        margin-left: auto;
        padding: var(--le-padding-m) var(--le-padding-m); 
        transition: color 0.2s;
        font-size: var(--le-font-size-large); 
      }
      .settings-icon:hover {
        color: var(--le-text-color-accent); 
      }
      .content {
        color: var(--le-text-color-secondary); 
        overflow-x: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        text-align: left;
        border-bottom: 1px solid var(--le-border-color-medium); 
        font-size: var(--le-font-size-base); 
      }
      th:not(:first-child),
      td:not(:first-child) {
        text-align: center;
      }
      th {
        background-color: var(--le-table-header-background); 
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
      .form-w { background-color: var(--le-form-color-w); } 
      .form-d { background-color: var(--le-form-color-d); } 
      .form-l { background-color: var(--le-form-color-l); } 

      .error {
        color: var(--le-text-color-error); 
        padding: var(--le-padding-s); 
        background-color: var(--le-background-color-error); 
        border-radius: var(--le-border-radius-standard); 
      }
      .match-link {
        color: var(--le-text-color-accent); 
        text-decoration: none;
        transition: color 0.2s;
      }
      .match-link:hover {
        color: var(--le-text-color-accent-hover); 
        text-decoration: underline;
      }
      .match-item {
        padding: var(--le-padding-s); /* MODIFIED - Default/Desktop padding */
        border-bottom: 1px solid var(--le-border-color-light); 
        font-size: var(--le-font-size-base); 
      }
      .match-item:last-child {
        border-bottom: none;
      }
      .match-date {
        color: var(--le-text-color-secondary); 
        font-size: var(--le-font-size-medium);
        margin-bottom: var(--le-padding-xs); 
      }      

      /* Schedule Styles - Layout-agnostic properties only */
      .schedule-container {
        overflow: auto; /* For scrolling */
        padding: var(--le-padding-m);
        height: 100%;
        flex: 1;
      }
      
      /* Matrix Styles - Layout-agnostic properties only */
      .matrix-container {
        overflow: auto; /* For scrolling */
        padding: var(--le-padding-m); 
      }
      .matrix-grid {
        border: 1px solid var(--le-border-color-dark); 
      }
      .matrix-cell {
        border: 1px solid var(--le-border-color-light); 
        aspect-ratio: 1 / 1;
        position: relative;
        font-size: var(--le-font-size-base); 
        box-sizing: border-box;
      }
      .matrix-header-cell {
        font-weight: bold;
        background-color: var(--le-background-color-header); 
      }
      .matrix-team-name-x {
        transform: rotate(-45deg);
        transform-origin: center center;
        display: inline-block;
        white-space: normal;
        word-break: break-word;
        hyphens: auto;
        font-size: var(--le-font-size-small);
      }
      .matrix-team-name-y {
        text-align: right;
        padding-right: var(--le-padding-s); 
        font-size: var(--le-font-size-small); 
        width: 100%;
      }
      .matrix-cell-played { background-color: #e3f2fd; color: var(--le-text-color-accent-hover); } 
      .matrix-cell-scheduled { background-color: #e8f5e9; color: #2e7d32; } 
      .matrix-cell-none { 
        background-color: var(--le-background-color-panel);
        position: relative;
      }
      .matrix-cell-none .add-match-icon {
        color: var(--le-border-color-dark);
        font-size: var(--le-font-size-medium);
        opacity: 0.6;
        transition: opacity 0.2s ease-in-out;
      }
      .matrix-cell-none:hover .add-match-icon {
        opacity: 1;
        color: var(--le-text-color-accent);
      }
      .matrix-cell-same-team { 
        background-color: var(--le-border-color-light);
        position: relative;
        overflow: hidden;
      } 
      .matrix-cell-same-team::before,
      .matrix-cell-same-team::after {
        content: '';
        position: absolute;
        background-color: var(--le-border-color-dark);
        width: 1px;
        height: 141%; /* √2 * 100% to cover the diagonal */
        top: 50%;
        left: 50%;
      }
      .matrix-cell-same-team::before {
        transform: translate(-50%, -50%) rotate(45deg);
      }
      .matrix-cell-same-team::after {
        transform: translate(-50%, -50%) rotate(-45deg);
      }
      /* Apply hover effect only to interactive cells */
      .matrix-cell:not(.matrix-cell-same-team):hover {
        filter: brightness(0.95);
      }
      .matrix-score {
        font-size: var(--le-font-size-base); 
        font-weight: bold;
      }

      /* Tooltip Styles */
      .tooltip {
        position: absolute;
        background-color: var(--le-background-color-tooltip); 
        color: var(--le-text-color-on-primary); 
        padding: var(--le-padding-xs) var(--le-padding-s); 
        border-radius: var(--le-border-radius-small); 
        font-size: var(--le-font-size-small); 
        white-space: nowrap;
        z-index: 10;
        visibility: hidden;
        opacity: 0;
        transition: opacity 0.2s, visibility 0.2s;
        bottom: 100%; 
        left: 50%;
        transform: translateX(-50%) translateY(-5px); 
      }
      .matrix-cell:hover .tooltip {
        visibility: visible;
        opacity: 1;
      }

      /* Trends View Styles - Layout-agnostic properties only */
      .trends-view-wrapper {
        padding: var(--le-padding-m); 
        height: 100%;
        box-sizing: border-box;
      }
      .trends-controls {
        gap: var(--le-padding-s, 0.5rem);
        margin-bottom: var(--le-padding-s, 0.5rem);
      }
      
      /* Enhanced dropdown styling for trends controls button-like appearance */
      .trends-controls .dropdown-shared {
        position: relative;
        display: inline-block;
      }
      
      .trends-controls .dropdown-select-shared {
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        background-color: var(--le-background-color-button, #f0f0f0);
        border: 1px solid var(--le-border-color-medium, #ddd);
        border-radius: var(--le-border-radius-standard, 4px);
        padding: var(--le-padding-s, 0.5rem) calc(var(--le-padding-m, 1rem) * 2) var(--le-padding-s, 0.5rem) var(--le-padding-m, 1rem);
        font-size: var(--le-font-size-dropdown, var(--le-font-size-medium, 1em));
        color: var(--le-text-color-primary, #333);
        cursor: pointer;
        line-height: 1.4;
        min-width: 160px;
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right 0.75rem center;
        background-size: 1rem;
        transition: all 0.2s ease;
        font-weight: 500;
      }
      
      .trends-controls .dropdown-select-shared:hover {
        background-color: var(--le-background-color-button-hover, #e0e0e0);
        border-color: var(--le-border-color-dark, #ccc);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
      .trends-controls .dropdown-select-shared:focus {
        outline: none;
        border-color: var(--le-text-color-accent, #2196f3);
        box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
        background-color: var(--le-background-color-panel, #fff);
      }
      
      .trends-controls .dropdown-select-shared:active {
        background-color: var(--le-background-color-button-hover, #e0e0e0);
        transform: translateY(1px);
      }
      
      .trends-content-area {
        gap: var(--le-padding-m); 
        min-height: 0; 
      }
      .trends-graph-area {
        border: 1px solid var(--le-border-color-medium); 
        border-radius: var(--le-border-radius-small); 
        overflow: hidden; 
        position: relative; 
      }
      .trends-graph-area svg {
        display: block; 
        width: 100%;
        height: 100%;
      }
      .trends-graph-legend {
        padding: var(--le-padding-s); 
        border: 1px solid var(--le-border-color-light); 
        border-radius: var(--le-border-radius-small); 
        font-size: var(--le-font-size-small); 
      }
      .trends-graph-legend .legend-item {
        margin-bottom: var(--le-padding-xs); 
      }
      .trends-graph-legend .legend-color-box {
        width: 12px;
        height: 12px;
        margin-right: var(--le-padding-s); 
        border: 1px solid var(--le-border-color-dark); 
      }

      .trends-graph-area .axis path,
      .trends-graph-area .axis line {
        fill: none;
        stroke: var(--le-text-color-secondary); 
        shape-rendering: crispEdges;
      }
      .trends-graph-area .axis text {
        font-size: calc(var(--le-font-size-small) * 0.9); 
        fill: var(--le-text-color-primary); 
      }
      .trends-graph-area .line {
        fill: none;
        stroke-width: 2px;
      }
      .trends-graph-area .grid-line {
        stroke: var(--le-border-color-light); 
        stroke-dasharray: 2,2;
        shape-rendering: crispEdges;
      }

      /* Scatter plot specific styles */
      .trends-graph-area .scatter-point {
        cursor: pointer;
        transition: r 0.2s ease;
      }
      .trends-graph-area .scatter-point:hover {
        filter: brightness(1.2);
      }
      .trends-graph-area .scatter-tooltip {
        pointer-events: none;
        font-size: calc(var(--le-font-size-small) * 0.9);
        fill: var(--le-text-color-primary);
        text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
        paint-order: stroke fill;
        stroke: rgba(255,255,255,0.8);
        stroke-width: 3px;
        stroke-linejoin: round;
        stroke-linecap: round;
      }
      .trends-graph-area .axis-label {
        font-size: var(--le-font-size-small);
        fill: var(--le-text-color-primary);
        font-weight: bold;
      }

      /* Position cell styles */
      td.position-cell {
        text-align: left;
        width: 30px; 
        min-width: 30px; 
        max-width: 30px; 
        position: relative; 
        padding-right: 5px; 
      }
      .position-cell .rank-up,
      .position-cell .rank-down {
        display: inline-block;
        position: absolute; 
        right: 5px; 
        top: 50%; 
        transform: translateY(-50%); 
        margin-left: var(--le-padding-xs, 0.25rem); 
        font-size: var(--le-font-size-xs); 
        line-height: 1; 
      }
      .rank-up {
        color: var(--le-rank-up-color);
      }
      .rank-down {
        color: var(--le-rank-down-color);
      }
      .pos-cell-promotion {
        background-color: var(--le-background-color-promotion); 
        color: var(--le-text-color-on-primary); 
        font-weight: bold;
      }
      .pos-cell-relegation {
        background-color: var(--le-background-color-relegation); 
        color: #721c24; 
        font-weight: bold;
      }
      .pos-cell-default {
        background-color: var(--le-background-color-default-pos); 
        color: var(--le-text-color-primary); 
        border: 1px solid var(--le-border-color-light); 
      }
    `;

  // Mobile-specific styles
  export const MOBILE_STYLES = `
      ${BASE_STYLES}
      :host {
        padding: var(--le-padding-s); 
        background: var(--le-background-color-host); 
        border: none;
        border-radius: 0;
      }
      
      /* Mobile-specific dropdown adjustments */
      .dropdown-select-shared {
        /* font-size now inherited from shared mobile styles */
        padding: 0.3rem 2rem 0.3rem 0.5rem;
      }
      
      /* Mobile-specific layout styles */
      .tab-bar {
        display: flex;
        flex-wrap: wrap; /* Allow tabs to wrap to next line */
        gap: var(--le-padding-xs); /* Small gap between tabs */
        padding: var(--le-padding-xs); /* Add padding around the tab bar */
        background-color: var(--le-background-color-header);
        border-bottom: 1px solid var(--le-border-color-medium);
        overflow-x: auto; /* Allow horizontal scrolling as fallback */
        -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
      }
      
      /* Mobile tab button styling */
      .tab-bar .tab-button {
        flex: 1 1 auto; /* Allow flexible sizing */
        min-width: 70px; /* Minimum width to prevent too small buttons */
        max-width: 120px; /* Maximum width to allow more tabs per row */
        padding: var(--le-padding-s) var(--le-padding-xs); /* Adjusted padding for mobile */
        font-size: var(--le-font-size-small); /* Smaller font for mobile */
        text-align: center;
        white-space: nowrap; /* Prevent text wrapping within buttons */
        border-radius: var(--le-border-radius-small);
        margin: 0; /* Remove any default margins */
        border: 1px solid var(--le-border-color-medium);
        background: var(--le-background-color-button);
        color: var(--le-text-color-secondary);
        cursor: pointer;
        transition: all 0.2s ease;
        user-select: none;
        /* Ensure good touch targets */
        min-height: 44px; /* iOS recommended minimum touch target */
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .tab-bar .tab-button:hover {
        background: var(--le-background-color-button-hover);
        color: var(--le-text-color-primary);
      }
      
      .tab-bar .tab-button.active {
        background: var(--le-background-color-panel);
        color: var(--le-text-color-primary);
        font-weight: 600;
        border-color: var(--le-text-color-accent);
      }

      .view-container {
        flex: 1; 
        display: flex; 
        flex-direction: column;
        min-height: 0; 
      }
      .trends-view-wrapper {
        display: flex;
        flex-direction: column;
        gap: var(--le-padding-m); 
        height: 100vh; /* Use full viewport height for mobile */
        max-height: calc(100vh - 200px); /* Account for other UI elements */
      }
      .trends-controls {
        display: flex;
        align-items: center;
        flex-shrink: 0; /* Prevent controls from shrinking */
      }
      .trends-content-area {
        flex: 1; 
        display: flex;
        flex-direction: column; 
        min-height: 400px; /* Minimum height for readability */
      }
      .trends-graph-area {
        flex: 2; /* Give graph more space relative to legend */
        min-height: 250px; /* Minimum height for graph readability */
      }
      
      /* Mobile-specific responsive legend layout */
      .trends-graph-legend {
        flex-shrink: 0; /* Prevent legend from shrinking too much */
        display: grid;
        grid-template-columns: 1fr 1fr; /* 2 columns for mobile as requested */
        gap: var(--le-padding-xs);
        column-gap: var(--le-padding-s);
      }
      
      .trends-graph-legend .legend-item {
        display: flex;
        align-items: center;
        margin-bottom: var(--le-padding-s); /* Increased spacing for touch */
        padding: var(--le-padding-xs);
        border-radius: var(--le-border-radius-small);
        transition: background-color 0.2s ease;
      }
      
      .trends-graph-legend .legend-item:hover {
        background-color: var(--le-background-color-row-hover, #f9f9f9);
      }
      
      /* Enhanced checkbox styling for mobile trends legend */
      .trends-graph-legend .legend-item input[type="checkbox"] {
        width: 1.5em;
        height: 1.5em;
        margin-right: var(--le-padding-s);
        cursor: pointer;
        transform: scale(1.2); /* Make checkboxes larger for mobile */
      }
      
      .trends-graph-legend .legend-color-box {
        width: 1em;
        height: 1em;
        margin-right: var(--le-padding-xs);
        border: 1px solid var(--le-border-color-dark);
        flex-shrink: 0; /* Prevent color box from shrinking */
      }
      .title-with-filter {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
      }
      
      .controls-panel {
        display: flex;
        align-items: center;
        gap: var(--le-padding-s, 0.5rem);
      }
      
      .filter-controls {
        display: flex;
        align-items: center;
        gap: var(--le-padding-s, 0.5rem);
      }
      .matrix-grid {
        display: grid;
      }
      .matrix-cell {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .matrix-container {
        flex: 1; 
      }
      
      /* Matrix specific mobile adjustments - COMPLETELY REDESIGNED */
      .matrix-container { 
        overflow-x: auto;
        width: 100%;
        padding-bottom: 10px; /* Space for scrollbar */
      }
      
      /* Use table layout instead of grid for mobile */
      .matrix-table {
        border-collapse: collapse;
        width: auto;
        min-width: max-content;
      }
      
      .matrix-table td {
        height: 50px;
        min-width: 60px;
        width: 60px;
        padding: 4px;
        text-align: center;
        vertical-align: middle;
        border: 1px solid var(--le-border-color-light);
        font-size: var(--le-font-size-small);
        position: relative;
      }
      
      .matrix-table th {
        background-color: var(--le-background-color-header);
        font-weight: bold;
        border: 1px solid var(--le-border-color-light);
        word-break: break-word;
        hyphens: auto;
        font-size: var(--le-font-size-small);
      }
      
      .matrix-table th:first-child {
        background-color: transparent;
        border: none;
        min-width: 150px; /* Much wider first column for team names */
        width: 150px;
      }
      
      .matrix-table th.top-header {
        height: 120px; /* Taller top header for vertical text */
        min-width: 60px;
        width: 60px;
        position: relative;
        padding: 0;
        vertical-align: bottom;
      }
      
      /* Vertical text in top header */
      .matrix-table th.top-header .vertical-text {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 120px;
        display: flex;
        justify-content: center;
        align-items: flex-end;
        padding-bottom: 10px;
        writing-mode: vertical-rl;
        transform: rotate(180deg);
        text-orientation: mixed;
        font-size: var(--le-font-size-small);
        overflow-wrap: break-word;
        word-wrap: break-word;
        word-break: break-word;
        max-height: 110px; /* Allow space for wrapping but prevent overflow */
      }
      
      .matrix-table th.row-header {
        height: auto; /* Allow height to expand with wrapped content */
        min-height: 50px;
        max-height: 80px; /* Limit maximum height */
        text-align: right;
        padding: 8px 10px 8px 5px;
        vertical-align: middle;
        line-height: 1.2;
        overflow-wrap: break-word;
        word-wrap: break-word;
        word-break: break-word;
        white-space: normal; /* Allow text to wrap */
      }
      
      .matrix-cell-played { 
        background-color: #e3f2fd; 
        font-weight: bold;
      }
      
      .matrix-cell-scheduled { 
        background-color: #e8f5e9; 
      }
      
      .matrix-cell-same { 
        background-color: var(--le-border-color-light);
        position: relative;
      }
      
      .matrix-cell-same::before,
      .matrix-cell-same::after {
        content: '';
        position: absolute;
        background-color: var(--le-border-color-dark);
        width: 1px;
        height: 70px;
        top: -10px;
        left: 50%;
      }
      
      .matrix-cell-same::before {
        transform: rotate(45deg);
      }
      
      .matrix-cell-same::after {
        transform: rotate(-45deg);
      }
      
      .matrix-cell-none { 
        background-color: var(--le-background-color-panel);
      }
      
      .matrix-score {
        font-size: var(--le-font-size-medium);
        font-weight: bold;
      }
      
      .add-match-icon {
        opacity: 0.6;
        font-size: var(--le-font-size-medium);
      }
      
      /* Rest of mobile styles remain unchanged */
      .dashboard-mobile {
        display: flex;
        flex-direction: column;
        gap: var(--le-padding-m); 
      }
      .left-panel { /* In mobile, this is the main content container */
        border: none;
        border-radius: 0;
        background: none;
        padding: 0;
        margin: 0;
      }

      /* Rest of mobile styles remain unchanged */
      .panel { /* This applies to attention panels in mobile */
        border: 1px solid var(--le-border-color-medium); 
        border-radius: var(--le-border-radius-standard); 
        background: var(--le-background-color-panel); 
        padding: var(--le-padding-s); 
        margin: 0;
      }
      .title { /* Title within the left-panel (table/matrix/trends view) */
        font-size: var(--le-font-size-large); 
        margin-bottom: var(--le-padding-s); 
        padding: var(--le-padding-s) 0 var(--le-padding-s) 0; 
      }
      .settings-icon {
        font-size: var(--le-font-size-large); /* Match mobile title size */
        padding: var(--le-padding-s) var(--le-padding-s); /* Increased touch target */
      }
      .content { /* Content area for table/matrix/trends */
        padding: 0;
      }
      table {
        width: 100%;
        max-width: 100%;
        margin: 0;
        border-collapse: collapse;
      }
      th, td {
        padding: var(--le-padding-s) var(--le-padding-xs); /* Adjusted padding */
        font-size: var(--le-font-size-table-cell);
      }
      th:nth-child(2), 
      td:nth-child(2) {
        text-align: left; 
      }
      th:nth-child(3),
      td:nth-child(3) {
        font-weight: bold;
      }
      .panel-header { /* Header within the right-side panels (Attention) */
        font-size: var(--le-font-size-medium); 
        margin-bottom: var(--le-padding-s); 
        color: var(--le-text-color-primary); 
      }
      .match-item { /* For items within Attention */
        padding: var(--le-padding-s) var(--le-padding-s); /* Increased padding */
      }
      .match-score { /* This seems to be for a different component, but if used here */
        color: var(--le-form-color-w); /* MODIFIED (using win color for general score) */
        font-weight: bold;
      }
      /* Make form icons more visible */
      .form-icon {
        display: inline-block;
        width: 8px; /* Increased size */
        height: 16px; /* Increased size */
        margin: 0 2px 0 2px; /* Increased margin */
      }

      /* Mobile-specific position cell adjustments */
      td.position-cell {
        width: 50px; /* Slightly wider on mobile for touch targets */
        min-width: 50px; 
        max-width: 50px; 
        padding-right: 22px; 
      }
      .position-cell .rank-up,
      .position-cell .rank-down {
        right: 6px; 
        font-size: var(--le-font-size-xs);
      }

      /* Mobile-specific trends controls dropdown styling */
      .trends-controls .dropdown-shared {
        width: 100%;
      }
      
      .trends-controls .dropdown-select-shared {
        width: 100%;
        padding: var(--le-padding-s, 0.75rem) calc(var(--le-padding-m, 1rem) * 2.5) var(--le-padding-s, 0.75rem) var(--le-padding-m, 1rem);
        font-size: var(--le-font-size-medium, 1.2em);
        min-height: 44px; /* Minimum touch target size */
        background-size: 1.2rem;
        background-position: right 1rem center;
        border-width: 2px;
      }
      
      .trends-controls .dropdown-select-shared:focus {
        border-width: 2px;
      }

      /* Hide SF and SA columns on mobile screens */
      @media (max-width: 1000px) {
        /* Hide SF (Shots For) - 8th column */
        th:nth-child(8),
        td:nth-child(8) {
          display: none;
        }
        
        /* Hide SA (Shots Against) - 9th column */
        th:nth-child(9),
        td:nth-child(9) {
          display: none;
        }
      }
      
      /* Extra small screens - even more compact tabs */
      @media (max-width: 400px) {
        .tab-bar .tab-button {
          min-width: 60px; /* Even smaller minimum width */
          max-width: 90px; /* Smaller maximum width */
          padding: var(--le-padding-xs) 2px; /* Tighter padding */
          font-size: calc(var(--le-font-size-small) * 0.9); /* Slightly smaller font */
        }
        

        
        .tab-bar {
          padding: 2px; /* Tighter padding around tab bar */
        }
      }
    `;

  // Desktop-specific styles
  export const DESKTOP_STYLES = `
      ${BASE_STYLES}
      :host {
        padding: var(--le-padding-m); 
        height: 100%;
        background-color: var(--le-background-color-host); /* MODIFIED - Can be different for desktop host if desired */
      }
      
      /* Desktop-specific layout styles */
      .tab-bar {
        display: flex;
        gap: 0; /* No gap for desktop tabs as they connect */
        border-bottom: 2px solid var(--le-border-color-light);
        background-color: var(--le-background-color-header);
      }
      
      /* Desktop tab button styling */
      .tab-bar .tab-button {
        background: var(--le-background-color-button);
        border: 1px solid var(--le-border-color-medium);
        border-bottom: none;
        padding: var(--le-padding-s) var(--le-padding-m);
        cursor: pointer;
        font-size: var(--le-font-size-medium);
        font-weight: 500;
        color: var(--le-text-color-secondary);
        border-radius: var(--le-border-radius-standard) var(--le-border-radius-standard) 0 0;
        position: relative;
        transition: all 0.2s ease;
        min-width: 120px;
        text-align: center;
        user-select: none;
        white-space: nowrap;
      }
      
      .tab-bar .tab-button:hover {
        background: var(--le-background-color-button-hover);
        color: var(--le-text-color-primary);
      }
      
      .tab-bar .tab-button.active {
        background: var(--le-background-color-panel);
        color: var(--le-text-color-primary);
        font-weight: 600;
        border-bottom: 2px solid var(--le-background-color-panel);
        margin-bottom: -2px;
        z-index: 1;
      }
      
      .tab-bar .tab-button:not(:last-child) {
        border-right: none;
      }
      

      .view-container {
        flex: 1; 
        display: flex; 
        flex-direction: column;
        min-height: 0; 
      }
      .trends-view-wrapper {
        display: flex;
        flex-direction: column;
        gap: var(--le-padding-m); 
      }
      .trends-controls {
        display: flex;
        align-items: center;
      }
      .trends-content-area {
        flex: 1; 
        display: flex;
        flex-direction: column; 
      }
      .trends-graph-area {
        flex: 1; 
      }
      .trends-graph-legend .legend-item {
        display: flex;
        align-items: center;
      }
      .title-with-filter {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .controls-panel {
        display: flex;
        align-items: center;
        gap: var(--le-padding-s, 0.5rem);
      }
      
      .filter-controls {
        display: flex;
        align-items: center;
        gap: var(--le-padding-s, 0.5rem);
      }
      .matrix-grid {
        display: grid;
      }
      .matrix-cell {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .matrix-container {
        flex: 1; 
      }
      .dashboard {
        display: flex;
        height: 100%;
        gap: var(--le-padding-m); 
      }
      .left-panel {
        flex: 0 0 70%;
        min-width: 0;
        display: flex;
        flex-direction: column;
        border: 1px solid var(--le-border-color-medium); 
        border-radius: var(--le-border-radius-standard); 
        background: var(--le-background-color-panel); 
      }
      .right-panel {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: var(--le-padding-m); 
        min-width: 0;
      }
      /* When right panel is hidden, left panel should take full width */
      .dashboard.no-right-panel .left-panel {
        flex: 1;
      }
      .panel { /* Panels in the right column for desktop */
        border: 1px solid var(--le-border-color-medium); 
        border-radius: var(--le-border-radius-standard); 
        background: var(--le-background-color-panel); 
        padding: var(--le-padding-m); 
      }
      .panel-header { /* Header within right-column panels */
        font-size: var(--le-font-size-large); 
        margin-bottom: var(--le-padding-s); 
        color: var(--le-text-color-primary); 
      }
      .resizer {
        width: 5px;
        background: var(--le-border-color-medium); 
        cursor: col-resize;
        transition: background 0.2s;
      }
      .resizer:hover {
        background: var(--le-text-color-secondary); 
      }
      .title { /* Main title in the left panel (Table/Matrix/Trends) */
        margin-bottom: var(--le-padding-s); 
        padding: var(--le-padding-m); 
      }
      .content { /* Content area for table/matrix/trends in left panel */
        flex: 1;
        padding: var(--le-padding-m); 
      }
      th, td {
        padding: var(--le-padding-s);
      }
      th:nth-child(3),
      td:nth-child(3) {
        font-weight: bold;
      }

      /* Column width adjustments - these are specific and might not use variables directly */
      th:nth-child(1), 
      td:nth-child(1) {
        /* Position - uses .position-cell width */
      }
      th:nth-child(2), 
      td:nth-child(2) {
        width: 35%; 
        text-align: left; 
      }
      th:nth-child(3), 
      td:nth-child(3),
      th:nth-child(4), 
      td:nth-child(4),
      th:nth-child(5), 
      td:nth-child(5),
      th:nth-child(6), 
      td:nth-child(6),
      th:nth-child(7), 
      td:nth-child(7) {
        width: 5%; 
      }
      th:nth-child(8), 
      td:nth-child(8),
      th:nth-child(9), 
      td:nth-child(9),
      th:nth-child(10), 
      td:nth-child(10) {
        width: 7%; 
      }
      th:nth-child(11), 
      td:nth-child(11) {
        width: 15%; 
        min-width: 100px; 
      }

      tr:hover {
        background-color: var(--le-background-color-row-hover); 
      }
      .match-score { /* If used for display somewhere else, e.g., not form icons */
        color: var(--le-form-color-w); /* MODIFIED (using win color for general score display) */
        font-weight: bold;
      }

      /* Desktop-specific trends legend layout - multi-column */
      .trends-graph-legend {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--le-padding-xs);
        column-gap: var(--le-padding-m);
      }
      
      .trends-graph-legend .legend-item {
        margin-bottom: var(--le-padding-xs);
        break-inside: avoid; /* Prevent breaking legend items across columns */
      }

      /* Desktop-specific trends controls dropdown styling */
      .trends-controls .dropdown-shared {
        min-width: 160px;
        width: auto;
      }
      
      .trends-controls .dropdown-select-shared {
        min-width: 160px;
        width: auto;
      }
      
      .trends-content-area {
        flex: 1; 
        display: flex;
        flex-direction: column; 
      }

      /* Special styling for "Select All" checkbox in desktop view */
      .trends-graph-legend .legend-item-select-all {
        font-weight: bold;
        background-color: transparent;
        border-radius: var(--le-border-radius-small);
        padding: var(--le-padding-s) var(--le-padding-s) var(--le-padding-s) 0;
        margin-bottom: var(--le-padding-s);
        grid-column: 1 / -1; /* Span across all columns */
      }


    `;

  // Table header template
  export const TABLE_HEADER = `
      <thead>
        <tr>
          <th class="position-cell"></th>
          <th>Team</th>
          <th>Pts</th>
          <th>P</th>
          <th>W</th>
          <th>D</th>
          <th>L</th>
          <th>F</th>
          <th>A</th>
          <th>±</th>
          <th>Form</th>
        </tr>
      </thead>
    `;

  // Mobile layout template
  export const MOBILE_TEMPLATE = `
      <div class="dashboard-mobile">
        <div class="left-panel">
          <div class="tab-bar">
            <button class="tab-button active" data-view="table">Table</button>
            <button class="tab-button" data-view="schedule">Schedule</button>
            <button class="tab-button" data-view="matrix">Matrix</button>
            <button class="tab-button" data-view="trends">Trends</button>
          </div>
          <div class="view-container" id="mobile-table-view">
            <div class="title title-with-filter">
              <span>{{title}}</span>
              <div class="controls-panel">
                <div class="filter-controls">
                  <div class="dropdown-shared">
                    <select id="table-export-select" class="dropdown-select-shared">
                      <option value="">Export</option>
                      <option value="excel">Excel</option>
                      <option value="word">Word</option>
                      <option value="pdf">PDF</option>
                    </select>
                  </div>
                  <div class="dropdown-shared">
                    <select id="table-filter-select" class="dropdown-select-shared">
                      <option value="overall" {{overallSelected}}>Overall</option>
                      <option value="home" {{homeSelected}}>Home</option>
                      <option value="away" {{awaySelected}}>Away</option>
                      <option value="form" {{formSelected}}>Form</option>
                    </select>
                  </div>
                </div>
                <span class="settings-icon" title="Edit League Settings">⚙️</span>
              </div>
            </div>
            <div class="content">
              <table id="leagueTable">
                ${TABLE_HEADER}
                <tbody>
                  {{tableRows}}
                </tbody>
              </table>
            </div>
          </div>
          <div class="view-container" id="mobile-schedule-view" style="display: none;">
            <div class="title">{{title}} - Schedule</div>
            <div class="schedule-container">
              <league-schedule id="mobile-schedule" is-mobile="true" {{canEditAttr}}></league-schedule>
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
        {{attentionPanel}}
      </div>
    `;

  // Desktop layout template
  export const DESKTOP_TEMPLATE = `
      <div class="dashboard">
        <div class="left-panel">
          <div class="tab-bar">
            <button class="tab-button active" data-view="table">Table</button>
            <button class="tab-button" data-view="schedule">Schedule</button>
            <button class="tab-button" data-view="matrix">Matrix</button>
            <button class="tab-button" data-view="trends">Trends</button>
          </div>
          <div class="view-container" id="desktop-table-view">
            <div class="title title-with-filter">
              <span>{{title}}</span>
              <div class="controls-panel">
                <div class="filter-controls">
                  <div class="dropdown-shared">
                    <select id="table-export-select" class="dropdown-select-shared">
                      <option value="">Export</option>
                      <option value="excel">Excel</option>
                      <option value="word">Word</option>
                      <option value="pdf">PDF</option>
                    </select>
                  </div>
                  <div class="dropdown-shared">
                    <select id="table-filter-select" class="dropdown-select-shared">
                      <option value="overall" {{overallSelected}}>Overall</option>
                      <option value="home" {{homeSelected}}>Home</option>
                      <option value="away" {{awaySelected}}>Away</option>
                      <option value="form" {{formSelected}}>Form</option>
                    </select>
                  </div>
                </div>
                <span class="settings-icon" title="Edit League Settings">⚙️</span>
              </div>
            </div>
            <div class="content">
              <table id="leagueTable">
                ${TABLE_HEADER}
                <tbody>
                  {{tableRows}}
                </tbody>
              </table>
            </div>
          </div>
          <div class="view-container" id="desktop-schedule-view" style="display: none;">
            <div class="title">{{title}} - Schedule</div>
            <div class="schedule-container">
              <league-schedule id="desktop-schedule" {{canEditAttr}}></league-schedule>
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
          {{attentionPanel}}
        </div>
      </div>
    `;
