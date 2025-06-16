// Define custom event types
class LeagueEvent extends CustomEvent {
  constructor(detail) {
    super('league-event', { 
      detail,
      bubbles: true,
      composed: true 
    });
  }
}

import '../LeagueMatchesRecent/LeagueMatchesRecent.js';
import '../LeagueMatchesUpcoming/LeagueMatchesUpcoming.js';
import '../LeagueMatchesAttention/LeagueMatchesAttention.js';
import '../leagueMatch/leagueMatch.js';
import '../leagueCalendar/LeagueCalendar.js';

import {  BASE_STYLES,  MOBILE_STYLES,  DESKTOP_STYLES,  TABLE_HEADER,  MOBILE_TEMPLATE,  DESKTOP_TEMPLATE} from './leagueElement-styles.js';
import { Temporal, TemporalUtils } from '../../utils/temporalUtils.js'; // ADDED IMPORT
import { League, Match } from '@lovebowls/leaguejs';

class LeagueElement extends HTMLElement {

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.data = null;
    this.selectedResultDate = null; // Retained for LeagueMatchesRecent filtering if needed -- WILL BE REPLACED by activeCalendarFilterDate
    this.activeCalendarFilterDate = null; // UPDATED: Will store a string in YYYY-MM-DD format representing the selected date
    this.leftPanelFlexBasis = null;
    this.minRightPanelPixelWidth = null;
    this.activeView = 'table'; // Default to table view
    this.pointsOverTimeChartData = null;
    this.selectedTeamsForGraph = new Set();
    this.teamColors = {};
    this.activeTrendGraphType = 'pointsOverTime';
    this.tableFilter = 'overall'; // Default filter state
    this.matchModalOpen = false;
    this.matchModalData = null;
    this.matchModalTeams = [];
    this.matchModalMode = 'new';
    this.lovebowlsTeams = []; // Store lovebowls teams data
    this.shadow.host.addEventListener('league-calendar-event', this._handleCalendarDateChange.bind(this)); // ADDED event listener
  }

  get _isMobile() {
    return this.getAttribute('is-mobile') === 'true';
  }
  static get observedAttributes() {
    return ['data', 'selectedMatch', 'is-mobile', 'lovebowls-teams'];
  }

  connectedCallback() {
    this.data = this.getAttribute('data');
    if (this.data) {
      this._parseAndLoadData(this.data);
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    if (name === 'lovebowls-teams') {
      this.parseLovebowlsTeams(newValue);
      // If data is already loaded, re-render to apply the new team names
      if (this.data) {
        this.render();
      }
    } else if (name === 'data') {
      this.data = newValue;
      if (newValue) {
        this._parseAndLoadData(newValue);
      } else {
        this.showError('data is required');
        this.dispatchEvent(new LeagueEvent({data: '',error: 'data is required'}));
      }
    } else if (name === 'selectedMatch') {
      if (newValue) {
        try {
          const matchData = JSON.parse(newValue);
          const leagueData = this._table;
          const teamsArray = (leagueData && Array.isArray(leagueData))
                            ? leagueData.map(t => t.teamName)
                            : [];
          this.openMatchModal(matchData, teamsArray, 'edit');
        } catch (error) {
          console.warn('Error parsing match data for selectedMatch attribute:', error);
        }
      }
    } else if (name === 'is-mobile') {
      this.render();
    }
  }

  async _parseAndLoadData(data) {
    try {
      // Use the passed data parameter, not the attribute
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      console.log('[LeagueElement] Parsed data:', parsed);
      this.data = new League(parsed);
      console.log('[LeagueElement] League instance:', this.data);
      
      // Dispatch event with League instance
      this.dispatchEvent(new LeagueEvent({ data: this.data }));
      
      // Just call render() - it will handle all UI updates
      this.render();
    } catch (error) {
      console.error('[LeagueElement] Error parsing league data:', error);
      this.showError('Failed to load league data');
      
      // Dispatch error event
      this.dispatchEvent(new LeagueEvent({ error: error.message }));
    }
  }

  showError(message) {
    const content = this.shadow.querySelector('.content');
    if (content) {
      content.innerHTML = `<div class="error">${message}</div>`;
    }
  }

  // Helper method to replace placeholders in template
  _fillTemplate(template) {
    
    const currentTitle = (this.data && this.data.name ? this.data.name : 'League Table') || 'League Table';

    return template
      .replace(/\{\{title\}\}/g, currentTitle)
      .replace('{{tableRows}}', this.tableRows)
      .replace('{{matrixView}}', this.activeView === 'matrix' ? this.renderMatrix() : '')
      .replace('{{trendsViewContent}}', this.activeView === 'trends' ? this.renderTrendsViewContent() : '')
      .replace('{{overallSelected}}', this.tableFilter === 'overall' ? 'selected' : '')
      .replace('{{homeSelected}}', this.tableFilter === 'home' ? 'selected' : '')
      .replace('{{awaySelected}}', this.tableFilter === 'away' ? 'selected' : '')
      .replace('{{formSelected}}', this.tableFilter === 'form' ? 'selected' : '');
  }

  render() {
    // Generate table rows based on data if available
    let tableRows = '';
    const table = this._table;
    console.log('[LeagueElement] _table:', table);
    if (table && Array.isArray(table.leagueData)) {
      const processedLeagueData = this._getFilteredLeagueData();
      console.log('[LeagueElement] processedLeagueData:', processedLeagueData);

      if (Array.isArray(processedLeagueData)) {
        tableRows = processedLeagueData.map(team => {
          let positionCellClass = 'pos-cell-default';
          
          // Apply promotion/relegation styling ONLY if mode is 'overall'
          // and based on league settings and the team's current rank in the displayed table.
          if (this.tableFilter === 'overall') {
            if (this.data && this.data.settings && processedLeagueData.length > 0) {
              const numTeams = processedLeagueData.length;
              const promotionSpots = parseInt(this.data.settings.promotionPositions, 10) || 0;
              const relegationSpots = parseInt(this.data.settings.relegationPositions, 10) || 0;

              // team.currentRank is 1-indexed and reflects the rank in the currently displayed table
              if (promotionSpots > 0 && team.currentRank <= promotionSpots) {
                positionCellClass = 'pos-cell-promotion';
              } else if (relegationSpots > 0 && team.currentRank >= (numTeams - relegationSpots + 1)) {
                positionCellClass = 'pos-cell-relegation';
              }
            }
          }

          // Generate movement indicator HTML
          const movementIndicator = this.renderRankMovementIndicator(team.rankMovement);

          // Row class for promotion/relegation is removed here
          return `
          <tr> 
            <td class="position-cell ${positionCellClass}">${team.currentRank !== undefined ? team.currentRank : '-'} ${movementIndicator}</td>
            <td>${team.teamDisplayName}</td>
            <td>${team.points}</td>
            <td title="${this.formatMatchList(team.allMatchesForTooltip, team.teamId, undefined, true)}">${team.played}</td>
            <td title="${this.formatMatchList(team.allMatchesForTooltip, team.teamId, 'W', false)}">${team.won}</td>
            <td title="${this.formatMatchList(team.allMatchesForTooltip, team.teamId, 'D', false)}">${team.drawn}</td>
            <td title="${this.formatMatchList(team.allMatchesForTooltip, team.teamId, 'L', false)}">${team.lost}</td>
            <td>${team.shotsFor}</td>
            <td>${team.shotsAgainst}</td>
            <td>${team.shotDifference}</td>
            <td class="form-cell">${this.renderForm(team.matches)}</td>
          </tr>
        `;
        }).join('');
      } else {
        tableRows = `
          <tr>
            <td colspan="11">Error loading filtered table data.</td>
          </tr>`;
      }

      // Store the title and tableRows for use in templates
      this.tableRows = tableRows;

      // Prepare data for trends view and ensure team colors are set
      this._preparePointsOverTimeData();
      this.ensureTeamColors();

      // Render based on device type
      const baseTemplate = this._isMobile ? MOBILE_TEMPLATE : DESKTOP_TEMPLATE;
      this.shadow.innerHTML = `
        <style>${this._isMobile ? MOBILE_STYLES : DESKTOP_STYLES}</style>
        ${this._fillTemplate(baseTemplate)}
      `;
      
      // Configure the recent matches components
      const recentMatchesElement = this.shadow.querySelector(this._isMobile ? '#mobile-recent-matches' : '#desktop-recent-matches');
      if (recentMatchesElement) {
        recentMatchesElement.setAttribute('is-mobile', this._isMobile.toString());
        recentMatchesElement.setAttribute('data', JSON.stringify(this.data.matches));
        
        // Add team mapping data for display name resolution
        recentMatchesElement.setAttribute('team-mapping', JSON.stringify(this._getTeamsFromLeagueData()));
        
        if (this.activeCalendarFilterDate) {
            // UPDATED: activeCalendarFilterDate is now already a string in YYYY-MM-DD format
            recentMatchesElement.setAttribute('filter-date', this.activeCalendarFilterDate);
        } else {
            recentMatchesElement.removeAttribute('filter-date');
        }
        
        recentMatchesElement.removeEventListener('league-matches-recent-event', this._handleRecentMatchClick);
        this._handleRecentMatchClickBound = this._handleRecentMatchClick.bind(this);
        recentMatchesElement.addEventListener('league-matches-recent-event', this._handleRecentMatchClickBound);
      }
      
      // Configure the attention matches components
      const attentionMatchesElement = this.shadow.querySelector(this._isMobile ? '#mobile-attention-matches' : '#desktop-attention-matches');
      if (attentionMatchesElement) {
        attentionMatchesElement.setAttribute('is-mobile', this._isMobile.toString());
        attentionMatchesElement.setAttribute('data', JSON.stringify(this.data.matches));
        
        // Add team mapping data for display name resolution
        attentionMatchesElement.setAttribute('team-mapping', JSON.stringify(this._getTeamsFromLeagueData()));

        attentionMatchesElement.removeEventListener('league-matches-attention-event', this._handleAttentionMatchClick);
        this._handleAttentionMatchClickBound = this._handleAttentionMatchClick.bind(this);
        attentionMatchesElement.addEventListener('league-matches-attention-event', this._handleAttentionMatchClickBound);
      }
      
      if (!this._isMobile) {
        const renderedLeftPanel = this.shadow.querySelector('.left-panel');
        if (renderedLeftPanel && this.leftPanelFlexBasis) {
          renderedLeftPanel.style.flex = this.leftPanelFlexBasis;
        }
        this.setupResizer();
      }
      this.setupPaging(); // Paging for sub-components is handled by them dispatching events
      this.setupTabs();
      this.setupTableFilterDropdown();
      if (this.activeView === 'trends') { // If trends tab is active by default (e.g. on reload/state persistence)
        this.setupTrendsViewInteractivity(); // Ensure interactivity is set up
      }

      // Configure the upcoming fixtures component
      const upcomingFixturesElement = this.shadow.querySelector(this._isMobile ? '#mobile-upcoming-fixtures' : '#desktop-upcoming-fixtures');
      if (upcomingFixturesElement) {
        upcomingFixturesElement.setAttribute('is-mobile', this._isMobile.toString());
        
        // Add team mapping data for display name resolution
        upcomingFixturesElement.setAttribute('team-mapping', JSON.stringify(this._getTeamsFromLeagueData()));
        
        if (this.data && this.data.matches) {
            upcomingFixturesElement.setAttribute('data', JSON.stringify(this.data.matches));
            // Set filter-date for upcoming fixtures
            if (this.activeCalendarFilterDate) {
                // UPDATED: activeCalendarFilterDate is now already a string in YYYY-MM-DD format
                upcomingFixturesElement.setAttribute('filter-date', this.activeCalendarFilterDate);
            } else {
                upcomingFixturesElement.removeAttribute('filter-date');
            }
        } else {
            console.warn('[LeagueElement] render: this.data.matches is NOT available for upcomingFixturesElement.');
        }

        // Add listener for match clicks
        this._handleUpcomingMatchClickBound = this._handleUpcomingMatchClick.bind(this);
        upcomingFixturesElement.removeEventListener('league-matches-upcoming-event', this._handleUpcomingMatchClickBound); // Remove previous if any
        upcomingFixturesElement.addEventListener('league-matches-upcoming-event', this._handleUpcomingMatchClickBound); // Listen for general events
      }

      // ADDED: Configure the league-calendar component
      const calendarElement = this.shadow.querySelector(this._isMobile ? '#mobile-calendar' : '#desktop-calendar');
      if (calendarElement) {
        calendarElement.setAttribute('is-mobile', this._isMobile.toString());
        if (this.data && this.data.matches) {
            calendarElement.setAttribute('matches', JSON.stringify(this.data.matches));
        } else {
            console.warn('[LeagueElement] render: this.data.matches is NOT available for league-calendar.');
        }
        // Pass current filter date to keep calendar selection in sync if changed from parent
        // (e.g. if filter was set by URL param or other means and leagueElement needs to inform calendar)
        if (this.activeCalendarFilterDate) {
            // UPDATED: activeCalendarFilterDate is now already a string in YYYY-MM-DD format
            calendarElement.setAttribute('current-filter-date', this.activeCalendarFilterDate);
        } else {
            calendarElement.removeAttribute('current-filter-date');
        }
        // Event listener for 'league-calendar-event' is set up in connectedCallback of leagueElement
        // and handles updates from the calendar.
      }

    } else {
      // Show error if data is missing or invalid
      this.shadow.innerHTML = `<div class="error">Invalid or missing league data</div>`;
    }

    // After main content rendering:
    if (this.matchModalOpen) {

      // Remove any existing modal first
      let modal = this.shadow.querySelector('league-match');
      if (modal) modal.remove();
      modal = document.createElement('league-match');
      
      // Add display names to match data for UI presentation if they don't exist
      if (this.matchModalData) {
        const homeTeamId = this.matchModalData.homeTeam._id;
        const awayTeamId = this.matchModalData.awayTeam._id;
        
        if (!this.matchModalData.homeTeamDisplay && homeTeamId) {
          this.matchModalData.homeTeamDisplay = this.getTeamDisplayName(homeTeamId);
        }
        if (!this.matchModalData.awayTeamDisplay && awayTeamId) {
          this.matchModalData.awayTeamDisplay = this.getTeamDisplayName(awayTeamId);
        }
      }
      
      modal.match = this.matchModalData;
      
      // FIXED: Use the correct team object format directly from matchModalTeams
      modal.teams = this.matchModalTeams;
      
      // Pass the lovebowls teams data to the modal for reference if needed
      // This is separate from the 'teams' prop which is for the dropdown options
      if (this.lovebowlsTeams && this.lovebowlsTeams.length > 0) {
        modal.lovebowlsTeams = this.lovebowlsTeams;
      }
      
      modal.open = true; // This line sets the property
      modal.isMobile = this._isMobile;
      modal.mode = this.matchModalMode;
      // Pass attention reason if available in matchModalData
      if (this.matchModalData && this.matchModalData.attentionReason) {
        modal.attentionReason = this.matchModalData.attentionReason;
      }

      modal.addEventListener('match-save', (e) => {
        const savedMatch = e.detail.match;
        console.log('[LeagueElement] match-save event received. Match data from modal:', JSON.parse(JSON.stringify(savedMatch)));
        if (!this.data || !this.data.matches) {
          // Should not happen if modal was opened with data, but safety check
          console.error('Cannot save match, league data or matches array is missing.');
          this.closeMatchModal();
          return;
        }

        // Create a new Match instance from the plain object received from the event
        const matchToSave = new Match(savedMatch);
        // Find the index of the match in the *League instance's* matches array
        const matchIndex = this.data.matches.findIndex(m => m._id === matchToSave._id);

        if (matchIndex > -1) {
          // Existing match, update it directly on the League instance
          this.data.matches[matchIndex] = matchToSave;
        } else {
          // New match, push it to the League instance's matches array
          this.data.matches.push(matchToSave);
        }
        
        // Create a plain object representation of the league data for dispatching the event
        const dataToDispatch = this.data.toJSON ? this.data.toJSON() : JSON.parse(JSON.stringify(this.data));

        this.dispatchEvent(new LeagueEvent({ type: 'requestSaveLeague', league: dataToDispatch }));
        
        // The component's data is now updated, so we just need to re-render
        this.render();
        
        this.closeMatchModal();
      });
      modal.addEventListener('match-cancel', () => {
        this.closeMatchModal();
      });
      this.shadow.appendChild(modal);
    } else {
      // Remove modal if not open
      let modal = this.shadow.querySelector('league-match');
      if (modal) modal.remove();
    }
  }

  setupPaging() {
    // Setup Settings icon click event
    const settingsIcons = this.shadow.querySelectorAll('.settings-icon');
    settingsIcons.forEach(icon => {
      icon.onclick = () => {
        this.dispatchEvent(new LeagueEvent({
          type: 'requestAdminView',
          leagueId: this.data?._id || this.data?.name
        }));
      };
    });
    
    // Upcoming Fixtures paging is now handled by LeagueMatchesUpcoming.js
    // Attention Matches Paging is now handled by LeagueMatchesAttention.js

    // Match links from sub-components will be handled by them dispatching events
    // if LeagueElement needs to act (e.g. open a modal from a central place)
  }

  setupResizer() {
    const resizer = this.shadow.querySelector('.resizer');
    const leftPanel = this.shadow.querySelector('.left-panel');
    const rightPanel = this.shadow.querySelector('.right-panel');
    
    if (!resizer || !leftPanel || !rightPanel) {
      console.warn('Resizer or panels not found, skipping setupResizer.');
      return;
    }

    // Calculate and store minimum right panel width if not already done (first-time setup)
    if (this.minRightPanelPixelWidth === null) {
      const initialRightWidth = rightPanel.getBoundingClientRect().width;
      const ASSUMED_INITIAL_RIGHT_PANEL_WIDTH_PX = 300; // Increased fallback
      this.minRightPanelPixelWidth = 
        (initialRightWidth > 0 ? initialRightWidth : ASSUMED_INITIAL_RIGHT_PANEL_WIDTH_PX) * 1.0; // Changed multiplier to 1.0
    }

    let x = 0;
    let leftWidthAtMouseDown = 0;

    const mouseDownHandler = (e) => {
      x = e.clientX;
      leftWidthAtMouseDown = leftPanel.getBoundingClientRect().width;

      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
    };

    const mouseMoveHandler = (e) => {
      const dx = e.clientX - x;
      const hostWidth = this.shadow.host.getBoundingClientRect().width;
      
      if (hostWidth === 0) return;

      let finalLeftPanelPixelWidth = leftWidthAtMouseDown + dx;

      // 1. Apply left panel's own min/max percentage constraints
      const minLeftPanelBoundPx = hostWidth * 0.20;
      const maxLeftPanelBoundPx = hostWidth * 0.80;
      finalLeftPanelPixelWidth = Math.max(minLeftPanelBoundPx, finalLeftPanelPixelWidth);
      finalLeftPanelPixelWidth = Math.min(maxLeftPanelBoundPx, finalLeftPanelPixelWidth);

      // 2. Apply right panel's minimum pixel width constraint (if set)
      if (this.minRightPanelPixelWidth !== null && this.minRightPanelPixelWidth > 0) {
        const maxAllowedLeftForRightMinPx = hostWidth - this.minRightPanelPixelWidth;
        finalLeftPanelPixelWidth = Math.min(finalLeftPanelPixelWidth, maxAllowedLeftForRightMinPx);
      }
      
      // 3. Re-ensure left panel meets its own minimum after adjustments for right panel
      finalLeftPanelPixelWidth = Math.max(minLeftPanelBoundPx, finalLeftPanelPixelWidth);
      
      // Convert final pixel width to percentage for flex-basis
      const newLeftFlexPercentage = (finalLeftPanelPixelWidth / hostWidth) * 100;
      
      leftPanel.style.flex = `0 0 ${newLeftFlexPercentage}%`;
    };

    const mouseUpHandler = () => {
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
      if (leftPanel) {
        this.leftPanelFlexBasis = leftPanel.style.flex;
      }
    };

    resizer.addEventListener('mousedown', mouseDownHandler);
  }

  /**
   * Renders the form icons with tooltips for recent matches.
   * @param {Array<Object>|string} [matches=[]] - An array of recent match objects or a form string
   *                                Each object should have 'result' (W/D/L)
   *                                and 'description' (the tooltip text).
   * @returns {string} HTML string for the form icons.
   */
  renderForm(matches = []) {
    // Check if matches data is valid
    if (!Array.isArray(matches)) {
        // Check if the data passed might be the old form string for backward compatibility or error state
        if (typeof matches === 'string') {
            const matchesStr = String(matches); // Ensure it's a string
            if (matchesStr.length <= 5) {
                console.warn('Received string instead of matches array for form rendering. Displaying basic icons.');
                // Fallback to basic rendering if it looks like a form string
                return matchesStr.split('').map(result => {
                    const lowerResult = result.toLowerCase();
                    let symbol = '?';
                    if (lowerResult === 'w') symbol = '✔';
                    if (lowerResult === 'd') symbol = '-';
                    if (lowerResult === 'l') symbol = '✖';
                    // No title attribute in this fallback
                    return `<span class="form-icon form-${lowerResult}">${symbol}</span>`;
                }).join('');
            }
        }
        console.warn('Invalid matches data provided to renderForm:', matches);
        return ''; // Return empty string for other invalid data
    }
  
    // Reverse the matches array so most recent appears on the right
    return matches.slice().reverse().map(match => {
      // Ensure match object and properties exist
      if (!match || typeof match.result !== 'string' || typeof match.description !== 'string') {
          console.warn('Invalid match object within matches array:', match);
          // Add a title attribute indicating invalid data for the placeholder too
          return '<span class="form-icon" title="Invalid match data">?</span>'; 
      }
  
      const lowerResult = match.result.toLowerCase();
      let symbol = '?';
      // Use match.result to determine symbol and class
      if (lowerResult === 'w') symbol = '✔';
      if (lowerResult === 'd') symbol = '-';
      if (lowerResult === 'l') symbol = '✖';
  
      // Add the title attribute with escaped match.description for the tooltip
      // Symbol is removed to allow CSS to render a colored block
      return `<span class="form-icon form-${lowerResult}" title="${this.escapeHtml(match.description)}"></span>`;
    }).join('');
  }

  /**
   * Basic HTML escaping function to prevent XSS issues in tooltips.
   * @param {string} unsafe - The string to escape.
   * @returns {string} The escaped string.
   */
  escapeHtml(unsafe = '') {
      // Ensure input is a string
      const str = String(unsafe);
      return str
           .replace(/&/g, "&amp;")
           .replace(/</g, "&lt;")
           .replace(/>/g, "&gt;")
           .replace(/"/g, "&quot;")
           .replace(/'/g, "&#039;");
  }

  /**
   * Formats a list of matches for tooltip display.
   * If resultType is provided, only matches of that type are included.
   * If not, all matches are included.
   * @param {Array<Object>} matches - Array of match objects
   * @param {string} teamId - The ID of the team to check the result for.
   * @param {string} [resultType] - Optional: 'W', 'D', or 'L'
   * @param {boolean} [displayVerb=true] - Whether to show the verb (Won/Lost/Drew)
   * @returns {string} Tooltip string
   */
  formatMatchList(matches = [], teamId, resultType, displayVerb = true) {
    if (!Array.isArray(matches) || matches.length === 0) {
      if (resultType) {
        return `No ${resultType === 'W' ? 'wins' : resultType === 'L' ? 'losses' : 'draws'} recorded`;
      }
      return 'No matches played';
    }

    // Filter if resultType is provided
    let filtered = matches;
    if (resultType) {
      filtered = matches.filter(match => {
        if (!match || !match.result || typeof match.result.homeScore !== 'number' || typeof match.result.awayScore !== 'number') {
          return false;
        }

        const homeId = match.homeTeam?._id;
        const awayId = match.awayTeam?._id;
        const { homeScore, awayScore } = match.result;

        let resultForTeam = '';
        if (homeId === teamId) {
          if (homeScore > awayScore) resultForTeam = 'W';
          else if (homeScore < awayScore) resultForTeam = 'L';
          else resultForTeam = 'D';
        } else if (awayId === teamId) {
          if (awayScore > homeScore) resultForTeam = 'W';
          else if (awayScore < homeScore) resultForTeam = 'L';
          else resultForTeam = 'D';
        }
        
        return resultForTeam === resultType;
      });
    }

    // Sort by date ascending - matches should already have a valid 'date' property
    filtered = [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));

    const tooltipContent = filtered.map(match => {
      if (!match || !match.result || !match.date || 
          !match.homeTeam || !match.awayTeam || 
          typeof match.result.homeScore !== 'number' || 
          typeof match.result.awayScore !== 'number') {
        return 'Invalid match data for tooltip';
      }
      
      // Use display names if available, fall back to team names
      const homeTeamId = match.homeTeam._id;
      const awayTeamId = match.awayTeam._id;
      
      const homeTeamDisplay = match.homeTeamDisplayName || this.getTeamDisplayName(homeTeamId) || homeTeamId;
      const awayTeamDisplay = match.awayTeamDisplayName || this.getTeamDisplayName(awayTeamId) || awayTeamId;
      
      let resultVerb = '';
      const { homeScore, awayScore } = match.result;
      
      if (homeTeamId === teamId) {
        if (homeScore > awayScore) resultVerb = 'Won';
        else if (homeScore < awayScore) resultVerb = 'Lost';
        else resultVerb = 'Drew';
      } else if (awayTeamId === teamId) {
        if (awayScore > homeScore) resultVerb = 'Won';
        else if (awayScore < homeScore) resultVerb = 'Lost';
        else resultVerb = 'Drew';
      }

      const dateStr = new Date(match.date).toLocaleDateString();
      const matchDetails = `${homeTeamDisplay} ${homeScore}-${awayScore} ${awayTeamDisplay}`;
      return `${displayVerb ? resultVerb + ' ' : ''}${matchDetails} on ${dateStr}`;
    }).join('\n');

    if (!tooltipContent) {
      if (resultType) {
        return `No ${resultType === 'W' ? 'wins' : resultType === 'L' ? 'losses' : 'draws'} recorded`;
      }
      return 'No matches played';
    }

    return this.escapeHtml(tooltipContent);
  }

  // Add the new helper method here
  _getConflictingMatchKeys() {
    if (!this.data?.matches) return new Set();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    // 1. Filter for future matches without results
    const futureFixtures = this.data.matches.filter(match => {
        if (match.result || !match.date) return false;
        const matchDate = new Date(match.date);
        matchDate.setHours(0, 0, 0, 0);
        return matchDate.getTime() >= todayTimestamp;
    });

    // 2. Group by date (using timestamp as key)
    const matchesByDate = futureFixtures.reduce((acc, match) => {
        const matchDate = new Date(match.date);
        matchDate.setHours(0, 0, 0, 0);
        const dateKey = matchDate.getTime();
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(match);
        return acc;
    }, {});

    const conflictingKeys = new Set();

    // 3. Check each date for conflicts
    for (const dateKey in matchesByDate) {
        const matchesOnDay = matchesByDate[dateKey];
        if (matchesOnDay.length < 2) continue; // Need at least 2 matches to have a conflict

        const teamCounts = {};
        matchesOnDay.forEach(match => {
            teamCounts[match.homeTeam._id] = (teamCounts[match.homeTeam._id] || 0) + 1;
            teamCounts[match.awayTeam._id] = (teamCounts[match.awayTeam._id] || 0) + 1;
        });

        // Find teams playing more than once on this day
        const conflictingTeams = Object.keys(teamCounts).filter(team => teamCounts[team] > 1);

        // If conflicts exist, add keys of all matches involving those teams on that day
        if (conflictingTeams.length > 0) {
            matchesOnDay.forEach(match => {
                if (conflictingTeams.includes(match.homeTeam._id) || conflictingTeams.includes(match.awayTeam._id)) {
                    conflictingKeys.add(match._id);
                }
            });
        }
    }

    return conflictingKeys;
  }

  setupTabs() {
    const tabs = this.shadow.querySelectorAll('.tab-button');
    const tableViewDesktop = this.shadow.querySelector('#desktop-table-view');
    const matrixViewDesktop = this.shadow.querySelector('#desktop-matrix-view');
    const trendsViewDesktop = this.shadow.querySelector('#desktop-trends-view');
    const tableViewMobile = this.shadow.querySelector('#mobile-table-view');
    const matrixViewMobile = this.shadow.querySelector('#mobile-matrix-view');
    const trendsViewMobile = this.shadow.querySelector('#mobile-trends-view');

    // Part 1: Reflect current state (this.activeView) onto the DOM
    tabs.forEach(t => {
      if (t.dataset.view === this.activeView) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });

    const isTableActive = this.activeView === 'table';
    const isMatrixActive = this.activeView === 'matrix';
    const isTrendsActive = this.activeView === 'trends';

    if (tableViewDesktop) tableViewDesktop.style.display = isTableActive ? '' : 'none';
    if (matrixViewDesktop) matrixViewDesktop.style.display = isMatrixActive ? '' : 'none';
    if (trendsViewDesktop) trendsViewDesktop.style.display = isTrendsActive ? '' : 'none';
    if (tableViewMobile) tableViewMobile.style.display = isTableActive ? '' : 'none';
    if (matrixViewMobile) matrixViewMobile.style.display = isMatrixActive ? '' : 'none';
    if (trendsViewMobile) trendsViewMobile.style.display = isTrendsActive ? '' : 'none';
    
    // Part 2: Attach click handlers for future state changes
    tabs.forEach(tab => {
      tab.onclick = () => {
        if (this.activeView !== tab.dataset.view) { // Only act if view is actually changing
          this.activeView = tab.dataset.view;
          this.render(); // Change state, then re-render. Render will call setupTabs again.
          // After re-render, set up interactivity for the new active view
          // This ensures elements are in the DOM before attaching listeners.
          if (this.activeView === 'trends') {
            // Defer slightly to ensure DOM update cycle is complete from render()
            Promise.resolve().then(() => {
                this.setupTrendsViewInteractivity();
            });
          } else if (this.activeView === 'matrix') {
            // Set up matrix event listeners after DOM is ready
            Promise.resolve().then(() => {
                this.setupMatrixEventListeners();
            });
          }
        }
      };
    });
  }

  _prepareMatrixData() {
    console.log('Current league data:', this._table);

    if (!this.data || !this._table || !this.data.matches) {
      console.warn('Cannot prepare matrix data: Required data is missing');
      return null;
    }

    // Extract the leagueData array from the table object
    const tableData = this._table;
    const teams = Array.isArray(tableData) ? tableData : (tableData.leagueData || []);
    const matches = this.data.matches;

    if (!Array.isArray(teams) || teams.length === 0) {
      console.warn('Cannot prepare matrix data: No teams found in league data');
      return null;
    }

    // Create a map of team names to their matches
    const teamMatches = new Map();
    teams.forEach(team => {
      teamMatches.set(team.teamName, []);
    });

    // Populate the matches for each team
    matches.forEach(match => {
      if (match.homeTeam && match.awayTeam) {
        const homeTeam = teamMatches.get(match.homeTeam);
        const awayTeam = teamMatches.get(match.awayTeam);
        if (homeTeam) homeTeam.push(match);
        if (awayTeam) awayTeam.push(match);
      }
    });

    return {
      teams,
      teamMatches
    };
  }

  _handleMatchSave(e) {
    if (!e.detail || !e.detail.match) {
      console.warn('Invalid match data received');
      return;
    }

    const matchData = e.detail.match;
    
    // Update the match in this.data.matches
    if (this.data && this.data.matches) {
      this.data.matches = this.data.matches.map(m =>
        m._id === matchData._id ? matchData : m
      );
    }

    // Trigger a re-render to update the UI
    this.render();
  }

  _getFilteredLeagueData() {
    const table = this._table;
    if (!this.data || !this.data.matches || !table || !Array.isArray(table.leagueData)) {
      return [];
    }

    const allTeamIdsInLeague = table.leagueData.map(t => t.teamId);
    let matchesSubset = this.data.matches.slice(0, this.data.matches.length);
    
    // For home/away filters, we don't filter the matches themselves,
    // but rather calculate stats differently in _calculateRanksFromMatches
    // The filtering logic is handled there by checking home/away context
    
    const stats = this._calculateRanksFromMatches(matchesSubset, allTeamIdsInLeague);
    
    // Apply form-based sorting if form filter is selected
    if (this.tableFilter === 'form') {
      return this._sortByForm(stats);
    }
    
    return stats;
  }

  /**
   * Sorts teams by their recent form using a weighted scoring system.
   * More recent matches have higher weight in the calculation.
   * @param {Array<Object>} stats - Array of team statistics objects
   * @returns {Array<Object>} Teams sorted by form score (best form first)
   */
  _sortByForm(stats) {
    // Calculate form score for each team
    const teamsWithFormScore = stats.map(team => {
      const formScore = this._calculateFormScore(team.matches);
      return {
        ...team,
        formScore: formScore
      };
    });

    // Sort by form score (highest first), then by points as tiebreaker
    teamsWithFormScore.sort((a, b) => {
      if (Math.abs(b.formScore - a.formScore) > 0.01) { // Use small epsilon for float comparison
        return b.formScore - a.formScore;
      }
      // Tiebreaker: use points, then goal difference, then goals for
      if (b.points !== a.points) return b.points - a.points;
      if (b.shotDifference !== a.shotDifference) return b.shotDifference - a.shotDifference;
      if (b.shotsFor !== a.shotsFor) return b.shotsFor - a.shotsFor;
      return a.teamDisplayName.localeCompare(b.teamDisplayName);
    });

    // Reassign ranks based on form sorting
    teamsWithFormScore.forEach((team, index) => {
      team.currentRank = index + 1;
    });

    return teamsWithFormScore;
  }

  /**
   * Calculates a weighted form score based on recent match results.
   * Uses a standard methodology: W=3pts, D=1pt, L=0pts with heavy recency weighting.
   * Most recent matches have higher impact on the score.
   * @param {Array<Object>} formMatches - Array of recent match objects with result and description
   * @returns {number} Form score (0-15 for 5 matches, proportionally scaled for fewer)
   */
  _calculateFormScore(formMatches) {
    if (!Array.isArray(formMatches) || formMatches.length === 0) {
      return 0;
    }

    // Much higher weights for recent matches: most recent gets 5x weight of oldest
    // This ensures recent form has a dominant impact on ranking
    const weights = [1.0, 0.8, 0.6, 0.4, 0.2]; // Most recent to oldest
    let totalScore = 0;
    let totalWeight = 0;

    formMatches.forEach((match, index) => {
      if (index >= 5) return; // Only consider last 5 matches
      
      const weight = weights[index];
      let matchPoints = 0;

      // Convert result to points
      if (match.result === 'W') {
        matchPoints = 3;
      } else if (match.result === 'D') {
        matchPoints = 1;
      } else if (match.result === 'L') {
        matchPoints = 0;
      }

      totalScore += matchPoints * weight;
      totalWeight += weight;
    });

    // Scale the score to maintain a reasonable range while emphasizing recent form
    // The scaling ensures teams with fewer matches aren't unfairly penalized
    const maxPossibleWeight = weights.slice(0, Math.min(formMatches.length, 5)).reduce((sum, w) => sum + w, 0);
    const scaledScore = totalWeight > 0 ? (totalScore / totalWeight) * 3 : 0; // Scale to 0-3 per match average
    
    return Math.round(scaledScore * 1000) / 1000; // Round to 3 decimal places for better precision
  }

  _getTeamsFromLeagueData() {
    if (this.data && this.data.teams) {
      return this.data.teams;
    } else if (this.data && this._table) {
      const tableData = this._table;
      const teams = Array.isArray(tableData) ? tableData : (tableData.leagueData || []);
      return teams.map(team => ({
        _id: team.teamId,
        name: team.teamName
      }));
    }
    return [];
  }

  setupTrendsViewInteractivity() {
    // Graph Type Selector
    const graphTypeSelect = this.shadow.querySelector('#graph-type-select');
    if (graphTypeSelect) {
      graphTypeSelect.addEventListener('change', (event) => {
        this.activeTrendGraphType = event.target.value;
        // Re-render or update the specific graph content
        // For now, if we had multiple graph types, this would trigger a different draw function
        // or pass type to a generic draw function.
        if (this.activeTrendGraphType === 'pointsOverTime') {
          this.drawPointsOverTimeSVG(); // Redraw the current graph type
        } else {
          // Handle other graph types in the future
          const svg = this.shadow.querySelector('#points-over-time-svg');
          if (svg) svg.innerHTML = `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">Selected graph type '${this.activeTrendGraphType}' is not yet implemented.</text>`;
          const legendDiv = this.shadow.querySelector('.trends-graph-legend');
          if (legendDiv) legendDiv.innerHTML = '';
        }
      });
    }

    // Team Toggle Checkboxes (event delegation on legend container)
    const legendDiv = this.shadow.querySelector('.trends-graph-legend');
    if (legendDiv) {
      legendDiv.addEventListener('change', (event) => {
        if (event.target.matches('.trends-team-toggle-cb')) {
          const teamId = event.target.value;
          if (event.target.checked) {
            this.selectedTeamsForGraph.add(teamId);
          } else {
            this.selectedTeamsForGraph.delete(teamId);
          }
          this.drawPointsOverTimeSVG(); // Redraw graph with new team selection
        }
      });
    }

    // Call this once during setup if the trends view is active, to ensure interactivity is live
    // However, render() / _fillTemplate handles calling drawPointsOverTimeSVG which populates legend,
    // so event listeners should be set up after legend is populated.
    // The best place to call this is after render has completed and if the trends tab is active.
    // We can also ensure it's called from setupTabs when trends tab becomes active.
  }

  // START - Placeholder for Trends View Methods
  renderTrendsViewContent() {
    // This will be expanded in the next steps
    let teamTogglesHTML = '<p>No teams available for graphing.</p>'; // This will be removed
    let legendHTML = ''; // Legend is now fully populated by drawPointsOverTimeSVG
    let graphAreaHTML = '<svg id="points-over-time-svg" width="100%" height="100%"></svg>'; // Height 100% to fill parent

    // Data availability checks for graph area, not for toggles anymore
    if (!this.pointsOverTimeChartData || !this.pointsOverTimeChartData.dates || this.pointsOverTimeChartData.dates.length === 0) {
        if (this.pointsOverTimeChartData && this.pointsOverTimeChartData.allTeamNames && this.pointsOverTimeChartData.allTeamNames.length === 0) {
            graphAreaHTML = '<p style="text-align:center; padding-top: 20px;">Graph cannot be displayed: No team data.</p>';
        } else if (this.pointsOverTimeChartData && this.pointsOverTimeChartData.dates.length === 0 && this.pointsOverTimeChartData.allTeamNames && this.pointsOverTimeChartData.allTeamNames.length > 0) {
            graphAreaHTML = '<p style="text-align:center; padding-top: 20px;">Graph cannot be displayed: No match data with results found.</p>';
        } else {
            graphAreaHTML = '<p style="text-align:center; padding-top: 20px;">Graph cannot be displayed: Data unavailable or insufficient.</p>';
        }
    }
    
    // Defer drawing the SVG until after this content is in the DOM
    // and if the trends tab is actually active.
    if (this.activeView === 'trends') {
        Promise.resolve().then(() => {
            if (this.shadow.querySelector('#points-over-time-svg')) { // Ensure element exists
                this.drawPointsOverTimeSVG();
            }
        });
    }

    return `
      <div class="trends-view-wrapper">
        <div class="trends-controls dropdown-container-flex">
          <label for="graph-type-select">Graph Type:</label>
          <div class="dropdown-shared">
            <select id="graph-type-select" class="dropdown-select-shared">
              <option value="pointsOverTime" selected>Points Over Time</option>
              <!-- Future graph types will be added here -->
            </select>
          </div>
        </div>
        <div class="trends-content-area">
          <!-- trends-team-toggles div is removed -->
          <div class="trends-graph-legend">
            ${legendHTML} <!-- Initially empty, populated by drawPointsOverTimeSVG -->
          </div>
          <div class="trends-graph-area">
            ${graphAreaHTML}
          </div>
        </div>
      </div>
    `;
  }

  _preparePointsOverTimeData() {
    const tableData = this._table;
    const table = Array.isArray(tableData) ? tableData : (tableData?.leagueData || []);
    
    if (!this.data || 
        !this.data.matches || !Array.isArray(this.data.matches) || 
        !Array.isArray(table) || table.length === 0) {
      console.warn('_preparePointsOverTimeData: Essential data is missing. Clearing chart data.');
      this.pointsOverTimeChartData = { dates: [], teamSeries: {}, allTeamNames: [] };
      return;
    }

    const allTeamIds = table.map(team => team.teamId);
    if (allTeamIds.length === 0) {
      console.warn('_preparePointsOverTimeData: No teams found in leagueData. Clearing chart data.');
      this.pointsOverTimeChartData = { dates: [], teamSeries: {}, allTeamNames: [] };
      return;
    }

    const validMatches = this.data.matches.filter(match => {
      return match.date && 
             match.result && 
             typeof match.result.homeScore === 'number' && 
             typeof match.result.awayScore === 'number' &&
             allTeamIds.includes(match.homeTeam._id) &&
             allTeamIds.includes(match.awayTeam._id);
    });

    if (validMatches.length === 0) {
      console.warn('_preparePointsOverTimeData: No valid matches with results found for trend analysis.');
      this.pointsOverTimeChartData = { dates: [], teamSeries: {}, allTeamNames: allTeamIds };
      allTeamIds.forEach(teamId => {
        this.pointsOverTimeChartData.teamSeries[teamId] = [];
      });
      return;
    }

    const uniqueDateTimestamps = [...new Set(
      validMatches.map(match => {
        const d = new Date(match.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
    )].sort((a, b) => a - b);

    if (uniqueDateTimestamps.length === 0) {
      // Should be caught by validMatches.length === 0, but as a safeguard
      this.pointsOverTimeChartData = { dates: [], teamSeries: {}, allTeamNames: allTeamIds };
      allTeamIds.forEach(teamId => {
        this.pointsOverTimeChartData.teamSeries[teamId] = [];
      });
      return;
    }

    this.pointsOverTimeChartData = {
      dates: uniqueDateTimestamps,
      teamSeries: {},
      allTeamNames: allTeamIds
    };

    allTeamIds.forEach(teamId => {
      this.pointsOverTimeChartData.teamSeries[teamId] = Array(uniqueDateTimestamps.length).fill(0);
    });

    const currentTeamPoints = {};
    allTeamIds.forEach(teamId => {
      currentTeamPoints[teamId] = 0;
    });

    uniqueDateTimestamps.forEach((dateTimestamp, dateIndex) => {
      validMatches.forEach(match => {
        const matchDate = new Date(match.date);
        matchDate.setHours(0, 0, 0, 0);
        const matchTimestamp = matchDate.getTime();

        if (matchTimestamp === dateTimestamp) {
          const homeTeamId = match.homeTeam._id;
          const awayTeamId = match.awayTeam._id;
          const homeScore = match.result.homeScore;
          const awayScore = match.result.awayScore;

          if (homeScore > awayScore) {
            currentTeamPoints[homeTeamId] += 3;
          } else if (awayScore > homeScore) {
            currentTeamPoints[awayTeamId] += 3;
          } else { // Draw
            currentTeamPoints[homeTeamId] += 1;
            currentTeamPoints[awayTeamId] += 1;
          }
        }
      });

      // After processing all matches for this dateTimestamp, store the cumulative points
      allTeamIds.forEach(teamId => {
        this.pointsOverTimeChartData.teamSeries[teamId][dateIndex] = currentTeamPoints[teamId];
      });
    });
  }

  // Predefined color palette with good contrast and spread
  static TEAM_COLORS = [
    '#e74c3c', // Red
    '#3498db', // Blue
    '#2ecc71', // Green
    '#f39c12', // Orange
    '#9b59b6', // Purple
    '#1abc9c', // Turquoise
    '#e67e22', // Dark Orange
    '#34495e', // Dark Blue Gray
    '#f1c40f', // Yellow
    '#e91e63', // Pink
    '#00bcd4', // Cyan
    '#4caf50', // Light Green
    '#ff9800', // Amber
    '#673ab7', // Deep Purple
    '#795548', // Brown
    '#607d8b', // Blue Gray
    '#ff5722', // Deep Orange
    '#009688', // Teal
    '#8bc34a', // Light Green
    '#ffc107'  // Golden Yellow
  ];

  ensureTeamColors() {
    const tableData = this._table;
    const teams = Array.isArray(tableData) ? tableData : (tableData?.leagueData || []);
    
    if (!this.data || !Array.isArray(teams) || teams.length === 0) {
      console.warn('Cannot ensure team colors: leagueData is missing.');
      return;
    }

    // Initialize teamColors if it doesn't exist
    if (!this.teamColors) {
      this.teamColors = {};
    }

    // Keep track of used color indices to ensure good distribution
    if (!this._usedColorIndices) {
      this._usedColorIndices = new Set();
    }

    // Assign colors to teams that don't have one
    // Use teamId as the key to match how _preparePointsOverTimeData stores team identifiers
    teams.forEach(team => {
      if (!this.teamColors[team.teamId]) {
        // Find the next available color index
        let colorIndex = this._usedColorIndices.size % LeagueElement.TEAM_COLORS.length;
        
        // If we've used all colors, start over but try to avoid recently used ones
        if (this._usedColorIndices.size >= LeagueElement.TEAM_COLORS.length) {
          // Reset and start from a different offset to get better distribution on second round
          const offset = Math.floor(this._usedColorIndices.size / LeagueElement.TEAM_COLORS.length);
          colorIndex = (colorIndex + offset) % LeagueElement.TEAM_COLORS.length;
        }
        
        this.teamColors[team.teamId] = LeagueElement.TEAM_COLORS[colorIndex];
        this._usedColorIndices.add(colorIndex);
      }
    });

    // Ensure any team in selectedTeamsForGraph (even if not in current leagueData, though unlikely) has a color
    this.selectedTeamsForGraph.forEach(teamId => {
      if (!this.teamColors[teamId]) {
        let colorIndex = this._usedColorIndices.size % LeagueElement.TEAM_COLORS.length;
        
        if (this._usedColorIndices.size >= LeagueElement.TEAM_COLORS.length) {
          const offset = Math.floor(this._usedColorIndices.size / LeagueElement.TEAM_COLORS.length);
          colorIndex = (colorIndex + offset) % LeagueElement.TEAM_COLORS.length;
        }
        
        this.teamColors[teamId] = LeagueElement.TEAM_COLORS[colorIndex];
        this._usedColorIndices.add(colorIndex);
      }
    });
  }

  drawPointsOverTimeSVG() {
    const svg = this.shadow.querySelector('#points-over-time-svg');
    const legendDiv = this.shadow.querySelector('.trends-graph-legend');

    if (!svg || !legendDiv) {
      console.error('SVG or Legend container not found for trends graph.');
      return;
    }

    // Clear previous content
    svg.innerHTML = '';
    legendDiv.innerHTML = '';

    if (!this.pointsOverTimeChartData || 
        !this.pointsOverTimeChartData.dates || 
        !this.pointsOverTimeChartData.teamSeries) {
      svg.innerHTML = '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">Graph data is unavailable.</text>';
      legendDiv.innerHTML = '<p>Legend cannot be displayed: Data unavailable.</p>'; // Also update legend message
      return;
    }

    const { dates, teamSeries, allTeamNames } = this.pointsOverTimeChartData;

    // Always populate the legend first, so controls are available
    if (allTeamNames && allTeamNames.length > 0) {
        allTeamNames.forEach(teamId => {
            const color = this.teamColors[teamId] || '#ccc';
            const isChecked = this.selectedTeamsForGraph.has(teamId);
            const teamDisplayName = this.getTeamDisplayName(teamId);

            const legendItemLabel = document.createElement('label');
            legendItemLabel.className = 'legend-item';
            legendItemLabel.title = `Toggle visibility for ${this.escapeHtml(teamDisplayName)}`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'trends-team-toggle-cb';
            checkbox.value = teamId; // Keep original ID as value for data lookups
            checkbox.checked = isChecked;
            
            const colorBox = document.createElement('span');
            colorBox.className = 'legend-color-box';
            colorBox.style.backgroundColor = color;

            const nameSpan = document.createElement('span');
            nameSpan.textContent = this.escapeHtml(teamDisplayName);

            legendItemLabel.appendChild(checkbox);
            legendItemLabel.appendChild(colorBox);
            legendItemLabel.appendChild(nameSpan);
            legendDiv.appendChild(legendItemLabel);
        });
    } else {
        legendDiv.innerHTML = '<p>No teams available for legend.</p>';
        // If no teams at all, SVG also can reflect this, though earlier checks might catch it.
        svg.innerHTML = '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">No teams available in data.</text>';
        return; // Nothing further to draw if no teams
    }

    if (dates.length === 0) {
      svg.innerHTML = '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">No dates available for graphing.</text>';
      // Legend is already populated, so just return for SVG part
      return;
    }

    const selectedTeams = Array.from(this.selectedTeamsForGraph);
    if (selectedTeams.length === 0) {
      svg.innerHTML = '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">No teams selected for the graph. Use legend to select.</text>';
      // Legend is populated, SVG message is set, so return.
      return;
    }

    // Dimensions and margins
    const svgWidth = svg.clientWidth;
    const svgHeight = svg.clientHeight;
    const margin = { top: 20, right: 20, bottom: 50, left: 50 }; // Adjusted bottom for date labels
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    if (width <= 0 || height <= 0) { // Not enough space to draw
        svg.innerHTML = '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">Not enough space to render graph.</text>';
        return;
    }

    // Create main group element
    const mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    mainGroup.setAttribute('transform', `translate(${margin.left},${margin.top})`);
    svg.appendChild(mainGroup);

    // Scales
    const minDate = dates[0];
    const maxDate = dates[dates.length - 1];
    
    let maxPoints = 0;
    selectedTeams.forEach(teamId => {
      if (teamSeries[teamId]) {
        const teamMaxPoints = Math.max(...teamSeries[teamId], 0);
        if (teamMaxPoints > maxPoints) maxPoints = teamMaxPoints;
      }
    });
    if (maxPoints === 0 && dates.length > 0) maxPoints = 10; // Default if all points are 0 but there are dates
    if (selectedTeams.length > 0 && maxPoints === 0 && dates.length === 0 ) {
        // This case should be caught earlier, but as a fallback
        svg.innerHTML = '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">No data points to plot.</text>';
        return;
    }

    const xScale = (date) => (date - minDate) / (maxDate - minDate || 1) * width;
    const yScale = (points) => height - (points / (maxPoints || 1)) * height;

    // Helper to create SVG elements
    const createSVGElement = (name, attributes) => {
      const el = document.createElementNS('http://www.w3.org/2000/svg', name);
      for (const key in attributes) {
        el.setAttribute(key, attributes[key]);
      }
      return el;
    };

    // Draw X-axis
    mainGroup.appendChild(createSVGElement('line', { x1: 0, y1: height, x2: width, y2: height, class: 'axis' }));
    const numXTicks = Math.min(dates.length, 5); // Max 5 X-axis ticks
    let lastDisplayedMonth = null; // Variable to track the last displayed month for mobile

    if (dates.length > 0) {
        for (let i = 0; i < numXTicks; i++) {
            const tickDateIndex = Math.floor(i * (dates.length -1) / (numXTicks -1 < 1 ? 1 : numXTicks -1));
            const dateVal = dates[tickDateIndex];
            const x = xScale(dateVal);
            mainGroup.appendChild(createSVGElement('line', { x1: x, y1: height, x2: x, y2: height + 6, class: 'axis' }));
            
            let dateLabelText;
            if (this._isMobile) {
                const currentMonthName = new Date(dateVal).toLocaleDateString(undefined, { month: 'short' });
                if (currentMonthName !== lastDisplayedMonth) {
                    dateLabelText = currentMonthName;
                    lastDisplayedMonth = currentMonthName;
                } else {
                    dateLabelText = ''; // Show empty string if month is the same as the last one
                }
            } else {
                dateLabelText = new Date(dateVal).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            }

            const xTickText = createSVGElement('text', { x: x, y: height + 20, 'text-anchor': 'middle', class: 'axis-text' });
            xTickText.textContent = dateLabelText;
            mainGroup.appendChild(xTickText);
        }
    }
    const xAxisLabel = createSVGElement('text', {x: width / 2, y: height + 40, 'text-anchor': 'middle', class: 'axis-label'});
    xAxisLabel.textContent = 'Date';
    mainGroup.appendChild(xAxisLabel);

    // Draw Y-axis
    mainGroup.appendChild(createSVGElement('line', { x1: 0, y1: 0, x2: 0, y2: height, class: 'axis' }));
    const numYTicks = 5;
    for (let i = 0; i <= numYTicks; i++) {
      const pointsVal = (maxPoints / numYTicks) * i;
      const y = yScale(pointsVal);
      mainGroup.appendChild(createSVGElement('line', { x1: -6, y1: y, x2: 0, y2: y, class: 'axis' }));
      // Grid line
      mainGroup.appendChild(createSVGElement('line', { x1: 0, y1: y, x2: width, y2: y, class: 'grid-line' }));
      const yTickText = createSVGElement('text', { x: -10, y: y, 'text-anchor': 'end', 'dominant-baseline': 'middle', class: 'axis-text' });
      yTickText.textContent = Math.round(pointsVal).toString();
      mainGroup.appendChild(yTickText);
    }
    const yAxisLabel = createSVGElement('text', {
        transform: `translate(-35, ${height/2}) rotate(-90)`,
        'text-anchor': 'middle', class: 'axis-label'
    });
    yAxisLabel.textContent = 'Points';
    mainGroup.appendChild(yAxisLabel);

    // Draw lines for selected teams
    selectedTeams.forEach(teamId => {
      const teamPointData = teamSeries[teamId];
      const color = this.teamColors[teamId] || '#ccc';

      if (teamPointData && teamPointData.length === dates.length && dates.length > 1) {
        let pathData = 'M';
        for (let i = 0; i < dates.length; i++) {
          pathData += `${xScale(dates[i])},${yScale(teamPointData[i])} `;
          if (i < dates.length - 1) pathData += 'L';
        }
        mainGroup.appendChild(createSVGElement('path', { d: pathData.trim(), stroke: color, fill: 'none', 'stroke-width': 2, class: 'line' }));
      }
    });
  }
  // END - Placeholder for Trends View Methods

  // START - New methods for table filtering and data processing

  setupTableFilterDropdown() {
    const filterSelect = this.shadow.querySelector('#table-filter-select');
    if (filterSelect) {
      filterSelect.value = this.tableFilter; // Ensure dropdown reflects current state
      filterSelect.onchange = (event) => {
        this.tableFilter = event.target.value;
        this.render(); // Re-render with the new filter
      };
    }
  }

  // END - New methods for table filtering

  /**
   * Renders the rank movement indicator to be placed next to the position.
   * @param {number|undefined} movement - The change in rank. Positive for up, negative for down, 0 for no change.
   * @returns {string} HTML string for the movement indicator.
   */
  renderRankMovementIndicator(movement) {
    let content = ''; // Default is empty for no change
    
    // Only show indicators for actual movement and only in overall view
    // Form view shows current form ranking, not historical movement
    if (typeof movement === 'number' && movement !== 0 && this.tableFilter === 'overall') {
      if (movement > 0) { // Moved up
        content = `<span class="rank-up" title="Moved up ${movement} position${movement !== 1 ? 's' : ''}">▲</span>`;
      } else { // Moved down
        const absMovement = Math.abs(movement);
        content = `<span class="rank-down" title="Moved down ${absMovement} position${absMovement !== 1 ? 's' : ''}">▼</span>`;
      }
    }
    return content;
  }

  /**
   * @param {Array<Object>} matchesSubset - Array of match objects to calculate ranks from.
   * @param {Array<string>} allTeamIdsInLeague - Array of all team IDs in the league.
   * @returns {Object|null} A map of { teamId: rank }, or null if calculation isn't possible.
   */
  _calculateRanksFromMatches(matchesSubset, allTeamIdsInLeague) {
    if (!matchesSubset || matchesSubset.length === 0 || !allTeamIdsInLeague || allTeamIdsInLeague.length === 0) {
      // Return an array of teams with zeroed stats if no matches
      return allTeamIdsInLeague.map(teamId => ({
        teamId,
        teamDisplayName: this.getTeamDisplayName(teamId),
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        shotsFor: 0,
        shotsAgainst: 0,
        shotDifference: 0,
        points: 0,
        currentRank: undefined,
        rankMovement: undefined,
        matches: [],
        allMatchesForTooltip: []
      }));
    }

    const stats = allTeamIdsInLeague.map(teamId => {
      let played = 0;
      let won = 0;
      let drawn = 0;
      let lost = 0;
      let shotsFor = 0;
      let shotsAgainst = 0;
      let points = 0;
      let matches = [];
      let allMatchesForTooltip = [];

      matchesSubset.forEach(match => {
        // Ensure match has a result and valid scores
        if (!match.result || typeof match.result.homeScore !== 'number' || typeof match.result.awayScore !== 'number') {
          return; 
        }
        // Get team IDs from match
        const homeTeamId = match.homeTeam._id;
        const awayTeamId = match.awayTeam._id;
        if (!homeTeamId || !awayTeamId) {
          return; // Skip if team IDs are missing
        }
        const homeScore = match.result.homeScore;
        const awayScore = match.result.awayScore;
        
        // Handle home matches for this team
        if (homeTeamId === teamId) {
          // Skip if we're filtering for away matches only
          if (this.tableFilter === 'away') return;
          
          played++;
          shotsFor += homeScore;
          shotsAgainst += awayScore;
          if (homeScore > awayScore) { won++; points += 3; }
          else if (homeScore === awayScore) { drawn++; points += 1; }
          else { lost++; }
          matches.push(match);
          allMatchesForTooltip.push(match);
        } 
        // Handle away matches for this team
        else if (awayTeamId === teamId) {
          // Skip if we're filtering for home matches only
          if (this.tableFilter === 'home') return;
          
          played++;
          shotsFor += awayScore;
          shotsAgainst += homeScore;
          if (awayScore > homeScore) { won++; points += 3; }
          else if (awayScore === homeScore) { drawn++; points += 1; }
          else { lost++; }
          matches.push(match);
          allMatchesForTooltip.push(match);
        }
      });

      // Sort matches by date to get the most recent for the form guide
      matches.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      const formMatches = matches.slice(0, 5).map(match => {
        const homeTeamId = match.homeTeam._id;
        const awayTeamId = match.awayTeam._id;
        const homeScore = match.result.homeScore;
        const awayScore = match.result.awayScore;

        let resultForTeam = '';
        if (homeTeamId === teamId) {
          if (homeScore > awayScore) { resultForTeam = 'W'; }
          else if (homeScore < awayScore) { resultForTeam = 'L'; }
          else { resultForTeam = 'D'; }
        } else { // awayTeamId === teamId
          if (awayScore > homeScore) { resultForTeam = 'W'; }
          else if (awayScore < homeScore) { resultForTeam = 'L'; }
          else { resultForTeam = 'D'; }
        }

        const homeTeamDisplay = this.getTeamDisplayName(homeTeamId);
        const awayTeamDisplay = this.getTeamDisplayName(awayTeamId);
        const dateStr = new Date(match.date).toLocaleDateString();
        const description = `${homeTeamDisplay} ${homeScore}-${awayScore} ${awayTeamDisplay} on ${dateStr}`;

        return { result: resultForTeam, description };
      });

      return {
        teamId,
        teamDisplayName: this.getTeamDisplayName(teamId),
        played,
        won,
        drawn,
        lost,
        shotsFor,
        shotsAgainst,
        shotDifference: shotsFor - shotsAgainst,
        points,
        matches: formMatches,
        allMatchesForTooltip
      };
    });

    // Sort teams based on points, shotDifference, shotsFor (standard league sorting)
    stats.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.shotDifference !== a.shotDifference) return b.shotDifference - a.shotDifference;
      if (b.shotsFor !== a.shotsFor) return b.shotsFor - a.shotsFor;
      return a.teamDisplayName.localeCompare(b.teamDisplayName);
    });

    // Assign currentRank and rankMovement if needed
    stats.forEach((team, index) => {
      team.currentRank = index + 1; // 1-indexed rank
      // rankMovement can be calculated here if you have previous data
    });

    return stats;
  }

  /**
   * Open the match modal dialog.
   * @param {Object} matchData
   * @param {Array<Object>} teams - Array of team objects ({_id, name}) for dropdowns.
   * @param {'edit'|'new'} mode
   */
  openMatchModal(matchData, teams, mode = 'edit') {
    console.group('[LeagueElement] openMatchModal');
    console.log('Opening match modal with data:', {
      matchData,
      teams,
      mode,
      currentLeagueData: this._table
    });
    
    this.matchModalOpen = true;
    this.matchModalData = matchData;
    this.matchModalTeams = teams;
    this.matchModalMode = mode;

    this.render();

    // If user is viewing the matrix, refresh its contents after modal interaction
    if (this.activeView === 'matrix') {
      const selector = this._isMobile
        ? '#mobile-matrix-view .matrix-container'
        : '#desktop-matrix-view .matrix-container';
      const matrixContainer = this.shadow.querySelector(selector);
      if (matrixContainer) {
        // Re-generate matrix HTML and re-attach listeners
        matrixContainer.innerHTML = this.renderMatrix();
        this.setupMatrixEventListeners();
      }
    }
    console.groupEnd();
  }

  /**
   * Close the match modal dialog.
   */
  closeMatchModal() {
    this.matchModalOpen = false;
    this.matchModalData = null;
    this.matchModalTeams = [];
    this.matchModalMode = 'new';
    this.render();
  }

  _handleRecentMatchClick(e) {
    if (e.detail.type === 'matchClick' && e.detail.match) {
      // Use the standardized team objects directly from the data property
      // with fallback to table data if teams array is not available
      const teams = this._getTeamsFromLeagueData();
      this.openMatchModal(e.detail.match, teams, 'edit');
    }
  }

  _handleAttentionMatchClick(e) {
    if (e.detail.type === 'matchClick' && e.detail.match) {
      // Use the standardized team objects directly from the data property
      // with fallback to table data if teams array is not available
      const teams = this._getTeamsFromLeagueData();
      const matchData = { ...e.detail.match }; // Clone to avoid modifying original event detail
      if (e.detail.attentionReason) {
          matchData.attentionReason = e.detail.attentionReason;
      }
      this.openMatchModal(matchData, teams, 'edit');
    }
  }

  // New handler for match clicks from league-matches-upcoming
  _handleUpcomingMatchClick(e) {
    // Check if the event is specifically a matchClick event
    if (e.detail.type === 'matchClick' && e.detail.match) {
      // Use the standardized team objects directly from the data property
      // with fallback to table data if teams array is not available
      const teams = this._getTeamsFromLeagueData();
      this.openMatchModal(e.detail.match, teams, 'edit');
    }
  }

  // New handler for date changes from league-matches-upcoming calendar
  _handleUpcomingFixtureDateChange(e) {
    // Check if the event is specifically a dateChange event
    if (e.detail.type === 'dateChange') {
      const selectedDateFromUpcoming = e.detail.selectedDate;
    }
  }

  // ADDED: Handler for events from league-calendar
  _handleCalendarDateChange(e) {
    if (e.detail.type === 'dateChange') {
        // Use Temporal API for date handling
        
        // Option 1: Use the dateString directly (YYYY-MM-DD format) - preferred approach
        if (e.detail.dateString) {
            // Store the date string directly - this is the simplest and most reliable
            this.activeCalendarFilterDate = e.detail.dateString;
        } 
        // Option 2: Create from year, month, day components using Temporal
        else if (e.detail.year && e.detail.month && e.detail.day) {
            try {
                // Create a PlainDate using Temporal
                const plainDate = TemporalUtils.createPlainDate(
                    e.detail.year, 
                    e.detail.month, 
                    e.detail.day
                );
                
                // Store as ISO string (YYYY-MM-DD)
                this.activeCalendarFilterDate = plainDate.toString();
            } catch (err) {
                console.error('[LeagueElement] Error creating Temporal date:', err);
                this.activeCalendarFilterDate = null;
            }
        }
        // Legacy support for Date objects
        else if (e.detail.date) {
            try {
                // Convert legacy Date to Temporal PlainDate
                const legacyDate = new Date(e.detail.date);
                const plainDate = TemporalUtils.fromLegacyDate(legacyDate);
                if (plainDate) {
                    this.activeCalendarFilterDate = plainDate.toString();
                } else {
                    throw new Error('Invalid date conversion');
                }
            } catch (err) {
                console.error('[LeagueElement] Error converting legacy Date:', err);
                
                // Fallback to direct string formatting if Temporal conversion fails
                const d = new Date(e.detail.date);
                this.activeCalendarFilterDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            }
        }
        else {
            console.warn('[LeagueElement] No date information found in calendar event', e.detail);
            this.activeCalendarFilterDate = null;
        }
    } else if (e.detail.type === 'filterClear') {
        this.activeCalendarFilterDate = null;
    }
    
    // Update child components that depend on this filter date
    this.render(); // Re-render to propagate the filter-date attribute to children
  }

  // OPTIONAL: Direct update method if render() is too much
  /*
  _updateChildFilterDates() {
    const isMobile = this.getAttribute('is-mobile') === 'true';
    const newFilterDate = this.activeCalendarFilterDate ? this.activeCalendarFilterDate.toISOString().split('T')[0] : null;

    const upcomingFixturesElement = this.shadow.querySelector(isMobile ? '#mobile-upcoming-fixtures' : '#desktop-upcoming-fixtures');
    const recentMatchesElement = this.shadow.querySelector(isMobile ? '#mobile-recent-matches' : '#desktop-recent-matches');
    const calendarElement = this.shadow.querySelector(isMobile ? '#mobile-calendar' : '#desktop-calendar');

    if (newFilterDate) {
        if (upcomingFixturesElement) upcomingFixturesElement.setAttribute('filter-date', newFilterDate);
        if (recentMatchesElement) recentMatchesElement.setAttribute('filter-date', newFilterDate);
        if (calendarElement) calendarElement.setAttribute('current-filter-date', newFilterDate);
    } else {
        if (upcomingFixturesElement) upcomingFixturesElement.removeAttribute('filter-date');
        if (recentMatchesElement) recentMatchesElement.removeAttribute('filter-date');
        if (calendarElement) calendarElement.removeAttribute('current-filter-date');
    }
  }
  */

  // Add this new method to parse lovebowls teams
  parseLovebowlsTeams(teamsData) {
    try {
      if (teamsData) {
        const data = JSON.parse(teamsData);
        if (Array.isArray(data)) {
          this._lovebowlsTeams = data;
          // Create a simple lookup map for team names
          this._teamNameMap = {};
          data.forEach(team => {
            if (team._id && team.name) {
              this._teamNameMap[team._id] = team.name;
            }
          });
        }
      }
    } catch (error) {
      console.error('Error parsing lovebowls teams:', error);
    }
  }

  // Get team display name (using standardized model)
  getTeamDisplayName(teamId) {
    if (!teamId) return '';
    
    // Check team name map first
    if (this._teamNameMap && this._teamNameMap[teamId]) {
      return this._teamNameMap[teamId];
    }
    
    // If not found in the map, try to find it in the teams array
    if (this.data && this.data.teams) {
      const team = this.data.teams.find(t => t._id === teamId);
      if (team && team.name) {
        return team.name;
      }
    }
    
    // Last resort: return the ID itself
    return teamId;
  }

  /**
   * Get a shortened version of team name for mobile display
   * @param {string} teamName - The full team name
   * @return {string} - Shortened team name for mobile display
   */
  _getShortTeamName(teamName) {
    if (!teamName) return '';
    
    // If already short, return as is
    if (teamName.length <= 3) return teamName;
    
    // Check if it has multiple words
    const words = teamName.split(' ');
    if (words.length > 1) {
      // Try to use initials for multi-word names
      const initials = words.map(word => word.charAt(0)).join('');
      // If enough initials, use them
      if (initials.length >= 2) {
        return initials.toUpperCase();
      }
    }
    
    // Last resort: just use first 3 characters
    return teamName.substring(0, 3).toUpperCase();
  }

  get _table() {
    if (!this.data) {
      console.warn('[LeagueElement] _table: No league data available');
      return undefined;
    }
    return this.data.getLeagueTable();
  }

  _updateUI() {
    // Get current league data
    const table = this._table;
    if (!table) {
      console.warn('No league table data available for UI update');
      return;
    }

    // Update the UI with the latest data
    this._updateLeagueTable(table);
    this._updateMatrixView(table);
    this._updateFixturesView(table);
  }

  _updateLeagueTable(table) {
    console.log('Updating league table with data:', table);
    if (!table || !table.leagueData || !Array.isArray(table.leagueData)) {
      console.warn('Invalid league data for table update');
      return;
    }

    // Only update if table view is active
    if (this.activeView !== 'table') {
      console.log('Table view is not active, skipping update');
      return;
    }

    // Select the correct view container based on mobile/desktop
    const viewContainer = this._isMobile ? 
      this.shadowRoot.querySelector('#mobile-table-view') :
      this.shadowRoot.querySelector('#desktop-table-view');

    if (!viewContainer) {
      console.warn('Table view container not found');
      return;
    }

    const tableBody = viewContainer.querySelector('table tbody');
    console.log('Table body:', tableBody);
    if (!tableBody) return;

    // Clear existing rows
    tableBody.innerHTML = '';

    // Add new rows
    table.leagueData.forEach(team => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${team.position}</td>
        <td>${team.teamName}</td>
        <td>${team.played}</td>
        <td>${team.won}</td>
        <td>${team.drawn}</td>
        <td>${team.lost}</td>
        <td>${team.shotsFor}</td>
        <td>${team.shotsAgainst}</td>
        <td>${team.shotDifference}</td>
        <td>${team.points}</td>
      `;
      tableBody.appendChild(row);
    });
  }

  _updateMatrixView(table) {
    if (!table || !table.leagueData || !Array.isArray(table.leagueData)) {
      console.warn('Invalid league data for matrix update');
      return;
    }

    const matrixContainer = this.shadowRoot.querySelector('#matrixView');
    if (!matrixContainer) return;

    // Clear existing content
    matrixContainer.innerHTML = '';

    // Create matrix table
    const matrixTable = document.createElement('table');
    matrixTable.className = 'matrix-table';

    // Create header row
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th></th>' + table.leagueData.map(team => `<th>${team.teamName}</th>`).join('');
    matrixTable.appendChild(headerRow);

    // Create data rows
    table.leagueData.forEach(team => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${team.teamName}</td>` + 
        table.leagueData.map(opponent => {
          if (opponent.teamName === team.teamName) return '<td class="diagonal"></td>';
          const match = this.data.getMatch(team.teamName, opponent.teamName);
          if (!match) return '<td>-</td>';
          return `<td>${match.homeShots}-${match.awayShots}</td>`;
        }).join('');
      matrixTable.appendChild(row);
    });

    matrixContainer.appendChild(matrixTable);
  }

  _updateFixturesView(table) {
    if (!table || !table.leagueData || !Array.isArray(table.leagueData)) {
      console.warn('Invalid league data for fixtures update');
      return;
    }

    const fixturesContainer = this.shadowRoot.querySelector('#fixturesView');
    if (!fixturesContainer) return;

    // Clear existing content
    fixturesContainer.innerHTML = '';

    // Get all matches
    const matches = this.data.getAllMatches();
    if (!matches || matches.length === 0) {
      fixturesContainer.innerHTML = '<p>No fixtures available</p>';
      return;
    }

    // Group matches by round
    const matchesByRound = {};
    matches.forEach(match => {
      if (!matchesByRound[match.round]) {
        matchesByRound[match.round] = [];
      }
      matchesByRound[match.round].push(match);
    });

    // Create fixtures table
    const fixturesTable = document.createElement('table');
    fixturesTable.className = 'fixtures-table';

    // Add header
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th>Round</th><th>Home Team</th><th>Score</th><th>Away Team</th><th>Actions</th>';
    fixturesTable.appendChild(headerRow);

    // Add matches
    Object.keys(matchesByRound).sort((a, b) => a - b).forEach(round => {
      matchesByRound[round].forEach(match => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${round}</td>
          <td>${match.homeTeam}</td>
          <td>${match.homeShots}-${match.awayShots}</td>
          <td>${match.awayTeam}</td>
          <td>
            <button class="edit-match" data-match='${JSON.stringify(match)}'>Edit</button>
          </td>
        `;
        fixturesTable.appendChild(row);
      });
    });

    fixturesContainer.appendChild(fixturesTable);

    // Add event listeners for edit buttons
    fixturesContainer.querySelectorAll('.edit-match').forEach(button => {
      button.addEventListener('click', (e) => {
        const matchData = JSON.parse(e.target.dataset.match);
        const teamsArray = table.leagueData.map(t => t.teamName);
        this.openMatchModal(matchData, teamsArray, 'edit');
      });
    });
  }

  // END - Placeholder for Trends View Methods

  // START - Matrix View Methods
  renderMatrix() {
    const matrixData = this._prepareMatrixData();
    if (!matrixData) {
      return '<p>Matrix data is not available.</p>';
    }

    const { teams, teamMatches } = matrixData;
    
    if (!teams || teams.length === 0) {
      return '<p>No teams available for matrix view.</p>';
    }

    const numTeams = teams.length;
    
    // Create the matrix using CSS Grid
    let matrixHTML = `<div class="matrix-grid" style="grid-template-columns: repeat(${numTeams + 1}, 1fr);">`;
    
    // Empty top-left corner cell
    matrixHTML += '<div class="matrix-cell matrix-header-cell"></div>';
    
    // Header row (team names across the top)
    teams.forEach(team => {
      const displayName = this._isMobile ? 
        this._getShortTeamName(team.teamDisplayName || team.teamName) : 
        (team.teamDisplayName || team.teamName);
      matrixHTML += `<div class="matrix-cell matrix-header-cell" title="${this.escapeHtml(team.teamDisplayName || team.teamName)}">
        <span class="matrix-team-name-x">${this.escapeHtml(displayName)}</span>
      </div>`;
    });

    // Data rows
    teams.forEach(homeTeam => {
      // Row header (team name on the left)
      const homeDisplayName = this._isMobile ? 
        this._getShortTeamName(homeTeam.teamDisplayName || homeTeam.teamName) : 
        (homeTeam.teamDisplayName || homeTeam.teamName);
      
      matrixHTML += `<div class="matrix-cell matrix-header-cell" title="${this.escapeHtml(homeTeam.teamDisplayName || homeTeam.teamName)}">
        <span class="matrix-team-name-y">${this.escapeHtml(homeDisplayName)}</span>
      </div>`;
      
      // Data cells for this row
      teams.forEach(awayTeam => {
        if (homeTeam.teamId === awayTeam.teamId) {
          // Diagonal cell - same team
          matrixHTML += '<div class="matrix-cell matrix-cell-same-team"></div>';
        } else {
          // Find match between these teams
          const match = this._findMatchBetweenTeams(homeTeam.teamId, awayTeam.teamId);
          if (match && match.result) {
            // Match has been played
            const homeScore = match.result.homeScore;
            const awayScore = match.result.awayScore;
            const dateStr = new Date(match.date).toLocaleDateString();
            const tooltip = `${homeTeam.teamDisplayName || homeTeam.teamName} vs ${awayTeam.teamDisplayName || awayTeam.teamName} on ${dateStr}`;
            
            matrixHTML += `<div class="matrix-cell matrix-cell-played" title="${this.escapeHtml(tooltip)}" data-match='${JSON.stringify(match)}'>
              <span class="matrix-score">${homeScore}-${awayScore}</span>
              <div class="tooltip">${this.escapeHtml(tooltip)}</div>
            </div>`;
          } else if (match && !match.result) {
            // Match is scheduled but not played
            const dateStr = match.date ? new Date(match.date).toLocaleDateString() : 'Date TBD';
            const tooltip = `${homeTeam.teamDisplayName || homeTeam.teamName} vs ${awayTeam.teamDisplayName || awayTeam.teamName} - ${dateStr}`;
            
            matrixHTML += `<div class="matrix-cell matrix-cell-scheduled" title="${this.escapeHtml(tooltip)}" data-match='${JSON.stringify(match)}'>
              <span>vs</span>
              <div class="tooltip">${this.escapeHtml(tooltip)}</div>
            </div>`;
          } else {
            // No match scheduled
            const tooltip = `No match scheduled: ${homeTeam.teamDisplayName || homeTeam.teamName} vs ${awayTeam.teamDisplayName || awayTeam.teamName}`;
            
            matrixHTML += `<div class="matrix-cell matrix-cell-none" title="${this.escapeHtml(tooltip)}">
              <span class="add-match-icon">+</span>
              <div class="tooltip">${this.escapeHtml(tooltip)}</div>
            </div>`;
          }
        }
      });
    });
    
    matrixHTML += '</div>';
    return matrixHTML;
  }

  _findMatchBetweenTeams(homeTeamId, awayTeamId) {
    if (!this.data || !this.data.matches) return null;
    
    return this.data.matches.find(match => {
      const matchHomeId = match.homeTeam?._id;
      const matchAwayId = match.awayTeam?._id;
      return matchHomeId === homeTeamId && matchAwayId === awayTeamId;
    });
  }

  setupMatrixEventListeners() {
    const matrixCells = this.shadow.querySelectorAll('.matrix-cell[data-match]');
    matrixCells.forEach(cell => {
      cell.addEventListener('click', (e) => {
        try {
          const matchData = JSON.parse(e.currentTarget.dataset.match);
          const teams = this._getTeamsFromLeagueData();
          this.openMatchModal(matchData, teams, 'edit');
        } catch (error) {
          console.error('Error opening match modal from matrix:', error);
        }
      });
    });

    // Also handle clicks on empty cells to create new matches
    const emptyCells = this.shadow.querySelectorAll('.matrix-cell-none');
    emptyCells.forEach(cell => {
      cell.addEventListener('click', (e) => {
        // You could implement new match creation here if desired
        console.log('Clicked empty matrix cell - could create new match');
      });
    });
  }
  // END - Matrix View Methods
}

// Register the custom element
customElements.define('league-element', LeagueElement);

export default LeagueElement; 