// Define custom event types for the LeagueSchedule element
class LeagueScheduleEvent extends CustomEvent {
  constructor(detail) {
    super('league-schedule-event', {
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
  TEMPLATE,
  TABLE_TEMPLATE,
  NO_MATCHES_TEMPLATE
} from './LeagueSchedule-styles.js';
import { TemporalUtils } from '../../utils/temporalUtils.js';
import {
  exportMatchesToCSV,
  exportMatchesToExcel,
  exportMatchesToWord,
  exportMatchesToPDF,
  exportMatchesToJSON
} from '../../utils/data.js';
import { League } from '@lovebowls/leaguejs';

/**
 * Custom element to display a complete schedule of matches from a League
 * with paging, filtering, and export functionality.
 *
 * @element league-schedule
 * @attr {string} data - JSON stringified League object
 * @attr {boolean} [is-mobile] - Whether to use mobile styles
 * @attr {boolean} [can-edit] - Whether to show edit buttons for matches
 * @attr {string} [filter-date] - Date filter in YYYY-MM-DD format
 * @attr {string} [selected-team] - Team ID to filter matches by
 *
 * Emits 'league-schedule-event' with detail { type: 'matchClick', match }
 * Emits 'league-schedule-event' with detail { type: 'matchEdit', match }
 * Emits 'league-schedule-event' with detail { type: 'matchSave', match }
 * Emits 'league-schedule-event' with detail { type: 'filterClear' }
 */
class LeagueSchedule extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.league = null;
    this.matches = [];
    this.teams = [];
    this.currentPage = 1;
    this.itemsPerPage = 25;
    this.selectedMatchId = null;
    this.selectedTeamId = null;
    this.filterDate = null; // YYYY-MM-DD format
    this.error = null;
    
    // Generate a unique storage key for this component instance
    this.storageKey = `league-schedule-filters-${this.getAttribute('data-league-id') || 'default'}`;
  }

  get _canEdit() {
    return this.getAttribute('can-edit') === 'true';
  }

  get _shouldShowRinkColumn() {
    return this.league?.settings?.maxRinksPerSession && this.league.settings.maxRinksPerSession > 0;
  }

  static get observedAttributes() {
    return ['data', 'is-mobile', 'can-edit', 'filter-date', 'selected-team'];
  }

  connectedCallback() {
    if (this.hasAttribute('data')) {
      this.loadData(this.getAttribute('data'));
    }
    
    // Restore filter state from storage after data is loaded (so storage key is correct)
    this.restoreFilterState();
    
    // Always use renderWithoutReset to preserve restored filter state
    this.renderWithoutReset();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    if (name === 'data') {
      this.loadData(newValue);
    } else if (name === 'is-mobile') {
      this.renderWithoutReset();
    } else if (name === 'can-edit') {
      this.renderWithoutReset();
    } else if (name === 'filter-date') {
      this.filterDate = newValue || null;
      this.currentPage = 1; // Reset to first page when filter changes
      this.render();
    } else if (name === 'selected-team') {
      this.selectedTeamId = newValue || null;
      this.currentPage = 1; // Reset to first page when filter changes
      this.render();
    }
  }

  /**
   * Loads and parses the league data.
   * @param {string|Object} data - League data as JSON string or object
   */
  loadData(data) {
    try {
      // Parse data if it's a string
      let parsedData;
      if (typeof data === 'string') {
        parsedData = JSON.parse(data);
      } else {
        parsedData = data || null;
      }

      // Convert to League instance if it isn't already
      if (parsedData) {
        if (parsedData.getMatchesRequiringAttention && parsedData.getConflictingMatchIds) {
          // Already a League instance
          this.league = parsedData;
        } else {
          // Create a League instance from the data
          this.league = new League(parsedData);
        }
        
        // Update storage key with actual league ID
        if (this.league._id) {
          this.storageKey = `league-schedule-filters-${this.league._id}`;
        }
        
        // Extract matches and teams from league
        this.matches = Array.isArray(this.league.matches) ? this.league.matches : [];
        this.teams = Array.isArray(this.league.teams) ? this.league.teams : [];
        
        // Sort matches by date first, then by rink number if present
        this.matches.sort((a, b) => {
          // First sort by date
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          const dateDiff = dateA - dateB;
          
          // If dates are the same, sort by rink number
          if (dateDiff === 0) {
            const rinkA = a.rink || 0; // Treat undefined/null as 0
            const rinkB = b.rink || 0; // Treat undefined/null as 0
            return rinkA - rinkB;
          }
          
          return dateDiff;
        });
      } else {
        this.league = null;
        this.matches = [];
        this.teams = [];
      }

      // Reset current page and selected match, but preserve filter state if it exists
      this.currentPage = 1;
      this.selectedMatchId = null;
      // Preserve selectedTeamId to maintain filter state during reconnections
      this.error = null;

      // Navigate to page with next future match
      this.navigateToNextFutureMatch();

      this.render();
      this.dispatchEvent(new LeagueScheduleEvent({ 
        type: 'dataLoaded', 
        matches: this.matches,
        teams: this.teams
      }));
    } catch (error) {
      this.error = 'Failed to load league data';
      console.error('Error loading league data:', error);
      this.dispatchEvent(new LeagueScheduleEvent({ 
        type: 'error', 
        message: this.error, 
        error 
      }));
      this.render();
    }
  }

  /**
   * Returns the filtered list of matches based on current filter settings.
   * @returns {Array} Filtered matches
   */
  getFilteredMatches() {
    if (!this.matches || !Array.isArray(this.matches)) {
      return [];
    }

    let filteredMatches = [...this.matches];

    // Apply date filter if set
    if (this.filterDate) {
      filteredMatches = filteredMatches.filter(match => {
        if (!match.date) return false;
        
        try {
          const matchDate = new Date(match.date);
          const matchDateString = matchDate.toISOString().split('T')[0]; // YYYY-MM-DD
          return matchDateString === this.filterDate;
        } catch (error) {
          console.warn('Invalid match date:', match.date);
          return false;
        }
      });
    }

    // Apply team filter if set
    if (this.selectedTeamId) {
      filteredMatches = filteredMatches.filter(match => 
        match.homeTeam._id === this.selectedTeamId || 
        match.awayTeam._id === this.selectedTeamId
      );
    }

    return filteredMatches;
  }

  /**
   * Gets comprehensive match information including attention status
   * @param {Object} match - Match object
   * @returns {Object} Match info with state, attention status, and reason
   */
  getMatchInfo(match) {
    if (!match) {
      return { state: 'unknown', needsAttention: false, attentionReason: '', conflicted: false };
    }

    // Get attention matches and conflicting IDs from the league
    let matchesRequiringAttention = [];
    let conflictingIds = new Set();
    
    if (this.league && typeof this.league.getMatchesRequiringAttention === 'function') {
      try {
        matchesRequiringAttention = this.league.getMatchesRequiringAttention();
      } catch (error) {
        console.warn('Error getting matches requiring attention:', error);
      }
    }
    
    if (this.league && typeof this.league.getConflictingMatchIds === 'function') {
      try {
        conflictingIds = this.league.getConflictingMatchIds();
      } catch (error) {
        console.warn('Error getting conflicting match IDs:', error);
      }
    }

    // Check if this match requires attention
    const needsAttention = matchesRequiringAttention.some(m => m._id === match._id);
    const conflicted = conflictingIds.has(match._id);
    
    // Determine attention reason and basic state
    let attentionReason = '';
    let state = 'future'; // Default state
    
    if (!match.date) {
      state = 'no-date';
      if (needsAttention) attentionReason = 'No date set for match';
    } else {
      try {
        const matchDate = new Date(match.date);
        const now = new Date();
        
        // Consider matches in the past if they're before today (ignoring time)
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const matchDay = new Date(matchDate.getFullYear(), matchDate.getMonth(), matchDate.getDate());
        
        if (matchDay < today) {
          // Past match
          if (match.result && 
              typeof match.result.homeScore === 'number' && 
              typeof match.result.awayScore === 'number') {
            state = 'past-with-result';
          } else {
            state = 'past-no-result';
            if (needsAttention) attentionReason = 'Match date passed, result pending';
          }
        } else if (matchDay.getTime() === today.getTime()) {
          // Today's match
          state = 'today';
        } else {
          // Future match
          state = 'future';
          if (match.result && needsAttention) {
            attentionReason = 'Result entered for a future match date';
          }
        }
        
        // Check for scheduling conflicts
        if (conflicted) {
          attentionReason = attentionReason || 'Scheduling conflict on this date';
        }
      } catch (error) {
        console.warn('Error determining match state:', error);
        state = 'error';
      }
    }

    return {
      state,
      needsAttention,
      attentionReason,
      conflicted
    };
  }

  /**
   * Finds the next future match and navigates to the page containing it
   */
  navigateToNextFutureMatch() {
    const filteredMatches = this.getFilteredMatches();
    
    if (!filteredMatches || filteredMatches.length === 0) {
      this.currentPage = 1;
      return;
    }

    // Find the first future match
    const nextFutureMatchIndex = filteredMatches.findIndex(match => {
      const matchInfo = this.getMatchInfo(match);
      return matchInfo.state === 'future' || matchInfo.state === 'today';
    });

    if (nextFutureMatchIndex === -1) {
      // No future matches found, stay on first page
      this.currentPage = 1;
      return;
    }

    // Calculate which page contains this match
    const targetPage = Math.floor(nextFutureMatchIndex / this.itemsPerPage) + 1;
    this.currentPage = Math.max(1, Math.min(targetPage, this.getTotalPages()));
  }

  /**
   * Gets the team name from the team ID
   * @param {string} teamId - Team ID
   * @returns {string} Team name
   */
  getTeamName(teamId) {
    if (!teamId || !this.teams) return 'Unknown';
    
    const team = this.teams.find(t => t._id === teamId);
    return team ? team.name : 'Unknown';
  }

  /**
   * Formats a match date for display
   * @param {string} dateString - Date string
   * @returns {string} Formatted date
   */
  formatMatchDate(dateString) {
    if (!dateString) return 'TBD';
    
    try {
      return TemporalUtils.formatDateString(new Date(dateString));
    } catch (error) {
      return 'Invalid Date';
    }
  }

  /**
   * Formats a match result for display with attention indicators
   * @param {Object} match - Match object
   * @returns {string} Formatted result string with attention indicators
   */
  formatMatchResult(match) {
    if (!match) {
      return '-';
    }

    const matchInfo = this.getMatchInfo(match);
    let resultText = '';
    
    // Format the basic result
    if (match.result && 
        typeof match.result.homeScore === 'number' && 
        typeof match.result.awayScore === 'number') {
      resultText = `${match.result.homeScore}-${match.result.awayScore}`;
    } else {
      resultText = '-';
    }
    
    // Add attention indicators based on the specific issue
    if (matchInfo.needsAttention || matchInfo.conflicted) {
      let icon = '';
      
      if (matchInfo.conflicted) {
        icon = '⚠️'; // Warning for scheduling conflicts
      } else if (matchInfo.state === 'past-no-result') {
        icon = '⏰'; // Clock for overdue results
      } else if (matchInfo.attentionReason.includes('future match date')) {
        icon = '🔮'; // Crystal ball for future results
      } else if (matchInfo.state === 'no-date') {
        icon = '📅'; // Calendar for missing date
      } else {
        icon = '❗'; // General attention needed
      }
      
      return `${resultText} ${icon}`;
    }
    
    return resultText;
  }

  /**
   * Format the rink for display
   * @param {Object} match - Match object
   * @returns {string} Formatted rink string
   */
  formatMatchRink(match) {
    if (!match || !match.rink || match.rink === null || match.rink === undefined) {
      return '-';
    }
    
    return `Rink ${match.rink}`;
  }

  /**
   * Gets the total number of pages
   * @returns {number} Total pages
   */
  getTotalPages() {
    const filteredMatches = this.getFilteredMatches();
    return Math.max(1, Math.ceil(filteredMatches.length / this.itemsPerPage));
  }

  /**
   * Saves current filter state to sessionStorage
   */
  saveFilterState() {
    try {
      // Update storage key if we have league data
      if (this.league && this.league._id) {
        this.storageKey = `league-schedule-filters-${this.league._id}`;
      }
      
      const filterState = {
        selectedTeamId: this.selectedTeamId,
        filterDate: this.filterDate,
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
        timestamp: Date.now()
      };
      sessionStorage.setItem(this.storageKey, JSON.stringify(filterState));
    } catch (error) {
      console.warn('[LeagueSchedule] Failed to save filter state:', error);
    }
  }

  /**
   * Restores filter state from sessionStorage
   */
  restoreFilterState() {
    try {
      // Update storage key if we have league data
      if (this.league && this.league._id) {
        this.storageKey = `league-schedule-filters-${this.league._id}`;
      }
      
      const stored = sessionStorage.getItem(this.storageKey);
      if (stored) {
        const filterState = JSON.parse(stored);
        
        // Only restore if the data is recent (within last hour)
        const maxAge = 60 * 60 * 1000; // 1 hour
        if (Date.now() - filterState.timestamp < maxAge) {
          this.selectedTeamId = filterState.selectedTeamId || null;
          this.filterDate = filterState.filterDate || null;
          this.currentPage = filterState.currentPage || 1;
          this.itemsPerPage = filterState.itemsPerPage || 25;
        } else {
          sessionStorage.removeItem(this.storageKey);
        }
      }
    } catch (error) {
      console.warn('[LeagueSchedule] Failed to restore filter state:', error);
    }
  }

  /**
   * Clears saved filter state
   */
  clearFilterState() {
    try {
      sessionStorage.removeItem(this.storageKey);
    } catch (error) {
      console.warn('[LeagueSchedule] Failed to clear filter state:', error);
    }
  }

  /**
   * Handles team filter change
   * @param {Event} e - Change event
   */
  handleTeamFilter = (e) => {
    this.selectedTeamId = e.target.value;
    this.currentPage = 1;
    
    // Save filter state whenever it changes
    this.saveFilterState();
    
    // Navigate to next future match when filter changes
    this.navigateToNextFutureMatch();
    
    this.renderWithoutReset();
  }

  /**
   * Clears all filters
   */
  clearFilters = () => {
    this.selectedTeamId = null;
    this.filterDate = null;
    this.currentPage = 1;
    
    // Clear saved filter state
    this.clearFilterState();
    
    // Remove the filter-date attribute to notify parent component
    this.removeAttribute('filter-date');
    
    // Dispatch event to notify parent that filters should be cleared
    this.dispatchEvent(new LeagueScheduleEvent({
      type: 'filterClear'
    }));
    
    this.render();
  }

  /**
   * Handles page change
   * @param {number} page - New page number
   */
  handlePageChange = (page) => {
    if (page < 1 || page > this.getTotalPages()) return;
    this.currentPage = page;
    this.saveFilterState();
    this.renderWithoutReset();
  }

  /**
   * Handles items per page change
   * @param {Event} e - Input event
   */
  handleItemsPerPageChange = (e) => {
    const value = parseInt(e.target.value, 10);
    
    // Validate input: must be integer between 10 and 1000
    if (isNaN(value) || value < 10 || value > 1000) {
      // Reset to current value if invalid
      e.target.value = this.itemsPerPage;
      return;
    }
    
    this.itemsPerPage = value;
    this.currentPage = 1; // Reset to first page
    this.saveFilterState();
    this.renderWithoutReset();
  }

  /**
   * Handles match selection
   * @param {Object} match - Selected match
   */
  handleMatchSelect = (match) => {
    if (!match) return;
    
    // Toggle selection
    this.selectedMatchId = this.selectedMatchId === match._id ? null : match._id;
    
    // Dispatch event for selection (not edit)
    this.dispatchEvent(new LeagueScheduleEvent({
      type: 'matchClick',
      match
    }));
    
    // Re-render without resetting filters
    this.renderWithoutReset();
  }

  /**
   * Handles edit match button click
   * @param {Event} e - Click event
   * @param {Object} match - Match to edit
   */
  handleEditMatch = (e, match) => {

    
    e.stopPropagation(); // Prevent row click
    
    if (!match || !this._canEdit) return;
    
    // Set as selected
    this.selectedMatchId = match._id;
    
    // Dispatch edit event

    this.dispatchEvent(new LeagueScheduleEvent({
      type: 'matchEdit',
      match
    }));
    
    // Re-render without resetting filters
    this.renderWithoutReset();
  }

  /**
   * Toggles the export menu
   */


  /**
   * Exports the data in the specified format
   * @param {string} format - Export format
   */
  exportData = async (format) => {
    // Export ALL matches (not just current page) but respect filters
    const filteredMatches = this.getFilteredMatches();
    
    if (!filteredMatches || filteredMatches.length === 0) {
      alert('No matches to export');
      this.showExportMenu = false;
      this.render();
      return;
    }
    
    // Generate filename with current date and filter info
    let filename = 'league-matches';
    if (this.selectedTeamId) {
      const teamName = this.getTeamName(this.selectedTeamId).replace(/[^a-zA-Z0-9]/g, '_');
      filename += `_${teamName}`;
    }
    if (this.filterDate) {
      filename += `_${this.filterDate}`;
    }
    filename += `_${new Date().toISOString().split('T')[0]}`;
    
    try {
      switch (format) {
        case 'csv':
          exportMatchesToCSV(filteredMatches, filename);
          break;
        case 'excel':
          await exportMatchesToExcel(filteredMatches, filename);
          break;
        case 'word':
          exportMatchesToWord(filteredMatches, filename);
          break;
        case 'pdf':
          exportMatchesToPDF(filteredMatches, filename);
          break;
        case 'json':
          exportMatchesToJSON(filteredMatches, filename);
          break;
        default:
          console.warn(`Unknown export format: ${format}`);
          alert(`Export format "${format}" is not supported`);
          return;
      }
      
      console.log(`Successfully exported ${filteredMatches.length} matches in ${format} format`);
      
      // Dispatch event for tracking/analytics
      this.dispatchEvent(new LeagueScheduleEvent({
        type: 'export',
        format,
        matchCount: filteredMatches.length,
        filename
      }));
      
    } catch (error) {
      console.error('Export error:', error);
      alert(`Failed to export matches: ${error.message}`);
    }
    
    this.showExportMenu = false;
    this.renderWithoutReset();
  }

  /**
   * Renders the component without resetting filter values
   */
  renderWithoutReset() {
    this._render(false);
  }

  /**
   * Renders the component using lit-html
   */
  render() {
    this._render(true);
  }

  /**
   * Internal render method
   * @param {boolean} resetFilters - Whether to reset filter form values
   */
  _render(resetFilters = true) {
    const { league, selectedTeamId, currentPage, itemsPerPage } = this;
    
    // Calculate matches to display based on filters and pagination
    const filteredMatches = this.getFilteredMatches();
    const totalMatches = filteredMatches.length;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalMatches);
    const currentMatches = filteredMatches.slice(startIndex, endIndex);
    
    const html = (strings, ...values) => {
      return String.raw({ raw: strings }, ...values);
    };
    
    const editable = this._canEdit;
    
    const content = html`
      <div class="schedule-container">
        ${this.error ? `<div class="error">${this.error}</div>` : ''}
        
        <div class="filter-panel">
          <div class="filter-controls">
            <span class="filter-label">Team:</span>
            <select class="filter-team-select" id="team-filter">
              <option value="">All Teams</option>
              ${league?.teams?.map(team => `
                <option value="${team._id}" ${team._id === selectedTeamId ? 'selected' : ''}>
                  ${team.name}
                </option>
              `).join('')}
            </select>
            ${selectedTeamId || this.filterDate ? `
              <button class="clear-filters" id="clear-filters">Clear Filters</button>
            ` : ''}
          </div>
          
          <div class="dropdown-shared">
            <select id="export-select" class="dropdown-select-shared">
              <option value="">Export...</option>
              <option value="excel">Excel</option>
              <option value="word">Word</option>
              <option value="pdf">PDF</option>
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
          </div>
        </div>
        
        ${totalMatches > 0 ? `
          <table class="schedule-table">
            <thead>
              <tr>
                <th class="date-col">Date</th>
                ${this._shouldShowRinkColumn ? `<th class="rink-col">Rink</th>` : ''}
                <th class="team-col">Home</th>
                <th class="team-col">Away</th>
                <th class="result-col">Result</th>
                ${editable ? `<th class="actions-col">Actions</th>` : ''}
              </tr>
            </thead>
            <tbody>
              ${currentMatches.map(match => {
                const isSelected = this.selectedMatchId === match._id;
                const matchInfo = this.getMatchInfo(match);
                const cssClasses = [
                  'match-row',
                  matchInfo.state,
                  matchInfo.needsAttention ? 'needs-attention' : '',
                  matchInfo.conflicted ? 'conflicted' : '',
                  isSelected ? 'selected' : ''
                ].filter(Boolean).join(' ');
                
                const titleAttr = matchInfo.attentionReason ? 
                  ` title="${matchInfo.attentionReason.replace(/"/g, '&quot;')}"` : '';
                
                return `
                  <tr 
                    class="${cssClasses}" 
                    data-match-id="${match._id}"${titleAttr}
                  >
                    <td data-label="Date">${this.formatMatchDate(match.date)}</td>
                    ${this._shouldShowRinkColumn ? `<td data-label="Rink">${this.formatMatchRink(match)}</td>` : ''}
                    <td data-label="Home">${this.getTeamName(match.homeTeam._id)}</td>
                    <td data-label="Away">${this.getTeamName(match.awayTeam._id)}</td>
                    <td data-label="Result">${this.formatMatchResult(match)}</td>
                    ${editable ? `
                      <td>
                        <div class="match-actions">
                          <button 
                            class="btn btn-icon edit-match-btn" 
                            title="Edit Match"
                            data-match-id="${match._id}"
                          >
                            ✏️
                          </button>
                        </div>
                      </td>
                    ` : ''}
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          
          <div class="paging-controls">
            <div class="paging-info">
              Showing ${startIndex + 1}-${endIndex} of ${totalMatches} matches
            </div>
            <div class="paging-settings">
              <label for="items-per-page-input">Items per page:</label>
              <input 
                type="number" 
                id="items-per-page-input" 
                min="10" 
                max="1000" 
                step="1" 
                value="${this.itemsPerPage}"
                title="Number of matches to show per page (10-1000)"
              />
            </div>
            <div class="paging-buttons">
              <button 
                class="btn btn-secondary" 
                id="first-page"
                ${currentPage === 1 ? 'disabled' : ''}
              >
                &laquo;
              </button>
              <button 
                class="btn btn-secondary" 
                id="prev-page"
                ${currentPage === 1 ? 'disabled' : ''}
              >
                &lsaquo;
              </button>
              <button 
                class="btn btn-secondary" 
                id="next-page"
                ${currentPage === this.getTotalPages() ? 'disabled' : ''}
              >
                &rsaquo;
              </button>
              <button 
                class="btn btn-secondary" 
                id="last-page"
                ${currentPage === this.getTotalPages() ? 'disabled' : ''}
              >
                &raquo;
              </button>
            </div>
          </div>
        ` : `
          <div class="no-matches">
            No matches found. ${selectedTeamId ? `<button id="clear-filters">Clear filters</button>` : ''}
          </div>
        `}
      </div>
    `;
    
    const isMobile = this.getAttribute('is-mobile') === 'true';
    this.shadow.innerHTML = `
      <style>${isMobile ? MOBILE_STYLES : DESKTOP_STYLES}</style>
      ${content}
    `;
    
    this.setupEventListeners();
    
    // Preserve team filter value if not resetting
    if (!resetFilters) {
      const teamFilter = this.shadow.querySelector('#team-filter');
      if (teamFilter && this.selectedTeamId) {
        teamFilter.value = this.selectedTeamId;
      }
    }
  }
  
  /**
   * Sets up event listeners for the component
   */
  setupEventListeners() {
    // Team filter change
    const teamFilter = this.shadow.querySelector('#team-filter');
    if (teamFilter) {
      teamFilter.addEventListener('change', this.handleTeamFilter);
    }
    
    // Clear filters button
    const clearFiltersBtn = this.shadow.querySelector('#clear-filters');
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', this.clearFilters);
    }
    
    // Export dropdown
    const exportSelect = this.shadow.querySelector('#export-select');
    if (exportSelect) {
      exportSelect.addEventListener('change', (e) => {
        const format = e.target.value;
        if (format) {
          this.exportData(format);
          // Reset the select to show "Export..." again
          e.target.value = '';
        }
      });
    }
    
    // Items per page input
    const itemsPerPageInput = this.shadow.querySelector('#items-per-page-input');
    if (itemsPerPageInput) {
      itemsPerPageInput.addEventListener('change', this.handleItemsPerPageChange);
      itemsPerPageInput.addEventListener('blur', this.handleItemsPerPageChange);
    }
    
    // Pagination buttons
    const firstPageBtn = this.shadow.querySelector('#first-page');
    const prevPageBtn = this.shadow.querySelector('#prev-page');
    const nextPageBtn = this.shadow.querySelector('#next-page');
    const lastPageBtn = this.shadow.querySelector('#last-page');
    
    if (firstPageBtn) {
      firstPageBtn.addEventListener('click', () => this.handlePageChange(1));
    }
    
    if (prevPageBtn) {
      prevPageBtn.addEventListener('click', () => this.handlePageChange(this.currentPage - 1));
    }
    
    if (nextPageBtn) {
      nextPageBtn.addEventListener('click', () => this.handlePageChange(this.currentPage + 1));
    }
    
    if (lastPageBtn) {
      lastPageBtn.addEventListener('click', () => this.handlePageChange(this.getTotalPages()));
    }
    
    // Match row click
    const matchRows = this.shadow.querySelectorAll('.match-row');
    matchRows.forEach(row => {
      row.addEventListener('click', (e) => {
        // Don't trigger if clicking on a button
        if (e.target.tagName === 'BUTTON') {
          return;
        }
        
        const matchId = row.getAttribute('data-match-id');
        const match = this.matches.find(m => m._id === matchId);
        if (match) {
          this.handleMatchSelect(match);
        }
      });
    });
    
    // Edit match buttons
    const editButtons = this.shadow.querySelectorAll('.edit-match-btn');
    editButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const matchId = button.getAttribute('data-match-id');
        const match = this.matches.find(m => m._id === matchId);
        if (match) {
          this.handleEditMatch(e, match);
        }
      });
    });
  }
}

import { safeDefine } from '../../utils/elementRegistry.js';

safeDefine('league-schedule', LeagueSchedule);
export default LeagueSchedule; 