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

/**
 * Custom element to display a complete schedule of matches from a League
 * with paging, filtering, and export functionality.
 *
 * @element league-schedule
 * @attr {string} data - JSON stringified League object
 * @attr {boolean} [is-mobile] - Whether to use mobile styles
 * @attr {boolean} [can-edit] - Whether to show edit buttons for matches
 * @attr {string} [filter-date] - Date filter in YYYY-MM-DD format
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
    this.showExportMenu = false;
  }

  static get observedAttributes() {
    return ['data', 'is-mobile', 'can-edit', 'filter-date'];
  }

  connectedCallback() {
    if (this.hasAttribute('data')) {
      this.loadData(this.getAttribute('data'));
    }
    
    this.render();
    
    // Close export menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.showExportMenu && !e.composedPath().includes(this.shadow.querySelector('.export-dropdown'))) {
        this.showExportMenu = false;
        this.render();
      }
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    if (name === 'data') {
      this.loadData(newValue);
    } else if (name === 'is-mobile') {
      this.render();
    } else if (name === 'can-edit') {
      this.render();
    } else if (name === 'filter-date') {
      this.filterDate = newValue || null;
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
      if (typeof data === 'string') {
        this.league = JSON.parse(data);
      } else {
        this.league = data || null;
      }

      // Extract matches and teams from league
      if (this.league) {
        this.matches = Array.isArray(this.league.matches) ? this.league.matches : [];
        this.teams = Array.isArray(this.league.teams) ? this.league.teams : [];
        
        // Sort matches by date
        this.matches.sort((a, b) => new Date(a.date) - new Date(b.date));
      } else {
        this.matches = [];
        this.teams = [];
      }

      // Reset current page and selected match
      this.currentPage = 1;
      this.selectedMatchId = null;
      this.selectedTeamId = null;
      this.error = null;

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
   * Formats a match result for display
   * @param {Object} match - Match object
   * @returns {string} Formatted result string
   */
  formatMatchResult(match) {
    if (!match || !match.result) {
      return '-';
    }

    return `${match.result.homeScore || 0}-${match.result.awayScore || 0}`;
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
   * Handles team filter change
   * @param {Event} e - Change event
   */
  handleTeamFilter = (e) => {
    this.selectedTeamId = e.target.value;
    this.currentPage = 1;
    this.render();
  }

  /**
   * Clears all filters
   */
  clearFilters = () => {
    this.selectedTeamId = null;
    this.filterDate = null;
    this.currentPage = 1;
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
    this.render();
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
    this.render();
  }

  /**
   * Handles match selection
   * @param {Object} match - Selected match
   */
  handleMatchSelect = (match) => {
    if (!match) return;
    
    // Toggle selection
    this.selectedMatchId = this.selectedMatchId === match._id ? null : match._id;
    
    // Dispatch event
    this.dispatchEvent(new LeagueScheduleEvent({
      type: 'matchClick',
      match
    }));
    
    this.render();
  }

  /**
   * Handles edit match button click
   * @param {Event} e - Click event
   * @param {Object} match - Match to edit
   */
  handleEditMatch = (e, match) => {
    e.stopPropagation(); // Prevent row click
    
    if (!match) return;
    
    // Set as selected
    this.selectedMatchId = match._id;
    
    // Dispatch edit event
    this.dispatchEvent(new LeagueScheduleEvent({
      type: 'matchEdit',
      match
    }));
    
    this.render();
  }

  /**
   * Toggles the export menu
   */
  toggleExportMenu = () => {
    this.showExportMenu = !this.showExportMenu;
    this.render();
  }

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
    this.render();
  }

  /**
   * Renders the component using lit-html
   */
  render() {
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
    
    const editable = this.hasAttribute('can-edit');
    
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
          
          <div class="export-dropdown">
            <button class="btn btn-secondary" id="export-button">
              Export <span class="dropdown-arrow">▼</span>
            </button>
            <div class="export-menu ${this.showExportMenu ? 'show' : ''}" id="export-menu">
              <button data-format="excel">Excel</button>
              <button data-format="word">Word</button>
              <button data-format="pdf">PDF</button>
              <button data-format="json">JSON</button>
              <button data-format="csv">CSV</button>
            </div>
          </div>
        </div>
        
        ${totalMatches > 0 ? `
          <table class="schedule-table">
            <thead>
              <tr>
                <th class="date-col">Date</th>
                <th class="team-col">Home</th>
                <th class="team-col">Away</th>
                <th class="result-col">Result</th>
                ${editable ? `<th class="actions-col">Actions</th>` : ''}
              </tr>
            </thead>
            <tbody>
              ${currentMatches.map(match => {
                const isSelected = this.selectedMatchId === match._id;
                return `
                  <tr 
                    class="match-row ${isSelected ? 'selected' : ''}" 
                    data-match-id="${match._id}"
                  >
                    <td>${this.formatMatchDate(match.date)}</td>
                    <td>${this.getTeamName(match.homeTeam._id)}</td>
                    <td>${this.getTeamName(match.awayTeam._id)}</td>
                    <td>${this.formatMatchResult(match)}</td>
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
    
    // Export button and dropdown
    const exportBtn = this.shadow.querySelector('#export-button');
    const exportMenu = this.shadow.querySelector('#export-menu');
    if (exportBtn && exportMenu) {
      exportBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleExportMenu();
      });
      
      // Export format buttons
      const formatButtons = this.shadow.querySelectorAll('#export-menu button');
      formatButtons.forEach(button => {
        button.addEventListener('click', () => {
          const format = button.getAttribute('data-format');
          this.exportData(format);
        });
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

customElements.define('league-schedule', LeagueSchedule);
export default LeagueSchedule; 