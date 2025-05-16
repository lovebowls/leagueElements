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

import { panelStyles, buttonStyles, listItemStyles } from './shared-styles.js';

/**
 * Custom element to display upcoming fixtures with paging and optional date filtering.
 *
 * @element league-matches-upcoming
 * @attr {string} data - JSON stringified array of match objects
 * @attr {string} [filter-date] - ISO date string (YYYY-MM-DD) to filter fixtures by date
 * @attr {boolean} [is-mobile] - Whether to use mobile styles
 *
 * Emits 'league-matches-upcoming-event' with detail { type: 'matchClick', match }
 */
class LeagueMatchesUpcoming extends HTMLElement {
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
      .upcoming-matches-container { /* Renamed for clarity */
        /* display: flex; /* Removed as list is now the primary content */
        /* gap: var(--le-padding-s, 0.5rem); /* Removed */
      }
      .matches-list {
        list-style: none;
        padding: 0;
        margin: 0;
        max-height: 300px; /* Consider making this configurable or dynamic */
        overflow-y: auto;
      }
      .match-item {
        padding: var(--le-padding-s, 0.5rem) 0;
        border-bottom: 1px solid var(--le-border-color-light, #eee);
      }
      .match-item:last-child {
        border-bottom: none;
      }
      .match-date {
        color: var(--le-text-color-secondary, #666);
        font-size: 0.85em;
        margin-bottom: var(--le-padding-xs, 0.2em);
      }
      .match-teams { /* This class was present but not used, can be removed if still unused */
      }
      .no-matches {
        padding: var(--le-padding-m, 1rem);
        text-align: center;
        color: var(--le-text-color-secondary, #666);
      }
      /* CALENDAR STYLES ARE REMOVED FROM HERE */
      .paging-controls {
        display: flex;
        justify-content: flex-end;
        gap: var(--le-padding-s, 0.5rem);
        margin-top: var(--le-padding-s, 0.5rem);
      }
      .paging-btn {
        background: var(--lae-background-color-button, #f5f5f5);
        border: 1px solid var(--lae-border-color-dark, #ccc);
        border-radius: var(--lae-border-radius-small, 3px);
        padding: var(--le-padding-xs, 0.2rem) var(--le-padding-s, 0.7rem);
        font-size: 1em;
        cursor: pointer;
      }
      .paging-btn:disabled {
        background: var(--lae-background-color-button-disabled, #eee);
        color: var(--le-text-color-secondary, #aaa);
        cursor: not-allowed;
      }
      .filter-indicator { /* This style is now managed by LeagueCalendar or parent */
        /* Removed */
      }
      .error {
        color: var(--le-text-color-error, #ff0000); /* Using theme variable */
        padding: var(--le-padding-s, 0.5rem);
        background-color: var(--le-background-color-error, #fff0f0); /* Using theme variable */
        border-radius: var(--le-border-radius-standard, 4px);
      }
    `;
  }

  static get MOBILE_STYLES() {
    return `
      ${LeagueMatchesUpcoming.BASE_STYLES}
      .paging-btn {
        padding: 0.2rem 0.7rem;
      }
    `;
  }

  static get DESKTOP_STYLES() {
    return `
      ${LeagueMatchesUpcoming.BASE_STYLES}
    `;
  }

  static get TEMPLATE() {
    return `
      <!-- CALENDAR SECTION REMOVED -->
      <div class="upcoming-matches-container">
        <div class="matches-list" id="upcoming-matches-list">
          {{upcomingFixtures}}
        </div>
      </div>
      <div class="paging-controls" id="upcoming-paging" {{showPaging}}>
        <button class="paging-btn button-shared button-sm" id="upcoming-prev" {{prevDisabled}}>&lt; Prev</button>
        <button class="paging-btn button-shared button-sm" id="upcoming-next" {{nextDisabled}}>Next &gt;</button>
      </div>
    `;
  }

  constructor() {
    super();
    console.log('[LeagueMatchesUpcoming] constructor CALLED');
    this.shadow = this.attachShadow({ mode: 'open' });
    this.matches = [];
    this.currentPage = 0;
    this.itemsPerPage = 5;
    this._filterDate = null; // Store parsed filter date object
  }

  static get observedAttributes() {
    return ['data', 'filter-date', 'is-mobile']; // Changed 'selected-date' to 'filter-date'
  }

  connectedCallback() {
    console.log('[LeagueMatchesUpcoming] connectedCallback CALLED');
    if (this.hasAttribute('data')) {
      const initialData = this.getAttribute('data');
      this.loadData(initialData);
    }
    if (this.hasAttribute('filter-date')) {
        this._setFilterDate(this.getAttribute('filter-date'));
    } else {
      this.render(); 
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(`[LeagueMatchesUpcoming] attributeChangedCallback: ${name} changed from ${oldValue} to ${newValue}`);
    if (oldValue === newValue && name !== 'data') return;

    if (name === 'data') {
      this.loadData(newValue);
    } else if (name === 'filter-date') {
      this._setFilterDate(newValue);
    } else if (name === 'is-mobile') {
      this.render();
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

  /**
   * Loads and parses the matches data.
   * @param {string|Array} data
   */
  async loadData(data) {
    console.log('[LeagueMatchesUpcoming] loadData received:', data, 'typeof:', typeof data);
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
      const currentDateObj = new Date(match.date);
      currentDateObj.setHours(0, 0, 0, 0);
      const matchDateStr = currentDateObj.toLocaleDateString();
      let dateDisplay = '';
      if (matchDateStr !== lastDate) {
        dateDisplay = `<div class="match-date">${matchDateStr}</div>`;
        lastDate = matchDateStr;
      }
      return `
      <div class="match-item">
        ${dateDisplay}
        <a href="#" class="match-link" data-match-key="${match.key}">
          ${this.escapeHtml(match.homeTeamName)} vs ${this.escapeHtml(match.awayTeamName)}
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
      <style>${isMobile ? LeagueMatchesUpcoming.MOBILE_STYLES : LeagueMatchesUpcoming.DESKTOP_STYLES}</style>
      ${this._fillTemplate(LeagueMatchesUpcoming.TEMPLATE)}
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
        const matchKey = link.dataset.matchKey;
        const match = this.matches.find(m => m.key === matchKey);
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