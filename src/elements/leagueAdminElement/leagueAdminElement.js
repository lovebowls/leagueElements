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
import '../LeagueMatchesAttention/LeagueMatchesAttention.js';
import '../leagueMatch/leagueMatch.js';
// ADDED IMPORTS for shared modal and form styles
import {
    BASE_STYLES,
    MOBILE_STYLES,
    DESKTOP_STYLES,
    TEMPLATE_CONTENT
} from './LeagueAdminElement-styles.js';
// Import Temporal API utilities
import { Temporal, TemporalUtils } from '../../utils/temporalUtils.js';

class LeagueAdminElement extends HTMLElement {


  constructor() {
    super();
    this.LOG_PREFIX = "[LAD_LIFE_CYCLE] ";
    this.shadow = this.attachShadow({ mode: 'open' });
    this._elementTitle = this.getAttribute('elementTitle') || 'League Administration';
    this._leagues = [];
    this._selectedLeagueId = null; // Store ID of the selected league
    this._currentLeagueId = null; // Store ID of the league to be pre-selected
    this._selectedTeamId = null; // CHANGED: Track selected team by _id instead of value
    this._isModalVisible = false;
    this._modalMode = 'new'; // 'new', 'edit', 'copy'
    this._data = null; // To store the raw data from attribute
    
    // New properties for team management
    this._teamModalMode = null; // 'new' or 'edit'
    this._teamBeingEdited = null; // Store the team being edited as {_id, name}
    this._lovebowlsTeams = []; // CHANGED: Store lovebowls teams data as [{_id, name}] objects
    
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
    this._selectedTeamId = null;
    this._hideGlobalLeagueMenu();

    if (!dataString) {
        console.log(this.LOG_PREFIX + `_parseAndLoadData: dataString is empty. Clearing leagues.`);
        this._leagues = [];
        this._data = null;
        this._selectedLeagueId = null; // Clear selection if no data
        console.log(this.LOG_PREFIX + `_parseAndLoadData: dataString empty, SET _selectedLeagueId to null.`);
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

        this.dispatchEvent(new LeagueAdminElementEvent('onReady', { leagues: this._leagues }));
        
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

  // Parse lovebowls teams data from attribute - expects {_id, name} format
  _parseLovebowlsTeamsData(dataString) {
    if (!dataString) {
      this._lovebowlsTeams = [];
      return;
    }
    
    try {
      const parsedData = JSON.parse(dataString);
      if (Array.isArray(parsedData)) {
        this._lovebowlsTeams = parsedData;
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
        ${isMobile ? MOBILE_STYLES : DESKTOP_STYLES}
      </style>
      ${this._fillTemplate(TEMPLATE_CONTENT)}
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

        this.dispatchEvent(new LeagueAdminElementEvent('requestSaveLeague', { leagueData: updatedLeague }));
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
      
      const leagueId = league._id;
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
      this._showLeagueSpecificPanels();
      this._selectedTeamId = null;
      this.dispatchEvent(new LeagueAdminElementEvent('leagueSelected', { leagueId }));

    } else {
      // League not found in list, effectively deselecting
      this._selectedLeagueId = null;
      this._selectedTeamId = null; // ADDED: Reset selected team
      this._hideLeagueSpecificPanels();
      const oldId = this._selectedLeagueId;
      this._selectedLeagueId = null;
      this.dispatchEvent(new LeagueAdminElementEvent('leagueSelected', { leagueId: null }));
    }
    
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
    this._selectedTeamId = null; // CHANGED: Reset selected team _id

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
      
      // Use team._id as the identifier and team.name for display
      li.dataset.teamId = team._id; // CHANGED: Use _id as the identifier
      
      // Check if this team is the selected one
      if (this._selectedTeamId === team._id) {
        li.classList.add('selected-team');
      }
      
      const nameSpan = document.createElement('span');
      nameSpan.classList.add('team-name', 'list-item-text-primary');
      nameSpan.textContent = team.name; // CHANGED: Display the name instead of label
      
      // Add a small indicator if this is a lovebowls team (can use another way to identify)
      const isLovebowlsTeam = this._lovebowlsTeams.some(lbTeam => lbTeam._id === team._id);
      if (isLovebowlsTeam) {
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
      if (this._selectedTeamId === team._id) {
        this._createAndAppendTeamActions(actionsDiv, team);
      }
      
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
    
    console.log('[Team Remove] Removing team with _id:', team._id, 'name:', team.name);
    
    // Clear the team selection since we're removing it
    if (this._selectedTeamId === team._id) {
      this._selectedTeamId = null;
    }
    
    // Optimistically update the UI by removing the team and its matches locally
    const leagueIndex = this._leagues.findIndex(l => (l._id || l.name) === this._selectedLeagueId);
    if (leagueIndex !== -1) {
      // Remove the team
      const updatedTeams = this._leagues[leagueIndex].teams.filter(t => t._id !== team._id);
      
      // Remove all matches involving this team
      const updatedMatches = (this._leagues[leagueIndex].matches || []).filter(match => 
        match.homeTeam?._id !== team._id && match.awayTeam?._id !== team._id
      );
      
      this._leagues[leagueIndex] = {
        ...this._leagues[leagueIndex],
        teams: updatedTeams,
        matches: updatedMatches
      };

      this.dispatchEvent(new LeagueAdminElementEvent('requestSaveLeague', { leagueData: this._leagues[leagueIndex]}));
  
      // Re-render the teams list to reflect the change immediately
      this._renderTeamsList();
    }
    
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
          _id: '', 
          name: '',
          useExistingTeam: false
        };
        break;
      case 'edit':
        title = 'Edit Team';
        // We expect teamData to already be in {_id, name} format
        currentTeamData = {
          _id: teamData._id,
          name: teamData.name,
          useExistingTeam: this._lovebowlsTeams.some(lbTeam => lbTeam._id === teamData._id) // Check if it's a Lovebowls team
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
    
    // Determine if it's a Lovebowls team
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
      const teamIdsToExclude = isEditMode 
        ? selectedLeague.teams.filter(t => t._id !== teamData._id).map(t => t._id)
        : selectedLeague.teams.map(t => t._id);
      
      filteredTeams = existingTeams.filter(team => !teamIdsToExclude.includes(team._id));
      
      // Log the filtering for debugging
      console.log(`[Team Modal] Filtered ${existingTeams.length - filteredTeams.length} teams that are already in the league`);
    }

    let optionsHtml = '';
    if (filteredTeams && filteredTeams.length > 0) {
      optionsHtml = filteredTeams.map(team => 
        `<option value="${team._id}" ${teamData._id === team._id ? 'selected' : ''}>${team.name}</option>`
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

        <!-- ADDED: Info message for no available teams -->
        <div id="noAvailableTeamsMessage" style="display: none; color: var(--lae-text-color-error); margin-top: 0.5em;">
          No available teams to select. Please add a new team.
        </div>
      </div>

      <div id="newTeamNameGroup" class="form-group-shared" style="display: ${isLovebowlsTeam ? 'none' : 'block'};">
        <label for="teamName" class="form-label-shared">Team Name</label>
        <input type="text" id="teamName" class="form-input-shared" value="${isLovebowlsTeam ? '' : teamData.name}" ${isLovebowlsTeam ? 'disabled' : ''}>
      </div>
    `;

    const useExistingTeamCheckbox = modalBody.querySelector('#useExistingTeamCheckbox');
    const existingTeamSelectGroup = modalBody.querySelector('#existingTeamSelectGroup');
    const newTeamNameGroup = modalBody.querySelector('#newTeamNameGroup');
    const teamNameInput = modalBody.querySelector('#teamName');
    const existingTeamSelect = modalBody.querySelector('#existingTeamSelect');
    const noAvailableTeamsMessage = modalBody.querySelector('#noAvailableTeamsMessage');

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

    let teamId = '';
    let teamName = '';

    // For debugging
    console.log('[Team Save] Mode:', this._teamModalMode);
    console.log('[Team Save] Original team being edited:', this._teamBeingEdited);
    console.log('[Team Save] Using lovebowls team:', useExistingTeamCheckbox?.checked);

    if (useExistingTeamCheckbox && useExistingTeamCheckbox.checked && existingTeamSelect) {
      if (existingTeamSelect.value) {
        // For lovebowls teams, get both _id and name
        teamId = existingTeamSelect.value;
        // Find the name from the selected lovebowls team
        const selectedTeam = this._lovebowlsTeams.find(t => t._id === teamId);
        teamName = selectedTeam ? selectedTeam.name : teamId;
      } else {
        this._showTeamModalError('Please select a team from the dropdown.');
        return;
      }
    } else if (teamNameInput && teamNameInput.value.trim()) {
      // For simple teams, use the input as name and _id
      teamName = teamNameInput.value.trim();
      teamId = teamName;
    } else {
      this._showTeamModalError('Team Name is required, either by typing a new name or selecting an existing team.');
      return;
    }

    if (!teamId || !teamName) {
      this._showTeamModalError('Team name is required.');
      return;
    }

    // Check for duplicate team IDs in the current league
    const selectedLeague = this._getSelectedLeague();
    if (selectedLeague && selectedLeague.teams) {
      const isDuplicate = selectedLeague.teams.some(team => team._id === teamId && teamId !== this._teamBeingEdited._id);
      if (isDuplicate) {
        this._showTeamModalError(`A team with identifier "${teamId}" already exists in this league.`);
        return;
      }
    }

    const teamData = {
      _id: teamId,
      name: teamName
    };

    // Update local data first for immediate UI response
    if (selectedLeague) {
      const leagueIndex = this._leagues.findIndex(l => l._id === this._selectedLeagueId);
      if (leagueIndex !== -1) {
        const updatedTeams = [...selectedLeague.teams];
        const existingTeamIndex = updatedTeams.findIndex(t => t._id === this._teamBeingEdited._id);

        // If we're editing a team and its ID is changing, update match references
        const oldTeamId = this._teamBeingEdited._id;
        const isTeamIdChanging = existingTeamIndex !== -1 && oldTeamId !== teamId;
        
        if (existingTeamIndex !== -1) {
          // Update the existing team
          updatedTeams[existingTeamIndex] = teamData;
          
          // If team ID is changing, update all match references
          if (isTeamIdChanging && Array.isArray(this._leagues[leagueIndex].matches)) {
            const updatedMatches = this._leagues[leagueIndex].matches.map(match => {
              if (match.homeTeam?._id === oldTeamId) {
                return {
                  ...match,
                  homeTeam: { ...match.homeTeam, _id: teamId, name: teamName }
                };
              }
              if (match.awayTeam?._id === oldTeamId) {
                return {
                  ...match,
                  awayTeam: { ...match.awayTeam, _id: teamId, name: teamName }
                };
              }
              return match;
            });
            
            // Update the league with the modified matches
            this._leagues[leagueIndex] = {
              ...this._leagues[leagueIndex],
              teams: updatedTeams,
              matches: updatedMatches
            };
          } else {
            // No ID change, just update teams
            this._leagues[leagueIndex] = {
              ...this._leagues[leagueIndex],
              teams: updatedTeams
            };
          }
        } else {
          // Add the new team
          this._leagues[leagueIndex] = {
            ...this._leagues[leagueIndex],
            teams: [...updatedTeams, teamData]
          };
        }

        // Dispatch event to save the updated league
        this.dispatchEvent(new LeagueAdminElementEvent('requestSaveLeague', {
          leagueData: this._leagues[leagueIndex]
        }));
      }
    }

    // Set the newly created/edited team as the selected team
    this._selectedTeamId = teamId;

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
    
    this.dispatchEvent(new LeagueAdminElementEvent('requestSaveLeague', { leagueData }));
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
    
    // Pass teams as array of {_id, name} objects
    const teams = selectedLeague.teams || [];
    this.openMatchModal({ date: '', homeTeam: null, awayTeam: null, result: null }, teams, 'new');
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

    // Pass teams as array of {_id, name} objects
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
        teamMap[team._id] = team.name;
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
    const teamId = team._id; // CHANGED: Use _id as identifier

    // Deselect previously selected team item
    if (this._selectedTeamId && this._selectedTeamId !== teamId) {
      const prevSelectedLi = this.shadow.querySelector(`.team-item[data-team-id="${this._selectedTeamId}"]`);
      if (prevSelectedLi) {
        prevSelectedLi.classList.remove('selected-team');
        const prevActionsDiv = prevSelectedLi.querySelector('.team-actions');
        if (prevActionsDiv) {
          prevActionsDiv.innerHTML = ''; // Clear its buttons
        }
      }
    }

    // Handle new selection
    const currentSelectedLi = this.shadow.querySelector(`.team-item[data-team-id="${teamId}"]`);
    if (!currentSelectedLi) return; // Should not happen if click is on an item

    if (this._selectedTeamId === teamId) {
      // Clicked on already selected team: toggle visibility (hide actions)
      currentSelectedLi.classList.remove('selected-team');
      const actionsDiv = currentSelectedLi.querySelector('.team-actions');
      if (actionsDiv) {
        actionsDiv.innerHTML = '';
      }
      this._selectedTeamId = null;
    } else {
      // Clicked on a new team: show actions
      currentSelectedLi.classList.add('selected-team');
      this._selectedTeamId = teamId;
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

  setupMatrixEventListeners() {
    const matrixCells = this.shadow.querySelectorAll('.matrix-grid .matrix-cell:not(.matrix-header-cell)');
    matrixCells.forEach(cell => {
      cell.onclick = () => {
        const homeTeamId = cell.dataset.homeTeam;
        const awayTeamId = cell.dataset.awayTeam;
        if (homeTeamId === awayTeamId) return;
        const matrixData = this._prepareMatrixData();
        if (!matrixData || !matrixData.matrix[homeTeamId] || !matrixData.matrix[homeTeamId][awayTeamId]) return;
        let matchObject = matrixData.matrix[homeTeamId][awayTeamId].match;
        if (!matchObject) return;
        this._handleEditMatch(matchObject);
      };
    });
  }
}

// Register the custom element
customElements.define('league-admin-element', LeagueAdminElement);

export default LeagueAdminElement;
