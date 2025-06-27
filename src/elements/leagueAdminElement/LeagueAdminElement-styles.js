import { panelStyles, buttonStyles, modalStyles, formStyles, listItemStyles, tabStyles, dropdownStyles} from '../shared-styles.js';

// Base styles shared between mobile and desktop layouts
const BASE_STYLES = `
      ${panelStyles}   /* ADDED SHARED STYLE */
      ${buttonStyles}  /* ADDED SHARED STYLE */
      ${modalStyles}   /* ADDED SHARED MODAL STYLE */
      ${formStyles}    /* ADDED SHARED FORM STYLE */
      ${listItemStyles} /* ADDED SHARED LIST ITEM STYLE */
      ${tabStyles}
      ${dropdownStyles} /* ADDED SHARED DROPDOWN STYLE */
      :host {
        display: block;
        border: 1px solid var(--swal-border-color-medium, #ccc); 
        font-family: var(--swal-font-family-main, 'Open Sans', Helvetica, Arial, sans-serif); 
        box-sizing: border-box;
        color: var(--swal-text-color-primary, #333); 

        /* ADMIN THEME VARIABLES */
        --swal-font-family-main: 'Open Sans', Helvetica, Arial, sans-serif;
        
        /* Use shared font sizing system - no more swal- font size variables */
        /* Mobile and desktop will inherit appropriate sizing from shared styles */

        --swal-text-color-primary: #333;
        --swal-text-color-secondary: #666;
        --swal-text-color-accent: #007bff; 
        --swal-text-color-accent-hover: #0056b3;
        --swal-text-color-error: #D8000C;
        --swal-text-color-success: #4CAF50;
        --swal-text-color-on-primary: #fff;

        --swal-color-status-warning: var(--le-color-status-warning, #f39c12);
        --swal-color-status-conflict: var(--le-color-status-conflict, #e67e22);
        --swal-color-status-pending: var(--le-color-status-pending, #e74c3c);
        --swal-color-status-info: var(--le-color-status-info, #2196f3);
        --swal-color-status-success: var(--le-color-status-success, #4CAF50);

        --swal-background-color-host-desktop: #f8f9fa; 
        --swal-background-color-host-mobile: #f5f5f5;
        --swal-background-color-panel: #fff;
        --swal-background-color-header: #f5f5f5;
        --swal-background-color-button: #f0f0f0;
        --swal-background-color-button-hover: #e0e0e0;
        --swal-background-color-button-disabled: #eee;
        --swal-background-color-selected-item: #e9eff7; 
        --swal-background-color-modal-header: #f5f5f5;
        --swal-background-color-error: #FFD2D2;
        --swal-background-color-rink-settings: #f9f9f9;

        --swal-border-color-light: #f0f0f0;
        --swal-border-color-medium: #ddd;
        --swal-border-color-dark: #ccc;
        --swal-border-color-error: #D8000C;
        --swal-border-color-rink-settings: #ccc; 

        --swal-border-radius-standard: 4px;
        --swal-border-radius-large: 8px; 
        --swal-border-radius-mobile-panel: 12px;

        --swal-shadow-mobile-panel: 0 2px 8px rgba(0,0,0,0.06);

        --swal-spacing-unit: 0.25rem;
        --swal-padding-xs: calc(1 * var(--swal-spacing-unit));
        --swal-padding-s: calc(2 * var(--swal-spacing-unit));
        --swal-padding-m: calc(4 * var(--swal-spacing-unit));
        --swal-padding-l: calc(6 * var(--swal-spacing-unit));

        /* --- Mappings for shared-styles.js --- */
        /* These ensure shared components adopt the admin theme */
        --le-padding-xs: var(--swal-padding-xs);
        --le-padding-s: var(--swal-padding-s);
        --le-padding-m: var(--swal-padding-m);
        
        --le-border-color-light: var(--swal-border-color-light);
        --le-border-color-medium: var(--swal-border-color-medium);
        --le-border-color-dark: var(--swal-border-color-dark);

        --le-text-color-primary: var(--swal-text-color-primary);
        --le-text-color-secondary: var(--swal-text-color-secondary);
        --le-text-color-on-primary: var(--swal-text-color-on-primary);

        --le-background-color-header: var(--swal-background-color-header);
        --le-background-color-panel: var(--swal-background-color-panel);
        --le-background-color-button: var(--swal-background-color-button);
        --le-background-color-button-hover: var(--swal-background-color-button-hover);
        --le-background-color-button-disabled: var(--swal-background-color-button-disabled);

        --le-border-radius-standard: var(--swal-border-radius-standard);
        
        /* No font size mappings needed - use le- variables directly throughout */
        /* --- End Mappings --- */

      }
      .header {
        font-weight: bold;
        background: var(--swal-background-color-header);
        padding: var(--swal-padding-s);
        border-bottom: 1px solid var(--swal-border-color-medium);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .content-area {
        padding: var(--swal-padding-s) var(--swal-padding-xs);
      }
      .league-list-container {
          border-radius: var(--swal-border-radius-mobile-panel);
          box-shadow: var(--swal-shadow-mobile-panel);
          padding: var(--swal-padding-xs);
      }
      .column-leagues .panel-header-shared .action-buttons { /* For New/Copy buttons in Leagues header */
        display: flex; /* Ensure buttons are in a row */
        align-items: center;
        justify-content: flex-end; /* Align these buttons to the right */
        gap: var(--swal-padding-s); /* Space between New/Copy */
        margin-left: auto; /* Push this container to the right of "Leagues" text */
      }
      .league-list-item {
        padding: var(--swal-padding-s) var(--swal-padding-xs);
        border-bottom: 1px solid var(--swal-border-color-light); /* Keep border */
        /* Layout-specific properties moved to desktop/mobile sections */
      }
      .league-list-item:last-child {
        border-bottom: none;
      }
      .league-name-text {
        pointer-events: none;
        /* Layout-specific properties moved to desktop/mobile sections */
      }
      .league-item-actions-container { /* For View Table/Actions on selected league */
        gap: var(--swal-padding-s);
        min-height: 32px; /* Reserve space for buttons */
        /* Layout-specific properties moved to desktop/mobile sections */
      }
      .league-list-item.selected {
        background-color: var(--swal-background-color-selected-item, #e9eff7);
        font-weight: bold;
      }
      .league-list-item.selected .league-name-text {
         pointer-events: auto; /* Re-enable pointer events for selected text if needed, though likely not */
      }
      .league-action-button { /* These are small icon-like buttons, potentially keep specific styles or create a new shared variant */
        padding: var(--swal-padding-xs) var(--swal-padding-s); 
        border: 1px solid var(--swal-border-color-dark);
        background-color: var(--swal-background-color-button);
        cursor: pointer;
        border-radius: var(--swal-border-radius-standard);
      }
      .league-action-button:hover {
        background-color: var(--swal-background-color-button-hover);
      }

      .action-buttons { /* Container for main action buttons */
        display: flex;
        gap: var(--swal-padding-s); 
        flex-wrap: wrap; 
        margin-bottom: var(--swal-padding-m);
      }
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
        background-color: var(--swal-background-color-panel);
        margin: 10% auto; 
        padding: var(--swal-padding-l);
        border: 1px solid var(--swal-border-color-dark);
        width: 80%; 
        max-width: 600px; 
        border-radius: var(--swal-border-radius-large);
        box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19);
      }
      .modal-header {
        background-color: var(--swal-background-color-modal-header);
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--le-padding-s, 0.5em) var(--le-padding-m, 1em);
        border-bottom: 1px solid var(--le-border-color-medium, #eee);
        font-weight: bold;
      }
      .modal-body {
        padding: var(--swal-padding-m);
      }
      .modal-footer {
        padding: var(--swal-padding-s) var(--swal-padding-m);
        text-align: right;
        border-top: 1px solid var(--swal-border-color-medium);
      }
      .modal-footer button {
         margin-left: var(--swal-padding-s); /* Keep specific margin */
      }

      .modal-league-name-section {
        margin-bottom: var(--swal-padding-m);
        padding-bottom: var(--swal-padding-m);
        border-bottom: 1px solid var(--swal-border-color-light);
      }

      /* Form group grid for better layout */
      .form-group-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--swal-padding-m);
      }

      .form-group-grid .form-group {
        margin-bottom: 0;
      }

      .form-group {
        margin-bottom: var(--swal-padding-m);
      }
      .form-group label {
        display: block;
        margin-bottom: var(--swal-padding-xs);
        font-weight: bold;
      }
      .form-group input[type="text"],
      .form-group input[type="number"],
      .form-group input[type="date"],
      .form-group select {
        width: 100%;
        padding: var(--swal-padding-s);
        border: 1px solid var(--swal-border-color-dark);
        border-radius: var(--swal-border-radius-standard);
        box-sizing: border-box;
      }
      .form-group input[type="checkbox"] {
        margin-right: var(--swal-padding-s);
      }
      .rink-points-settings {
        border: 1px dashed var(--swal-border-color-rink-settings);
        padding: var(--swal-padding-s);
        margin-top: var(--swal-padding-s);
        background-color: var(--swal-background-color-rink-settings);
      }
      .error {
        color: var(--swal-text-color-error);
        background-color: var(--swal-background-color-error);
        padding: var(--swal-padding-s);
        border: 1px solid var(--swal-border-color-error);
        border-radius: var(--swal-border-radius-standard);
        margin-bottom: var(--swal-padding-m); 
      }
      /* Original column, resizer, panel styles from previous file state */
      /* These might need review after shared styles are fully integrated */
      .column {
        padding: var(--swal-padding-s);
        box-sizing: border-box;
      }
      .columns {
        display: flex;
      }
      .column-leagues {
        width: 30%; 
        min-width: 250px; 
        border-right: 1px solid var(--swal-border-color-medium);
        padding-right: var(--swal-padding-s); 
      }
      .column-details {
        flex-grow: 1; 
        padding-left: var(--swal-padding-s); 
      }
      .resizer {
        width: 10px;
        cursor: col-resize;
        background-color: var(--swal-background-color-header);
        border-left: 1px solid var(--swal-border-color-light);
        border-right: 1px solid var(--swal-border-color-light);
        z-index: 10;
      }
      .panel { /* This class is used on #teams-panel and #matches-panel */
        margin-bottom: var(--swal-padding-m);
        border: 1px solid var(--swal-border-color-light);
        border-radius: var(--swal-border-radius-standard);
      }
      .panel .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: var(--swal-background-color-header); /* Ensure admin context bg */
      }
      /* .panel .panel-content is covered by .panel-content-shared in template */

      .teams-list, .matches-list { /* These are direct children of panel-content-shared divs */
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .teams-list li, .matches-list li {
        padding: var(--swal-padding-xs);
        border-bottom: 1px solid var(--swal-border-color-light);
      }
      .teams-list li:last-child, .matches-list li:last-child {
        border-bottom: none;
      }
      .close-button {
        color: var(--swal-text-color-secondary, #aaa);
        float: right;
        font-weight: bold;
        cursor: pointer;
      }
      .close-button:hover,
      .close-button:focus {
        color: var(--swal-text-color-primary, #000);
        text-decoration: none;
      }
      .hidden {
        display: none !important;
      }

      #admin-matches-attention-container league-matches-attention {

      }
      #main-title {

      }
      .header-actions {
        /* Styles for the container of header actions if needed */
      }
      .header-actions button svg {
        vertical-align: middle; /* Align icon better with text if any */
        margin-right: var(--swal-padding-xs); /* Space between icon and text if text is shown */
      }

      /* Ensuring specificity for panel headers within the specific columns if needed */
      .column-leagues .panel-header,
      .column-details .panel-header {
          /* These already have .panel-header-shared in template, so shared styles apply. */
          /* Add specific overrides here if .panel-header-shared is not enough */
          /* For example, to ensure they use the correct background for admin context: */
          background-color: var(--swal-background-color-header);
      }

      /* SweetAlert2 Custom Theming */
      .swal2-popup {
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
        background: var(--swal-background-color-host-mobile, #f5f5f5);
        border: none;
        border-radius: 0;
        padding: var(--swal-padding-s);
        min-height: 100vh;
      }
      .columns { /* Main container for left/right columns */
        display: flex;
        flex-direction: column;
        gap: var(--swal-padding-m); /* Add gap between stacked columns */
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
        padding: var(--swal-padding-s) var(--swal-padding-xs);
      }
      .league-list-container {
          border-radius: var(--swal-border-radius-mobile-panel);
          box-shadow: var(--swal-shadow-mobile-panel);
          padding: var(--swal-padding-xs);
      }
      /* Mobile-specific league list layout */
      .league-list-item {
        display: flex;
        flex-direction: row; /* Keep items on same row for mobile too */
        align-items: center; /* Center all content vertically */
        justify-content: space-between;
        min-height: 60px; /* Ensure consistent row height */
      }
      .league-name-text {
        display: flex;
        align-items: center; /* Center text vertically */
        flex-grow: 1; /* Allow name to take available space */
        text-align: left; /* Ensure left alignment */
        margin-right: var(--swal-padding-s); /* Space before buttons */
      }
      .league-item-actions-container {
        display: flex;
        justify-content: flex-end; 
        align-items: center; /* Center buttons vertically */
        flex-shrink: 0; /* Prevent shrinking */
        height: 100%; /* Take full height of parent */
      }
      .league-action-button { /* Smaller buttons in league list items */
        padding: var(--swal-padding-xs) var(--swal-padding-s);
        min-height: 44px; /* Increased height for better touch target */
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .header { /* "League Administration" title in mobile */
        font-weight: bold;
        padding: var(--swal-padding-s) var(--swal-padding-xs);
        background: none;
        border: none;
        margin-bottom: var(--swal-padding-s);
      }
      .action-buttons { /* New, Copy etc. buttons container */
        margin-bottom: var(--swal-padding-s);
        gap: var(--swal-padding-s);
      }
      .action-buttons button { /* New, Copy etc. buttons */
        min-height: 44px;
        padding: var(--swal-padding-s) var(--swal-padding-m);
        border-radius: var(--swal-border-radius-standard);
        margin-bottom: var(--swal-padding-xs);
      }
      .panel, /* Applies to Teams, Matches, Attention panels in mobile */
      #admin-teams-panel,
      #admin-matches-panel,
      #admin-attention-panel {
        border: none;
        border-radius: var(--swal-border-radius-mobile-panel);
        background: var(--swal-background-color-panel);
        box-shadow: var(--swal-shadow-mobile-panel);
        padding: var(--swal-padding-s) var(--swal-padding-m);
        margin: 0 0 var(--swal-padding-m) 0;
        width: 100%;
        box-sizing: border-box;
        display: block;
      }
      .panel-header { /* Mobile panel headers for Teams panel */
        display: flex; /* Ensure it's flex */
        flex-direction: row; /* Align items in a row */
        justify-content: space-between; /* Space between title and button */
        align-items: center; /* Vertically align items */
        font-weight: bold;
        margin-bottom: var(--swal-padding-s);
        background: none; /* Keep transparent background */
        border: none; /* Keep no border */
        padding: var(--swal-padding-xs) 0;
      }
      .panel-header h4 {
          margin-bottom: 0;
          margin-right: auto; /* Push button to the right if h4 is used */
      }
      .panel-header button { /* Add Team button */
        padding: var(--swal-padding-s) var(--swal-padding-m); /* Keep existing padding */
        margin-top: 0; /* Remove top margin */
        margin-left: var(--swal-padding-s); /* Add some left margin if needed, or rely on space-between */
      }
      
      /* Mobile-specific team list layout */
      #teams-list li.team-item {
        list-style-type: none; 
        display: flex;
        flex-direction: column; /* Stack name and actions vertically on mobile */
        padding: var(--swal-padding-s) 0; 
        border-bottom: 1px solid var(--swal-border-color-light);
        min-height: 60px; /* Ensure consistent row height */
        justify-content: center; /* Center content vertically */
      }
      #teams-list li.team-item:last-child {
        border-bottom: none;
      }
      #teams-list li.team-item .team-name {
        margin-bottom: var(--swal-padding-s); 
        text-align: left; /* Ensure left alignment */
        display: flex;
        align-items: center; /* Center text vertically */
        width: 100%; /* Take full width */
      }
      #teams-list li.team-item .team-actions {
        display: flex;
        justify-content: flex-end; 
        gap: var(--swal-padding-s);
        min-height: 32px; /* Reserve space for buttons */
        align-items: center; /* Center buttons vertically */
        width: 100%; /* Take full width */
      }
      /* End of Mobile-specific team list layout */

      .team-name { /* General .team-name, may be overridden by more specific above */
      }
      .team-actions button { /* General .team-actions button, may be overridden */
      }

      .match-item { /* For items within Matches panel in mobile */
        padding: var(--swal-padding-s) var(--swal-padding-xs);
      }
      .match-date {
      }
      .match-team { 
      }
      .match-score {
        padding: 0 var(--swal-padding-xs);
      }
      .match-status {
        align-self: center; 
      }
      .team-item.selected-team { /* ADDED for mobile selection highlight */
        background-color: var(--swal-background-color-selected-item, #e9eff7); 
        /* font-weight: bold; */
      }
      /* SweetAlert2 mobile styles are now injected globally by leagueAdminElement.js */
    `;

  // Desktop-specific styles
  export const DESKTOP_STYLES = `
      ${BASE_STYLES}
      :host {
         padding: var(--swal-padding-m);
         height: 100%;
         background-color: var(--swal-background-color-host-desktop);
      }
      .panel-header { 
        flex-direction: row; 
        align-items: center; 
        background: var(--swal-background-color-header); 
        border-bottom: 1px solid var(--swal-border-color-medium); 
        padding: var(--swal-padding-s); 
      }
      .panel-header h4 {
          margin-bottom: 0;
      }
      .panel-header button { /* Add Team/Match on Desktop */
        padding: var(--swal-padding-xs) var(--swal-padding-s);
        margin-left: auto; /* Push to the right */
      }

      /* Team list item styling for desktop */
      #teams-list li.team-item {  /* Using ID selector */
        list-style-type: none; /* Remove bullets */
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--swal-padding-xs) 0; /* Vertical padding, horizontal handled by parent */
        border-bottom: 1px solid var(--swal-border-color-light); /* Add a separator line if desired */
      }
      #teams-list li.team-item:last-child { /* Using ID selector */
        border-bottom: none; /* Remove border for the last item */
      }
      #teams-list li.team-item .team-name {  /* Using ID selector */
        flex-grow: 1; 
        margin-right: var(--swal-padding-s); 
      }
      #teams-list li.team-item .team-actions {  /* Using ID selector */
        display: flex; /* Ensure buttons inside actions are also in a row */
        gap: var(--swal-padding-s); 
        flex-shrink: 0; 
        min-height: 32px; /* Reserve space for buttons */
      }
      
      /* Desktop-specific league list layout */
      .league-list-item {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
      .league-name-text {
        flex-grow: 1; /* Allow name to take available space */
        margin-right: var(--swal-padding-s); /* Space before buttons */
        display: flex;
        align-items: center;
        text-align: left;
      }
      .league-item-actions-container {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        flex-shrink: 0; /* Prevent button container from shrinking */
      }
      
      .league-list-container {
        flex-shrink: 0; 
        /* REMOVED max-height: 40%; */
        /* REMOVED overflow-y: auto; */
      }
      .league-list-item.selected {
        background-color: var(--swal-background-color-selected-item); 
      }
      .league-item-actions-container {
        flex-shrink: 0; 
        min-height: 32px; /* Reserve space for buttons */
      }
      .league-action-button { /* View Table, Actions buttons in league list for desktop */
        padding: var(--swal-padding-xs) var(--swal-padding-s);
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
        background-color: var(--swal-background-color-selected-item, #e9eff7); 
        /* font-weight: bold; /* Optionally make text bold */
      }
    `;

  // Base HTML template (placeholders will be filled by render logic)
  export const TEMPLATE_CONTENT = `
    <div class="header">
      <div id="main-title">League Admin</div>
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
              <button id="add-team-button" class="button-shared">Manage</button>
          </div>
            <div id="teams-list" class="panel-content panel-content-shared"></div> 
              </div>

          <!-- LeagueMatchesAttention moved here, directly under Teams panel -->
          <div id="admin-matches-attention-container" class="panel" style="margin-bottom: var(--swal-padding-m);">
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