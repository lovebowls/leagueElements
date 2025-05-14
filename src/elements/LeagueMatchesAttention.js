// Define custom event types for the LeagueMatchesAttention element
class LeagueMatchesAttentionEvent extends CustomEvent {
  constructor(detail) {
    super('league-matches-attention-event', {
      detail,
      bubbles: true,
      composed: true
    });
  }
}

/**
 * Custom element to display matches requiring attention with paging.
 *
 * @element league-matches-attention
 * @attr {string} data - JSON stringified array of match objects
 * @attr {boolean} [is-mobile] - Whether to use mobile styles
 *
 * Emits 'league-matches-attention-event' with detail { type: 'matchClick', match }
 */
class LeagueMatchesAttention extends HTMLElement {
  static get BASE_STYLES() {
    return `
      :host {
        display: block;
        font-family: 'Open Sans', Helvetica, Arial, sans-serif;
        box-sizing: border-box;
        color: #333;
      }
      .panel-header {
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
        color: #333;
      }
      .match-item {
        /* padding, border-bottom, font-size inherited */
      }
      .match-date {
        color: #666;
        font-size: 0.7em;
        margin-bottom: 0.2em;
      }
      .match-link {
        color: #2196f3;
        text-decoration: none;
        transition: color 0.2s;
      }
      .match-link:hover {
        color: #1976d2;
        text-decoration: underline;
      }
      .paging-controls {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
        margin-top: 0.5rem;
      }
      .paging-btn {
        background: #f5f5f5;
        border: 1px solid #ccc;
        border-radius: 3px;
        padding: 0.2rem 0.7rem;
        font-size: 1em;
        cursor: pointer;
        transition: background 0.2s;
      }
      .paging-btn:disabled {
        background: #eee;
        color: #aaa;
        cursor: not-allowed;
      }
      .error {
        color: #ff0000;
        padding: 0.5rem;
        background-color: #fff0f0;
        border-radius: 4px;
      }
    `;
  }

  static get MOBILE_STYLES() {
    return `
      ${LeagueMatchesAttention.BASE_STYLES}
      .panel-header {
        font-size: 1rem;
        margin-bottom: 0.3rem;
      }
      .paging-btn {
        padding: 0.2rem 0.7rem;
      }
    `;
  }

  static get DESKTOP_STYLES() {
    return `
      ${LeagueMatchesAttention.BASE_STYLES}
      .panel-header {
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
      }
    `;
  }

  static get TEMPLATE() {
    return `
      <div class="panel-header">Requiring Attention</div>
      <div class="attention-matches">
        {{attentionMatches}}
      </div>
      <div class="paging-controls" id="attention-paging" {{showPaging}}>
        <button class="paging-btn" id="attention-prev" {{prevDisabled}}>&lt; Prev</button>
        <button class="paging-btn" id="attention-next" {{nextDisabled}}>Next &gt;</button>
      </div>
    `;
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.matches = [];
    this.currentPage = 0;
    this.itemsPerPage = 5;
  }

  static get observedAttributes() {
    return ['data', 'is-mobile'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'data') {
      this.loadData(newValue);
    } else if (name === 'is-mobile') {
      this.render();
    }
  }

  /**
   * Loads and parses the matches data.
   * @param {string|Array} data
   */
  async loadData(data) {
    try {
      if (typeof data === 'string') {
        this.matches = JSON.parse(data);
      } else {
        this.matches = data || [];
      }
      this.currentPage = 0;
      this.render();
      this.dispatchEvent(new LeagueMatchesAttentionEvent({ type: 'dataLoaded', matches: this.matches }));
    } catch (error) {
      const errorMessage = 'Failed to load attention matches data';
      this.showError(errorMessage);
      console.error('Error loading attention matches:', error);
      this.dispatchEvent(new LeagueMatchesAttentionEvent({ type: 'error', message: errorMessage, error }));
    }
  }

  /**
   * Shows an error message in the component.
   * @param {string} message
   */
  showError(message) {
    const content = this.shadow.querySelector('.attention-matches');
    if (content) {
      content.innerHTML = `<div class="error">${message}</div>`;
    }
  }

