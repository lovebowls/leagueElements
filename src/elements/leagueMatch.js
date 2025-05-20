// leagueMatch.js
// Modal dialog for creating/updating a match

// OR if vanilla:
// class LeagueMatch extends HTMLElement { ... }

// Import shared styles
import { buttonStyles, modalStyles, formStyles } from './shared-styles.js';

class LeagueMatchEvent extends CustomEvent {
  constructor(type, detail) {
    super(type, { detail, bubbles: true, composed: true });
  }
}

class LeagueMatch extends HTMLElement { // Or extends LitElement
  static get BASE_STYLES() { // Or static styles for LitElement
    return `
      ${buttonStyles}
      ${modalStyles}
      ${formStyles}
      :host {
        /* Host itself might be the modal-shared-overlay or contain it */
        /* If host is the overlay: */
        display: none; /* Controlled by 'open' attribute/property */
        position: fixed;
        z-index: var(--le-z-index-modal, 1001); /* Higher than admin modal if stacked */
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: var(--le-background-color-modal-overlay, rgba(0,0,0,0.4));
        /* Use flex to center the modal-shared-content if the host is the overlay */
        align-items: center;
        justify-content: center;
      }
      :host([open]) {
        display: flex; 
      }
      /* STYLES FOR .dialog-content, .dialog-header, .dialog-body, .dialog-footer REMOVED as they are covered by .modal-shared-* classes */
      /* GENERAL FORM STYLES for .form-group, label, input, select REMOVED as they are covered by .form-*-shared classes */

      /* Keep styles specific to leagueMatch.js */
      .score-inputs {
        display: flex;
        align-items: center;
        gap: var(--le-padding-s, 0.5em);
      }
      .score-inputs label {
        /* flex-basis: auto; */ /* If they were form-label-shared they'd be block */
         margin-bottom: 0; /* Override if needed */
      }
      .score-inputs input[type="number"] {
        width: 80px; /* Increased from 60px to show placeholders better */
        min-width: 80px; /* Ensure minimum width even on small screens */
        /* padding: var(--le-padding-xs, 0.25em); Already form-input-shared */
      }
      /* Remove spinner buttons from number inputs */
      .score-inputs input[type="number"]::-webkit-inner-spin-button,
      .score-inputs input[type="number"]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      .score-inputs input[type="number"] {
        -moz-appearance: textfield; /* Firefox */
      }
      /* Right-align the home score input */
      .score-inputs input[type="number"]:first-of-type {
        text-align: right;
      }
      /* Responsive adjustment for mobile */
      @media (max-width: 480px) {
        .score-inputs input[type="number"] {
          width: 70px; /* Slightly smaller on mobile but still big enough */
          min-width: 70px;
        }
      }
      #error-message-match-modal {
        color: var(--le-text-color-error, #D8000C);
        background-color: var(--le-background-color-error, #FFD2D2);
        padding: var(--le-padding-s);
        border: 1px solid var(--le-border-color-error, #D8000C);
        border-radius: var(--le-border-radius-standard);
        margin-bottom: var(--le-padding-m); 
        font-size: var(--le-font-size-small);
      }
      .attention-banner {
        background-color: var(--le-color-status-warning, #f39c12);
        color: var(--le-text-color-on-primary, #fff);
        padding: var(--le-padding-s, 0.5em);
        border-bottom: 1px solid var(--le-border-color-dark, #ccc);
        text-align: center;
        font-size: var(--le-font-size-small, 0.85em);
        border-top-left-radius: var(--le-border-radius-standard);
        border-top-right-radius: var(--le-border-radius-standard);
      }
    `;
  }

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
    this._isMobile = !!value;
    this.setAttribute('is-mobile', this._isMobile);
    this.render();
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
      this._isMobile = newValue !== null && newValue !== 'false';
      shouldRender = true;
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
   * Handle Ok button click: validate and emit 'match-save' event.
   * @private
   */
  _onOk() {
    // Values must be read BEFORE clearError, as clearError can cause a re-render
    const dateInput = this.shadowRoot.getElementById('matchDate');
    const homeTeamSelect = this.shadowRoot.getElementById('homeTeam');
    const awayTeamSelect = this.shadowRoot.getElementById('awayTeam');
    const homeShotsInput = this.shadowRoot.getElementById('homeScore');
    const awayShotsInput = this.shadowRoot.getElementById('awayScore');

    // Extremely verbose logging for these two elements:
    if (homeShotsInput) {
        // console.log('[LeagueMatch _onOk] Home Shots Input Element:', homeShotsInput); // Keep for debug if needed
        // console.log('[LeagueMatch _onOk] Home Shots Input value attribute:', homeShotsInput.getAttribute('value'));
        // console.log('[LeagueMatch _onOk] Home Shots Input .value property:', homeShotsInput.value);
    } else {
        // console.error('[LeagueMatch _onOk] Home Shots Input Element NOT FOUND'); // Keep for debug
    }

    if (awayShotsInput) {
        // console.log('[LeagueMatch _onOk] Away Shots Input Element:', awayShotsInput); // Keep for debug
        // console.log('[LeagueMatch _onOk] Away Shots Input value attribute:', awayShotsInput.getAttribute('value'));
        // console.log('[LeagueMatch _onOk] Away Shots Input .value property:', awayShotsInput.value);
    } else {
        // console.error('[LeagueMatch _onOk] Away Shots Input Element NOT FOUND'); // Keep for debug
    }

    if (!dateInput || !homeTeamSelect || !awayTeamSelect || !homeShotsInput || !awayShotsInput) {
        console.error("[LeagueMatch _onOk] Critical form element not found (overall check).");
        // No error shown yet, as clearError hasn't run. If we proceed to showError, it will render.
        // So, if elements are missing, it's best to just stop and log.
        return; 
    }

    const date = dateInput.value;
    const homeTeam = homeTeamSelect.value;
    const awayTeam = awayTeamSelect.value;
    const homeShotsStr = homeShotsInput.value.trim(); 
    const awayShotsStr = awayShotsInput.value.trim();

    this.clearError(); // Now it's safe to clear any previous error, as values are captured.
    
    // console.log('[LeagueMatch _onOk] homeShotsStr from .value:', homeShotsStr, 'awayShotsStr from .value:', awayShotsStr); // Keep for debug

    // Validation for date and teams
    if (!date) return this.showError('Date is required.');
    if (!homeTeam || !awayTeam) return this.showError('Both teams must be selected.');
    if (homeTeam === awayTeam) return this.showError('Home and away teams must be different.');

    const match = {
      ...(this._match || {}),
      date: date,
      homeTeamName: homeTeam,
      awayTeamName: awayTeam,
      result: null // Default to null, will be updated if scores are validly entered
    };

    // If both input strings are empty, result remains null (no score submitted).
    if (homeShotsStr === '' && awayShotsStr === '') {
      console.log('[LeagueMatch _onOk] Both shot inputs empty, result remains null.');
      // match.result is already null, proceed to dispatch
    } else {
      // At least one score field was not empty. Parse them, treating blank as 0.
      let homeScore = 0; // Default to 0
      if (homeShotsStr !== '') {
        homeScore = Number(homeShotsStr);
        if (isNaN(homeScore)) {
          return this.showError('Home shots must be a number.');
        }
      }

      let awayScore = 0; // Default to 0
      if (awayShotsStr !== '') {
        awayScore = Number(awayShotsStr);
        if (isNaN(awayScore)) {
          return this.showError('Away shots must be a number.');
        }
      }
      console.log('[LeagueMatch _onOk] Calculated scores - homeScore:', homeScore, 'awayScore:', awayScore);
      match.result = { 
        homeScore: homeScore,
        awayScore: awayScore 
      };
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
    // Determine if host itself should act as overlay or if it contains an overlay div.
    // For this example, host itself will be the overlay when open.
    // The actual dialog box will be modal-shared-content.

    const title = this._mode === 'edit' ? 'Edit Match' : 'Add Match';
    const homeTeamName = this._match?.homeTeamName || '';
    const awayTeamName = this._match?.awayTeamName || '';
    const matchDate = this._match?.date ? new Date(this._match.date).toISOString().split('T')[0] : '';
    const homeScore = this._match?.result?.homeScore !== undefined && this._match?.result?.homeScore !== null ? this._match.result.homeScore : '';
    const awayScore = this._match?.result?.awayScore !== undefined && this._match?.result?.awayScore !== null ? this._match.result.awayScore : '';
    const isPlayed = this._match?.result?.played !== undefined ? this._match.result.played : (homeScore !== '' || awayScore !== '');

    const teamOptions = this._teams.map(team => 
        `<option value="${this._escapeHtml(team)}" ?selected="${team === homeTeamName || team === awayTeamName}">${this._escapeHtml(team)}</option>`
    ).join('');

    const attentionBannerHTML = this._attentionReason
      ? `<div class="attention-banner">${this._escapeHtml(this._attentionReason)}</div>`
      : '';

    this.shadow.innerHTML = `
      <style>
        ${LeagueMatch.BASE_STYLES}
      </style>
      <div class="modal-shared-content ${this._open ? 'modal-is-open' : 'modal-is-closed'}" 
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
              ${this._teams.map(team => `<option value="${this._escapeHtml(team)}" ${team === homeTeamName ? 'selected' : ''}>${this._escapeHtml(team)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group-shared">
            <label for="awayTeam" class="form-label-shared">Away Team</label>
            <select id="awayTeam" class="form-select-shared">
              <option value="">Select Away Team</option>
              ${this._teams.map(team => `<option value="${this._escapeHtml(team)}" ${team === awayTeamName ? 'selected' : ''}>${this._escapeHtml(team)}</option>`).join('')}
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