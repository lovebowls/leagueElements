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

import { panelStyles, buttonStyles, listItemStyles } from './shared-styles.js';

/**
 * Custom element to display matches requiring attention with paging.
 *
 * @element league-matches-attention
 * @attr {string} data - JSON stringified array of match objects
 * @attr {boolean} [is-mobile] - Whether to use mobile styles
 * @attr {string} [team-mapping] - JSON stringified array of {value, label} objects mapping team values to display names
 *
 * Emits 'league-matches-attention-event' with detail { type: 'matchClick', match }
 */
class LeagueMatchesAttention extends HTMLElement {
  static get BASE_STYLES() {
    return `
      ${panelStyles}
      ${buttonStyles}
      ${listItemStyles}
      :host {
        display: block;
        font-family: var(--le-font-family-main, 'Open Sans', Helvetica, Arial, sans-serif);
        box-sizing: border-box;
        color: var(--le-text-color-primary, #333);
        font-size: var(--le-font-size-base, 1em);
      }
      .match-item {
        padding: var(--lae-padding-xs, 0.2rem) 0;
        display: flex;
        align-items: center;
        gap: var(--le-padding-xs, 0.25em);
      }
      .match-date {
        color: var(--le-text-color-secondary, #666);
        font-size: 0.85em;
        margin-bottom: var(--le-padding-xs, 0.2em);
      }
      .match-link {
        color: var(--le-text-color-accent, #2196f3);
        text-decoration: none;
        transition: color 0.2s;
        flex-grow: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        min-width: 0;
      }
      .match-link:hover {
        color: var(--le-text-color-accent-hover, #1976d2);
        text-decoration: underline;
      }
      .paging-controls {
        display: flex;
        justify-content: flex-end;
        gap: var(--le-padding-s, 0.5rem);
        margin-top: var(--le-padding-s, 0.5rem);
      }
      .error {
        color: var(--le-text-color-error, #ff0000);
        padding: var(--le-padding-s, 0.5rem);
        background-color: var(--le-background-color-error, #fff0f0);
        border-radius: var(--lae-border-radius-standard, 4px);
      }
      .warning-icon-future-result { color: var(--le-color-status-warning, #f39c12); }
      .warning-icon-conflict { color: var(--le-color-status-conflict, #e67e22); }
      .warning-icon-pending-result { color: var(--le-color-status-pending, #e74c3c); }
      .warning-icon-no-date { color: var(--le-color-status-info, #2196f3); }
      .warning-icon {
        font-size:1.2em;
        flex-shrink: 0;
      }
      .no-matches {
        padding: var(--le-padding-m, 1rem);
        text-align: center;
        color: var(--le-text-color-secondary, #666);
      }
    `;
  }

  static get MOBILE_STYLES() {
    return `
      ${LeagueMatchesAttention.BASE_STYLES}
      :host {
      }
      .paging-btn {
      }
      .match-item {
        font-size: 1em;
        padding: var(--lae-padding-xs, 0.2rem) 0;
      }
    `;
  }

  static get DESKTOP_STYLES() {
    return `
      ${LeagueMatchesAttention.BASE_STYLES}
      :host {
      }
      .match-item {
        font-size: 1em;
        padding: var(--lae-padding-xs, 0.2rem) 0;
      }
    `;
  }

  static get TEMPLATE() {
    return `
      <div class="attention-matches">
        {{attentionMatches}}
      </div>
      <div class="paging-controls" id="attention-paging" {{showPaging}}>
        <button class="paging-btn button-shared button-sm" id="attention-prev" {{prevDisabled}}>&lt; Prev</button>
        <button class="paging-btn button-shared button-sm" id="attention-next" {{nextDisabled}}>Next &gt;</button>
      </div>
    `;
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.matches = [];
    this.currentPage = 0;
    this.itemsPerPage = 5;
    this.teamMapping = {};
  }

  static get observedAttributes() {
    return ['data', 'is-mobile', 'team-mapping'];
  }

