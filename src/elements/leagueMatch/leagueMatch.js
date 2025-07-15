import { BASE_STYLES } from './leagueMatch-styles.js';
import { getMobileStyles, getDesktopStyles } from '../shared-styles.js';

class LeagueMatchEvent extends CustomEvent {
  constructor(type, detail) {
    super(type, { detail, bubbles: true, composed: true });
  }
}

class LeagueMatch extends HTMLElement { // Or extends LitElement

  static get observedAttributes() {
    return ['open', 'is-mobile', 'mode', 'attention-reason', 'leagueSettings']; // Added leagueSettings
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this._match = null;
    this._teams = [];
    this._open = false;
    this._isMobile = false;
    this._mode = 'new';
    this._error = '';
    this._attentionReason = null;
    this._boundOnKeydown = this._onKeydown.bind(this);
    this._firstFocusableElement = null;
    this._lastFocusableElement = null;
    
    // Rink scoring properties are derived from _leagueSettings via getters
    this._rinkResults = [];
    this._leagueSettings = {}; // Initialize _leagueSettings
  }

  /**
   * @param {Object} value
   */
  set match(value) {
    this._match = value;
    this._initializeRinkResults(); // Centralize rink results initialization
    this.render();
  }

  _initializeRinkResults() {
    if (this.rinkPointsEnabled && this._match) {
      if (this._match.result?.rinkResults && this._match.result.rinkResults.length > 0) {
        // Use existing rink results from the match if they are valid for the current number of rinks
        if (this._match.result.rinkResults.length === this.defaultRinks) {
            this._rinkResults = JSON.parse(JSON.stringify(this._match.result.rinkResults));
        } else {
            console.warn('[LeagueMatch] Mismatch between saved rinks and default rinks. Re-initializing.');
            this._rinkResults = this._generateDefaultRinkResults();
        }
      } else {
        // Initialize with default values or distribute existing simple scores
        this._rinkResults = this._generateDefaultRinkResults();
      }
    } else {
      this._rinkResults = []; // Clear if rink points not enabled or no match
    }
  }

  _generateDefaultRinkResults() {
    let results = Array.from({ length: this.defaultRinks }, (_, i) => ({
      rinkNumber: i + 1,
      homeShots: 0,
      awayShots: 0
    }));

    // If simple scores exist and we are initializing rinks for the first time for this match data,
    // attempt to distribute them. This is a basic distribution.
    if (this._match && this._match.result && (this._match.result.homeScore != null || this._match.result.awayScore != null) && 
        (!this._match.result.rinkResults || this._match.result.rinkResults.length === 0)) {
        
      const homeTotal = parseInt(this._match.result.homeScore, 10) || 0;
      const awayTotal = parseInt(this._match.result.awayScore, 10) || 0;

      if (this.defaultRinks > 0 && (homeTotal > 0 || awayTotal > 0)) {
        const homePerRink = Math.floor(homeTotal / this.defaultRinks);
        const awayPerRink = Math.floor(awayTotal / this.defaultRinks);
        let homeRemainder = homeTotal % this.defaultRinks;
        let awayRemainder = awayTotal % this.defaultRinks;

        results = results.map(rink => {
          rink.homeShots = homePerRink;
          rink.awayShots = awayPerRink;
          return rink;
        });

        for (let i = 0; i < homeRemainder; i++) {
          if (results[i]) results[i].homeShots++;
        }
        for (let i = 0; i < awayRemainder; i++) {
          if (results[i]) results[i].awayShots++;
        }
      }
    }
    return results;
  }
  get match() { return this._match; }
  
  /**
   * @param {Object} value - The league settings object
   */
  set leagueSettings(value) {
    const oldSettingsString = JSON.stringify(this._leagueSettings);
    this._leagueSettings = value && typeof value === 'object' ? value : {};
    const newSettingsString = JSON.stringify(this._leagueSettings);

    // Internal convenience properties for rink/match points have been removed.
    // The component will now use getters that read directly from _leagueSettings.

    if (newSettingsString !== oldSettingsString) {
      // If rink points are enabled and match data exists, ensure rink results are consistent
      if (this.rinkPointsEnabled && this._match) {
        // Check if defaultRinks changed or if rinkPointsEnabled status itself changed
        const oldRinkPointsEnabled = JSON.parse(oldSettingsString)?.rinkPoints?.enabled;
        const oldDefaultRinks = JSON.parse(oldSettingsString)?.rinkPoints?.defaultRinks || 4;
        if (this.rinkPointsEnabled !== oldRinkPointsEnabled || this.defaultRinks !== oldDefaultRinks) {
            this._initializeRinkResults(); // Re-initialize based on new settings
        }
      } else if (!this.rinkPointsEnabled) {
        this._rinkResults = []; // Clear rink results if rink points get disabled
      }
      if (this.open) {
        this.render();
      }
    }
  }
  get leagueSettings() { return this._leagueSettings; }

