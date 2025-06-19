// Import any necessary LitElement modules or other dependencies here
import { League } from '@lovebowls/leaguejs';
import * as Swal from 'sweetalert2';
import { sweetAlertGlobalStyles, sweetAlertMobileOverrides } from '../shared-styles.js';
import '../LeagueMatchesAttention/LeagueMatchesAttention.js';
import '../leagueMatch/leagueMatch.js';
import '../leagueResetModal/leagueResetModal.js';
import '../leagueTeams/leagueTeams.js';
import '../LeagueSchedule/LeagueSchedule.js';
import {  BASE_STYLES,  MOBILE_STYLES,  DESKTOP_STYLES,  TEMPLATE_CONTENT} from './LeagueAdminElement-styles.js';
import { Temporal, TemporalUtils } from '../../utils/temporalUtils.js';


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
class LeagueAdminElement extends HTMLElement {
  static _globalStylesInjected = false;

  constructor() {
    super();
    this.LOG_PREFIX = "[LAD_LIFE_CYCLE] ";
    this.shadow = this.attachShadow({ mode: 'open' });
    this._elementTitle = this.getAttribute('elementTitle') || 'League Administration';
    this._leagues = [];
    this._selectedLeagueId = null; // Store ID of the selected league
    this._currentLeagueId = null; // Store ID of the league to be pre-selected
    this._selectedTeamId = null; // Track selected team by _id for team management panel
    this._isModalVisible = false;
    this._modalMode = 'new'; // 'new', 'edit', 'copy'
    this._data = null; // To store the raw data from attribute
    
    // New properties for team management
    this._teamModalMode = null; // 'new' or 'edit'
    this._teamBeingEdited = null; // Store the team being edited as {_id, name}
    this._lovebowlsTeams = []; // CHANGED: Store lovebowls teams data as [{_id, name}] objects
    
    // Properties for new leagueTeams modal
    this.teamModalOpen = false;
    this.teamModalData = null;
    this.teamModalMode = 'new';
    this.teamModalOptions = {};
    
    // New properties for match management
    this.matchModalOpen = false;
    this.matchModalData = null;
    this.matchModalTeams = [];
    this.matchModalMode = 'new';

    // New properties for reset modal management
    this.resetModalOpen = false;

    // Properties for new league creation confirmation
    this._pendingNewLeagueData = null; // Store league data for post-creation confirmation
    this._isWaitingForNewLeagueConfirmation = false;

    this._boundHandleDocumentClickForGlobalMenu = null; // For global menu closing
  }

  get _isMobile() {
    return this.getAttribute('is-mobile') === 'true';
  }

  static get observedAttributes() {
    return ['elementTitle', 'data', 'is-mobile', 'current-league-id', 'lovebowls-teams']; 
  }

