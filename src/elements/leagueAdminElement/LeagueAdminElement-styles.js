import { panelStyles, buttonStyles, modalStyles, formStyles, listItemStyles } from '../shared-styles.js';

// Base styles shared between mobile and desktop layouts
export const BASE_STYLES = `
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

      /* Tab System Styles */
      .modal-tabs-container {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .modal-league-name-section {
        margin-bottom: var(--lae-padding-m);
        padding-bottom: var(--lae-padding-m);
        border-bottom: 1px solid var(--lae-border-color-light);
      }

      .tab-navigation {
        display: flex;
        border-bottom: 2px solid var(--lae-border-color-light);
        margin-bottom: var(--lae-padding-m);
        gap: 0;
      }

      .tab-button {
        background: var(--lae-background-color-button);
        border: 1px solid var(--lae-border-color-medium);
        border-bottom: none;
        padding: var(--lae-padding-s) var(--lae-padding-m);
        cursor: pointer;
        font-size: var(--lae-font-size-medium);
        font-weight: 500;
        color: var(--lae-text-color-secondary);
        border-radius: var(--lae-border-radius-standard) var(--lae-border-radius-standard) 0 0;
        position: relative;
        transition: all 0.2s ease;
        min-width: 120px;
        text-align: center;
        user-select: none;
      }

      .tab-button:hover {
        background: var(--lae-background-color-button-hover);
        color: var(--lae-text-color-primary);
      }

      .tab-button.active {
        background: var(--lae-background-color-panel);
        color: var(--lae-text-color-primary);
        font-weight: 600;
        border-bottom: 2px solid var(--lae-background-color-panel);
        margin-bottom: -2px;
        z-index: 1;
      }

      .tab-button:not(:last-child) {
        border-right: none;
      }

      .tab-content-container {
        flex: 1;
        min-height: 300px;
      }

      .tab-content {
        display: none;
        animation: fadeIn 0.2s ease-in;
      }

      .tab-content.active {
        display: block;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Enhanced fieldset styling for tabs */
      .tab-content fieldset {
        margin-bottom: var(--lae-padding-m);
        border: 1px solid var(--lae-border-color-medium);
        border-radius: var(--lae-border-radius-standard);
        padding: var(--lae-padding-m);
        background: var(--lae-background-color-header);
      }

      .tab-content fieldset legend {
        font-weight: 600;
        color: var(--lae-text-color-primary);
        padding: 0 var(--lae-padding-s);
        font-size: var(--lae-font-size-medium);
      }

      .tab-content fieldset:last-child {
        margin-bottom: 0;
      }

      /* Enhanced form styling within tabs */
      .tab-content .form-group {
        margin-bottom: var(--lae-padding-m);
      }

      .tab-content .form-group:last-child {
        margin-bottom: 0;
      }

      .tab-content .form-group label {
        display: block;
        margin-bottom: var(--lae-padding-xs);
        font-weight: 500;
        color: var(--lae-text-color-primary);
      }

      .tab-content .form-group input[type="text"],
      .tab-content .form-group input[type="number"],
      .tab-content .form-group select {
        width: 100%;
        padding: var(--lae-padding-s);
        border: 1px solid var(--lae-border-color-dark);
        border-radius: var(--lae-border-radius-standard);
        box-sizing: border-box;
        font-size: var(--lae-font-size-medium);
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }

      .tab-content .form-group input[type="text"]:focus,
      .tab-content .form-group input[type="number"]:focus,
      .tab-content .form-group select:focus {
        outline: none;
        border-color: var(--lae-text-color-accent);
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
      }

      .tab-content .form-group input[type="checkbox"] {
        margin-right: var(--lae-padding-s);
        transform: scale(1.1);
      }

      /* Enhanced rink points settings */
      .tab-content .rink-points-settings {
        border: 1px dashed var(--lae-border-color-rink-settings);
        padding: var(--lae-padding-m);
        margin-top: var(--lae-padding-s);
        background-color: var(--lae-background-color-rink-settings);
        border-radius: var(--lae-border-radius-standard);
        transition: opacity 0.3s ease;
      }

      .tab-content .rink-points-settings.disabled {
        opacity: 0.6;
      }

      /* Form group grid for better layout */
      .form-group-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--lae-padding-m);
      }

      .form-group-grid .form-group {
        margin-bottom: 0;
      }

      /* Responsive adjustments for tabs */
      @media (max-width: 600px) {
        .tab-button {
          padding: var(--lae-padding-xs) var(--lae-padding-s);
          min-width: 100px;
          font-size: var(--lae-font-size-small);
        }

        .form-group-grid {
          grid-template-columns: 1fr;
          gap: var(--lae-padding-s);
        }

        .tab-content fieldset {
          padding: var(--lae-padding-s);
        }
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

      /* SweetAlert2 Custom Theming */
      .swal2-popup {
        font-size: var(--le-font-size-base, 1rem);
      }
      
      .swal2-confirm {
        background-color: var(--le-color-danger, #d33) !important;
      }
      
      .swal2-cancel {
        background-color: var(--le-color-primary, #3085d6) !important;
      }
    `;

  // Mobile-specific styles
  export const MOBILE_STYLES = `
      ${BASE_STYLES}

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
      /* SweetAlert2 mobile styles are now injected globally by leagueAdminElement.js */
    `;

  // Desktop-specific styles
  export const DESKTOP_STYLES = `
      ${BASE_STYLES} /* Includes :host variables */
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

  // Base HTML template (placeholders will be filled by render logic)
  export const TEMPLATE_CONTENT = `
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
                              <button id="add-team-button" class="button-shared">Manage Teams</button>
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

          <!-- League Schedule panel -->
          <div id="league-schedule-panel" class="panel" style="display:none;">
              <div class="panel-header panel-header-shared">
                <span>Schedule</span>
              </div>
              <div class="panel-content panel-content-shared">
                <league-schedule id="admin-league-schedule"></league-schedule>
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
      
    <!-- Team modal is now handled by the league-teams component -->

    <!-- Modal for Add/Edit Match -->
    <league-match id="match-modal-instance" is-admin-context="true"></league-match>
    `;