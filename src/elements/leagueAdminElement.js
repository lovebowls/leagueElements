// Define custom event types for the new element
class LeagueAdminElementEvent extends CustomEvent {
  constructor(type, detail) {
    super(type, { // Allow specifying event type
      detail,
      bubbles: true,
      composed: true
    });
  }
}

// Import the LeagueMatchesAttention component
import './LeagueMatchesAttention.js';
import './leagueMatch.js';
// ADDED IMPORTS for shared modal and form styles
import { utilityStyles, panelStyles, buttonStyles, modalStyles, formStyles, listItemStyles } from './shared-styles.js';
// Import Temporal API utilities
import { Temporal, TemporalUtils } from '../utils/temporalUtils.js';

class LeagueAdminElement extends HTMLElement {
  // Base styles shared between mobile and desktop layouts
  static get BASE_STYLES() {
    return `
      ${utilityStyles} /* ADDED SHARED STYLE */
      ${panelStyles}   /* ADDED SHARED STYLE */
      ${buttonStyles}  /* ADDED SHARED STYLE */
      ${modalStyles}   /* ADDED SHARED MODAL STYLE */
      ${formStyles}    /* ADDED SHARED FORM STYLE */
      ${listItemStyles} /* ADDED SHARED LIST ITEM STYLE */
      :host {
        display: block;
        border: 1px solid var(--lae-border-color-medium, #ccc); 
        font-family: var(--lae-font-family-main, 'Open Sans', Helvetica, Arial, sans-serif); 
        box-sizing: border-box;
        color: var(--lae-text-color-primary, #333); 

        /* ADMIN THEME VARIABLES (lae prefix for LeagueAdminElement) */
        --lae-font-family-main: 'Open Sans', Helvetica, Arial, sans-serif;
        --lae-font-size-base-desktop: 1em;
        --lae-font-size-base-mobile: 2em; 

        --lae-font-size-small: 0.85em; 
        --lae-font-size-medium: 1em;   
        --lae-font-size-large: 1.2em;  
        --lae-font-size-xlarge: 1.5em; 

        --lae-text-color-primary: #333;
        --lae-text-color-secondary: #666;
        --lae-text-color-accent: #007bff; 
        --lae-text-color-accent-hover: #0056b3;
        --lae-text-color-error: #D8000C;
        --lae-text-color-success: #4CAF50;
        --lae-text-color-on-primary: #fff;

        /* LAE Status Colors - Mapped from LE or defined if different */
        --lae-color-status-warning: var(--le-color-status-warning, #f39c12);
        --lae-color-status-conflict: var(--le-color-status-conflict, #e67e22);
        --lae-color-status-pending: var(--le-color-status-pending, #e74c3c);
        --lae-color-status-info: var(--le-color-status-info, #2196f3);
        --lae-color-status-success: var(--le-color-status-success, #4CAF50);

        --lae-background-color-host-desktop: #f8f9fa; 
        --lae-background-color-host-mobile: #f5f5f5;
        --lae-background-color-panel: #fff;
        --lae-background-color-header: #f5f5f5;
        --lae-background-color-button: #f0f0f0;
        --lae-background-color-button-hover: #e0e0e0;
        --lae-background-color-button-disabled: #eee;
        --lae-background-color-selected-item: #e9eff7; 
        --lae-background-color-modal-header: #f5f5f5;
        --lae-background-color-error: #FFD2D2;
        --lae-background-color-rink-settings: #f9f9f9;

        --lae-border-color-light: #f0f0f0;
        --lae-border-color-medium: #ddd;
        --lae-border-color-dark: #ccc;
        --lae-border-color-error: #D8000C;
        --lae-border-color-rink-settings: #ccc; 

        --lae-border-radius-standard: 4px;
        --lae-border-radius-large: 8px; 
        --lae-border-radius-mobile-panel: 12px;

        --lae-shadow-mobile-panel: 0 2px 8px rgba(0,0,0,0.06);

        --lae-spacing-unit: 0.25rem;
        --lae-padding-xs: calc(1 * var(--lae-spacing-unit));
        --lae-padding-s: calc(2 * var(--lae-spacing-unit));
        --lae-padding-m: calc(4 * var(--lae-spacing-unit));
        --lae-padding-l: calc(6 * var(--lae-spacing-unit));

        /* --- Mappings for shared-styles.js --- */
        /* These ensure shared components adopt the admin theme */
        --le-padding-xs: var(--lae-padding-xs);
        --le-padding-s: var(--lae-padding-s);
        --le-padding-m: var(--lae-padding-m);
        
        --le-border-color-light: var(--lae-border-color-light);
        --le-border-color-medium: var(--lae-border-color-medium);
        --le-border-color-dark: var(--lae-border-color-dark);

        --le-text-color-primary: var(--lae-text-color-primary);
        --le-text-color-secondary: var(--lae-text-color-secondary);
        --le-text-color-on-primary: var(--lae-text-color-on-primary);

        --le-background-color-header: var(--lae-background-color-header);
        --le-background-color-panel: var(--lae-background-color-panel);
        --le-background-color-button: var(--lae-background-color-button);
        --le-background-color-button-hover: var(--lae-background-color-button-hover);
        --le-background-color-button-disabled: var(--lae-background-color-button-disabled);

        --le-border-radius-standard: var(--lae-border-radius-standard);
        
        --le-font-size-medium: var(--lae-font-size-medium);
        --le-font-size-small: var(--lae-font-size-small);
        /* --- End Mappings --- */

        --main-content-font-size: var(--lae-font-size-base-desktop); 
      }
      /* .sr-only {  REMOVED as it is now in utilityStyles
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      } */
      .header { /* Main header for "League Administration" title. May not use panel-header-shared directly if it has very unique structure */
        font-weight: bold;
        background: var(--lae-background-color-header);
        padding: var(--lae-padding-s);
        border-bottom: 1px solid var(--lae-border-color-medium);
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: var(--lae-font-size-large); /* Specific to this main header */
      }
      .content-area {
        padding: var(--lae-padding-s) var(--lae-padding-xs);
      }
      .league-list-container {
          border-radius: var(--lae-border-radius-mobile-panel);
          box-shadow: var(--lae-shadow-mobile-panel);
          padding: var(--lae-padding-xs);
      }
      .column-leagues .panel-header-shared .action-buttons { /* For New/Copy buttons in Leagues header */
        display: flex; /* Ensure buttons are in a row */
        align-items: center;
        justify-content: flex-end; /* Align these buttons to the right */
        gap: var(--lae-padding-s); /* Space between New/Copy */
        margin-left: auto; /* Push this container to the right of "Leagues" text */
      }
      .league-list-item {
        padding: var(--lae-padding-s) var(--lae-padding-xs);
        /* flex-wrap: wrap; REMOVE - we want items on one line if possible */
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--lae-border-color-light); /* Keep border */
      }
      .league-list-item:last-child {
        border-bottom: none;
      }
      .league-name-text {
        font-size: var(--lae-font-size-medium);
        /* margin-bottom: var(--lae-padding-xs); REMOVE - no longer needed if side-by-side */
        /* flex-basis: 100%; REMOVE - allow it to size naturally / grow */
        flex-grow: 1; /* Allow name to take available space */
        margin-right: var(--lae-padding-s); /* Space before buttons */
        pointer-events: none;
      }
      .league-item-actions-container { /* For View Table/Actions on selected league */
        /* flex-basis: 100%; REMOVE - not needed if side-by-side */
        display: flex;
        justify-content: flex-end;
        gap: var(--lae-padding-s);
        /* margin-top: var(--lae-padding-xs); REMOVE - not needed if side-by-side */
        flex-shrink: 0; /* Prevent button container from shrinking */
        min-height: 32px; /* Reserve space for buttons */
      }
      .league-list-item.selected {
        background-color: var(--lae-background-color-selected-item, #e9eff7);
        font-weight: bold;
      }
      .league-list-item.selected .league-name-text {
         pointer-events: auto; /* Re-enable pointer events for selected text if needed, though likely not */
      }
      .league-action-button { /* These are small icon-like buttons, potentially keep specific styles or create a new shared variant */
        padding: var(--lae-padding-xs) var(--lae-padding-s); 
        border: 1px solid var(--lae-border-color-dark);
        background-color: var(--lae-background-color-button);
        cursor: pointer;
        border-radius: var(--lae-border-radius-standard);
        font-size: var(--lae-font-size-small); 
      }
      .league-action-button:hover {
        background-color: var(--lae-background-color-button-hover);
      }
      .league-action-dropdown .dropdown-content {
         min-width: 120px; 
      }
      .action-buttons { /* Container for main action buttons */
        display: flex;
        gap: var(--lae-padding-s); 
        flex-wrap: wrap; 
        margin-bottom: var(--lae-padding-m);
      }
      /* .action-buttons button styles are covered by .button-shared class in template */
      /* .action-buttons button {
        padding: var(--lae-padding-s) var(--lae-padding-m);
        border: 1px solid var(--lae-border-color-medium);
        background-color: var(--lae-background-color-button);
        cursor: pointer;
        border-radius: var(--lae-border-radius-standard);
        font-size: var(--lae-font-size-medium);
      } */
      /* .action-buttons button:disabled {
        background-color: var(--lae-background-color-button-disabled);
        color: var(--lae-text-color-secondary);
        cursor: not-allowed;
      } */
      /* .action-buttons button:hover:not(:disabled) {
        background-color: var(--lae-background-color-button-hover);
      } */
      .modal {
        display: none; 
        position: fixed; 
        z-index: 1000; 
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto; 
        background-color: rgba(0,0,0,0.4); 
      }
      .modal-content {
        background-color: var(--lae-background-color-panel);
        margin: 10% auto; 
        padding: var(--lae-padding-l);
        border: 1px solid var(--lae-border-color-dark);
        width: 80%; 
        max-width: 600px; 
        border-radius: var(--lae-border-radius-large);
        box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19);
      }
      .modal-header { /* Uses .panel-header-shared in template but has overrides */
        /* padding, border-bottom, font-weight potentially from .panel-header-shared */
        background-color: var(--lae-background-color-modal-header);
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: var(--lae-font-size-large);
         /* Ensure shared padding is applied if not overridden by specificity */
        padding: var(--le-padding-s, 0.5em) var(--le-padding-m, 1em);
        border-bottom: 1px solid var(--le-border-color-medium, #eee);
        font-weight: bold;
      }
      .modal-body {
        padding: var(--lae-padding-m);
      }
      .modal-footer {
        padding: var(--lae-padding-s) var(--lae-padding-m);
        text-align: right;
        border-top: 1px solid var(--lae-border-color-medium);
      }
      .modal-footer button { /* Buttons inside use .button-shared from template */
         margin-left: var(--lae-padding-s); /* Keep specific margin */
      }
      .form-group {
        margin-bottom: var(--lae-padding-m);
      }
      .form-group label {
        display: block;
        margin-bottom: var(--lae-padding-xs);
        font-weight: bold;
      }
      .form-group input[type="text"],
      .form-group input[type="number"],
      .form-group input[type="date"],
      .form-group select {
        width: 100%;
        padding: var(--lae-padding-s);
        border: 1px solid var(--lae-border-color-dark);
        border-radius: var(--lae-border-radius-standard);
        box-sizing: border-box;
        font-size: var(--lae-font-size-medium);
      }
      .form-group input[type="checkbox"] {
        margin-right: var(--lae-padding-s);
      }
      .rink-points-settings {
        border: 1px dashed var(--lae-border-color-rink-settings);
        padding: var(--lae-padding-s);
        margin-top: var(--lae-padding-s);
        background-color: var(--lae-background-color-rink-settings);
      }
      .error {
        color: var(--lae-text-color-error);
        background-color: var(--lae-background-color-error);
        padding: var(--lae-padding-s);
        border: 1px solid var(--lae-border-color-error);
        border-radius: var(--lae-border-radius-standard);
        margin-bottom: var(--lae-padding-m); 
      }
      /* Original column, resizer, panel styles from previous file state */
      /* These might need review after shared styles are fully integrated */
      .column {
        padding: var(--lae-padding-s);
        box-sizing: border-box;
      }
      .columns {
        display: flex;
      }
      .column-leagues {
        width: 30%; 
        min-width: 250px; 
        border-right: 1px solid var(--lae-border-color-medium);
        padding-right: var(--lae-padding-s); 
      }
      .column-details {
        flex-grow: 1; 
        padding-left: var(--lae-padding-s); 
      }
      .resizer {
        width: 10px;
        cursor: col-resize;
        background-color: var(--lae-background-color-header);
        border-left: 1px solid var(--lae-border-color-light);
        border-right: 1px solid var(--lae-border-color-light);
        z-index: 10;
      }
      .panel { /* This class is used on #teams-panel and #matches-panel */
        margin-bottom: var(--lae-padding-m);
        border: 1px solid var(--lae-border-color-light);
        border-radius: var(--lae-border-radius-standard);
      }
      .panel .panel-header { /* Styles for panel headers that have .panel-header-shared in template */
         /* Shared properties from .panel-header-shared apply */
         /* Overrides or additional styles for these specific panel headers: */
         font-size: var(--lae-font-size-medium); 
         display: flex; /* Ensure these are flex for button alignment */
        justify-content: space-between;
        align-items: center;
         background-color: var(--lae-background-color-header); /* Ensure admin context bg */
      }
      /* .panel .panel-content is covered by .panel-content-shared in template */

      .teams-list, .matches-list { /* These are direct children of panel-content-shared divs */
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .teams-list li, .matches-list li {
        padding: var(--lae-padding-xs);
        border-bottom: 1px solid var(--lae-border-color-light);
      }
      .teams-list li:last-child, .matches-list li:last-child {
        border-bottom: none;
      }
      .close-button {
        color: var(--lae-text-color-secondary, #aaa);
        float: right;
        font-size: 1.5em; 
        font-weight: bold;
        cursor: pointer;
      }
      .close-button:hover,
      .close-button:focus {
        color: var(--lae-text-color-primary, #000);
        text-decoration: none;
      }
      .hidden {
        display: none !important;
      }
      .dropdown {
        position: relative;
        display: inline-block;
        z-index: 2;
      }
      .dropdown-content {
        display: none;
        position: absolute;
        background-color: var(--lae-background-color-panel, #f9f9f9);
        /* min-width: 160px; REMOVED */
        min-width: auto;
        width: fit-content;
        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
        z-index: 100;
        border-radius: var(--lae-border-radius-standard);
        border: 1px solid var(--lae-border-color-medium);
        top: 100%;
        right: 0;
      }
      .dropdown-content button { /* Assuming these are also to be styled as shared buttons or a variant */
        color: var(--lae-text-color-primary, black);
        padding: var(--lae-padding-s) var(--lae-padding-m);
        text-decoration: none;
        display: block;
        width: 100%;
        text-align: left;
        background: none;
        border: none;
        cursor: pointer;
        font-size: var(--lae-font-size-small);
      }
      .dropdown-content button:hover {
        background-color: var(--lae-background-color-button-hover, #f1f1f1);
      }
      .dropdown.show .dropdown-content {
        display: block;
      }
      #admin-matches-attention-container league-matches-attention {
          font-size: var(--lae-font-size-small); /* Adjust font size for attention component within admin panel */
      }
      #main-title {
        font-size: var(--lae-font-size-xlarge);
      }
      .header-actions {
        /* Styles for the container of header actions if needed */
      }
      .header-actions button svg {
        vertical-align: middle; /* Align icon better with text if any */
        margin-right: var(--lae-padding-xs); /* Space between icon and text if text is shown */
      }

      /* Ensuring specificity for panel headers within the specific columns if needed */
      .column-leagues .panel-header,
      .column-details .panel-header {
          /* These already have .panel-header-shared in template, so shared styles apply. */
          /* Add specific overrides here if .panel-header-shared is not enough */
          /* For example, to ensure they use the correct background for admin context: */
          background-color: var(--lae-background-color-header);
      }

    `;
  }