  _injectGlobalSwalStyles() {
    // Injects SweetAlert2 global and mobile-specific styles into document.head.
    // Styles are imported from shared-styles.js.
    // This ensures consistent styling for SweetAlert2 dialogs, which are appended
    // to the document body and thus outside the shadow DOM of individual elements.
    // Injection is guarded to run only once per page load.
    const LOG_PREFIX_SWAL = '[LAD_SWAL_STYLE_INJECT] ';

    const styleId = 'global-swal-mobile-styles';
    let existingStyleTag = document.getElementById(styleId);

    if (LeagueAdminElement._globalStylesInjected) {
      if (!existingStyleTag) {
        console.warn(LOG_PREFIX_SWAL + 'Global styles flag is true BUT style tag is MISSING. Will attempt to re-inject.');
      }
    } else {
      if (existingStyleTag) {
        console.warn(LOG_PREFIX_SWAL + 'Global styles flag is false BUT style tag ALREADY EXISTS. Setting flag to true and skipping duplicate injection.');
        LeagueAdminElement._globalStylesInjected = true;
        return;
      }
      // Proceed to inject if flag is false and tag doesn't exist
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `${sweetAlertGlobalStyles}\n\n${sweetAlertMobileOverrides}`;

    try {
      document.head.appendChild(style);
    } catch (err) {
      console.error('[LAD_SWAL_STYLE_INJECT] Failed to append style tag to head:', err);
    }
    
    // Verify after appending
    const appendedStyleTag = document.getElementById(styleId);
    if (!appendedStyleTag) {
      console.error(LOG_PREFIX_SWAL + 'FAILED to find style tag in head AFTER attempting to append. Injection FAILED.');
    }
    LeagueAdminElement._globalStylesInjected = true;
  }

  connectedCallback() {
    this._injectGlobalSwalStyles();
    this._elementTitle = this.getAttribute('elementTitle') || this._elementTitle;
    this._currentLeagueId = this.getAttribute('current-league-id') || null;
    const rawData = this.getAttribute('data');
    if (rawData) {
        this._data = rawData;
        this._parseAndLoadData();
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
      this._data = newValue;
      this._parseAndLoadData();
      needsRender = true; // Data change always triggers a full re-render of the list
    } else if (name === 'is-mobile') {
      needsRender = true;
    } else if (name === 'current-league-id') {
      this._currentLeagueId = newValue || null;
      // Apply selection only if we have leagues loaded already
      if (this._leagues && this._leagues.length > 0) {
        const oldSelectedIdBeforeApply = this._selectedLeagueId;
        needsRender = this._applyCurrentLeagueIdSelection();
      }
    } else if (name === 'lovebowls-teams') { 
      this._parseLovebowlsTeamsData(newValue);
      // No need to re-render here unless the modal is already open
    }

    if (needsRender) {
      this.render();
    }
    // Dispatch an event about the attribute change
    this.dispatchEvent(new LeagueAdminElementEvent('attributeChanged', { name, oldValue, newValue }));
  }

  _parseAndLoadData() {
    this.clearError();
    
    // Store the current selection state before any changes
    const previouslySelectedLeagueId = this._selectedLeagueId;
    
    // Reset team selection and menu, but NOT the league selection yet
    this._selectedTeamId = null;
    this._hideGlobalLeagueMenu();
    
    // Defensive check - if no data, clear leagues and return
    if (!this._data) {
      console.warn(this.LOG_PREFIX + `_parseAndLoadData: No data to parse. Clearing _leagues.`);
      this._leagues = [];
      this._selectedLeagueId = null;
      this.dispatchEvent(new LeagueAdminElementEvent('dataError', { message: 'No data provided' }));
      return;
    }
    
    try {
      // Parse the data attribute
      const parsedData = JSON.parse(this._data);
      
      if (Array.isArray(parsedData)) {
        // Convert each league object into a League instance
        this._leagues = parsedData.map(leagueData => {
          // Create a new League instance with the parsed data
          const league = new League(leagueData);
          
          // Ensure teams array always exists and has the proper format
          if (!Array.isArray(league.teams)) {
            league.teams = [];
          }
          
          // Generate league table if the method exists
          if (typeof league.getLeagueTable === 'function') {
            league.table = league.getLeagueTable();
          } else {
            // Fallback for leagues without getLeagueTable method
            league.table = { leagueData: [], metaData: { name: league.name } };
          }
          return league;
        });
        
        // Check if previously selected league still exists in the new data
        const previousLeagueStillExists = previouslySelectedLeagueId && 
                                        this._leagues.some(l => (l._id || l.name) === previouslySelectedLeagueId);

        // If the previously selected league still exists, keep it selected
        if (previousLeagueStillExists) {
          this._selectedLeagueId = previouslySelectedLeagueId;
        } else {
          this._selectedLeagueId = null;
        }

        this.dispatchEvent(new LeagueAdminElementEvent('onReady', { leagues: this._leagues }));
        
        // If selection changed due to league being removed, dispatch an event
        if (previouslySelectedLeagueId !== this._selectedLeagueId) {
          this.dispatchEvent(new LeagueAdminElementEvent('leagueSelected', { leagueId: this._selectedLeagueId }));
        }
      } else {
        console.error(this.LOG_PREFIX + `_parseAndLoadData: Parsed data is not an array.`);
        this._leagues = [];
        this.showError('Invalid data format: Expected an array of leagues.');
        this.dispatchEvent(new LeagueAdminElementEvent('dataError', { message: 'Invalid data format: Expected an array of leagues.' }));
      }
    } catch (error) {
      console.error(this.LOG_PREFIX + `_parseAndLoadData: Error parsing data:`, error);
      this._leagues = [];
      this._data = null;
      this.showError(`Failed to parse league data: ${error.message}`);
      this.dispatchEvent(new LeagueAdminElementEvent('dataError', { 
        message: `Failed to parse league data: ${error.message}`, 
        errorObj: error 
      }));
      this._selectedLeagueId = null; // Also clear on error
    }

    // Apply current league ID selection after data is loaded
    this._applyCurrentLeagueIdSelection();
    
    // Check if we need to show new league confirmation dialog
    this._checkForNewLeagueConfirmation();
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
    if (!this._currentLeagueId || !this._leagues || this._leagues.length === 0) {
      return false; // No change, no render needed from this
    }

    const leagueExists = this._leagues.some(l => (l._id || l.name) === this._currentLeagueId);
    let selectionChanged = false;

    if (leagueExists) {
      if (this._selectedLeagueId !== this._currentLeagueId) {
        this._selectedLeagueId = this._currentLeagueId;
        selectionChanged = true;
      }
    } else {
      if (this._selectedLeagueId === this._currentLeagueId) {
        // This case means _selectedLeagueId was pointing to a league (via current-league-id attribute) that is now gone
        this._selectedLeagueId = null;
        selectionChanged = true;
      }
    }
    
    if (selectionChanged) {
      this._updateButtonStates(); // This should be called if selection changes
    }
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
    console.log('[LeagueAdmin] render() called');
    let leagueForRender = null;
    const tempLeague = this._getSelectedLeague(); // This can return undefined

    if (tempLeague !== undefined && tempLeague !== null) {
      leagueForRender = tempLeague;
    }

    this.shadow.innerHTML = `
      <style>
        ${this._isMobile ? MOBILE_STYLES : DESKTOP_STYLES}
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
    this._updateAttentionPanel(leagueForRender);
    
    // Update schedule panel with selected league's data
    if (leagueForRender) {
      console.log('[LeagueAdmin] About to call _updateSchedulePanel from render()');
      this._updateSchedulePanel(leagueForRender);
      console.log('[LeagueAdmin] Finished _updateSchedulePanel from render()');
    }

    // Render match modal separately to avoid full component re-renders
    this._renderMatchModal();

    // Handle reset modal
    if (this.resetModalOpen && this._leagueToReset) {
      let resetModal = this.shadow.querySelector('league-reset-modal');
      if (resetModal) resetModal.remove();
      
      resetModal = document.createElement('league-reset-modal');
      resetModal.open = true;
      resetModal.isMobile = this._isMobile;
      resetModal.data = this._leagueToReset;
      
      resetModal.addEventListener('reset-save', (e) => {
        const { matches, estimatedMatches, dateRange } = e.detail;
        const leagueToReset = this._leagueToReset; // Store reference before closing modal
        
        // Close modal first
        this._closeResetModal();
        
        // Apply the generated matches to the league
        this._applyGeneratedMatches(leagueToReset, matches, estimatedMatches, dateRange);
      });
      
      resetModal.addEventListener('reset-cancel', () => {
        this._closeResetModal();
      });
      
      this.shadow.appendChild(resetModal);
    } else {
      let resetModal = this.shadow.querySelector('league-reset-modal');
      if (resetModal) resetModal.remove();
    }

    // Handle team modal
    if (this.teamModalOpen) {
      let teamModal = this.shadow.querySelector('league-teams');
      if (teamModal) teamModal.remove();
      
      teamModal = document.createElement('league-teams');
      teamModal.open = true;
      teamModal.isMobile = this._isMobile;
      teamModal.data = this._getSelectedLeague();
      teamModal.existingTeams = this._lovebowlsTeams;
      
      // Set action based on mode
      const action = {};
      if (this.teamModalMode === 'edit' && this.teamModalData) {
        action.editTeam = this.teamModalData._id;
      }
      // Add options from teamModalOptions (e.g., fromNewLeagueWorkflow)
      if (this.teamModalOptions && Object.keys(this.teamModalOptions).length > 0) {
        Object.assign(action, this.teamModalOptions);
      }
      // For 'manage' mode, don't set any action to show the teams manager without auto-opening editor
      if (Object.keys(action).length > 0) {
        teamModal.action = action;
      }
      
      teamModal.addEventListener('teams-save', (e) => {
        const { league, showFixtureScheduler } = e.detail;
        
        // Update the internal _leagues array
        const leagueIndex = this._leagues.findIndex(l => l._id === league._id);
        if (leagueIndex > -1) {
          this._leagues[leagueIndex] = league;
        } else {
          console.error('[Admin Teams Save] Selected league index not found in _leagues array.');
        }

        this.dispatchEvent(new LeagueAdminElementEvent('requestSaveLeague', { leagueData: league }));
        this.closeTeamModal();
        
        // If showFixtureScheduler is true and we have at least 2 teams, open the reset modal
        if (showFixtureScheduler && league.teams && league.teams.length >= 2) {
          // Small delay to allow the team modal to close and DOM to update
          setTimeout(() => {
            this._openResetModal(league);
          }, 100);
        }
      });
      
      teamModal.addEventListener('teams-cancel', () => {
        this.closeTeamModal();
      });
      
      this.shadow.appendChild(teamModal);
    } else {
      let teamModal = this.shadow.querySelector('league-teams');
      if (teamModal) teamModal.remove();
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
    // Sort leagues alphabetically by name
    const sortedLeagues = [...this._leagues].sort((a, b) => {
      const nameA = (a.name || '').toUpperCase();
      const nameB = (b.name || '').toUpperCase();
      return nameA.localeCompare(nameB);
    });

    sortedLeagues.forEach(league => {
      // Ensure the league has an ID
      if (!league._id) {
        console.warn('League is missing _id:', league);
        return; // Skip leagues without an ID
      }

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
      
      if (league._id === this._selectedLeagueId) {
        this._createAndAppendLeagueActions(actionsContainer, league._id);
      }
      
      // Add click handler
      li.addEventListener('click', (e) => {
        e.stopPropagation();
        this._handleLeagueSelect(leagueId);
      });
      
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

    // If the clicked league is the same as the currently selected one, do nothing
    if (leagueId === this._selectedLeagueId) {
      return; 
    }

    // Find the clicked league in our data - only match by _id
    const selectedLeague = this._leagues.find(league => league._id === leagueId);
  
    if (selectedLeague) {
      // Use the _id as the identifier
      const effectiveId = selectedLeague._id;
      
      // Update the selected league ID
      this._selectedLeagueId = effectiveId;
      
      this._renderLeagueList();

      // Update the UI to show the selected league
      // First, remove selected class from all league items
      const allLeagueItems = this.shadow.querySelectorAll('.league-list-item');
      allLeagueItems.forEach(item => item.classList.remove('selected'));
      
      // Find and select the clicked league item
      const newSelectedElement = this.shadow.querySelector(`.league-list-item[data-id="${effectiveId}"]`);
      if (newSelectedElement) {
        newSelectedElement.classList.add('selected');
        // Only call scrollIntoView if supported (e.g. avoids errors in jsdom tests)
        if (typeof newSelectedElement.scrollIntoView === 'function') {
          newSelectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
      
      // Show the league-specific panels
      this._showLeagueSpecificPanels();
      
      // Reset selected team
      this._selectedTeamId = null;
      
      // Dispatch the leagueSelected event
      this.dispatchEvent(new LeagueAdminElementEvent('leagueSelected', { 
        leagueId: effectiveId,
        leagueName: selectedLeague.name 
      }));

    } else {
      // League not found in list, effectively deselecting
      console.warn(this.LOG_PREFIX + `_handleLeagueSelect: League with ID ${leagueId} not found`);
      this._selectedLeagueId = null;
      this._selectedTeamId = null;
      this._hideLeagueSpecificPanels();
      this.dispatchEvent(new LeagueAdminElementEvent('leagueSelected', { leagueId: null }));
    }
    
    this._updateButtonStates();
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

  _showLeagueSpecificPanels() {
  
    const selectedLeague = this._getSelectedLeague();
    if (!selectedLeague) {
      this._hideLeagueSpecificPanels();
      return;
    }
  
  
    // Show the teams panel
    const teamsPanel = this.shadow.querySelector('#teams-panel');
    if (teamsPanel) {
      teamsPanel.style.display = '';
      this._renderTeamsList();
    } else {
      console.warn(this.LOG_PREFIX + 'Teams panel element not found');
    }
  
    // Show the attention container and update it
    const attentionContainer = this.shadow.querySelector('#admin-matches-attention-container');
    if (attentionContainer) {
      attentionContainer.style.display = '';
      this._updateAttentionPanel(selectedLeague);
    } else {
      console.warn(this.LOG_PREFIX + 'Attention container element not found');
    }

    // Show the schedule panel and update it
    const schedulePanel = this.shadow.querySelector('#league-schedule-panel');
    if (schedulePanel) {
      schedulePanel.style.display = '';
      this._updateSchedulePanel(selectedLeague);
    } else {
      console.warn(this.LOG_PREFIX + 'Schedule panel element not found');
    }
  
    // Ensure the details column is visible (in case it was hidden)
    const detailsColumn = this.shadow.querySelector('.column-details');
    if (detailsColumn) {
      detailsColumn.style.display = '';
    }
  }

  _hideLeagueSpecificPanels() {
    
    // Hide the attention container
    const attentionContainer = this.shadow.querySelector('#admin-matches-attention-container');
    if (attentionContainer) {
      attentionContainer.style.display = 'none';
    } else {
      console.warn(this.LOG_PREFIX + 'Attention container element not found when trying to hide');
    }

    // Hide the schedule panel
    const schedulePanel = this.shadow.querySelector('#league-schedule-panel');
    if (schedulePanel) {
      schedulePanel.style.display = 'none';
    } else {
      console.warn(this.LOG_PREFIX + 'Schedule panel element not found when trying to hide');
    }
    
    // Reset selected team
    this._selectedTeamId = null;
    
    // Hide the teams panel
    const teamsPanel = this.shadow.querySelector('#teams-panel');
    if (teamsPanel) {
      teamsPanel.style.display = 'none';
      
      // Clear and reset the teams list
      const teamsList = this.shadow.querySelector('#teams-list');
      if (teamsList) {
        teamsList.innerHTML = '<li style="padding: 0.5rem;">No league selected.</li>';
      }
    } else {
      console.warn(this.LOG_PREFIX + 'Teams panel element not found when trying to hide');
    }
    
    // Hide the details column (if in mobile view)
    if (this.getAttribute('is-mobile') === 'true') {
      const detailsColumn = this.shadow.querySelector('.column-details');
      if (detailsColumn) {
        detailsColumn.style.display = 'none';
      }
    }
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
    
    // Team modal event listeners are now handled by the league-teams component
    
  }

  _getSelectedLeague() {
    if (!this._selectedLeagueId) return null;
    // Ensure _leagues is an array before trying to find
    return Array.isArray(this._leagues) ? this._leagues.find(l => l._id === this._selectedLeagueId) : null;
  }
  
  _handleResetLeague() {
    this.clearError(); // Good practice to clear any existing errors
    const leagueIdToReset = this._currentLeagueIdForMenu;

    if (!leagueIdToReset) {
      this.showError("Cannot reset: league context from menu is missing.");
      console.error("[Reset League] _currentLeagueIdForMenu is not set during reset attempt.");
      this._hideGlobalLeagueMenu(); // Hide menu and exit
      return;
    }

    const leagueToResetObject = Array.isArray(this._leagues) ? this._leagues.find(l => (l._id || l.name) === leagueIdToReset) : null;

    if (leagueToResetObject) {
      // Open the reset modal instead of SweetAlert2
      this._openResetModal(leagueToResetObject);
      this._hideGlobalLeagueMenu(); // Hide menu when opening modal
    } else {
      this.showError(`League with ID "${leagueIdToReset}" not found to reset.`);
      console.error(`[Reset League] League with ID "${leagueIdToReset}" (from _currentLeagueIdForMenu) not found in this._leagues.`);
      this._hideGlobalLeagueMenu(); // Hide menu if league not found
    }
  }

  /**
   * Open the reset modal for a league
   * @param {Object} league - The league object to reset
   */
  _openResetModal(league) {
    this.resetModalOpen = true;
    this._leagueToReset = league; // Store the league for later use
    this.render();
  }

  /**
   * Close the reset modal
   */
  _closeResetModal() {
    this.resetModalOpen = false;
    this._leagueToReset = null;
    this.render();
  }

  /**
   * Reset matches for a league while preserving teams
   * @param {Object} leagueToReset - The league object to reset matches for
   * @param {Array} generatedMatches - The generated matches array
   * @param {number} matchCount - The number of matches generated
   * @param {Object} dateRange - The date range for scheduling matches
   */
  _applyGeneratedMatches(leagueToReset, generatedMatches, matchCount, dateRange) {
    try {
      const leagueName = leagueToReset.name || leagueToReset._id || 'Unknown League';
      
      // Create a deep copy of the league to avoid modifying the original during processing
      const updatedLeague = JSON.parse(JSON.stringify(leagueToReset));
      
      // Map the generated matches to use the actual team objects from the league
      const mappedMatches = this._mapGeneratedMatchesToActualTeams(generatedMatches, updatedLeague.teams);
      
      // Apply the generated matches
      updatedLeague.matches = mappedMatches;
      
      // Update the league in the internal _leagues array
      const leagueIndex = this._leagues.findIndex(l => (l._id || l.name) === (leagueToReset._id || leagueToReset.name));
      if (leagueIndex !== -1) {
        this._leagues[leagueIndex] = updatedLeague;
        
        // Dispatch event to save the updated league
        this.dispatchEvent(new LeagueAdminElementEvent('requestSaveLeague', {
          leagueData: updatedLeague
        }));
        
        // Re-render to reflect changes
        this.render();
        
        // Show success message with scheduling info
        let successMessage = `"${leagueName}" matches have been reset. ${matchCount} new matches generated.`;
        
        if (dateRange) {
          successMessage += ` Matches scheduled from ${dateRange.start} to ${dateRange.end}.`;
        }
        
        Swal.default.fire({
          customClass: this._getSwalCustomClasses(),
          title: 'Matches Reset Successfully',
          text: successMessage,
          icon: 'success',
          timer: 4000,
          showConfirmButton: false
        });
        
        console.log(`[Reset League] Successfully reset matches for "${leagueName}". Generated ${matchCount} matches.`);
      } else {
        throw new Error('League not found in internal array after reset');
      }
      
    } catch (error) {
      console.error('[Reset League] Error applying generated matches:', error);
      this.showError(`Failed to apply generated matches: ${error.message}`);
      
      Swal.default.fire({
        customClass: this._getSwalCustomClasses(),
        title: 'Reset Failed',
        text: `Failed to apply generated matches: ${error.message}`,
        icon: 'error',
        timer: 4000,
        showConfirmButton: false
      });
    }
  }

  _mapGeneratedMatchesToActualTeams(generatedMatches, actualTeams) {
    // Map the temporary team IDs to actual team objects
    return generatedMatches.map((match, index) => {
      // Use index-based mapping since temp teams are generated sequentially
      const homeTeamIndex = parseInt(match.homeTeam._id.replace('temp_team_', '')) - 1;
      const awayTeamIndex = parseInt(match.awayTeam._id.replace('temp_team_', '')) - 1;
      
      return {
        ...match,
        _id: `match_${Date.now()}_${index}`,
        homeTeam: actualTeams[homeTeamIndex] || match.homeTeam,
        awayTeam: actualTeams[awayTeamIndex] || match.awayTeam
      };
    });
  }
  
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
    this.openTeamModal(null, 'manage');
  }
  
  _handleEditTeam(team) {
    if (!team) return;
    this.openTeamModal(team, 'edit');
  }
  
  _handleRemoveTeam(team) {
    if (!team) return;
    
    const selectedLeague = this._getSelectedLeague();
    if (!selectedLeague) return;
    
    // Show confirmation dialog using window.Swal
    Swal.default.fire({
      customClass: this._getSwalCustomClasses(),
      title: 'Remove Team?',
      text: `Are you sure you want to remove "${team.name}" from the league? This will also remove all matches involving this team.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove team',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
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
          
          // Update the league data
          this._leagues[leagueIndex].teams = updatedTeams;
          this._leagues[leagueIndex].matches = updatedMatches;
          
          // Dispatch event to notify parent about team removal
          this.dispatchEvent(new LeagueAdminElementEvent('requestRemoveTeam', {
            leagueId: this._selectedLeagueId,
            teamId: team._id
          }));
          
          // Re-render teams list
          this._renderTeamsList();

          // ADDED: Refresh the attention panel to reflect removed matches
          const leagueToRefresh = this._getSelectedLeague();
          if (leagueToRefresh) {
            this._updateAttentionPanel(leagueToRefresh);
          }
          
          // Show success message
          Swal.default.fire({
            customClass: this._getSwalCustomClasses(),
            title: 'Team Removed',
            text: `${team.name} has been removed from the league`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        }
      }
    });
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
        <label for="useExistingTeamCheckbox" class="form-label-shared" id="useExistingTeamLabel">
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
    const useExistingTeamLabel = modalBody.querySelector('#useExistingTeamLabel');
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
        const tooltip = existingTeams.length === 0 ? "No lovebowls teams available" : "All lovebowls teams are already in this league";
        useExistingTeamCheckbox.title = tooltip;

