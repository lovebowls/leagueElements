// leagueMatch.js
// Modal dialog for creating/updating a match

// OR if vanilla:
// class LeagueMatch extends HTMLElement { ... }

// Import shared styles
// import { buttonStyles, modalStyles, formStyles, mobileStyles } from './shared-styles.js'; // REMOVED
import { BASE_STYLES } from './leagueMatch-styles.js';

class LeagueMatchEvent extends CustomEvent {
  constructor(type, detail) {
    super(type, { detail, bubbles: true, composed: true });
  }
}

class LeagueMatch extends HTMLElement { // Or extends LitElement
  // static get BASE_STYLES() { // Or static styles for LitElement // REMOVED
  // REMOVED ALL BASE_STYLES CONTENT
  // }

  static get observedAttributes() {
    return ['open', 'is-mobile', 'mode', 'attention-reason'];
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this._match = null;
    this._teams = [];
    this._open = false;
    console.log('[LeagueMatch] constructor, _open initialized to:', this._open);
    this._isMobile = false;
    this._mode = 'new';
    this._error = '';
    this._attentionReason = null;
    this._boundOnKeydown = this._onKeydown.bind(this);
    this._firstFocusableElement = null;
    this._lastFocusableElement = null;
  }

  /**
   * @param {Object} value
   */
  set match(value) {
    this._match = value;
    this.render();
  }
  get match() { return this._match; }

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
    console.log('[LeagueMatch] set open property. New _open value:', this._open, 'Rerender needed:', Rerender);
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
    console.log('[LeagueMatch] get open property, returning:', this._open);
    return this._open;
  }

  /**
   * @param {boolean} value
   */
  set isMobile(value) {
    const oldValue = this._isMobile;
    this._isMobile = !!value;
    console.log('[LeagueMatch] set isMobile property called with:', value, 'converted to:', this._isMobile, 'old value was:', oldValue);
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
    console.log(`[LeagueMatch] attributeChangedCallback: ${name} changed from ${oldValue} to ${newValue}`);
    if (oldValue === newValue) return;

    let shouldRender = false;
    if (name === 'open') {
      const newOpenState = newValue !== null && newValue !== 'false';
      if (this._open !== newOpenState) {
        this._open = newOpenState;
        console.log('[LeagueMatch] attributeChangedCallback for open. New _open value:', this._open);
        shouldRender = true; 
      }
    }
    if (name === 'is-mobile') {
      const newIsMobileState = newValue !== null && newValue !== 'false';
      console.log('[LeagueMatch] attributeChangedCallback for is-mobile:', 
                 'oldValue:', oldValue, 
                 'newValue:', newValue, 
                 'converted to boolean:', newIsMobileState, 
                 'current _isMobile:', this._isMobile);
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
    this.clearError();
    
    // Get values from form
    const homeTeamSelect = this.shadow.querySelector('#homeTeam');
    const awayTeamSelect = this.shadow.querySelector('#awayTeam');
    const matchDateInput = this.shadow.querySelector('#matchDate');
    const isPlayedCheckbox = this.shadow.querySelector('#isPlayed');
    const homeScoreInput = this.shadow.querySelector('#homeScore');
    const awayScoreInput = this.shadow.querySelector('#awayScore');
    
    const homeTeamId = homeTeamSelect.value;
    const awayTeamId = awayTeamSelect.value;
    const matchDate = matchDateInput.value;
    const isPlayed = isPlayedCheckbox.checked;
    const homeScore = isPlayed ? parseInt(homeScoreInput.value, 10) : null;
    const awayScore = isPlayed ? parseInt(awayScoreInput.value, 10) : null;
    
    // Validation
    let valid = true;
    
    if (!homeTeamId) {
      this.showError('Please select a home team');
      valid = false;
    } else if (!awayTeamId) {
      this.showError('Please select an away team');
      valid = false;
    } else if (homeTeamId === awayTeamId) {
      this.showError('Home and away teams cannot be the same');
      valid = false;
    } else if (!matchDate) {
      this.showError('Please enter a match date');
      valid = false;
    } else if (isPlayed && (isNaN(homeScore) || isNaN(awayScore))) {
      this.showError('Please enter valid scores');
      valid = false;
    }
    
    if (!valid) return;
    
    // Create match object
    const match = { ...this._match } || {};
    
    // Find the team objects from their IDs to get their names
    const homeTeam = this._teams.find(team => team._id === homeTeamId);
    const awayTeam = this._teams.find(team => team._id === awayTeamId);
    
    match.homeTeam = {
      _id: homeTeamId,
      name: homeTeam ? homeTeam.name : homeTeamId  // Use name if available, fallback to ID
    };
    
    match.awayTeam = {
      _id: awayTeamId,
      name: awayTeam ? awayTeam.name : awayTeamId  // Use name if available, fallback to ID
    };
    
    match.date = matchDate;
    
    // Handle result
    if (isPlayed) {
      console.log('[LeagueMatch _onOk] Played match score inputs:', homeScoreInput.value, awayScoreInput.value);
      // Only update result if both scores are valid numbers, otherwise preserve any existing result
      if (!isNaN(homeScore) && !isNaN(awayScore)) {
      match.result = { 
        homeScore: homeScore,
        awayScore: awayScore 
      };
      }
    } else {
      // If match is not played, keep date but clear result
      match.result = null;
    }
    
    console.log('[LeagueMatch _onOk] Final match object before dispatch:', JSON.parse(JSON.stringify(match)));
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
    console.log('[LeagueMatch] render() called. Current _open state:', this._open);
    
    const isMobileView = this._isMobile || false;
    console.log('[LeagueMatch] render() mobile check - attribute isMobile:', this._isMobile);
    
    // Determine if host itself should act as overlay or if it contains an overlay div.
    // For this example, host itself will be the overlay when open.
    // The actual dialog box will be modal-shared-content.

    const title = this._mode === 'edit' ? 'Edit Match' : 'Add Match';
    const homeTeamId = this._match?.homeTeam?._id || '';
    const awayTeamId = this._match?.awayTeam?._id || '';
    const matchDate = this._match?.date ? new Date(this._match.date).toISOString().split('T')[0] : '';
    const homeScore = this._match?.result?.homeScore !== undefined && this._match?.result?.homeScore !== null ? this._match.result.homeScore : '';
    const awayScore = this._match?.result?.awayScore !== undefined && this._match?.result?.awayScore !== null ? this._match.result.awayScore : '';
    const isPlayed = this._match?.result?.played !== undefined ? this._match.result.played : (homeScore !== '' || awayScore !== '');

    // ADDED CONSOLE LOG to inspect _teams structure
    console.log('[LeagueMatch] render - _teams received by modal:', JSON.stringify(this._teams));

    const attentionBannerHTML = this._attentionReason
      ? `<div class="attention-banner">${this._escapeHtml(this._attentionReason)}</div>`
      : '';

    // MODIFIED: Add mobile class to modal content
    this.shadow.innerHTML = `
      <style>
        ${BASE_STYLES}
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
                // ADDED CONSOLE LOG to inspect each team object during mapping
                console.log('[LeagueMatch] render - mapping homeTeam option:', JSON.stringify(team));
                return `<option value="${this._escapeHtml(team._id)}" ${team._id === homeTeamId ? 'selected' : ''}>${this._escapeHtml(team.name)}</option>`;
              }).join('')}
            </select>
          </div>
          <div class="form-group-shared">
            <label for="awayTeam" class="form-label-shared">Away Team</label>
            <select id="awayTeam" class="form-select-shared">
              <option value="">Select Away Team</option>
              ${this._teams.map(team => {
                // ADDED CONSOLE LOG to inspect each team object during mapping
                console.log('[LeagueMatch] render - mapping awayTeam option:', JSON.stringify(team));
                return `<option value="${this._escapeHtml(team._id)}" ${team._id === awayTeamId ? 'selected' : ''}>${this._escapeHtml(team.name)}</option>`;
              }).join('')}
            </select>
          </div>
          <div class="form-group-shared">
            <label for="matchDate" class="form-label-shared">Date</label>
            <input type="date" id="matchDate" class="form-input-shared" value="${matchDate}">
          </div>
          <div class="form-group-shared">
            <label class="form-checkbox-label-shared">
              <input type="checkbox" id="isPlayed" ${isPlayed ? 'checked' : ''}>
              Match Played?
            </label>
          </div>
          <div class="form-group-shared score-inputs-container" style="display: ${isPlayed ? 'block' : 'none'};">
            <label class="form-label-shared">Score</label> <!-- This label might need specific styling if it's for the group -->
            <div class="score-inputs">
              <input type="number" id="homeScore" class="form-input-shared" placeholder="Home" value="${homeScore}" aria-label="Home team score">
              <span>-</span>
              <input type="number" id="awayScore" class="form-input-shared" placeholder="Away" value="${awayScore}" aria-label="Away team score">
            </div>
          </div>
        </div>
        <div class="modal-shared-footer">
          <button id="ok-button" class="button-shared">OK</button>
          <button id="cancel-button" class="button-shared">Cancel</button>
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
    isPlayedCheckbox.addEventListener('change', (e) => {
      scoreInputsContainer.style.display = e.target.checked ? 'block' : 'none';
      if (!e.target.checked) {
        this.shadow.querySelector('#homeScore').value = '';
        this.shadow.querySelector('#awayScore').value = '';
      }
    });

    // Error message display update
    const errorDiv = this.shadow.querySelector('#error-message-match-modal');
    if (errorDiv) {
        errorDiv.style.display = this._error ? 'block' : 'none';
        errorDiv.textContent = this._error ? this._escapeHtml(this._error) : '';
    }

    console.log('[LeagueMatch] render() finished. Host display style should be:', this.style.display);
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

customElements.define('league-match', LeagueMatch);

export default LeagueMatch; 