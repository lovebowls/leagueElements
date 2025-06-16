// Define custom event types for the LeagueMatchesUpcoming element
class LeagueMatchesUpcomingEvent extends CustomEvent {
  constructor(detail) {
    super('league-matches-upcoming-event', {
      detail,
      bubbles: true,
      composed: true
    });
  }
}

import {
    BASE_STYLES,
    MOBILE_STYLES,
    DESKTOP_STYLES,
    TEMPLATE
} from './LeagueMatchesUpcoming-styles.js';
import { TemporalUtils } from '../../utils/temporalUtils.js';

/**
 * Custom element to display upcoming fixtures with paging and optional date filtering.
 *
 * @element league-matches-upcoming
 * @attr {string} data - JSON stringified array of match objects
 * @attr {string} [filter-date] - ISO date string (YYYY-MM-DD) to filter fixtures by date
 * @attr {boolean} [is-mobile] - Whether to use mobile styles
 * @attr {string} [team-mapping] - JSON stringified array of {value, label} objects mapping team values to display names
 *
 * Emits 'league-matches-upcoming-event' with detail { type: 'matchClick', match }
 */
class LeagueMatchesUpcoming extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.matches = [];
    this.currentPage = 0;
    this.itemsPerPage = 5;
    this._filterDate = null; // Store parsed filter date object
    this.teamMapping = {};
  }

  static get observedAttributes() {
    return ['data', 'filter-date', 'is-mobile', 'team-mapping'];
  }

  connectedCallback() {
    if (this.hasAttribute('data')) {
      const initialData = this.getAttribute('data');
      this.loadData(initialData);
    }
    if (this.hasAttribute('filter-date')) {
      this._setFilterDate(this.getAttribute('filter-date'));
    }
    if (this.hasAttribute('team-mapping')) {
      this._setTeamMapping(this.getAttribute('team-mapping'));
    } else {
      this.render(); 
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue && name !== 'data') return;

    if (name === 'data') {
      this.loadData(newValue);
    } else if (name === 'filter-date') {
      this._setFilterDate(newValue);
    } else if (name === 'is-mobile') {
      this.render();
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
            console.warn('[LeagueMatchesUpcoming] Invalid date string received for filter-date:', dateString);
            this._filterDate = null;
        }
    } else {
        this._filterDate = null;
    }
    this.currentPage = 0; // Reset page when filter changes
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
      console.error('[LeagueMatchesUpcoming] Error parsing team mapping:', error);
      this.teamMapping = {};
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
      this.dispatchEvent(new LeagueMatchesUpcomingEvent({ type: 'dataLoaded', matches: this.matches }));
    } catch (error) {
      const errorMessage = 'Failed to load fixtures data';
      this.showError(errorMessage);
      console.error('Error loading fixtures:', error);
      this.dispatchEvent(new LeagueMatchesUpcomingEvent({ type: 'error', message: errorMessage, error }));
    }
  }

  /**
   * Shows an error message in the component.
   * @param {string} message
   */
  showError(message) {
    // Ensure there's a safe place to inject the error, or add one.
    let listContainer = this.shadow.querySelector('#upcoming-matches-list');
    if (!listContainer) {
        // If the primary container isn't there, we might be in a very early error state.
        // Fallback to adding error directly to shadow, though ideally template ensures container exists.
        this.shadow.innerHTML = `<div class="error">${this.escapeHtml(message)}</div>`;
        return;
    }
    listContainer.innerHTML = `<div class="error">${this.escapeHtml(message)}</div>`;
  }

  /**
   * Returns the filtered list of fixtures.
   * If a `_filterDate` (from filter-date attribute) is set, it returns unplayed matches for that specific date.
   * Otherwise (no `_filterDate`), it returns unplayed matches scheduled for strictly after the current day.
   * The returned matches are sorted by date.
   * @returns {Array<Object>} An array of match objects.
   * @private
   */
  _upcomingFixturesList() {
    if (!this.matches || !Array.isArray(this.matches)) return [];

    let filteredMatches = this.matches.filter(match => match.date && !match.result);

    if (this._filterDate) {
      const filterDateTime = this._filterDate.getTime();
      filteredMatches = filteredMatches.filter(match => {
        const matchDateNorm = new Date(match.date);
        matchDateNorm.setHours(0, 0, 0, 0);
        return matchDateNorm.getTime() === filterDateTime;
      });
    } else {
      const todayNorm = new Date();
      todayNorm.setHours(0, 0, 0, 0);
      const todayTime = todayNorm.getTime();
      filteredMatches = filteredMatches.filter(match => {
        const matchDateNorm = new Date(match.date);
        matchDateNorm.setHours(0, 0, 0, 0);
        return matchDateNorm.getTime() > todayTime;
      });
    }
    return filteredMatches.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  _hasNextPage() {
    const list = this._upcomingFixturesList();
    return (this.currentPage + 1) * this.itemsPerPage < list.length;
  }

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

  renderUpcomingFixtures() {
    const list = this._upcomingFixturesList();
    const start = this.currentPage * this.itemsPerPage;
    const pageItems = list.slice(start, start + this.itemsPerPage);
    
    if (this._filterDate && list.length === 0) {
      return '<div class="match-item no-matches">None for selected date</div>';
    }
    if (pageItems.length === 0) {
      if (!this._filterDate && list.length === 0) {
          return '<div class="match-item no-matches">No upcoming fixtures</div>';
      }
      if (list.length > 0) {
        return '<div class="match-item no-matches">No more fixtures</div>'; // Changed message for clarity
      }
      return '<div class="match-item no-matches">None</div>';
    }
    let lastDate = null;
    return pageItems.map(match => {
      // Get display names for teams using new helper method
      const homeTeam = this.getTeamDataFromMatch(match, 'home');
      const awayTeam = this.getTeamDataFromMatch(match, 'away');
      
      const currentDateObj = new Date(match.date);
      currentDateObj.setHours(0, 0, 0, 0);
      const matchDateStr = TemporalUtils.formatDateString(currentDateObj);
      let dateDisplay = '';
      if (matchDateStr !== lastDate) {
        dateDisplay = `<div class="match-date">${matchDateStr}</div>`;
        lastDate = matchDateStr;
      }
      return `
      <div class="match-link list-item-text-primary">
        ${dateDisplay}
        <a href="#" class="match-link list-item-text-primary" data-match-id="${match._id}">
          ${this.escapeHtml(homeTeam.displayName)} vs ${this.escapeHtml(awayTeam.displayName)}
        </a>
      </div>
    `}).join('');
  }

  _fillTemplate(template) {
    const fixturesList = this._upcomingFixturesList();
    const showPaging = this.currentPage > 0 || ((this.currentPage + 1) * this.itemsPerPage < fixturesList.length);

    return template
      .replace('{{upcomingFixtures}}', this.renderUpcomingFixtures())
      .replace('{{prevDisabled}}', this.currentPage === 0 ? 'disabled' : '')
      .replace('{{nextDisabled}}', !((this.currentPage + 1) * this.itemsPerPage < fixturesList.length) ? 'disabled' : '')
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
    const prevBtn = this.shadow.querySelector('#upcoming-prev');
    const nextBtn = this.shadow.querySelector('#upcoming-next');
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
        const list = this._upcomingFixturesList(); // Re-evaluate list for accurate check
        if ((this.currentPage + 1) * this.itemsPerPage < list.length) {
          this.currentPage++;
          this.render();
        }
      };
    }
    const matchLinks = this.shadow.querySelectorAll('.match-link');
    matchLinks.forEach(link => {
      link.onclick = (e) => {
        e.preventDefault();
        const matchId = link.dataset.matchId;
        const match = this.matches.find(m => m._id === matchId);
        if (match) {
          this.dispatchEvent(new LeagueMatchesUpcomingEvent({
            type: 'matchClick',
            match: match
          }));
        }
      };
    });
  }

  // Public API methods (if any specific to this component are needed beyond attribute changes)
  setPage(pageNumber) {
    if (pageNumber >= 0 && pageNumber !== this.currentPage) {
      this.currentPage = pageNumber;
      // Potentially check against total pages derived from _upcomingFixturesList()
      this.render();
    }
  }

  // REMOVED: setSelectedDate, clearDateFilter, _getFixtureDates, _getResultDates, renderCalendar, renderCalendarFilter, setupCalendarEventListeners
  // These are now part of LeagueCalendar.js

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

customElements.define('league-matches-upcoming', LeagueMatchesUpcoming);
export default LeagueMatchesUpcoming; 