        if (useExistingTeamLabel) {
            useExistingTeamLabel.title = tooltip;
            useExistingTeamLabel.style.cursor = 'not-allowed';
            useExistingTeamLabel.style.opacity = '0.6';
        }

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
        
        // Deep copy the selected league to ensure we have the most up-to-date version
        const updatedLeague = JSON.parse(JSON.stringify(selectedLeague));

        if (existingTeamIndex !== -1) {
          // Update the existing team
          updatedTeams[existingTeamIndex] = teamData;
          
          // If team ID is changing, update all match references
          if (isTeamIdChanging && Array.isArray(updatedLeague.matches)) {
            const updatedMatches = updatedLeague.matches.map(match => {
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
            
            // Update the league with the modified matches and teams
            updatedLeague.teams = updatedTeams;
            updatedLeague.matches = updatedMatches;
          } else {
            // No ID change, just update teams
            updatedLeague.teams = updatedTeams;
          }
        } else {
          // Add the new team
          updatedLeague.teams = [...updatedTeams, teamData];
        }

        // Update the main _leagues array and dispatch the event
        this._leagues[leagueIndex] = updatedLeague;
        
        // Dispatch event to save the updated league
        this.dispatchEvent(new LeagueAdminElementEvent('requestSaveLeague', {
          leagueData: updatedLeague
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
    
    // Focus the League Name input after the modal is rendered
    setTimeout(() => {
      const leagueNameInput = modalBody.querySelector('#leagueName');
      if (leagueNameInput) {
        leagueNameInput.focus();
      }
    }, 0);
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

    // If editing, preserve the original _id, teams, and matches
    if (this._modalMode === 'edit') {
        const originalLeague = this._getSelectedLeague();
        if (originalLeague) {
            if (originalLeague._id) {
                leagueData._id = originalLeague._id;
            }
            // Preserve existing teams and matches
            if (originalLeague.teams) {
                leagueData.teams = originalLeague.teams;
            }
            if (originalLeague.matches) {
                leagueData.matches = originalLeague.matches;
            }
        }
    } else if (this._modalMode === 'copy') {
      const originalLeague = this._getSelectedLeague();
      if (originalLeague) {
        // For a copy, preserve the teams but reset the matches
        leagueData.teams = originalLeague.teams || [];
        leagueData.matches = [];
      }
    }
    
    // Store information if this is a new league creation or copy
    if (this._modalMode === 'new' || this._modalMode === 'copy') {
      this._pendingNewLeagueData = leagueData;
      this._isWaitingForNewLeagueConfirmation = true;
    }
    
    this.dispatchEvent(new LeagueAdminElementEvent('requestSaveLeague', { leagueData }));
    this._hideModal();
    this._hideGlobalLeagueMenu(); // ADDED: Hide menu after action (if it was open due to edit)
  }

  // Helper method to get custom classes for Swal
  _getSwalCustomClasses() {
    const mobilePopup = this._isMobile ? 'lae-swal-popup-mobile' : '';
    const mobileTitle = this._isMobile ? 'lae-swal-title-mobile' : '';
    const mobileHtmlContainer = this._isMobile ? 'lae-swal-html-container-mobile' : '';
    const mobileActions = this._isMobile ? 'lae-swal-actions-mobile' : '';
    const mobileStyled = this._isMobile ? 'lae-swal-styled-mobile' : '';

    return {
      popup: mobilePopup,
      title: mobileTitle,
      htmlContainer: mobileHtmlContainer,
      actions: mobileActions,
      confirmButton: mobileStyled,
      cancelButton: mobileStyled,
    };
  }

  /**
   * Check if we need to show new league confirmation dialog
   */
  _checkForNewLeagueConfirmation() {
    if (!this._isWaitingForNewLeagueConfirmation || !this._pendingNewLeagueData) {
      return;
    }

    // Find the newly created league in the current data
    const newLeague = this._leagues.find(league => 
      league.name === this._pendingNewLeagueData.name && 
      (!this._pendingNewLeagueData._id || league._id === this._pendingNewLeagueData._id)
    );

    if (newLeague) {
      // Reset the waiting state
      this._isWaitingForNewLeagueConfirmation = false;
      const leagueDataBeforeConfirmation = this._pendingNewLeagueData;
      this._pendingNewLeagueData = null;
      
      // Show the confirmation dialog
      this._showNewLeagueConfirmationDialog(newLeague, leagueDataBeforeConfirmation);
    }
  }

  /**
   * Show confirmation dialog after creating a new league
   * @param {Object} newLeague - The newly created league object
   */
  _showNewLeagueConfirmationDialog(newLeague, originalData) {
    const leagueName = newLeague.name || 'your new league';
    const isCopy = originalData.teams && originalData.teams.length > 0;
    const title = isCopy ? 'League Copied Successfully!' : 'League Created Successfully!';
    const mainText = isCopy ? `"${leagueName}" has been copied successfully.` : `"${leagueName}" has been created successfully.`;
    
    Swal.default.fire({
      customClass: this._getSwalCustomClasses(),
      title: title,
      html: `
        <p>${mainText}</p>
        <div style="margin-top: 1rem;">
          <label style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; cursor: pointer;">
            <input type="checkbox" id="setupTeams" checked style="margin: 0;">
            <span>Setup Teams</span>
          </label>
        </div>
      `,
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Close',
      preConfirm: () => {
        return document.getElementById('setupTeams').checked;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const shouldSetupTeams = result.value;
        
        if (shouldSetupTeams) {
          // Select the newly created league first
          this._selectedLeagueId = newLeague._id || newLeague.name;
          this._updateButtonStates();
          this.render(); // Re-render to show the selected league
          
          // Open the teams modal instead of the reset modal with new league workflow flag
          this.openTeamModal(null, 'manage', { fromNewLeagueWorkflow: true });
        }
      }
    });
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
      this._hideGlobalLeagueMenu(); // Hide menu and exit
      return;
    }

    const leagueToDeleteObject = Array.isArray(this._leagues) ? this._leagues.find(l => (l._id || l.name) === leagueIdToDelete) : null;

    if (leagueToDeleteObject) {
      const leagueName = leagueToDeleteObject.name || leagueToDeleteObject._id || 'this league'; // Get a display name

      Swal.default.fire({
        customClass: this._getSwalCustomClasses(),
        title: 'Delete League?',
        text: `Are you sure you want to delete "${leagueName}"? This action cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete league',
        confirmButtonColor: '#d33'
      }).then((result) => {
        if (result.isConfirmed) {
          const actualLeagueIdForDispatch = leagueToDeleteObject._id || leagueToDeleteObject.name;

          this.dispatchEvent(new LeagueAdminElementEvent('requestDeleteLeague', { leagueId: actualLeagueIdForDispatch }));

          if (this._selectedLeagueId === actualLeagueIdForDispatch) {
            const oldSelectedId = this._selectedLeagueId;
            this._selectedLeagueId = null;
          }
          
          this._hideLeagueSpecificPanels(); 
          this._updateButtonStates();

          // Success message
          Swal.default.fire({
            customClass: this._getSwalCustomClasses(),
            title: 'League Deleted',
            text: `"${leagueName}" has been deleted.`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        }
        // Always hide the menu after the dialog is interacted with (confirmed or cancelled)
        this._hideGlobalLeagueMenu();
      });
    } else {
      this.showError(`League with ID "${leagueIdToDelete}" not found to delete.`);
      console.error(`[Delete League] League with ID "${leagueIdToDelete}" (from _currentLeagueIdForMenu) not found in this._leagues.`);
      this._hideGlobalLeagueMenu(); // Hide menu if league not found
    }
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
  
  _handleEditMatch(matchIdContainer) {
    if (!matchIdContainer || !matchIdContainer._id) {
        console.error("Match ID not provided to _handleEditMatch");
        return;
    }
    const matchId = matchIdContainer._id;
    const selectedLeague = this._getSelectedLeague();
    if (!selectedLeague || !selectedLeague.matches) {
        console.error("Selected league or its matches not found when trying to edit match.");
        return;
    }
    
    const currentMatchObject = selectedLeague.matches.find(m => m._id === matchId);
    if (!currentMatchObject) {
        console.error(`Match with ID ${matchId} not found in selected league.`);
        return;
    }

    // Pass teams as array of {_id, name} objects
    const teams = selectedLeague.teams || [];
    this.openMatchModal(currentMatchObject, teams, 'edit');
  }
  
  openMatchModal(matchData, teams, mode = 'edit') {
    console.group('[LeagueAdmin] openMatchModal');
    try {      
      // Validate inputs
      if (!matchData) {
        throw new Error('No match data provided');
      }
      
      if (!teams || !Array.isArray(teams)) {
        console.warn('No teams array provided, using empty array');
        teams = [];
      }
      
      // Update component state
      this.matchModalOpen = true;
      this.matchModalData = matchData;
      this.matchModalTeams = teams;
      this.matchModalMode = mode;
      
      console.log('[LeagueAdmin] About to render match modal without full re-render');
      this._renderMatchModal();
      console.log('[LeagueAdmin] Finished rendering match modal');
      
    } catch (error) {
      console.error('Error in openMatchModal:', error);
      this.showError('Failed to open match editor. Please try again.');
    } finally {
      console.groupEnd();
    }
  }
  
  closeMatchModal() {
    this.matchModalOpen = false;
    this.matchModalData = null;
    this.matchModalTeams = [];
    this.matchModalMode = 'new';
    this._renderMatchModal();
  }

  /**
   * Renders only the match modal without affecting the rest of the component
   * @private
   */
  _renderMatchModal() {
    // Remove existing match modal if present
    let modal = this.shadow.querySelector('league-match');
    if (modal) modal.remove();
    
    if (this.matchModalOpen) {
      modal = document.createElement('league-match');
      modal.match = this.matchModalData;
      modal.teams = this.matchModalTeams;
      modal.open = true;
      modal.isMobile = this._isMobile;
      modal.mode = this.matchModalMode;
      
      const selectedLeague = this._getSelectedLeague();
      modal.leagueSettings = selectedLeague?.settings || {}; // Pass settings object or empty if none
            
      // Pass attention reason if available in matchModalData
      if (this.matchModalData && this.matchModalData.attentionReason) {
        modal.attentionReason = this.matchModalData.attentionReason;
      }
            
      modal.addEventListener('match-save', (e) => {
        // Save match to league
        const match = e.detail.match;

        const selectedLeague = this._getSelectedLeague();
        if (!selectedLeague) {
            console.error('[Admin Match Save] No selected league found.');
            return;
        }
        const updatedLeague = JSON.parse(JSON.stringify(selectedLeague));
        
        if (this.matchModalMode === 'edit' && match._id) {
          const idx = updatedLeague.matches.findIndex(m => m._id === match._id);
          if (idx >= 0) {
            // Ensure a proper merge, especially of the result object
            updatedLeague.matches[idx] = {
                ...updatedLeague.matches[idx], // Keep existing properties like key, date, teams
                ...match // Overwrite with incoming changes, including result
            };
          } else {
            updatedLeague.matches.push(match); 
          }
        } else {
          updatedLeague.matches.push(match);
        }

        // Update the internal _leagues array
        const leagueIndex = this._leagues.findIndex(l => l._id === selectedLeague._id);
        if (leagueIndex > -1) {
          this._leagues[leagueIndex] = updatedLeague;
        } else {
            console.error('[Admin Match Save] Selected league index not found in _leagues array.');
        }

        this.dispatchEvent(new LeagueAdminElementEvent('requestSaveLeague', { leagueData: updatedLeague }));
        this.closeMatchModal(); // This will call _renderMatchModal() which removes the modal
        
        // Update the schedule panel to reflect the changes without full re-render
        this._updateSchedulePanel(updatedLeague);
        
        // Update the attention panel to reflect the changes without full re-render
        this._updateAttentionPanel(updatedLeague);
      });
      
      modal.addEventListener('match-cancel', () => {
        this.closeMatchModal();
      });
      
      this.shadow.appendChild(modal);
    }
  }

  openTeamModal(teamData, mode = 'new', options = {}) {
    console.group('[LeagueAdmin] openTeamModal');
    try {
      // Update component state
      this.teamModalOpen = true;
      this.teamModalData = teamData;
      this.teamModalMode = mode;
      this.teamModalOptions = options; // Store additional options
      
      this.render();
      
      // Verify the modal was rendered
      const modalElement = this.shadowRoot.querySelector('league-teams');
      if (!modalElement) {
        console.error('League teams modal element not found after render');
      }
      
    } catch (error) {
      console.error('Error in openTeamModal:', error);
      this.showError('Failed to open team editor. Please try again.');
    } finally {
      console.groupEnd();
    }
  }
  
  closeTeamModal() {
    this.teamModalOpen = false;
    this.teamModalData = null;
    this.teamModalMode = 'new';
    this.teamModalOptions = {};
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

  _updateAttentionPanel(leagueToUse) {
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
    
    const isMobile = String(this._isMobile);
    attentionMatchesElement.setAttribute('is-mobile', isMobile);
    
    try {
      // Pass the whole league instance instead of just matches
      const leagueData = JSON.stringify(selectedLeague);
      attentionMatchesElement.setAttribute('data', leagueData);
      
      // Pass the team name mapping as an additional attribute if your LeagueMatchesAttention component supports it
      if (Object.keys(teamMap).length > 0) {
        attentionMatchesElement.setAttribute('team-map', JSON.stringify(teamMap));
      }
      
      attentionContainer.style.display = '';

      // Ensure event listener is attached (and only once)
      if (!this._handleAdminAttentionMatchClickBound) {
        this._handleAdminAttentionMatchClickBound = this._handleAdminAttentionMatchClick.bind(this);
      }
      
      // Log before removing existing listener
      attentionMatchesElement.removeEventListener('league-matches-attention-event', this._handleAdminAttentionMatchClickBound);
      
      // Add the new listener with capture: true to catch the event in the capture phase
      attentionMatchesElement.addEventListener('league-matches-attention-event', this._handleAdminAttentionMatchClickBound, { 
        capture: true,
        passive: false // Ensure preventDefault can be called
      });
            
    } catch (error) {
      console.error('[LeagueAdmin] Error updating attention panel:', error);
      attentionContainer.style.display = 'none';
    }
  }

  _updateSchedulePanel(leagueToUse) {
    console.log('[LeagueAdmin] _updateSchedulePanel called');
    const selectedLeague = leagueToUse || this._getSelectedLeague();
    const scheduleElement = this.shadow.querySelector('#admin-league-schedule');
    const scheduleContainer = this.shadow.querySelector('#league-schedule-panel');
    
    if (!selectedLeague || !scheduleElement || !scheduleContainer) {
      if (scheduleContainer) scheduleContainer.style.display = 'none';
      console.log('[LeagueAdmin] _updateSchedulePanel early return - missing elements');
      return;
    }
    
    // LeagueSchedule handles its own filter state persistence via sessionStorage
    
    const isMobile = String(this._isMobile);
    scheduleElement.setAttribute('is-mobile', isMobile);
    
    // Set the can-edit attribute to allow editing matches
    scheduleElement.setAttribute('can-edit', 'true');
    
    // LeagueSchedule now handles its own filter persistence via sessionStorage
    
    try {
      // Set the league data for the schedule component
      const leagueData = JSON.stringify(selectedLeague);
      scheduleElement.setAttribute('data', leagueData);
      
      scheduleContainer.style.display = '';

      // Ensure event listener is attached (and only once)
      if (!this._handleAdminScheduleEventBound) {
        this._handleAdminScheduleEventBound = this._handleAdminScheduleEvent.bind(this);
      }
      
      // Remove existing listener
      scheduleElement.removeEventListener('league-schedule-event', this._handleAdminScheduleEventBound);
      
      // Add the new listener
      scheduleElement.addEventListener('league-schedule-event', this._handleAdminScheduleEventBound);
            
    } catch (error) {
      console.error('[LeagueAdmin] Error updating schedule panel:', error);
      scheduleContainer.style.display = 'none';
    }
  }

  _handleAdminAttentionMatchClick(e) {
    
    // Validate the event detail
    if (!e.detail) {
      console.error('[LeagueAdmin] Event detail is missing');
      console.groupEnd();
      return;
    }
    
    if (e.detail.type !== 'matchClick') {
      console.groupEnd();
      return;
    }
    
    if (!e.detail.match) {
      console.error('[LeagueAdmin] Match data is missing from event detail');
      console.groupEnd();
      return;
    }
    
    // Get the selected league
    const selectedLeague = this._getSelectedLeague();
    if (!selectedLeague) {
      console.error('[LeagueAdmin] No selected league when handling match click');
      console.groupEnd();
      return;
    }
    
    try {
      
      
      // Get teams from the selected league
      const teams = selectedLeague.teams || [];
      
      // Clone match data to avoid modifying the original
      const matchData = { ...e.detail.match };
      
      // Add attention reason if present
      if (e.detail.attentionReason) {
        matchData.attentionReason = e.detail.attentionReason;
      }
      
      // Open the match modal
      this.openMatchModal(matchData, teams, 'edit');
      
      // Stop propagation to prevent multiple handlers from firing
      e.stopPropagation();
      
      // Prevent default to avoid any default link behavior
      if (e.preventDefault) {
        e.preventDefault();
      }
      
    } catch (error) {
      console.error('[LeagueAdmin] Error handling match click:', error);
      this.showError('An error occurred while opening the match for editing.');
    } finally {
      console.groupEnd();
    }
  }

  _handleAdminScheduleEvent(e) {
    console.group('[LeagueAdmin] _handleAdminScheduleEvent');
    
    // Validate the event detail
    if (!e.detail) {
      console.error('[LeagueAdmin] Event detail is missing');
      console.groupEnd();
      return;
    }
    
    const eventType = e.detail.type;
    console.log('Schedule event type:', eventType);
    
    try {
      switch (eventType) {
        case 'matchClick':
          break;
          
        case 'matchEdit':
          if (e.detail.match) {
            const selectedLeague = this._getSelectedLeague();
            if (selectedLeague) {
              const teams = selectedLeague.teams || [];
              const matchData = { ...e.detail.match };
              this.openMatchModal(matchData, teams, 'edit');
            }
          }
          break;
          
        case 'filterClear':
          // Handle filter clear if needed
          console.log('Schedule filters cleared');
          break;
          
        case 'export':
          // Handle export completion if needed
          console.log('Schedule data exported:', e.detail.format);
          break;
          
        default:
          console.log('Unhandled schedule event type:', eventType);
      }
      
      // Stop propagation to prevent multiple handlers from firing
      e.stopPropagation();
      
      // Prevent default to avoid any default behavior
      if (e.preventDefault) {
        e.preventDefault();
      }
      
    } catch (error) {
      console.error('[LeagueAdmin] Error handling schedule event:', error);
      this.showError('An error occurred while handling the schedule event.');
    } finally {
      console.groupEnd();
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

    // Update the schedule panel to reflect the new team selection
    const selectedLeague = this._getSelectedLeague();
    if (selectedLeague) {
      // Set the team filter in the schedule component
      const scheduleElement = this.shadow.querySelector('#admin-league-schedule');
      if (scheduleElement && this._selectedTeamId) {
        scheduleElement.selectedTeamId = this._selectedTeamId;
        scheduleElement.saveFilterState();
        scheduleElement.renderWithoutReset();
      } else if (scheduleElement && !this._selectedTeamId) {
        // Clear the filter when no team is selected
        scheduleElement.selectedTeamId = null;
        scheduleElement.saveFilterState();
        scheduleElement.renderWithoutReset();
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

    if (this._isMobile) {
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
      const target = event.composedPath && event.composedPath()[0] ? event.composedPath()[0] : event.target;
      if (!globalMenu.contains(target) && target !== triggerButton) {
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
