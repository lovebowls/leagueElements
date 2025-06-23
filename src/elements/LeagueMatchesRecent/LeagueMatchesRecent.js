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

import {BASE_STYLES, MOBILE_STYLES, DESKTOP_STYLES, TEMPLATE} from './LeagueMatchesRecent-styles.js';
import { TemporalUtils } from '../../utils/temporalUtils.js';

class LeagueMatchesRecent extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.matches = [];
    this.currentPage = 0;
    this.itemsPerPage = 5;
    this._filterDate = null;
    this.teamMapping = {};
  }

  get _canEdit() {
    return this.getAttribute('can-edit') === 'true';
  }

  static get observedAttributes() {
    return ['data', 'filter-date', 'is-mobile', 'team-mapping', 'can-edit'];
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
    } else if (name === 'can-edit') {
      this.render(); // Re-render to apply editing permissions
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

  /**
   * Gets the team ID and display name from match data.
   * @param {Object} match - The match object
   * @param {string} teamType - Either 'home' or 'away'
   * @returns {Object} An object with id and displayName
   */
  getTeamDataFromMatch(match, teamType = 'home') {
    const isHome = teamType === 'home';
    let teamId = '';
    let displayName = '';
    
    // Match has homeTeam/awayTeam objects with _id and name
    if (isHome && match.homeTeam && match.homeTeam._id) {
      teamId = match.homeTeam._id;
      displayName = match.homeTeam.name || this.getTeamDisplayName(teamId);
    } else if (!isHome && match.awayTeam && match.awayTeam._id) {
      teamId = match.awayTeam._id;
      displayName = match.awayTeam.name || this.getTeamDisplayName(teamId);
    }
    
    return { id: teamId, displayName };
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
      
      // Get display names for teams using new helper method
      const homeTeam = this.getTeamDataFromMatch(match, 'home');
      const awayTeam = this.getTeamDataFromMatch(match, 'away');
      
      const currentDateObj = new Date(match.date);
      currentDateObj.setHours(0, 0, 0, 0); 
      const matchDateStr = TemporalUtils.formatDateString(currentDateObj);
      let dateDisplayHtml = '';
      if (matchDateStr !== lastDate) {
        dateDisplayHtml = `<div class="match-date">${matchDateStr}</div>`;
        lastDate = matchDateStr;
      }

      const editableClass = this._canEdit ? 'match-editable' : 'match-readonly';
      const linkElement = this._canEdit 
        ? `<a href="#" class="match-link list-item-text-primary">${this.escapeHtml(homeTeam.displayName)} vs ${this.escapeHtml(awayTeam.displayName)}</a>`
        : `<span class="match-text list-item-text-primary">${this.escapeHtml(homeTeam.displayName)} vs ${this.escapeHtml(awayTeam.displayName)}</span>`;

      html += `
        ${dateDisplayHtml}
        <div class="match-item list-item-shared ${editableClass}" data-match-id="${match._id}">
          ${linkElement}
          <div class="list-item-actions match-score-container">
            <span class="match-score ${homeScoreClass}">${homeScore}</span>
            <span class="match-score"> - </span>
            <span class="match-score ${awayScoreClass}">${awayScore}</span>
          </div>
        </div>
      `;
    });
    html += '</div>';
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
    const isMobile = this.getAttribute('is-mobile') === 'true';
    this.shadow.innerHTML = `
      <style>${isMobile ? MOBILE_STYLES : DESKTOP_STYLES}</style>
      ${this._fillTemplate(TEMPLATE)}
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
    matchLinks.forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        // Only handle clicks if editing is enabled
        if (!this._canEdit) {
          return;
        }
        const matchId = event.currentTarget.closest('.match-item').dataset.matchId;
        // Find the match object by _id
        const match = this.matches.find(m => m._id === matchId);
        if (match) {
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

import { safeDefine } from '../../utils/elementRegistry.js';

// Register the custom element
safeDefine('league-matches-recent', LeagueMatchesRecent);

export default LeagueMatchesRecent; 