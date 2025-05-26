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

  static get observedAttributes() {
    return ['data', 'selectedMatch', 'is-mobile', 'lovebowls-teams'];
  }

  connectedCallback() {
    this.data = this.getAttribute('data');
    if (this.data) {
      this.loadLeagueData(this.data);
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    this.dispatchEvent(new LeagueEvent({console: [name, oldValue, newValue]}));

    if (name === 'lovebowls-teams') {
      this.parseLovebowlsTeams(newValue);
      // If data is already loaded, re-render to apply the new team names
      if (this.data) {
        this.render();
      }
    } else if (name === 'data') {
      this.data = newValue;
      if (newValue) {
        this.loadLeagueData(newValue);
      } else {
        this.showError('data is required');
        this.dispatchEvent(new LeagueEvent({data: '',error: 'data is required'}));
      }
    } else if (name === 'selectedMatch') {
      if (newValue) {
        try {
          const matchData = JSON.parse(newValue);
          const teamsArray = (this.data && this.data.table && Array.isArray(this.data.table.leagueData))
                            ? this.data.table.leagueData.map(t => t.teamName)
                            : [];
          this.openMatchModal(matchData, teamsArray, 'edit');
        } catch (error) {
          console.error('Error parsing match data for selectedMatch attribute:', error);
        }
      }
    } else if (name === 'is-mobile') {
      this.render();
    }
  }

  async loadLeagueData(data) {
    try {
      // Parse data if it's a string
      if (typeof data === 'string') {
        try {
          this.data = JSON.parse(data);
        } catch (e) {
          // If parsing fails, use the string as is (or handle as error)
          // For now, we'll assume if it's a string it should be parseable or it's an error state
          this.showError('Invalid data format: Expected JSON object or stringified JSON.');
          this.dispatchEvent(new LeagueEvent({ data: '', error: 'Invalid data format' }));
          return;
        }
      } else {
        // If it's already an object, use it directly
        this.data = data;
      }

      // Basic validation of the data structure needed for trends
      if (!this.data || typeof this.data !== 'object' || !this.data.table || !Array.isArray(this.data.table.leagueData) || !Array.isArray(this.data.matches)) {
        // this.showError('League data is missing or incomplete for trends analysis.');
        // Don't fully block rendering, but trends might be empty or show an error later
        console.warn('League data is missing or incomplete for trends analysis. Trends tab might not display correctly.');
      } else {
        // Proceed with data preparation for trends if essential data is present
        this.ensureTeamColors(); 
        this._preparePointsOverTimeData();

        // Initialize selectedTeamsForGraph with top 3 teams if possible
        this.selectedTeamsForGraph.clear(); // Clear previous selections
        if (this.data.table.leagueData.length > 0) {
          const sortedTeams = [...this.data.table.leagueData].sort((a, b) => b.points - a.points);
          for (let i = 0; i < Math.min(sortedTeams.length, 3); i++) {
            this.selectedTeamsForGraph.add(sortedTeams[i].teamName);
          }
        }
      }
      
      this.render();
      // Dispatch success event
      this.dispatchEvent(new LeagueEvent({data: this.data}));
    } catch (error) {
      const errorMessage = 'Failed to load league data';
      this.showError(errorMessage);
      console.error('Error loading league:', error);
      
      // Dispatch error event
      this.dispatchEvent(new LeagueEvent({data,error: errorMessage}));
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
    // Check if paging controls should be visible
    // const showFixturesPaging = this.upcomingFixturesPage > 0 || this._upcomingFixturesHasNext(); // Moved to LeagueMatchesUpcoming
    // const showAttentionPaging = this.attentionMatchesPage > 0 || this._attentionMatchesHasNext(); // Moved to LeagueMatchesAttention
    
    const currentTitle = (this.data && this.data.name ? this.data.name : 'League Table') || 'League Table';
    // const currentFilterDateISO = this.activeCalendarFilterDate 
    //     ? this.activeCalendarFilterDate.toISOString().split('T')[0] 
    //     : null; // This is not used in the template directly

    return template
      .replace(/\{\{title\}\}/g, currentTitle)
      .replace('{{tableRows}}', this.tableRows)
      // .replace('{{upcomingFixtures}}', this.renderUpcomingFixtures()) // Handled by LeagueMatchesUpcoming element
      // .replace('{{fixturesPrevDisabled}}', this.upcomingFixturesPage === 0 ? 'disabled' : '')
      // .replace('{{fixturesNextDisabled}}', this._upcomingFixturesHasNext() ? '' : 'disabled')
      // .replace('{{showFixturesPaging}}', showFixturesPaging ? '' : 'style="display: none;"')
      // .replace('{{calendar}}', this.renderCalendar()) // Moved to LeagueMatchesUpcoming
      // .replace('{{calendarFilter}}', this.renderCalendarFilter()) // Moved to LeagueMatchesUpcoming
      // .replace('{{attentionMatches}}', this.renderMatchesRequiringAttention()) // Handled by LeagueMatchesAttention element
      // .replace('{{attentionPrevDisabled}}', this.attentionMatchesPage === 0 ? 'disabled' : '')
      // .replace('{{attentionNextDisabled}}', this._attentionMatchesHasNext() ? '' : 'disabled')
      // .replace('{{showAttentionPaging}}', showAttentionPaging ? '' : 'style="display: none;"')
      .replace('{{matrixView}}', this.activeView === 'matrix' ? this.renderMatrix() : '')
      .replace('{{trendsViewContent}}', this.activeView === 'trends' ? this.renderTrendsViewContent() : '')
      .replace('{{overallSelected}}', this.tableFilter === 'overall' ? 'selected' : '')
      .replace('{{homeSelected}}', this.tableFilter === 'home' ? 'selected' : '')
      .replace('{{awaySelected}}', this.tableFilter === 'away' ? 'selected' : '');
      // REMOVED .replace('{{filterDate}}', currentFilterDateISO);
  }

  render() {
    // Generate table rows based on data if available
    let tableRows = '';
    const isMobile = this.getAttribute('is-mobile') === 'true';
    
    if (this.data && this.data.table) {
      const processedLeagueData = this._getFilteredLeagueData();

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
                // This condition correctly identifies teams in relegation spots from the bottom.
                // e.g., if 10 teams and 2 relegation spots, teams ranked 9 and 10 are caught.
                // (10 - 2 + 1 = 9). So rank >= 9.
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
            <td title="${this.formatMatchList(team.allMatchesForTooltip, undefined, true)}">${team.played}</td>
            <td title="${this.formatMatchList(team.allMatchesForTooltip, 'W', false)}">${team.won}</td>
            <td title="${this.formatMatchList(team.allMatchesForTooltip, 'D', false)}">${team.drawn}</td>
            <td title="${this.formatMatchList(team.allMatchesForTooltip, 'L', false)}">${team.lost}</td>
            <td>${team.shotsFor}</td>
            <td>${team.shotsAgainst}</td>
            <td>${team.shotDifference}</td>
            <td class="form-cell">${this.renderForm(team.matches)}</td>
          </tr>
        `; // Note: The template literal for each row ends here
        }).join(''); // .join('') should be called on the result of .map()
      } else {
        tableRows = `
          <tr>
            <td colspan="11">Error loading filtered table data.</td>
          </tr>`;
      }

      // Store the title and tableRows for use in templates
      this.tableRows = tableRows;

      // Render based on device type
      const baseTemplate = isMobile ? MOBILE_TEMPLATE : DESKTOP_TEMPLATE;
      this.shadow.innerHTML = `
        <style>${isMobile ? MOBILE_STYLES : DESKTOP_STYLES}</style>
        ${this._fillTemplate(baseTemplate)}
      `;
      
      // Configure the recent matches components
      const recentMatchesElement = this.shadow.querySelector(isMobile ? '#mobile-recent-matches' : '#desktop-recent-matches');
      if (recentMatchesElement) {
        recentMatchesElement.setAttribute('is-mobile', isMobile.toString());
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
      const attentionMatchesElement = this.shadow.querySelector(isMobile ? '#mobile-attention-matches' : '#desktop-attention-matches');
      if (attentionMatchesElement) {
        attentionMatchesElement.setAttribute('is-mobile', isMobile.toString());
        attentionMatchesElement.setAttribute('data', JSON.stringify(this.data.matches));
        
        // Add team mapping data for display name resolution
        attentionMatchesElement.setAttribute('team-mapping', JSON.stringify(this._getTeamsFromLeagueData()));

        attentionMatchesElement.removeEventListener('league-matches-attention-event', this._handleAttentionMatchClick);
        this._handleAttentionMatchClickBound = this._handleAttentionMatchClick.bind(this);
        attentionMatchesElement.addEventListener('league-matches-attention-event', this._handleAttentionMatchClickBound);
      }
      
      if (!isMobile) {
        const renderedLeftPanel = this.shadow.querySelector('.left-panel');
        if (renderedLeftPanel && this.leftPanelFlexBasis) {
          renderedLeftPanel.style.flex = this.leftPanelFlexBasis;
        }
        this.setupResizer();
      }
      this.setupPaging(); // Paging for sub-components is handled by them
      this.setupTabs();
      this.setupTableFilterDropdown();
      if (this.activeView === 'trends') { // If trends tab is active by default (e.g. on reload/state persistence)
        this.setupTrendsViewInteractivity(); // Ensure interactivity is set up
      }

      // Configure the upcoming fixtures component
      const upcomingFixturesElement = this.shadow.querySelector(isMobile ? '#mobile-upcoming-fixtures' : '#desktop-upcoming-fixtures');
      if (upcomingFixturesElement) {
        upcomingFixturesElement.setAttribute('is-mobile', isMobile.toString());
        
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
            console.log('[LeagueElement] render: this.data.matches is NOT available for upcomingFixturesElement.');
        }

        // Add listener for match clicks
        this._handleUpcomingMatchClickBound = this._handleUpcomingMatchClick.bind(this);
        upcomingFixturesElement.removeEventListener('league-matches-upcoming-event', this._handleUpcomingMatchClickBound); // Remove previous if any
        upcomingFixturesElement.addEventListener('league-matches-upcoming-event', this._handleUpcomingMatchClickBound); // Listen for general events
      }

      // ADDED: Configure the league-calendar component
      const calendarElement = this.shadow.querySelector(isMobile ? '#mobile-calendar' : '#desktop-calendar');
      if (calendarElement) {
        calendarElement.setAttribute('is-mobile', isMobile.toString());
        if (this.data && this.data.matches) {
            calendarElement.setAttribute('matches', JSON.stringify(this.data.matches));
        } else {
            console.log('[LeagueElement] render: this.data.matches is NOT available for league-calendar.');
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
      // ADDED CONSOLE LOG
      console.log('[LeagueElement - render] Modal rendering. this.matchModalOpen is true.');
      console.log('[LeagueElement - render] Current this.matchModalData before modal creation:', this.matchModalData);
      console.log('[LeagueElement - render] Current this.matchModalTeams before modal creation:', this.matchModalTeams);
      console.log('[LeagueElement - render] Current this.lovebowlsTeams before modal creation:', this.lovebowlsTeams);

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
      modal.isMobile = this.getAttribute('is-mobile') === 'true';
      modal.setAttribute('is-mobile', this.getAttribute('is-mobile') === 'true' ? 'true' : 'false');
      modal.mode = this.matchModalMode;
      // Pass attention reason if available in matchModalData
      if (this.matchModalData && this.matchModalData.attentionReason) {
        modal.attentionReason = this.matchModalData.attentionReason;
      }

      // ADDED: Debug logging
      console.log('[LeagueElement] Match modal created with isMobile:', modal.isMobile, 
                  'attribute:', modal.getAttribute('is-mobile'),
                  'parent is-mobile attribute:', this.getAttribute('is-mobile'));

      // ADDED CONSOLE LOGS - Check properties after assignment to modal instance
      console.log('[LeagueElement - render] Modal instance properties after assignment:');
      console.log('[LeagueElement - render] modal.match:', modal.match);
      console.log('[LeagueElement - render] modal.teams:', modal.teams);
      console.log('[LeagueElement - render] modal.lovebowlsTeams:', modal.lovebowlsTeams);
      console.log('[LeagueElement - render] modal.mode:', modal.mode);
      console.log('[LeagueElement - render] modal.open:', modal.open);

      modal.addEventListener('match-save', (e) => {
        const savedMatch = e.detail.match;
        if (!this.data || !this.data.matches) {
          // Should not happen if modal was opened with data, but safety check
          console.error('Cannot save match, league data or matches array is missing.');
          this.closeMatchModal();
          return;
        }

        const updatedLeagueData = JSON.parse(JSON.stringify(this.data));
        const matchIndex = updatedLeagueData.matches.findIndex(m => m.key === savedMatch.key);

        if (matchIndex > -1) {
          // Existing match, update it
          updatedLeagueData.matches[matchIndex] = savedMatch;
        } else {
          // New match (could be from matrix with a temp key, or a completely new match if UI allowed)
          // The parent/handler of requestUpdateLeague will be responsible for assigning a final key if temp
          updatedLeagueData.matches.push(savedMatch);
        }
        
        this.data = updatedLeagueData; // Update internal state
        this.dispatchEvent(new LeagueEvent({ type: 'requestUpdateLeague', league: this.data }));
        this.loadLeagueData(this.data); // Reprocess and re-render
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
          type: 'editLeague',
          league: this.data
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
  
    return matches.map(match => {
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
   * @param {string} [resultType] - Optional: 'W', 'D', or 'L'
   * @param {boolean} [displayVerb=true] - Whether to show the verb (Won/Lost/Drew)
   * @returns {string} Tooltip string
   */
  formatMatchList(matches = [], resultType, displayVerb = true) {
    if (!Array.isArray(matches) || matches.length === 0) {
      if (resultType) {
        return `No ${resultType === 'W' ? 'wins' : resultType === 'L' ? 'losses' : 'draws'} recorded`;
      }
      return 'No matches played';
    }

    // Filter if resultType is provided
    let filtered = matches;
    if (resultType) {
      filtered = matches.filter(
        match => match && match.result && match.result.toUpperCase() === resultType
      );
    }

    // Sort by date ascending - matches should already have a valid 'date' property
    filtered = [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));

    const tooltipContent = filtered.map(match => {
      if (!match || !match.result || !match.date || 
          !match.homeTeam || !match.awayTeam || 
          typeof match.homeScore !== 'number' || 
          typeof match.awayScore !== 'number') {
        return 'Invalid match data for tooltip';
      }
      
      // Use display names if available, fall back to team names
      const homeTeamId = match.homeTeam._id;
      const awayTeamId = match.awayTeam._id;
      
      const homeTeamDisplay = match.homeTeamDisplayName || this.getTeamDisplayName(homeTeamId) || homeTeamId;
      const awayTeamDisplay = match.awayTeamDisplayName || this.getTeamDisplayName(awayTeamId) || awayTeamId;
      
      let resultVerb = '';
      if (match.result.toUpperCase() === 'W') resultVerb = 'Won';
      else if (match.result.toUpperCase() === 'L') resultVerb = 'Lost';
      else if (match.result.toUpperCase() === 'D') resultVerb = 'Drew';

      const dateStr = new Date(match.date).toLocaleDateString();
      const matchDetails = `${homeTeamDisplay} ${match.homeScore}-${match.awayScore} ${awayTeamDisplay}`;
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
                    conflictingKeys.add(match.key);
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
          // After re-render, if the new active view is trends, set up its interactivity.
          // This ensures elements are in the DOM before attaching listeners.
          if (this.activeView === 'trends') {
            // Defer slightly to ensure DOM update cycle is complete from render()
            Promise.resolve().then(() => {
                this.setupTrendsViewInteractivity();
            });
          }
        }
      };
    });
  }

  _prepareMatrixData() {
    if (!this.data || !this.data.table || !Array.isArray(this.data.table.leagueData) || !Array.isArray(this.data.matches)) {
      return null;
    }

    // Get team IDs from the league data
    const teams = [...new Set(this.data.table.leagueData.map(t => t.teamId))].sort();
    const matchesMap = new Map();
    
    this.data.matches.forEach(match => {
      const homeTeamId = match.homeTeam._id;
      const awayTeamId = match.awayTeam._id;
      
      // Ensure matches are mapped consistently using team IDs
      if (homeTeamId && awayTeamId) {
        matchesMap.set(`${homeTeamId}_vs_${awayTeamId}`, match);
      }
    });

    const matrix = {};
    teams.forEach(homeTeam => {
      matrix[homeTeam] = {};
      teams.forEach(awayTeam => {
        let match = null;
        let status = 'none';
        let tooltip = '';
        const matchKey = `${homeTeam}_vs_${awayTeam}`;

        if (homeTeam === awayTeam) {
          status = 'same';
          tooltip = ''; // Remove tooltip for diagonal cells
        } else if (matchesMap.has(matchKey)) {
          match = matchesMap.get(matchKey);
          if (match.result && typeof match.result.homeScore === 'number' && typeof match.result.awayScore === 'number') {
            status = 'played';
            
            // Get display names for tooltip
            const homeTeamDisplay = this.getTeamDisplayName(homeTeam);
            const awayTeamDisplay = this.getTeamDisplayName(awayTeam);
            
            tooltip = `${new Date(match.date).toLocaleDateString()}: ${homeTeamDisplay} ${match.result.homeScore} - ${match.result.awayScore} ${awayTeamDisplay}`;
          } else {
            status = 'scheduled';
            
            // Get display names for tooltip
            const homeTeamDisplay = this.getTeamDisplayName(homeTeam);
            const awayTeamDisplay = this.getTeamDisplayName(awayTeam);
            
            tooltip = match.date ? `Scheduled: ${new Date(match.date).toLocaleDateString()} - ${homeTeamDisplay} vs ${awayTeamDisplay}` : `Scheduled: ${homeTeamDisplay} vs ${awayTeamDisplay} (No date)`;
          }
        } else {
          status = 'none';
          
          // Get display names for tooltip
          const homeTeamDisplay = this.getTeamDisplayName(homeTeam);
          const awayTeamDisplay = this.getTeamDisplayName(awayTeam);
          
          tooltip = `${homeTeamDisplay} vs ${awayTeamDisplay} - No match scheduled`;
        }
        matrix[homeTeam][awayTeam] = { match, status, tooltip };
      });
    });

    return { teams, matrix };
  }

  renderMatrix() {
    const matrixData = this._prepareMatrixData();

    if (!matrixData) {
      return '<div class="error">Matrix data is unavailable or incomplete.</div>';
    }

    const { teams, matrix } = matrixData;
    if (teams.length === 0) {
        return '<div class="error">No teams available for matrix.</div>';
    }

    const isMobile = this.getAttribute('is-mobile') === 'true';
    
    // Mobile gets a completely different HTML structure using tables instead of grid
    if (isMobile) {
      let html = '<table class="matrix-table">';
      
      // Header row with column team names
      html += '<tr><th></th>';
      teams.forEach(team => {
        const teamDisplay = this.getTeamDisplayName(team);
        html += `<th class="top-header" title="${this.escapeHtml(teamDisplay)}">
                <div class="vertical-text">${this.escapeHtml(teamDisplay)}</div>
                </th>`;
      });
      html += '</tr>';
      
      // Main data rows
      teams.forEach(homeTeam => {
        const homeTeamDisplay = this.getTeamDisplayName(homeTeam);
        
        html += '<tr>';
        html += `<th class="row-header" title="${this.escapeHtml(homeTeamDisplay)}">${this.escapeHtml(homeTeamDisplay)}</th>`;
        
        teams.forEach(awayTeam => {
          const cellData = matrix[homeTeam][awayTeam];
          let cellClass = '';
          let content = '';
          
          if (homeTeam === awayTeam) {
            cellClass = 'matrix-cell-same';
          } else if (cellData.status === 'played') {
            cellClass = 'matrix-cell-played';
            content = `<span class="matrix-score">${cellData.match.result.homeScore}-${cellData.match.result.awayScore}</span>`;
          } else if (cellData.status === 'scheduled') {
            cellClass = 'matrix-cell-scheduled';
            content = `<span class="scheduled-indicator">•</span>`;
          } else if (cellData.status === 'none') {
            cellClass = 'matrix-cell-none';
            content = `<span class="add-match-icon">+</span>`;
          }
          
          // Create tooltip text
          let tooltipText = '';
          if (cellData.tooltip) {
            tooltipText = `title="${this.escapeHtml(cellData.tooltip)}"`;
          }
          
          html += `<td class="${cellClass}" ${tooltipText} data-home-team="${this.escapeHtml(homeTeam)}" data-away-team="${this.escapeHtml(awayTeam)}">${content}</td>`;
        });
        
        html += '</tr>';
      });
      
      html += '</table>';
      
      Promise.resolve().then(() => this.setupMatrixEventListeners());
      return html;
    }
    
    // Desktop layout - keep the original grid approach
    const cellSize = '80px';
    
    let html = `<div class="matrix-grid" style="grid-template-columns: ${cellSize} repeat(${teams.length}, ${cellSize});">`;

    // Header row (top-left empty cell + away teams)
    html += '<div class="matrix-cell matrix-header-cell"></div>'; // Top-left empty
    
    teams.forEach(awayTeam => {
      const awayTeamDisplay = this.getTeamDisplayName(awayTeam);
      html += `<div class="matrix-cell matrix-header-cell" title="${this.escapeHtml(awayTeamDisplay)}">
               <div class="matrix-team-name-x">${this.escapeHtml(awayTeamDisplay)}</div>
               </div>`;
    });

    // Matrix rows (home teams + match cells)
    teams.forEach(homeTeam => {
      const homeTeamDisplay = this.getTeamDisplayName(homeTeam);
      
      // Home team header cell
      html += `<div class="matrix-cell matrix-header-cell" title="${this.escapeHtml(homeTeamDisplay)}">
               <div class="matrix-team-name-y">${this.escapeHtml(homeTeamDisplay)}</div>
               </div>`;
      
      // Match cells for this row
      teams.forEach(awayTeam => {
        const cellData = matrix[homeTeam][awayTeam];
        let content = '';
        
        if (cellData.status === 'played') {
          content = `<span class="matrix-score">${cellData.match.result.homeScore}-${cellData.match.result.awayScore}</span>`;
        } else if (cellData.status === 'none') {
          content = `<span class="add-match-icon">+</span>`;
        }

        // Special handling for diagonal cells (same team)
        const cellClass = cellData.status === 'same' ? 'matrix-cell-same-team' : `matrix-cell-${cellData.status}`;
        
        // Update tooltip text to use display names
        let tooltipText = cellData.tooltip;
        if (cellData.match) {
          const homeTeamId = cellData.match.homeTeam._id;
          const awayTeamId = cellData.match.awayTeam._id;
          
          const homeTeamDisplay = this.getTeamDisplayName(homeTeamId);
          const awayTeamDisplay = this.getTeamDisplayName(awayTeamId);
          
          if (cellData.status === 'played') {
            tooltipText = `${new Date(cellData.match.date).toLocaleDateString()}: ${homeTeamDisplay} ${cellData.match.result.homeScore} - ${cellData.match.result.awayScore} ${awayTeamDisplay}`;
          } else if (cellData.status === 'scheduled') {
            tooltipText = cellData.match.date ? `Scheduled: ${new Date(cellData.match.date).toLocaleDateString()} - ${homeTeamDisplay} vs ${awayTeamDisplay}` : `Scheduled: ${homeTeamDisplay} vs ${awayTeamDisplay} (No date)`;
          }
        } else if (cellData.status === 'none') {
          const homeTeamDisplay = this.getTeamDisplayName(homeTeam);
          const awayTeamDisplay = this.getTeamDisplayName(awayTeam);
          tooltipText = `${homeTeamDisplay} vs ${awayTeamDisplay} - No match scheduled`;
        }
        
        const tooltipHtml = tooltipText ? `<div class="tooltip">${this.escapeHtml(tooltipText)}</div>` : '';

        html += `
          <div 
            class="matrix-cell ${cellClass}" 
            data-home-team="${this.escapeHtml(homeTeam)}" 
            data-away-team="${this.escapeHtml(awayTeam)}"
          >
            ${content}
            ${tooltipHtml}
          </div>
        `;
      });
    });

    html += '</div>';
    
    Promise.resolve().then(() => this.setupMatrixEventListeners());
    return html;
  }

  setupMatrixEventListeners() {
    const isMobile = this.getAttribute('is-mobile') === 'true';
    const selector = isMobile ? '.matrix-table td' : '.matrix-grid .matrix-cell:not(.matrix-header-cell)';
    
    const matrixCells = this.shadow.querySelectorAll(selector);
    matrixCells.forEach(cell => {
      cell.onclick = () => {
        const homeTeamId = cell.dataset.homeTeam;
        const awayTeamId = cell.dataset.awayTeam;
        if (homeTeamId === awayTeamId) return;
        const matrixData = this._prepareMatrixData();
        if (!matrixData || !matrixData.matrix[homeTeamId] || !matrixData.matrix[homeTeamId][awayTeamId]) return;
        let matchObject = matrixData.matrix[homeTeamId][awayTeamId].match;
        if (!matchObject) {
          matchObject = {
            homeTeam: { _id: homeTeamId, name: this.getTeamDisplayName(homeTeamId) },
            awayTeam: { _id: awayTeamId, name: this.getTeamDisplayName(awayTeamId) },
            date: null,
            result: null,
            key: `temp_${homeTeamId}_vs_${awayTeamId}_${Date.now()}`
          };
        }
        // Use openMatchModal instead of event
        const teams = matrixData.teams;
        this.openMatchModal(matchObject, teams, matchObject.key && !matchObject.key.startsWith('temp_') ? 'edit' : 'new');
      };
    });
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
          <div class="trends-graph-area">
            ${graphAreaHTML}
          </div>
          <div class="trends-graph-legend">
            ${legendHTML} <!-- Initially empty, populated by drawPointsOverTimeSVG -->
          </div>
        </div>
      </div>
    `;
  }

  _preparePointsOverTimeData() {
    if (!this.data || 
        !this.data.matches || !Array.isArray(this.data.matches) || 
        !this.data.table || !this.data.table.leagueData || !Array.isArray(this.data.table.leagueData)) {
      console.warn('_preparePointsOverTimeData: Essential data is missing. Clearing chart data.');
      this.pointsOverTimeChartData = { dates: [], teamSeries: {}, allTeamNames: [] };
      return;
    }

    const allTeamIds = this.data.table.leagueData.map(team => team.teamId);
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

  ensureTeamColors() {
    if (!this.data || !this.data.table || !Array.isArray(this.data.table.leagueData)) {
      console.warn('Cannot ensure team colors: leagueData is missing.');
      this.teamColors = {}; // Reset or ensure it's an empty object
      return;
    }

    const PREDEFINED_COLORS = [
      '#1f77b4',  // Muted Blue
      '#ff7f0e',  // Safety Orange
      '#2ca02c',  // Cooked Asparagus Green
      '#d62728',  // Brick Red
      '#9467bd',  // Muted Purple
      '#8c564b',  // Chestnut Brown
      '#e377c2',  // Raspberry Sorbet Pink
      '#7f7f7f',  // Middle Gray
      '#bcbd22',  // Curry Yellow-Green
      '#17becf',  // Dark Cyan
      '#aec7e8',  // Light Blue
      '#ffbb78',  // Light Orange
      '#98df8a',  // Light Green
      '#ff9896',  // Light Red
      '#c5b0d5',  // Light Purple
    ];

    let colorIndex = 0;
    const teams = this.data.table.leagueData;

    // First, assign colors to teams that are already in teamColors but might have an old color
    // (or ensure existing tracked teams get a color if they somehow missed out)
    // This part is more about maintaining consistency if teams are already tracked.
    // For a fresh assignment, the loop below is key.

    teams.forEach(team => {
      if (!this.teamColors[team.teamId]) {
        this.teamColors[team.teamId] = PREDEFINED_COLORS[colorIndex % PREDEFINED_COLORS.length];
        colorIndex++;
      }
    });

    // Ensure any team in selectedTeamsForGraph (even if not in current leagueData, though unlikely) has a color
    // This is a defensive step.
    this.selectedTeamsForGraph.forEach(teamId => {
      if (!this.teamColors[teamId]) {
        this.teamColors[teamId] = PREDEFINED_COLORS[colorIndex % PREDEFINED_COLORS.length];
        colorIndex++;
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
        allTeamNames.forEach(teamName => {
            const color = this.teamColors[teamName] || '#ccc';
            const isChecked = this.selectedTeamsForGraph.has(teamName);
            const teamDisplayName = this.getTeamDisplayName(teamName);

            const legendItemLabel = document.createElement('label');
            legendItemLabel.className = 'legend-item';
            legendItemLabel.title = `Toggle visibility for ${this.escapeHtml(teamDisplayName)}`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'trends-team-toggle-cb';
            checkbox.value = teamName; // Keep original ID as value for data lookups
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
    selectedTeams.forEach(teamName => {
      if (teamSeries[teamName]) {
        const teamMaxPoints = Math.max(...teamSeries[teamName], 0);
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
            
            const isMobile = this.getAttribute('is-mobile') === 'true';
            let dateLabelText;
            if (isMobile) {
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
    selectedTeams.forEach(teamName => {
      const teamPointData = teamSeries[teamName];
      const color = this.teamColors[teamName] || '#ccc';

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
          const teamName = event.target.value;
          if (event.target.checked) {
            this.selectedTeamsForGraph.add(teamName);
          } else {
            this.selectedTeamsForGraph.delete(teamName);
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
  // END - Placeholder for Trends View Methods

  // START - New methods for table filtering and data processing

  _getFilteredLeagueData() {
    if (!this.data || !this.data.matches || !this.data.table || !this.data.table.leagueData) {
      return [];
    }

    // Get team IDs from league data
    const allTeamIdsInLeague = this.data.table.leagueData.map(t => t.teamId);
    const allMatchesWithResults = this.data.matches.filter(m => 
      m.result && 
      typeof m.result.homeScore === 'number' && 
      typeof m.result.awayScore === 'number'
    );

    // Calculate the full current league table based on this.tableFilter
    const currentFilteredLeague = allTeamIdsInLeague.map(teamId => {
      let played = 0;
      let won = 0;
      let drawn = 0;
      let lost = 0;
      let shotsFor = 0;
      let shotsAgainst = 0;
      let points = 0;
      const teamFilteredMatches = []; // For form icons and tooltips

      allMatchesWithResults.forEach(match => {
        if (!match.result || typeof match.result.homeScore !== 'number' || typeof match.result.awayScore !== 'number') {
          return; // Skip matches without results
        }

        // Get team IDs from match
        const homeTeamId = match.homeTeam._id;
        const awayTeamId = match.awayTeam._id;
        
        if (!homeTeamId || !awayTeamId) {
          return; // Skip if team IDs are missing
        }

        const homeScore = match.result.homeScore;
        const awayScore = match.result.awayScore;
        let matchResultForTeam = ''; // W, D, L for the current team in this match

        if (this.tableFilter === 'home') {
          if (homeTeamId === teamId) {
            played++;
            shotsFor += homeScore;
            shotsAgainst += awayScore;
            if (homeScore > awayScore) {
              won++; points += 3; matchResultForTeam = 'W';
            } else if (homeScore === awayScore) {
              drawn++; points += 1; matchResultForTeam = 'D';
            } else {
              lost++; matchResultForTeam = 'L';
            }
            teamFilteredMatches.push({ 
              result: matchResultForTeam, 
              date: match.date, 
              homeTeam: { _id: homeTeamId, name: this.getTeamDisplayName(homeTeamId) },
              awayTeam: { _id: awayTeamId, name: this.getTeamDisplayName(awayTeamId) },
              homeScore, 
              awayScore,
              // Add display names for tooltip readability
              homeTeamDisplayName: this.getTeamDisplayName(homeTeamId),
              awayTeamDisplayName: this.getTeamDisplayName(awayTeamId)
            });
          }
        } else if (this.tableFilter === 'away') {
          if (awayTeamId === teamId) {
            played++;
            shotsFor += awayScore;
            shotsAgainst += homeScore;
            if (awayScore > homeScore) {
              won++; points += 3; matchResultForTeam = 'W';
            } else if (awayScore === homeScore) {
              drawn++; points += 1; matchResultForTeam = 'D';
            } else {
              lost++; matchResultForTeam = 'L';
            }
            teamFilteredMatches.push({ 
              result: matchResultForTeam, 
              date: match.date, 
              homeTeam: { _id: homeTeamId, name: this.getTeamDisplayName(homeTeamId) },
              awayTeam: { _id: awayTeamId, name: this.getTeamDisplayName(awayTeamId) },
              homeScore, 
              awayScore,
              // Add display names for tooltip readability
              homeTeamDisplayName: this.getTeamDisplayName(homeTeamId),
              awayTeamDisplayName: this.getTeamDisplayName(awayTeamId)
            });
          }
        } else { // 'overall'
          if (homeTeamId === teamId) {
            played++;
            shotsFor += homeScore;
            shotsAgainst += awayScore;
            if (homeScore > awayScore) {
              won++; points += 3; matchResultForTeam = 'W';
            } else if (homeScore === awayScore) {
              drawn++; points += 1; matchResultForTeam = 'D';
            } else {
              lost++; matchResultForTeam = 'L';
            }
            teamFilteredMatches.push({ 
              result: matchResultForTeam, 
              date: match.date, 
              homeTeam: { _id: homeTeamId, name: this.getTeamDisplayName(homeTeamId) },
              awayTeam: { _id: awayTeamId, name: this.getTeamDisplayName(awayTeamId) },
              homeScore, 
              awayScore,
              // Add display names for tooltip readability
              homeTeamDisplayName: this.getTeamDisplayName(homeTeamId),
              awayTeamDisplayName: this.getTeamDisplayName(awayTeamId)
            });
          } else if (awayTeamId === teamId) {
            played++;
            shotsFor += awayScore;
            shotsAgainst += homeScore;
            if (awayScore > homeScore) {
              won++; points += 3; matchResultForTeam = 'W';
            } else if (awayScore === homeScore) {
              drawn++; points += 1; matchResultForTeam = 'D';
            } else {
              lost++; matchResultForTeam = 'L';
            }
            teamFilteredMatches.push({ 
              result: matchResultForTeam, 
              date: match.date, 
              homeTeam: { _id: homeTeamId, name: this.getTeamDisplayName(homeTeamId) },
              awayTeam: { _id: awayTeamId, name: this.getTeamDisplayName(awayTeamId) },
              homeScore, 
              awayScore,
              // Add display names for tooltip readability
              homeTeamDisplayName: this.getTeamDisplayName(homeTeamId),
              awayTeamDisplayName: this.getTeamDisplayName(awayTeamId)
            });
          }
        }
      });

      teamFilteredMatches.sort((a, b) => new Date(b.date) - new Date(a.date));

      return {
        teamId: teamId, // Store the team ID
        teamName: teamId, // Legacy support
        teamDisplayName: this.getTeamDisplayName(teamId), // Add display name for the team
        played,
        won,
        drawn,
        lost,
        shotsFor,
        shotsAgainst,
        shotDifference: shotsFor - shotsAgainst,
        points,
        matches: teamFilteredMatches.slice(0, 5).map(m => ({
          result: m.result,
          description: `${new Date(m.date).toLocaleDateString()}: ${m.homeTeamDisplayName} ${m.homeScore}-${m.awayScore} ${m.awayTeamDisplayName}`
        })),
        allMatchesForTooltip: teamFilteredMatches,
        inPromotionPosition: false,
        inRelegationPosition: false
      };
    });

    // Sort teams to establish their rank based on points, shotDifference, etc.
    currentFilteredLeague.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.shotDifference !== a.shotDifference) return b.shotDifference - a.shotDifference;
      if (b.shotsFor !== a.shotsFor) return b.shotsFor - a.shotsFor;
      return a.teamDisplayName.localeCompare(b.teamDisplayName); // Use display name for sort
    });

    // Assign currentRank based on the primary sort for the current view (overall, home, away)
    currentFilteredLeague.forEach((team, index) => {
      team.currentRank = index + 1;
    });

    // Rank movement and promotion/relegation logic, primarily for 'overall' view
    if (this.tableFilter === 'overall') {
      let effectivePreviousRanks = null;

      // Always calculate effectivePreviousRanks based on data before the last match day
      const uniqueResultDates = [...new Set(allMatchesWithResults.map(m => {
        if (!m.date) return null; // Should not happen if filtered by result, but defensive
        return new Date(m.date).setHours(0,0,0,0);
      }).filter(date => date !== null))].sort((a,b) => a - b);

      if (uniqueResultDates.length >= 2) {
          const lastActualMatchDayTimestamp = uniqueResultDates[uniqueResultDates.length - 1];
          const matchesForBaseline = allMatchesWithResults.filter(match => {
              if (!match.date) return false; // Ensure match.date exists
              const matchDateTimestamp = new Date(match.date).setHours(0,0,0,0);
              return matchDateTimestamp < lastActualMatchDayTimestamp;
          });
          if (matchesForBaseline.length > 0) {
              effectivePreviousRanks = this._calculateRanksFromMatches(matchesForBaseline, allTeamIdsInLeague);
          }
      }
      // If uniqueResultDates < 2 or matchesForBaseline is empty, effectivePreviousRanks remains null.

      // Apply movement and promotion/relegation to the currentFilteredLeague (which is already sorted for 'overall')
      currentFilteredLeague.forEach(team => {
        // currentRank is already set from the main sort
        if (effectivePreviousRanks && effectivePreviousRanks[team.teamId] !== undefined) {
          const previousRank = effectivePreviousRanks[team.teamId];
          team.rankMovement = previousRank - team.currentRank;
        } else {
          team.rankMovement = 0; // No previous data or team not in baseline
        }

        // Promotion/relegation for overall table
        if (this.data && this.data.table && this.data.table.metaData) {
          const promotionPlaces = this.data.table.metaData.promotionPlaces || 0;
          const relegationPlaces = this.data.table.metaData.relegationPlaces || 0;
          team.inPromotionPosition = promotionPlaces > 0 && team.currentRank <= promotionPlaces;
          team.inRelegationPosition = relegationPlaces > 0 && team.currentRank >= (currentFilteredLeague.length - relegationPlaces + 1);
        } else {
          team.inPromotionPosition = false;
          team.inRelegationPosition = false;
        }
      });

    } else { // For 'home' or 'away' filters, rank is per that table, no overall movement shown
      currentFilteredLeague.forEach(team => {
        team.rankMovement = 0;
        team.inPromotionPosition = false;
        team.inRelegationPosition = false;
      });
    }
    
    return currentFilteredLeague;
  }

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
    
    // Only show indicators for actual movement
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
      return null;
    }

    const stats = allTeamIdsInLeague.map(teamId => {
      let played = 0;
      let won = 0;
      let drawn = 0;
      let lost = 0;
      let shotsFor = 0;
      let shotsAgainst = 0;
      let points = 0;

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

        if (homeTeamId === teamId) {
          played++;
          shotsFor += homeScore;
          shotsAgainst += awayScore;
          if (homeScore > awayScore) { won++; points += 3; }
          else if (homeScore === awayScore) { drawn++; points += 1; }
          else { lost++; }
        } else if (awayTeamId === teamId) {
          played++;
          shotsFor += awayScore;
          shotsAgainst += homeScore;
          if (awayScore > homeScore) { won++; points += 3; }
          else if (awayScore === homeScore) { drawn++; points += 1; }
          else { lost++; }
        }
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
        points
      };
    });

    // Sort teams based on points, shotDifference, shotsFor (standard league sorting)
    stats.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.shotDifference !== a.shotDifference) return b.shotDifference - a.shotDifference;
      if (b.shotsFor !== a.shotsFor) return b.shotsFor - a.shotsFor;
      return a.teamDisplayName.localeCompare(b.teamDisplayName);
    });

    const rankMap = {};
    stats.forEach((team, index) => {
      rankMap[team.teamId] = index + 1; // 1-indexed rank
    });
    
    return rankMap;
  }

  /**
   * Open the match modal dialog.
   * @param {Object} matchData
   * @param {Array<string>} teams - Array of team IDs
   * @param {'edit'|'new'} mode
   */
  openMatchModal(matchData, teams, mode = 'edit') {
    this.matchModalOpen = true;
    this.matchModalData = matchData;
    this.matchModalTeams = teams;
    this.matchModalMode = mode;

    // ADDED CONSOLE LOGS
    console.log('[LeagueElement - openMatchModal] Opening modal with:');
    console.log('[LeagueElement - openMatchModal] Mode:', mode);
    console.log('[LeagueElement - openMatchModal] Match Data (this.matchModalData):', this.matchModalData);
    console.log('[LeagueElement - openMatchModal] Teams for dropdown (this.matchModalTeams):', this.matchModalTeams);
    console.log('[LeagueElement - openMatchModal] lovebowlsTeams available:', this.lovebowlsTeams);

    this.render();
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
      // console.log('Date selected in upcoming fixtures calendar:', selectedDateFromUpcoming);
      // If LeagueMatchesRecent or other components need to react to this specific date selection,
      // you would update their 'selected-date' attributes here and re-render them or parts of the UI.
      // For example, if LeagueMatchesRecent should also filter by this date:
      // const recentMatchesEl = this.shadow.querySelector(this.getAttribute('isMobile') === 'true' ? '#mobile-recent-matches' : '#desktop-recent-matches');
      // if (recentMatchesEl) {
      //   if (selectedDateFromUpcoming) {
      //     recentMatchesEl.setAttribute('selected-date', new Date(selectedDateFromUpcoming).toISOString().split('T')[0]);
      //   } else {
      //     recentMatchesEl.removeAttribute('selected-date');
      //   }
      // }
      // Currently, selectedResultDate is distinct. If desired, we could unify them or sync them here.
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

  // Helper method to get teams from league data with fallback
  _getTeamsFromLeagueData() {
    // First try to use teams directly from data
    if (this.data && this.data.teams && Array.isArray(this.data.teams)) {
      return this.data.teams;
    } 
    // If not available, try to extract from table data
    else if (this.data && this.data.table && this.data.table.leagueData) {
      return this.data.table.leagueData.map(team => ({
        _id: team.teamId,
        name: team.teamDisplayName || this.getTeamDisplayName(team.teamId)
      }));
    }
    // Return empty array if no teams found
    return [];
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
}

// Register the custom element
customElements.define('league-element', LeagueElement);

export default LeagueElement; 