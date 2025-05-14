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

class LeagueAdminElement extends HTMLElement {
  // Base styles shared between mobile and desktop layouts
  static get BASE_STYLES() {
    return `
      :host {
        display: block;
        border: 1px solid #ccc;
        font-family: 'Open Sans', Helvetica, Arial, sans-serif;
        box-sizing: border-box;
        color: #333; /* Default text color */
        --main-content-font-size: 1em; /* Define the CSS variable */
      }
      .sr-only { /* Screen-reader only */
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }
      .header {
        font-weight: bold;
        background: #f5f5f5;
        padding: 0.5rem;
        border-bottom: 1px solid #ddd;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .content-area {
        padding: 0.5rem;
      }
      .league-list-container {
        margin-bottom: 1rem;
        border: 1px solid #eee;
        min-height: 100px; /* Placeholder height */
        padding: 0.5rem;
      }
      .league-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .league-list-item {
        padding: 0.5rem;
        border-bottom: 1px solid #f0f0f0;
        cursor: pointer;
      }
      .league-list-item:last-child {
        border-bottom: none;
      }
      .league-list-item.selected {
        background-color: #e0e0e0;
        font-weight: bold;
      }
      .action-buttons {
        display: flex;
        gap: 0.5rem; /* Space between buttons */
        flex-wrap: wrap; /* Allow buttons to wrap on smaller screens */
        margin-bottom: 1rem;
      }
      .action-buttons button {
        padding: 0.5rem 1rem;
        border: 1px solid #ddd;
        background-color: #f9f9f9;
        cursor: pointer;
        border-radius: 4px;
      }
      .action-buttons button:disabled {
        background-color: #eee;
        color: #aaa;
        cursor: not-allowed;
      }
      .action-buttons button:hover:not(:disabled) {
        background-color: #e9e9e9;
      }
      .modal {
        display: none; /* Hidden by default */
        position: fixed; /* Stay in place */
        z-index: 1000; /* Sit on top */
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto; /* Enable scroll if needed */
        background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
      }
      .modal-content {
        background-color: #fefefe;
        margin: 10% auto; /* 10% from the top and centered */
        padding: 20px;
        border: 1px solid #888;
        width: 80%; /* Could be more or less, depending on screen size */
        max-width: 600px; /* Maximum width */
        border-radius: 8px;
        box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19);
      }
      .modal-header {
        padding: 0.5rem 1rem;
        background-color: #f5f5f5;
        border-bottom: 1px solid #ddd;
        font-weight: bold;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .modal-body {
        padding: 1rem;
      }
      .modal-footer {
        padding: 0.5rem 1rem;
        text-align: right;
        border-top: 1px solid #ddd;
      }
      .modal-footer button {
         margin-left: 0.5rem;
      }
      .form-group {
        margin-bottom: 1rem;
      }
      .form-group label {
        display: block;
        margin-bottom: 0.25rem;
        font-weight: bold;
      }
      .form-group input[type="text"],
      .form-group input[type="number"],
      .form-group input[type="date"],
      .form-group select {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
      }
      .form-group input[type="checkbox"] {
        margin-right: 0.5rem;
      }
      .rink-points-settings {
        border: 1px dashed #ccc;
        padding: 0.5rem;
        margin-top: 0.5rem;
        background-color: #f9f9f9;
      }
      .error {
        color: #D8000C; /* Red for errors */
        background-color: #FFD2D2; /* Light red background */
        padding: 0.5rem;
        border: 1px solid #D8000C;
        border-radius: 4px;
        margin-bottom: 0.5rem;
      }
      
      /* Selected League Panel Styles */
      .selected-league-panel {
        border: 1px solid #ddd;
        border-radius: 4px;
        margin-top: 1rem;
        background-color: #f9f9f9;
      }
      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem;
        background-color: #f0f0f0;
        border-bottom: 1px solid #ddd;
      }
      .panel-header h3,
      .panel-header h4 {
        margin: 0;
        font-size: 1.1rem;
      }
      
      /* Dropdown Styles */
      .dropdown {
        position: relative;
        display: inline-block;
      }
      .dropdown-button {
        background-color: #f9f9f9;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 0.5rem 1rem;
        cursor: pointer;
      }
      .dropdown-content {
        display: none;
        position: absolute;
        right: 0;
        background-color: #f9f9f9;
        min-width: 160px;
        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
        z-index: 1;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      .dropdown-content a {
        color: black;
        padding: 12px 16px;
        text-decoration: none;
        display: block;
        cursor: pointer;
      }
      .dropdown-content a:hover {
        background-color: #f1f1f1;
      }
      .dropdown.show .dropdown-content {
        display: block;
      }
      
      /* Teams Panel Styles */
      .teams-panel {
        margin-top: 1rem;
        border-top: 1px solid #ddd;
      }
      .teams-list-container {
        padding: 0.5rem;
        max-height: 300px;
        overflow-y: auto;
      }
      .teams-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .team-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem;
        border-bottom: 1px solid #f0f0f0;
      }
      .team-item:last-child {
        border-bottom: none;
      }
      .team-name {
        flex-grow: 1;
      }
      .team-actions {
        display: flex;
        gap: 0.5rem;
      }
      .team-actions button {
        padding: 0.25rem 0.5rem;
        font-size: 0.85rem;
        border: 1px solid #ddd;
        background-color: #f9f9f9;
        cursor: pointer;
        border-radius: 3px;
      }
      .team-actions button:hover {
        background-color: #e9e9e9;
      }
      
      /* Matches Panel Styles */
      .matches-panel {
        margin-top: 1rem;
        border-top: 1px solid #ddd;
      }
      .matches-list-container {
        padding: 0.5rem;
        max-height: 400px;
        overflow-y: auto;
      }
      .matches-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .match-item {
        padding: 0.5rem;
        border-bottom: 1px solid #eee;
        font-size: var(--main-content-font-size);
      }
      .match-item:last-child {
        border-bottom: none;
      }
      .match-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.25rem;
      }
      .match-date {
        font-size: 0.85rem;
        color: #666;
      }
      .match-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .match-teams {
        display: flex;
        justify-content: space-between;
        width: 100%;
        gap: 1rem;
      }
      .match-team {
        width: 50%;
      }
      .match-team.home {
        text-align: left;
      }
      .match-team.away {
        text-align: right;
      }
      .match-score {
        font-weight: bold;
        padding: 0 0.5rem;
      }
      .match-result {
        display: flex;
        align-items: center;
      }
      .match-status {
        font-size: 0.85rem;
        font-style: italic;
        color: #777;
      }
      .match-completed .match-status {
        color: #4CAF50;
      }
      
      /* Match Modal Styles */
      #matchModalBody .match-teams {
        display: flex;
        gap: 1.5rem;
      }
      #matchModalBody .match-team {
        flex: 1;
      }
      .dashboard {
        display: flex;
        height: 100%;
        gap: 1rem;
      }
      .left-panel {
        flex: 0 0 70%;
        min-width: 0;
        display: flex;
        flex-direction: column;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
      }
      .right-panel {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        min-width: 0;
      }
      .resizer {
        width: 5px;
        background: #ddd;
        cursor: col-resize;
        transition: background 0.2s;
      }
      .resizer:hover {
        background: #999;
      }
      .panel {
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
        padding: 1rem;
      }
      .panel-header {
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
        color: #333;
      }
    `;
  }