  // Mobile-specific styles
  static get MOBILE_STYLES() {
    return `
      ${LeagueAdminElement.BASE_STYLES}

      :host {
        background: var(--lae-background-color-host-mobile, #f5f5f5);
        border: none;
        border-radius: 0;
        padding: var(--lae-padding-s);
        min-height: 100vh;
        font-size: var(--lae-font-size-base-mobile, 2em); /* Use mobile base font size */
        --main-content-font-size: var(--lae-font-size-base-mobile, 2em); /* For children expecting this */
      }
      .columns { /* Main container for left/right columns */
        display: flex;
        flex-direction: column;
        gap: var(--lae-padding-m); /* Add gap between stacked columns */
      }
      .column-leagues,
      .column-details {
        width: 100%; /* Make columns full width */
        min-width: 0;
        border: none; /* Remove borders specific to desktop layout */
        padding: 0; /* Reset padding, let panels handle their own */
      }
      .dashboard { /* Mobile dashboard layout - This class seems unused, .columns is the primary */
        display: flex;
        flex-direction: column;
        gap: 0;
        width: 100%;
      }
      .left-panel,
      .right-panel {
        width: 100%;
        min-width: 0;
        border: none;
        border-radius: 0;
        background: none;
        padding: 0;
        margin: 0;
        display: block;
      }
      .resizer {
        display: none !important;
      }
      .content-area {
        padding: var(--lae-padding-s) var(--lae-padding-xs);
      }
      .league-list-container {
          border-radius: var(--lae-border-radius-mobile-panel);
          box-shadow: var(--lae-shadow-mobile-panel);
          padding: var(--lae-padding-xs);
      }
      .league-list-item {
        padding: var(--lae-padding-s) var(--lae-padding-xs); /* Adjusted padding */
        flex-wrap: wrap; 
      }
      .league-name-text {
        font-size: var(--lae-font-size-medium); /* Relative to host (now 2em based) */
        margin-bottom: var(--lae-padding-xs);
      }
      .league-item-actions-container {
        flex-basis: 100%; 
        justify-content: flex-end; 
        margin-top: var(--lae-padding-xs);
        min-height: 32px; /* Reserve space for buttons */
      }
      .league-action-button { /* Smaller buttons in league list items */
        padding: var(--lae-padding-xs) var(--lae-padding-s);
        font-size: var(--lae-font-size-small); /* Relative to host */
        min-height: 38px;
      }
      .league-action-dropdown .dropdown-content {
        min-width: 140px;
      }
      .header { /* "League Administration" title in mobile */
        font-size: var(--lae-font-size-large); /* Relative to host */
        font-weight: bold;
        padding: var(--lae-padding-s) var(--lae-padding-xs);
        background: none;
        border: none;
        margin-bottom: var(--lae-padding-s);
      }
      .action-buttons { /* New, Copy etc. buttons container */
        margin-bottom: var(--lae-padding-s);
        gap: var(--lae-padding-s);
      }
      .action-buttons button { /* New, Copy etc. buttons */
        min-height: 44px;
        font-size: var(--lae-font-size-medium); /* Relative to host */
        padding: var(--lae-padding-s) var(--lae-padding-m);
        border-radius: var(--lae-border-radius-standard);
        margin-bottom: var(--lae-padding-xs);
      }
      .panel, /* Applies to Teams, Matches, Attention panels in mobile */
      #admin-teams-panel,
      #admin-matches-panel,
      #admin-attention-panel {
        border: none;
        border-radius: var(--lae-border-radius-mobile-panel);
        background: var(--lae-background-color-panel);
        box-shadow: var(--lae-shadow-mobile-panel);
        padding: var(--lae-padding-s) var(--lae-padding-m);
        margin: 0 0 var(--lae-padding-m) 0;
        width: 100%;
        box-sizing: border-box;
        display: block;
      }
      .panel-header { /* Mobile panel headers for Teams panel */
        display: flex; /* Ensure it's flex */
        flex-direction: row; /* Align items in a row */
        justify-content: space-between; /* Space between title and button */
        align-items: center; /* Vertically align items */
        font-size: var(--lae-font-size-medium); /* Relative to host */
        font-weight: bold;
        margin-bottom: var(--lae-padding-s);
        background: none; /* Keep transparent background */
        border: none; /* Keep no border */
        padding: var(--lae-padding-xs) 0;
      }
      .panel-header h4 {
          margin-bottom: 0;
          margin-right: auto; /* Push button to the right if h4 is used */
      }
      .panel-header button { /* Add Team button */
        font-size: var(--lae-font-size-medium); /* Relative to host */
        padding: var(--lae-padding-s) var(--lae-padding-m); /* Keep existing padding */
        margin-top: 0; /* Remove top margin */
        margin-left: var(--lae-padding-s); /* Add some left margin if needed, or rely on space-between */
      }
      
      /* Team list item styling for mobile */
      #teams-list li.team-item {
        list-style-type: none; 
        display: flex;
        flex-direction: column; 
        padding: var(--lae-padding-s) 0; 
        border-bottom: 1px solid var(--lae-border-color-light);
      }
      #teams-list li.team-item:last-child {
        border-bottom: none;
      }
      #teams-list li.team-item .team-name {
        margin-bottom: var(--lae-padding-s); 
        font-size: var(--lae-font-size-medium); 
      }
      #teams-list li.team-item .team-actions {
        display: flex;
        justify-content: flex-end; 
        gap: var(--lae-padding-s);
        min-height: 32px; /* Reserve space for buttons */
      }
      /* End of Team list item styling for mobile */

      .team-name { /* General .team-name, may be overridden by more specific above */
        font-size: var(--lae-font-size-medium); /* Relative to host */
      }
      .team-actions button { /* General .team-actions button, may be overridden */
        font-size: var(--lae-font-size-small); /* Relative to host */
      }

      .match-item { /* For items within Matches panel in mobile */
        font-size: var(--lae-font-size-medium); /* Relative to host */
        padding: var(--lae-padding-s) var(--lae-padding-xs);
      }
      .match-date {
        font-size: var(--lae-font-size-small); /* Relative to host */
      }
      .match-team { 
        font-size: var(--lae-font-size-medium);   /* Relative to host */
      }
      .match-score {
        font-size: var(--lae-font-size-medium);   /* Relative to host */
        padding: 0 var(--lae-padding-xs);
      }
      .match-status {
        font-size: var(--lae-font-size-small); /* Relative to host */
        align-self: center; 
      }
      .team-item.selected-team { /* ADDED for mobile selection highlight */
        background-color: var(--lae-background-color-selected-item, #e9eff7); 
        /* font-weight: bold; */
      }
    `;
  }

  // Desktop-specific styles
  static get DESKTOP_STYLES() {
    return `
      ${LeagueAdminElement.BASE_STYLES} /* Includes :host variables */
      :host {
         padding: var(--lae-padding-m);
         height: 100%;
         font-size: var(--lae-font-size-base-desktop); /* Set desktop base font size */
         background-color: var(--lae-background-color-host-desktop);
         --main-content-font-size: var(--lae-font-size-base-desktop); /* For children */
      }
      /* .dashboard, .left-panel, .right-panel, .resizer use variables defined in BASE_STYLES */
      /* .panel and .panel-header in desktop will use variables from BASE_STYLES */
      /* Specific overrides for desktop panel headers: */
      .panel-header { 
        font-size: var(--lae-font-size-large); /* Larger for desktop panel titles */
        flex-direction: row; 
        align-items: center; 
        background: var(--lae-background-color-header); 
        border-bottom: 1px solid var(--lae-border-color-medium); 
        padding: var(--lae-padding-s); 
      }
      .panel-header h4 {
          margin-bottom: 0;
      }
      .panel-header button { /* Add Team/Match on Desktop */
        font-size: var(--lae-font-size-small); /* Smaller than main action buttons */
        padding: var(--lae-padding-xs) var(--lae-padding-s);
        margin-left: auto; /* Push to the right */
      }

      /* Team list item styling for desktop */
      #teams-list li.team-item {  /* Using ID selector */
        list-style-type: none; /* Remove bullets */
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--lae-padding-xs) 0; /* Vertical padding, horizontal handled by parent */
        border-bottom: 1px solid var(--lae-border-color-light); /* Add a separator line if desired */
      }
      #teams-list li.team-item:last-child { /* Using ID selector */
        border-bottom: none; /* Remove border for the last item */
      }
      #teams-list li.team-item .team-name {  /* Using ID selector */
        flex-grow: 1; 
        margin-right: var(--lae-padding-s); 
      }
      #teams-list li.team-item .team-actions {  /* Using ID selector */
        display: flex; /* Ensure buttons inside actions are also in a row */
        gap: var(--lae-padding-s); 
        flex-shrink: 0; 
        min-height: 32px; /* Reserve space for buttons */
      }
      /* .team-actions button styles are covered by .button-shared.button-sm */
      
      .league-list-container {
        flex-shrink: 0; 
        /* REMOVED max-height: 40%; */
        /* REMOVED overflow-y: auto; */
      }
      .league-list-item.selected {
        background-color: var(--lae-background-color-selected-item); 
      }
      .league-item-actions-container {
        flex-shrink: 0; 
        min-height: 32px; /* Reserve space for buttons */
      }
      .league-action-button { /* View Table, Actions buttons in league list for desktop */
        font-size: var(--lae-font-size-small); /* Uses base style, already small */
        padding: var(--lae-padding-xs) var(--lae-padding-s);
      }
      /* REMOVED: Override for desktop dropdown to open upwards */
      /* .league-list-item .dropdown-content {
        bottom: 100%; 
        top: auto; 
        right: 0; 
      } */
      
      .teams-list-container, .matches-list-container {
        flex-grow: 1; 
        overflow-y: auto; 
        min-height: 100px; 
      }
      .team-item.selected-team { /* ADDED for desktop selection highlight */
        background-color: var(--lae-background-color-selected-item, #e9eff7); 
        /* font-weight: bold; /* Optionally make text bold */
      }
    `;
  }

