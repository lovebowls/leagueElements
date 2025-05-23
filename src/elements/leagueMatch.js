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
        .modal-shared-content {
          width: 90% !important; /* Override any fixed width from shared styles */
          max-width: 90% !important;
          margin: 10px auto;
          font-size: 16px !important; /* Base font size increase */
        }
        .modal-shared-header {
          padding: 15px;
          font-size: 18px !important;
        }
        .modal-shared-body {
          padding: 15px;
        }
        .modal-shared-footer {
          padding: 15px;
        }
        .form-label-shared {
          font-size: 16px !important;
          margin-bottom: 8px;
        }
        .form-input-shared, 
        .form-select-shared {
          font-size: 16px !important;
          padding: 10px !important;
          height: auto !important;
        }
        .form-checkbox-label-shared {
          font-size: 16px !important;
        }
        .score-inputs {
          gap: 10px;
        }
        .score-inputs input[type="number"] {
          width: 90px; /* Wider on mobile for touch targets */
          min-width: 90px;
          font-size: 16px !important;
          padding: 10px !important;
        }
        .score-inputs span {
          font-size: 18px;
          font-weight: bold;
        }
        .button-shared {
          font-size: 16px !important;
          padding: 10px 15px !important;
          min-height: 44px; /* Better touch target */
          margin: 5px;
        }
        #error-message-match-modal {
          font-size: 14px !important;
          padding: 10px;
        }
        .attention-banner {
          font-size: 14px !important;
          padding: 10px;
        }
      }
      
      /* Also add styles for when mobile-view class is applied regardless of screen size */
      .modal-shared-content.mobile-view {
        width: 90% !important; /* Override any fixed width from shared styles */
        max-width: 90% !important;
        min-width: 280px !important;
        margin: 10px auto;
        font-size: 16px !important; /* Base font size increase */
        transform: scale(1.05);
      }
      .mobile-view .modal-shared-header {
        padding: 15px;
        font-size: 20px !important;
      }
      .mobile-view .modal-shared-body {
        padding: 15px;
      }
      .mobile-view .modal-shared-footer {
        padding: 15px;
      }
      .mobile-view .form-label-shared {
        font-size: 16px !important;
        margin-bottom: 10px;
      }
      .mobile-view .form-input-shared, 
      .mobile-view .form-select-shared {
        font-size: 16px !important;
        padding: 12px !important;
        height: auto !important;
        border-radius: 6px !important;
      }
      .mobile-view .form-checkbox-label-shared {
        font-size: 16px !important;
        margin: 5px 0;
      }
      .mobile-view .score-inputs {
        gap: 15px;
        margin-top: 10px;
      }
      .mobile-view .score-inputs input[type="number"] {
        width: 100px; /* Wider on mobile for touch targets */
        min-width: 100px;
        font-size: 18px !important;
        padding: 12px !important;
        border-radius: 6px !important;
      }
      .mobile-view .score-inputs span {
        font-size: 20px;
        font-weight: bold;
      }
      .mobile-view .button-shared {
        font-size: 18px !important;
        padding: 12px 20px !important;
        min-height: 50px; /* Better touch target */
        margin: 5px;
        border-radius: 6px !important;
      }
      .mobile-view #error-message-match-modal {
        font-size: 16px !important;
        padding: 12px;
      }
      .mobile-view .attention-banner {
        font-size: 16px !important;
        padding: 12px;
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
        ${LeagueMatch.BASE_STYLES}
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