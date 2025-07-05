// Define custom event types for the LeagueDashboard element
class LeagueDashboardEvent extends CustomEvent {
  constructor(detail) {
    super('league-dashboard-event', {
      detail,
      bubbles: true, // Ensure event bubbles up through the DOM
      composed: true, // Ensure event crosses shadow DOM boundaries
      cancelable: true // Make the event cancelable
    });
  }
}

import { MOBILE_STYLES, DESKTOP_STYLES, TEMPLATE } from './LeagueDashboard-styles.js';

/**
 * Custom element to display league dashboard with comprehensive overview.
 *
 * @element league-dashboard
 * @attr {string} data - JSON stringified League instance object
 * @attr {boolean} [is-mobile] - Whether to use mobile styles
 * @attr {number} [font-scale] - Font scaling factor
 *
 * Emits 'league-dashboard-event' with detail { type: 'viewTable' | 'dataLoaded' | 'error', ... }
 */
class LeagueDashboard extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.league = null;
  }

  static get observedAttributes() {
    return ['data', 'is-mobile', 'font-scale'];
  }

  get _isMobile() {
    return this.getAttribute('is-mobile') === 'true';
  }

  get _fontScale() {
    return parseFloat(this.getAttribute('font-scale')) || 1.0;
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  disconnectedCallback() {
    // Clean up event listeners if needed
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'data') {
      this.loadData(newValue);
    } else if (name === 'is-mobile' || name === 'font-scale') {
      this.render();
    }
  }

  /**
   * Loads and parses the league data.
   * @param {string|Object} data - League instance or JSON string
   */
  async loadData(data) {
    try {
      if (typeof data === 'string') {
        const parsedData = JSON.parse(data);
        // Import League class to create a proper instance
        const { League } = await import('@lovebowls/leaguejs');
        this.league = new League(parsedData);
      } else if (data && typeof data === 'object') {
        // If it's already a League instance, use it directly
        if (data.getMatchesRequiringAttention && data.teams) {
          this.league = data;
        } else {
          // It's plain data, create a League instance
          const { League } = await import('@lovebowls/leaguejs');
          this.league = new League(data);
        }
      } else {
        this.league = null;
      }
      
      this.render();
      this.dispatchEvent(new LeagueDashboardEvent({ 
        type: 'dataLoaded', 
        league: this.league 
      }));
    } catch (error) {
      const errorMessage = 'Failed to load league data for dashboard';
      this.showError(errorMessage);
      console.error('Error loading league data for dashboard:', error);
      this.dispatchEvent(new LeagueDashboardEvent({ 
        type: 'error', 
        message: errorMessage, 
        error 
      }));
    }
  }

  /**
   * Shows an error message in the component.
   * @param {string} message
   */
  showError(message) {
    const content = this.shadow.querySelector('.dashboard-content');
    if (content) {
      content.innerHTML = `<div class="error">${message}</div>`;
    }
  }

  /**
   * Renders the dashboard content.
   */
  render() {
    const isMobile = this._isMobile;
    const fontScale = this._fontScale;
    
    const styles = isMobile ? MOBILE_STYLES(fontScale) : DESKTOP_STYLES(fontScale);
    const content = this.renderDashboardContent();
    
    this.shadow.innerHTML = `
      <style>${styles}</style>
      ${this._fillTemplate(TEMPLATE, { dashboardContent: content })}
    `;
  }

  /**
   * Renders the main dashboard content.
   * @returns {string}
   */
  renderDashboardContent() {
    if (!this.league) {
      return '<div class="no-league">No league data available</div>';
    }
    
    const leagueOverview = this.renderLeagueOverview();
    const matchStatistics = this.renderMatchStatistics();
    const leagueSettings = this.renderLeagueSettings();
    
    return `
      <div class="dashboard-sections">
        ${leagueOverview}
        ${matchStatistics}
        ${leagueSettings}
      </div>
    `;
  }

  /**
   * Renders the league overview section.
   * @returns {string}
   */
  renderLeagueOverview() {
    const league = this.league;
    const teams = league.teams || [];
    const isRinkPointsLeague = league.settings?.rinkPoints?.enabled || false;
    const leagueType = isRinkPointsLeague ? 'Rink Points League' : 'Standard League';
    
    // Determine season status
    const matches = league.matches || [];
    const playedMatches = matches.filter(match => match.result);
    const totalMatches = matches.length;
    
    let statusIndicator = '';
    let statusText = '';
    
    if (totalMatches === 0) {
      statusIndicator = 'status-setup';
      statusText = 'Setup';
    } else if (playedMatches.length === 0) {
      statusIndicator = 'status-upcoming';
      statusText = 'Upcoming';
    } else if (playedMatches.length === totalMatches) {
      statusIndicator = 'status-completed';
      statusText = 'Completed';
    } else {
      statusIndicator = 'status-active';
      statusText = 'Active';
    }
    
    return `
      <div class="dashboard-section league-overview">
        <h3 class="section-title">Overview</h3>
        <div class="info-cards">
          <div class="info-card">
            <div class="card-label">League Name</div>
            <div class="card-value">${this.escapeHtml(league.name || 'Unnamed League')}</div>
          </div>
          <div class="info-card">
            <div class="card-label">Season Status</div>
            <div class="card-value">
              <span class="status-indicator ${statusIndicator}"></span>
              ${statusText}
            </div>
          </div>
          <div class="info-card">
            <div class="card-label">League Type</div>
            <div class="card-value">${leagueType}</div>
          </div>
          <div class="info-card">
            <div class="card-label">Total Teams</div>
            <div class="card-value">${teams.length}</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renders the match statistics section.
   * @returns {string}
   */
  renderMatchStatistics() {
    const league = this.league;
    const matches = league.matches || [];
    const playedMatches = matches.filter(match => match.result);
    const totalMatches = matches.length;
    const remainingMatches = totalMatches - playedMatches.length;
    
    // Calculate completion percentage
    const completionPercentage = totalMatches > 0 ? Math.round((playedMatches.length / totalMatches) * 100) : 0;
    
    // Get attention matches
    const attentionMatches = league.getMatchesRequiringAttention ? league.getMatchesRequiringAttention() : [];
    
    const dateFormat = {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
      }

    // Get last result date and next match date
    const lastResultDate = this.getLastResultDate(playedMatches);
    const nextMatchDate = this.getNextMatchDate(matches);
    
    // Get last updated timestamp
    const lastUpdated = new Date().toLocaleString('en-GB', dateFormat);
    return `
      <div class="dashboard-section match-statistics">
        <h3 class="section-title">Match Statistics</h3>
        <div class="info-cards">
          <div class="info-card">
            <div class="card-label">Total Scheduled</div>
            <div class="card-value">${totalMatches}</div>
          </div>
          <div class="info-card">
            <div class="card-label">Played</div>
            <div class="card-value">${playedMatches.length}</div>
          </div>
          <div class="info-card">
            <div class="card-label">Remaining</div>
            <div class="card-value">${remainingMatches}</div>
          </div>
        </div>
        <div class="progress-section">
          <div class="progress-label">Completion Progress</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${completionPercentage}%"></div>
          </div>
          <div class="progress-percentage">${completionPercentage}%</div>
        </div>
        <div class="info-cards">
          <div class="info-card ${attentionMatches.length > 0 ? 'attention-highlight' : ''}">
            <div class="card-label">Requiring Attention</div>
            <div class="card-value">
              ${attentionMatches.length > 0 ? 
                `<span class="attention-count">${attentionMatches.length}</span>` : 
                '0'
              }
            </div>
          </div>
          <div class="info-card">
            <div class="card-label">Next Match</div>
            <div class="card-value">${nextMatchDate}</div>
          </div>
          <div class="info-card">
            <div class="card-label">Last Result</div>
            <div class="card-value">${lastResultDate}</div>
          </div>
          <div class="info-card">
            <div class="card-label">Last Updated</div>
            <div class="card-value">${lastUpdated}</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renders the league settings section.
   * @returns {string}
   */
  renderLeagueSettings() {
    const league = this.league;
    const settings = league.settings || {};
    
    // Points system
    const pointsForWin = settings.pointsForWin || 3;
    const pointsForDraw = settings.pointsForDraw || 1;
    const pointsForLoss = settings.pointsForLoss || 0;
    
    // Match format
    const timesTeamsPlayEachOther = settings.timesTeamsPlayEachOther || 1;
    const formatText = timesTeamsPlayEachOther === 1 ? 'Single Round Robin' : 
                      timesTeamsPlayEachOther === 2 ? 'Double Round Robin' : 
                      `${timesTeamsPlayEachOther}× Round Robin`;
    
    // Rink configuration
    const maxRinksPerSession = settings.maxRinksPerSession || 'Not set';
    
    // Promotion/Relegation
    const hasPromotionRelegation = settings.promotionRelegation || false;
    const promRelText = hasPromotionRelegation ? 'Enabled' : 'Disabled';
    
    return `
      <div class="dashboard-section league-settings">
        <h3 class="section-title">League Settings Summary</h3>
        <div class="info-cards">
          <div class="info-card">
            <div class="card-label">Points System</div>
            <div class="card-value">Win: ${pointsForWin}, Draw: ${pointsForDraw}, Loss: ${pointsForLoss}</div>
          </div>
          <div class="info-card">
            <div class="card-label">Match Format</div>
            <div class="card-value">${formatText}</div>
          </div>
          <div class="info-card">
            <div class="card-label">Rink Configuration</div>
            <div class="card-value">Max ${maxRinksPerSession} rinks per session</div>
          </div>
          <div class="info-card">
            <div class="card-label">Promotion Relegation</div>
            <div class="card-value">${promRelText}</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Gets the last result date from played matches.
   * @param {Array} playedMatches - Array of played matches
   * @returns {string}
   */
  getLastResultDate(playedMatches) {
    if (playedMatches.length === 0) return 'None';
    
    const lastMatch = playedMatches
      .filter(match => match.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    
    if (!lastMatch) return 'None';

    const dateFormat = {
        day: 'numeric',
        month: 'long'
      }

    return new Date(lastMatch.date).toLocaleDateString('en-GB', dateFormat);
  }

  /**
   * Gets the next match date from unplayed matches.
   * @param {Array} matches - Array of all matches
   * @returns {string}
   */
  getNextMatchDate(matches) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingMatches = matches
      .filter(match => !match.result && match.date)
      .map(match => ({ ...match, dateObj: new Date(match.date) }))
      .filter(match => match.dateObj >= today)
      .sort((a, b) => a.dateObj - b.dateObj);
    
    if (upcomingMatches.length === 0) return 'None scheduled';
    
    const dateFormat = {
        day: 'numeric',
        month: 'long'
      }

    return upcomingMatches[0].dateObj.toLocaleDateString('en-GB', dateFormat);
  }



  /**
   * Utility method to fill template placeholders.
   * @param {string} template - Template string with {{placeholders}}
   * @param {Object} data - Data object to fill placeholders
   * @returns {string}
   */
  _fillTemplate(template, data) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match;
    });
  }

  /**
   * Escapes HTML to prevent XSS.
   * @param {string} unsafe - Unsafe string
   * @returns {string}
   */
  escapeHtml(unsafe = '') {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// Define the custom element
customElements.define('league-dashboard', LeagueDashboard);

export default LeagueDashboard; 