  // Base HTML template (placeholders will be filled by render logic)
  static get TEMPLATE_CONTENT() {
    return `
          <div class="header">
      <div id="main-title">League Administration</div>
      <div class="header-actions">
      </div>
            </div>
            
    <div id="error-message" class="error" style="display: none;"></div>

    <div class="content-area">
      <div class="columns">
        <div class="column column-leagues">
          <div class="panel">
            <div class="panel-header panel-header-shared">
              <span>Leagues</span>
              <div class="action-buttons"> 
                <button id="new-league-button" class="button-shared">New</button>
                <button id="copy-league-button" class="button-shared" disabled>Copy</button>
            </div>
          </div>
            <div class="league-list-container panel-content panel-content-shared">
              <ul class="league-list" id="league-list-ul"></ul>
            </div>
          </div>
          <div class="action-buttons"> 
             <!-- REMOVED update-league-button -->
             <!-- REMOVED delete-league-button -->
             <!-- REMOVED view-table-button -->
            </div>
            </div>

        <div class="resizer" id="resizer"></div>

        <div class="column column-details">
          <div id="teams-panel" class="panel" style="display:none;">
            <div class="panel-header panel-header-shared"> 
              <span>Teams</span>
              <button id="add-team-button" class="button-shared">Add Team</button>
          </div>
            <div id="teams-list" class="panel-content panel-content-shared"></div> 
              </div>

          <!-- LeagueMatchesAttention moved here, directly under Teams panel -->
          <div id="admin-matches-attention-container" class="panel" style="margin-bottom: var(--lae-padding-m);">
              <div class="panel-header panel-header-shared">
                <span>Requiring Attention</span>
              </div>
              <div class="panel-content panel-content-shared">
                <league-matches-attention id="admin-attention-matches" data-league-id=""></league-matches-attention>
              </div>
          </div>

          <!-- REMOVED The entire matches-panel div -->
          <!-- 
          <div id="matches-panel" class="panel" style="display:none;">
            <div class="panel-header panel-header-shared"> 
              <span>Matches</span>
              <button id="add-match-button" class="button-shared">Add Match</button>
            </div>
            <div id="matches-list" class="panel-content panel-content-shared"></div> 
          </div>
          -->

        </div>
      </div>
          </div>
      
    <!-- Global League Actions Menu -->
    <div id="league-actions-global-menu" class="dropdown-content" style="display: none; position: fixed; z-index: 1001;">
        <!-- Content will be populated by JS -->
      </div>
      
    <!-- Modal for New/Edit League -->
    <div id="league-modal" class="modal-shared-overlay">
        <div class="modal-shared-content">
        <div class="modal-shared-header">
          <span id="league-modal-title">New League</span>
          <span class="close-button close-button-shared" id="close-league-modal">&times;</span>
          </div>
        <div class="modal-shared-body" id="league-modal-body">
          <!-- Form content will be injected here by JS -->
          </div>
          <div class="modal-shared-footer">
          <button id="save-league-button" class="button-shared">Save</button>
          <button id="cancel-league-button" class="button-shared">Cancel</button>
          </div>
        </div>
      </div>
      
    <!-- Modal for New/Edit Team -->
    <div id="team-modal" class="modal-shared-overlay">
        <div class="modal-shared-content">
            <div class="modal-shared-header">
                <span id="team-modal-title">Add Team</span>
                <span class="close-button close-button-shared" id="close-team-modal">&times;</span>
          </div>
            <div class="modal-shared-body" id="team-modal-body">
                <!-- Form content will be injected by JS -->
          </div>
          <div class="modal-shared-footer">
                <button id="save-team-button" class="button-shared">Save</button>
                <button id="cancel-team-button" class="button-shared">Cancel</button>
          </div>
        </div>
      </div>

    <!-- Modal for Add/Edit Match -->
    <league-match id="match-modal-instance" is-admin-context="true"></league-match>
    `;
  }

  constructor() {
    super();
    this.LOG_PREFIX = "[LAD_LIFE_CYCLE] ";
    this.shadow = this.attachShadow({ mode: 'open' });
    this._elementTitle = this.getAttribute('elementTitle') || 'League Administration';
    this._leagues = [];
    this._selectedLeagueId = null; // Store ID of the selected league
    this._currentLeagueId = null; // Store ID of the league to be pre-selected
    this._selectedTeamValue = null; // CHANGED: Track selected team by value instead of name
    this._isModalVisible = false;
    this._modalMode = 'new'; // 'new', 'edit', 'copy'
    this._data = null; // To store the raw data from attribute
    
    // New properties for team management
    this._teamModalMode = null; // 'new' or 'edit'
    this._teamBeingEdited = null; // Store the team being edited as {value, label}
    this._lovebowlsTeams = []; // CHANGED: Store lovebowls teams data as [{value, label}] objects
    
    // New properties for match management
    this.matchModalOpen = false;
    this.matchModalData = null;
    this.matchModalTeams = [];
    this.matchModalMode = 'new';

    this._boundHandleDocumentClickForGlobalMenu = null; // For global menu closing
  }

  static get observedAttributes() {
    return ['elementTitle', 'data', 'is-mobile', 'current-league-id', 'lovebowls-teams']; 
  }

  connectedCallback() {
    this._elementTitle = this.getAttribute('elementTitle') || this._elementTitle;
    this._currentLeagueId = this.getAttribute('current-league-id') || null;
    const rawData = this.getAttribute('data');
    console.log('[LeagueAdminElement] connectedCallback: is-mobile attribute:', this.getAttribute('is-mobile'));
    if (rawData) {
        this._parseAndLoadData(rawData);
    }
    this.render();
  }

  disconnectedCallback() {
    // Ensure global menu handler is cleaned up if active
    if (this._boundHandleDocumentClickForGlobalMenu) {
        document.removeEventListener('click', this._boundHandleDocumentClickForGlobalMenu);
        this._boundHandleDocumentClickForGlobalMenu = null;
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    let needsRender = false;
    if (name === 'elementTitle') {
      this._elementTitle = newValue || 'League Administration';
      needsRender = true;
    } else if (name === 'data') {
      // ADD LOG
      console.log(this.LOG_PREFIX + `attributeChangedCallback('data'): BEFORE _parseAndLoadData. _selectedLeagueId = ${this._selectedLeagueId}`);
      this._parseAndLoadData(newValue);
      // ADD LOG
      console.log(this.LOG_PREFIX + `attributeChangedCallback('data'): AFTER _parseAndLoadData. _selectedLeagueId = ${this._selectedLeagueId}`);
      needsRender = true; // Data change always triggers a full re-render of the list
    } else if (name === 'is-mobile') {
      needsRender = true;
    } else if (name === 'current-league-id') {
      // ADD LOG
      console.log(this.LOG_PREFIX + `attributeChangedCallback('current-league-id'): NewVal=${newValue}. Old _currentLeagueId=${this._currentLeagueId}. Current _selectedLeagueId=${this._selectedLeagueId}`);
      this._currentLeagueId = newValue || null;
      // Apply selection only if we have leagues loaded already
      if (this._leagues && this._leagues.length > 0) {
        const oldSelectedIdBeforeApply = this._selectedLeagueId;
        needsRender = this._applyCurrentLeagueIdSelection();
        console.log(this.LOG_PREFIX + `attributeChangedCallback('current-league-id'): AFTER _applyCurrentLeagueIdSelection. _selectedLeagueId changed from ${oldSelectedIdBeforeApply} to ${this._selectedLeagueId}. needsRender=${needsRender}`);
      } else {
       console.log(this.LOG_PREFIX + `attributeChangedCallback('current-league-id'): No leagues or empty _leagues array, skipping _applyCurrentLeagueIdSelection.`);
      }
    } else if (name === 'lovebowls-teams') { 
      this._parseLovebowlsTeamsData(newValue);
      // No need to re-render here unless the modal is already open
    }

    if (needsRender) {
      // ADD LOG
      console.log(this.LOG_PREFIX + `attributeChangedCallback: Triggering render for attribute '${name}'. Current _selectedLeagueId=${this._selectedLeagueId}`);
      this.render();
    }
    // Dispatch an event about the attribute change
    this.dispatchEvent(new LeagueAdminElementEvent('attributeChanged', { name, oldValue, newValue }));
  }

  _parseAndLoadData(dataString) {
    console.log(this.LOG_PREFIX + `_parseAndLoadData: CALLED. Initial _selectedLeagueId = ${this._selectedLeagueId}`);
    this.clearError();

    // Store the current selection state before any changes
    const previouslySelectedLeagueId = this._selectedLeagueId;
    console.log(this.LOG_PREFIX + `_parseAndLoadData: Stored previouslySelectedLeagueId = ${previouslySelectedLeagueId}`);

    // Reset team selection and menu, but NOT the league selection yet
    this._selectedTeamValue = null;
    this._hideGlobalLeagueMenu();

    if (!dataString) {
        console.log(this.LOG_PREFIX + `_parseAndLoadData: dataString is empty. Clearing leagues.`);
        this._leagues = [];
        this._data = null;
        this._selectedLeagueId = null; // Clear selection if no data
        console.log(this.LOG_PREFIX + `_parseAndLoadData: dataString empty, SET _selectedLeagueId to null.`);
        this.dispatchEvent(new LeagueAdminElementEvent('dataProcessed', { status: 'success', message: 'Data cleared.' }));
        return;
    }
    try {
      // Ensure dataString is valid before parsing
      if (dataString === 'undefined' || dataString === 'null') {
        throw new Error(`Invalid data string: ${dataString}`);
      }
      
      const parsedData = JSON.parse(dataString);
      if (Array.isArray(parsedData)) {
        // Standardize team format in the parsed leagues data
        this._leagues = parsedData.map(league => {
          // Make a copy of the league to avoid modifying the original
          const standardizedLeague = {...league};
          
          // Ensure teams array always exists and has the proper format {value, label}
          if (!Array.isArray(standardizedLeague.teams)) {
            standardizedLeague.teams = [];
          }
          
          return standardizedLeague;
        });
        
        this._data = this._leagues; // Store the standardized data

        // Check if previously selected league still exists in the new data
        const previousLeagueStillExists = previouslySelectedLeagueId && 
                                         this._leagues.some(l => (l._id || l.name) === previouslySelectedLeagueId);

        // If the previously selected league still exists, keep it selected
        if (previousLeagueStillExists) {
          console.log(this.LOG_PREFIX + `_parseAndLoadData: Previously selected league ${previouslySelectedLeagueId} still exists. Keeping it selected.`);
          this._selectedLeagueId = previouslySelectedLeagueId;
        } else {
          console.log(this.LOG_PREFIX + `_parseAndLoadData: Previously selected league ${previouslySelectedLeagueId} not found in new data.`);
          this._selectedLeagueId = null;
          
          // Try to apply current-league-id selection as a fallback
          const oldSelectedIdApply = this._selectedLeagueId;
          this._applyCurrentLeagueIdSelection();
          console.log(this.LOG_PREFIX + `_parseAndLoadData: After _applyCurrentLeagueIdSelection. _selectedLeagueId changed from ${oldSelectedIdApply} to ${this._selectedLeagueId}.`);
        }

        this.dispatchEvent(new LeagueAdminElementEvent('dataLoaded', { leagues: this._leagues }));
        
        // If selection changed due to league being removed, dispatch an event
        if (previouslySelectedLeagueId !== this._selectedLeagueId) {
          this.dispatchEvent(new LeagueAdminElementEvent('leagueSelected', { leagueId: this._selectedLeagueId }));
        }
      } else {
        this.showError('Invalid data format: Expected an array of leagues.');
        this._leagues = [];
        this._data = null;
         this.dispatchEvent(new LeagueAdminElementEvent('dataError', { message: 'Invalid data format: Expected an array of leagues.' }));
      }
    } catch (error) {
      this.showError(`Failed to parse league data: ${error.message}`);
      console.error('Parse error details:', error, 'Data string was:', dataString);
      this._leagues = [];
      this._data = null;
      this.dispatchEvent(new LeagueAdminElementEvent('dataError', { message: `Failed to parse league data: ${error.message}`, errorObj: error }));
      this._selectedLeagueId = null; // Also clear on error
      console.error(this.LOG_PREFIX + `_parseAndLoadData: Parse error, SET _selectedLeagueId to null.`);
    }
  }

  // Parse lovebowls teams data from attribute - expects {value, label} format
  _parseLovebowlsTeamsData(dataString) {
    if (!dataString) {
      this._lovebowlsTeams = [];
      return;
    }
    
    try {
      const parsedData = JSON.parse(dataString);
      if (Array.isArray(parsedData)) {
        this._lovebowlsTeams = parsedData;
        this.dispatchEvent(new LeagueAdminElementEvent('lovebowlsTeamsLoaded', { teams: this._lovebowlsTeams }));
      } else {
        console.error('Invalid lovebowls teams data format: Expected an array of teams');
        this._lovebowlsTeams = [];
      }
    } catch (error) {
      console.error(`Failed to parse lovebowls teams data: ${error.message}`);
      this._lovebowlsTeams = [];
    }
  }

  // Helper method to apply currentLeagueId selection
  _applyCurrentLeagueIdSelection() {
    // ADD LOGS
    const initialSelectedId = this._selectedLeagueId;
    console.log(this.LOG_PREFIX + `_applyCurrentLeagueIdSelection: CALLED. _currentLeagueId = ${this._currentLeagueId}, Initial _selectedLeagueId = ${initialSelectedId}`);
    
    if (!this._currentLeagueId || !this._leagues || this._leagues.length === 0) {
      console.log(this.LOG_PREFIX + `_applyCurrentLeagueIdSelection: No _currentLeagueId or no/empty _leagues. No change to _selectedLeagueId.`);
      return false; // No change, no render needed from this
    }

    const leagueExists = this._leagues.some(l => (l._id || l.name) === this._currentLeagueId);
    let selectionChanged = false;

    if (leagueExists) {
      console.log(this.LOG_PREFIX + `_applyCurrentLeagueIdSelection: League for _currentLeagueId (${this._currentLeagueId}) EXISTS.`);
      if (this._selectedLeagueId !== this._currentLeagueId) {
        this._selectedLeagueId = this._currentLeagueId;
        console.log(this.LOG_PREFIX + `_applyCurrentLeagueIdSelection: SET _selectedLeagueId to _currentLeagueId (${this._currentLeagueId}).`);
        this.dispatchEvent(new LeagueAdminElementEvent('leagueSelected', { leagueId: this._selectedLeagueId }));
        selectionChanged = true;
      } else {
        console.log(this.LOG_PREFIX + `_applyCurrentLeagueIdSelection: _selectedLeagueId already matches _currentLeagueId (${this._currentLeagueId}). No change.`);
      }
    } else {
      console.log(this.LOG_PREFIX + `_applyCurrentLeagueIdSelection: League for _currentLeagueId (${this._currentLeagueId}) DOES NOT EXIST.`);
      if (this._selectedLeagueId === this._currentLeagueId) {
        // This case means _selectedLeagueId was pointing to a league (via current-league-id attribute) that is now gone
        this._selectedLeagueId = null;
        console.log(this.LOG_PREFIX + `_applyCurrentLeagueIdSelection: SET _selectedLeagueId to null because it matched a now non-existent _currentLeagueId.`);
        this.dispatchEvent(new LeagueAdminElementEvent('leagueSelected', { leagueId: null }));
        selectionChanged = true;
      } else {
        console.log(this.LOG_PREFIX + `_applyCurrentLeagueIdSelection: _selectedLeagueId (${this._selectedLeagueId}) did not match the non-existent _currentLeagueId. No change to _selectedLeagueId from this path.`);
      }
    }
    
    if (selectionChanged) {
      this._updateButtonStates(); // This should be called if selection changes
    }
    console.log(this.LOG_PREFIX + `_applyCurrentLeagueIdSelection: FINISHED. Final _selectedLeagueId = ${this._selectedLeagueId}. selectionChanged = ${selectionChanged}`);
    return selectionChanged; // Return whether selection actually changed
  }

  showError(message) {
    const errorElement = this.shadow.querySelector('#error-message');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    } else {
      // Fallback if container not ready, though render should ensure it is.
      console.error("Error element not found in shadow DOM. Message:", message);
    }
  }

