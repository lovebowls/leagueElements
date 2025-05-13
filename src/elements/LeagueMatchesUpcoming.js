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

/**
 * Custom element to display upcoming fixtures with paging and optional date filtering.
 *
 * @element league-matches-upcoming
 * @attr {string} data - JSON stringified array of match objects
 * @attr {string} [selected-date] - ISO date string to filter fixtures by date
 * @attr {boolean} [is-mobile] - Whether to use mobile styles
 *
 * Emits 'league-matches-upcoming-event' with detail { type: 'matchClick', match }
 */
class LeagueMatchesUpcoming extends HTMLElement {
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
        padding: 0.5rem;
        border-bottom: 1px solid #eee;
        font-size: 1.3em;
      }
      .match-item:last-child {
        border-bottom: none;
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
      .filter-indicator {
        background-color: #e3f2fd;
        border-left: 3px solid #2196f3;
        padding: 0.3rem 0.5rem;
        margin-bottom: 0.5rem;
        font-size: 0.9em;
        color: #1976d2;
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
      ${LeagueMatchesUpcoming.BASE_STYLES}
      .panel-header {
        font-size: 1rem;
        margin-bottom: 0.3rem;
      }
      .match-item {
        padding: 0.3rem 0.2rem;
      }
      .paging-btn {
        padding: 0.2rem 0.7rem;
      }
    `;
  }

  static get DESKTOP_STYLES() {
    return `
      ${LeagueMatchesUpcoming.BASE_STYLES}
      .panel-header {
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
      }
    `;
  }

  static get TEMPLATE() {
    return `
      <div class="upcoming-fixtures">
        {{upcomingFixtures}}
      </div>
      <div class="paging-controls" id="fixtures-paging" {{showPaging}}>
        <button class="paging-btn" id="fixtures-prev" {{prevDisabled}}>&lt; Prev</button>
        <button class="paging-btn" id="fixtures-next" {{nextDisabled}}>Next &gt;</button>
      </div>
    `;
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.matches = [];
    this.currentPage = 0;
    this.itemsPerPage = 5;
    this.selectedDate = null;
  }

  static get observedAttributes() {
    return ['data', 'selected-date', 'is-mobile'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'data') {
      this.loadData(newValue);
    } else if (name === 'selected-date') {
      this.selectedDate = newValue ? new Date(newValue) : null;
      this.currentPage = 0;
      this.render();
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
    const content = this.shadow.querySelector('.upcoming-fixtures');
    if (content) {
      content.innerHTML = `<div class="error">${message}</div>`;
    }
  }

  /**
   * Returns the filtered list of upcoming fixtures, optionally filtered by selectedDate.
   * @returns {Array}
   */
  _upcomingFixturesList() {
    if (!this.matches || !Array.isArray(this.matches)) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let fixtures = this.matches
      .filter(match => {
        if (match.result) return false;
        if (!match.date) return false;
        const matchDate = new Date(match.date);
        matchDate.setHours(0, 0, 0, 0);
        return matchDate > today;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    if (this.selectedDate) {
      const filterDate = new Date(this.selectedDate);
      filterDate.setHours(0, 0, 0, 0);
      fixtures = fixtures.filter(match => {
        const matchDate = new Date(match.date);
        matchDate.setHours(0, 0, 0, 0);
        return matchDate.getTime() === filterDate.getTime();
      });
    }
    return fixtures;
  }

  _hasNextPage() {
    const list = this._upcomingFixturesList();
    return (this.currentPage + 1) * this.itemsPerPage < list.length;
  }

  /**
   * Renders the list of upcoming fixtures for the current page.
   * @returns {string}
   */
  renderUpcomingFixtures() {
    const list = this._upcomingFixturesList();
    const start = this.currentPage * this.itemsPerPage;
    const pageItems = list.slice(start, start + this.itemsPerPage);
    if (this.selectedDate && list.length === 0) {
      return '<div class="match-item">No upcoming fixtures for selected date</div>';
    }
    if (pageItems.length === 0) {
      if (list.length > 0) {
        return '<div class="match-item">No more upcoming fixtures</div>';
      }
      return '<div class="match-item">No upcoming fixtures</div>';
    }
    return pageItems.map(match => `
      <div class="match-item">
        <div class="match-date">${new Date(match.date).toLocaleDateString()}</div>
        <a href="#" class="match-link" data-match-key="${match.key}">
          ${match.homeTeamName} vs ${match.awayTeamName}
        </a>
      </div>
    `).join('');
  }

  _fillTemplate(template) {
    const showPaging = this.currentPage > 0 || this._hasNextPage();
    return template
      .replace('{{upcomingFixtures}}', this.renderUpcomingFixtures())
      .replace('{{prevDisabled}}', this.currentPage === 0 ? 'disabled' : '')
      .replace('{{nextDisabled}}', this._hasNextPage() ? '' : 'disabled')
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
    // Paging buttons
    const prevBtn = this.shadow.querySelector('#fixtures-prev');
    const nextBtn = this.shadow.querySelector('#fixtures-next');
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

  // Public API methods
  setPage(pageNumber) {
    if (pageNumber >= 0 && pageNumber !== this.currentPage) {
      this.currentPage = pageNumber;
      this.render();
    }
  }

  setSelectedDate(date) {
    this.selectedDate = date ? new Date(date) : null;
    this.currentPage = 0;
    this.render();
    this.dispatchEvent(new LeagueMatchesUpcomingEvent({
      type: 'dateChange',
      selectedDate: this.selectedDate
    }));
  }

  clearDateFilter() {
    this.setSelectedDate(null);
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
customElements.define('league-matches-upcoming', LeagueMatchesUpcoming);

export default LeagueMatchesUpcoming; 