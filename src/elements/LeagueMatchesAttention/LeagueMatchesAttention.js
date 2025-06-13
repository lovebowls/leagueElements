// Define custom event types for the LeagueMatchesAttention element
class LeagueMatchesAttentionEvent extends CustomEvent {
  constructor(detail) {
    super('league-matches-attention-event', {
      detail,
      bubbles: true, // Ensure event bubbles up through the DOM
      composed: true, // Ensure event crosses shadow DOM boundaries
      cancelable: true // Make the event cancelable
    });
  }
}

import {
    BASE_STYLES,
    MOBILE_STYLES,
    DESKTOP_STYLES,
    TEMPLATE
} from './LeagueMatchesAttention-styles.js';

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
      if (!mappingData) {
        this.teamMapping = {};
        return;
      }
      
      // Parse mapping from the attribute string
      const dataObj = typeof mappingData === 'string' ? JSON.parse(mappingData) : mappingData;
        
      // Handle either array of {_id, name} objects or direct _id -> name mapping object
      if (Array.isArray(dataObj)) {
        // Convert array of objects to a simple map
        this.teamMapping = {};
        dataObj.forEach(team => {
          if (team._id) {
            this.teamMapping[team._id] = team.name || team._id;
          }
        });
      } else {
        // Assume we already have a direct mapping object
        this.teamMapping = dataObj;
      }
    } catch (error) {
      console.error('[LeagueMatchesAttention] Error parsing team mapping:', error);
      this.teamMapping = {};
    }
  }

  // Add a utility method to get display name for a team
  getTeamDisplayName(teamId) {
    if (!teamId || !this.teamMapping) {
      return teamId;
    }
    
    // With standardized team model, teamMapping is a simple object map of _id -> name
    const teamName = this.teamMapping[teamId];
    if (teamName) {
      return teamName;
    }
    
    return teamId;
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
    const conflictingIds = this._getConflictingMatchIds();
    const getPriority = (match) => {
      const matchDateObj = match.date ? new Date(match.date) : null;
      let matchTimestamp = null;
      if (matchDateObj) {
        matchDateObj.setHours(0, 0, 0, 0);
        matchTimestamp = matchDateObj.getTime();
      }
      if (conflictingIds.has(match._id)) return 1;
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
        if (conflictingIds.has(match._id)) return true;
        if (!match.result && matchTimestamp && matchTimestamp < todayTimestamp) return true;
        if (!match.date && !match.result) return true;
        return false;
      })
      .sort((a, b) => {
        const priorityA = getPriority(a);
        const priorityB = getPriority(b);
        if (priorityA !== priorityB) return priorityA - priorityB;
        const homeTeamA = a.homeTeam?.name || '';
        const homeTeamB = b.homeTeam?.name || '';
        const awayTeamA = a.awayTeam?.name || '';
        const awayTeamB = b.awayTeam?.name || '';
        const homeCompare = homeTeamA.localeCompare(homeTeamB);
        if (homeCompare !== 0) return homeCompare;
        return awayTeamA.localeCompare(awayTeamB);
      });
  }

  /**
   * Returns a set of match IDs that are in scheduling conflict.
   * @returns {Set<string>}
   */
  _getConflictingMatchIds() {
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
    const conflictingIds = new Set();
    for (const dateKey in matchesByDate) {
      const matchesOnDay = matchesByDate[dateKey];
      if (matchesOnDay.length < 2) continue;
      const teamCounts = {};
      matchesOnDay.forEach(match => {
        const homeTeamId = match.homeTeam?._id;
        const awayTeamId = match.awayTeam?._id;
        if (homeTeamId) teamCounts[homeTeamId] = (teamCounts[homeTeamId] || 0) + 1;
        if (awayTeamId) teamCounts[awayTeamId] = (teamCounts[awayTeamId] || 0) + 1;
      });
      const conflictingTeams = Object.keys(teamCounts).filter(teamId => teamCounts[teamId] > 1);
      if (conflictingTeams.length > 0) {
        matchesOnDay.forEach(match => {
          const homeTeamId = match.homeTeam?._id;
          const awayTeamId = match.awayTeam?._id;
          if ((homeTeamId && conflictingTeams.includes(homeTeamId)) || 
              (awayTeamId && conflictingTeams.includes(awayTeamId))) {
            conflictingIds.add(match._id);
          }
        });
      }
    }
    return conflictingIds;
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
    const conflictingIds = this._getConflictingMatchIds();
    return pageItems.map(match => {
      // Get display names for teams
      const homeTeamDisplay = match.homeTeam?.name || this.getTeamDisplayName(homeTeamId);
      const awayTeamDisplay = match.awayTeam?.name || this.getTeamDisplayName(awayTeamId);
      
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
      } else if (conflictingIds.has(match._id)) {
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
          <a href="#" class="match-link list-item-text-primary" data-match-id="${match._id}"${titleAttr}${dataAttr}>
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
      <style>${isMobile ? MOBILE_STYLES : DESKTOP_STYLES}</style>
      ${this._fillTemplate(TEMPLATE)}
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
    
    matchLinks.forEach((link, index) => {
      
      link.onclick = (e) => {
        
        
        e.preventDefault();
        e.stopPropagation();
        
        const matchId = link.dataset.matchId;
        const attentionReason = link.dataset.attentionReason;
        const match = this._getMatchesRequiringAttention().find(m => m._id === matchId);
        
        if (match) {
          
          // Create and dispatch the event
          const event = new LeagueMatchesAttentionEvent({
            type: 'matchClick',
            match: match,
            attentionReason: attentionReason
          });
          
          const dispatchResult = this.dispatchEvent(event);
          
          // If the event was canceled, log it
          if (!dispatchResult) {
            console.warn('[LeagueMatchesAttention] Event was canceled by a listener');
          }
        } else {
          console.warn('[LeagueMatchesAttention] No match found for ID:', matchId);
        }
      };
      
    });
    
    // Add a global click handler to the shadow root to see if clicks are reaching it
    this.shadow.addEventListener('click', (e) => {
      if (e.target.classList.contains('match-link')) {
        console.log('[LeagueMatchesAttention] Shadow root click handler - match link clicked');
      }
    }, { capture: true });
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