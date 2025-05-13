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

      /* Calendar Styles - Moved from leagueElement.js */
      .calendar {
        margin-top: 1rem; /* Added margin top for spacing */
        margin-bottom: 1rem;
        font-size: 0.9em;
      }
      .calendar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }
      .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 2px;
        text-align: center;
      }
      .calendar-day {
        text-align: center;
        padding: 0.3rem;
        cursor: pointer;
        border-radius: 3px;
        transition: background-color 0.2s;
      }
      .calendar-day:hover {
        background-color: #f0f0f0;
      }
      .calendar-day.has-fixture { /* Renamed from has-match for clarity within this component */
        background-color: #e3f2fd; /* Blue for fixture */
        border: 1px solid #2196f3;
        font-weight: bold;
      }
      .calendar-day.has-fixture:hover {
        background-color: #bbdefb;
      }
      .calendar-day.has-result { /* Green for result */
        background-color: #c8e6c9;
        border: 1px solid #388e3c;
        font-weight: bold;
      }
      .calendar-day.has-result:hover {
        background-color: #a5d6a7;
      }
      /* Style for a day that has both a fixture and a result (e.g. if data is mixed) */
      .calendar-day.has-fixture.has-result {
        background: linear-gradient(135deg, #c8e6c9 50%, #e3f2fd 50%);
      }
      .calendar-day.selected {
        background-color: #2196f3;
        color: white;
      }
      .calendar-day.selected:hover {
        background-color: #1976d2;
      }
      .calendar-day.other-month {
        color: #ccc;
      }
      .calendar-day.today {
        border: 1px solid #1976d2; /* Darker blue for today if not selected */
        font-weight: bold;
      }
      .calendar-nav {
        cursor: pointer;
        padding: 0.2rem 0.5rem;
        border-radius: 3px;
        transition: background-color 0.2s;
      }
      .calendar-nav:hover {
        background-color: #f0f0f0;
      }
      .calendar-filter-controls { /* Renamed from calendar-filter for clarity */
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }
      .calendar-filter-controls button {
        background: none;
        border: none;
        color: #2196f3;
        cursor: pointer;
        padding: 0.2rem 0.5rem;
        border-radius: 3px;
        font-size: 0.9em;
      }
      .calendar-filter-controls button:hover {
        background-color: #e3f2fd;
      }
      .calendar-filter-controls .active {
        background-color: #e3f2fd;
        font-weight: bold;
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
      <div class="panel-header">Upcoming Fixtures</div>
      <div class="calendar">
        {{calendar}}
      </div>
      <div class="calendar-filter-controls">
        {{calendarFilter}}
      </div>
      {{filterIndicator}}
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
    console.log('[LeagueMatchesUpcoming] constructor CALLED');
    this.shadow = this.attachShadow({ mode: 'open' });
    this.matches = [];
    this.currentPage = 0;
    this.itemsPerPage = 5;
    this.selectedDate = null;
    this.calendarDate = new Date(); // For calendar month navigation
  }

  static get observedAttributes() {
    return ['data', 'selected-date', 'is-mobile'];
  }

  connectedCallback() {
    console.log('[LeagueMatchesUpcoming] connectedCallback CALLED');
    // Check for initial data attribute when component connects
    if (this.hasAttribute('data')) {
      const initialData = this.getAttribute('data');
      console.log('[LeagueMatchesUpcoming] connectedCallback found data attribute:', initialData);
      this.loadData(initialData);
    } else {
      console.log('[LeagueMatchesUpcoming] connectedCallback: No data attribute found initially.');
      // Render a default state or wait for attributeChangedCallback
      this.render(); 
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(`[LeagueMatchesUpcoming] attributeChangedCallback: ${name} changed from ${oldValue} to ${newValue}`);
    if (oldValue === newValue && name !== 'data') return; // Allow data to re-load even if string is same

    if (name === 'data') {
      this.loadData(newValue);
    } else if (name === 'selected-date') {
      const currentAttrValue = this.selectedDate ? this.selectedDate.toISOString().split('T')[0] : null;
      // If the new attribute value is the same as what current selectedDate would produce,
      // and it's not null (meaning we are not trying to clear it via attribute), then skip.
      if (newValue === currentAttrValue && newValue !== null) {
        // console.log('[attributeChangedCallback] selected-date attribute change to same value, skipping setSelectedDate call:', newValue);
        return;
      }
      // console.log('[attributeChangedCallback] selected-date changed from', oldValue, 'to', newValue);
      this.setSelectedDate(newValue, false); // Pass the string value, false to not dispatch event
    } else if (name === 'is-mobile') {
      this.render();
    }
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
    const content = this.shadow.querySelector('.upcoming-fixtures');
    if (content) {
      content.innerHTML = `<div class="error">${message}</div>`;
    }
  }

  /**
   * Returns the filtered list of fixtures.
   * If a `selectedDate` is provided, it returns unplayed matches for that specific date.
   * Otherwise (no `selectedDate`), it returns unplayed matches scheduled for after the current day.
   * The returned matches are sorted by date.
   * @returns {Array<Object>} An array of match objects.
   * @private
   */
  _upcomingFixturesList() {
    if (!this.matches || !Array.isArray(this.matches)) return [];

    // Start with matches that have a date and no result (i.e., unplayed)
    let filteredMatches = this.matches.filter(match => match.date && !match.result);

    if (this.selectedDate) {
      // If a date is selected, filter for unplayed matches on that specific date
      const filterDateNorm = new Date(this.selectedDate);
      filterDateNorm.setHours(0, 0, 0, 0);
      const filterDateTime = filterDateNorm.getTime();

      filteredMatches = filteredMatches.filter(match => {
        const matchDateNorm = new Date(match.date);
        matchDateNorm.setHours(0, 0, 0, 0);
        return matchDateNorm.getTime() === filterDateTime;
      });
    } else {
      // If no date is selected, filter for unplayed matches strictly in the future from today
      const todayNorm = new Date();
      todayNorm.setHours(0, 0, 0, 0);
      const todayTime = todayNorm.getTime();

      filteredMatches = filteredMatches.filter(match => {
        const matchDateNorm = new Date(match.date);
        matchDateNorm.setHours(0, 0, 0, 0);
        // Ensure it's strictly greater than today for "upcoming" when no specific date is selected
        return matchDateNorm.getTime() > todayTime;
      });
    }

    // Sort the final list by date
    return filteredMatches.sort((a, b) => new Date(a.date) - new Date(b.date));
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
      // if (list.length > 0) { // This condition means there are fixtures, just not on this page
      //   return '<div class="match-item">No more upcoming fixtures</div>';
      // }
      // If a date is selected, the message above handles it.
      // If no date selected and no upcoming fixtures at all:
      if (!this.selectedDate && list.length === 0) {
          return '<div class="match-item">No upcoming fixtures</div>';
      }
      // If there are items in the list, but this page is empty (e.g. paged beyond end)
      // This case should ideally be prevented by disabling next button.
      // For robustness:
      if (list.length > 0) {
        return '<div class="match-item">No more upcoming fixtures on this page</div>';
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
    const filterIndicatorHtml = this.selectedDate
      ? `<div class="filter-indicator">Showing fixtures for: ${this.selectedDate.toLocaleDateString()}</div>`
      : '';

    return template
      .replace('{{upcomingFixtures}}', this.renderUpcomingFixtures())
      .replace('{{prevDisabled}}', this.currentPage === 0 ? 'disabled' : '')
      .replace('{{nextDisabled}}', this._hasNextPage() ? '' : 'disabled')
      .replace('{{showPaging}}', showPaging ? '' : 'style="display: none;"')
      .replace('{{calendar}}', this.renderCalendar())
      .replace('{{calendarFilter}}', this.renderCalendarFilter())
      .replace('{{filterIndicator}}', filterIndicatorHtml);
  }

  render() {
    const isMobile = this.getAttribute('is-mobile') === 'true';
    this.shadow.innerHTML = `
      <style>${isMobile ? LeagueMatchesUpcoming.MOBILE_STYLES : LeagueMatchesUpcoming.DESKTOP_STYLES}</style>
      ${this._fillTemplate(LeagueMatchesUpcoming.TEMPLATE)}
    `;
    this.setupEventListeners();
    this.setupCalendarEventListeners(); // Changed from setupCalendar to setupCalendarEventListeners
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

  setSelectedDate(date, dispatchEvent = true) {
    // console.log('[setSelectedDate] input date:', date, 'typeof:', typeof date);
    let newSelectedDate = null;
    if (date) {
      if (typeof date === 'string') {
        const parts = date.split('-'); // Expect YYYY-MM-DD
        if (parts.length === 3) {
          newSelectedDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        } else {
          // Try parsing other common string forms, but be wary of timezone issues
          newSelectedDate = new Date(date); 
        }
      } else if (date instanceof Date) {
        newSelectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      }
    }
    // console.log('[setSelectedDate] parsed newSelectedDate:', newSelectedDate);
    // console.log('[setSelectedDate] current this.selectedDate before update:', this.selectedDate);

    const currentNorm = this.selectedDate ? new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), this.selectedDate.getDate()).getTime() : null;
    const newNorm = newSelectedDate ? new Date(newSelectedDate.getFullYear(), newSelectedDate.getMonth(), newSelectedDate.getDate()).getTime() : null;

    // console.log('[setSelectedDate] currentNorm:', currentNorm, 'newNorm:', newNorm);

    if (currentNorm !== newNorm) {
      // console.log('[setSelectedDate] Date is different, proceeding to update.');
      this.selectedDate = newSelectedDate;
      this.currentPage = 0;
      if (newSelectedDate) {
        this.calendarDate = new Date(newSelectedDate.getFullYear(), newSelectedDate.getMonth(), 1);
      }
      //this.render(); // this.render() is problematic here as it triggers attribute change again before setAttribute
      
      if (dispatchEvent) {
        // console.log('[setSelectedDate] Dispatching dateChange event.');
        this.dispatchEvent(new LeagueMatchesUpcomingEvent({
          type: 'dateChange',
          selectedDate: this.selectedDate
        }));
      }

      if (this.selectedDate) {
        const newAttrValue = this.selectedDate.toISOString().split('T')[0];
        // console.log('[setSelectedDate] Calling setAttribute with:', newAttrValue);
        // Temporarily disable render() before setAttribute, and re-enable after, or better, ensure no infinite loop
        if (this.getAttribute('selected-date') !== newAttrValue) { // Only set if different
             this.setAttribute('selected-date', newAttrValue);
        }
      } else {
        // console.log('[setSelectedDate] Calling removeAttribute for selected-date.');
        if (this.hasAttribute('selected-date')) { // Only remove if present
            this.removeAttribute('selected-date');
        }
      }
      this.render(); // Call render *after* attribute might have been set and checked.
    } else {
      // console.log('[setSelectedDate] Date is the same, no update needed.');
      // If norms are same but actual attribute might be different (e.g. null vs non-null)
      // ensure render happens if selectedDate state actually changed (e.g. from a date to null)
      if ((!newSelectedDate && this.selectedDate) || (newSelectedDate && !this.selectedDate)) {
          this.selectedDate = newSelectedDate; // Ensure state consistency
          this.render();
      }
    }
  }

  clearDateFilter() {
    if (this.selectedDate !== null) {
      this.setSelectedDate(null); // This will re-render and dispatch event
    }
  }

  // --- Calendar specific methods ---

  /**
   * Gets unique dates of unplayed matches for calendar highlighting.
   * @returns {Set<number>} Set of timestamps (local midnight) for dates with upcoming fixtures.
   * @private
   */
  _getFixtureDates() {
    if (!this.matches || !Array.isArray(this.matches) || this.matches.length === 0) return new Set();
    return new Set(
      this.matches
        .filter(match => match.date && !match.result) // Unplayed matches with a date
        .map(match => {
          const date = new Date(match.date); // Parses date string like "YYYY-MM-DD" as local midnight
          date.setHours(0, 0, 0, 0);      // Ensure it's local midnight
          return date.getTime();              // Get timestamp for local midnight
        })
    );
  }

  /**
   * Gets unique dates of played matches for calendar highlighting.
   * @returns {Set<number>} Set of timestamps (local midnight) for dates with results.
   * @private
   */
  _getResultDates() {
    if (!this.matches || !Array.isArray(this.matches) || this.matches.length === 0) return new Set();
    return new Set(
      this.matches
        .filter(match => match.date && match.result) // Played matches with a date
        .map(match => {
          const date = new Date(match.date); // Parses date string like "YYYY-MM-DD" as local midnight
          date.setHours(0, 0, 0, 0);      // Ensure it's local midnight
          return date.getTime();              // Get timestamp for local midnight
        })
    );
  }
  
  /**
   * Renders the HTML for the calendar.
   * @returns {string} HTML string for the calendar.
   * @private
   */
  renderCalendar() {
    const year = this.calendarDate.getFullYear();
    const month = this.calendarDate.getMonth();
    const fixtureDates = this._getFixtureDates(); 
    const resultDates = this._getResultDates();   
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const dayOfWeekOfFirst = firstDayOfMonth.getDay();
    
    const prevMonthLastDate = new Date(year, month, 0).getDate();

    let html = `
      <div class="calendar-header">
        <span class="calendar-nav" id="calendar-prev-month">&lt;</span>
        <span>${firstDayOfMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
        <span class="calendar-nav" id="calendar-next-month">&gt;</span>
      </div>
      <div class="calendar-grid">
        <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
    `;

    for (let i = 0; i < dayOfWeekOfFirst; i++) {
      const day = prevMonthLastDate - dayOfWeekOfFirst + 1 + i;
      html += `<div class="calendar-day other-month">${day}</div>`;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
      // Create date for the current cell, normalized to local midnight
      const cellDateLocal = new Date(year, month, day);
      // cellDateLocal is already at local midnight, so we can get its time directly
      // const cellDateUtcTs = Date.UTC(year, month, day); // No longer needed for this comparison

      const classes = ['calendar-day'];
      if (cellDateLocal.getTime() === today.getTime()) classes.push('today');
      
      // Compare local midnight timestamps
      const hasFixture = fixtureDates.has(cellDateLocal.getTime());
      const hasResult = resultDates.has(cellDateLocal.getTime());

      if (hasFixture) classes.push('has-fixture');
      if (hasResult) classes.push('has-result');
      
      // For 'selected' class, compare based on local date parts
      if (this.selectedDate && 
          cellDateLocal.getFullYear() === this.selectedDate.getFullYear() &&
          cellDateLocal.getMonth() === this.selectedDate.getMonth() &&
          cellDateLocal.getDate() === this.selectedDate.getDate()) {
        classes.push('selected');
      }
      
      let tooltip = '';
      if (this.matches) {
        const matchesOnDay = this.matches.filter(match => {
          if (!match.date) return false;
          // Compare match.date by normalizing it to local midnight as well
          const matchLocalDate = new Date(match.date);
          return matchLocalDate.getFullYear() === cellDateLocal.getFullYear() &&
                 matchLocalDate.getMonth() === cellDateLocal.getMonth() &&
                 matchLocalDate.getDate() === cellDateLocal.getDate();
        });
        const dayResults = matchesOnDay.filter(m => m.result);
        const dayFixtures = matchesOnDay.filter(m => !m.result);

        let tooltipLines = [];
        if (dayResults.length > 0) {
          tooltipLines.push('Results:');
          tooltipLines.push(...dayResults.map(m => `${m.homeTeamName} ${m.result.homeScore}-${m.result.awayScore} ${m.awayTeamName}`));
        }
        if (dayFixtures.length > 0) {
          if (dayResults.length > 0) tooltipLines.push(''); 
          tooltipLines.push('Fixtures:');
          tooltipLines.push(...dayFixtures.map(m => `${m.homeTeamName} vs ${m.awayTeamName}`));
        }
        if (tooltipLines.length > 0) {
          tooltip = `title="${this.escapeHtml(tooltipLines.join('\n'))}"`;
        }
      }
      // data-date should be YYYY-MM-DD for consistent parsing
      const dataDateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      html += `<div class="${classes.join(' ')}" data-date="${dataDateStr}" ${tooltip}>${day}</div>`;
    }

    const totalCells = dayOfWeekOfFirst + daysInMonth;
    const nextMonthDaysToShow = (totalCells % 7 === 0) ? 0 : 7 - (totalCells % 7);
    for (let i = 1; i <= nextMonthDaysToShow; i++) {
      html += `<div class="calendar-day other-month">${i}</div>`;
    }

    html += '</div>';
    return html;
  }

  /**
   * Renders the HTML for the calendar filter buttons.
   * @returns {string} HTML string for filter buttons.
   * @private
   */
  renderCalendarFilter() {
    const hasFilter = this.selectedDate;
    return `
      <button class="${!hasFilter ? 'active' : ''}" id="calendar-filter-all">All Dates</button>
      ${hasFilter ? `
        <button id="calendar-filter-clear">Clear Filter</button>
      ` : ''}
    `;
  }

  /**
   * Sets up event listeners for the calendar.
   * @private
   */
  setupCalendarEventListeners() {
    const prevMonthBtn = this.shadow.querySelector('#calendar-prev-month');
    const nextMonthBtn = this.shadow.querySelector('#calendar-next-month');
    const days = this.shadow.querySelectorAll('.calendar-day:not(.other-month)');
    const filterAllBtn = this.shadow.querySelector('#calendar-filter-all');
    const filterClearBtn = this.shadow.querySelector('#calendar-filter-clear');

    if (prevMonthBtn) {
      prevMonthBtn.onclick = () => {
        this.calendarDate.setMonth(this.calendarDate.getMonth() - 1);
        this.render();
      };
    }
    if (nextMonthBtn) {
      nextMonthBtn.onclick = () => {
        this.calendarDate.setMonth(this.calendarDate.getMonth() + 1);
        this.render();
      };
    }
    days.forEach(day => {
      day.onclick = () => {
        const dateStr = day.dataset.date; // dateStr is YYYY-MM-DD
        if (dateStr) {
           this.setSelectedDate(dateStr); // Pass the string directly
        }
      };
    });

    if (filterAllBtn) {
      filterAllBtn.onclick = () => this.clearDateFilter();
    }
    if (filterClearBtn) {
      filterClearBtn.onclick = () => this.clearDateFilter();
    }
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