  // Mobile-specific styles
  static get MOBILE_STYLES() {
    return `
      ${LeagueAdminElement.BASE_STYLES}
      :host {
        /* Mobile specific host adjustments if any */
      }
      .header {
        font-size: 1.1rem;
        padding: 0.4rem;
      }
       .content-area {
        padding: 0.4rem;
      }
      .action-buttons button {
        padding: 0.4rem 0.8rem;
        font-size: 0.9rem;
      }
      .modal-content {
        margin: 5% auto;
        width: 90%;
      }
      
      /* Mobile adjustments for new panels */
      .panel-header {
        flex-direction: column;
        align-items: flex-start;
      }
      .panel-header h3,
      .panel-header h4 {
        margin-bottom: 0.5rem;
      }
      .dropdown {
        align-self: flex-end;
      }
      .team-item {
        flex-direction: column;
        align-items: flex-start;
      }
      .team-actions {
        margin-top: 0.5rem;
        align-self: flex-end;
      }
      
      /* Mobile adjustments for match panel and modal */
      .match-content {
        flex-direction: column;
      }
      .match-result {
        width: 100%;
        margin-top: 0.25rem;
      }
      #matchModalBody .match-teams {
        flex-direction: column;
        gap: 1rem;
      }
      #matchModalBody .match-team {
        width: 100%;
      }
    `;
  }

