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
    this.shadow = this.attachShadow({ mode: 'open' });
    this._elementTitle = this.getAttribute('elementTitle') || 'League Administration';
    this._leagues = [];
    this._selectedLeagueId = null; // Store ID of the selected league
    this._currentLeagueId = null; // Store ID of the league to be pre-selected
    this._selectedTeamName = null; // ADDED: To track selected team
    this._isModalVisible = false;
    this._modalMode = 'new'; // 'new', 'edit', 'copy'
    this._data = null; // To store the raw data from attribute
    
    // New properties for team management
    this._teamModalMode = null; // 'new' or 'edit'
    this._teamBeingEdited = null; // Store the team being edited
    
    // New properties for match management
    this.matchModalOpen = false;
    this.matchModalData = null;
    this.matchModalTeams = [];
    this.matchModalMode = 'new';

    // Bind the document click handler for the actions dropdown
    this._boundHandleDocumentClickForActionsDropdown = this._handleDocumentClickForActionsDropdown.bind(this);
    this._boundHandleDocumentClickForGlobalMenu = null; // ADDED: For global menu closing
  }

  static get observedAttributes() {
    return ['elementTitle', 'data', 'is-mobile', 'current-league-id'];
  }

  connectedCallback() {
    this._elementTitle = this.getAttribute('elementTitle') || this._elementTitle;
    this._currentLeagueId = this.getAttribute('current-league-id') || null;
    const rawData = this.getAttribute('data');
    console.log('[LeagueAdminElement] connectedCallback: is-mobile attribute:', this.getAttribute('is-mobile'));
    if (rawData) {
        this._parseAndLoadData(rawData);
    }
    // document.addEventListener('click', this._boundHandleDocumentClickForActionsDropdown); // REMOVED old handler
    this.render();
  }

  disconnectedCallback() {
    // Cleanup event listeners if any were added directly to document or window
    // document.removeEventListener('click', this._boundHandleDocumentClickForActionsDropdown); // REMOVED old handler
    // Ensure global menu handler is also cleaned up if active
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
      this._parseAndLoadData(newValue);
      needsRender = true; // Data change always triggers a full re-render of the list
    } else if (name === 'is-mobile') {
      needsRender = true;
    } else if (name === 'current-league-id') {
      this._currentLeagueId = newValue || null;
      // Apply selection only if we have leagues loaded already
      if (this._leagues && this._leagues.length > 0) {
        needsRender = this._applyCurrentLeagueIdSelection();
      }
    }

    if (needsRender) {
      this.render();
    }
    // Dispatch an event about the attribute change
    this.dispatchEvent(new LeagueAdminElementEvent('attributeChanged', { name, oldValue, newValue }));
  }

  _parseAndLoadData(dataString) {
    this.clearError();
    if (!dataString) {
        this._leagues = [];
        this._data = null;
        this.dispatchEvent(new LeagueAdminElementEvent('dataProcessed', { status: 'success', message: 'Data cleared.' }));
        return;
    }
    try {
      const parsedData = JSON.parse(dataString);
      if (Array.isArray(parsedData)) {
        // Assuming each item in parsedData is a league object compatible with your League class
        // For now, we'll just store it. Later, we might instantiate League objects if needed.
        this._leagues = parsedData;
        this._data = parsedData; // Store the raw parsed data
        this.dispatchEvent(new LeagueAdminElementEvent('dataLoaded', { leagues: this._leagues }));
        
        // Apply currentLeagueId selection if we have one
        this._applyCurrentLeagueIdSelection();
      } else {
        this.showError('Invalid data format: Expected an array of leagues.');
        this._leagues = [];
        this._data = null;
         this.dispatchEvent(new LeagueAdminElementEvent('dataError', { message: 'Invalid data format: Expected an array of leagues.' }));
      }
    } catch (error) {
      this.showError(`Failed to parse league data: ${error.message}`);
      this._leagues = [];
      this._data = null;
      this.dispatchEvent(new LeagueAdminElementEvent('dataError', { message: `Failed to parse league data: ${error.message}`, errorObj: error }));
    }
  }

  // Helper method to apply currentLeagueId selection
  _applyCurrentLeagueIdSelection() {
    if (!this._currentLeagueId || !this._leagues || this._leagues.length === 0) {
      // If no current ID to apply or no leagues, no selection change occurred
      return false;
    }

    // Check if the currentLeagueId exists in leagues
    const leagueExists = this._leagues.some(l => (l._id || l.name) === this._currentLeagueId);
    
    if (leagueExists) {
      // If league exists and it's different from current selection, update selection
      if (this._selectedLeagueId !== this._currentLeagueId) {
        this._selectedLeagueId = this._currentLeagueId;
        this.dispatchEvent(new LeagueAdminElementEvent('leagueSelected', { leagueId: this._selectedLeagueId }));
        this._updateButtonStates();
        return true; // Selection changed, need to render
      }
    } else if (this._selectedLeagueId === this._currentLeagueId) {
      // League doesn't exist but was selected, clear selection
      this._selectedLeagueId = null;
      this.dispatchEvent(new LeagueAdminElementEvent('leagueSelected', { leagueId: null }));
      this._updateButtonStates();
      return true; // Selection changed, need to render
    }
    
    return false; // No selection change occurred
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
    const isMobile = this.getAttribute('is-mobile') === 'true';
    console.log('[LeagueAdminElement] render called. is-mobile attribute:', this.getAttribute('is-mobile'), 'computed isMobile:', isMobile);
    console.log('[Admin Render] _selectedLeagueId:', this._selectedLeagueId);
    console.log('[Admin Render] Current _leagues before getSelectedLeague:', JSON.parse(JSON.stringify(this._leagues)));
    const leagueForRender = this._getSelectedLeague(); // It's critical this reflects the update
    console.log('[Admin Render] League object for render:', JSON.parse(JSON.stringify(leagueForRender)));

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
      modal.mode = this.matchModalMode;
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

    this._leagues.forEach(league => {
      const li = document.createElement('li');
      li.classList.add('league-list-item', 'list-item-shared');
      
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
      listElement.appendChild(li);
    });
  }

  _handleLeagueSelect(leagueId) {
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
      this._showLeagueSpecificPanels(); 
      this._selectedTeamName = null; // ADDED: Reset selected team when league changes
    } else {
      // League not found in list, effectively deselecting
      this._selectedLeagueId = null;
      this._selectedTeamName = null; // ADDED: Reset selected team
      this._hideLeagueSpecificPanels();
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
    btnActions.addEventListener('click', (e) => {
      e.stopPropagation();
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
    this._selectedTeamName = null; // ADDED: Reset selected team

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
      li.dataset.teamName = team.name; 
      
      const nameSpan = document.createElement('span');
      nameSpan.classList.add('team-name', 'list-item-text-primary');
      nameSpan.textContent = team.name || 'Unnamed Team';
      li.appendChild(nameSpan);
      
      const actionsDiv = document.createElement('div');
      actionsDiv.classList.add('team-actions', 'list-item-actions');
      li.appendChild(actionsDiv);

      // Add click listener to the list item itself
      li.addEventListener('click', (e) => {
        // Prevent click from propagating to league selection if teams list is inside league item (not the case here, but good practice)
        e.stopPropagation(); 
        this._handleTeamSelect(team); // Pass the whole team object
      });
      
      teamsList.appendChild(li);
    });
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
    const btnDelete = this.shadow.querySelector('#delete-league-button');
    const btnCloseModal = this.shadow.querySelector('#close-league-modal');
    const btnCancelModal = this.shadow.querySelector('#cancel-league-button');
    const btnSaveModal = this.shadow.querySelector('#save-league-button');

    if (btnNew) btnNew.addEventListener('click', () => this._handleNewLeague());
    if (btnCopy) btnCopy.addEventListener('click', () => this._handleCopyLeague());
    if (btnUpdate) btnUpdate.addEventListener('click', () => this._handleEditLeagueRules());
    if (btnDelete) btnDelete.addEventListener('click', () => this._handleDeleteLeague());
    
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
  
  _toggleActionsDropdown(force = null, specificDropdownButton = null) {
    // This method's original purpose was to toggle a single, static dropdown.
    // With dynamically created dropdowns per league item, the primary toggle logic 
    // is now within the click event listener of the 'Actions' button in `_createAndAppendLeagueActions`.
    // This function is now less critical for direct user interaction toggling.
    // It might still be called by `_handleDocumentClickForActionsDropdown` to *close* dropdowns, or if programmatic control is needed.

    console.log('[LeagueAdmin] _toggleActionsDropdown (context: document click or programmatic) called with force:', force, 'button:', specificDropdownButton);
    
    let dropdownToToggle;
    if (specificDropdownButton) {
        // If a specific button initiated this, find its associated dropdown.
        const parentItem = specificDropdownButton.closest('.league-list-item');
        if (parentItem) {
            dropdownToToggle = parentItem.querySelector('.league-action-dropdown');
        }
    } else if (force === false) {
        // If explicitly forcing close without a specific button, find any open dropdowns to close them.
        // This is primarily for the _handleDocumentClickForActionsDropdown scenario.
        // We iterate and close in _handleDocumentClickForActionsDropdown itself, so direct call here might be redundant for that case.
        const openDropdowns = this.shadow.querySelectorAll('.league-list-item .league-action-dropdown.show');
        openDropdowns.forEach(dd => dd.classList.remove('show'));
        return; // Handled all open dropdowns
    }

    if (dropdownToToggle) {
      // If force is null, it's a toggle; otherwise, set state based on force.
      const shouldShow = (force === null) ? !dropdownToToggle.classList.contains('show') : force;
      dropdownToToggle.classList.toggle('show', shouldShow);
    } 
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
    this._showTeamModal('new');
  }
  
  _handleEditTeam(team) {
    if (!team) return;
    this._showTeamModal('edit', team);
  }
  
  _handleRemoveTeam(team) {
    if (!team) return;
    
    const selectedLeague = this._getSelectedLeague();
    if (!selectedLeague) return;
    
    this.dispatchEvent(new LeagueAdminElementEvent('requestRemoveTeam', { 
      leagueId: this._selectedLeagueId,
      teamId: team._id || team.name, // Use ID if available, otherwise name
      teamName: team.name
    }));
  }
  
  _showTeamModal(mode, teamData = null) {
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
        currentTeamData = { name: '' };
        break;
      case 'edit':
        title = 'Edit Team';
        currentTeamData = JSON.parse(JSON.stringify(teamData)); // Deep copy
        break;
      default:
        return;
    }
    
    this._teamModalMode = mode;
    this._teamBeingEdited = currentTeamData;
    
    modalTitle.textContent = title;
    this._populateTeamModalForm(modalBody, currentTeamData);
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
  
  _populateTeamModalForm(modalBody, teamData) {
    modalBody.innerHTML = `
      <div class="form-group-shared">
        <label for="teamName" class="form-label-shared">Team Name</label>
        <input type="text" id="teamName" class="form-input-shared" value="${teamData.name || ''}" required>
      </div>
    `;
  }
  
  _handleSaveTeamModal() {
    const modalBody = this.shadow.querySelector('#team-modal-body');
    const teamNameInput = modalBody.querySelector('#teamName');
    
    if (!teamNameInput || !teamNameInput.value.trim()) {
      this.showError('Team Name is required.');
      return;
    }
    
    const teamData = {
      name: teamNameInput.value.trim()
    };
    
    // Preserve ID if editing
    if (this._teamModalMode === 'edit' && this._teamBeingEdited && this._teamBeingEdited._id) {
      teamData._id = this._teamBeingEdited._id;
    }
    
    let eventType = this._teamModalMode === 'new' ? 'requestAddTeam' : 'requestUpdateTeam';
    
    this.dispatchEvent(new LeagueAdminElementEvent(eventType, {
      leagueId: this._selectedLeagueId,
      teamData: teamData
    }));
    
    this._hideTeamModal();
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
    const selectedLeague = this._getSelectedLeague();
    if (selectedLeague) {
      this.dispatchEvent(new LeagueAdminElementEvent('requestDeleteLeague', { leagueId: this._selectedLeagueId }));
      this._selectedLeagueId = null; // Deselect after requesting deletion
      // The list will refresh when data attribute is updated by parent
    } else {
      this.showError("No league selected to delete.");
    }
    this._hideGlobalLeagueMenu(); // ADDED: Hide menu after action
  }

  // Match Management Methods
  _handleAddMatch() {
    if (!this._selectedLeagueId) return;
    const selectedLeague = this._getSelectedLeague();
    if (!selectedLeague) return;
    const teams = (selectedLeague.teams || []).map(t => t.name);
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

    const teams = (selectedLeague.teams || []).map(t => t.name);
    this.openMatchModal(currentMatchObject, teams, 'edit');
  }
  
  openMatchModal(matchData, teams, mode = 'edit') {
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
    const attentionContainer = this.shadow.querySelector('#admin-matches-attention-container'); // Now points to the panel wrapper
    if (!selectedLeague || !attentionMatchesElement || !attentionContainer) {
      if (attentionContainer) attentionContainer.style.display = 'none';
      return;
    }
    attentionMatchesElement.setAttribute('is-mobile', String(isMobile)); // Ensure boolean is stringified
    attentionMatchesElement.setAttribute('data', JSON.stringify(selectedLeague.matches || []));
    attentionContainer.style.display = ''; // Show the panel

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
        const teams = (selectedLeague.teams || []).map(t => t.name);
        this.openMatchModal(e.detail.match, teams, 'edit');
    }
  }

  // New method to handle document clicks for closing the actions dropdown
  _handleDocumentClickForActionsDropdown(event) {
    const clickedElement = event.composedPath && event.composedPath()[0];
    if (!clickedElement) return;

    // Find all open dropdowns (those with class 'show') within league list items.
    const openDropdowns = this.shadow.querySelectorAll('.league-list-item .league-action-dropdown.show');

    openDropdowns.forEach(dropdownContainer => {
        // dropdownContainer is the div with class 'league-action-dropdown'.
        // We need to check if the click was inside *this specific instance* of an open dropdown.
        if (!dropdownContainer.contains(clickedElement)) {
            // If the click was outside this open dropdown, close it.
            dropdownContainer.classList.remove('show');
        }
    });
  }

  _handleTeamSelect(teamObject) {
    const teamName = teamObject.name; // Assuming team name is unique identifier for now

    // Deselect previously selected team item
    if (this._selectedTeamName && this._selectedTeamName !== teamName) {
      const prevSelectedLi = this.shadow.querySelector(`.team-item[data-team-name="${this._selectedTeamName}"]`);
      if (prevSelectedLi) {
        prevSelectedLi.classList.remove('selected-team');
        const prevActionsDiv = prevSelectedLi.querySelector('.team-actions');
        if (prevActionsDiv) {
          prevActionsDiv.innerHTML = ''; // Clear its buttons
        }
      }
    }

    // Handle new selection
    const currentSelectedLi = this.shadow.querySelector(`.team-item[data-team-name="${teamName}"]`);
    if (!currentSelectedLi) return; // Should not happen if click is on an item

    if (this._selectedTeamName === teamName) {
      // Clicked on already selected team: toggle visibility (hide actions)
      currentSelectedLi.classList.remove('selected-team');
      const actionsDiv = currentSelectedLi.querySelector('.team-actions');
      if (actionsDiv) {
        actionsDiv.innerHTML = '';
      }
      this._selectedTeamName = null;
    } else {
      // Clicked on a new team: show actions
      currentSelectedLi.classList.add('selected-team');
      this._selectedTeamName = teamName;
      const actionsDiv = currentSelectedLi.querySelector('.team-actions');
      if (actionsDiv) {
        this._createAndAppendTeamActions(actionsDiv, teamObject);
      }
    }
  }

  _createAndAppendTeamActions(actionsContainer, teamObject) {
    actionsContainer.innerHTML = ''; // Clear previous buttons

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.classList.add('button-shared', 'button-sm');
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent li click handler
      this._handleEditTeam(teamObject);
    });
    actionsContainer.appendChild(editBtn);

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.classList.add('button-shared', 'button-sm');
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent li click handler
      this._handleRemoveTeam(teamObject);
    });
    actionsContainer.appendChild(removeBtn);
  }

  // --- Global League Actions Menu Logic ---
  _handleOpenGlobalLeagueMenu(leagueId, triggerButton) {
    const globalMenu = this.shadow.querySelector('#league-actions-global-menu');
    if (!globalMenu) return;

    this._currentLeagueIdForMenu = leagueId; // Store for action handlers

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

    // Add document click listener to close menu
    // Remove any existing listener first
    if (this._boundHandleDocumentClickForGlobalMenu) {
        document.removeEventListener('click', this._boundHandleDocumentClickForGlobalMenu);
    }
    this._boundHandleDocumentClickForGlobalMenu = (event) => {
      if (!globalMenu.contains(event.target) && event.target !== triggerButton) {
        this._hideGlobalLeagueMenu();
      }
    };
    // Use setTimeout to allow the current click event to propagate before attaching the listener
    setTimeout(() => {
        document.addEventListener('click', this._boundHandleDocumentClickForGlobalMenu);
    }, 0);
  }

  _hideGlobalLeagueMenu() {
    const globalMenu = this.shadow.querySelector('#league-actions-global-menu');
    if (globalMenu) {
      globalMenu.style.display = 'none';
    }
    if (this._boundHandleDocumentClickForGlobalMenu) {
      document.removeEventListener('click', this._boundHandleDocumentClickForGlobalMenu);
      this._boundHandleDocumentClickForGlobalMenu = null;
    }
    this._currentLeagueIdForMenu = null;
  }
  // --- End Global League Actions Menu Logic ---
}

// Register the custom element
customElements.define('league-admin-element', LeagueAdminElement);

export default LeagueAdminElement;