  clearError() {
    const errorElement = this.shadow.querySelector('#error-message');
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  }

  // Helper method to replace placeholders in template
  _fillTemplate(templateString) {
    return templateString.replace(/{{title}}/g, this._elementTitle);
  }

  render() {
    // It's better to define logPrefix directly if it's only used here, or ensure this.LOG_PREFIX is set.
    const RENDER_LOG_PREFIX = "[LAD_RENDER] "; 
    console.log(RENDER_LOG_PREFIX + `Render start. _selectedLeagueId = ${this._selectedLeagueId}, _currentLeagueId = ${this._currentLeagueId}`);
    const isMobile = this.getAttribute('is-mobile') === 'true';
    // console.log('[LeagueAdminElement] render called. is-mobile attribute:', this.getAttribute('is-mobile'), 'computed isMobile:', isMobile);
    // console.log('[Admin Render] _selectedLeagueId:', this._selectedLeagueId);


    // Safely log this._leagues for debugging
    try {
      if (Array.isArray(this._leagues)) {
        // Log only essential info to avoid large console output if leagues have many matches/teams
        const leagueSummaries = this._leagues.map(l => ({ _id: l._id, name: l.name, teamCount: l.teams ? l.teams.length : 0 }));
        // Guard against massive arrays in logs
        const summaryToLog = leagueSummaries.length > 5 ? leagueSummaries.slice(0,5) : leagueSummaries;
        console.log(RENDER_LOG_PREFIX + `Current _leagues summaries (showing up to 5 of ${leagueSummaries.length}):`, JSON.parse(JSON.stringify(summaryToLog)));
      } else {
        console.warn(RENDER_LOG_PREFIX + `this._leagues is not an array:`, this._leagues);
      }
    } catch (e) {
      console.error(RENDER_LOG_PREFIX + `Error logging this._leagues:`, e);
    }

    let leagueForRender = null;
    const tempLeague = this._getSelectedLeague(); // This can return undefined

    if (tempLeague !== undefined && tempLeague !== null) {
      console.log(RENDER_LOG_PREFIX + `_getSelectedLeague() returned: id=${tempLeague._id}, name=${tempLeague.name}`);
      leagueForRender = tempLeague;
    } else {
      console.log(RENDER_LOG_PREFIX + `_getSelectedLeague() returned undefined or null. _selectedLeagueId was ${this._selectedLeagueId}. leagueForRender remains null.`);
    }
    // console.log('[Admin Render] Current _leagues before getSelectedLeague:', JSON.parse(JSON.stringify(this._leagues)));
    // const leagueForRender = this._getSelectedLeague(); // It's critical this reflects the update
    // console.log('[Admin Render] League object for render:', JSON.parse(JSON.stringify(leagueForRender)));

    this.shadow.innerHTML = `
      <style>
        ${isMobile ? LeagueAdminElement.MOBILE_STYLES : LeagueAdminElement.DESKTOP_STYLES}
      </style>
      ${this._fillTemplate(LeagueAdminElement.TEMPLATE_CONTENT)}
    `;
    
    // Setup resizer
    this._setupResizer();
    // Initial UI setup that happens after main template is in place
    this._renderLeagueList();
    this._updateButtonStates();
    this._attachBaseEventListeners(); // Listeners for New, Modal Close etc.
    
    // If a league was selected, try to re-select it if it still exists
    if (this._selectedLeagueId) {
        const selectedElement = this.shadow.querySelector(`.league-list-item[data-id="${this._selectedLeagueId}"]`);
        if (selectedElement && leagueForRender) { // check leagueForRender exists
            selectedElement.classList.add('selected');
            this._showLeagueSpecificPanels(); // Show the selected league panel (uses _getSelectedLeague() internally)
        } else {
            this._selectedLeagueId = null; // It no longer exists or leagueForRender is null
            this._hideLeagueSpecificPanels(); // Hide the panel
            this._updateButtonStates();
        }
    } else {
        this._hideLeagueSpecificPanels(); // Make sure panel is hidden when no league is selected
        // Hide attention panel if no league selected
        const attentionPanel = this.shadow.querySelector('#admin-attention-panel');
        if (attentionPanel) attentionPanel.style.display = 'none';
    }
    // Update attention panel with selected league's matches
    this._updateAttentionPanel(isMobile, leagueForRender);

    if (this.matchModalOpen) {
      let modal = this.shadow.querySelector('league-match');
      if (modal) modal.remove();
      modal = document.createElement('league-match');
      modal.match = this.matchModalData;
      modal.teams = this.matchModalTeams;
      modal.open = true;
      modal.isMobile = this.getAttribute('is-mobile') === 'true';
      modal.setAttribute('is-mobile', this.getAttribute('is-mobile') === 'true' ? 'true' : 'false');
      modal.mode = this.matchModalMode;
      // Pass attention reason if available in matchModalData
      if (this.matchModalData && this.matchModalData.attentionReason) {
        modal.attentionReason = this.matchModalData.attentionReason;
      }
      
      // ADDED: Debug logging
      console.log('[LeagueAdminElement] Match modal created with isMobile:', modal.isMobile, 
                  'attribute:', modal.getAttribute('is-mobile'),
                  'parent is-mobile attribute:', this.getAttribute('is-mobile'));
      
      modal.addEventListener('match-save', (e) => {
        // Save match to league
        const match = e.detail.match;
        console.log('[Admin Match Save] Received match from event:', JSON.parse(JSON.stringify(match)));

        const selectedLeague = this._getSelectedLeague();
        if (!selectedLeague) {
            console.error('[Admin Match Save] No selected league found.');
            return;
        }
        const updatedLeague = JSON.parse(JSON.stringify(selectedLeague));
        
        if (this.matchModalMode === 'edit' && match.key) {
          const idx = updatedLeague.matches.findIndex(m => m.key === match.key);
          if (idx >= 0) {
            console.log('[Admin Match Save] Match in updatedLeague BEFORE update:', JSON.parse(JSON.stringify(updatedLeague.matches[idx])));
            console.log('[Admin Match Save] Match from event to be assigned:', JSON.parse(JSON.stringify(match)));
            // updatedLeague.matches[idx] = match; // Original problematic line
            // Ensure a proper merge, especially of the result object
            updatedLeague.matches[idx] = {
                ...updatedLeague.matches[idx], // Keep existing properties like key, date, teams
                ...match // Overwrite with incoming changes, including result
            };
            console.log('[Admin Match Save] Match in updatedLeague AFTER update:', JSON.parse(JSON.stringify(updatedLeague.matches[idx])));
          } else {
            console.warn('[Admin Match Save] Edit mode, but match key not found. Appending as new:', JSON.parse(JSON.stringify(match)));
            updatedLeague.matches.push(match); 
          }
        } else {
          console.log('[Admin Match Save] New match mode. Appending match:', JSON.parse(JSON.stringify(match)));
          updatedLeague.matches.push(match);
        }

        // Update the internal _leagues array
        const leagueIndex = this._leagues.findIndex(l => (l._id || l.name) === (selectedLeague._id || selectedLeague.name));
        if (leagueIndex > -1) {
          this._leagues[leagueIndex] = updatedLeague;
          console.log('[Admin Match Save] Updated this._leagues:', JSON.parse(JSON.stringify(this._leagues)));
          console.log('[Admin Match Save] Updated league in array:', JSON.parse(JSON.stringify(this._leagues[leagueIndex])));
        } else {
            console.error('[Admin Match Save] Selected league index not found in _leagues array.');
        }

        this.dispatchEvent(new LeagueAdminElementEvent('requestUpdateLeague', { leagueData: updatedLeague }));
        this.closeMatchModal(); // This will call render() which now uses updated _leagues
      });
      modal.addEventListener('match-cancel', () => {
        this.closeMatchModal();
      });
      this.shadow.appendChild(modal);
    } else {
      let modal = this.shadow.querySelector('league-match');
      if (modal) modal.remove();
    }
  }
  
  _renderLeagueList() {
    const listElement = this.shadow.querySelector('#league-list-ul');
    if (!listElement) return;

    listElement.innerHTML = ''; // Clear existing items

    if (!this._leagues || this._leagues.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No leagues available.';
      li.style.padding = '0.5rem'; // Basic styling for the message
      listElement.appendChild(li);
      return;
    }
    console.log(`[LAD_RENDER_LIST] Rendering ${this._leagues.length} leagues. Current _selectedLeagueId: ${this._selectedLeagueId}`);

    this._leagues.forEach(league => {
      const li = document.createElement('li');
      li.classList.add('league-list-item', 'list-item-shared');
      
      // Add caret icon before the league name
      const caretSpan = document.createElement('span');
      caretSpan.textContent = '▶ '; // Unicode right-pointing triangle
      caretSpan.style.marginRight = '0.5em';
      caretSpan.style.fontSize = '0.8em';
      caretSpan.style.color = 'var(--lae-text-color-secondary, #666)';
      li.appendChild(caretSpan);
      
      const nameSpan = document.createElement('span');
      nameSpan.classList.add('league-name-text', 'list-item-text-primary');
      nameSpan.textContent = league.name || 'Unnamed League';
      li.appendChild(nameSpan);

      const actionsContainer = document.createElement('div');
      actionsContainer.classList.add('league-item-actions-container', 'list-item-actions');
      li.appendChild(actionsContainer);
      
      const leagueId = league._id || league.name; // Prefer _id
      li.setAttribute('data-id', leagueId); 
      
      li.addEventListener('click', () => this._handleLeagueSelect(leagueId));
      
      // Add double-click shortcut for editing leagues in desktop mode
      if (this.getAttribute('is-mobile') !== 'true') {
        li.addEventListener('dblclick', (e) => {
          e.stopPropagation();
          // Select the league first
          this._handleLeagueSelect(leagueId);
          // Then open edit modal
          this._handleEditLeagueRules();
        });
      }
      
      listElement.appendChild(li);
    });
  }