  // Desktop-specific styles
  static get DESKTOP_STYLES() {
    return `
      ${LeagueAdminElement.BASE_STYLES}
      :host {
         /* Desktop specific host adjustments if any */
         padding: 1rem;
         height: 100%;
      }
      .dashboard {
        display: flex;
        height: 100%;
        gap: 1rem;
      }
      .left-panel {
        flex: 0 0 70%;
        min-width: 0;
        display: flex;
        flex-direction: column;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
      }
      .right-panel {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        min-width: 0;
      }
      .panel {
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
        padding: 1rem;
      }
      .panel-header {
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
        color: #333;
      }
      .resizer {
        width: 5px;
        background: #ddd;
        cursor: col-resize;
        transition: background 0.2s;
      }
      .resizer:hover {
        background: #999;
      }
    `;
  }

  // Base HTML template (placeholders will be filled by render logic)
  static get TEMPLATE_CONTENT() {
    return `
      <div class="dashboard">
        <div class="left-panel">
          <div class="header">
            <span id="elementTitle">{{title}}</span>
          </div>
          <div class="content-area">
            <div id="errorContainer"></div>
            <div class="action-buttons">
              <button id="btnNew">New</button>
              <button id="btnCopy" disabled>Copy</button>
              <button id="btnUpdate" disabled>Update</button>
              <button id="btnDelete" disabled>Delete</button>
            </div>
            <div class="league-list-container">
              <ul class="league-list" id="leagueList">
                <!-- League items will be populated here -->
              </ul>
            </div>
            
            <!-- Selected League Panel - Hidden by default -->
            <div id="selectedLeaguePanel" class="selected-league-panel" style="display: none;">
              <div class="panel-header">
                <h3 id="selectedLeagueName">League Name</h3>
                <div class="dropdown">
                  <button id="btnActions" class="dropdown-button">Actions</button>
                  <div id="actionsDropdown" class="dropdown-content">
                    <a href="#" id="btnResetLeague">Reset</a>
                    <a href="#" id="btnViewLeagueTable">View League Table</a>
                  </div>
                </div>
              </div>
              
              <!-- Teams Panel and Matches Panel REMOVED FROM HERE -->
            </div>
          </div>
        </div>
        <div class="resizer"></div>
        <div class="right-panel">
          <div class="panel" id="admin-attention-panel" style="display: none;">
            <league-matches-attention id="admin-attention-matches"></league-matches-attention>
          </div>
          <!-- Teams Panel MOVED HERE -->
          <div class="panel" id="admin-teams-panel" style="display: none;">
            <div class="teams-panel">
              <div class="panel-header">
                <h4>Teams</h4>
                <button id="btnAddTeam">Add Team</button>
              </div>
              <div class="teams-list-container">
                <ul id="teamsList" class="teams-list">
                  <!-- Teams will be populated here -->
                </ul>
              </div>
            </div>
          </div>
          <!-- Matches Panel MOVED HERE -->
          <div class="panel" id="admin-matches-panel" style="display: none;">
            <div class="matches-panel">
              <div class="panel-header">
                <h4>Matches</h4>
                <button id="btnAddMatch">Add Match</button>
              </div>
              <div class="matches-list-container">
                <ul id="matchesList" class="matches-list">
                  <!-- Matches will be populated here -->
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="leagueModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <span id="modalTitle">League Details</span>
            <button id="btnCloseModal" aria-label="Close modal">&times;</button>
          </div>
          <div class="modal-body" id="modalBody">
            <!-- Form fields will be populated here -->
          </div>
          <div class="modal-footer">
            <button id="btnCancelModal">Cancel</button>
            <button id="btnSaveModal">Save</button>
          </div>
        </div>
      </div>
      
      <!-- Team Modal -->
      <div id="teamModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <span id="teamModalTitle">Team Details</span>
            <button id="btnCloseTeamModal" aria-label="Close modal">&times;</button>
          </div>
          <div class="modal-body" id="teamModalBody">
            <!-- Team form fields will be populated here -->
          </div>
          <div class="modal-footer">
            <button id="btnCancelTeamModal">Cancel</button>
            <button id="btnSaveTeamModal">Save</button>
          </div>
        </div>
      </div>
      
      <!-- Match Modal -->
      <div id="matchModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <span id="matchModalTitle">Match Details</span>
            <button id="btnCloseMatchModal" aria-label="Close modal">&times;</button>
          </div>
          <div class="modal-body" id="matchModalBody">
            <div class="form-group">
              <label for="matchDate">Date</label>
              <input type="date" id="matchDate">
            </div>
            <div class="match-teams">
              <div class="match-team home">
                <div class="form-group">
                  <label for="matchHomeTeam">Home Team</label>
                  <select id="matchHomeTeam"></select>
                </div>
                <div class="form-group">
                  <label for="matchShotsHome">Shots</label>
                  <input type="number" id="matchShotsHome" min="0">
                </div>
              </div>
              <div class="match-team away">
                <div class="form-group">
                  <label for="matchAwayTeam">Away Team</label>
                  <select id="matchAwayTeam"></select>
                </div>
                <div class="form-group">
                  <label for="matchShotsAway">Shots</label>
                  <input type="number" id="matchShotsAway" min="0">
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button id="btnCancelMatchModal">Cancel</button>
            <button id="btnSaveMatchModal">Save</button>
          </div>
        </div>
      </div>
    `;
  }


  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this._elementTitle = this.getAttribute('elementTitle') || 'League Administration';
    this._leagues = [];
    this._selectedLeagueId = null; // Store ID of the selected league
    this._currentLeagueId = null; // Store ID of the league to be pre-selected
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
  }

  static get observedAttributes() {
    return ['elementTitle', 'data', 'isMobile', 'currentLeagueId'];
  }

  connectedCallback() {
    this._elementTitle = this.getAttribute('elementTitle') || this._elementTitle;
    this._currentLeagueId = this.getAttribute('currentLeagueId') || null;
    const rawData = this.getAttribute('data');
    if (rawData) {
        this._parseAndLoadData(rawData);
    }
    document.addEventListener('click', this._boundHandleDocumentClickForActionsDropdown);
    this.render();
  }

  disconnectedCallback() {
    // Cleanup event listeners if any were added directly to document or window
    document.removeEventListener('click', this._boundHandleDocumentClickForActionsDropdown);
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
    } else if (name === 'isMobile') {
      needsRender = true;
    } else if (name === 'currentLeagueId') {
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
    const errorContainer = this.shadow.querySelector('#errorContainer');
    if (errorContainer) {
      errorContainer.innerHTML = `<div class="error">${message}</div>`;
    } else {
      // Fallback if container not ready, though render should ensure it is.
      console.error("Error container not found in shadow DOM. Message:", message);
    }
  }

  clearError() {
    const errorContainer = this.shadow.querySelector('#errorContainer');
    if (errorContainer) {
      errorContainer.innerHTML = '';
    }
  }

  // Helper method to replace placeholders in template
  _fillTemplate(templateString) {
    return templateString.replace(/{{title}}/g, this._elementTitle);
  }

  render() {
    console.log('[Admin Render] _selectedLeagueId:', this._selectedLeagueId);
    console.log('[Admin Render] Current _leagues before getSelectedLeague:', JSON.parse(JSON.stringify(this._leagues)));
    const leagueForRender = this._getSelectedLeague(); // It's critical this reflects the update
    console.log('[Admin Render] League object for render:', JSON.parse(JSON.stringify(leagueForRender)));

    const isMobile = this.getAttribute('isMobile') === 'true';
    
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
            this._showSelectedLeaguePanel(); // Show the selected league panel (uses _getSelectedLeague() internally)
        } else {
            this._selectedLeagueId = null; // It no longer exists or leagueForRender is null
            this._hideSelectedLeaguePanel(); // Hide the panel
            this._updateButtonStates();
        }
    } else {
        this._hideSelectedLeaguePanel(); // Make sure panel is hidden when no league is selected
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
      modal.isMobile = this.getAttribute('isMobile') === 'true';
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
    const listElement = this.shadow.querySelector('#leagueList');
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
      li.classList.add('league-list-item');
      li.textContent = league.name || 'Unnamed League'; // Display league name
      // Use league._id or another unique identifier if available
      // For now, we'll use the name as a temporary ID, but this needs to be robust
      const leagueId = league._id || league.name; // Prefer _id
      li.setAttribute('data-id', leagueId); 
      
      li.addEventListener('click', () => this._handleLeagueSelect(leagueId));
      listElement.appendChild(li);
    });
  }

  _handleLeagueSelect(leagueId) {
    this.clearError();
    // Deselect previous
    const currentlySelected = this.shadow.querySelector('.league-list-item.selected');
    if (currentlySelected) {
      currentlySelected.classList.remove('selected');
    }

    if (this._selectedLeagueId === leagueId) { // Clicked already selected item
        this._selectedLeagueId = null; // Deselect
        this._hideSelectedLeaguePanel(); // Hide the panel when deselected
    } else {
        this._selectedLeagueId = leagueId;
        const newSelectedItem = this.shadow.querySelector(`.league-list-item[data-id="${leagueId}"]`);
        if (newSelectedItem) {
          newSelectedItem.classList.add('selected');
        }
        this._showSelectedLeaguePanel(); // Show and populate the panel
    }
    this.dispatchEvent(new LeagueAdminElementEvent('leagueSelected', { leagueId: this._selectedLeagueId }));
    this._updateButtonStates();
  }

  _showSelectedLeaguePanel() {
    const selectedLeague = this._getSelectedLeague();
    if (!selectedLeague) return;
    
    const panel = this.shadow.querySelector('#selectedLeaguePanel');
    const leagueName = this.shadow.querySelector('#selectedLeagueName');
    
    if (panel && leagueName) {
      leagueName.textContent = selectedLeague.name || 'Unnamed League';
      panel.style.display = 'block';
      
      // Populate teams list
      this._renderTeamsList();
      
      // Populate matches list
      this._renderMatchesList();
    }
    // Show and update attention panel
    const attentionPanel = this.shadow.querySelector('#admin-attention-panel');
    if (attentionPanel) attentionPanel.style.display = '';
    this._updateAttentionPanel(this.getAttribute('isMobile') === 'true', selectedLeague);

    // Show the new panels in the right column
    const teamsPanelRight = this.shadow.querySelector('#admin-teams-panel');
    const matchesPanelRight = this.shadow.querySelector('#admin-matches-panel');
    if (teamsPanelRight) teamsPanelRight.style.display = 'block';
    if (matchesPanelRight) matchesPanelRight.style.display = 'block';
  }
  
  _hideSelectedLeaguePanel() {
    const panel = this.shadow.querySelector('#selectedLeaguePanel');
    if (panel) {
      panel.style.display = 'none';
    }
    // Hide attention panel
    const attentionPanel = this.shadow.querySelector('#admin-attention-panel');
    if (attentionPanel) attentionPanel.style.display = 'none';

    // Hide the new panels in the right column
    const teamsPanelRight = this.shadow.querySelector('#admin-teams-panel');
    const matchesPanelRight = this.shadow.querySelector('#admin-matches-panel');
    if (teamsPanelRight) teamsPanelRight.style.display = 'none';
    if (matchesPanelRight) matchesPanelRight.style.display = 'none';
  }
  
  _renderTeamsList() {
    const selectedLeague = this._getSelectedLeague();
    if (!selectedLeague) return;
    
    const teamsList = this.shadow.querySelector('#teamsList');
    if (!teamsList) return;
    
    teamsList.innerHTML = ''; // Clear existing items
    
    // Get teams from the selected league
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
      li.classList.add('team-item');
      
      const nameSpan = document.createElement('span');
      nameSpan.classList.add('team-name');
      nameSpan.textContent = team.name || 'Unnamed Team';
      li.appendChild(nameSpan);
      
      const actionsDiv = document.createElement('div');
      actionsDiv.classList.add('team-actions');
      
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', () => this._handleEditTeam(team));
      actionsDiv.appendChild(editBtn);
      
      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', () => this._handleRemoveTeam(team));
      actionsDiv.appendChild(removeBtn);
      
      li.appendChild(actionsDiv);
      teamsList.appendChild(li);
    });
  }

  _renderMatchesList() {
    const selectedLeague = this._getSelectedLeague();
    if (!selectedLeague) return;
    
    const matchesList = this.shadow.querySelector('#matchesList');
    if (!matchesList) return;
    
    matchesList.innerHTML = ''; // Clear existing items
    
    // Get matches from the selected league
    const matches = selectedLeague.matches || [];
    
    if (matches.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No matches available.';
      li.style.padding = '0.5rem';
      matchesList.appendChild(li);
      return;
    }
    
    // Sort matches by date (most recent first)
    const sortedMatches = [...matches].sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date) - new Date(a.date);
    });
    
    sortedMatches.forEach(match => {
      const li = document.createElement('li');
      li.classList.add('match-item');
      if (match.result) li.classList.add('match-completed');
      
      const matchDate = match.date ? new Date(match.date) : null;
      const formattedDate = matchDate ? matchDate.toLocaleDateString() : 'Date not set';
      
      li.innerHTML = `
        <div class="match-header">
          <span class="match-date">${formattedDate}</span>
          <span class="match-status">${match.result ? 'Completed' : 'Scheduled'}</span>
        </div>
        <div class="match-content">
          <div class="match-result">
            <span class="match-team home">${match.homeTeamName}</span>
            ${match.result ? `
              <span class="match-score">${match.result.homeScore} - ${match.result.awayScore}</span>
            ` : `
              <span class="match-score">vs</span>
            `}
            <span class="match-team away">${match.awayTeamName}</span>
          </div>
        </div>
      `;
      
      // Add click handler to edit match
      li.addEventListener('click', () => this._handleEditMatch({ key: match.key }));
      
      matchesList.appendChild(li);
    });
  }

  _updateButtonStates() {
    const btnCopy = this.shadow.querySelector('#btnCopy');
    const btnUpdate = this.shadow.querySelector('#btnUpdate');
    const btnDelete = this.shadow.querySelector('#btnDelete');

    const isLeagueSelected = !!this._selectedLeagueId;

    if (btnCopy) btnCopy.disabled = !isLeagueSelected;
    if (btnUpdate) btnUpdate.disabled = !isLeagueSelected;
    if (btnDelete) btnDelete.disabled = !isLeagueSelected;
  }

  _attachBaseEventListeners() {
    const btnNew = this.shadow.querySelector('#btnNew');
    const btnCopy = this.shadow.querySelector('#btnCopy');
    const btnUpdate = this.shadow.querySelector('#btnUpdate');
    const btnDelete = this.shadow.querySelector('#btnDelete');
    const btnCloseModal = this.shadow.querySelector('#btnCloseModal');
    const btnCancelModal = this.shadow.querySelector('#btnCancelModal');
    const btnSaveModal = this.shadow.querySelector('#btnSaveModal');

    if (btnNew) btnNew.addEventListener('click', () => this._handleNew());
    if (btnCopy) btnCopy.addEventListener('click', () => this._handleCopy());
    if (btnUpdate) btnUpdate.addEventListener('click', () => this._handleUpdate());
    if (btnDelete) btnDelete.addEventListener('click', () => this._handleDelete());
    
    if (btnCloseModal) btnCloseModal.addEventListener('click', () => this._hideModal());
    if (btnCancelModal) btnCancelModal.addEventListener('click', () => this._hideModal());
    if (btnSaveModal) btnSaveModal.addEventListener('click', () => this._handleSaveModal());
    
    // Actions dropdown event listeners
    const btnActions = this.shadow.querySelector('#btnActions');
    if (btnActions) {
      console.log('[LeagueAdmin] Attaching click listener to #btnActions:', btnActions); // DEBUG
      btnActions.addEventListener('click', (event) => {
        console.log('[LeagueAdmin] #btnActions clicked!', event); // DEBUG
        this._toggleActionsDropdown();
      });
    } else {
      console.error('[LeagueAdmin] #btnActions button not found during listener attachment.'); // DEBUG
    }
    
    // Reset league action
    const btnResetLeague = this.shadow.querySelector('#btnResetLeague');
    if (btnResetLeague) {
      btnResetLeague.addEventListener('click', (e) => {
        e.preventDefault();
        this._handleResetLeague();
        this._toggleActionsDropdown(false); // Close dropdown after action
      });
    }
    
    // View League Table action
    const btnViewLeagueTable = this.shadow.querySelector('#btnViewLeagueTable');
    if (btnViewLeagueTable) {
      btnViewLeagueTable.addEventListener('click', (e) => {
        e.preventDefault();
        this._handleViewLeagueTable();
        this._toggleActionsDropdown(false); // Close dropdown after action
      });
    }
    
    // Team management event listeners
    const btnAddTeam = this.shadow.querySelector('#btnAddTeam');
    if (btnAddTeam) {
      btnAddTeam.addEventListener('click', () => this._handleAddTeam());
    }
    
    // Team modal event listeners
    const btnCloseTeamModal = this.shadow.querySelector('#btnCloseTeamModal');
    const btnCancelTeamModal = this.shadow.querySelector('#btnCancelTeamModal');
    const btnSaveTeamModal = this.shadow.querySelector('#btnSaveTeamModal');
    
    if (btnCloseTeamModal) btnCloseTeamModal.addEventListener('click', () => this._hideTeamModal());
    if (btnCancelTeamModal) btnCancelTeamModal.addEventListener('click', () => this._hideTeamModal());
    if (btnSaveTeamModal) btnSaveTeamModal.addEventListener('click', () => this._handleSaveTeamModal());
    
    // Match management event listeners
    const btnAddMatch = this.shadow.querySelector('#btnAddMatch');
    if (btnAddMatch) {
      btnAddMatch.addEventListener('click', () => this._handleAddMatch());
    }
  }
  
  _toggleActionsDropdown(force = null) {
    console.log('[LeagueAdmin] _toggleActionsDropdown called with force:', force); // DEBUG
    const dropdown = this.shadow.querySelector('.dropdown');
    if (dropdown) {
      console.log('[LeagueAdmin] Found .dropdown element:', dropdown); // DEBUG
      let shouldShow;
      if (force !== null) {
        shouldShow = force;
      } else {
        shouldShow = !dropdown.classList.contains('show');
      }
      console.log('[LeagueAdmin] Toggling "show" class on .dropdown to:', shouldShow); // DEBUG
      dropdown.classList.toggle('show', shouldShow);
      console.log('[LeagueAdmin] .dropdown classList after toggle:', dropdown.classList); // DEBUG
    } else {
      console.error("[LeagueAdmin] Actions dropdown container (.dropdown) not found in _toggleActionsDropdown"); // DEBUG
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
    if (confirm(`Are you sure you want to reset league "${selectedLeague.name}"? This will remove all matches and statistics but keep teams.`)) {
      this.dispatchEvent(new LeagueAdminElementEvent('requestResetLeague', { 
        leagueId: this._selectedLeagueId,
        leagueName: selectedLeague.name
      }));
    }
  }
  
  // New handler for View League Table
  _handleViewLeagueTable() {
    const selectedLeague = this._getSelectedLeague();
    if (!selectedLeague) return;

    this.dispatchEvent(new LeagueAdminElementEvent('requestViewLeagueTable', {
      leagueId: this._selectedLeagueId,
      leagueName: selectedLeague.name
    }));
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
    
    if (confirm(`Are you sure you want to remove team "${team.name}" from league "${selectedLeague.name}"?`)) {
      this.dispatchEvent(new LeagueAdminElementEvent('requestRemoveTeam', { 
        leagueId: this._selectedLeagueId,
        teamId: team._id || team.name, // Use ID if available, otherwise name
        teamName: team.name
      }));
    }
  }
  
  _showTeamModal(mode, teamData = null) {
    this.clearError();
    const selectedLeague = this._getSelectedLeague();
    if (!selectedLeague) return;
    
    const modal = this.shadow.querySelector('#teamModal');
    const modalTitle = this.shadow.querySelector('#teamModalTitle');
    const modalBody = this.shadow.querySelector('#teamModalBody');
    
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
    const modal = this.shadow.querySelector('#teamModal');
    if (modal) {
      modal.style.display = 'none';
    }
    
    this._teamModalMode = null;
    this._teamBeingEdited = null;
  }
  
  _populateTeamModalForm(modalBody, teamData) {
    modalBody.innerHTML = `
      <div class="form-group">
        <label for="teamName">Team Name</label>
        <input type="text" id="teamName" value="${teamData.name || ''}" required>
      </div>
      <div class="form-group">
        <label for="teamContactName">Contact Name (optional)</label>
        <input type="text" id="teamContactName" value="${teamData.contactName || ''}">
      </div>
      <div class="form-group">
        <label for="teamContactEmail">Contact Email (optional)</label>
        <input type="text" id="teamContactEmail" value="${teamData.contactEmail || ''}">
      </div>
    `;
  }
  
  _handleSaveTeamModal() {
    const modalBody = this.shadow.querySelector('#teamModalBody');
    const teamNameInput = modalBody.querySelector('#teamName');
    
    if (!teamNameInput || !teamNameInput.value.trim()) {
      this.showError('Team Name is required.');
      return;
    }
    
    const teamData = {
      name: teamNameInput.value.trim(),
      contactName: modalBody.querySelector('#teamContactName').value.trim(),
      contactEmail: modalBody.querySelector('#teamContactEmail').value.trim()
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
    const modal = this.shadow.querySelector('#leagueModal');
    const modalTitle = this.shadow.querySelector('#modalTitle');
    const modalBody = this.shadow.querySelector('#modalBody');

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
    const modal = this.shadow.querySelector('#leagueModal');
    if (modal) {
      modal.style.display = 'none';
    }
    this._isModalVisible = false;
    const modalBody = this.shadow.querySelector('#modalBody');
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
    const modalBody = this.shadow.querySelector('#modalBody');
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
  }


  // --- Action Button Handlers ---
  _handleNew() {
    this.clearError();
    this._selectedLeagueId = null; // Deselect any currently selected league
    this._updateButtonStates(); // Reflect deselection in button states
    this._showModal('new');
  }

  _handleCopy() {
    this.clearError();
    const selectedLeague = this._getSelectedLeague();
    if (selectedLeague) {
      this._showModal('copy', selectedLeague);
    } else {
      this.showError("No league selected to copy.");
    }
  }

  _handleUpdate() {
    this.clearError();
    const selectedLeague = this._getSelectedLeague();
    if (selectedLeague) {
      this._showModal('edit', selectedLeague);
    } else {
      this.showError("No league selected to update.");
    }
  }

  _handleDelete() {
    this.clearError();
    const selectedLeague = this._getSelectedLeague();
    if (selectedLeague) {
      // Simple confirmation, consider a more robust modal confirmation for production
      if (confirm(`Are you sure you want to delete league: "${selectedLeague.name}"?`)) {
        this.dispatchEvent(new LeagueAdminElementEvent('requestDeleteLeague', { leagueId: this._selectedLeagueId }));
        this._selectedLeagueId = null; // Deselect after requesting deletion
        // The list will refresh when data attribute is updated by parent
      }
    } else {
      this.showError("No league selected to delete.");
    }
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
    const resizer = this.shadow.querySelector('.resizer');
    const leftPanel = this.shadow.querySelector('.left-panel');
    const rightPanel = this.shadow.querySelector('.right-panel');
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
    const attentionPanel = this.shadow.querySelector('#admin-attention-panel');
    if (!selectedLeague || !attentionMatchesElement || !attentionPanel) {
      if (attentionPanel) attentionPanel.style.display = 'none';
      return;
    }
    attentionMatchesElement.setAttribute('is-mobile', String(isMobile)); // Ensure boolean is stringified
    attentionMatchesElement.setAttribute('data', JSON.stringify(selectedLeague.matches || []));
    attentionPanel.style.display = '';

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
    const actionsButton = this.shadow.querySelector('#btnActions');
    // If the button itself doesn't exist (e.g., panel is hidden), or its parent .dropdown isn't there, bail.
    if (!actionsButton) return;

    const dropdownContainer = actionsButton.closest('.dropdown');
    if (!dropdownContainer) return;

    // If the dropdown is not currently shown, there's nothing to do for an outside click.
    if (!dropdownContainer.classList.contains('show')) {
      return;
    }

    // Use event.composedPath()[0] to get the actual target of the click,
    // even if it crossed a Shadow DOM boundary.
    const clickedElement = event.composedPath && event.composedPath()[0];

    // Check if the click originated inside the dropdown container (button or content).
    // If so, let other event handlers (button toggle, link click) manage it.
    if (clickedElement && dropdownContainer.contains(clickedElement)) {
      return;
    }

    // If the click was outside the open dropdown, close it.
    console.log('[LeagueAdmin] Click detected outside dropdown. Closing dropdown.', event); // DEBUG
    this._toggleActionsDropdown(false);
  }
}

// Register the custom element
customElements.define('league-admin-element', LeagueAdminElement);

export default LeagueAdminElement;
