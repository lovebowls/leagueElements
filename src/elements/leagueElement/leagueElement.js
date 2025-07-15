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

import '../LeagueMatchesAttention/LeagueMatchesAttention.js';
import '../leagueMatch/leagueMatch.js';
import '../LeagueSchedule/LeagueSchedule.js';

import {  MOBILE_STYLES,  DESKTOP_STYLES,  TABLE_HEADER,  MOBILE_TEMPLATE,  DESKTOP_TEMPLATE} from './leagueElement-styles.js';
import { getMobileStyles, getDesktopStyles } from '../shared-styles.js';
import { Temporal, TemporalUtils } from '../../utils/temporalUtils.js'; // ADDED IMPORT
import { League, Match } from '@lovebowls/leaguejs';
import { FormUtils } from '../../utils/formUtils.js';
import { exportTableToExcel, exportTableToWord } from '../../utils/data.js';

class LeagueElement extends HTMLElement {

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.data = null;
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
    this._handleScheduleMatchEditBound = null; // Bound function for schedule match edit events
    this.selectedTeamForSchedule = null; // Track selected team for schedule filtering
  }

  get _isMobile() {
    return this.getAttribute('is-mobile') === 'true';
  }
  
  get _canEdit() {
    return this.getAttribute('can-edit') === 'true';
  }

  get _fontScale() {
    const scale = parseFloat(this.getAttribute('font-scale')) || 1.0;
    // Clamp the scale between 0.5 and 2.0 for reasonable bounds
    return Math.max(0.5, Math.min(2.0, scale));
  }
  static get observedAttributes() {
    return ['data', 'selectedMatch', 'is-mobile', 'lovebowls-teams', 'can-edit', 'font-scale'];
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
    } else if (name === 'can-edit') {
      this.render();
    } else if (name === 'font-scale') {
      this.render(); // Font scale change requires re-render to update styles
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

    // Conditionally render attention panel based on can-edit
    const attentionPanel = this._canEdit ? 
      (this._isMobile ? 
        `<div class="panel">
          <div class="panel-header panel-header-shared">Requiring Attention</div>
          <league-matches-attention id="mobile-attention-matches" is-mobile="true"></league-matches-attention>
        </div>` :
        `<div class="panel">
          <div class="panel-header panel-header-shared">Requiring Attention</div>
          <league-matches-attention id="desktop-attention-matches"></league-matches-attention>
        </div>`
      ) : '';

    // Generate can-edit attribute for child components
    const canEditAttr = this._canEdit ? 'can-edit="true"' : 'can-edit="false"';

    // For desktop, conditionally show/hide the entire right panel and resizer
    let processedTemplate = template;
    if (!this._isMobile && !this._canEdit) {
      // Hide the resizer and right panel when not in edit mode on desktop
      processedTemplate = template
        .replace('<div class="dashboard">', '<div class="dashboard no-right-panel">')
        .replace('<div class="resizer"></div>', '<div class="resizer" style="display: none;"></div>')
        .replace('<div class="right-panel">', '<div class="right-panel" style="display: none;">');
    }

    return processedTemplate
      .replace(/\{\{title\}\}/g, currentTitle)
      .replace('{{tableRows}}', this.tableRows)
      .replace('{{matrixView}}', this.activeView === 'matrix' ? this.renderMatrix() : '')
      .replace('{{trendsViewContent}}', this.activeView === 'trends' ? this.renderTrendsViewContent() : '')
      .replace('{{attentionPanel}}', attentionPanel)
      .replace(/\{\{canEditAttr\}\}/g, canEditAttr)
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
          <tr class="team-row" data-team-id="${team.teamId}" data-team-name="${this.escapeHtml(team.teamDisplayName)}"> 
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
      this._prepareShotsForVsAgainstData();
      this._prepareFormOverTimeData();
      this.ensureTeamColors();

      // Render based on device type
      const baseTemplate = this._isMobile ? MOBILE_TEMPLATE : DESKTOP_TEMPLATE;
      this.shadow.innerHTML = `
        <style>
          ${this._isMobile ? getMobileStyles(this._fontScale) : getDesktopStyles(this._fontScale)}
          ${this._isMobile ? MOBILE_STYLES : DESKTOP_STYLES}
        </style>
        ${this._fillTemplate(baseTemplate)}
      `;
      
      // Configure the attention matches components (only if editing is enabled)
      if (this._canEdit) {
        const attentionMatchesElement = this.shadow.querySelector(this._isMobile ? '#mobile-attention-matches' : '#desktop-attention-matches');
        if (attentionMatchesElement) {
          attentionMatchesElement.setAttribute('is-mobile', this._isMobile.toString());
          attentionMatchesElement.setAttribute('font-scale', String(this._fontScale));
          // Pass the whole league data instead of just matches
          attentionMatchesElement.setAttribute('data', JSON.stringify(this.data));
          
          // Add team mapping data for display name resolution
          attentionMatchesElement.setAttribute('team-mapping', JSON.stringify(this._getTeamsFromLeagueData()));

          attentionMatchesElement.removeEventListener('league-matches-attention-event', this._handleAttentionMatchClick);
          this._handleAttentionMatchClickBound = this._handleAttentionMatchClick.bind(this);
          attentionMatchesElement.addEventListener('league-matches-attention-event', this._handleAttentionMatchClickBound);
        }
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
      this.setupTableRowEvents(); // Set up double-click events for team rows
      if (this.activeView === 'trends') { // If trends tab is active by default (e.g. on reload/state persistence)
        this.setupTrendsViewInteractivity(); // Ensure interactivity is set up
      }
      
      // Configure the schedule component
      const scheduleElement = this.shadow.querySelector(this._isMobile ? '#mobile-schedule' : '#desktop-schedule');
      if (scheduleElement) {
        scheduleElement.setAttribute('is-mobile', this._isMobile.toString());
        scheduleElement.setAttribute('font-scale', String(this._fontScale));
        scheduleElement.setAttribute('can-edit', this._canEdit.toString());
        
        if (this.data) {
          // Pass the entire league data to the schedule component
          scheduleElement.setAttribute('data', JSON.stringify(this.data));
        } else {
          console.warn('[LeagueElement] render: this.data is NOT available for scheduleElement.');
        }
        
        // The schedule component now manages its own date filtering through its embedded calendar
        
        // Pass the selected team for schedule filtering
        if (this.selectedTeamForSchedule) {
          scheduleElement.setAttribute('selected-team', this.selectedTeamForSchedule);
        } else {
          scheduleElement.removeAttribute('selected-team');
        }
        
        // If the schedule view is active, set up its event listeners
        if (this.activeView === 'schedule') {
          this._setupScheduleEventListeners();
        }
      }



    } else {
      // Show error if data is missing or invalid
      this.shadow.innerHTML = `<div class="error">Invalid or missing league data</div>`;
    }

    // Render match modal separately to avoid full component re-renders
    this._renderMatchModal();
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

    // Skip setup if resizer is hidden (when not in edit mode)
    if (resizer.style.display === 'none') {
      console.log('Resizer is hidden, skipping setupResizer.');
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
   * Renders the form icons with tooltips for matches.
   * @param {Array<Object>|string} [matches=[]] - An array of match objects or a form string
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
    const scheduleViewDesktop = this.shadow.querySelector('#desktop-schedule-view');
    const matrixViewDesktop = this.shadow.querySelector('#desktop-matrix-view');
    const trendsViewDesktop = this.shadow.querySelector('#desktop-trends-view');
    const tableViewMobile = this.shadow.querySelector('#mobile-table-view');
    const scheduleViewMobile = this.shadow.querySelector('#mobile-schedule-view');
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
    const isScheduleActive = this.activeView === 'schedule';
    const isMatrixActive = this.activeView === 'matrix';
    const isTrendsActive = this.activeView === 'trends';

    if (tableViewDesktop) tableViewDesktop.style.display = isTableActive ? '' : 'none';
    if (scheduleViewDesktop) scheduleViewDesktop.style.display = isScheduleActive ? '' : 'none';
    if (matrixViewDesktop) matrixViewDesktop.style.display = isMatrixActive ? '' : 'none';
    if (trendsViewDesktop) trendsViewDesktop.style.display = isTrendsActive ? '' : 'none';
    if (tableViewMobile) tableViewMobile.style.display = isTableActive ? '' : 'none';
    if (scheduleViewMobile) scheduleViewMobile.style.display = isScheduleActive ? '' : 'none';
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
          } else if (this.activeView === 'schedule') {
            // Set up schedule event listeners after DOM is ready
            Promise.resolve().then(() => {
                this._setupScheduleEventListeners();
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
   * Sorts teams by their form using a weighted scoring system.
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
   * @returns {number} Form score (0-3 range, proportionally scaled for fewer matches)
   */
  _calculateFormScore(formMatches) {
    if (!Array.isArray(formMatches) || formMatches.length === 0) {
      return 0;
    }

    // Convert form match objects to the format expected by the generalized function
    // This is a bridge between the old format and the new generalized approach
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
      graphTypeSelect.value = this.activeTrendGraphType; // Set initial value
      graphTypeSelect.addEventListener('change', (event) => {
        this.activeTrendGraphType = event.target.value;
        // Re-rendering is the simplest way to handle the view change,
        // as it will correctly call the appropriate draw function
        // within renderTrendsViewContent.
        this.render();
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
          // Update "Select All" checkbox state
          this._updateSelectAllCheckboxState();
          
          // Redraw the appropriate graph based on active type
          // No need to call render() here, just redraw the SVG content.
          if (this.activeTrendGraphType === 'shotsForVsAgainst') {
            this.drawShotsForVsAgainstSVG();
          } else if (this.activeTrendGraphType === 'formOverTime') {
            this.drawFormOverTimeSVG();
          } else {
            this.drawPointsOverTimeSVG();
          }
        } else if (event.target.matches('.trends-select-all-cb')) {
          // Handle "Select All" checkbox
          const isChecked = event.target.checked;
          const allTeamCheckboxes = this.shadow.querySelectorAll('.trends-team-toggle-cb');
          
          if (isChecked) {
            // Select all teams
            allTeamCheckboxes.forEach(checkbox => {
              checkbox.checked = true;
              this.selectedTeamsForGraph.add(checkbox.value);
            });
          } else {
            // Deselect all teams
            allTeamCheckboxes.forEach(checkbox => {
              checkbox.checked = false;
              this.selectedTeamsForGraph.delete(checkbox.value);
            });
          }
          
          // Redraw the appropriate graph based on active type
          if (this.activeTrendGraphType === 'shotsForVsAgainst') {
            this.drawShotsForVsAgainstSVG();
          } else if (this.activeTrendGraphType === 'formOverTime') {
            this.drawFormOverTimeSVG();
          } else {
            this.drawPointsOverTimeSVG();
          }
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
    let legendHTML = ''; // Legend is now fully populated by the specific draw...SVG function
    let graphAreaHTML = '<svg id="points-over-time-svg" width="100%" height="100%"></svg>'; // Height 100% to fill parent

    // Data availability checks for graph area
    const hasDataForPoints = this.pointsOverTimeChartData && this.pointsOverTimeChartData.dates && this.pointsOverTimeChartData.dates.length > 0;
    const hasDataForShots = this.shotsForVsAgainstData && this.shotsForVsAgainstData.teams && this.shotsForVsAgainstData.teams.length > 0;
    const hasDataForForm = this.formOverTimeChartData && this.formOverTimeChartData.dates && this.formOverTimeChartData.dates.length > 0;

    let dataUnavailable = false;
    if (this.activeTrendGraphType === 'pointsOverTime' && !hasDataForPoints) dataUnavailable = true;
    if (this.activeTrendGraphType === 'shotsForVsAgainst' && !hasDataForShots) dataUnavailable = true;
    if (this.activeTrendGraphType === 'formOverTime' && !hasDataForForm) dataUnavailable = true;

    if (dataUnavailable) {
        graphAreaHTML = '<p style="text-align:center; padding-top: 20px;">Graph cannot be displayed: Data unavailable or insufficient for the selected type.</p>';
    }
    
    // Defer drawing the SVG until after this content is in the DOM
    // and if the trends tab is actually active.
    if (this.activeView === 'trends') {
        Promise.resolve().then(() => {
            if (this.shadow.querySelector('#points-over-time-svg')) { // Ensure element exists
                if (this.activeTrendGraphType === 'shotsForVsAgainst') {
                    this._prepareShotsForVsAgainstData();
                    this.drawShotsForVsAgainstSVG();
                } else if (this.activeTrendGraphType === 'formOverTime') {
                    this._prepareFormOverTimeData();
                    this.drawFormOverTimeSVG();
                } else {
                    this.drawPointsOverTimeSVG();
                }
            }
        });
    }

    return `
      <div class="trends-view-wrapper">
        <div class="controls-panel">
          <div class="dropdown-shared">
            <select id="graph-type-select" class="dropdown-select-shared">
              <option value="pointsOverTime">Points Over Time</option>
              <option value="shotsForVsAgainst">Shots For vs Against</option>
              <option value="formOverTime">Form Over Time</option>
              <!-- Future graph types will be added here -->
            </select>
          </div>
        </div>
        <div class="trends-content-area">
          <div class="trends-graph-legend">
            ${legendHTML} <!-- Initially empty, populated by the draw...SVG functions -->
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

  _prepareShotsForVsAgainstData() {
    const tableData = this._table;
    const table = Array.isArray(tableData) ? tableData : (tableData?.leagueData || []);
    
    if (!this.data || 
        !this.data.matches || !Array.isArray(this.data.matches) || 
        !Array.isArray(table) || table.length === 0) {
      console.warn('_prepareShotsForVsAgainstData: Essential data is missing. Clearing chart data.');
      this.shotsForVsAgainstData = { teams: [], averageShotsFor: 0, averageShotsAgainst: 0, maxShotsFor: 0, maxShotsAgainst: 0 };
      return;
    }

    const allTeamIds = table.map(team => team.teamId);
    if (allTeamIds.length === 0) {
      console.warn('_prepareShotsForVsAgainstData: No teams found in leagueData. Clearing chart data.');
      this.shotsForVsAgainstData = { teams: [], averageShotsFor: 0, averageShotsAgainst: 0, maxShotsFor: 0, maxShotsAgainst: 0 };
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
      console.warn('_prepareShotsForVsAgainstData: No valid matches with results found for analysis.');
      this.shotsForVsAgainstData = { teams: [], averageShotsFor: 0, averageShotsAgainst: 0, maxShotsFor: 0, maxShotsAgainst: 0 };
      return;
    }

    // Calculate shots for/against for each team
    const teamStats = {};
    allTeamIds.forEach(teamId => {
      teamStats[teamId] = {
        teamId,
        teamName: this.getTeamDisplayName(teamId),
        shotsFor: 0,
        shotsAgainst: 0,
        matchesPlayed: 0
      };
    });

    validMatches.forEach(match => {
      const homeTeamId = match.homeTeam._id;
      const awayTeamId = match.awayTeam._id;
      const homeScore = match.result.homeScore;
      const awayScore = match.result.awayScore;

      if (teamStats[homeTeamId]) {
        teamStats[homeTeamId].shotsFor += homeScore;
        teamStats[homeTeamId].shotsAgainst += awayScore;
        teamStats[homeTeamId].matchesPlayed++;
      }

      if (teamStats[awayTeamId]) {
        teamStats[awayTeamId].shotsFor += awayScore;
        teamStats[awayTeamId].shotsAgainst += homeScore;
        teamStats[awayTeamId].matchesPlayed++;
      }
    });

    // Convert to array and calculate averages/maximums
    const teams = Object.values(teamStats).filter(team => team.matchesPlayed > 0);
    
    if (teams.length === 0) {
      this.shotsForVsAgainstData = { teams: [], averageShotsFor: 0, averageShotsAgainst: 0, maxShotsFor: 0, maxShotsAgainst: 0 };
      return;
    }

    const totalShotsFor = teams.reduce((sum, team) => sum + team.shotsFor, 0);
    const totalShotsAgainst = teams.reduce((sum, team) => sum + team.shotsAgainst, 0);
    const totalMatches = teams.reduce((sum, team) => sum + team.matchesPlayed, 0);

    const averageShotsFor = totalMatches > 0 ? totalShotsFor / totalMatches : 0;
    const averageShotsAgainst = totalMatches > 0 ? totalShotsAgainst / totalMatches : 0;
    const maxShotsFor = Math.max(...teams.map(team => team.shotsFor), 0);
    const maxShotsAgainst = Math.max(...teams.map(team => team.shotsAgainst), 0);

    this.shotsForVsAgainstData = {
      teams,
      averageShotsFor,
      averageShotsAgainst,
      maxShotsFor,
      maxShotsAgainst
    };
  }

  _prepareFormOverTimeData() {
    const tableData = this._table;
    const table = Array.isArray(tableData) ? tableData : (tableData?.leagueData || []);
    
    if (!this.data || 
        !this.data.matches || !Array.isArray(this.data.matches) || 
        !Array.isArray(table) || table.length === 0) {
      console.warn('_prepareFormOverTimeData: Essential data is missing. Clearing chart data.');
      this.formOverTimeChartData = { dates: [], teamSeries: {}, allTeamNames: [] };
      return;
    }

    const allTeamIds = table.map(team => team.teamId);
    if (allTeamIds.length === 0) {
      console.warn('_prepareFormOverTimeData: No teams found in leagueData. Clearing chart data.');
      this.formOverTimeChartData = { dates: [], teamSeries: {}, allTeamNames: [] };
      return;
    }

    // Use FormUtils to generate form over time data
    this.formOverTimeChartData = FormUtils.generateFormOverTimeData(
      allTeamIds, 
      this.data.matches, 
      this.tableFilter
    );

    // Update the property names to match existing chart structure
    this.formOverTimeChartData.allTeamNames = this.formOverTimeChartData.allTeamIds;
    delete this.formOverTimeChartData.allTeamIds;
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
        // Add "Select All" checkbox if there are at least 2 teams
        const selectAllElement = this._createSelectAllCheckbox(allTeamNames);
        if (selectAllElement) {
            legendDiv.appendChild(selectAllElement);
        }

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

        // Update "Select All" checkbox state after adding all team checkboxes
        this._updateSelectAllCheckboxState();
    } else {
        legendDiv.innerHTML = '<p>No teams found for legend.</p>';
        // If no teams at all, SVG also can reflect this, though earlier checks might catch it.
        svg.innerHTML = '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">No teams found in data.</text>';
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

  drawShotsForVsAgainstSVG() {
    const svg = this.shadow.querySelector('#points-over-time-svg');
    const legendDiv = this.shadow.querySelector('.trends-graph-legend');

    if (!svg || !legendDiv) {
      // This can happen briefly during a re-render, so we'll add a check.
      // If the trends view isn't active, we shouldn't be trying to draw.
      if (this.activeView === 'trends') {
        console.error('SVG or Legend container not found for shots scatter plot.');
      }
      return;
    }

    // Clear previous content
    svg.innerHTML = '';
    legendDiv.innerHTML = '';

    if (!this.shotsForVsAgainstData || !this.shotsForVsAgainstData.teams || this.shotsForVsAgainstData.teams.length === 0) {
      svg.innerHTML = '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">No shot data available for scatter plot.</text>';
      legendDiv.innerHTML = '<p>Legend cannot be displayed: No shot data available.</p>';
      return;
    }

    const { teams, averageShotsFor, averageShotsAgainst, maxShotsFor, maxShotsAgainst } = this.shotsForVsAgainstData;

    // Populate the legend with all teams
    // Add "Select All" checkbox if there are at least 2 teams
    const allTeamIds = teams.map(team => team.teamId);
    const selectAllElement = this._createSelectAllCheckbox(allTeamIds);
    if (selectAllElement) {
        legendDiv.appendChild(selectAllElement);
    }

    teams.forEach(team => {
      const color = this.teamColors[team.teamId] || '#ccc';
      const isChecked = this.selectedTeamsForGraph.has(team.teamId);

      const legendItemLabel = document.createElement('label');
      legendItemLabel.className = 'legend-item';
      legendItemLabel.title = `Toggle visibility for ${this.escapeHtml(team.teamName)}`;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'trends-team-toggle-cb';
      checkbox.value = team.teamId;
      checkbox.checked = isChecked;
      
      const colorBox = document.createElement('span');
      colorBox.className = 'legend-color-box';
      colorBox.style.backgroundColor = color;

      const nameSpan = document.createElement('span');
      nameSpan.textContent = this.escapeHtml(team.teamName);

      legendItemLabel.appendChild(checkbox);
      legendItemLabel.appendChild(colorBox);
      legendItemLabel.appendChild(nameSpan);
      legendDiv.appendChild(legendItemLabel);
    });

    // Update "Select All" checkbox state after adding all team checkboxes
    this._updateSelectAllCheckboxState();

    // Filter teams based on selection
    const selectedTeams = teams.filter(team => this.selectedTeamsForGraph.has(team.teamId));
    
    if (selectedTeams.length === 0) {
      svg.innerHTML = '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">No teams selected for the scatter plot. Use legend to select.</text>';
      return;
    }

    // Dimensions and margins
    const svgWidth = svg.clientWidth;
    const svgHeight = svg.clientHeight;
    const margin = { top: 20, right: 20, bottom: 60, left: 60 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    if (width <= 0 || height <= 0) {
      svg.innerHTML = '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">Not enough space to render scatter plot.</text>';
      return;
    }

    // Create main group element
    const mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    mainGroup.setAttribute('transform', `translate(${margin.left},${margin.top})`);
    svg.appendChild(mainGroup);

    // Calculate scales with padding
    const maxShotsForPadded = maxShotsFor * 1.1;
    const maxShotsAgainstPadded = maxShotsAgainst * 1.1;

    const xScale = (shotsFor) => (shotsFor / (maxShotsForPadded || 1)) * width;
    const yScale = (shotsAgainst) => height - (shotsAgainst / (maxShotsAgainstPadded || 1)) * height; // Inverted: fewer shots against is better (higher on chart)

    // Helper to create SVG elements
    const createSVGElement = (name, attributes) => {
      const el = document.createElementNS('http://www.w3.org/2000/svg', name);
      for (const key in attributes) {
        el.setAttribute(key, attributes[key]);
      }
      return el;
    };

    // Draw X-axis (Shots For)
    mainGroup.appendChild(createSVGElement('line', { x1: 0, y1: height, x2: width, y2: height, class: 'axis' }));
    const numXTicks = 5;
    for (let i = 0; i <= numXTicks; i++) {
      const shotsForVal = (maxShotsForPadded / numXTicks) * i;
      const x = xScale(shotsForVal);
      mainGroup.appendChild(createSVGElement('line', { x1: x, y1: height, x2: x, y2: height + 6, class: 'axis' }));
      // Grid line
      mainGroup.appendChild(createSVGElement('line', { x1: x, y1: 0, x2: x, y2: height, class: 'grid-line' }));
      const xTickText = createSVGElement('text', { x: x, y: height + 20, 'text-anchor': 'middle', class: 'axis-text' });
      xTickText.textContent = Math.round(shotsForVal).toString();
      mainGroup.appendChild(xTickText);
    }
    const xAxisLabel = createSVGElement('text', {x: width / 2, y: height + 45, 'text-anchor': 'middle', class: 'axis-label'});
    xAxisLabel.textContent = 'Shots For';
    mainGroup.appendChild(xAxisLabel);

    // Draw Y-axis (Shots Against - inverted scale)
    mainGroup.appendChild(createSVGElement('line', { x1: 0, y1: 0, x2: 0, y2: height, class: 'axis' }));
    const numYTicks = 5;
    for (let i = 0; i <= numYTicks; i++) {
      const shotsAgainstVal = (maxShotsAgainstPadded / numYTicks) * i;
      const y = yScale(shotsAgainstVal);
      mainGroup.appendChild(createSVGElement('line', { x1: -6, y1: y, x2: 0, y2: y, class: 'axis' }));
      // Grid line
      mainGroup.appendChild(createSVGElement('line', { x1: 0, y1: y, x2: width, y2: y, class: 'grid-line' }));
      const yTickText = createSVGElement('text', { x: -10, y: y, 'text-anchor': 'end', 'dominant-baseline': 'middle', class: 'axis-text' });
      yTickText.textContent = Math.round(shotsAgainstVal).toString();
      mainGroup.appendChild(yTickText);
    }
    const yAxisLabel = createSVGElement('text', {
        transform: `translate(-45, ${height/2}) rotate(-90)`,
        'text-anchor': 'middle', class: 'axis-label'
    });
    yAxisLabel.textContent = 'Shots Against';
    mainGroup.appendChild(yAxisLabel);

    // Draw average lines (quadrants)
    if (averageShotsFor > 0 && averageShotsAgainst > 0) {
      const avgXPos = xScale(averageShotsFor);
      const avgYPos = yScale(averageShotsAgainst);
      
      // Vertical line for average shots for
      mainGroup.appendChild(createSVGElement('line', { 
        x1: avgXPos, y1: 0, x2: avgXPos, y2: height, 
        class: 'grid-line', 
        'stroke-dasharray': '5,5',
        'stroke': '#666',
        'stroke-width': '1.5'
      }));
      
      // Horizontal line for average shots against
      mainGroup.appendChild(createSVGElement('line', { 
        x1: 0, y1: avgYPos, x2: width, y2: avgYPos, 
        class: 'grid-line', 
        'stroke-dasharray': '5,5',
        'stroke': '#666',
        'stroke-width': '1.5'
      }));
    }

    // Draw team points
    selectedTeams.forEach(team => {
      const color = this.teamColors[team.teamId] || '#ccc';
      const x = xScale(team.shotsFor);
      const y = yScale(team.shotsAgainst);
      
      const circle = createSVGElement('circle', {
        cx: x,
        cy: y,
        r: 6,
        fill: color,
        stroke: '#fff',
        'stroke-width': 2,
        class: 'scatter-point',
        'data-team-id': team.teamId
      });

      // Add hover effect and tooltip
      circle.addEventListener('mouseenter', (e) => {
        e.target.setAttribute('r', 8);
        e.target.style.cursor = 'pointer';
        
        // Smart tooltip positioning to keep it within bounds
        const tooltipText = `${team.teamName}: ${team.shotsFor} for, ${team.shotsAgainst} against`;
        
        // Calculate tooltip dimensions (approximate)
        const charWidth = 7; // Approximate character width for 12px font
        const tooltipWidth = tooltipText.length * charWidth;
        const tooltipHeight = 20; // Approximate height including padding
        
        // Determine optimal position
        let tooltipX = x;
        let tooltipY = y - 15;
        let textAnchor = 'middle';
        
        // Adjust horizontal position if tooltip would extend beyond bounds
        if (x - tooltipWidth/2 < 0) {
          // Too far left, anchor to start
          tooltipX = Math.max(5, x - 6); // Small offset from circle
          textAnchor = 'start';
        } else if (x + tooltipWidth/2 > width) {
          // Too far right, anchor to end
          tooltipX = Math.min(width - 5, x + 6); // Small offset from circle
          textAnchor = 'end';
        }
        
        // Adjust vertical position if tooltip would extend beyond top
        if (y - 15 < tooltipHeight) {
          // Too close to top, show below the point
          tooltipY = y + 25;
        }
        
        // Create tooltip
        const tooltip = createSVGElement('text', {
          x: tooltipX,
          y: tooltipY,
          'text-anchor': textAnchor,
          class: 'scatter-tooltip',
          fill: '#333',
          'font-size': '12px',
          'font-weight': 'bold'
        });
        tooltip.textContent = tooltipText;
        mainGroup.appendChild(tooltip);
      });

      circle.addEventListener('mouseleave', (e) => {
        e.target.setAttribute('r', 6);
        // Remove tooltip
        const tooltip = mainGroup.querySelector('.scatter-tooltip');
        if (tooltip) tooltip.remove();
      });

      mainGroup.appendChild(circle);
    });
  }

  /**
   * Apply simple moving average smoothing to a data series
   * @param {Array<number>} data - Array of numeric values to smooth
   * @param {number} windowSize - Size of the smoothing window (default: 3)
   * @returns {Array<number>} Smoothed data array
   */
  _smoothDataSeries(data, windowSize = 8) {
    if (!Array.isArray(data) || data.length === 0) return data;
    if (windowSize <= 1) return data;
    
    const smoothed = [];
    const halfWindow = Math.floor(windowSize / 2);
    
    for (let i = 0; i < data.length; i++) {
      let sum = 0;
      let count = 0;
      
      // Calculate the window bounds
      const start = Math.max(0, i - halfWindow);
      const end = Math.min(data.length - 1, i + halfWindow);
      
      // Sum values in the window
      for (let j = start; j <= end; j++) {
        if (typeof data[j] === 'number' && !isNaN(data[j])) {
          sum += data[j];
          count++;
        }
      }
      
      // Calculate average, fallback to original value if no valid data
      smoothed[i] = count > 0 ? sum / count : data[i];
    }
    
    return smoothed;
  }

  drawFormOverTimeSVG() {
    const svg = this.shadow.querySelector('#points-over-time-svg');
    const legendDiv = this.shadow.querySelector('.trends-graph-legend');

    if (!svg || !legendDiv) {
      if (this.activeView === 'trends') {
        console.error('SVG or Legend container not found for form over time graph.');
      }
      return;
    }

    // Clear previous content
    svg.innerHTML = '';
    legendDiv.innerHTML = '';

    if (!this.formOverTimeChartData || 
        !this.formOverTimeChartData.dates || 
        !this.formOverTimeChartData.teamSeries) {
      svg.innerHTML = '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">Form over time data is unavailable.</text>';
      legendDiv.innerHTML = '<p>Legend cannot be displayed: Data unavailable.</p>';
      return;
    }

    const { dates, teamSeries, allTeamNames } = this.formOverTimeChartData;

    // Always populate the legend first, so controls are available
    if (allTeamNames && allTeamNames.length > 0) {
        // Add "Select All" checkbox if there are at least 2 teams
        const selectAllElement = this._createSelectAllCheckbox(allTeamNames);
        if (selectAllElement) {
            legendDiv.appendChild(selectAllElement);
        }

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
            checkbox.value = teamId;
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

        // Update "Select All" checkbox state after adding all team checkboxes
        this._updateSelectAllCheckboxState();
    } else {
        legendDiv.innerHTML = '<p>No teams found for legend.</p>';
        svg.innerHTML = '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">No teams found in data.</text>';
        return;
    }

    if (dates.length === 0) {
      svg.innerHTML = '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">No dates available for form graphing.</text>';
      return;
    }

    const selectedTeams = Array.from(this.selectedTeamsForGraph);
    if (selectedTeams.length === 0) {
      svg.innerHTML = '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">No teams selected for the form graph. Use legend to select.</text>';
      return;
    }

    // Dimensions and margins
    const svgWidth = svg.clientWidth;
    const svgHeight = svg.clientHeight;
    const margin = { top: 20, right: 20, bottom: 50, left: 50 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    if (width <= 0 || height <= 0) {
        svg.innerHTML = '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">Not enough space to render form graph.</text>';
        return;
    }

    // Create main group element
    const mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    mainGroup.setAttribute('transform', `translate(${margin.left},${margin.top})`);
    svg.appendChild(mainGroup);

    // Scales
    const minDate = dates[0];
    const maxDate = dates[dates.length - 1];
    
    // Form scores are in 0-1 range (0% to 100% success rate)
    const maxFormScore = 1;

    const xScale = (date) => (date - minDate) / (maxDate - minDate || 1) * width;
    const yScale = (formScore) => height - (formScore / maxFormScore) * height;

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
    const numXTicks = Math.min(dates.length, 5);
    let lastDisplayedMonth = null;

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
                    dateLabelText = '';
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
    const numYTicks = 5; // 0, 0.2, 0.4, 0.6, 0.8, 1.0
    for (let i = 0; i <= numYTicks; i++) {
      const formScoreVal = (maxFormScore / numYTicks) * i;
      const y = yScale(formScoreVal);
      mainGroup.appendChild(createSVGElement('line', { x1: -6, y1: y, x2: 0, y2: y, class: 'axis' }));
      // Grid line
      mainGroup.appendChild(createSVGElement('line', { x1: 0, y1: y, x2: width, y2: y, class: 'grid-line' }));
      const yTickText = createSVGElement('text', { x: -10, y: y, 'text-anchor': 'end', 'dominant-baseline': 'middle', class: 'axis-text' });
      yTickText.textContent = formScoreVal.toFixed(1);
      mainGroup.appendChild(yTickText);
    }
    const yAxisLabel = createSVGElement('text', {
        transform: `translate(-35, ${height/2}) rotate(-90)`,
        'text-anchor': 'middle', class: 'axis-label'
    });
    yAxisLabel.textContent = 'Form Score';
    mainGroup.appendChild(yAxisLabel);

    // Draw lines for selected teams
    selectedTeams.forEach(teamId => {
      const teamFormData = teamSeries[teamId];
      const color = this.teamColors[teamId] || '#ccc';

      if (teamFormData && teamFormData.length === dates.length && dates.length > 1) {
        // Apply smoothing to the form data
        const smoothedFormData = this._smoothDataSeries(teamFormData);
        
        let pathData = 'M';
        for (let i = 0; i < dates.length; i++) {
          pathData += `${xScale(dates[i])},${yScale(smoothedFormData[i])} `;
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

    // Setup export dropdown
    const exportSelect = this.shadow.querySelector('#table-export-select');
    if (exportSelect) {
      exportSelect.onchange = (event) => {
        const exportType = event.target.value;
        if (exportType) {
          this.handleTableExport(exportType);
          // Reset dropdown to default state
          event.target.value = '';
        }
      };
    }
  }

  handleTableExport(exportType) {
    // Get the current filtered table data as displayed
    const filteredTableData = this._getFilteredLeagueData();
    
    if (!filteredTableData || filteredTableData.length === 0) {
      alert('No table data available to export.');
      return;
    }

    // Get league name for the export
    const leagueName = this.data?.name || 'League Table';
    
    // Generate filename based on league name and filter
    const baseFilename = leagueName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    try {
      switch (exportType) {
        case 'excel':
          exportTableToExcel(filteredTableData, this.tableFilter, leagueName, baseFilename);
          break;
        case 'word':
          exportTableToWord(filteredTableData, this.tableFilter, leagueName, baseFilename);
          break;

        default:
          console.warn('Unknown export type:', exportType);
          alert('Unknown export format. Please try again.');
      }
    } catch (error) {
      console.error('Error during table export:', error);
      alert('Error exporting table. Please try again.');
    }
  }

  setupTableRowEvents() {
    // Set up double-click events for team rows to switch to schedule view with team filter
    const teamRows = this.shadow.querySelectorAll('.team-row');
    teamRows.forEach(row => {
      row.addEventListener('dblclick', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const teamId = row.getAttribute('data-team-id');
        const teamName = row.getAttribute('data-team-name');
        
        if (teamId) {
          console.log(`[LeagueElement] Double-clicked team: ${teamName} (${teamId})`);
          
          // Set the selected team for schedule filtering
          this.selectedTeamForSchedule = teamId;
          
          // Switch to schedule view
          this.activeView = 'schedule';
          
          // Re-render to apply the changes
          this.render();
          
          // Set up schedule event listeners after DOM is ready
          Promise.resolve().then(() => {
            this._setupScheduleEventListeners();
          });
          
          // Dispatch event to notify parent components about the team selection
          this.dispatchEvent(new LeagueEvent({
            type: 'teamSelectedForSchedule',
            teamId: teamId,
            teamName: teamName
          }));
        }
      });
      
      // Add visual feedback for double-click capability
      row.style.cursor = 'pointer';
      row.title = `Double-click to view schedule for ${row.getAttribute('data-team-name')}`;
    });
  }

  // END - New methods for table filtering

  /**
   * Renders the rank movement indicator to be placed next to the position.
   * @param {number|undefined} movement - The change in rank. Positive for up, negative for down, 0 for no change.
   * @returns {string} HTML string for the movement indicator.
   */
  renderRankMovementIndicator(movement) {
    let content = ''; // Default is empty for no change
    
    // Show indicators for actual movement in all filter views
    // Each view shows how positions changed within that specific context
    if (typeof movement === 'number' && movement !== 0) {
      const filterContext = this.tableFilter === 'overall' ? '' : ` (${this.tableFilter})`;
      if (movement > 0) { // Moved up
        content = `<span class="rank-up" title="Moved up ${movement} position${movement !== 1 ? 's' : ''}${filterContext}">▲</span>`;
      } else { // Moved down
        const absMovement = Math.abs(movement);
        content = `<span class="rank-down" title="Moved down ${absMovement} position${absMovement !== 1 ? 's' : ''}${filterContext}">▼</span>`;
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

    // Assign currentRank and calculate rankMovement
    stats.forEach((team, index) => {
      team.currentRank = index + 1; // 1-indexed rank
    });

    // Calculate rank movement by comparing current positions with positions after excluding the most recent match day
    // This works for all filter types (overall, home, away, form) as each shows how positions changed
    // within that specific context
    const rankMovements = this._calculateRankMovements(matchesSubset, allTeamIdsInLeague, stats);
    stats.forEach(team => {
      team.rankMovement = rankMovements[team.teamId] || 0;
    });

    return stats;
  }

  /**
   * Calculate rank movements by comparing current table with table excluding most recent match day
   * @param {Array<Object>} matchesSubset - All matches used for current table calculation
   * @param {Array<string>} allTeamIdsInLeague - Array of all team IDs in the league
   * @param {Array<Object>} currentStats - Current team statistics with ranks
   * @returns {Object} Map of teamId to rank movement (positive = moved up, negative = moved down)
   */
     _calculateRankMovements(matchesSubset, allTeamIdsInLeague, currentStats) {
    if (!matchesSubset || matchesSubset.length === 0) {
      return {};
    }

    // For form view, we need a different approach since form is based on last 5 matches
    // We'll compare current form ranking with form ranking excluding the most recent match
    if (this.tableFilter === 'form') {
      return this._calculateFormRankMovements(matchesSubset, allTeamIdsInLeague, currentStats);
    }

    // For other views (overall, home, away), use the standard approach
    // Find the most recent match date
    const sortedMatches = matchesSubset
      .filter(match => match.date && match.result)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (sortedMatches.length === 0) {
      return {};
    }

    const mostRecentDate = new Date(sortedMatches[0].date);
    mostRecentDate.setHours(0, 0, 0, 0);
    const mostRecentTimestamp = mostRecentDate.getTime();

    // Get matches excluding the most recent match day
    const matchesExcludingMostRecent = matchesSubset.filter(match => {
      if (!match.date || !match.result) return false;
      const matchDate = new Date(match.date);
      matchDate.setHours(0, 0, 0, 0);
      return matchDate.getTime() !== mostRecentTimestamp;
    });

    // If no previous matches, no movement to calculate
    if (matchesExcludingMostRecent.length === 0) {
      return {};
    }

    // Calculate previous table (without most recent match day)
    let previousStats = this._calculateStatsFromMatches(matchesExcludingMostRecent, allTeamIdsInLeague);
    
    // Sort previous stats to get previous rankings (for overall, home, away)
    previousStats.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.shotDifference !== a.shotDifference) return b.shotDifference - a.shotDifference;
      if (b.shotsFor !== a.shotsFor) return b.shotsFor - a.shotsFor;
      return a.teamDisplayName.localeCompare(b.teamDisplayName);
    });

    // Create map of previous ranks
    const previousRanks = {};
    previousStats.forEach((team, index) => {
      previousRanks[team.teamId] = index + 1;
    });

    // Calculate movements
    const movements = {};
    currentStats.forEach(team => {
      const currentRank = team.currentRank;
      const previousRank = previousRanks[team.teamId];
      
      if (previousRank !== undefined) {
        // Movement is previous rank - current rank (positive = moved up, negative = moved down)
        movements[team.teamId] = previousRank - currentRank;
      } else {
        movements[team.teamId] = 0;
      }
    });

    return movements;
  }

  /**
   * Calculate rank movements specifically for form view
   * @param {Array<Object>} matchesSubset - All matches used for current table calculation
   * @param {Array<string>} allTeamIdsInLeague - Array of all team IDs in the league
   * @param {Array<Object>} currentStats - Current team statistics with ranks
   * @returns {Object} Map of teamId to rank movement
   */
  _calculateFormRankMovements(matchesSubset, allTeamIdsInLeague, currentStats) {
    // Use the centralized FormUtils for form rank movement calculation
    return FormUtils.calculateFormRankMovements(allTeamIdsInLeague, matchesSubset, this.tableFilter);
  }

  /**
   * Calculate basic statistics from matches (helper method for rank movement calculation)
   * @param {Array<Object>} matches - Array of match objects
   * @param {Array<string>} allTeamIdsInLeague - Array of all team IDs in the league
   * @returns {Array<Object>} Array of team statistics
   */
     _calculateStatsFromMatches(matches, allTeamIdsInLeague) {
    return allTeamIdsInLeague.map(teamId => {
      let played = 0;
      let won = 0;
      let drawn = 0;
      let lost = 0;
      let shotsFor = 0;
      let shotsAgainst = 0;
      let points = 0;
      let formMatches = [];
      let allMatchesForTooltip = [];

      matches.forEach(match => {
        if (!match.result || typeof match.result.homeScore !== 'number' || typeof match.result.awayScore !== 'number') {
          return;
        }

        const homeTeamId = match.homeTeam._id;
        const awayTeamId = match.awayTeam._id;
        if (!homeTeamId || !awayTeamId) {
          return;
        }

        const homeScore = match.result.homeScore;
        const awayScore = match.result.awayScore;
        
        if (homeTeamId === teamId) {
          // Skip if we're filtering for away matches only
          if (this.tableFilter === 'away') return;
          
          played++;
          shotsFor += homeScore;
          shotsAgainst += awayScore;
          if (homeScore > awayScore) { won++; points += 3; }
          else if (homeScore === awayScore) { drawn++; points += 1; }
          else { lost++; }
          formMatches.push(match);
          allMatchesForTooltip.push(match);
        } else if (awayTeamId === teamId) {
          // Skip if we're filtering for home matches only
          if (this.tableFilter === 'home') return;
          
          played++;
          shotsFor += awayScore;
          shotsAgainst += homeScore;
          if (awayScore > homeScore) { won++; points += 3; }
          else if (awayScore === homeScore) { drawn++; points += 1; }
          else { lost++; }
          formMatches.push(match);
          allMatchesForTooltip.push(match);
        }
      });

      // Sort matches by date to get the most recent for the form guide
      formMatches.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      const recentFormMatches = formMatches.slice(0, 5).map(match => {
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
        matches: recentFormMatches,
        allMatchesForTooltip
      };
    });
  }

  /**
   * Open the match modal dialog.
   * @param {Object} matchData
   * @param {Array<Object>} teams - Array of team objects ({_id, name}) for dropdowns.
   * @param {'edit'|'new'} mode
   */
  openMatchModal(matchData, teams, mode = 'edit') {
    // Check if editing is allowed
    if (!this._canEdit) {
      console.log('[LeagueElement] Match editing is disabled via can-edit attribute');
      return;
    }
    
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

    this._renderMatchModal();

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
    this._renderMatchModal();
  }

  /**
   * Renders only the match modal without affecting the rest of the component
   * @private
   */
  _renderMatchModal() {
    // Remove existing match modal if present
    let modal = this.shadow.querySelector('league-match');
    if (modal) modal.remove();
    
    if (this.matchModalOpen) {
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
      modal.setAttribute('font-scale', String(this._fontScale));
      modal.mode = this.matchModalMode;
      modal.canEdit = this._canEdit;
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
    }
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
      return '<p>No teams found for matrix view.</p>';
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
            
            const editableClass = this._canEdit ? ' matrix-cell-editable' : '';
            matrixHTML += `<div class="matrix-cell matrix-cell-played${editableClass}" title="${this.escapeHtml(tooltip)}" data-match='${JSON.stringify(match)}'>
              <span class="matrix-score">${homeScore}-${awayScore}</span>
              <div class="tooltip">${this.escapeHtml(tooltip)}</div>
            </div>`;
          } else if (match && !match.result) {
            // Match is scheduled but not played
            const dateStr = match.date ? new Date(match.date).toLocaleDateString() : 'Date TBD';
            const tooltip = `${homeTeam.teamDisplayName || homeTeam.teamName} vs ${awayTeam.teamDisplayName || awayTeam.teamName} - ${dateStr}`;
            
            const editableClass = this._canEdit ? ' matrix-cell-editable' : '';
            matrixHTML += `<div class="matrix-cell matrix-cell-scheduled${editableClass}" title="${this.escapeHtml(tooltip)}" data-match='${JSON.stringify(match)}'>
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
        if (!this._canEdit) {
          return; // Don't handle clicks if editing is disabled
        }
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
        if (!this._canEdit) {
          return; // Don't handle clicks if editing is disabled
        }
        // You could implement new match creation here if desired
        console.log('Clicked empty matrix cell - could create new match');
      });
    });
  }

  /**
   * Sets up event listeners for the schedule view and configures the component
   * @private
   */
  _setupScheduleEventListeners() {
    const scheduleElement = this.shadow.querySelector(this._isMobile ? '#mobile-schedule' : '#desktop-schedule');
    
    if (scheduleElement) {
      // Data transformation is now handled in render() method
      // Just set up event listeners here
      
      // Remove any existing listeners to prevent duplicates
      if (this._handleScheduleMatchEditBound) {
        scheduleElement.removeEventListener('league-schedule-event', this._handleScheduleMatchEditBound);
      }
      
      // Create bound function if it doesn't exist
      this._handleScheduleMatchEditBound = this._handleScheduleMatchEdit.bind(this);
      
      // Add event listener for schedule events
      scheduleElement.addEventListener('league-schedule-event', this._handleScheduleMatchEditBound);
    }
  }
  
  /**
   * Handles match edit events from the schedule component
   * @param {CustomEvent} e - The event object
   * @private
   */
  _handleScheduleMatchEdit(e) {
    if (!e.detail) return;
    
    const { type, match } = e.detail;
    
    if (type === 'matchEdit' && match) {
      // Check if editing is allowed
      if (!this._canEdit) {
        return;
      }
      // Open the match modal for editing
      const teams = this.data && this.data.teams ? this.data.teams : [];
      this.openMatchModal(match, teams, 'edit');
    } else if (type === 'matchClick' && match) {
      // Just dispatch the event for now
      this.dispatchEvent(new LeagueEvent({
        type: 'matchClick',
        match
      }));
    } else if (type === 'filterClear') {
      // Clear team filter when schedule component requests it
      this.selectedTeamForSchedule = null;
      this.render(); // Re-render to update all components
    }
  }
  // END - Matrix View Methods

  // Helper method to create "Select All" checkbox for trends legend
  _createSelectAllCheckbox(allTeams) {
    // Only show "Select All" if there are at least 2 teams
    if (!allTeams || allTeams.length < 2) {
      return null;
    }

    const selectAllLabel = document.createElement('label');
    selectAllLabel.className = 'legend-item legend-item-select-all';
    selectAllLabel.title = 'Select or deselect all teams';

    const selectAllCheckbox = document.createElement('input');
    selectAllCheckbox.type = 'checkbox';
    selectAllCheckbox.className = 'trends-select-all-cb';
    selectAllCheckbox.value = 'select-all';
    
    // Determine initial state: checked if all teams are selected
    const allTeamsSelected = allTeams.every(teamId => this.selectedTeamsForGraph.has(teamId));
    selectAllCheckbox.checked = allTeamsSelected;

    const nameSpan = document.createElement('span');
    nameSpan.textContent = 'Select All';
    nameSpan.style.fontWeight = 'bold';

    selectAllLabel.appendChild(selectAllCheckbox);
    selectAllLabel.appendChild(nameSpan);

    return selectAllLabel;
  }

  // Helper method to update "Select All" checkbox state
  _updateSelectAllCheckboxState() {
    const selectAllCheckbox = this.shadow.querySelector('.trends-select-all-cb');
    if (!selectAllCheckbox) return;

    const allTeamCheckboxes = this.shadow.querySelectorAll('.trends-team-toggle-cb');
    const checkedTeamCheckboxes = this.shadow.querySelectorAll('.trends-team-toggle-cb:checked');
    
    if (checkedTeamCheckboxes.length === 0) {
      // No teams selected
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = false;
    } else if (checkedTeamCheckboxes.length === allTeamCheckboxes.length) {
      // All teams selected
      selectAllCheckbox.checked = true;
      selectAllCheckbox.indeterminate = false;
    } else {
      // Some teams selected
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = true;
    }
  }
}

/**
 * Configuration wrapper class that provides a simple API for hosting LeagueElement
 * with just a league ID. This abstracts the complex attribute management and data fetching.
 */
class LeagueElementConfig {
  /**
   * Creates a new LeagueElementConfig instance
   * @param {Object} options - Configuration options
   * @param {string} options.leagueId - The league ID to load
   * @param {string} options.container - CSS selector for the container element
   * @param {boolean} [options.isMobile=false] - Whether to render in mobile mode
   * @param {number} [options.fontScale=1.0] - Font scale factor (0.5 to 2.0)
   * @param {string} [options.apiBaseUrl='https://www.lovebowls.co.uk/_functions'] - Base URL for API calls
   * @param {Function} [options.onError] - Error callback function
   * @param {Function} [options.onLoad] - Success callback function
   */
  constructor(options = {}) {
    this.leagueId = options.leagueId;
    this.container = options.container;
    this.isMobile = options.isMobile || false;
    this.fontScale = Math.max(0.5, Math.min(2.0, options.fontScale || 1.0));
    this.apiBaseUrl = options.apiBaseUrl || 'https://www.lovebowls.co.uk/_functions';
    this.onError = options.onError || this._defaultErrorHandler;
    this.onLoad = options.onLoad || this._defaultLoadHandler;
    
    this.element = null;
    this.isLoading = false;
    this.error = null;
    
    if (!this.leagueId) {
      throw new Error('leagueId is required');
    }
    
    if (!this.container) {
      throw new Error('container selector is required');
    }
  }

  /**
   * Loads the league data and renders the element
   * @returns {Promise<void>}
   */
  async load() {
    if (this.isLoading) {
      console.warn('LeagueElementConfig: Already loading, ignoring duplicate call');
      return;
    }

    this.isLoading = true;
    this.error = null;

    try {
      // Clear any existing element
      this._clearContainer();

      // Show loading state
      this._showLoading();

      // Fetch league data
      const data = await this._fetchLeagueData();

      // Create and configure the element
      this.element = document.createElement('league-element');
      this.element.setAttribute('data', JSON.stringify(data.league));
      this.element.setAttribute('can-edit', data.canEdit.toString());
      this.element.setAttribute('is-mobile', this.isMobile.toString());
      this.element.setAttribute('font-scale', this.fontScale.toString());

      // Add event listeners
      this._setupEventListeners();

      // Add to container
      const container = document.querySelector(this.container);
      if (!container) {
        throw new Error(`Container element not found: ${this.container}`);
      }
      
      // Clear the container first to remove loading state
      container.innerHTML = '';
      container.appendChild(this.element);

      // Call success callback
      this.onLoad(this.element, data);

    } catch (error) {
      this.error = error;
      this._hideLoading();
      this._showError(error.message);
      this.onError(error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Reloads the league data
   * @returns {Promise<void>}
   */
  async reload() {
    return this.load();
  }

  /**
   * Destroys the element and cleans up
   */
  destroy() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
    this._clearContainer();
    this.isLoading = false;
    this.error = null;
  }

  /**
   * Gets the current league element instance
   * @returns {LeagueElement|null}
   */
  getElement() {
    return this.element;
  }

  /**
   * Gets the current loading state
   * @returns {boolean}
   */
  getLoadingState() {
    return this.isLoading;
  }

  /**
   * Gets the last error, if any
   * @returns {Error|null}
   */
  getError() {
    return this.error;
  }

  /**
   * Updates the configuration and reloads if needed
   * @param {Object} options - New configuration options
   */
  updateConfig(options = {}) {
    let needsReload = false;

    if (options.leagueId && options.leagueId !== this.leagueId) {
      this.leagueId = options.leagueId;
      needsReload = true;
    }

    if (options.isMobile !== undefined && options.isMobile !== this.isMobile) {
      this.isMobile = options.isMobile;
      needsReload = true;
    }

    if (options.fontScale !== undefined) {
      this.fontScale = Math.max(0.5, Math.min(2.0, options.fontScale));
      if (this.element) {
        this.element.setAttribute('font-scale', this.fontScale.toString());
      }
    }

    if (options.container && options.container !== this.container) {
      this.container = options.container;
      needsReload = true;
    }

    if (options.apiBaseUrl) {
      this.apiBaseUrl = options.apiBaseUrl;
    }

    if (options.onError) {
      this.onError = options.onError;
    }

    if (options.onLoad) {
      this.onLoad = options.onLoad;
    }

    if (needsReload) {
      this.load();
    }
  }

  /**
   * Fetches league data from the API
   * @private
   * @returns {Promise<Object>}
   */
  async _fetchLeagueData() {
    const url = `${this.apiBaseUrl}/League?id=${encodeURIComponent(this.leagueId)}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch league data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`API Error: ${data.error}`);
    }

    if (!data.league) {
      throw new Error('Invalid league data received from API');
    }

    return data;
  }

  /**
   * Clears the container element
   * @private
   */
  _clearContainer() {
    const container = document.querySelector(this.container);
    if (container) {
      container.innerHTML = '';
    }
  }

  /**
   * Shows loading state in the container
   * @private
   */
  _showLoading() {
    const container = document.querySelector(this.container);
    if (container) {
      container.innerHTML = `
        <div style="
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
          font-family: Arial, sans-serif;
          color: #666;
        ">
          <div style="text-align: center;">
            <div style="
              width: 40px;
              height: 40px;
              border: 4px solid #f3f3f3;
              border-top: 4px solid #3498db;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 0 auto 10px;
            "></div>
            <div>Loading league data...</div>
          </div>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `;
    }
  }

  /**
   * Hides loading state
   * @private
   */
  _hideLoading() {
    // Loading state is cleared when container.innerHTML is set to '' before adding the element
  }

  /**
   * Shows error state in the container
   * @private
   * @param {string} message - Error message to display
   */
  _showError(message) {
    const container = document.querySelector(this.container);
    if (container) {
      container.innerHTML = `
        <div style="
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
          font-family: Arial, sans-serif;
          color: #e74c3c;
          text-align: center;
          padding: 20px;
        ">
          <div>
            <div style="font-size: 24px; margin-bottom: 10px;">⚠️</div>
            <div style="font-weight: bold; margin-bottom: 5px;">Error Loading League</div>
            <div style="font-size: 14px; color: #666;">${this.escapeHtml(message)}</div>
            <button onclick="location.reload()" style="
              margin-top: 15px;
              padding: 8px 16px;
              background: #3498db;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
            ">Retry</button>
          </div>
        </div>
      `;
    }
  }

  /**
   * Sets up event listeners for the league element
   * @private
   */
  _setupEventListeners() {
    if (!this.element) return;

    // Listen for league events and re-dispatch them with additional context
    this.element.addEventListener('league-event', (event) => {
      // Re-dispatch with config context
      const enhancedEvent = new CustomEvent('league-config-event', {
        detail: {
          ...event.detail,
          config: this,
          leagueId: this.leagueId
        },
        bubbles: true,
        composed: true
      });
      
      document.dispatchEvent(enhancedEvent);
    });
  }

  /**
   * Default error handler
   * @private
   * @param {Error} error - The error object
   */
  _defaultErrorHandler(error) {
    console.error('LeagueElementConfig Error:', error);
  }

  /**
   * Default load handler
   * @private
   * @param {LeagueElement} element - The created league element
   * @param {Object} data - The loaded league data
   */
  _defaultLoadHandler(element, data) {
    console.log('LeagueElementConfig: League loaded successfully', {
      leagueId: this.leagueId,
      canEdit: data.canEdit,
      element: element
    });
  }

  /**
   * Basic HTML escaping for error messages
   * @private
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Add the config class to the global scope for easy access
if (typeof window !== 'undefined') {
  window.LeagueElementConfig = LeagueElementConfig;
}

import { safeDefine } from '../../utils/elementRegistry.js';

// Register the custom element
safeDefine('league-element', LeagueElement);

export { LeagueElement, LeagueElementConfig }; 