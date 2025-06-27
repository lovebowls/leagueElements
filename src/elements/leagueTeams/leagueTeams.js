// leagueTeams.js
// Comprehensive League Teams Manager

import { BASE_STYLES } from './leagueTeams-styles.js';
import * as Swal from 'sweetalert2';
import { sweetAlertGlobalStyles, sweetAlertMobileOverrides } from '../shared-styles.js';

class LeagueTeamsEvent extends CustomEvent {
  constructor(type, detail) {
    super(type, { detail, bubbles: true, composed: true });
  }
}

class LeagueTeams extends HTMLElement {
  static _globalStylesInjected = false;
  
  static get observedAttributes() {
    return ['open', 'is-mobile', 'data', 'action', 'existing-teams'];
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    
    // League data
    this._league = null; // Full league object
    this._workingLeague = null; // Working copy for modifications
    this._existingTeams = []; // Available teams from lovebowls
    
    // UI state
    this._open = false;
    this._isMobile = false;
    this._selectedTeamId = null;
    this._showEditor = false;
    this._editorMode = 'new'; // 'new' or 'edit'
    this._editingTeam = null;
    
    // Action configuration
    this._action = null; // {createTeam: boolean, editTeam: guid, fromNewLeagueWorkflow: boolean}
    
    // Error handling
    this._error = '';
    
    // Workflow state
    this._showFixtureScheduler = true; // Default to checked
    
    // Event bindings
    this._boundOnKeydown = this._onKeydown.bind(this);
  }

  static get observedAttributes() {
    return ['open', 'is-mobile', 'data', 'action', 'existing-teams'];
  }

  // Properties
  /**
   * @param {Object} value - Full league object
   */
  set data(value) {
    try {
      this._league = typeof value === 'string' ? JSON.parse(value) : value;
      this._workingLeague = this._league ? JSON.parse(JSON.stringify(this._league)) : null;
    } catch (error) {
      console.error('Failed to parse league data:', error);
      this._league = null;
      this._workingLeague = null;
    }
    this.render();
  }
  get data() { return this._league; }

  /**
   * @param {Object} value - Action configuration {createTeam: boolean, editTeam: guid}
   */
  set action(value) {
    try {
      this._action = typeof value === 'string' ? JSON.parse(value) : value;
      this._processAction();
    } catch (error) {
      console.error('Failed to parse action:', error);
      this._action = null;
    }
  }
  get action() { return this._action; }

  /**
   * @param {Array} value - Array of available teams from lovebowls
   */
  set existingTeams(value) {
    try {
      this._existingTeams = typeof value === 'string' ? JSON.parse(value) : (Array.isArray(value) ? value : []);
    } catch (error) {
      console.error('Failed to parse existing teams:', error);
      this._existingTeams = [];
    }
    this.render();
  }
  get existingTeams() { return this._existingTeams; }

  /**
   * @returns {boolean} Whether we're in the new league workflow
   */
  get _isNewLeagueWorkflow() {
    return this._action && this._action.fromNewLeagueWorkflow === true;
  }

  /**
   * @param {boolean} value
   */
  set open(value) {
    const shouldRender = this._open !== !!value;
    this._open = !!value;
    this.setAttribute('open', this._open.toString());
    if (shouldRender) {
      this.render();
    }

    if (this._open) {
      this.shadowRoot.addEventListener('keydown', this._boundOnKeydown);
    } else {
      this.shadowRoot.removeEventListener('keydown', this._boundOnKeydown);
    }
  }
  get open() { return this._open; }

