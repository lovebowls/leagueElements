import { panelStyles, buttonStyles, modalStyles, formStyles, listStyles, tabStyles, dropdownStyles, helpBannerStyles} from '../shared-styles.js';

// Base styles shared between mobile and desktop layouts
const BASE_STYLES = `
      ${panelStyles}   /* ADDED SHARED panelStyles */
      ${buttonStyles}  /* ADDED SHARED buttonStyles */
      ${modalStyles}   /* ADDED SHARED modalStyles */
      ${formStyles}    /* ADDED SHARED formStyles */
      ${listStyles} /* ADDED SHARED listStyles */
      ${tabStyles} /* ADDED SHARED tabStyles */
      ${dropdownStyles} /* ADDED SHARED dropdownStyles */
      ${helpBannerStyles} /* ADDED SHARED helpBannerStyles */
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
        
        #leagueName {
          font-size: var(--le-font-size-medium);
        }
          
      }
      /* Highlighted glow for New button when no leagues exist */
      .highlight-glow {
        box-shadow: 0 0 8px 2px #66bb6a, 0 0 0 4px #e8f5e9;
        background-color: #e8f5e9 !important;
        transition: box-shadow 0.3s, background-color 0.3s;
        z-index: 1;
        animation: pulse-glow 2s ease-in-out infinite;
      }
      @keyframes pulse-glow {
        0% {
          box-shadow: 0 0 8px 2px #66bb6a, 0 0 0 4px #e8f5e9;
          background-color: #e8f5e9;
        }
        50% {
          box-shadow: 0 0 16px 6px #43a047, 0 0 0 8px #d0f8ce;
          background-color: #d0f8ce;
        }
        100% {
          box-shadow: 0 0 8px 2px #66bb6a, 0 0 0 4px #e8f5e9;
          background-color: #e8f5e9;
        }
      }
      
      /* Loading spinner for buttons */
      .loading-spinner {
        display: inline-block;
        width: 12px;
        height: 12px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-right: 6px;
        vertical-align: middle;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      /* Disabled button styling */
      .button-shared:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      .button-shared:disabled .loading-spinner {
        opacity: 0.8;
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
      .column-leagues .panel-header-shared button:first-of-type { /* First button (New) gets pushed to the right */
        margin-left: auto;
      }
      .column-leagues .panel-header-shared button:not(:first-of-type) { /* Subsequent buttons (Copy) get spacing */
        margin-left: var(--swal-padding-s);
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

      .panel-header-actions {
        display: flex;
        align-items: center;
        gap: var(--swal-padding-s);
        flex-shrink: 0; /* Prevent shrinking */
        flex-wrap: nowrap; /* Prevent wrapping */
      }
      
      /* Ensure buttons in panel headers maintain proper sizing */
      .panel-header-shared .button-shared {
        flex-shrink: 0; /* Prevent buttons from shrinking */
        min-height: auto !important; /* Override any min-height from mobile styles */
        height: auto !important; /* Allow natural height */
      }
      
      /* Override mobile-specific button styles for panel headers */
      @media (max-width: 768px) {
        .panel-header-shared .button-shared {
          min-height: auto !important; /* Override mobile min-height for panel header buttons */
        }
        
        .panel-header-shared .panel-header-actions {
          flex-wrap: nowrap !important; /* Ensure buttons stay on same line */
        }
      }

      /* Special styling for Table button */
      #view-table-button {
        background: linear-gradient(135deg, var(--swal-text-color-accent, #007bff) 0%, var(--swal-text-color-accent-hover, #0056b3) 100%);
        color: var(--swal-text-color-on-primary, #fff);
        border: none;
        box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        transition: all 0.3s ease;
        position: relative;
      }

      #view-table-button:hover {
        background: linear-gradient(135deg, var(--swal-text-color-accent-hover, #0056b3) 0%, #004085 100%);
        box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
        transform: translateY(-1px);
      }

      #view-table-button:active {
        transform: translateY(0);
        box-shadow: 0 3px 8px rgba(0, 123, 255, 0.3);
      }

      .action-buttons { /* Container for main action buttons */
        display: flex;
        gap: var(--swal-padding-s); 
        flex-wrap: wrap; 
        margin-bottom: var(--swal-padding-m);
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
      .error {
        color: var(--swal-text-color-error);
        background-color: var(--swal-background-color-error);
        padding: var(--swal-padding-s);
        border: 1px solid var(--swal-border-color-error);
        border-radius: var(--swal-border-radius-standard);
        margin-bottom: var(--swal-padding-m); 
      }

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
        padding: 0; /* Reset padding, let panels handle their own */
      }
      .column-details {
        flex-grow: 1; 
        padding: 0 0 0 var(--swal-padding-s);
      }



      .teams-list, .matches-list { /* These are direct children of panel-content divs */
        list-style: none;
        padding: 0;
        margin: 0;
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

      /* --- Panel header flexbox layout fix --- */
      .panel-header-shared {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: nowrap;
      }
      .panel-header-shared span {
        flex: 1 1 0%;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .panel-header-actions {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        gap: var(--swal-padding-s);
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
      .content-area {
        padding: var(--swal-padding-s) var(--swal-padding-xs);
      }
      .league-list-container {
          padding-inline-start: 5px;
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
        padding: 0;
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
        padding: var(--swal-padding-s);
      }
      
      .list-container, .panel-content {
        padding: 0 var(--swal-padding-s) var(--swal-padding-s);
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

      /* On mobile the buttons are on their own row, so we need to add some padding */
      #league-actions-panel {
        padding: 8px;
      }      
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
      .panel-header button { /* Add Team/Match on Desktop */
        margin-left: auto; /* Push to the right */
      }
      .league-list-container {
        flex-shrink: 0; 
      }
      .league-action-button { /* Table, Actions buttons in league list for desktop */
        padding: var(--swal-padding-xs) var(--swal-padding-s);
      }
        bottom: 100%; 
        top: auto; 
        right: 0; 
      } */
    `;

  // Base HTML template (placeholders will be filled by render logic)
  export const DESKTOP_TEMPLATE = `
    <div class="help-banner-shared">
      <a href="https://lovebowls-leagues.netlify.app/#/" target="_blank" rel="noopener noreferrer">Help & Documentation</a>
      <span class="separator">|</span>
      <a href="mailto:admin@lovebowls.co.uk">Raise Issue</a>
    </div>
    <div class="header">
      <div id="main-title">League Admin</div>
      <div class="header-actions">
      </div>
    </div>
    <div id="error-message" class="error" style="display: none;"></div>
    <div class="content-area">
      <div class="columns">
        <div class="column column-leagues">
          <div class="list-panel">
            <div class="panel-header panel-header-shared">
              <span>Leagues</span>
              <div class="panel-header-actions">
                <button id="new-league-button" class="button-shared">New</button>
                <button id="copy-league-button" class="button-shared" disabled>Copy</button>
              </div>
            </div>
            <div class="list-container">
              <ul class="list" id="league-list"></ul>
            </div>
          </div>
        </div>

        <div class="resizer" id="resizer"></div>

        <div class="column column-details">
          <!-- League Dashboard Panel -->
          <div id="league-dashboard-panel" class="panel" style="display:none;">
            <div class="panel-header panel-header-shared">
              <span>Dashboard</span>
              <div id="league-actions-panel" class="panel-header-actions">
                <button id="edit-league-button" class="button-shared">Edit..</button>
                <button id="view-table-button" class="button-shared">Table ↗️</button>
              </div>
            </div>
            <div class="panel-content">
              <league-dashboard id="admin-league-dashboard"></league-dashboard>
            </div>
          </div>

          <div id="teams-panel" class="panel" style="display:none;">
            <div class="panel-header panel-header-shared"> 
              <span>Teams</span>
              <button id="add-team-button" class="button-shared">Manage</button>
          </div>
            <div class="list-container">
              <ul class="list" id="teams-list"></ul>
            </div>
          </div>

          <!-- LeagueMatchesAttention moved here, directly under Teams panel -->
          <div id="admin-matches-attention-container" class="panel" style="margin-bottom: var(--swal-padding-m);">
              <div class="panel-header panel-header-shared">
                <span>Requiring Attention</span> 
              </div>
              <div class="panel-content">
                <league-matches-attention id="admin-attention-matches" data-league-id=""></league-matches-attention>
              </div>
          </div>

          <!-- League Schedule panel -->
          <div id="league-schedule-panel" class="panel" style="display:none;">
              <div class="panel-header panel-header-shared">
                <span>Schedule</span>
              </div>
              <div class="panel-content">
                <league-schedule id="admin-league-schedule"></league-schedule>
              </div>
          </div>
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

  export const MOBILE_TEMPLATE = `
    <div class="help-banner-shared">
      <a href="https://lovebowls-leagues.netlify.app/#/" target="_blank" rel="noopener noreferrer">Help & Documentation</a>
      <span class="separator">|</span>
      <a href="mailto:admin@lovebowls.co.uk">Raise Issue</a>
    </div>
    <div class="header">
      <div id="main-title">League Admin</div>
      <div class="header-actions">
      </div>
    </div>
    <div id="error-message" class="error" style="display: none;"></div>
    <div class="content-area">
      <div class="columns">
        <div class="column column-leagues">
          <div class="list-panel">
            <div class="panel-header panel-header-shared">
              <span>Leagues</span>
              <div class="panel-header-actions">
                <button id="new-league-button" class="button-shared">New</button>
                <button id="copy-league-button" class="button-shared" disabled>Copy</button>
              </div>
            </div>
            <div class="list-container">
              <ul class="list" id="league-list"></ul>
            </div>
          </div>
        </div>

        <div class="resizer" id="resizer"></div>

        <div class="column column-details">
          <!-- League Dashboard Panel -->
          <div id="league-dashboard-panel" class="panel" style="display:none;">
            <div class="panel-header panel-header-shared">
              <span>Dashboard</span>
            </div>
            <div id="league-actions-panel" class="panel-header-actions">
              <button id="edit-league-button" class="button-shared">Edit..</button>
              <button id="view-table-button" class="button-shared">Table ↗️</button>
            </div>            
            <div class="panel-content">
              <league-dashboard id="admin-league-dashboard"></league-dashboard>
            </div>
          </div>

          <div id="teams-panel" class="panel" style="display:none;">
            <div class="panel-header panel-header-shared"> 
              <span>Teams</span>
              <button id="add-team-button" class="button-shared">Manage</button>
          </div>
            <div class="list-container">
              <ul class="list" id="teams-list"></ul>
            </div>
          </div>

          <!-- LeagueMatchesAttention moved here, directly under Teams panel -->
          <div id="admin-matches-attention-container" class="panel" style="margin-bottom: var(--swal-padding-m);">
              <div class="panel-header panel-header-shared">
                <span>Requiring Attention</span> 
              </div>
              <div class="panel-content">
                <league-matches-attention id="admin-attention-matches" data-league-id=""></league-matches-attention>
              </div>
          </div>

          <!-- League Schedule panel -->
          <div id="league-schedule-panel" class="panel" style="display:none;">
              <div class="panel-header panel-header-shared">
                <span>Schedule</span>
              </div>
              <div class="panel-content">
                <league-schedule id="admin-league-schedule"></league-schedule>
              </div>
          </div>
        </div>
      </div>
    </div>
      
    <!-- Modal for New/Edit League -->
    <div id="league-modal" class="modal-shared-overlay">
        <div class="modal-shared-content mobile-view">
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

    <!-- Modal for Add/Edit Match -->
    <league-match id="match-modal-instance" is-admin-context="true"></league-match>
    `;