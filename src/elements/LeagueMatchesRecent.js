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

class LeagueMatchesRecent extends HTMLElement {
  // Base styles shared between mobile and desktop layouts
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
        /* Original comment: font-size: 1.0em; Using the --main-content-font-size from LeagueElement */
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
      .match-score {
        color: #4CAF50;
        font-weight: bold;
      }
      /* Score styles */
      .score-w { color: #4CAF50; background-color: transparent; }
      .score-d { color: #FFC107; background-color: transparent; }
      .score-l { color: #F44336; background-color: transparent; }
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
        background-color: #f1f8e9;
        border-left: 3px solid #8bc34a;
        padding: 0.3rem 0.5rem;
        margin-bottom: 0.5rem;
        font-size: 0.9em;
        color: #388e3c;
      }
      .error {
        color: #ff0000;
        padding: 0.5rem;
        background-color: #fff0f0;
        border-radius: 4px;
      }
    `;
  }

  // Mobile-specific styles
  static get MOBILE_STYLES() {
    return `
      ${LeagueMatchesRecent.BASE_STYLES}
      .panel-header {
        font-size: 1rem;
        margin-bottom: 0.3rem;
      }
      /* .match-item rule removed as it's identical to leagueElement's mobile style */
      .paging-btn {
        padding: 0.2rem 0.7rem;
      }
    `;
  }

  // Desktop-specific styles
  static get DESKTOP_STYLES() {
    return `
      ${LeagueMatchesRecent.BASE_STYLES}
      .panel-header {
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
      }
    `;
  }

  // Template
  static get TEMPLATE() {
    return `
      <div class="panel-header">Recent Results</div>
      <div class="recent-results">
        {{recentResults}}
      </div>
      <div class="paging-controls" id="recent-paging" {{showPaging}}>
        <button class="paging-btn" id="recent-prev" {{prevDisabled}}>&lt; Prev</button>
        <button class="paging-btn" id="recent-next" {{nextDisabled}}>Next &gt;</button>
      </div>
    `;
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.matches = [];
    this.currentPage = 0;
    this.itemsPerPage = 5;
    this.selectedResultDate = null;
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
      this.selectedResultDate = newValue ? new Date(newValue) : null;
      this.currentPage = 0; // Reset to first page when date changes
      this.render();
    } else if (name === 'is-mobile') {
      this.render();
    }
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
        if (!match.result) return false;
        const matchDate = new Date(match.date);
        matchDate.setHours(0, 0, 0, 0);
        return matchDate <= today;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
      
    // Filter by selected date if one is specified
    if (this.selectedResultDate) {
      const filterDate = new Date(this.selectedResultDate);
      filterDate.setHours(0, 0, 0, 0);
      
      results = results.filter(match => {
        const matchDate = new Date(match.date);
        matchDate.setHours(0, 0, 0, 0);
        return matchDate.getTime() === filterDate.getTime();
      });
    }
    
    return results;
  }

  _hasNextPage() {
    const list = this._recentResultsList();
    return (this.currentPage + 1) * this.itemsPerPage < list.length;
  }

  renderRecentResults() {
    const list = this._recentResultsList();
    const start = this.currentPage * this.itemsPerPage;
    const pageItems = list.slice(start, start + this.itemsPerPage);
    
    // Show message when filtered
    if (this.selectedResultDate && list.length === 0) {
      return '<div class="match-item">No results for selected date</div>';
    }
    
    if (pageItems.length === 0) return '<div class="match-item">None</div>';
    
    // Add filter indicator if filtering by date
    let header = '';
    if (this.selectedResultDate) {
      const dateStr = new Date(this.selectedResultDate).toLocaleDateString();
      header = `<div class="filter-indicator">Showing results for ${dateStr}</div>`;
    }
    
    let lastDate = null; // Keep track of the last rendered date
    return header + pageItems.map(match => {
      // Defensive: check for result and scores
      const result = match.result || {};
      const homeScore = typeof result.homeScore === 'number' ? result.homeScore : '';
      const awayScore = typeof result.awayScore === 'number' ? result.awayScore : '';
      let homeScoreClass = 'score-d', awayScoreClass = 'score-d';
      if (typeof homeScore === 'number' && typeof awayScore === 'number') {
        if (homeScore > awayScore) {
          homeScoreClass = 'score-w';
          awayScoreClass = 'score-l';
        } else if (homeScore < awayScore) {
          homeScoreClass = 'score-l';
          awayScoreClass = 'score-w';
        } // else keep as score-d
      }
      
      const currentDateObj = new Date(match.date);
      currentDateObj.setHours(0, 0, 0, 0); // Normalize to midnight
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
            ${match.homeTeamName} vs ${match.awayTeamName}
          </a>
          <div class="match-score">
            <span class="${homeScoreClass}">${homeScore}</span>
            <span class="content"> - </span>
            <span class="${awayScoreClass}">${awayScore}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  _fillTemplate(template) {
    const showPaging = this.currentPage > 0 || this._hasNextPage();
    
    return template
      .replace('{{recentResults}}', this.renderRecentResults())
      .replace('{{prevDisabled}}', this.currentPage === 0 ? 'disabled' : '')
      .replace('{{nextDisabled}}', this._hasNextPage() ? '' : 'disabled')
      .replace('{{showPaging}}', showPaging ? '' : 'style="display: none;"');
  }

  render() {
    const isMobile = this.getAttribute('is-mobile') === 'true';
    
    this.shadow.innerHTML = `
      <style>${isMobile ? LeagueMatchesRecent.MOBILE_STYLES : LeagueMatchesRecent.DESKTOP_STYLES}</style>
      ${this._fillTemplate(LeagueMatchesRecent.TEMPLATE)}
    `;
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Setup paging buttons
    const prevBtn = this.shadow.querySelector('#recent-prev');
    const nextBtn = this.shadow.querySelector('#recent-next');
    
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
    
    // Setup match click handlers
    const matchLinks = this.shadow.querySelectorAll('.match-link');
    matchLinks.forEach(link => {
      link.onclick = (e) => {
        e.preventDefault();
        const matchKey = link.dataset.matchKey;
        const match = this.matches.find(m => m.key === matchKey);
        if (match) {
          this.dispatchEvent(new LeagueMatchesRecentEvent({
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
    this.selectedResultDate = date ? new Date(date) : null;
    this.currentPage = 0; // Reset to first page
    this.render();
    
    // Dispatch date change event
    this.dispatchEvent(new LeagueMatchesRecentEvent({
      type: 'dateChange',
      selectedDate: this.selectedResultDate
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
customElements.define('league-matches-recent', LeagueMatchesRecent);

export default LeagueMatchesRecent; 