  /**
   * Returns the filtered list of matches requiring attention, sorted by priority.
   * @returns {Array}
   */
  _getMatchesRequiringAttention() {
    if (!this.matches || !Array.isArray(this.matches)) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    // Scheduling conflict detection
    const conflictingKeys = this._getConflictingMatchKeys();
    const getPriority = (match) => {
      const matchDateObj = match.date ? new Date(match.date) : null;
      let matchTimestamp = null;
      if (matchDateObj) {
        matchDateObj.setHours(0, 0, 0, 0);
        matchTimestamp = matchDateObj.getTime();
      }
      if (conflictingKeys.has(match.key)) return 1;
      if (match.result && matchTimestamp && matchTimestamp > todayTimestamp) return 2;
      if (!match.result && matchTimestamp && matchTimestamp < todayTimestamp) return 3;
      if (!match.date && !match.result) return 4;
      return 5;
    };
    return this.matches
      .filter(match => {
        const matchDateObj = match.date ? new Date(match.date) : null;
        let matchTimestamp = null;
        if (matchDateObj) {
          matchDateObj.setHours(0, 0, 0, 0);
          matchTimestamp = matchDateObj.getTime();
        }
        if (match.result && matchTimestamp && matchTimestamp > todayTimestamp) return true;
        if (conflictingKeys.has(match.key)) return true;
        if (!match.result && matchTimestamp && matchTimestamp < todayTimestamp) return true;
        if (!match.date && !match.result) return true;
        return false;
      })
      .sort((a, b) => {
        const priorityA = getPriority(a);
        const priorityB = getPriority(b);
        if (priorityA !== priorityB) return priorityA - priorityB;
        const homeTeamA = a.homeTeamName || '';
        const homeTeamB = b.homeTeamName || '';
        const awayTeamA = a.awayTeamName || '';
        const awayTeamB = b.awayTeamName || '';
        const homeCompare = homeTeamA.localeCompare(homeTeamB);
        if (homeCompare !== 0) return homeCompare;
        return awayTeamA.localeCompare(awayTeamB);
      });
  }

  /**
   * Returns a set of match keys that are in scheduling conflict.
   * @returns {Set<string>}
   */
  _getConflictingMatchKeys() {
    if (!this.matches) return new Set();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    const futureFixtures = this.matches.filter(match => {
      if (match.result || !match.date) return false;
      const matchDate = new Date(match.date);
      matchDate.setHours(0, 0, 0, 0);
      return matchDate.getTime() >= todayTimestamp;
    });
    const matchesByDate = futureFixtures.reduce((acc, match) => {
      const matchDate = new Date(match.date);
      matchDate.setHours(0, 0, 0, 0);
      const dateKey = matchDate.getTime();
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(match);
      return acc;
    }, {});
    const conflictingKeys = new Set();
    for (const dateKey in matchesByDate) {
      const matchesOnDay = matchesByDate[dateKey];
      if (matchesOnDay.length < 2) continue;
      const teamCounts = {};
      matchesOnDay.forEach(match => {
        teamCounts[match.homeTeamName] = (teamCounts[match.homeTeamName] || 0) + 1;
        teamCounts[match.awayTeamName] = (teamCounts[match.awayTeamName] || 0) + 1;
      });
      const conflictingTeams = Object.keys(teamCounts).filter(team => teamCounts[team] > 1);
      if (conflictingTeams.length > 0) {
        matchesOnDay.forEach(match => {
          if (conflictingTeams.includes(match.homeTeamName) || conflictingTeams.includes(match.awayTeamName)) {
            conflictingKeys.add(match.key);
          }
        });
      }
    }
    return conflictingKeys;
  }

  _hasNextPage() {
    const list = this._getMatchesRequiringAttention();
    return (this.currentPage + 1) * this.itemsPerPage < list.length;
  }