  connectedCallback() {
    if (this.hasAttribute('team-mapping')) {
      this._setTeamMapping(this.getAttribute('team-mapping'));
    }
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'data') {
      this.loadData(newValue);
    } else if (name === 'is-mobile') {
      this.render();
    } else if (name === 'team-mapping') {
      this._setTeamMapping(newValue);
      this.render(); // Re-render to apply new team names
    }
  }

  _setTeamMapping(mappingData) {
    try {
      if (mappingData && mappingData !== 'null' && mappingData !== 'undefined') {
        const teamMap = {};
        const teams = JSON.parse(mappingData);
        
        // Convert array of {value, label} objects to simple lookup object
        if (Array.isArray(teams)) {
          teams.forEach(team => {
            if (team && team.value && team.label) {
              teamMap[team.value] = team.label;
            }
          });
        }
        
        this.teamMapping = teamMap;
      } else {
        this.teamMapping = {};
      }
    } catch (error) {
      console.error('[LeagueMatchesAttention] Error parsing team mapping:', error);
      this.teamMapping = {};
    }
  }

  // Add a utility method to get display name for a team
  getTeamDisplayName(teamValue) {
    if (!teamValue || !this.teamMapping) {
      return teamValue;
    }
    
    // With standardized team model, teamMapping is a simple object map of value -> label
    const teamObj = this.teamMapping[teamValue];
    if (teamObj) {
      return teamObj;
    }
    
    return teamValue;
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
        return '<div class="no-matches">None</div>';
      }
      return '<div class="no-matches">None</div>';
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const conflictingKeys = this._getConflictingMatchKeys();
    return pageItems.map(match => {
      const matchKey = match.key || `${match.homeTeamName}_${match.awayTeamName}_unscheduled`;
      
      // Get display names for teams
      const homeTeamDisplay = this.getTeamDisplayName(match.homeTeamName);
      const awayTeamDisplay = this.getTeamDisplayName(match.awayTeamName);
      
      let warningSymbol = '';
      let warningClass = '';
      let tooltipText = '';
      if (match.result && match.date) {
        const matchDate = new Date(match.date);
        matchDate.setHours(0, 0, 0, 0);
        if (matchDate > today) {
          tooltipText = "Result entered for a future match date";
          warningSymbol = '&#9888;';
          warningClass = 'warning-icon-future-result';
        }
      } else if (conflictingKeys.has(match.key)) {
        tooltipText = "Scheduling conflict on this date.";
        warningSymbol = '&#9888;';
        warningClass = 'warning-icon-conflict';
      } else if (match.date && !match.result) {
        const matchDate = new Date(match.date);
        matchDate.setHours(0, 0, 0, 0);
        if (matchDate < today) {
          tooltipText = "Match date passed, result pending.";
          warningSymbol = '&#9203;';
          warningClass = 'warning-icon-pending-result';
        }
      } else if (!match.date && !match.result) {
        tooltipText = "No date set for match";
        warningSymbol = '&#128197;';
        warningClass = 'warning-icon-no-date';
      }
      const titleAttr = tooltipText ? ` title="${this.escapeHtml(tooltipText)}"` : '';
      const dataAttr = tooltipText ? ` data-attention-reason="${this.escapeHtml(tooltipText)}"` : '';
      const warningSpan = warningSymbol ? `<span class="warning-icon ${warningClass}" title="${this.escapeHtml(tooltipText)}">${warningSymbol}</span>` : '';
      
      return `
        <div class="match-item list-item-shared">
          ${warningSpan}
          <a href="#" class="match-link list-item-text-primary" data-match-key="${matchKey}"${titleAttr}${dataAttr}>
            ${this.escapeHtml(homeTeamDisplay)} vs ${this.escapeHtml(awayTeamDisplay)}
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
    console.log('[LeagueMatchesAttention] Number of .match-link elements:', matchLinks.length);
    matchLinks.forEach(link => {
      link.onclick = (e) => {
        e.preventDefault();
        const matchKey = link.dataset.matchKey;
        const attentionReason = link.dataset.attentionReason;
        const match = this._getMatchesRequiringAttention().find(m => m.key === matchKey);
        if (match) {
          console.log('[LeagueMatchesAttention] Dispatching matchClick event for match:', match, 'Reason:', attentionReason);
          this.dispatchEvent(new LeagueMatchesAttentionEvent({
            type: 'matchClick',
            match: match,
            attentionReason: attentionReason
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