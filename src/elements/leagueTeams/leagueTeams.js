// leagueTeams.js
// Modal dialog for creating/updating teams

import { BASE_STYLES } from './leagueTeams-styles.js';

class LeagueTeamsEvent extends CustomEvent {
  constructor(type, detail) {
    super(type, { detail, bubbles: true, composed: true });
  }
}

class LeagueTeams extends HTMLElement {
  static get observedAttributes() {
    return ['open', 'is-mobile', 'mode', 'existing-teams', 'league-teams'];
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this._team = null;
    this._existingTeams = []; // Available teams from lovebowls
    this._leagueTeams = []; // Current teams in the league
    this._open = false;
    this._isMobile = false;
    this._mode = 'new'; // 'new' or 'edit'
    this._error = '';
    this._boundOnKeydown = this._onKeydown.bind(this);
    this._firstFocusableElement = null;
    this._lastFocusableElement = null;
  }

  /**
   * @param {Object} value
   */
  set team(value) {
    this._team = value;
    this.render();
  }
  get team() { return this._team; }

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
   * @param {Array} value - Array of current teams in the league
   */
  set leagueTeams(value) {
    try {
      this._leagueTeams = typeof value === 'string' ? JSON.parse(value) : (Array.isArray(value) ? value : []);
    } catch (error) {
      console.error('Failed to parse league teams:', error);
      this._leagueTeams = [];
    }
    this.render();
  }
  get leagueTeams() { return this._leagueTeams; }

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
      setTimeout(() => this._focusFirstElement(), 0);
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