  // Getters for rink configuration, derived from leagueSettings
  get rinkPointsEnabled() { 
    return !!this._leagueSettings?.rinkPoints?.enabled;
  }

  get defaultRinks() {
    return this._leagueSettings?.rinkPoints?.defaultRinks || 4;
  }

  get pointsPerRinkWin() {
    return this._leagueSettings?.rinkPoints?.pointsPerRinkWin || 2;
  }

  get pointsPerRinkDraw() {
    return this._leagueSettings?.rinkPoints?.pointsPerRinkDraw || 1;
  }

  // Getters for match points configuration, derived from leagueSettings
  get pointsForMatchWin() {
    return this._leagueSettings?.pointsForWin || 0;
  }

  get pointsForMatchDraw() {
    return this._leagueSettings?.pointsForDraw || 0;
  }

  get pointsForMatchLoss() {
    return this._leagueSettings?.pointsForLoss || 0;
  }

  /**
   * @param {Array<string>} value
   */
  set teams(value) {
    this._teams = Array.isArray(value) ? value : [];
    this.render();
  }
  get teams() { return this._teams; }

  /**
   * @param {boolean} value
   */
  set open(value) {
    const Rerender = this._open !== !!value;
    this._open = !!value;
    this.setAttribute('open', this._open.toString());
    if (Rerender) {
        this.render();
    }

    if (this._open) {
      this.shadowRoot.addEventListener('keydown', this._boundOnKeydown);
      setTimeout(() => this._focusFirstElement(), 0);
    } else {
      this.shadowRoot.removeEventListener('keydown', this._boundOnKeydown);
    }
  }
  get open() {
    return this._open;
  }

  /**
   * @param {boolean} value
   */
  set isMobile(value) {
    const oldValue = this._isMobile;
    this._isMobile = !!value;
    this.setAttribute('is-mobile', this._isMobile ? 'true' : 'false');
    if (oldValue !== this._isMobile) {
      this.render();
    }
  }
  get isMobile() { return this._isMobile; }

  /**
   * @param {'edit'|'new'} value
   */
  set mode(value) {
    this._mode = value === 'edit' ? 'edit' : 'new';
    this.render();
  }
  get mode() { return this._mode; }

  /**
   * @param {string | null} value
   */
  set attentionReason(value) {
    if (this._attentionReason !== value) {
      this._attentionReason = value;
      this.render();
    }
  }
  get attentionReason() { return this._attentionReason; }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    let shouldRender = false;
    if (name === 'open') {
      const newOpenState = newValue !== null && newValue !== 'false';
      if (this._open !== newOpenState) {
        this._open = newOpenState;
        shouldRender = true; 
      }
    }
    if (name === 'is-mobile') {
      const newIsMobileState = newValue !== null && newValue !== 'false';
      if (this._isMobile !== newIsMobileState) {
        this._isMobile = newIsMobileState;
        shouldRender = true;
      }
    }
    if (name === 'mode') {
      this._mode = newValue === 'edit' ? 'edit' : 'new';
      shouldRender = true;
    }
    if (name === 'attention-reason') {
      this._attentionReason = newValue;
      shouldRender = true;
    }
    