  _handleLeagueSelect(leagueId) {
    // ADD LOGS
    console.log(this.LOG_PREFIX + `_handleLeagueSelect: CALLED with leagueId = ${leagueId}. Current _selectedLeagueId = ${this._selectedLeagueId}`);
    this.clearError();

    const previouslySelectedId = this._selectedLeagueId;
    const previouslySelectedElement = this.shadow.querySelector('.league-list-item.selected');

    // If the clicked league is the same as the currently selected one, do nothing (or handle as a toggle if desired later)
    // For global menu, we might want to show it even if league is already selected, if menu button is clicked.
    // The actual menu opening is now separate from league selection itself.
    if (previouslySelectedId === leagueId && previouslySelectedElement && previouslySelectedElement.getAttribute('data-id') === leagueId) {
        if (this._selectedLeagueId) {
            this._showLeagueSpecificPanels();
        }
        // return; // Do not return, allow actions button to still work.
    }

    // Deselect previous item
    if (previouslySelectedElement && previouslySelectedId !== leagueId) {
      previouslySelectedElement.classList.remove('selected');
      const oldActionsContainer = previouslySelectedElement.querySelector('.league-item-actions-container');
      if (oldActionsContainer) {
        oldActionsContainer.innerHTML = ''; // Clear its dynamic content
      }
    }

    // Select the new league
    this._selectedLeagueId = leagueId;
    const newSelectedItem = this.shadow.querySelector(`.league-list-item[data-id="${leagueId}"]`);

    if (newSelectedItem) {
      newSelectedItem.classList.add('selected');
      const actionsContainer = newSelectedItem.querySelector('.league-item-actions-container');
      if (actionsContainer) {
        this._createAndAppendLeagueActions(actionsContainer, leagueId);
      }
      // BEFORE setting _selectedLeagueId
      const oldId = this._selectedLeagueId;
      this._selectedLeagueId = leagueId;
      // AFTER setting _selectedLeagueId
      console.log(this.LOG_PREFIX + `_handleLeagueSelect: SET _selectedLeagueId from ${oldId} to ${this._selectedLeagueId}`);
      this._showLeagueSpecificPanels();
      this._selectedTeamValue = null;
    } else {
      // League not found in list, effectively deselecting
      this._selectedLeagueId = null;
      this._selectedTeamValue = null; // ADDED: Reset selected team
      this._hideLeagueSpecificPanels();
      const oldId = this._selectedLeagueId;
      this._selectedLeagueId = null;
      console.log(this.LOG_PREFIX + `_handleLeagueSelect: League not found, SET _selectedLeagueId from ${oldId} to null`);
    }
    
    this.dispatchEvent(new LeagueAdminElementEvent('leagueSelected', { leagueId: this._selectedLeagueId }));
    this._updateButtonStates(); // Main action buttons like New, Copy, Delete
  }

