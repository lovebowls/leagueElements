// Define custom event types for the LeagueMatchesRecent element
class LeagueMatchesRecentEvent extends CustomEvent {
  constructor(detail) {
    super('league-matches-recent-event', {
      detail,
      bubbles: true,
      composed: true
    });
  }
}

import { panelStyles, buttonStyles, listItemStyles } from './shared-styles.js';

class LeagueMatchesRecent extends HTMLElement {
  // Base styles shared between mobile and desktop layouts
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
      .matches-container {
        max-height: 300px;
        overflow-y: auto;
      }
      .match-item {
      }
      .match-date {
        color: var(--le-text-color-secondary, #666);
        font-size: 0.85em;
        margin-bottom: var(--le-padding-xs, 0.2em);
      }
      .match-details {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .match-teams {
        flex-grow: 1;
      }
      .team-name {
      }
      .match-score {
        font-weight: bold;
        margin: 0 var(--le-padding-s, 0.5rem);
        color: var(--le-text-color-primary, #333);
      }
      .match-result-indicator {
        padding: var(--le-padding-xs, 0.1em) var(--le-padding-s, 0.3em);
        border-radius: var(--le-border-radius-small, 3px);
        color: var(--le-text-color-on-primary, #fff);
        font-size: 0.8em;
        font-weight: bold;
        margin-left: var(--le-padding-s, 0.5rem);
      }
      .result-w {
        background-color: var(--le-form-color-w, #4CAF50);
      }
      .result-d {
        background-color: var(--le-form-color-d, #FFC107);
      }
      .result-l {
        background-color: var(--le-form-color-l, #F44336);
      }
      .no-matches {
        padding: var(--le-padding-m, 1rem);
        text-align: center;
        color: var(--le-text-color-secondary, #666);
      }
      .error {
        color: var(--le-text-color-error, #ff0000);
        padding: var(--le-padding-s, 0.5rem);
      }
    `;
  }

  // Mobile-specific styles
  static get MOBILE_STYLES() {
    return `
      ${LeagueMatchesRecent.BASE_STYLES}
      :host {
      }
      .match-item {
        font-size: 1em;
      }
    `;
  }

  // Desktop-specific styles
  static get DESKTOP_STYLES() {
    return `
      ${LeagueMatchesRecent.BASE_STYLES}
      :host {
      }
      .match-item {
        font-size: 1em;
      }
    `;
  }

  // Template
  static get TEMPLATE() {
    return `
      <div class="recent-results">
        {{recentResults}}
      </div>
      <div class="paging-controls" id="recent-paging" {{showPaging}}>
        <button class="paging-btn button-shared button-sm" id="recent-prev" {{prevDisabled}}>&lt; Prev</button>
        <button class="paging-btn button-shared button-sm" id="recent-next" {{nextDisabled}}>Next &gt;</button>
      </div>
    `;
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.matches = [];
    this.currentPage = 0;
    this.itemsPerPage = 5;
    this._filterDate = null;
    this.teamMapping = {};
  }

  static get observedAttributes() {
    return ['data', 'filter-date', 'is-mobile', 'team-mapping'];
  }

  connectedCallback() {
    if (this.hasAttribute('filter-date')) {
      this._setFilterDate(this.getAttribute('filter-date'));
    }
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
    } else if (name === 'filter-date') {
      this._setFilterDate(newValue);
    } else if (name === 'team-mapping') {
      this._setTeamMapping(newValue);
      this.render(); // Re-render to apply new team names
    }
  }

  _setFilterDate(dateString) {
    if (dateString && dateString !== 'null' && dateString !== 'undefined') {
      const parsed = new Date(dateString);
      if (!isNaN(parsed.getTime())) {
        this._filterDate = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
      } else {
        console.warn('[LeagueMatchesRecent] Invalid date string received for filter-date:', dateString);
        this._filterDate = null;
      }
    } else {
      this._filterDate = null;
    }
    this.currentPage = 0;
    this.render();
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
      console.error('[LeagueMatchesRecent] Error parsing team mapping:', error);
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

  async loadData(data) {
    try {
      if (typeof data === 'string') {
        this.matches = JSON.parse(data);
      } else {
        this.matches = data || [];
      }
      this.currentPage = 0; // Reset to first page when new data is loaded
      this.render();
      
      // Dispatch success event
      this.dispatchEvent(new LeagueMatchesRecentEvent({ 
        type: 'dataLoaded', 
        matches: this.matches 
      }));
    } catch (error) {
      const errorMessage = 'Failed to load matches data';
      this.showError(errorMessage);
      console.error('Error loading matches:', error);
      
      // Dispatch error event
      this.dispatchEvent(new LeagueMatchesRecentEvent({
        type: 'error',
        message: errorMessage,
        error
      }));
    }
  }

  showError(message) {
    const content = this.shadow.querySelector('.recent-results');
    if (content) {
      content.innerHTML = `<div class="error">${message}</div>`;
    }
  }

  _recentResultsList() {
    if (!this.matches || !Array.isArray(this.matches)) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let results = this.matches
      .filter(match => {
        if (!match.result || !match.date) return false;
        const matchDate = new Date(match.date);
        matchDate.setHours(0, 0, 0, 0);
        return matchDate <= today;
      });
      
    if (this._filterDate) {
      const filterDateTime = this._filterDate.getTime();
      results = results.filter(match => {
        const matchDate = new Date(match.date);
        matchDate.setHours(0, 0, 0, 0);
        return matchDate.getTime() === filterDateTime;
      });
    }
    
    return results.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  _hasNextPage() {
    const list = this._recentResultsList();
    return (this.currentPage + 1) * this.itemsPerPage < list.length;
  }

  _hasPrevPage() {
    return this.currentPage > 0;
  }

  renderRecentResults() {
    const list = this._recentResultsList();
    const startIndex = this.currentPage * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const pageItems = list.slice(startIndex, endIndex);

    if (pageItems.length === 0) {
      if (this._filterDate) {
        return '<div class="no-matches">No results for selected date.</div>';
      }
      return '<div class="no-matches">No recent match results found.</div>';
    }

    let html = '<div class="matches-container">';
    let lastDate = null;
    pageItems.forEach(match => {
      const result = match.result || {};
      const homeScore = typeof result.homeScore === 'number' ? result.homeScore : '';
      const awayScore = typeof result.awayScore === 'number' ? result.awayScore : '';
      let homeScoreClass = 'score-d', awayScoreClass = 'score-d';
      if (typeof homeScore === 'number' && typeof awayScore === 'number') {
        if (homeScore > awayScore) { homeScoreClass = 'score-w'; awayScoreClass = 'score-l'; }
        else if (homeScore < awayScore) { homeScoreClass = 'score-l'; awayScoreClass = 'score-w'; }
      }
      
      // Get display names for teams
      const homeTeamDisplay = this.getTeamDisplayName(match.homeTeamName);
      const awayTeamDisplay = this.getTeamDisplayName(match.awayTeamName);
      
      const currentDateObj = new Date(match.date);
      currentDateObj.setHours(0, 0, 0, 0); 
      const matchDateStr = currentDateObj.toLocaleDateString();
      let dateDisplayHtml = '';
      if (matchDateStr !== lastDate) {
        dateDisplayHtml = `<div class="match-date">${matchDateStr}</div>`;
        lastDate = matchDateStr;
      }

      html += `
        ${dateDisplayHtml}
        <div class="match-item list-item-shared" data-match-key="${match.key}">
          <a href="#" class="match-link list-item-text-primary">
            ${this.escapeHtml(homeTeamDisplay)} vs ${this.escapeHtml(awayTeamDisplay)}
          </a>
          <div class="list-item-actions match-score-container">
            <span class="match-score ${homeScoreClass}">${homeScore}</span>
            <span class="match-score"> - </span>
            <span class="match-score ${awayScoreClass}">${awayScore}</span>
          </div>
        </div>
      `;
    });
    html += '</div>';
    console.log('[LeagueMatchesRecent] renderRecentResults HTML:', html);
    return html;
  }

  _fillTemplate(template) {
    const showPaging = this.currentPage > 0 || this._hasNextPage();
    
    return template
      .replace('{{recentResults}}', this.renderRecentResults())
      .replace('{{prevDisabled}}', this._hasPrevPage() ? '' : 'disabled')
      .replace('{{nextDisabled}}', this._hasNextPage() ? '' : 'disabled')
      .replace('{{showPaging}}', showPaging ? '' : 'style="display: none;"');
  }

  render() {
    const isMobile = this.hasAttribute('is-mobile') === 'true';
    this.shadow.innerHTML = `
      <style>${isMobile ? LeagueMatchesRecent.MOBILE_STYLES : LeagueMatchesRecent.DESKTOP_STYLES}</style>
      ${this._fillTemplate(LeagueMatchesRecent.TEMPLATE)}
    `;
    this.setupEventListeners();
  }

  setupEventListeners() {
    const prevButton = this.shadow.getElementById('recent-prev');
    const nextButton = this.shadow.getElementById('recent-next');

    if (prevButton) {
      prevButton.addEventListener('click', () => {
        if (this._hasPrevPage()) {
          this.setPage(this.currentPage - 1);
        }
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', () => {
        if (this._hasNextPage()) {
          this.setPage(this.currentPage + 1);
        }
      });
    }

    // Setup match click handlers
    const matchLinks = this.shadow.querySelectorAll('.match-link');
    console.log('[LeagueMatchesRecent] Number of .match-link elements:', matchLinks.length);
    matchLinks.forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const matchKey = event.currentTarget.closest('.match-item').dataset.matchKey;
        // Find the match object by key
        const match = this.matches.find(m => m.key === matchKey);
        if (match) {
          console.log('[LeagueMatchesRecent] Dispatching matchClick event for match:', match);
          this.dispatchEvent(new LeagueMatchesRecentEvent({
            type: 'matchClick',
            match: match,
          }));
        }
      });
    });
  }

  setPage(pageNumber) {
    this.currentPage = pageNumber;
    this.render();
  }

  escapeHtml(unsafe = '') {
    if (unsafe === null || typeof unsafe === 'undefined') {
      return '';
    }
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
customElements.define('league-matches-recent', LeagueMatchesRecent);

export default LeagueMatchesRecent; 