    if (shouldRender) {
      this.render();
    }
  }

  connectedCallback() {
    this.render();
  }

  /**
   * Show an error message in the modal.
   * @param {string} msg
   */
  showError(msg) {
    this._error = msg;
    this.render();
  }

  /**
   * Clear the error message.
   */
  clearError() {
    this._error = '';
    this.render();
  }

  /**
   * Handle OK button click: validate and emit 'match-save' event.
   * @private
   */
  _onOk() {
    // Get form values
    const homeTeamId = this.shadow.getElementById('homeTeam')?.value;
    const awayTeamId = this.shadow.getElementById('awayTeam')?.value;
    const matchDate = this.shadow.getElementById('matchDate')?.value;
    const rinkNumber = this.shadow.getElementById('rinkNumber')?.value;
    const isPlayed = this.shadow.getElementById('isPlayed')?.checked || false;
    
    // Validate required fields
    if (!homeTeamId || !awayTeamId || !matchDate) {
      const errorMsg = 'Please fill in all required fields';
      console.error(errorMsg, { homeTeamId, awayTeamId, matchDate });
      this.showError(errorMsg);
      return;
    }
    
    if (homeTeamId === awayTeamId) {
      const errorMsg = 'Home and away teams must be different';
      console.error(errorMsg, { homeTeamId, awayTeamId });
      this.showError(errorMsg);
      return;
    }
    
    // Create match object with basic information
    const match = { ...(this._match || {}) };
    
    // Find the team objects from their IDs to get their names
    const homeTeam = this._teams.find(team => team._id === homeTeamId);
    const awayTeam = this._teams.find(team => team._id === awayTeamId);
    
    match.homeTeam = {
      _id: homeTeamId,
      name: homeTeam?.name || homeTeamId  // Use name if available, fallback to ID
    };
    
    match.awayTeam = {
      _id: awayTeamId,
      name: awayTeam?.name || awayTeamId  // Use name if available, fallback to ID
    };
    
    match.date = matchDate;
    
    // Handle optional rink number
    if (rinkNumber && rinkNumber.trim() !== '') {
      const rinkNum = parseInt(rinkNumber, 10);
      if (!isNaN(rinkNum) && rinkNum > 0) {
        match.rink = rinkNum;
      }
    } else {
      // Remove rink property if no rink is specified
      delete match.rink;
    }
    
    // Handle result if match is played
    if (isPlayed) {
      // Initialize the result object
      match.result = {
        played: true,
        rinkPointsUsed: this.rinkPointsEnabled
      };
      
      if (this.rinkPointsEnabled) {
        // Process rink-based scoring
        // Filter out any invalid rink results
        const validRinkResults = (this._rinkResults || []).filter(
          rink => rink && (rink.homeShots !== undefined || rink.awayShots !== undefined)
        );
        
        if (validRinkResults.length === 0) {
          const errorMsg = 'Please enter scores for at least one rink';
          console.error(errorMsg);
          this.showError(errorMsg);
          return;
        }
        
        // Calculate scores from rink results
        const homeScore = validRinkResults.reduce((sum, rink) => sum + (parseInt(rink.homeShots, 10) || 0), 0);
        const awayScore = validRinkResults.reduce((sum, rink) => sum + (parseInt(rink.awayShots, 10) || 0), 0);
        
        // Calculate points based on rink results
        const homePoints = this._calculateTotalPoints('home');
        const awayPoints = this._calculateTotalPoints('away');
        
        // Add scores and points to result
        match.result.homeScore = homeScore;
        match.result.awayScore = awayScore;
        match.result.homePoints = homePoints;
        match.result.awayPoints = awayPoints;
        
        // Add rink results
        match.result.rinkResults = validRinkResults.map(rink => ({
          rinkNumber: rink.rinkNumber || 0,
          homeShots: parseInt(rink.homeShots, 10) || 0,
          awayShots: parseInt(rink.awayShots, 10) || 0
        }));
        
      } else {
        // Process simple scoring (non-rink points)
        const homeScore = parseInt(this.shadow.getElementById('homeScore')?.value, 10);
        const awayScore = parseInt(this.shadow.getElementById('awayScore')?.value, 10);
        
        if (isNaN(homeScore) || isNaN(awayScore)) {
          const errorMsg = 'Please enter valid scores';
          console.error(errorMsg, { homeScore, awayScore });
          this.showError(errorMsg);
          return;
        }
        
        // Calculate points based on league settings
        const homePoints = homeScore > awayScore ? this.pointsForMatchWin : 
                          (homeScore === awayScore ? this.pointsForMatchDraw : this.pointsForMatchLoss);
        const awayPoints = awayScore > homeScore ? this.pointsForMatchWin : 
                          (homeScore === awayScore ? this.pointsForMatchDraw : this.pointsForMatchLoss);
        
        match.result.homeScore = homeScore;
        match.result.awayScore = awayScore;
        match.result.homePoints = homePoints;
        match.result.awayPoints = awayPoints;
        
      }
    } else {
      // If match is not played, keep date but clear result
      match.result = null;
    }
    
    this.dispatchEvent(new LeagueMatchEvent('match-save', { match }));
    this.open = false;
  }

  /**
   * Handle Cancel button click: emit 'match-cancel' event.
   * @private
   */
  _onCancel() {
    this.clearError();
    this.dispatchEvent(new LeagueMatchEvent('match-cancel', {}));
    this.open = false;
  }

  render() {
    const isMobileView = this._isMobile || false;
    
    // Determine if host itself should act as overlay or if it contains an overlay div.
    // For this example, host itself will be the overlay when open.
    // The actual dialog box will be modal-shared-content.

    const title = this._mode === 'edit' ? 'Edit Match' : 'Add Match';
    const homeTeamId = this._match?.homeTeam?._id || '';
    const awayTeamId = this._match?.awayTeam?._id || '';
    const matchDate = this._match?.date ? new Date(this._match.date).toISOString().split('T')[0] : '';
    const rinkNumber = this._match?.rink !== undefined && this._match?.rink !== null ? this._match.rink : '';
    const homeScore = this._match?.result?.homeScore !== undefined && this._match?.result?.homeScore !== null ? this._match.result.homeScore : '';
    const awayScore = this._match?.result?.awayScore !== undefined && this._match?.result?.awayScore !== null ? this._match.result.awayScore : '';
    const isPlayed = this._match?.result?.played !== undefined ? this._match.result.played : (homeScore !== '' || awayScore !== '');

    const attentionBannerHTML = this._attentionReason
      ? `<div class="attention-banner">${this._escapeHtml(this._attentionReason)}</div>`
      : '';

    // MODIFIED: Add mobile class to modal content
    this.shadow.innerHTML = `
      <style>
        ${BASE_STYLES}
        ${this._isMobile ? getMobileStyles() : getDesktopStyles()}
      </style>
      <div class="modal-shared-content ${this._open ? 'modal-is-open' : 'modal-is-closed'} ${isMobileView ? 'mobile-view' : ''}" 
           role="dialog" 
           aria-labelledby="match-modal-title" 
           aria-modal="true"
           style="display: ${this._open ? 'flex' : 'none'};">
        ${attentionBannerHTML} 
        <div class="modal-shared-header">
          <span id="match-modal-title">${title}</span>
          <button class="close-button-shared" id="close-match-modal" aria-label="Close dialog">&times;</button>
        </div>
        <div class="modal-shared-body">
          <div id="error-message-match-modal" style="display: ${this._error ? 'block' : 'none'};">${this._escapeHtml(this._error)}</div>
          <div class="form-group-shared">
            <label for="homeTeam" class="form-label-shared">Home Team</label>
            <select id="homeTeam" class="form-select-shared">
              <option value="">Select Home Team</option>
              ${this._teams.map(team => {
                return `<option value="${this._escapeHtml(team._id)}" ${team._id === homeTeamId ? 'selected' : ''}>${this._escapeHtml(team.name)}</option>`;
              }).join('')}
            </select>
          </div>
          <div class="form-group-shared">
            <label for="awayTeam" class="form-label-shared">Away Team</label>
            <select id="awayTeam" class="form-select-shared">
              <option value="">Select Away Team</option>
              ${this._teams.map(team => { 
                return `<option value="${this._escapeHtml(team._id)}" ${team._id === awayTeamId ? 'selected' : ''}>${this._escapeHtml(team.name)}</option>`;
              }).join('')}
            </select>
          </div>
          <div class="form-group-shared">
            <label for="matchDate" class="form-label-shared">Date</label>
            <input type="date" id="matchDate" class="form-input-shared" value="${matchDate}">
          </div>
          <div class="form-group-shared">
            <label for="rinkNumber" class="form-label-shared">Rink (Optional)</label>
            <input type="number" id="rinkNumber" class="form-input-shared" value="${rinkNumber}" placeholder="Enter rink number" min="1" max="24">
          </div>
          <div class="form-group-shared">
            <label class="form-checkbox-label-shared">
              <input type="checkbox" id="isPlayed" ${isPlayed ? 'checked' : ''}>
              Match Played?
            </label>
          </div>
          ${isPlayed ? (this.rinkPointsEnabled ? `
            <div class="rink-results-container">
              <div class="rink-results-header">
                <div class="rink-header-label">Rink</div>
                <div>${this._teams.find(team => team._id === homeTeamId)?.name || 'Home'}</div>
                <div>${this._teams.find(team => team._id === awayTeamId)?.name || 'Away'}</div>
              </div>
              ${this._renderRinkResults()} 
              <div class="rink-results-totals shots-totals">
                <div class="rink-total-label">Shots</div>
                <div id="homeTotalShots">0</div>
                <div id="awayTotalShots">0</div>
              </div>
              <div class="rink-results-totals rink-points-totals">
                <div class="rink-points-label">Rink Points</div>
                <div id="homeRinkPoints">0</div>
                <div id="awayRinkPoints">0</div>
              </div>
              <div class="rink-results-totals match-points-totals">
                <div class="rink-points-label">Match Points</div>
                <div id="homeMatchPoints">0</div>
                <div id="awayMatchPoints">0</div>
              </div>
              <div class="rink-results-totals final-total-points-totals">
                <div class="rink-points-label">Total Points</div>
                <div id="homeFinalTotalPoints">0</div>
                <div id="awayFinalTotalPoints">0</div>
              </div>
            </div>
          ` : `
            <div class="form-group-shared score-inputs-container">
              <label class="form-label-shared">Score</label> 
              <div class="score-inputs">
                <input type="number" id="homeScore" class="form-input-shared" placeholder="Home" value="${homeScore}" aria-label="Home team score">
                <span>-</span>
                <input type="number" id="awayScore" class="form-input-shared" placeholder="Away" value="${awayScore}" aria-label="Away team score">
              </div>
            </div>
          `) : ''}
          </div>
        <div class="modal-shared-footer">
          <button id="cancel-button" class="button-shared button-secondary-light">Cancel</button>
          <button id="ok-button" class="button-shared button-primary">OK</button>
        </div>
      </div>
    `;

    // Event listeners
    this.shadow.querySelector('#ok-button').addEventListener('click', () => this._onOk());
    this.shadow.querySelector('#cancel-button').addEventListener('click', () => this._onCancel());
    this.shadow.querySelector('#close-match-modal').addEventListener('click', () => this._onCancel());
    
    const homeTeamSelect = this.shadow.querySelector('#homeTeam');
    const awayTeamSelect = this.shadow.querySelector('#awayTeam');
    homeTeamSelect.addEventListener('change', () => this._updateDisabledOptions(homeTeamSelect, awayTeamSelect));
    awayTeamSelect.addEventListener('change', () => this._updateDisabledOptions(awayTeamSelect, homeTeamSelect));
    this._updateDisabledOptions(homeTeamSelect, awayTeamSelect); // Initial sync

    const isPlayedCheckbox = this.shadow.querySelector('#isPlayed');
    const scoreInputsContainer = this.shadow.querySelector('.score-inputs-container');
    const rinkResultsContainer = this.shadow.querySelector('.rink-results-container');
    
    isPlayedCheckbox.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      // Preserve the date value before re-render
      const dateInput = this.shadow.querySelector('#matchDate');
      if (dateInput) {
        this._match = this._match || {};
        this._match.date = dateInput.value || null;
      }

      if (!this._match) this._match = {}; // Ensure _match exists
      if (!this._match.result) this._match.result = {}; // Ensure _match.result exists

      this._match.result.played = isChecked;

      if (!isChecked) {
        // Clear standard score inputs if they exist in the DOM
        const homeScoreInput = this.shadow.querySelector('#homeScore');
        const awayScoreInput = this.shadow.querySelector('#awayScore');
        if (homeScoreInput) homeScoreInput.value = '';
        if (awayScoreInput) awayScoreInput.value = '';
        
        // Clear simple score in match data
        if (this._match.result) {
          this._match.result.homeScore = null;
          this._match.result.awayScore = null;
        }

        // Clear rink results data
        if (this.rinkPointsEnabled) {
          this._rinkResults = this._rinkResults.map(rink => ({
            ...rink,
            homeShots: '', // Clear to empty string for input fields
            awayShots: ''  // Clear to empty string for input fields
          }));
        }
      }
      // Re-render the component to reflect the change
      this.render();
    });
    
    // Initialize rink results if needed when rinkPoints is enabled
    if (this.rinkPointsEnabled) {
      if (this._rinkResults.length === 0) {
        // Initialize with default values if no results exist
        this._rinkResults = Array.from({ length: this.defaultRinks }, (_, i) => ({
          rinkNumber: i + 1,
          homeShots: 0,
          awayShots: 0
        }));
      } else if (this._rinkResults.length !== this.defaultRinks) {
        // Adjust the number of rinks if defaultRinks has changed
        if (this._rinkResults.length < this.defaultRinks) {
          // Add new rinks
          const newRinks = Array.from(
            { length: this.defaultRinks - this._rinkResults.length },
            (_, i) => ({
              rinkNumber: this._rinkResults.length + i + 1,
              homeShots: 0,
              awayShots: 0
            })
          );
          this._rinkResults = [...this._rinkResults, ...newRinks];
        } else {
          // Remove extra rinks
          this._rinkResults = this._rinkResults.slice(0, this.defaultRinks);
        }
      }
    }

    // Add event listeners for rink inputs
    if (this.rinkPointsEnabled) {
      const rinkInputs = this.shadow.querySelectorAll('.rink-input');
      rinkInputs.forEach(input => {
        input.addEventListener('input', (e) => {
          const rinkNum = parseInt(e.target.dataset.rink, 10);
          const team = e.target.dataset.team;
          const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
          
          // Update the rink results
          const rinkIndex = this._rinkResults.findIndex(r => r.rinkNumber === rinkNum);
          this._onRinkInput(rinkIndex, team, value);
        });
      });
      
      // Update totals after initial render
      this._updateRinkTotals();
    }

    // Error message display update
    const errorDiv = this.shadow.querySelector('#error-message-match-modal');
    if (errorDiv) {
        errorDiv.style.display = this._error ? 'block' : 'none';
        errorDiv.textContent = this._error ? this._escapeHtml(this._error) : '';
    }

  }

  /**
   * Handles input changes for rink results
   * @param {number} rinkIndex - Index of the rink in the _rinkResults array
   * @param {string} field - Field to update ('homeShots' or 'awayShots')
   * @param {string|number} value - New value for the field
   */
  _onRinkInput(rinkIndex, field, value) {
    if (rinkIndex < 0 || !this._rinkResults[rinkIndex]) {
      console.warn(`Invalid rink index: ${rinkIndex}`);
      return;
    }
    
    // Convert value to number and ensure it's not negative
    const numValue = Math.max(0, parseInt(value, 10) || 0);
    
    // Only update if the value has changed
    if (this._rinkResults[rinkIndex][field] === numValue) {
      return; // No change needed
    }
    
    // Update the rink result
    this._rinkResults[rinkIndex][field] = numValue;
    
    // Find the rink by number in case the index has changed
    const rinkNumber = this._rinkResults[rinkIndex].rinkNumber;
    
    // Update the input value to ensure it's a valid number
    const input = this.shadowRoot?.querySelector(
      `.rink-input[data-rink="${rinkNumber}"][data-team="${field}"]`
    );
    
    if (input) {
      // Only update if the value is different to avoid cursor jumping
      if (parseInt(input.value, 10) !== numValue) {
        input.value = numValue || '';
      }
    } else {
      console.warn(`Input not found for rink ${rinkNumber}, field ${field}`);
    }
    
    // Update the totals display
    this._updateRinkTotals();
    
    // Ensure the match played checkbox is checked when entering scores
    const isPlayedCheckbox = this.shadow.querySelector('#isPlayed');
    if (isPlayedCheckbox && !isPlayedCheckbox.checked) {
      isPlayedCheckbox.checked = true;
      // Trigger change event to update the UI
      isPlayedCheckbox.dispatchEvent(new Event('change'));
    }
  }
  
  /**
   * Renders the rink results rows
   * @returns {string} HTML string for the rink results
   */
  _renderRinkResults() {
    if (!this._rinkResults || this._rinkResults.length === 0) {
      console.warn('No rink results to render');
      return '';
    }
    
    return this._rinkResults
      .sort((a, b) => (a.rinkNumber || 0) - (b.rinkNumber || 0))
      .map((rink, index) => {
        const rinkNumber = rink.rinkNumber || index + 1;
        const homeShots = rink.homeShots != null ? rink.homeShots : '';
        const awayShots = rink.awayShots != null ? rink.awayShots : '';
        
        // Ensure the values are valid numbers or empty strings for the input
        const homeValue = homeShots === '' ? '' : parseInt(homeShots, 10);
        const awayValue = awayShots === '' ? '' : parseInt(awayShots, 10);
        
        return `
          <div class="rink-result-row" data-rink-number="${rinkNumber}">
            <div class="rink-number">${rinkNumber}</div>
            <div class="rink-home">
              <input type="number" 
                     class="rink-input form-input-shared" 
                     min="0" 
                     value="${homeValue}" 
                     data-rink="${rinkNumber}"
                     data-team="homeShots"
                     aria-label="Rink ${rinkNumber} home shots">
            </div>
            <div class="rink-away">
              <input type="number" 
                     class="rink-input form-input-shared" 
                     min="0" 
                     value="${awayValue}" 
                     data-rink="${rinkNumber}"
                     data-team="awayShots"
                     aria-label="Rink ${rinkNumber} away shots">
            </div>
          </div>
        `;
      })
      .join('');
  }
  
  /**
   * Formats a number for display, removing trailing `.0`.
   * @param {number} num The number to format.
   * @returns {string} The formatted number as a string.
   */
  _formatNumber(num) {
    if (typeof num !== 'number') {
      return num;
    }
    // Converts to string with 1 decimal place, then removes it if it's '.0'
    return num.toFixed(1).replace(/\.0$/, '');
  }

  /**
   * Updates the total shots and points based on rink results
   */
  _updateRinkTotals() {
    // Only proceed if rink points are enabled and we have results
    if (!this.rinkPointsEnabled || !this._rinkResults?.length) {
      console.debug('[LeagueMatch] Skipping rink totals update - rink points not enabled or no results');
      return;
    }

    // Check if we have the required DOM elements before proceeding
    const totalsContainer = this.shadowRoot?.querySelector('.rink-results-container');
    if (!totalsContainer) {
      console.debug('[LeagueMatch] Skipping rink totals update - rink results container not found');
      return;
    }

    console.debug('[LeagueMatch] Updating rink totals with results:', JSON.stringify(this._rinkResults));

    let homeTotalShots = 0;
    let awayTotalShots = 0;
    let homeRinkPoints = 0;
    let awayRinkPoints = 0;

    this._rinkResults.forEach(rink => {
      if (!rink) return;
      const homeShots = typeof rink.homeShots === 'number' ? rink.homeShots : parseInt(rink.homeShots, 10) || 0;
      const awayShots = typeof rink.awayShots === 'number' ? rink.awayShots : parseInt(rink.awayShots, 10) || 0;

      homeTotalShots += homeShots;
      awayTotalShots += awayShots;

      if (homeShots > awayShots) {
        homeRinkPoints += this.pointsPerRinkWin;
      } else if (awayShots > homeShots) {
        awayRinkPoints += this.pointsPerRinkWin;
      } else if (homeShots > 0 || awayShots > 0) { // Count draw if any shots played
        homeRinkPoints += this.pointsPerRinkDraw;
        awayRinkPoints += this.pointsPerRinkDraw;
      }
    });

    console.debug(`[LeagueMatch] Calculated Rink Totals - Home: ${homeTotalShots} shots, ${homeRinkPoints} rink points | Away: ${awayTotalShots} shots, ${awayRinkPoints} rink points`);

    // Calculate Match Points
    let homeMatchPoints = 0;
    let awayMatchPoints = 0;

    if (homeTotalShots > awayTotalShots) {
      homeMatchPoints = this.pointsForMatchWin;
      awayMatchPoints = this.pointsForMatchLoss;
    } else if (awayTotalShots > homeTotalShots) {
      awayMatchPoints = this.pointsForMatchWin;
      homeMatchPoints = this.pointsForMatchLoss;
    } else if (homeTotalShots > 0 || awayTotalShots > 0) { // Match draw, but only if played (not 0-0)
      homeMatchPoints = this.pointsForMatchDraw;
      awayMatchPoints = this.pointsForMatchDraw;
    }
    console.debug(`[LeagueMatch] Calculated Match Points - Home: ${homeMatchPoints}, Away: ${awayMatchPoints}`);

    // Calculate Final Total Points
    const homeFinalTotalPoints = homeRinkPoints + homeMatchPoints;
    const awayFinalTotalPoints = awayRinkPoints + awayMatchPoints;
    console.debug(`[LeagueMatch] Calculated Final Total Points - Home: ${homeFinalTotalPoints}, Away: ${awayFinalTotalPoints}`);


    const updateElement = (id, value) => {
      const el = this.shadowRoot?.getElementById(id);
      if (el) {
        el.textContent = value;
      } else {
        console.warn(`[LeagueMatch] Element with ID ${id} not found for updating totals.`);
      }
    };

    // Update score inputs if they exist (for non-rinkPoints mode, though this function is usually for rinkPoints mode)
    const homeScoreInput = this.shadow.querySelector('#homeScore');
    const awayScoreInput = this.shadow.querySelector('#awayScore');
    if (homeScoreInput) homeScoreInput.value = homeTotalShots || '';
    if (awayScoreInput) awayScoreInput.value = awayTotalShots || '';

    // Update the totals display only if elements exist
    const elementsToUpdate = [
      { id: 'homeTotalShots', value: homeTotalShots },
      { id: 'awayTotalShots', value: awayTotalShots },
      { id: 'homeRinkPoints', value: this._formatNumber(homeRinkPoints) },
      { id: 'awayRinkPoints', value: this._formatNumber(awayRinkPoints) },
      { id: 'homeMatchPoints', value: this._formatNumber(homeMatchPoints) },
      { id: 'awayMatchPoints', value: this._formatNumber(awayMatchPoints) },
      { id: 'homeFinalTotalPoints', value: this._formatNumber(homeFinalTotalPoints) },
      { id: 'awayFinalTotalPoints', value: this._formatNumber(awayFinalTotalPoints) }
    ];
    
    elementsToUpdate.forEach(({ id, value }) => {
      const element = this.shadowRoot?.getElementById(id);
      if (element) {
        element.textContent = value;
      } else {
        console.debug(`[LeagueMatch] Element with ID ${id} not found for updating totals.`);
      }
    });

    console.debug('[LeagueMatch] All rink totals updated in DOM.', {
      homeTotalShots,
      awayTotalShots,
      homeRinkPoints: this._formatNumber(homeRinkPoints),
      awayRinkPoints: this._formatNumber(awayRinkPoints),
      homeMatchPoints: this._formatNumber(homeMatchPoints),
      awayMatchPoints: this._formatNumber(awayMatchPoints),
      homeFinalTotalPoints: this._formatNumber(homeFinalTotalPoints),
      awayFinalTotalPoints: this._formatNumber(awayFinalTotalPoints),
    });
  } 
  
  /**
   * Calculates the total shots for a team
   * @param {'home'|'away'} team - The team to calculate shots for
   * @returns {number} Total shots
   */
  _calculateTotalShots(team) {
    if (!this._rinkResults?.length) {
      return 0;
    }
    
    const field = team === 'home' ? 'homeShots' : 'awayShots';
    let total = 0;
    
    for (const rink of this._rinkResults) {
      total += parseInt(rink[field], 10) || 0;
    }
    
    return total;
  }
  
  /**
   * Calculates the total points for a team based on rink results
   * @param {'home'|'away'} team - The team to calculate points for
   * @returns {number} Total points
   */
  _calculateTotalPoints(team) {
    if (!this.rinkPointsEnabled || !this._rinkResults?.length) {
      return 0;
    }
    
    const isHome = team === 'home';
    let points = 0;
    
    for (const rink of this._rinkResults) {
      const homeShots = parseInt(rink.homeShots, 10) || 0;
      const awayShots = parseInt(rink.awayShots, 10) || 0;
      
      if (homeShots > awayShots && isHome) {
        points += this.pointsPerRinkWin;
      } else if (awayShots > homeShots && !isHome) {
        points += this.pointsPerRinkWin;
      } else if (homeShots === awayShots && homeShots > 0) {
        points += this.pointsPerRinkDraw;
      }
    }
    
    return points;
  }

  _onKeydown(e) {
    if (!this._open) return;

    const focusableElements = Array.from(this.shadowRoot.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )).filter(el => el.offsetParent !== null && !el.disabled);

    if (focusableElements.length === 0) return;

    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    if (e.key === 'Tab') {
      if (e.shiftKey) { // Shift + Tab
        if (this.shadowRoot.activeElement === firstFocusableElement) {
          e.preventDefault();
          lastFocusableElement.focus();
        }
      } else { // Tab
        if (this.shadowRoot.activeElement === lastFocusableElement) {
          e.preventDefault();
          firstFocusableElement.focus();
        }
      }
    } else if (e.key === 'Escape') {
      this._onCancel();
    }
  }

  _escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  _focusFirstElement() {
    if (!this._open) return;
    const focusableElements = Array.from(this.shadowRoot.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )).filter(el => el.offsetParent !== null && !el.disabled);
    
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }

  _updateDisabledOptions(changedSelect, otherSelect) {
    const changedValue = changedSelect.value;
    Array.from(otherSelect.options).forEach(option => {
      option.disabled = option.value === changedValue && changedValue !== '';
    });
  }
}

import { safeDefine } from '../../utils/elementRegistry.js';

safeDefine('league-match', LeagueMatch);

export default LeagueMatch; 