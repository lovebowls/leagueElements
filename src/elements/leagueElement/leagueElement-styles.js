import { panelStyles, buttonStyles, dropdownStyles, mobileStyles } from '../shared-styles.js';

// Base styles shared between mobile and desktop layouts
export const BASE_STYLES = `
      ${panelStyles}   /* ADDED SHARED STYLE */
      ${buttonStyles}  /* ADDED SHARED STYLE */
      ${dropdownStyles} /* ADDED SHARED STYLE */
      :host {
        display: block;
        border: 1px solid var(--le-border-color-medium, #ccc); 
        border-radius: var(--le-border-radius-standard, 4px); 
        font-family: var(--le-font-family-main, 'Open Sans', Helvetica, Arial, sans-serif); 
        box-sizing: border-box;
        color: var(--le-text-color-primary, #333); 

        /* THEME VARIABLES */
        --le-font-family-main: 'Open Sans', Helvetica, Arial, sans-serif;
        --le-font-size-base: 1em; /* Base for general text within this component */
        --le-font-size-small: 0.85em;
        --le-font-size-medium: 1.2em;
        --le-font-size-large: 1.4em;
        --le-font-size-xlarge: 1.6em;
        --le-font-size-page-title: 1.3em; /* For main titles like league name */

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
        font-size: var(--le-font-size-small); /* MODIFIED - Relative to parent */
        margin-bottom: var(--le-padding-xs); 
      }
      /* Tab Styles */
      .tab-bar {
        display: flex;
        border-bottom: 1px solid var(--le-border-color-medium); 
        background-color: var(--le-background-color-header); 
      }
      .tab-button {
        padding: var(--le-padding-s) var(--le-padding-l); 
        cursor: pointer;
        border: none;
        background: none;
        font-size: var(--le-font-size-medium); 
        color: var(--le-tab-text-color); 
        border-bottom: 3px solid transparent;
        transition: color 0.2s, border-bottom-color 0.2s;
      }
      .tab-button:hover {
        color: var(--le-tab-text-color-hover); 
      }
      .tab-button.active {
        color: var(--le-text-color-accent); 
        border-bottom-color: var(--le-tab-border-color-active); 
        font-weight: bold;
      }

      /* Schedule Styles */
      .schedule-container {
        overflow: auto; /* For scrolling */
        flex: 1; /* Take available space if parent is flex column */
        padding: var(--le-padding-m);
        height: 100%;
      }
      
      /* Matrix Styles */
      .matrix-container {
        overflow: auto; /* For scrolling */
        flex: 1; /* Take available space if parent is flex column */
        padding: var(--le-padding-m); 
      }
      .matrix-grid {
        display: grid;
        border: 1px solid var(--le-border-color-dark); 
      }
      .matrix-cell {
        border: 1px solid var(--le-border-color-light); 
        display: flex;
        align-items: center;
        justify-content: center;
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
      .matrix-cell-played { background-color: #e3f2fd; color: var(--le-text-color-accent-hover); } /* MODIFIED (minor adjustment) */
      .matrix-cell-scheduled { background-color: #e8f5e9; color: #2e7d32; } /* MODIFIED to light green */
      .matrix-cell-none { 
        background-color: var(--le-background-color-panel);
        position: relative;
      }
      .matrix-cell-none .add-match-icon {
        color: var(--le-border-color-dark);
        font-size: 1.2em;
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
      .view-container {
        flex: 1; 
        display: flex; 
        flex-direction: column;
        min-height: 0; 
      }

      /* Trends View Styles */
      .trends-view-wrapper {
        display: flex;
        flex-direction: column;
        padding: var(--le-padding-m); 
        gap: var(--le-padding-m); 
        height: 100%;
        box-sizing: border-box;
      }
      .trends-controls {
        display: flex;
        align-items: center;
        gap: var(--le-padding-s, 0.5rem);
        margin-bottom: var(--le-padding-s, 0.5rem);
      }
      #graph-type-select {
        /* Remove old styling in favor of dropdown-select-shared */
      }
      .trends-content-area {
        flex: 1; 
        display: flex;
        flex-direction: column; 
        gap: var(--le-padding-m); 
        min-height: 0; 
      }
      .trends-graph-area {
        flex: 1; 
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
        display: flex;
        align-items: center;
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
        font-size: calc(var(--le-font-size-small) * 0.9); /* MODIFIED to be smaller */
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
      }
      .trends-graph-area .axis-label {
        font-size: var(--le-font-size-small);
        fill: var(--le-text-color-primary);
        font-weight: bold;
      }

      /* Table View Filter Styles */
      .title-with-filter {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      /* Trends View Styles */
      .trends-controls {
        display: flex;
        align-items: center;
        gap: var(--le-padding-s, 0.5rem);
        margin-bottom: var(--le-padding-s, 0.5rem);
      }
      
      #graph-type-select {
        /* Remove old styling in favor of dropdown-select-shared */
      }

      td.position-cell {
        text-align: left;
        width: 30px; 
        min-width: 30px; 
        max-width: 30px; 
        position: relative; /* Add relative positioning to contain absolute elements */
        padding-right: 15px; /* Add extra padding on the right for the indicators */
      }
      .position-cell .rank-up,
      .position-cell .rank-down {
        display: inline-block;
        position: absolute; /* Position absolutely to avoid affecting row height */
        right: 3px; /* Position from right side of the cell */
        top: 50%; /* Center vertically */
        transform: translateY(-50%); /* Perfect vertical centering */
        margin-left: 0; /* Remove left margin */
        font-size: 0.85em; /* Slightly smaller font size */
        line-height: 1; /* Ensure consistent line height */
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
        color: #721c24; /* Specific dark red, could be a variable too */
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
        ${mobileStyles}
        padding: var(--le-padding-s); 
        background: var(--le-background-color-host); 
        border: none;
        border-radius: 0;
        /* Font sizes are now included via mobileStyles */
      }
      
      /* Mobile-specific dropdown adjustments */
      .dropdown-select-shared {
        font-size: 1em; /* Override the doubled font size for dropdowns */
        padding: 0.3rem 2rem 0.3rem 0.5rem;
      }
      
      /* Better spacing for filter in title */
      .title-with-filter {
        gap: 10px;
        align-items: center;
      }
      
      .title-with-filter span {
        font-size: 1.3em; /* Slightly smaller than default mobile title */
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
        font-size: 0.9em;
        position: relative;
      }
      
      .matrix-table th {
        background-color: var(--le-background-color-header);
        font-weight: bold;
        border: 1px solid var(--le-border-color-light);
        word-break: break-word;
        hyphens: auto;
        font-size: 0.9em;
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
        font-size: 0.9em;
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
        font-size: 1.2em;
        font-weight: bold;
      }
      
      .add-match-icon {
        opacity: 0.6;
        font-size: 1.2em;
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
      .panel { /* This applies to upcoming, recent, attention panels in mobile */
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
        font-size: var(--le-font-size-base); /* Explicitly set font size for mobile table cells */
      }
      th:nth-child(3),
      td:nth-child(3) {
        font-weight: bold;
      }
      .panel-header { /* Header within the right-side panels (Upcoming, Recent, Attention) */
        font-size: var(--le-font-size-medium); 
        margin-bottom: var(--le-padding-s); 
        color: var(--le-text-color-primary); 
      }
      .match-item { /* For items within Upcoming, Recent, Attention */
        padding: var(--le-padding-s) var(--le-padding-s); /* Increased padding */
      }
      .match-score { /* This seems to be for a different component, but if used here */
        color: var(--le-form-color-w); /* MODIFIED (using win color for general score) */
        font-weight: bold;
      }
      .tab-button {
        padding: var(--le-padding-s) var(--le-padding-m); /* Increased padding for better touch targets */
        font-size: var(--le-font-size-medium);
      }
      /* Make form icons more visible */
      .form-icon {
        display: inline-block;
        width: 8px; /* Increased size */
        height: 16px; /* Increased size */
        margin: 0 2px 0 2px; /* Increased margin */
      }
      /* Increased spacing for select dropdowns in mobile */
      .table-view-filter {
        padding: var(--le-padding-s) var(--le-padding-m);
        font-size: var(--le-font-size-medium);
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
        font-size: var(--le-font-size-page-title); 
        margin-bottom: var(--le-padding-s); 
        padding: var(--le-padding-m); 
      }
      .content { /* Content area for table/matrix/trends in left panel */
        flex: 1;
        padding: var(--le-padding-m); 
      }
      th, td {
        padding: var(--le-padding-s); /* MODIFIED - Was 0.75rem */
        /* font-size inherited from BASE_STYLES via --le-font-size-base */
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
    `;

  // Table header template
  export const TABLE_HEADER = `
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

  // Mobile layout template
  export const MOBILE_TEMPLATE = `
      <div class="dashboard-mobile">
        <div class="left-panel">
          <div class="tab-bar">
            <button class="tab-button active" data-view="table">Table</button>
            <button class="tab-button" data-view="schedule">Schedule</button>
            <button class="tab-button" data-view="matrix">Matrix</button>
            <button class="tab-button" data-view="trends">Trends</button>
            <span class="settings-icon" title="Edit League Settings">⚙️</span>
          </div>
          <div class="view-container" id="mobile-table-view">
            <div class="title title-with-filter">
              <span>{{title}}</span>
              <div class="dropdown-shared">
                <select id="table-filter-select" class="dropdown-select-shared">
                  <option value="overall" {{overallSelected}}>Overall</option>
                  <option value="home" {{homeSelected}}>Home</option>
                  <option value="away" {{awaySelected}}>Away</option>
                  <option value="form" {{formSelected}}>Form</option>
                </select>
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
              <league-schedule id="mobile-schedule" is-mobile="true" can-edit="true"></league-schedule>
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
          <league-calendar id="mobile-calendar"></league-calendar> 
        </div>
        <div class="panel">
          <div class="panel-header panel-header-shared">Upcoming Fixtures</div>
          <league-matches-upcoming id="mobile-upcoming-fixtures" is-mobile="true"></league-matches-upcoming>
        </div>
        <div class="panel">
          <div class="panel-header panel-header-shared">Recent Results</div>
          <league-matches-recent id="mobile-recent-matches" is-mobile="true"></league-matches-recent>
        </div>
        <div class="panel">
          <div class="panel-header panel-header-shared">Requiring Attention</div>
          <league-matches-attention id="mobile-attention-matches" is-mobile="true"></league-matches-attention>
        </div>
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
            <span class="settings-icon" title="Edit League Settings">⚙️</span>
          </div>
          <div class="view-container" id="desktop-table-view">
            <div class="title title-with-filter">
              <span>{{title}}</span>
              <div class="dropdown-shared">
                <select id="table-filter-select" class="dropdown-select-shared">
                  <option value="overall" {{overallSelected}}>Overall</option>
                  <option value="home" {{homeSelected}}>Home</option>
                  <option value="away" {{awaySelected}}>Away</option>
                  <option value="form" {{formSelected}}>Form</option>
                </select>
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
              <league-schedule id="desktop-schedule" can-edit="true"></league-schedule>
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
            <league-calendar id="desktop-calendar"></league-calendar>
          </div>
          <div class="panel">
            <div class="panel-header panel-header-shared">Upcoming Fixtures</div>
            <league-matches-upcoming id="desktop-upcoming-fixtures"></league-matches-upcoming>
          </div>
          <div class="panel">
            <div class="panel-header panel-header-shared">Recent Results</div>
            <league-matches-recent id="desktop-recent-matches"></league-matches-recent>
          </div>
          <div class="panel">
            <div class="panel-header panel-header-shared">Requiring Attention</div>
            <league-matches-attention id="desktop-attention-matches"></league-matches-attention>
          </div>
        </div>
      </div>
    `;