  /**
   * @param {string} value
   */
  set mode(value) {
    this._mode = value || 'new';
    this.render();
  }
  get mode() { return this._mode; }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'open':
        this.open = newValue === 'true';
        break;
      case 'is-mobile':
        this.isMobile = newValue === 'true';
        break;
      case 'mode':
        this.mode = newValue;
        break;
      case 'existing-teams':
        this.existingTeams = newValue;
        break;
      case 'league-teams':
        this.leagueTeams = newValue;
        break;
    }
  }

  connectedCallback() {
    this.render();
  }

  showError(msg) {
    this._error = msg || '';
    const errorElement = this.shadow.querySelector('#team-modal-error');
    if (errorElement) {
      errorElement.textContent = this._error;
      errorElement.style.display = this._error ? 'block' : 'none';
    }
  }

  clearError() {
    this.showError('');
  }

  _onOk() {
    this.clearError();

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
        const selectedTeam = this._existingTeams.find(t => t._id === teamId);
        teamName = selectedTeam ? selectedTeam.name : teamId;
      } else {
        this.showError('Please select a team from the dropdown.');
        return;
      }
    } else if (teamNameInput && teamNameInput.value.trim()) {
      // For simple teams, use the input as name and _id
      teamName = teamNameInput.value.trim();
      teamId = teamName;
    } else {
      this.showError('Team Name is required, either by typing a new name or selecting an existing team.');
      return;
    }

    if (!teamId || !teamName) {
      this.showError('Team name is required.');
      return;
    }

    // Check for duplicate team IDs in the current league
    const isDuplicate = this._leagueTeams.some(team => team._id === teamId && teamId !== (this._team?._id));
    if (isDuplicate) {
      this.showError(`A team with identifier "${teamId}" already exists in this league.`);
      return;
    }

    const teamData = {
      _id: teamId,
      name: teamName
    };

    // Dispatch save event
    this.dispatchEvent(new LeagueTeamsEvent('team-save', {
      team: teamData,
      mode: this._mode,
      originalTeamId: this._team?._id
    }));
  }

  _onCancel() {
    this.dispatchEvent(new LeagueTeamsEvent('team-cancel', {}));
  }

  render() {
    const mobileClass = this._isMobile ? 'mobile-view' : '';
    const title = this._mode === 'edit' ? 'Edit Team' : 'Add Team';
    
    // Determine if it's a Lovebowls team
    let isLovebowlsTeam = false;
    let currentTeamData = { _id: '', name: '' };
    
    if (this._team) {
      currentTeamData = {
        _id: this._team._id || '',
        name: this._team.name || ''
      };
      isLovebowlsTeam = this._existingTeams.some(lbTeam => lbTeam._id === currentTeamData._id);
    }
    
    // Set the checkbox label based on mode
    const checkboxLabel = (this._mode === 'edit' && !isLovebowlsTeam) 
      ? "Replace with team from lovebowls.co.uk" 
      : "Team from lovebowls";

    // Filter out lovebowls teams that are already part of the league
    let filteredTeams = this._existingTeams;
    if (this._leagueTeams && Array.isArray(this._leagueTeams)) {
      // If in edit mode, don't filter out the team we're currently editing
      const teamIdsToExclude = this._mode === 'edit' 
        ? this._leagueTeams.filter(t => t._id !== currentTeamData._id).map(t => t._id)
        : this._leagueTeams.map(t => t._id);
      
      filteredTeams = this._existingTeams.filter(team => !teamIdsToExclude.includes(team._id));
    }

    let optionsHtml = '';
    if (filteredTeams && filteredTeams.length > 0) {
      optionsHtml = filteredTeams.map(team => 
        `<option value="${team._id}" ${currentTeamData._id === team._id ? 'selected' : ''}>${team.name}</option>`
      ).join('');
    }
    
    this.shadow.innerHTML = `
      <style>
        ${BASE_STYLES}
      </style>
      <div class="modal-shared-overlay" style="display: ${this._open ? 'flex' : 'none'};">
        <div class="modal-shared-content ${mobileClass}">
          <div class="modal-shared-header">
            <h3>${title}</h3>
            <button type="button" class="modal-close-button" id="close-team-modal" aria-label="Close">&times;</button>
          </div>
          <div class="modal-shared-body" id="team-modal-body">
            <div id="team-modal-error" class="form-error-shared" style="display: none;"></div>
            
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
              ${filteredTeams.length === 0 ? '<div style="color: var(--le-text-color-error); margin-top: 0.5em;">All lovebowls teams are already in this league</div>' : ''}
            </div>

            <div id="newTeamNameGroup" class="form-group-shared" style="display: ${isLovebowlsTeam ? 'none' : 'block'};">
              <label for="teamName" class="form-label-shared">Team Name</label>
              <input type="text" id="teamName" class="form-input-shared" value="${isLovebowlsTeam ? '' : currentTeamData.name}" ${isLovebowlsTeam ? 'disabled' : ''}>
            </div>
          </div>
          <div class="modal-shared-footer">
            <button type="button" class="button-shared" id="cancel-team-button">Cancel</button>
            <button type="button" class="button-shared button-primary" id="save-team-button">Save</button>
          </div>
        </div>
      </div>
    `;

    this._attachEventListeners();
    this._updateFormState();
  }

  _attachEventListeners() {
    const closeBtn = this.shadow.querySelector('#close-team-modal');
    const cancelBtn = this.shadow.querySelector('#cancel-team-button');
    const saveBtn = this.shadow.querySelector('#save-team-button');

    if (closeBtn) closeBtn.addEventListener('click', () => this._onCancel());
    if (cancelBtn) cancelBtn.addEventListener('click', () => this._onCancel());
    if (saveBtn) saveBtn.addEventListener('click', () => this._onOk());

    // Form field event listeners
    const useExistingTeamCheckbox = this.shadow.querySelector('#useExistingTeamCheckbox');
    const existingTeamSelectGroup = this.shadow.querySelector('#existingTeamSelectGroup');
    const newTeamNameGroup = this.shadow.querySelector('#newTeamNameGroup');
    const teamNameInput = this.shadow.querySelector('#teamName');
    const existingTeamSelect = this.shadow.querySelector('#existingTeamSelect');

    if (useExistingTeamCheckbox && existingTeamSelectGroup && newTeamNameGroup && teamNameInput && existingTeamSelect) {
      useExistingTeamCheckbox.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        const filteredTeams = this._getFilteredTeams();
        
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

  _getFilteredTeams() {
    // Filter out lovebowls teams that are already part of the league
    let filteredTeams = this._existingTeams;
    if (this._leagueTeams && Array.isArray(this._leagueTeams)) {
      // If in edit mode, don't filter out the team we're currently editing
      const teamIdsToExclude = this._mode === 'edit' 
        ? this._leagueTeams.filter(t => t._id !== (this._team?._id)).map(t => t._id)
        : this._leagueTeams.map(t => t._id);
      
      filteredTeams = this._existingTeams.filter(team => !teamIdsToExclude.includes(team._id));
    }
    return filteredTeams;
  }

  _updateFormState() {
    const useExistingTeamCheckbox = this.shadow.querySelector('#useExistingTeamCheckbox');
    const useExistingTeamLabel = this.shadow.querySelector('#useExistingTeamLabel');
    const existingTeamSelectGroup = this.shadow.querySelector('#existingTeamSelectGroup');
    const newTeamNameGroup = this.shadow.querySelector('#newTeamNameGroup');
    const teamNameInput = this.shadow.querySelector('#teamName');

    if (!useExistingTeamCheckbox || !existingTeamSelectGroup || !newTeamNameGroup || !teamNameInput) {
      return;
    }

    const filteredTeams = this._getFilteredTeams();

    // Initial state based on mode and available teams
    if (!filteredTeams || filteredTeams.length === 0) {
      // Disable checkbox if no Lovebowls teams are available
      useExistingTeamCheckbox.disabled = true;
      const tooltip = this._existingTeams.length === 0 ? "No lovebowls teams available" : "All lovebowls teams are already in this league";
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

  _onKeydown(e) {
    if (e.key === 'Escape') {
      this._onCancel();
      return;
    }

    if (e.key === 'Tab') {
      this._handleTabKey(e);
    }
  }

  _handleTabKey(e) {
    const focusableElements = this.shadow.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const focusableArray = Array.from(focusableElements);
    const firstElement = focusableArray[0];
    const lastElement = focusableArray[focusableArray.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  }

  _focusFirstElement() {
    const firstFocusable = this.shadow.querySelector('input, select, button');
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }
}

// Register the custom element
customElements.define('league-teams', LeagueTeams);

export default LeagueTeams; 