  /**
   * @param {boolean} value
   */
  set isMobile(value) {
    const shouldRender = this._isMobile !== !!value;
    this._isMobile = !!value;
    if (shouldRender) {
      this.render();
    }
  }
  get isMobile() { return this._isMobile; }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'open':
        this.open = newValue === 'true';
        break;
      case 'is-mobile':
        this.isMobile = newValue === 'true';
        break;
      case 'data':
        this.data = newValue;
        break;
      case 'action':
        this.action = newValue;
        break;
      case 'existing-teams':
        this.existingTeams = newValue;
        break;
    }
  }

  connectedCallback() {
    this._injectGlobalSwalStyles();
    this.render();
  }

  _injectGlobalSwalStyles() {
    if (LeagueTeams._globalStylesInjected) return;

    const styleId = 'global-swal-mobile-styles-teams';
    let existingStyleTag = document.getElementById(styleId);

    if (existingStyleTag) {
      LeagueTeams._globalStylesInjected = true;
      return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `${sweetAlertGlobalStyles}\n\n${sweetAlertMobileOverrides}`;

    try {
      document.head.appendChild(style);
    } catch (err) {
      console.error('[LeagueTeams] Failed to append style tag to head:', err);
    }
    
    LeagueTeams._globalStylesInjected = true;
  }

  _processAction() {
    if (!this._action) return;

    if (this._action.createTeam) {
      this._showCreateTeam();
    } else if (this._action.editTeam) {
      this._showEditTeam(this._action.editTeam);
    }
  }

  _showCreateTeam() {
    this._selectedTeamId = null;
    this._showEditor = true;
    this._editorMode = 'new';
    this._editingTeam = null;
    this.render();
  }

  _showEditTeam(teamId) {
    if (!this._workingLeague?.teams) return;
    
    const team = this._workingLeague.teams.find(t => t._id === teamId);
    if (!team) return;
    
    this._selectedTeamId = teamId;
    this._showEditor = true;
    this._editorMode = 'edit';
    this._editingTeam = { ...team };
    this.render();
  }

  _hideEditor() {
    this._showEditor = false;
    this._editorMode = 'new';
    this._editingTeam = null;
    this.clearError();
    this.render();
  }

  showError(msg) {
    this._error = msg || '';
    const errorElement = this.shadow.querySelector('#teams-error');
    if (errorElement) {
      errorElement.textContent = this._error;
      errorElement.style.display = this._error ? 'block' : 'none';
    }
  }

  clearError() {
    this.showError('');
  }

  render() {
    const mobileClass = this._isMobile ? 'mobile-view' : '';
    const leagueName = this._workingLeague?.name || 'League';
    const teams = this._workingLeague?.teams || [];
    
    this.shadow.innerHTML = `
      <style>
        ${BASE_STYLES}
      </style>
      <div class="modal-shared-overlay" style="display: ${this._open ? 'flex' : 'none'};">
        <div class="teams-manager-content ${mobileClass}">
          <div class="teams-manager-header">
            <h3>Manage Teams - ${leagueName}</h3>
            <button type="button" class="modal-close-button" id="close-teams-manager" aria-label="Close">&times;</button>
          </div>
          
          <div class="teams-manager-body">
            <!-- Error Display -->
            <div id="teams-error" class="form-error-shared" style="display: none;"></div>
            
            <!-- Team Editor Panel (moved above teams list) -->
            ${this._showEditor ? this._renderTeamEditor() : `
              <!-- Action Buttons -->
              <div class="teams-action-buttons">
                <button type="button" class="button-shared button-primary" id="add-team-btn">Add Team</button>
              </div>
            `}
             
            <div class="list-panel ${this._showEditor ? 'disabled' : ''}">
              <h4>Teams in League (${teams.length})</h4>
              <div class="list-container">
                ${this._renderTeamsList(teams)}
              </div>
            </div>
          </div>
          
          <div class="teams-manager-footer">
            ${this._isNewLeagueWorkflow && teams.length >= 2 ? `
              <div class="footer-options">
                <label class="checkbox-label">
                  <input type="checkbox" id="show-fixture-scheduler" ${this._showFixtureScheduler ? 'checked' : ''}>
                  Next: Fixture Scheduler
                </label>
              </div>
            ` : '<div></div>'}
            <div class="footer-buttons">
              <button type="button" class="button-shared" id="cancel-teams-manager" ${this._showEditor ? 'disabled' : ''}>Cancel</button>
              <button type="button" class="button-shared button-primary" id="save-teams-manager" ${this._showEditor ? 'disabled' : ''}>OK</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this._attachEventListeners();
  }

  _renderTeamsList(teams) {
    if (teams.length === 0) {
      return '<div class="no-teams-message">No teams in this league yet.</div>';
    }

    return `
      <ul class="list">
        ${teams.map(team => `
          <li class="list-item ${this._selectedTeamId === team._id ? 'selected' : ''}" data-team-id="${team._id}">
            <div class="team-info">
              <span class="team-name">${team.name}</span>
              ${this._isLovebowlsTeam(team._id) ? '<small class="team-source">(LB)</small>' : ''}
            </div>
            ${this._selectedTeamId === team._id && !this._showEditor ? `
              <div class="team-actions">
                <button type="button" class="button-shared" data-action="edit" data-team-id="${team._id}">Edit</button>
                <button type="button" class="button-shared" data-action="remove" data-team-id="${team._id}">Remove</button>
              </div>
            ` : ''}
          </li>
        `).join('')}
      </ul>
    `;
  }

  _renderTeamEditor() {
    const title = this._editorMode === 'edit' ? 'Edit Team' : 'Add Team';
    const buttonText = this._editorMode === 'edit' ? 'Update' : 'Add';
    const currentTeamData = this._editingTeam || { _id: '', name: '' };
    
    // Determine if it's a Lovebowls team
    const isLovebowlsTeam = this._isLovebowlsTeam(currentTeamData._id);
    
    // Set the checkbox label based on mode
    const checkboxLabel = (this._editorMode === 'edit' && !isLovebowlsTeam) 
      ? "Replace with team from lovebowls.co.uk" 
      : "Team from lovebowls";

    // Filter out lovebowls teams that are already part of the league
    const filteredTeams = this._getFilteredLovebowlsTeams();

    let optionsHtml = '';
    if (filteredTeams && filteredTeams.length > 0) {
      optionsHtml = filteredTeams.map(team => 
        `<option value="${team._id}" ${currentTeamData._id === team._id ? 'selected' : ''}>${team.name}</option>`
      ).join('');
    }

    return `
      <div class="team-editor-panel">
        <div class="team-editor-header">
          <h4>${title}</h4>
        </div>
        
        <div class="team-editor-body">
          <div id="team-editor-error" class="form-error-shared" style="display: none;"></div>
          
          <div class="form-group-shared">
            <label for="useExistingTeamCheckbox" class="form-label-shared" id="useExistingTeamLabel">
              <input type="checkbox" id="useExistingTeamCheckbox" ${isLovebowlsTeam ? 'checked' : ''}>
              ${checkboxLabel}
            </label>
          </div>

          <div id="existingTeamSelectGroup" class="form-group-shared" style="display: ${isLovebowlsTeam ? 'block' : 'none'};">
            <label for="existingTeamSelect" class="form-label-shared">Select Team</label>
            <div class="team-input-with-buttons">
              <select id="existingTeamSelect" class="form-input-shared">
                <option value="">-- Select a Team --</option>
                ${optionsHtml}
              </select>
              <div class="inline-buttons">
                <button type="button" class="button-shared" id="cancel-team-editor">Cancel</button>
                <button type="button" class="button-shared button-update" id="update-team" disabled>${buttonText}</button>
              </div>
            </div>
            ${filteredTeams.length === 0 ? '<div style="color: var(--le-text-color-error); margin-top: 0.5em;">All lovebowls teams are already in this league</div>' : ''}
          </div>

          <div id="newTeamNameGroup" class="form-group-shared" style="display: ${isLovebowlsTeam ? 'none' : 'block'};">
            <label for="teamName" class="form-label-shared">Team Name</label>
            <div class="team-input-with-buttons">
              <input type="text" id="teamName" class="form-input-shared" value="${isLovebowlsTeam ? '' : currentTeamData.name}" ${isLovebowlsTeam ? 'disabled' : ''}>
              <div class="inline-buttons">
                <button type="button" class="button-shared" id="cancel-team-editor">Cancel</button>
                <button type="button" class="button-shared button-update" id="update-team" disabled>${buttonText}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _isLovebowlsTeam(teamId) {
    return this._existingTeams.some(lbTeam => lbTeam._id === teamId);
  }

  _getFilteredLovebowlsTeams() {
    if (!this._workingLeague?.teams) return this._existingTeams;
    
    // If in edit mode, don't filter out the team we're currently editing
    const teamIdsToExclude = this._editorMode === 'edit' 
      ? this._workingLeague.teams.filter(t => t._id !== this._editingTeam?._id).map(t => t._id)
      : this._workingLeague.teams.map(t => t._id);
    
    return this._existingTeams.filter(team => !teamIdsToExclude.includes(team._id));
  }

  _attachEventListeners() {
    // Main buttons
    const closeBtn = this.shadow.querySelector('#close-teams-manager');
    const cancelBtn = this.shadow.querySelector('#cancel-teams-manager');
    const saveBtn = this.shadow.querySelector('#save-teams-manager');

    if (closeBtn) closeBtn.addEventListener('click', () => this._onCancel());
    if (cancelBtn && !cancelBtn.disabled) cancelBtn.addEventListener('click', () => this._onCancel());
    if (saveBtn && !saveBtn.disabled) saveBtn.addEventListener('click', () => this._onSave());

    // Fixture scheduler checkbox (only in new league workflow)
    if (this._isNewLeagueWorkflow) {
      const fixtureSchedulerCheckbox = this.shadow.querySelector('#show-fixture-scheduler');
      if (fixtureSchedulerCheckbox && !fixtureSchedulerCheckbox.disabled) {
        fixtureSchedulerCheckbox.addEventListener('change', (e) => {
          this._showFixtureScheduler = e.target.checked;
        });
      }
    }

    // Action buttons
    const addTeamBtn = this.shadow.querySelector('#add-team-btn');
    if (addTeamBtn && !this._showEditor) {
      addTeamBtn.addEventListener('click', () => this._handleAddTeam());
    }

    // Team list clicks
    const teamItems = this.shadow.querySelectorAll('.list-item');
    teamItems.forEach(item => {
      if (!this._showEditor) {
        item.addEventListener('click', (e) => {
          // Don't handle clicks on action buttons
          if (e.target.closest('.team-actions')) return;
          
          const teamId = e.currentTarget.dataset.teamId;
          this._handleTeamSelect(teamId);
        });
      }
    });

    // Team action button clicks
    const editButtons = this.shadow.querySelectorAll('.team-actions button[data-action="edit"]');
    editButtons.forEach(button => {
      if (!this._showEditor) {
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          const teamId = e.target.dataset.teamId;
          this._handleEditTeam(teamId);
        });
      }
    });

    const removeButtons = this.shadow.querySelectorAll('.team-actions button[data-action="remove"]');
    removeButtons.forEach(button => {
      if (!this._showEditor) {
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          const teamId = e.target.dataset.teamId;
          this._handleRemoveTeam(teamId);
        });
      }
    });

    // Editor panel event listeners
    if (this._showEditor) {
      this._attachEditorEventListeners();
    }

    // Click outside to close
    const overlay = this.shadow.querySelector('.modal-shared-overlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this._onCancel();
        }
      });
    }
  }

  _attachEditorEventListeners() {
    const cancelEditorBtns = this.shadow.querySelectorAll('#cancel-team-editor');
    const updateTeamBtns = this.shadow.querySelectorAll('#update-team');

    // Handle multiple buttons (one for each input group)
    cancelEditorBtns.forEach(btn => {
      if (btn) btn.addEventListener('click', () => this._hideEditor());
    });
    
    updateTeamBtns.forEach(btn => {
      if (btn) btn.addEventListener('click', () => this._handleUpdateTeam());
    });

    // Form field event listeners
    const useExistingTeamCheckbox = this.shadow.querySelector('#useExistingTeamCheckbox');
    const existingTeamSelectGroup = this.shadow.querySelector('#existingTeamSelectGroup');
    const newTeamNameGroup = this.shadow.querySelector('#newTeamNameGroup');
    const teamNameInput = this.shadow.querySelector('#teamName');
    const existingTeamSelect = this.shadow.querySelector('#existingTeamSelect');

    if (useExistingTeamCheckbox && existingTeamSelectGroup && newTeamNameGroup && teamNameInput && existingTeamSelect) {
      useExistingTeamCheckbox.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        const filteredTeams = this._getFilteredLovebowlsTeams();
        
        if (filteredTeams && filteredTeams.length > 0) {
          existingTeamSelectGroup.style.display = isChecked ? 'block' : 'none';
          newTeamNameGroup.style.display = isChecked ? 'none' : 'block';
          teamNameInput.disabled = isChecked;
          existingTeamSelect.disabled = !isChecked;
          if (isChecked) {
            teamNameInput.value = '';
          } else {
            existingTeamSelect.value = '';
          }
        } else {
          existingTeamSelectGroup.style.display = 'none';
          newTeamNameGroup.style.display = 'block';
          teamNameInput.disabled = false;
          if (isChecked && filteredTeams.length === 0) {
            useExistingTeamCheckbox.checked = false;
          }
        }
        
        // Update button state after toggling
        this._updateButtonState();
      });

      // Add real-time validation for team name input
      teamNameInput.addEventListener('input', () => {
        this._updateButtonState();
      });

      // Add real-time validation for existing team select
      existingTeamSelect.addEventListener('change', () => {
        this._updateButtonState();
      });

      // Initial state setup
      this._updateEditorFormState();
      this._updateButtonState();
    }
  }

  _updateButtonState() {
    const updateTeamBtns = this.shadow.querySelectorAll('#update-team');
    const useExistingTeamCheckbox = this.shadow.querySelector('#useExistingTeamCheckbox');
    const teamNameInput = this.shadow.querySelector('#teamName');
    const existingTeamSelect = this.shadow.querySelector('#existingTeamSelect');
    
    let hasValidInput = false;
    
    if (useExistingTeamCheckbox && useExistingTeamCheckbox.checked) {
      // Using existing team - check if something is selected
      hasValidInput = existingTeamSelect && existingTeamSelect.value.trim() !== '';
    } else {
      // Using new team name - check if name is entered
      hasValidInput = teamNameInput && teamNameInput.value.trim() !== '';
    }
    
    // Update all update buttons
    updateTeamBtns.forEach(btn => {
      if (btn) {
        btn.disabled = !hasValidInput;
      }
    });
  }

  _updateEditorFormState() {
    const useExistingTeamCheckbox = this.shadow.querySelector('#useExistingTeamCheckbox');
    const useExistingTeamLabel = this.shadow.querySelector('#useExistingTeamLabel');

    if (!useExistingTeamCheckbox) return;

    const filteredTeams = this._getFilteredLovebowlsTeams();

    if (!filteredTeams || filteredTeams.length === 0) {
      useExistingTeamCheckbox.disabled = true;
      const tooltip = this._existingTeams.length === 0 ? "No lovebowls teams available" : "All lovebowls teams are already in this league";
      useExistingTeamCheckbox.title = tooltip;

      if (useExistingTeamLabel) {
        useExistingTeamLabel.title = tooltip;
        useExistingTeamLabel.style.cursor = 'not-allowed';
        useExistingTeamLabel.style.opacity = '0.6';
      }
    }
  }

  _handleAddTeam() {
    this._showCreateTeam();
  }

  _handleEditTeam(teamId) {
    this._showEditTeam(teamId);
  }

  _handleRemoveTeam(teamId) {
    if (!teamId || !this._workingLeague?.teams) return;
    
    const team = this._workingLeague.teams.find(t => t._id === teamId);
    if (!team) return;

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
        // Remove team from working league
        this._workingLeague.teams = this._workingLeague.teams.filter(t => t._id !== teamId);
        
        // Remove matches involving this team
        if (this._workingLeague.matches) {
          this._workingLeague.matches = this._workingLeague.matches.filter(match => 
            match.homeTeam?._id !== teamId && match.awayTeam?._id !== teamId
          );
        }
        
        // Clear selection if this was the selected team
        if (this._selectedTeamId === teamId) {
          this._selectedTeamId = null;
          this._hideEditor();
        }
        
        this.render(); // Re-render to update the list
        
        Swal.default.fire({
          customClass: this._getSwalCustomClasses(),
          title: 'Team Removed',
          text: `${team.name} has been removed from the league`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  _handleTeamSelect(teamId) {
    if (this._showEditor) {
      // Don't allow selection when editor is open
      return;
    }
    
    if (this._selectedTeamId === teamId) {
      // If already selected, deselect it
      this._selectedTeamId = null;
    } else {
      // Single-click behavior: select the team
      this._selectedTeamId = teamId;
    }
    
    this.render();
    
    // If we selected a team, ensure it remains visible after render
    if (this._selectedTeamId) {
      setTimeout(() => {
        this._scrollToSelectedTeam();
      }, 50);
    }
  }

  _handleUpdateTeam() {
    this.clearError();

    const useExistingTeamCheckbox = this.shadow.querySelector('#useExistingTeamCheckbox');
    const existingTeamSelect = this.shadow.querySelector('#existingTeamSelect');
    const teamNameInput = this.shadow.querySelector('#teamName');

    let teamId = '';
    let teamName = '';

    if (useExistingTeamCheckbox && useExistingTeamCheckbox.checked && existingTeamSelect) {
      if (existingTeamSelect.value) {
        teamId = existingTeamSelect.value;
        const selectedTeam = this._existingTeams.find(t => t._id === teamId);
        teamName = selectedTeam ? selectedTeam.name : teamId;
      } else {
        this._showEditorError('Please select a team from the dropdown.');
        return;
      }
    } else if (teamNameInput && teamNameInput.value.trim()) {
      teamName = teamNameInput.value.trim();
      teamId = teamName;
    } else {
      this._showEditorError('Team Name is required, either by typing a new name or selecting an existing team.');
      return;
    }

    if (!teamId || !teamName) {
      this._showEditorError('Team name is required.');
      return;
    }

    // Check for duplicate team IDs in the working league
    const isDuplicate = this._workingLeague.teams.some(team => 
      team._id === teamId && teamId !== this._editingTeam?._id
    );
    if (isDuplicate) {
      this._showEditorError(`A team with identifier "${teamId}" already exists in this league.`);
      return;
    }

    const teamData = {
      _id: teamId,
      name: teamName
    };

    // Update working league
    if (!this._workingLeague.teams) {
      this._workingLeague.teams = [];
    }

    if (this._editorMode === 'edit' && this._editingTeam) {
      const teamIndex = this._workingLeague.teams.findIndex(t => t._id === this._editingTeam._id);
      if (teamIndex !== -1) {
        // Update existing team
        const oldTeamId = this._editingTeam._id;
        this._workingLeague.teams[teamIndex] = teamData;
        
        // If team ID is changing, update match references
        if (oldTeamId !== teamId && this._workingLeague.matches) {
          this._workingLeague.matches = this._workingLeague.matches.map(match => {
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
        }
      }
    } else {
      // Add new team
      this._workingLeague.teams.push(teamData);
    }

    this._selectedTeamId = teamId;
    this._hideEditor();
    
    // Scroll to the newly added/edited team after render
    setTimeout(() => {
      this._scrollToSelectedTeam();
    }, 50);
  }

  _scrollToSelectedTeam() {
    if (!this._selectedTeamId) return;
    
    const teamListItem = this.shadow.querySelector(`[data-team-id="${this._selectedTeamId}"]`);
    const teamsListContainer = this.shadow.querySelector('.list-container');
    
    if (teamListItem && teamsListContainer) {
      // First try the modern scrollIntoView method
      try {
        teamListItem.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      } catch (e) {
        // Fallback for older browsers or if scrollIntoView fails
        const itemOffsetTop = teamListItem.offsetTop;
        const containerHeight = teamsListContainer.clientHeight;
        const itemHeight = teamListItem.offsetHeight;
        
        // Center the item in the container
        const scrollTop = itemOffsetTop - (containerHeight / 2) + (itemHeight / 2);
        
        // Use smooth scrolling if supported, otherwise instant
        if (teamsListContainer.scrollTo) {
          teamsListContainer.scrollTo({
            top: Math.max(0, scrollTop),
            behavior: 'smooth'
          });
        } else {
          teamsListContainer.scrollTop = Math.max(0, scrollTop);
        }
      }
    }
  }

  _showEditorError(message) {
    const errorElement = this.shadow.querySelector('#team-editor-error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  _getSwalCustomClasses() {
    const mobilePopup = this._isMobile ? 'swal-popup-mobile' : '';
    const mobileTitle = this._isMobile ? 'swal-title-mobile' : '';
    const mobileHtmlContainer = this._isMobile ? 'swal-html-container-mobile' : '';
    const mobileActions = this._isMobile ? 'swal-actions-mobile' : '';
    const mobileStyled = this._isMobile ? 'swal-styled-mobile' : '';

    return {
      popup: mobilePopup,
      title: mobileTitle,
      htmlContainer: mobileHtmlContainer,
      actions: mobileActions,
      confirmButton: mobileStyled,
      cancelButton: mobileStyled,
    };
  }

  _onCancel() {
    this.dispatchEvent(new LeagueTeamsEvent('teams-cancel', {}));
  }

  _onSave() {
    const eventDetail = {
      league: this._workingLeague
    };

    // Include fixture scheduler flag if we're in the new league workflow
    if (this._isNewLeagueWorkflow) {
      eventDetail.showFixtureScheduler = this._showFixtureScheduler;
    }

    this.dispatchEvent(new LeagueTeamsEvent('teams-save', eventDetail));
  }

  _onKeydown(e) {
    if (e.key === 'Escape') {
      this._onCancel();
      return;
    }
  }
}

// Register the custom element
import { safeDefine } from '../../utils/elementRegistry.js';

safeDefine('league-teams', LeagueTeams);

export default LeagueTeams;