  /**
   * Renders the list of matches requiring attention for the current page.
   * @returns {string}
   */
  renderAttentionMatches() {
    const matches = this._getMatchesRequiringAttention();
    const start = this.currentPage * this.itemsPerPage;
    const pageItems = matches.slice(start, start + this.itemsPerPage);
    if (pageItems.length === 0) {
      if (matches.length > 0) {
        return '<div class="match-item">None</div>';
      }
      return '<div class="match-item">None</div>';
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const conflictingKeys = this._getConflictingMatchKeys();
    return pageItems.map(match => {
      const matchKey = match.key || `${match.homeTeamName}_${match.awayTeamName}_unscheduled`;
      let warning = '';
      let tooltipText = '';
      if (match.result && match.date) {
        const matchDate = new Date(match.date);
        matchDate.setHours(0, 0, 0, 0);
        if (matchDate > today) {
          tooltipText = "Result entered for a future match date";
          warning = `<span title="${tooltipText}" style="color:#f39c12;font-size:1.2em;vertical-align:middle;margin-right:0.5em;">&#9888;</span>`;
        }
      } else if (conflictingKeys.has(match.key)) {
        tooltipText = "Scheduling conflict on this date.";
        warning = `<span title="${tooltipText}" style="color:#e67e22;font-size:1.2em;vertical-align:middle;margin-right:0.5em;">&#9888;</span>`;
      } else if (match.date && !match.result) {
        const matchDate = new Date(match.date);
        matchDate.setHours(0, 0, 0, 0);
        if (matchDate < today) {
          tooltipText = "Match date passed, result pending.";
          warning = `<span title="${tooltipText}" style="color:#e74c3c;font-size:1.2em;vertical-align:middle;margin-right:0.5em;">&#9203;</span>`;
        }
      } else if (!match.date && !match.result) {
        tooltipText = "No date set for match";
        warning = `<span title="${tooltipText}" style="color:#2196f3;font-size:1.2em;vertical-align:middle;margin-right:0.5em;">&#128197;</span>`;
      }
      const titleAttr = tooltipText ? ` title="${this.escapeHtml(tooltipText)}"` : '';
      const dataAttr = tooltipText ? ` data-attention-reason="${this.escapeHtml(tooltipText)}"` : '';
      return `
        <div class="match-item">
          ${warning}<a href="#" class="match-link" data-match-key="${matchKey}"${titleAttr}${dataAttr}>
            ${match.homeTeamName} vs ${match.awayTeamName}
          </a>
        </div>
      `;
    }).join('');
  }

  _fillTemplate(template) {
    const showPaging = this.currentPage > 0 || this._hasNextPage();
    return template
      .replace('{{attentionMatches}}', this.renderAttentionMatches())
      .replace('{{prevDisabled}}', this.currentPage === 0 ? 'disabled' : '')
      .replace('{{nextDisabled}}', this._hasNextPage() ? '' : 'disabled')
      .replace('{{showPaging}}', showPaging ? '' : 'style="display: none;"');
  }

  render() {
    const isMobile = this.getAttribute('is-mobile') === 'true';
    this.shadow.innerHTML = `
      <style>${isMobile ? LeagueMatchesAttention.MOBILE_STYLES : LeagueMatchesAttention.DESKTOP_STYLES}</style>
      ${this._fillTemplate(LeagueMatchesAttention.TEMPLATE)}
    `;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Paging buttons
    const prevBtn = this.shadow.querySelector('#attention-prev');
    const nextBtn = this.shadow.querySelector('#attention-next');
    if (prevBtn) {
      prevBtn.onclick = () => {
        if (this.currentPage > 0) {
          this.currentPage--;
          this.render();
        }
      };
    }
    if (nextBtn) {
      nextBtn.onclick = () => {
        if (this._hasNextPage()) {
          this.currentPage++;
          this.render();
        }
      };
    }
    // Match click handlers
    const matchLinks = this.shadow.querySelectorAll('.match-link');
    matchLinks.forEach(link => {
      link.onclick = (e) => {
        e.preventDefault();
        const matchKey = link.dataset.matchKey;
        const match = this._getMatchesRequiringAttention().find(m => m.key === matchKey);
        if (match) {
          this.dispatchEvent(new LeagueMatchesAttentionEvent({
            type: 'matchClick',
            match: match
          }));
        }
      };
    });
  }

  // Public API methods
  setPage(pageNumber) {
    if (pageNumber >= 0 && pageNumber !== this.currentPage) {
      this.currentPage = pageNumber;
      this.render();
    }
  }

  // Helper method for HTML escaping
  escapeHtml(unsafe = '') {
    const str = String(unsafe);
    return str
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  }
}

// Register the custom element
customElements.define('league-matches-attention', LeagueMatchesAttention);

export default LeagueMatchesAttention; 