  _createAndAppendLeagueActions(container, leagueId) {
    container.innerHTML = ''; // Clear any previous content

    // Only the "..." trigger button remains here
    const btnActions = document.createElement('button');
    btnActions.classList.add('league-action-button', 'actions-dropdown-button'); // Keep styling classes
    btnActions.textContent = '…'; 
    btnActions.title = 'More actions';
    console.log(`[LAD_ACTIONS] Creating '...' button for leagueId: ${leagueId}`);
    btnActions.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log(`[LAD_ACTIONS] '...' button clicked for leagueId: ${leagueId}. Triggering menu.`);
      this._handleOpenGlobalLeagueMenu(leagueId, e.currentTarget); // Call new handler
    });
    container.appendChild(btnActions);
  }

  _showLeagueSpecificPanels() { // Renamed from _showSelectedLeaguePanel
    const selectedLeague = this._getSelectedLeague();
    if (!selectedLeague) {
        this._hideLeagueSpecificPanels();
        return;
    }
    
    this._renderTeamsList();
    
    const attentionContainer = this.shadow.querySelector('#admin-matches-attention-container'); // Changed selector
    if (attentionContainer) attentionContainer.style.display = ''; 
    this._updateAttentionPanel(this.getAttribute('is-mobile') === 'true', selectedLeague);

    const teamsPanelRight = this.shadow.querySelector('#teams-panel');
    
    if (teamsPanelRight) teamsPanelRight.style.display = '';
    
  }
  
  _hideLeagueSpecificPanels() { // Renamed from _hideSelectedLeaguePanel
    const attentionContainer = this.shadow.querySelector('#admin-matches-attention-container'); // Changed selector
    if (attentionContainer) attentionContainer.style.display = 'none';
    this._selectedTeamValue = null; // CHANGED: Reset selected team value

    const teamsPanelRight = this.shadow.querySelector('#teams-panel');
    
    if (teamsPanelRight) teamsPanelRight.style.display = 'none';
    
    const teamsList = this.shadow.querySelector('#teams-list');
    if (teamsList) teamsList.innerHTML = '<li style="padding: 0.5rem;">No league selected.</li>';
    
  }
  
  _renderTeamsList() {
    const selectedLeague = this._getSelectedLeague();
    if (!selectedLeague) return;
    
    const teamsList = this.shadow.querySelector('#teams-list');
    if (!teamsList) return;
    
    teamsList.innerHTML = ''; // Clear existing items
    
    const teams = selectedLeague.teams || [];
    
    if (teams.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No teams available.';
      li.style.padding = '0.5rem';
      teamsList.appendChild(li);
      return;
    }
    
    teams.forEach(team => {
      const li = document.createElement('li');
      li.classList.add('team-item', 'list-item-shared');
      
      // Use team.value as the identifier and team.label for display
      li.dataset.teamValue = team.value; // CHANGED: Use value as the identifier
      
      // Check if this team is the selected one
      if (this._selectedTeamValue === team.value) {
        li.classList.add('selected-team');
      }
      
      const nameSpan = document.createElement('span');
      nameSpan.classList.add('team-name', 'list-item-text-primary');
      nameSpan.textContent = team.label; // CHANGED: Display the label instead of name
      
      // Add a small indicator if this is a lovebowls team (optional - can check if value != label)
      if (team.value !== team.label) {
        const indicator = document.createElement('small');
        indicator.style.marginLeft = '0.5em';
        indicator.style.opacity = '0.7';
        indicator.textContent = '(LB)'; // Lovebowls indicator
        nameSpan.appendChild(indicator);
      }
      
      li.appendChild(nameSpan);
      
      const actionsDiv = document.createElement('div');
      actionsDiv.classList.add('team-actions', 'list-item-actions');
      li.appendChild(actionsDiv);

      // Add click listener to the list item itself
      li.addEventListener('click', (e) => {
        e.stopPropagation(); 
        this._handleTeamSelect(team); // Pass the whole team object
      });
      
      // Add double-click shortcut for editing teams in desktop mode
      if (this.getAttribute('is-mobile') !== 'true') {
        li.addEventListener('dblclick', (e) => {
          e.stopPropagation();
          this._handleEditTeam(team);
        });
      }
      
      // If this is the selected team, add action buttons
      if (this._selectedTeamValue === team.value) {
        this._createAndAppendTeamActions(actionsDiv, team);
      }
      
      teamsList.appendChild(li);
    });
  }

  _handleTeamSelect(team) {
    const teamValue = team.value; // CHANGED: Use value as identifier

    // Deselect previously selected team item
    if (this._selectedTeamValue && this._selectedTeamValue !== teamValue) {
      const prevSelectedLi = this.shadow.querySelector(`.team-item[data-team-value="${this._selectedTeamValue}"]`);
      if (prevSelectedLi) {
        prevSelectedLi.classList.remove('selected-team');
        const prevActionsDiv = prevSelectedLi.querySelector('.team-actions');
        if (prevActionsDiv) {
          prevActionsDiv.innerHTML = ''; // Clear its buttons
        }
      }
    }

    // Handle new selection
    const currentSelectedLi = this.shadow.querySelector(`.team-item[data-team-value="${teamValue}"]`);
    if (!currentSelectedLi) return; // Should not happen if click is on an item

    if (this._selectedTeamValue === teamValue) {
      // Clicked on already selected team: toggle visibility (hide actions)
      currentSelectedLi.classList.remove('selected-team');
      const actionsDiv = currentSelectedLi.querySelector('.team-actions');
      if (actionsDiv) {
        actionsDiv.innerHTML = '';
      }
      this._selectedTeamValue = null;
    } else {
      // Clicked on a new team: show actions
      currentSelectedLi.classList.add('selected-team');
      this._selectedTeamValue = teamValue;
      const actionsDiv = currentSelectedLi.querySelector('.team-actions');
      if (actionsDiv) {
        this._createAndAppendTeamActions(actionsDiv, team);
      }
    }
  }

  _createAndAppendTeamActions(actionsContainer, team) {
    actionsContainer.innerHTML = ''; // Clear previous buttons

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.classList.add('button-shared', 'button-sm');
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent li click handler
      this._handleEditTeam(team);
    });
    actionsContainer.appendChild(editBtn);

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.classList.add('button-shared', 'button-sm');
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent li click handler
      this._handleRemoveTeam(team);
    });
    actionsContainer.appendChild(removeBtn);
  }

  _updateButtonStates() {
    const btnCopy = this.shadow.querySelector('#copy-league-button');
    const btnUpdate = this.shadow.querySelector('#update-league-button');
    const btnDelete = this.shadow.querySelector('#delete-league-button');

    const isLeagueSelected = !!this._selectedLeagueId;

    if (btnCopy) btnCopy.disabled = !isLeagueSelected;
    if (btnUpdate) btnUpdate.disabled = !isLeagueSelected;
    if (btnDelete) btnDelete.disabled = !isLeagueSelected;
  }

  _attachBaseEventListeners() {
    const btnNew = this.shadow.querySelector('#new-league-button');
    const btnCopy = this.shadow.querySelector('#copy-league-button');
    const btnUpdate = this.shadow.querySelector('#update-league-button');
    // Remove reference to the deleted button
    // const btnDelete = this.shadow.querySelector('#delete-league-button');
    const btnCloseModal = this.shadow.querySelector('#close-league-modal');
    const btnCancelModal = this.shadow.querySelector('#cancel-league-button');
    const btnSaveModal = this.shadow.querySelector('#save-league-button');

    if (btnNew) btnNew.addEventListener('click', () => this._handleNewLeague());
    if (btnCopy) btnCopy.addEventListener('click', () => this._handleCopyLeague());
    if (btnUpdate) btnUpdate.addEventListener('click', () => this._handleEditLeagueRules());
    // Remove event listener for deleted button 
    // if (btnDelete) btnDelete.addEventListener('click', () => this._handleDeleteLeague());
    
    if (btnCloseModal) btnCloseModal.addEventListener('click', () => this._hideModal());
    if (btnCancelModal) btnCancelModal.addEventListener('click', () => this._hideModal());
    if (btnSaveModal) btnSaveModal.addEventListener('click', () => this._handleSaveModal());
    
    // Event listeners for View Table, Actions dropdown, and Reset League are now attached dynamically 
    // in _createAndAppendLeagueActions when a league item is selected, because these elements
    // are no longer static in the template.
    // The global document click listener for closing any open dropdowns is handled by _handleDocumentClickForActionsDropdown.

    // Team management event listeners
    const btnAddTeam = this.shadow.querySelector('#add-team-button');
    if (btnAddTeam) {
      btnAddTeam.addEventListener('click', () => this._handleAddTeam());
    }
    
    // Team modal event listeners
    const btnCloseTeamModal = this.shadow.querySelector('#close-team-modal');
    const btnCancelTeamModal = this.shadow.querySelector('#cancel-team-button');
    const btnSaveTeamModal = this.shadow.querySelector('#save-team-button');
    
    if (btnCloseTeamModal) btnCloseTeamModal.addEventListener('click', () => this._hideTeamModal());
    if (btnCancelTeamModal) btnCancelTeamModal.addEventListener('click', () => this._hideTeamModal());
    if (btnSaveTeamModal) btnSaveTeamModal.addEventListener('click', () => this._handleSaveTeamModal());
    
    // Match management event listeners
    // const btnAddMatch = this.shadow.querySelector('#add-match-button'); // REMOVED
    // if (btnAddMatch) { // REMOVED
    //   btnAddMatch.addEventListener('click', () => this._handleAddMatch()); // REMOVED
    // } // REMOVED
  }

  _handleDeleteLeague() {
    this.clearError();
    const leagueIdToDelete = this._currentLeagueIdForMenu; // Use the ID from menu context

    if (!leagueIdToDelete) {
      this.showError("Cannot delete: league context from menu is missing.");
      console.error("[Delete League] _currentLeagueIdForMenu is not set during delete attempt.");
      this._hideGlobalLeagueMenu();
      return;
    }

    // Find the league object from this._leagues using leagueIdToDelete
    const leagueToDeleteObject = Array.isArray(this._leagues) ? this._leagues.find(l => (l._id || l.name) === leagueIdToDelete) : null;

    if (leagueToDeleteObject) {
      // Use the exact ID that was used to find the league (either its _id or name)
      const actualLeagueIdForDispatch = leagueToDeleteObject._id || leagueToDeleteObject.name;

      console.log('[Delete League] League to delete (from menu context):', JSON.parse(JSON.stringify(leagueToDeleteObject)));
      console.log('[Delete League] Using leagueId for deletion dispatch:', actualLeagueIdForDispatch);

      this.dispatchEvent(new LeagueAdminElementEvent('requestDeleteLeague', { leagueId: actualLeagueIdForDispatch }));

      // If the globally selected league was the one deleted, nullify _selectedLeagueId.
      if (this._selectedLeagueId === actualLeagueIdForDispatch) {
        const oldSelectedId = this._selectedLeagueId;
        this._selectedLeagueId = null;
        console.log(`[Delete League] Cleared _selectedLeagueId from ${oldSelectedId} because it matched the deleted league.`);
      }
      
      // After deletion logic, ensure UI reflects that no league (or a different league) might be selected.
      this._hideLeagueSpecificPanels(); // This correctly hides panels if the selected league was deleted.
      this._updateButtonStates();      // Updates main action buttons based on the new _selectedLeagueId state.

    } else {
      this.showError(`League with ID "${leagueIdToDelete}" not found to delete.`);
      console.error(`[Delete League] League with ID "${leagueIdToDelete}" (from _currentLeagueIdForMenu) not found in this._leagues.`);
    }
    this._hideGlobalLeagueMenu(); // Hide menu after action, regardless of outcome
  }


  _getSelectedLeague() {
    if (!this._selectedLeagueId) return null;
    // Ensure _leagues is an array before trying to find
    return Array.isArray(this._leagues) ? this._leagues.find(l => (l._id || l.name) === this._selectedLeagueId) : null;
  }
  
  _handleResetLeague() {
    const selectedLeague = this._getSelectedLeague();
    if (!selectedLeague) return;
    
    // Confirm before resetting
    this.dispatchEvent(new LeagueAdminElementEvent('requestResetLeague', { 
      leagueId: this._selectedLeagueId,
      leagueName: selectedLeague.name
    }));
    this._hideGlobalLeagueMenu(); // ADDED: Hide menu after action
  }
  
  // New handler for View League Table (should be kept or reinstated)
  _handleViewLeagueTable() {
    const selectedLeague = this._getSelectedLeague();
    if (!selectedLeague) return;

    this.dispatchEvent(new LeagueAdminElementEvent('requestViewLeagueTable', {
      leagueId: this._selectedLeagueId,
      leagueName: selectedLeague.name
    }));
    this._hideGlobalLeagueMenu(); // ADDED: Hide menu after action
  }
  
  // Team Management Methods
  _handleAddTeam() {
    if (!this._selectedLeagueId) return;
    // Use the lovebowls teams data passed in via attribute
    this._showTeamModal('new', null, this._lovebowlsTeams);
  }
  
  _handleEditTeam(team) {
    if (!team) return;
    // Pass the team object to edit and the lovebowls teams for reference
    this._showTeamModal('edit', team, this._lovebowlsTeams);
  }
  
  _handleRemoveTeam(team) {
    if (!team) return;
    
    const selectedLeague = this._getSelectedLeague();
    if (!selectedLeague) return;
    
    console.log('[Team Remove] Removing team with value:', team.value, 'label:', team.label);
    
    // Clear the team selection since we're removing it
    if (this._selectedTeamValue === team.value) {
      this._selectedTeamValue = null;
      console.log('[Team Remove] Cleared _selectedTeamValue because we are removing the selected team');
    }
    
    // Optimistically update the UI by removing the team locally
    const leagueIndex = this._leagues.findIndex(l => (l._id || l.name) === this._selectedLeagueId);
    if (leagueIndex !== -1) {
      const updatedTeams = this._leagues[leagueIndex].teams.filter(t => t.value !== team.value);
      this._leagues[leagueIndex] = {
        ...this._leagues[leagueIndex],
        teams: updatedTeams
      };
      console.log('[Team Remove] Updated local league data by removing team');
      
      // Re-render the teams list to reflect the change immediately
      this._renderTeamsList();
    }
    
    this.dispatchEvent(new LeagueAdminElementEvent('requestRemoveTeam', { 
      leagueId: this._selectedLeagueId,
      teamValue: team.value, // CHANGED: Use value as the team identifier
      teamLabel: team.label  // CHANGED: Include label for display purposes
    }));
  }
  
  _showTeamModal(mode, teamData = null, existingTeams = []) {
    this.clearError();
    const selectedLeague = this._getSelectedLeague();
    if (!selectedLeague) return;
    
    const modal = this.shadow.querySelector('#team-modal');
    const modalTitle = this.shadow.querySelector('#team-modal-title');
    const modalBody = this.shadow.querySelector('#team-modal-body');
    
    if (!modal || !modalTitle || !modalBody) return;
    
    let title = '';
    let currentTeamData = {};
    
    switch (mode) {
      case 'new':
        title = 'Add Team';
        currentTeamData = { 
          value: '', 
          label: '',
          useExistingTeam: false
        };
        break;
      case 'edit':
        title = 'Edit Team';
        // We expect teamData to already be in {value, label} format
        currentTeamData = {
          value: teamData.value,
          label: teamData.label,
          useExistingTeam: teamData.value !== teamData.label // If value != label, assume it's a Lovebowls team
        };
        break;
      default:
        return;
    }
    
    this._teamModalMode = mode;
    this._teamBeingEdited = currentTeamData;
    
    modalTitle.textContent = title;
    this._populateTeamModalForm(modalBody, currentTeamData, existingTeams);
    modal.style.display = 'block';
  }
  
  _hideTeamModal() {
    const modal = this.shadow.querySelector('#team-modal');
    if (modal) {
      modal.style.display = 'none';
    }
    
    this._teamModalMode = null;
    this._teamBeingEdited = null;
  }
  
  _populateTeamModalForm(modalBody, teamData, existingTeams = []) {
    const isEditMode = this._teamModalMode === 'edit';
    
    // Determine if it's a Lovebowls team (value different from label)
    let isLovebowlsTeam = teamData.useExistingTeam;
    
    // Set the checkbox label based on mode
    const checkboxLabel = (isEditMode && !isLovebowlsTeam) 
      ? "Replace with team from lovebowls.co.uk" 
      : "Team from lovebowls";

    // Get the selected league to filter out teams that already exist in it
    const selectedLeague = this._getSelectedLeague();
    
    // Filter out lovebowls teams that are already part of the league
    let filteredTeams = existingTeams;
    if (selectedLeague && selectedLeague.teams && Array.isArray(selectedLeague.teams)) {
      // If in edit mode, don't filter out the team we're currently editing
      const teamValuesToExclude = isEditMode 
        ? selectedLeague.teams.filter(t => t.value !== teamData.value).map(t => t.value)
        : selectedLeague.teams.map(t => t.value);
      
      filteredTeams = existingTeams.filter(team => !teamValuesToExclude.includes(team.value));
      
      // Log the filtering for debugging
      console.log(`[Team Modal] Filtered ${existingTeams.length - filteredTeams.length} teams that are already in the league`);
    }

    let optionsHtml = '';
    if (filteredTeams && filteredTeams.length > 0) {
      optionsHtml = filteredTeams.map(team => 
        `<option value="${team.value}" ${teamData.value === team.value ? 'selected' : ''}>${team.label}</option>`
      ).join('');
    }

    modalBody.innerHTML = `
      <!-- Error banner for the modal -->
      <div id="team-modal-error" class="form-error-shared" style="display: none; margin-bottom: var(--lae-padding-s); color: var(--lae-text-color-error); background-color: var(--lae-background-color-error); padding: var(--lae-padding-s); border: 1px solid var(--lae-border-color-error); border-radius: var(--lae-border-radius-standard);"></div>
      
      <div class="form-group-shared">
        <label class="form-label-shared">
          <input type="checkbox" id="useExistingTeamCheckbox" ${isLovebowlsTeam ? 'checked' : ''}>
          ${checkboxLabel}
        </label>
      </div>

      <div id="existingTeamSelectGroup" class="form-group-shared" style="display: ${isLovebowlsTeam ? 'block' : 'none'};">
        <label for="existingTeamSelect" class="form-label-shared">Select Team</label>
        <select id="existingTeamSelect" class="form-input-shared">
          <option value="">-- Select a Team --</option>
          ${optionsHtml}
        </select>
        ${filteredTeams.length === 0 ? '<div style="color: var(--lae-text-color-error); margin-top: 0.5em;">All lovebowls teams are already in this league</div>' : ''}
      </div>

      <div id="newTeamNameGroup" class="form-group-shared" style="display: ${isLovebowlsTeam ? 'none' : 'block'};">
        <label for="teamName" class="form-label-shared">Team Name</label>
        <input type="text" id="teamName" class="form-input-shared" value="${isLovebowlsTeam ? '' : teamData.label}" ${isLovebowlsTeam ? 'disabled' : ''}>
      </div>
    `;

    const useExistingTeamCheckbox = modalBody.querySelector('#useExistingTeamCheckbox');
    const existingTeamSelectGroup = modalBody.querySelector('#existingTeamSelectGroup');
    const newTeamNameGroup = modalBody.querySelector('#newTeamNameGroup');
    const teamNameInput = modalBody.querySelector('#teamName');
    const existingTeamSelect = modalBody.querySelector('#existingTeamSelect');

    if (useExistingTeamCheckbox && existingTeamSelectGroup && newTeamNameGroup && teamNameInput && existingTeamSelect) {
      useExistingTeamCheckbox.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        if (filteredTeams && filteredTeams.length > 0) {
          existingTeamSelectGroup.style.display = isChecked ? 'block' : 'none';
          newTeamNameGroup.style.display = isChecked ? 'none' : 'block';
          teamNameInput.disabled = isChecked;
          existingTeamSelect.disabled = !isChecked;
          if (isChecked) {
            teamNameInput.value = ''; // Clear manual input when switching
          } else {
            existingTeamSelect.value = ''; // Clear selection when switching
          }
        } else {
          // If no available filtered teams, checkbox effectively does nothing to visibility of select
          existingTeamSelectGroup.style.display = 'none';
          newTeamNameGroup.style.display = 'block';
          teamNameInput.disabled = false;
          // Uncheck the box since there are no available teams
          if (isChecked && filteredTeams.length === 0) {
            useExistingTeamCheckbox.checked = false;
          }
        }
      });
      
      // Initial state based on mode and available teams
      if (!filteredTeams || filteredTeams.length === 0) {
        // Disable checkbox if no Lovebowls teams are available
        useExistingTeamCheckbox.disabled = true;
        useExistingTeamCheckbox.title = filteredTeams.length === 0 ? "All lovebowls teams are already in this league" : "No lovebowls teams available";
        useExistingTeamCheckbox.checked = false;
        existingTeamSelectGroup.style.display = 'none';
        newTeamNameGroup.style.display = 'block';
        teamNameInput.disabled = false;
      }
    }
  }
  
  // Helper method to show error in the team modal
  _showTeamModalError(message) {
    const errorElement = this.shadow.querySelector('#team-modal-error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }
  
  // Helper method to clear error in the team modal
  _clearTeamModalError() {
    const errorElement = this.shadow.querySelector('#team-modal-error');
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  }
  
  _handleSaveTeamModal() {
    // Clear any previous error messages in the modal
    this._clearTeamModalError();
    
    const modalBody = this.shadow.querySelector('#team-modal-body');
    const useExistingTeamCheckbox = modalBody.querySelector('#useExistingTeamCheckbox');
    const existingTeamSelect = modalBody.querySelector('#existingTeamSelect');
    const teamNameInput = modalBody.querySelector('#teamName');
    
    let teamValue = '';
    let teamLabel = '';
    
    // For debugging
    console.log('[Team Save] Mode:', this._teamModalMode);
    console.log('[Team Save] Original team being edited:', this._teamBeingEdited);
    console.log('[Team Save] Using lovebowls team:', useExistingTeamCheckbox?.checked);

    if (useExistingTeamCheckbox && useExistingTeamCheckbox.checked && existingTeamSelect) {
      if (existingTeamSelect.value) {
        // For lovebowls teams, get both value and label
        teamValue = existingTeamSelect.value;
        // Find the label from the selected lovebowls team
        const selectedTeam = this._lovebowlsTeams.find(t => t.value === teamValue);
        teamLabel = selectedTeam ? selectedTeam.label : teamValue;
        console.log('[Team Save] Selected lovebowls team:', teamValue, 'with label:', teamLabel);
      } else {
        this._showTeamModalError('Please select a team from the dropdown.');
        return;
      }
    } else if (teamNameInput && teamNameInput.value.trim()) {
      // For simple teams, value and label are the same
      teamValue = teamNameInput.value.trim();
      teamLabel = teamValue;
      console.log('[Team Save] Using text input for both team value and label:', teamValue);
    } else {
      this._showTeamModalError('Team Name is required, either by typing a new name or selecting an existing team.');
      return;
    }

    if (!teamValue) {
      this._showTeamModalError('Team Name is required.');
      return;
    }
    
    // Check for duplicate team values in the current league
    const selectedLeague = this._getSelectedLeague();
    if (selectedLeague && selectedLeague.teams) {
      // Only consider it a duplicate if it's not the team we're currently editing
      const isEditing = this._teamModalMode === 'edit' && this._teamBeingEdited;
      const isDuplicate = selectedLeague.teams.some(team => {
        // If we're editing, ignore the team we're currently editing
        if (isEditing && team.value === this._teamBeingEdited.value) {
          return false;
        }
        return team.value === teamValue;
      });
      
      if (isDuplicate) {
        this._showTeamModalError(`A team with identifier "${teamValue}" already exists in this league.`);
        return;
      }
    }
    
    const teamData = {
      value: teamValue,
      label: teamLabel
    };
    
    let eventType = this._teamModalMode === 'new' ? 'requestAddTeam' : 'requestUpdateTeam';
    
    console.log('[Team Save] Sending event:', eventType, 'with team data:', teamData);
    
    // Update local data first for immediate UI response
    if (this._teamModalMode === 'edit' && selectedLeague && selectedLeague.teams) {
      const teamIndex = selectedLeague.teams.findIndex(t => 
        t.value === this._teamBeingEdited.value
      );
      
      if (teamIndex !== -1) {
        const updatedTeams = [...selectedLeague.teams];
        updatedTeams[teamIndex] = teamData;
        
        // Find the league in the leagues array and update it
        const leagueIndex = this._leagues.findIndex(l => l._id === this._selectedLeagueId || l.name === this._selectedLeagueId);
        if (leagueIndex !== -1) {
          this._leagues[leagueIndex] = {
            ...this._leagues[leagueIndex],
            teams: updatedTeams
          };
          console.log('[Team Save] Updated local league data for immediate UI update');
        }
      }
    }
    
    // Set the newly created/edited team as the selected team
    this._selectedTeamValue = teamValue;
    console.log('[Team Save] Set _selectedTeamValue to newly saved team value:', teamValue);
    
    this.dispatchEvent(new LeagueAdminElementEvent(eventType, {
      leagueId: this._selectedLeagueId,
      teamData: teamData
    }));
    
    this._hideTeamModal();
    
    // Force a re-render to update the UI immediately
    this._renderTeamsList();
  }

  // --- Modal Methods ---
  _showModal(mode, leagueData = null) {
    this.clearError(); // Clear errors when opening modal
    this._modalMode = mode;
    const modal = this.shadow.querySelector('#league-modal');
    const modalTitle = this.shadow.querySelector('#league-modal-title');
    const modalBody = this.shadow.querySelector('#league-modal-body');

    if (!modal || !modalTitle || !modalBody) {
        console.error("Modal elements not found!");
        return;
    }
    
    let currentLeagueData = {};
    let title = '';

    switch (mode) {
      case 'new':
        title = 'Create New League';
        // Default structure for a new league, including nested rinkPoints
        currentLeagueData = {
          name: '',
          settings: {
            pointsForWin: 3,
            pointsForDraw: 1,
            pointsForLoss: 0,
            promotionPositions: 0,
            relegationPositions: 0,
            timesTeamsPlayOther: 2,
            rinkPoints: {
              enabled: false,
              pointsPerRinkWin: 2,
              pointsPerRinkDraw: 1,
              defaultRinks: 4
            }
          }
        };
        break;
      case 'edit':
        title = 'Edit League';
        currentLeagueData = JSON.parse(JSON.stringify(leagueData)); // Deep copy
        // Ensure rinkPoints structure exists if not present in source data
        if (!currentLeagueData.settings.rinkPoints) {
            currentLeagueData.settings.rinkPoints = { enabled: false, pointsPerRinkWin: 2, pointsPerRinkDraw: 1, defaultRinks: 4 };
        }
        break;
      case 'copy':
        title = 'Copy League';
        currentLeagueData = JSON.parse(JSON.stringify(leagueData)); // Deep copy
        currentLeagueData.name = `${currentLeagueData.name} (Copy)`; // Suggest new name
        delete currentLeagueData._id; // Remove ID for a new league
         // Ensure rinkPoints structure exists if not present in source data
        if (!currentLeagueData.settings.rinkPoints) {
            currentLeagueData.settings.rinkPoints = { enabled: false, pointsPerRinkWin: 2, pointsPerRinkDraw: 1, defaultRinks: 4 };
        }
        break;
      default:
        console.error("Unknown modal mode:", mode);
        return;
    }

    modalTitle.textContent = title;
    this._populateModalForm(modalBody, currentLeagueData);
    modal.style.display = 'block';
    this._isModalVisible = true;
  }

  _hideModal() {
    const modal = this.shadow.querySelector('#league-modal');
    if (modal) {
      modal.style.display = 'none';
    }
    this._isModalVisible = false;
    const modalBody = this.shadow.querySelector('#league-modal-body');
    if (modalBody) modalBody.innerHTML = ''; // Clear form
    this.clearError(); // Clear any errors shown in the main component area
  }
  
  _populateModalForm(modalBody, leagueData) {
      // Ensure settings and rinkPoints exist to avoid errors with undefined properties
      const settings = leagueData.settings || {};
      const rinkPoints = settings.rinkPoints || {};

      modalBody.innerHTML = `
        <div class="form-group">
          <label for="leagueName">League Name</label>
          <input type="text" id="leagueName" value="${leagueData.name || ''}" required>
        </div>
        <fieldset>
          <legend>Match Points</legend>
          <div class="form-group">
            <label for="pointsForWin">Points for Win</label>
            <input type="number" id="pointsForWin" value="${settings.pointsForWin !== undefined ? settings.pointsForWin : 3}" min="0">
          </div>
          <div class="form-group">
            <label for="pointsForDraw">Points for Draw</label>
            <input type="number" id="pointsForDraw" value="${settings.pointsForDraw !== undefined ? settings.pointsForDraw : 1}" min="0">
          </div>
          <div class="form-group">
            <label for="pointsForLoss">Points for Loss</label>
            <input type="number" id="pointsForLoss" value="${settings.pointsForLoss !== undefined ? settings.pointsForLoss : 0}" min="0">
          </div>
        </fieldset>
        <fieldset>
          <legend>League Structure</legend>
          <div class="form-group">
            <label for="timesTeamsPlayOther">Times Teams Play Each Other</label>
            <input type="number" id="timesTeamsPlayOther" value="${settings.timesTeamsPlayOther !== undefined ? settings.timesTeamsPlayOther : 2}" min="1" max="10">
          </div>
          <div class="form-group">
            <label for="promotionPositions">Promotion Positions (0 for none)</label>
            <input type="number" id="promotionPositions" value="${settings.promotionPositions !== undefined ? settings.promotionPositions : 0}" min="0">
          </div>
          <div class="form-group">
            <label for="relegationPositions">Relegation Positions (0 for none)</label>
            <input type="number" id="relegationPositions" value="${settings.relegationPositions !== undefined ? settings.relegationPositions : 0}" min="0">
          </div>
        </fieldset>
        <fieldset>
          <legend>Rink Points</legend>
          <div class="form-group">
            <label for="rinkPointsEnabled">
              <input type="checkbox" id="rinkPointsEnabled" ${rinkPoints.enabled ? 'checked' : ''}>
              Enable Rink Points
            </label>
          </div>
          <div id="rinkPointsSettingsArea" class="rink-points-settings" style="display: ${rinkPoints.enabled ? 'block' : 'none'};">
            <div class="form-group">
              <label for="pointsPerRinkWin">Points per Rink Win</label>
              <input type="number" id="pointsPerRinkWin" value="${rinkPoints.pointsPerRinkWin !== undefined ? rinkPoints.pointsPerRinkWin : 2}" min="0">
            </div>
            <div class="form-group">
              <label for="pointsPerRinkDraw">Points per Rink Draw</label>
              <input type="number" id="pointsPerRinkDraw" value="${rinkPoints.pointsPerRinkDraw !== undefined ? rinkPoints.pointsPerRinkDraw : 1}" min="0">
            </div>
            <div class="form-group">
              <label for="defaultRinks">Default Rinks per Match</label>
              <input type="number" id="defaultRinks" value="${rinkPoints.defaultRinks !== undefined ? rinkPoints.defaultRinks : 4}" min="1">
            </div>
          </div>
        </fieldset>
      `;

      const rinkPointsEnabledCheckbox = modalBody.querySelector('#rinkPointsEnabled');
      const rinkPointsSettingsArea = modalBody.querySelector('#rinkPointsSettingsArea');
      if (rinkPointsEnabledCheckbox && rinkPointsSettingsArea) {
          rinkPointsEnabledCheckbox.addEventListener('change', (e) => {
              rinkPointsSettingsArea.style.display = e.target.checked ? 'block' : 'none';
          });
      }
  }

  _handleSaveModal() {
    this.clearError(); // Clear global errors
    const modalBody = this.shadow.querySelector('#league-modal-body');
    const leagueNameInput = modalBody.querySelector('#leagueName');

    if (!leagueNameInput || !leagueNameInput.value.trim()) {
      this.showError('League Name is required.'); // This error will show in the main component error area.
                                              // Consider adding error display within the modal too.
      return;
    }

    const leagueData = {
      name: leagueNameInput.value.trim(),
      settings: {
        pointsForWin: parseInt(modalBody.querySelector('#pointsForWin').value) || 0,
        pointsForDraw: parseInt(modalBody.querySelector('#pointsForDraw').value) || 0,
        pointsForLoss: parseInt(modalBody.querySelector('#pointsForLoss').value) || 0,
        timesTeamsPlayOther: parseInt(modalBody.querySelector('#timesTeamsPlayOther').value) || 2,
        promotionPositions: parseInt(modalBody.querySelector('#promotionPositions').value) || 0,
        relegationPositions: parseInt(modalBody.querySelector('#relegationPositions').value) || 0,
        rinkPoints: {
          enabled: modalBody.querySelector('#rinkPointsEnabled').checked,
          pointsPerRinkWin: parseInt(modalBody.querySelector('#pointsPerRinkWin').value) || 0,
          pointsPerRinkDraw: parseInt(modalBody.querySelector('#pointsPerRinkDraw').value) || 0,
          defaultRinks: parseInt(modalBody.querySelector('#defaultRinks').value) || 0,
        }
      }
    };

    // If editing, preserve the original _id
    if (this._modalMode === 'edit') {
        const originalLeague = this._getSelectedLeague();
        if (originalLeague && originalLeague._id) {
            leagueData._id = originalLeague._id;
        }
    }
    
    // For 'copy', _id is already removed. For 'new', it won't exist.

    let eventType = '';
    switch (this._modalMode) {
      case 'new':
        eventType = 'requestNewLeague';
        break;
      case 'edit':
        eventType = 'requestUpdateLeague';
        break;
      case 'copy':
        eventType = 'requestNewLeague'; // This will also be a "new" league but based on an existing one
        break;
    }

    if (eventType) {
      this.dispatchEvent(new LeagueAdminElementEvent(eventType, { leagueData }));
    }
    this._hideModal();
    this._hideGlobalLeagueMenu(); // ADDED: Hide menu after action (if it was open due to edit)
  }


  // --- Action Button Handlers ---
  _handleNewLeague() {
    this.clearError();
    this._selectedLeagueId = null; // Deselect any currently selected league
    this._updateButtonStates(); // Reflect deselection in button states
    this._showModal('new');
  }

  _handleCopyLeague() {
    this.clearError();
    const selectedLeague = this._getSelectedLeague();
    if (selectedLeague) {
      this._showModal('copy', selectedLeague);
    } else {
      this.showError("No league selected to copy.");
    }
    // No direct menu interaction here, modal handles itself
  }

  _handleEditLeagueRules() {
    this.clearError();
    const selectedLeague = this._getSelectedLeague();
    if (selectedLeague) {
      this._showModal('edit', selectedLeague);
    } else {
      this.showError("No league selected to update.");
    }
    // Modal handles itself, but ensure menu is hidden if this was called from it
    this._hideGlobalLeagueMenu(); // ADDED: Hide menu after action
  }

  _handleDeleteLeague() {
    this.clearError();
    const leagueIdToDelete = this._currentLeagueIdForMenu; // Use the ID from menu context

    if (!leagueIdToDelete) {
      this.showError("Cannot delete: league context from menu is missing.");
      console.error("[Delete League] _currentLeagueIdForMenu is not set during delete attempt.");
      this._hideGlobalLeagueMenu();
      return;
    }

    // Find the league object from this._leagues using leagueIdToDelete
    const leagueToDeleteObject = Array.isArray(this._leagues) ? this._leagues.find(l => (l._id || l.name) === leagueIdToDelete) : null;

    if (leagueToDeleteObject) {
      // Use the exact ID that was used to find the league (either its _id or name)
      const actualLeagueIdForDispatch = leagueToDeleteObject._id || leagueToDeleteObject.name;

      console.log('[Delete League] League to delete (from menu context):', JSON.parse(JSON.stringify(leagueToDeleteObject)));
      console.log('[Delete League] Using leagueId for deletion dispatch:', actualLeagueIdForDispatch);

      this.dispatchEvent(new LeagueAdminElementEvent('requestDeleteLeague', { leagueId: actualLeagueIdForDispatch }));

      // If the globally selected league was the one deleted, nullify _selectedLeagueId.
      if (this._selectedLeagueId === actualLeagueIdForDispatch) {
        const oldSelectedId = this._selectedLeagueId;
        this._selectedLeagueId = null;
        console.log(`[Delete League] Cleared _selectedLeagueId from ${oldSelectedId} because it matched the deleted league.`);
      }
      
      // After deletion logic, ensure UI reflects that no league (or a different league) might be selected.
      this._hideLeagueSpecificPanels(); // This correctly hides panels if the selected league was deleted.
      this._updateButtonStates();      // Updates main action buttons based on the new _selectedLeagueId state.

    } else {
      this.showError(`League with ID "${leagueIdToDelete}" not found to delete.`);
      console.error(`[Delete League] League with ID "${leagueIdToDelete}" (from _currentLeagueIdForMenu) not found in this._leagues.`);
    }
    this._hideGlobalLeagueMenu(); // Hide menu after action, regardless of outcome
  }

  // Match Management Methods
  _handleAddMatch() {
    if (!this._selectedLeagueId) return;
    const selectedLeague = this._getSelectedLeague();
    if (!selectedLeague) return;
    
    // Pass teams as array of {value, label} objects
    const teams = selectedLeague.teams || [];
    this.openMatchModal({ date: '', homeTeamName: '', awayTeamName: '', result: null }, teams, 'new');
  }
  
  _handleEditMatch(matchKeyContainer) {
    if (!matchKeyContainer || !matchKeyContainer.key) {
        console.error("Match key not provided to _handleEditMatch");
        return;
    }
    const matchKey = matchKeyContainer.key;
    const selectedLeague = this._getSelectedLeague();
    if (!selectedLeague || !selectedLeague.matches) {
        console.error("Selected league or its matches not found when trying to edit match.");
        return;
    }
    
    const currentMatchObject = selectedLeague.matches.find(m => m.key === matchKey);
    if (!currentMatchObject) {
        console.error(`Match with key ${matchKey} not found in selected league.`);
        return;
    }

    // Pass teams as array of {value, label} objects
    const teams = selectedLeague.teams || [];
    this.openMatchModal(currentMatchObject, teams, 'edit');
  }
  
  openMatchModal(matchData, teams, mode = 'edit') {
    // Teams are already in {value, label} format from selectedLeague.teams
    this.matchModalOpen = true;
    this.matchModalData = matchData;
    this.matchModalTeams = teams;
    this.matchModalMode = mode;
    this.render();
  }
  
  closeMatchModal() {
    this.matchModalOpen = false;
    this.matchModalData = null;
    this.matchModalTeams = [];
    this.matchModalMode = 'new';
    this.render();
  }

  _setupResizer() {
    const resizer = this.shadow.querySelector('#resizer');
    const leftPanel = this.shadow.querySelector('.column-leagues');
    const rightPanel = this.shadow.querySelector('.column-details');
    if (!resizer || !leftPanel || !rightPanel) return;
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
      const minLeftPanelBoundPx = hostWidth * 0.20;
      const maxLeftPanelBoundPx = hostWidth * 0.80;
      finalLeftPanelPixelWidth = Math.max(minLeftPanelBoundPx, finalLeftPanelPixelWidth);
      finalLeftPanelPixelWidth = Math.min(maxLeftPanelBoundPx, finalLeftPanelPixelWidth);
      leftPanel.style.flex = `0 0 ${finalLeftPanelPixelWidth / hostWidth * 100}%`;
    };
    const mouseUpHandler = () => {
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };
    resizer.addEventListener('mousedown', mouseDownHandler);
  }

  _updateAttentionPanel(isMobile, leagueToUse) {
    const selectedLeague = leagueToUse || this._getSelectedLeague();
    const attentionMatchesElement = this.shadow.querySelector('#admin-attention-matches');
    const attentionContainer = this.shadow.querySelector('#admin-matches-attention-container');
    if (!selectedLeague || !attentionMatchesElement || !attentionContainer) {
      if (attentionContainer) attentionContainer.style.display = 'none';
      return;
    }
    
    // Convert the teams array to a format that LeagueMatchesAttention can use for team name display
    const teamMap = {};
    if (selectedLeague.teams && Array.isArray(selectedLeague.teams)) {
      selectedLeague.teams.forEach(team => {
        teamMap[team.value] = team.label;
      });
    }
    
    attentionMatchesElement.setAttribute('is-mobile', String(isMobile));
    attentionMatchesElement.setAttribute('data', JSON.stringify(selectedLeague.matches || []));
    // Pass the team name mapping as an additional attribute if your LeagueMatchesAttention component supports it
    if (Object.keys(teamMap).length > 0) {
      attentionMatchesElement.setAttribute('team-map', JSON.stringify(teamMap));
    }
    attentionContainer.style.display = '';

    // Ensure event listener is attached (and only once)
    if (!this._handleAdminAttentionMatchClickBound) {
        this._handleAdminAttentionMatchClickBound = this._handleAdminAttentionMatchClick.bind(this);
    }
    attentionMatchesElement.removeEventListener('league-matches-attention-event', this._handleAdminAttentionMatchClickBound);
    attentionMatchesElement.addEventListener('league-matches-attention-event', this._handleAdminAttentionMatchClickBound);
  }

  _handleAdminAttentionMatchClick(e) {
    if (e.detail.type === 'matchClick' && e.detail.match) {
        const selectedLeague = this._getSelectedLeague();
        if (!selectedLeague) return;
        
        // Pass teams as array of {value, label} objects
        const teams = selectedLeague.teams || [];
        const matchData = { ...e.detail.match }; // Clone to avoid modifying original event detail
        if (e.detail.attentionReason) {
            matchData.attentionReason = e.detail.attentionReason;
        }
        this.openMatchModal(matchData, teams, 'edit');
    }
  }


  _handleTeamSelect(team) {
    const teamValue = team.value; // CHANGED: Use value as identifier

    // Deselect previously selected team item
    if (this._selectedTeamValue && this._selectedTeamValue !== teamValue) {
      const prevSelectedLi = this.shadow.querySelector(`.team-item[data-team-value="${this._selectedTeamValue}"]`);
      if (prevSelectedLi) {
        prevSelectedLi.classList.remove('selected-team');
        const prevActionsDiv = prevSelectedLi.querySelector('.team-actions');
        if (prevActionsDiv) {
          prevActionsDiv.innerHTML = ''; // Clear its buttons
        }
      }
    }

    // Handle new selection
    const currentSelectedLi = this.shadow.querySelector(`.team-item[data-team-value="${teamValue}"]`);
    if (!currentSelectedLi) return; // Should not happen if click is on an item

    if (this._selectedTeamValue === teamValue) {
      // Clicked on already selected team: toggle visibility (hide actions)
      currentSelectedLi.classList.remove('selected-team');
      const actionsDiv = currentSelectedLi.querySelector('.team-actions');
      if (actionsDiv) {
        actionsDiv.innerHTML = '';
      }
      this._selectedTeamValue = null;
    } else {
      // Clicked on a new team: show actions
      currentSelectedLi.classList.add('selected-team');
      this._selectedTeamValue = teamValue;
      const actionsDiv = currentSelectedLi.querySelector('.team-actions');
      if (actionsDiv) {
        this._createAndAppendTeamActions(actionsDiv, team);
      }
    }
  }

  _createAndAppendTeamActions(actionsContainer, team) {
    actionsContainer.innerHTML = ''; // Clear previous buttons

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.classList.add('button-shared', 'button-sm');
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent li click handler
      this._handleEditTeam(team);
    });
    actionsContainer.appendChild(editBtn);

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.classList.add('button-shared', 'button-sm');
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent li click handler
      this._handleRemoveTeam(team);
    });
    actionsContainer.appendChild(removeBtn);
  }

  // --- Global League Actions Menu Logic ---
  _handleOpenGlobalLeagueMenu(leagueId, triggerButton) {
    const globalMenu = this.shadow.querySelector('#league-actions-global-menu');
    if (!globalMenu) return;

    this._currentLeagueIdForMenu = leagueId; // Store for action handlers
    console.log(`[LAD_GLOBAL_MENU] _handleOpenGlobalLeagueMenu: Opened for leagueId: ${leagueId}. _currentLeagueIdForMenu SET to: ${this._currentLeagueIdForMenu}`);

    // Populate menu
    globalMenu.innerHTML = ''; // Clear previous items

    const actions = [
      { label: 'View..', handler: () => this._handleViewLeagueTable() },
      { label: 'Edit..', handler: () => this._handleEditLeagueRules() },
      { label: 'Delete..', handler: () => this._handleDeleteLeague() },
      { label: 'Reset..', handler: () => this._handleResetLeague() },
    ];

    actions.forEach(action => {
      const button = document.createElement('button');
      button.textContent = action.label;
      button.addEventListener('click', (e) => {
        e.stopPropagation(); 
        action.handler(); 
      });
      globalMenu.appendChild(button);
    });

    // Position menu
    const rect = triggerButton.getBoundingClientRect();

    // Temporarily display menu to get its dimensions, then hide before final positioning
    globalMenu.style.visibility = 'hidden';
    globalMenu.style.display = 'block';
    const menuWidth = globalMenu.offsetWidth;
    const menuHeight = globalMenu.offsetHeight; // Get height for potential vertical adjustment
    globalMenu.style.display = 'none'; // Hide again before final placement
    globalMenu.style.visibility = 'visible';

    let top = rect.bottom;
    let left = rect.left; // Default for desktop LTR alignment

    const isMobile = this.getAttribute('is-mobile') === 'true';
    if (isMobile) {
      left = rect.right - menuWidth; // Align right edges on mobile
    }
    
    // Basic boundary detection (ensure it doesn't go off viewport edges)
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 0) {
        left = 0; // Prevent moving too far left
    }
    if (left + menuWidth > viewportWidth) {
        left = viewportWidth - menuWidth; // Prevent moving too far right
    }
    if (top + menuHeight > viewportHeight) {
        top = rect.top - menuHeight; // Try to open upwards if it overflows bottom
        if (top < 0) { // If opening upwards also overflows top, reset to bottom (or center)
            top = rect.bottom; // Or a more sophisticated centering logic
        }
    }
    if (top < 0) {
        top = 0; // Prevent moving too far up
    }

    globalMenu.style.top = `${top}px`;
    globalMenu.style.left = `${left}px`;
    globalMenu.style.display = 'block';
    console.log(`[LAD_GLOBAL_MENU] Menu displayed at top: ${top}px, left: ${left}px`);

    // Add document click listener to close menu
    // Remove any existing listener first
    if (this._boundHandleDocumentClickForGlobalMenu) {
        // console.log("[LAD_GLOBAL_MENU] Removing existing document click listener for global menu."); // Verbose
        document.removeEventListener('click', this._boundHandleDocumentClickForGlobalMenu);
    }
    this._boundHandleDocumentClickForGlobalMenu = (event) => {
      const target = event.composedPath && event.composedPath()[0] ? event.composedPath()[0] : event.target;
      // console.log(`[LAD_GLOBAL_MENU_DOC_CLICK] Document click detected. Target:`, target, `Menu contains target: ${globalMenu.contains(target)}, Trigger button was target: ${triggerButton === target}`); // Very verbose
      if (!globalMenu.contains(target) && target !== triggerButton) {
        // console.log("[LAD_GLOBAL_MENU_DOC_CLICK] Click was outside menu and not on trigger button. Hiding global menu."); // Verbose
        this._hideGlobalLeagueMenu();
      } else {
        // console.log("[LAD_GLOBAL_MENU_DOC_CLICK] Click was inside menu or on trigger. Not hiding yet."); // Verbose
      }
    };
    // Use setTimeout to allow the current click event to propagate before attaching the listener
    setTimeout(() => {
        // console.log("[LAD_GLOBAL_MENU] Attaching document click listener for global menu."); // Verbose
        document.addEventListener('click', this._boundHandleDocumentClickForGlobalMenu);
    }, 0);
  }

  _hideGlobalLeagueMenu() {
    const globalMenu = this.shadow.querySelector('#league-actions-global-menu');
    if (globalMenu) {
      globalMenu.style.display = 'none';
    }
    console.log(`[LAD_GLOBAL_MENU] _hideGlobalLeagueMenu CALLED. _currentLeagueIdForMenu BEFORE clear: ${this._currentLeagueIdForMenu}`);
    if (this._boundHandleDocumentClickForGlobalMenu) {
      // console.log("[LAD_GLOBAL_MENU] Removing document click listener in _hideGlobalLeagueMenu."); // Verbose
      document.removeEventListener('click', this._boundHandleDocumentClickForGlobalMenu);
      this._boundHandleDocumentClickForGlobalMenu = null;
    }
    this._currentLeagueIdForMenu = null;
    console.log(`[LAD_GLOBAL_MENU] _hideGlobalLeagueMenu FINISHED. _currentLeagueIdForMenu AFTER clear: ${this._currentLeagueIdForMenu}`);
  }
  // --- End Global League Actions Menu Logic ---
}

// Register the custom element
customElements.define('league-admin-element', LeagueAdminElement);

export default LeagueAdminElement;
