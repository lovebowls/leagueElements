// leagueMatch.js
// Modal dialog for creating/updating a match

class LeagueMatchEvent extends CustomEvent {
  constructor(type, detail) {
    super(type, { detail, bubbles: true, composed: true });
  }
}

class LeagueMatch extends HTMLElement {
  static get BASE_STYLES() {
    return `
      :host {
        display: block;
      }
      .modal-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.4);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow-y: auto;
      }
      .modal {
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        max-width: 95vw;
        min-width: 280px;
        width: 400px;
        padding: 0;
        display: flex;
        flex-direction: column;
        position: relative;
        animation: fadeIn 0.2s;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(40px); }
        to { opacity: 1; transform: none; }
      }
      .modal-header {
        padding: 1rem 1.5rem 0.5rem 1.5rem;
        font-weight: bold;
        font-size: 1.2rem;
        border-bottom: 1px solid #eee;
      }
      .modal-body {
        padding: 1rem 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .modal-footer {
        padding: 1rem 1.5rem;
        border-top: 1px solid #eee;
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
      }
      label {
        font-weight: 500;
      }
      select, input[type="number"], input[type="date"] {
        padding: 0.4rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1rem;
      }
      .error {
        color: #d8000c;
        background: #ffd2d2;
        border: 1px solid #d8000c;
        border-radius: 4px;
        padding: 0.5rem;
        margin-bottom: 0.5rem;
      }
      @media (max-width: 600px) {
        .modal {
          width: 98vw;
          min-width: unset;
          max-width: 100vw;
          padding: 0;
        }
        .modal-header, .modal-body, .modal-footer {
          padding-left: 1rem;
          padding-right: 1rem;
        }
      }
    `;
  }

  static get observedAttributes() {
    return ['open', 'isMobile', 'mode'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._match = null;
    this._teams = [];
    this._open = false;
    this._isMobile = false;
    this._mode = 'new';
    this._error = '';
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
    this._open = !!value;
    this.render();
  }
  get open() { return this._open; }

  /**
   * @param {boolean} value
   */
  set isMobile(value) {
    this._isMobile = !!value;
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

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'open') this._open = newValue !== null && newValue !== 'false';
    if (name === 'isMobile') this._isMobile = newValue !== null && newValue !== 'false';
    if (name === 'mode') this._mode = newValue === 'edit' ? 'edit' : 'new';
    this.render();
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
    const dateInput = this.shadowRoot.getElementById('match-date');
    const homeTeamSelect = this.shadowRoot.getElementById('match-home');
    const awayTeamSelect = this.shadowRoot.getElementById('match-away');
    const homeShotsInput = this.shadowRoot.getElementById('match-home-shots');
    const awayShotsInput = this.shadowRoot.getElementById('match-away-shots');

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
    if (!this._open) {
      this.shadowRoot.innerHTML = '';
      return;
    }
    const isMobile = this._isMobile;
    const match = this._match || {};
    const teams = this._teams || [];
    const mode = this._mode;
    const error = this._error;
    // Pre-fill values
    const dateVal = match.date ? new Date(match.date).toISOString().slice(0,10) : '';
    const homeTeamVal = match.homeTeamName || '';
    const awayTeamVal = match.awayTeamName || '';
    const homeShotsVal = match.result && typeof match.result.homeScore === 'number' ? match.result.homeScore : '';
    const awayShotsVal = match.result && typeof match.result.awayScore === 'number' ? match.result.awayScore : '';

    // Build team options for Home Team dropdown
    const homeTeamOptions = ['<option value="">-- Select Team --</option>']
      .concat(teams.map(t => 
        `<option value="${this._escapeHtml(t)}" ${t === homeTeamVal ? 'selected' : ''} ${t === awayTeamVal ? 'disabled' : ''}>${this._escapeHtml(t)}</option>`
      )).join('');

    // Build team options for Away Team dropdown
    const awayTeamOptions = ['<option value="">-- Select Team --</option>']
      .concat(teams.map(t => 
        `<option value="${this._escapeHtml(t)}" ${t === awayTeamVal ? 'selected' : ''} ${t === homeTeamVal ? 'disabled' : ''}>${this._escapeHtml(t)}</option>`
      )).join('');

    // Modal HTML
    this.shadowRoot.innerHTML = `
      <style>${LeagueMatch.BASE_STYLES}</style>
      <div class="modal-overlay" role="dialog" aria-modal="true">
        <div class="modal" tabindex="-1">
          <div class="modal-header">${mode === 'edit' ? 'Edit Match' : 'Add Match'}</div>
          <form class="modal-body" autocomplete="off">
            ${error ? `<div class="error">${this._escapeHtml(error)}</div>` : ''}
            <div class="form-group">
              <label for="match-date">Date</label>
              <input type="date" id="match-date" name="date" value="${dateVal}" required />
            </div>
            <div class="form-group">
              <label for="match-home">Home Team</label>
              <select id="match-home" name="homeTeam" required>${homeTeamOptions}</select>
            </div>
            <div class="form-group">
              <label for="match-away">Away Team</label>
              <select id="match-away" name="awayTeam" required>${awayTeamOptions}</select>
            </div>
            <div class="form-group">
              <label for="match-home-shots">Home Shots</label>
              <input type="number" id="match-home-shots" name="homeShots" min="0" value="${homeShotsVal}" />
            </div>
            <div class="form-group">
              <label for="match-away-shots">Away Shots</label>
              <input type="number" id="match-away-shots" name="awayShots" min="0" value="${awayShotsVal}" />
            </div>
          </form>
          <div class="modal-footer">
            <button type="button" id="cancel-btn">Cancel</button>
            <button type="button" id="ok-btn">OK</button>
          </div>
        </div>
      </div>
    `;
    // Event listeners
    this.shadowRoot.getElementById('ok-btn').onclick = () => this._onOk();
    this.shadowRoot.getElementById('cancel-btn').onclick = () => this._onCancel();
    // Dynamic update for disabled options on change
    const homeSelect = this.shadowRoot.getElementById('match-home');
    const awaySelect = this.shadowRoot.getElementById('match-away');
    homeSelect.addEventListener('change', () => this._updateDisabledOptions(homeSelect, awaySelect));
    awaySelect.addEventListener('change', () => this._updateDisabledOptions(awaySelect, homeSelect));
    
    // Add input event listeners for shot fields for live logging
    const homeShotsInputEl = this.shadowRoot.getElementById('match-home-shots');
    const awayShotsInputEl = this.shadowRoot.getElementById('match-away-shots');

    if (homeShotsInputEl) {
        homeShotsInputEl.addEventListener('input', (e) => {
            console.log('[LeagueMatch homeShots INPUT]', e.target.value);
        });
    }
    if (awayShotsInputEl) {
        awayShotsInputEl.addEventListener('input', (e) => {
            console.log('[LeagueMatch awayShots INPUT]', e.target.value);
        });
    }

    // Trap focus inside modal
    this._trapFocus();
  }

  _escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  _trapFocus() {
    // Trap focus inside modal for accessibility
    const focusable = this.shadowRoot.querySelectorAll('button, [tabindex]:not([tabindex="-1"]), input, select');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    this.shadowRoot.addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      } else if (e.key === 'Escape') {
        this._onCancel();
      }
    });
    // Focus first input
    setTimeout(() => { first.focus(); }, 0);
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