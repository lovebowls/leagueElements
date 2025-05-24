// Define custom event types for the new element
class LeagueCalendarEvent extends CustomEvent {
  constructor(detail) {
    console.log('[LeagueCalendarEvent] Constructor called with detail:', JSON.stringify(detail));
    
    // Generate a consistent dateString for all event types
    if (detail.date && !detail.dateString) {
      try {
        // Try to convert legacy Date to Temporal PlainDate
        const plainDate = TemporalUtils.fromLegacyDate(detail.date);
        if (plainDate) {
          detail.dateString = plainDate.toString();
          // Add Temporal object for direct use
          detail.plainDate = plainDate;
          console.log('[LeagueCalendarEvent] Generated dateString using Temporal:', detail.dateString);
        } else {
          // Fallback to legacy method
          const d = detail.date;
          detail.dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          console.log('[LeagueCalendarEvent] Generated dateString using legacy method:', detail.dateString);
        }
      } catch (err) {
        console.error('[LeagueCalendarEvent] Error generating dateString with Temporal:', err);
        // Fallback to legacy method
        const d = detail.date;
        detail.dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        console.log('[LeagueCalendarEvent] Fallback to legacy dateString:', detail.dateString);
      }
    }
    
    // If we have year, month, day components but no dateString
    if (!detail.dateString && detail.year && detail.month && detail.day) {
      try {
        // Create a PlainDate using Temporal
        const plainDate = TemporalUtils.createPlainDate(detail.year, detail.month, detail.day);
        detail.dateString = plainDate.toString();
        // Add Temporal object for direct use
        detail.plainDate = plainDate;
        console.log('[LeagueCalendarEvent] Generated dateString from components using Temporal:', detail.dateString);
      } catch (err) {
        console.error('[LeagueCalendarEvent] Error generating dateString from components:', err);
        // Fallback to string formatting
        detail.dateString = `${detail.year}-${String(detail.month).padStart(2, '0')}-${String(detail.day).padStart(2, '0')}`;
        console.log('[LeagueCalendarEvent] Fallback dateString from components:', detail.dateString);
      }
    }
    
    // Always set the dateString as the currentFilterDate for parent components to use
    if (detail.type === 'dateChange' && detail.dateString) {
      detail.currentFilterDate = detail.dateString;
      console.log('[LeagueCalendarEvent] Setting explicit currentFilterDate for attribute:', detail.currentFilterDate);
    }
    
    super('league-calendar-event', {
      detail,
      bubbles: true,
      composed: true
    });
    console.log('[LeagueCalendarEvent] Event created:', this.type, 'with detail:', JSON.stringify(this.detail));
  }
}

// Import shared styles if needed
// import { mobileStyles } from './shared-styles.js'; // REMOVED

import {
    BASE_STYLES,
    MOBILE_STYLES,
    DESKTOP_STYLES,
    TEMPLATE
} from './LeagueCalendar-styles.js';

// Import Temporal API utilities
import { Temporal, TemporalUtils } from '../utils/temporalUtils.js';

class LeagueCalendar extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this._matches = []; // Store the raw matches data
    this._selectedDate = null; // Legacy Date object or null
    this._selectedTemporal = null; // Temporal.PlainDate if available
    this._selectedDateString = null; // Original date string for comparison
    this._calendarDate = new Date(); // Date object for the month being viewed
    this._calendarTemporal = TemporalUtils.today(); // Temporal version of calendar month
    this._fixtureDates = new Set(); // Set of timestamps for dates with fixtures
    this._resultDates = new Set();  // Set of timestamps for dates with results
  }

  static get observedAttributes() {
    return ['matches', 'is-mobile', 'current-filter-date'];
  }

  connectedCallback() {
    console.log('[LeagueCalendar] connectedCallback - Initial attributes:', 
        'matches:', this.hasAttribute('matches') ? this.getAttribute('matches').substring(0,100) + '...' : 'null', 
        'current-filter-date:', this.getAttribute('current-filter-date')
    );
    if (this.hasAttribute('matches')) {
      this._loadMatchesData(this.getAttribute('matches'));
    }
    if (this.hasAttribute('current-filter-date')) {
        this._parseSelectedDateAttribute(this.getAttribute('current-filter-date'));
    }
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue && name !== 'matches') return; // Allow matches to re-process if needed

    console.log(`[LeagueCalendar] attributeChangedCallback: ${name}`,
        `oldValue: ${oldValue ? (typeof oldValue === 'string' ? oldValue.substring(0,50)+'...': oldValue) : oldValue}`, 
        `newValue: ${newValue ? (typeof newValue === 'string' ? newValue.substring(0,50)+'...': newValue) : newValue}`
    );

    if (name === 'matches') {
      this._loadMatchesData(newValue);
    } else if (name === 'is-mobile') {
      this.render();
    } else if (name === 'current-filter-date') {
        // Handle a special case: if the date string has a "-01" at the end and we're clicking on "-02",
        // this is likely the timezone issue
        if (newValue && newValue.endsWith('-01') && this._selectedDate) {
            // Check if the currently selected date is for the 2nd
            const selectedDay = this._selectedDate.getDate();
            if (selectedDay === 2) {
                // This is the off-by-one bug case
                console.log('[LeagueCalendar] attributeChangedCallback: Detected timezone issue, keeping current selection:', this._selectedDate);
                this.render();
                return;
            }
        }

        this._parseSelectedDateAttribute(newValue);
        this.render(); // Re-render to reflect the change in selection
    }
  }
  
  _parseSelectedDateAttribute(dateString) {
    console.log('[LeagueCalendar] _parseSelectedDateAttribute CALLED with:', dateString);
    
    if (dateString && dateString !== 'null' && dateString !== 'undefined') {
        // Using Temporal API to parse the date
        try {
            // Parse the string into a Temporal PlainDate
            const plainDate = TemporalUtils.parseISODate(dateString);
            
            if (plainDate) {
                // Store the Temporal date
                this._selectedTemporal = plainDate;
                console.log('[LeagueCalendar] _parseSelectedDateAttribute: using Temporal PlainDate:', plainDate.toString());
                
                // Store the original string
                this._selectedDateString = dateString;
                
                // Also create a legacy Date for backward compatibility
                this._selectedDate = TemporalUtils.toLegacyDate(plainDate);
                console.log('[LeagueCalendar] _parseSelectedDateAttribute: legacy Date created:', 
                    this._selectedDate.toString());
                
                // Update calendar month view if needed
                if (this._selectedDate.getFullYear() !== this._calendarDate.getFullYear() ||
                    this._selectedDate.getMonth() !== this._calendarDate.getMonth()) {
                    this._calendarDate = new Date(this._selectedDate.getFullYear(), this._selectedDate.getMonth(), 1);
                }
                
                return;
            }
        } catch (err) {
            console.error('[LeagueCalendar] Error using Temporal to parse date:', err);
            // Continue to fallback parsing below
        }
        
        // Fallback: direct parsing without using Date constructor
        const parts = dateString.split('-');
        if (parts.length === 3) {
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1; // Convert to 0-indexed month for Date
            const day = parseInt(parts[2]);
            
            console.log(`[LeagueCalendar] _parseSelectedDateAttribute: fallback parsing: year=${year}, month=${month}, day=${day}`);
            
            // Create a legacy Date at local midnight
            this._selectedDate = new Date(year, month, day);
            this._selectedDate.setHours(0, 0, 0, 0);
            
            // Store the original string
            this._selectedDateString = dateString;
            
            // Clear Temporal since we couldn't create it
            this._selectedTemporal = null;
            
            console.log('[LeagueCalendar] _parseSelectedDateAttribute: _selectedDate set to:', 
                this._selectedDate.toString());
                
            // Update calendar month view if needed
            if (this._selectedDate.getFullYear() !== this._calendarDate.getFullYear() ||
                this._selectedDate.getMonth() !== this._calendarDate.getMonth()) {
                this._calendarDate = new Date(this._selectedDate.getFullYear(), this._selectedDate.getMonth(), 1);
            }
            
            return;
        }
    }
    
    // No date provided, invalid format, or null/undefined value - clear selection
    console.log('[LeagueCalendar] _parseSelectedDateAttribute: Invalid input, clearing date selection');
    this._selectedDate = null;
    this._selectedTemporal = null;
    this._selectedDateString = null;
  }

  _loadMatchesData(matchesData) {
    try {
      console.log('[LeagueCalendar] _loadMatchesData started. Input type:', typeof matchesData);
      if (typeof matchesData === 'string') {
        console.log('[LeagueCalendar] _loadMatchesData: Parsing matchesData string:', matchesData.substring(0, 200) + '...');
        this._matches = JSON.parse(matchesData);
      } else {
        console.log('[LeagueCalendar] _loadMatchesData: Using matchesData as object.');
        this._matches = matchesData || [];
      }
      console.log('[LeagueCalendar] _loadMatchesData: Parsed _matches count:', this._matches.length, 'First match (if any):', this._matches.length > 0 ? JSON.stringify(this._matches[0]) : 'N/A');
      this._processMatchDates();
      this.render();
    } catch (error) {
      console.error('LeagueCalendar: Error loading or parsing matches data:', error);
      this._matches = [];
      this._processMatchDates(); // Recalculate with empty matches
      this.render(); // Re-render to show empty state or error
      this._showError('Failed to load match data for calendar highlights.');
    }
  }

  _processMatchDates() {
    console.log('[LeagueCalendar] _processMatchDates: Processing...');
    this._fixtureDates = new Set();
    this._resultDates = new Set();
    
    if (!this._matches || !Array.isArray(this._matches)) {
      console.log('[LeagueCalendar] _processMatchDates: No matches found.');
      return;
    }
    
    for (const match of this._matches) {
      if (!match.date) continue;
      
      // Try to use Temporal API first
      try {
        // Parse the date string using Temporal
        const matchPlainDate = TemporalUtils.parseISODate(match.date);
        
        if (matchPlainDate) {
          console.log(`[LeagueCalendar] Match date from ${match.date} parsed as Temporal:`, matchPlainDate.toString());
          
          // Get UTC midnight timestamp for compatibility with existing sets
          const utcTimestamp = Date.UTC(
            matchPlainDate.year,
            matchPlainDate.month - 1, // Month is 0-indexed for Date.UTC
            matchPlainDate.day
          );
          
          // Add to appropriate set based on whether it has a result
          if (match.result && (typeof match.result.homeScore === 'number' || typeof match.result.awayScore === 'number')) {
            this._resultDates.add(utcTimestamp);
            console.log(`[LeagueCalendar] Added ${match.date} to resultDates as timestamp ${utcTimestamp}`);
          } else {
            this._fixtureDates.add(utcTimestamp);
            console.log(`[LeagueCalendar] Added ${match.date} to fixtureDates as timestamp ${utcTimestamp}`);
          }
          
          continue; // Skip to next match, we've processed this one
        }
      } catch (err) {
        console.warn('[LeagueCalendar] Error using Temporal for match date:', err);
        // Fall through to legacy approach
      }
      
      // Legacy fallback approach
      try {
        // Parse the date string using legacy Date
        const matchDate = new Date(match.date);
        const utcTimestamp = Date.UTC(
          matchDate.getFullYear(),
          matchDate.getMonth(),
          matchDate.getDate()
        );
        
        if (isNaN(utcTimestamp)) {
          console.warn(`[LeagueCalendar] Invalid date: ${match.date}`);
          continue;
        }
        
        if (match.result && (typeof match.result.homeScore === 'number' || typeof match.result.awayScore === 'number')) {
          this._resultDates.add(utcTimestamp);
          console.log(`[LeagueCalendar] Fallback: Added ${match.date} to resultDates as timestamp ${utcTimestamp}`);
        } else {
          this._fixtureDates.add(utcTimestamp);
          console.log(`[LeagueCalendar] Fallback: Added ${match.date} to fixtureDates as timestamp ${utcTimestamp}`);
        }
      } catch (err) {
        console.error(`[LeagueCalendar] Error processing date ${match.date}:`, err);
      }
    }
    
    console.log('[LeagueCalendar] _processMatchDates: Finished.', 
      'fixtureDates:', Array.from(this._fixtureDates), 
      'resultDates:', Array.from(this._resultDates));
  }

  _showError(message) {
    const errorContainer = this.shadow.querySelector('#error-container');
    if (errorContainer) {
      errorContainer.innerHTML = `<div class="error">${this.escapeHtml(message)}</div>`;
    }
  }

  _clearError() {
    const errorContainer = this.shadow.querySelector('#error-container');
    if (errorContainer) {
      errorContainer.innerHTML = '';
    }
  }
  
  renderFilterIndicator() {
    const container = this.shadow.querySelector('#filter-indicator-container');
    if (!container) return;
    if (this._selectedDate) {
      const dateString = this._selectedDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
      container.innerHTML = `
        <div class="filter-indicator">
          <span>Showing: ${this.escapeHtml(dateString)}</span>
          <button id="calendar-filter-clear">Clear Filter</button>
        </div>
      `;
      
      // Add event listener to the clear filter button
      const clearFilterBtn = container.querySelector('#calendar-filter-clear');
      if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', () => this._handleClearFilter());
        clearFilterBtn.addEventListener('keydown', (e) => { 
          if (e.key === 'Enter' || e.key === ' ') this._handleClearFilter(); 
        });
      }
    } else {
      container.innerHTML = '';
    }
  }

  _handleClearFilter() {
    // Clear all date representations
    this._selectedDate = null;
    this._selectedTemporal = null; 
    this._selectedDateString = null;
    
    // Dispatch event with null values
    this.dispatchEvent(new LeagueCalendarEvent({ 
        type: 'filterClear',
        date: null,
        dateString: null,
        plainDate: null
    }));
    
    this.render(); // Re-render to update button states and indicator
  }

  render() {
    const isMobile = this.getAttribute('is-mobile') === 'true';
    this.shadow.innerHTML = `
      <style>${isMobile ? MOBILE_STYLES : DESKTOP_STYLES}</style>
      ${TEMPLATE}
    `;
    this._clearError(); // Clear previous errors
    this.shadow.querySelector('#calendar-content').innerHTML = this._renderCalendarHTML();
    this.shadow.querySelector('#calendar-filter-buttons').innerHTML = this._renderCalendarFilterHTML();
    this.renderFilterIndicator();
    this._attachCalendarEventListeners();
  }

  _renderCalendarHTML() {
    const year = this._calendarDate.getFullYear();
    const month = this._calendarDate.getMonth();
    
    console.log(`[LeagueCalendar] _renderCalendarHTML: Rendering for ${year}-${month+1}. Today: ${new Date().toISOString().split('T')[0]}`);
    console.log('[LeagueCalendar] _renderCalendarHTML: _selectedDate:', this._selectedDate ? this._selectedDate.toISOString() : 'null');
    console.log('[LeagueCalendar] _renderCalendarHTML: Using _fixtureDates:', Array.from(this._fixtureDates), '_resultDates:', Array.from(this._resultDates));

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const dayOfWeekOfFirst = firstDayOfMonth.getDay();
    
    const prevMonthLastDate = new Date(year, month, 0).getDate();

    let html = `
      <div class="calendar-header">
        <span class="calendar-nav" id="calendar-prev-month" role="button" aria-label="Previous month" tabindex="0">&lt;</span>
        <span>${firstDayOfMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
        <span class="calendar-nav" id="calendar-next-month" role="button" aria-label="Next month" tabindex="0">&gt;</span>
      </div>
      <div class="calendar-grid">
        <div class="calendar-day-header">Su</div>
        <div class="calendar-day-header">Mo</div>
        <div class="calendar-day-header">Tu</div>
        <div class="calendar-day-header">We</div>
        <div class="calendar-day-header">Th</div>
        <div class="calendar-day-header">Fr</div>
        <div class="calendar-day-header">Sa</div>
    `;

    for (let i = 0; i < dayOfWeekOfFirst; i++) {
      const day = prevMonthLastDate - dayOfWeekOfFirst + 1 + i;
      html += `<div class="calendar-day other-month">${day}</div>`;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
      // Create date string in YYYY-MM-DD format
      const cellDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // Create a Temporal PlainDate for this cell
      let cellTemporal = null;
      try {
        cellTemporal = TemporalUtils.createPlainDate(year, month + 1, day);
      } catch (err) {
        console.warn('[LeagueCalendar] Error creating Temporal date for cell:', err);
      }
      
      // Also create legacy Date for backward compatibility
      const cellDateLocal = new Date(year, month, day); // Already local midnight
      cellDateLocal.setHours(0, 0, 0, 0); // Ensure hours are set to 0
      const cellTimestamp = cellDateLocal.getTime(); // This will be local midnight timestamp

      // For comparison with _fixtureDates and _resultDates sets
      const cellUTCMidnightTimestamp = Date.UTC(year, month, day);

      // Debug specific dates that might be problematic
      if (day === 1 || day === 2) {
        console.log(`[LeagueCalendar] DAY ${day} DEBUG:`,
          'cellDateStr:', cellDateStr,
          'cellTemporal:', cellTemporal ? cellTemporal.toString() : 'N/A',
          'cellDateLocal:', cellDateLocal.toString(),
          'cellDateLocal ISO:', cellDateLocal.toISOString(),
          'cellTimestamp:', cellTimestamp,
          'selectedDate (if any):', this._selectedDate ? this._selectedDate.toString() : null,
          'selectedTemporal (if any):', this._selectedTemporal ? this._selectedTemporal.toString() : null,
          'selectedDateString (if any):', this._selectedDateString,
          'selectedDate timestamp (if any):', this._selectedDate ? this._selectedDate.getTime() : null,
          'match?', this._isDateMatch(cellDateStr, cellTemporal, cellDateLocal)
        );
      }

      const classes = ['calendar-day'];
      
      // Check if this is today
      // Using PlainDate from Temporal API to compare
      const isToday = cellTemporal && TemporalUtils.areDatesEqual(cellTemporal, TemporalUtils.today());
      if (isToday) classes.push('today');
      
      const hasFixture = this._fixtureDates.has(cellUTCMidnightTimestamp);
      const hasResult = this._resultDates.has(cellUTCMidnightTimestamp);

      // Add fixture/result classes
      if (hasFixture) classes.push('has-fixture');
      if (hasResult) classes.push('has-result');

      // Check if this cell is selected using our utility method
      const isSelected = this._isDateMatch(cellDateStr, cellTemporal, cellDateLocal);
      if (isSelected) {
        classes.push('selected');
        console.log(`[LeagueCalendar] Day ${day} marked as SELECTED using isDateMatch`);
      }

      let tooltipContent = '';
      if (this._matches) {
        const matchesOnDay = this._matches.filter(match => {
          if (!match.date) return false;
          const matchLocalDate = new Date(match.date);
          matchLocalDate.setHours(0,0,0,0);
          return matchLocalDate.getTime() === cellTimestamp;
        });
        const dayResults = matchesOnDay.filter(m => m.result);
        const dayFixtures = matchesOnDay.filter(m => !m.result);

        let tooltipLines = [];
        if (dayResults.length > 0) {
          tooltipLines.push('Results:');
          tooltipLines.push(...dayResults.map(m => `${this.escapeHtml(m.homeTeam?.name || '')} ${m.result.homeScore}-${m.result.awayScore} ${this.escapeHtml(m.awayTeam?.name || '')}`));
        }
        if (dayFixtures.length > 0) {
          if (dayResults.length > 0) tooltipLines.push(''); 
          tooltipLines.push('Fixtures:');
          tooltipLines.push(...dayFixtures.map(m => `${this.escapeHtml(m.homeTeam?.name || '')} vs ${this.escapeHtml(m.awayTeam?.name || '')}`));
        }
        if (tooltipLines.length > 0) {
          tooltipContent = `<div class="calendar-tooltip">${tooltipLines.join('<br>')}</div>`;
        }
      }
      html += `<div class="${classes.join(' ')}" data-date="${cellDateStr}" role="button" tabindex="0" aria-label="Date ${day}">${day}${tooltipContent}</div>`;
    }

    const totalCells = dayOfWeekOfFirst + daysInMonth;
    const nextMonthDaysToShow = (totalCells % 7 === 0) ? 0 : 7 - (totalCells % 7);
    for (let i = 1; i <= nextMonthDaysToShow; i++) {
      html += `<div class="calendar-day other-month">${i}</div>`;
    }

    html += '</div>';
    return html;
  }

  _renderCalendarFilterHTML() {
    // Remove calendar filter buttons entirely since we now have Clear Filter in the indicator
    return '';
  }

  _attachCalendarEventListeners() {
    const prevMonthBtn = this.shadow.querySelector('#calendar-prev-month');
    const nextMonthBtn = this.shadow.querySelector('#calendar-next-month');
    const days = this.shadow.querySelectorAll('.calendar-day:not(.other-month)');

    const handleNavClick = (btn) => {
        if (btn.id === 'calendar-prev-month') {
            this._calendarDate.setMonth(this._calendarDate.getMonth() - 1);
        } else {
            this._calendarDate.setMonth(this._calendarDate.getMonth() + 1);
        }
        this.render();
    };
    
    const handleDayClick = (day) => {
        const dateStr = day.dataset.date; // YYYY-MM-DD
        console.log('[LeagueCalendar] handleDayClick: clicked on date:', dateStr);
        
        if (dateStr) {
            // Use Temporal API to create a PlainDate
            try {
                // Parse the date string into a Temporal PlainDate
                const plainDate = TemporalUtils.parseISODate(dateStr);
                
                if (plainDate) {
                    console.log('[LeagueCalendar] handleDayClick: created Temporal PlainDate:', plainDate.toString());
                
                    // Store the PlainDate for internal use
                    this._selectedTemporal = plainDate;
                    
                    // Also store the date string to support both methods
                    this._selectedDateString = dateStr;
                    
                    // For legacy compatibility, create a Date object as well
                    this._selectedDate = TemporalUtils.toLegacyDate(plainDate);
                    
                    // Create a detail object with Temporal-friendly values
                    const eventDetail = { 
                        type: 'dateChange',
                        // Include the original ISO string
                        dateString: dateStr,
                        // Add the Temporal object (will be serialized in JSON)
                        plainDate: plainDate,
                        // Include separate components for compatibility
                        year: plainDate.year,
                        month: plainDate.month,
                        day: plainDate.day,
                        // Explicitly state the exact date we want to filter by
                        filterDate: dateStr
                    };
                    
                    console.log('[LeagueCalendar] handleDayClick: dispatching event with detail:', JSON.stringify(eventDetail));
                    
                    // Dispatch the event with our standardized detail object
                    this.dispatchEvent(new LeagueCalendarEvent(eventDetail));
                    
                    this.render();
                } else {
                    console.error('[LeagueCalendar] handleDayClick: Failed to create Temporal date from', dateStr);
                }
            } catch (err) {
                console.error('[LeagueCalendar] handleDayClick: Error using Temporal:', err);
                
                // Fallback to previous implementation if Temporal fails
                const parts = dateStr.split('-');
                const year = parseInt(parts[0]);
                const month = parseInt(parts[1]) - 1; // Month is 0-indexed for legacy Date
                const dayOfMonth = parseInt(parts[2]);
                
                console.log(`[LeagueCalendar] handleDayClick: fallback using parsed year=${year}, month=${month}, day=${dayOfMonth}`);
                
                const localNewSelected = new Date(year, month, dayOfMonth);
                localNewSelected.setHours(0, 0, 0, 0);
                this._selectedDate = localNewSelected;
                this._selectedDateString = dateStr;
                
                // Since Temporal failed, we won't have _selectedTemporal
                this._selectedTemporal = null;
                
                const eventDetail = { 
                    type: 'dateChange',
                    dateString: dateStr,
                    year: year,
                    month: month + 1, // Convert back to 1-indexed for consistency
                    day: dayOfMonth,
                    filterDate: dateStr
                };
                
                this.dispatchEvent(new LeagueCalendarEvent(eventDetail));
                this.render();
            }
        }
    };

    if (prevMonthBtn) {
      prevMonthBtn.addEventListener('click', () => handleNavClick(prevMonthBtn));
      prevMonthBtn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') handleNavClick(prevMonthBtn); });
    }
    if (nextMonthBtn) {
      nextMonthBtn.addEventListener('click', () => handleNavClick(nextMonthBtn));
      nextMonthBtn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') handleNavClick(nextMonthBtn); });
    }
    days.forEach(day => {
      day.addEventListener('click', () => handleDayClick(day));
      day.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') handleDayClick(day); });
    });
  }

  escapeHtml(unsafe = '') {
    const str = String(unsafe);
    return str
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  }

  /**
   * Public API method that can be called directly by parent components.
   * This addresses timezone issues by allowing direct communication with a string.
   * @param {string} dateString - Date string in YYYY-MM-DD format
   */
  setSelectedDate(dateString) {
    console.log('[LeagueCalendar] setSelectedDate called directly with:', dateString);
    if (dateString) {
      // Parse the string directly to avoid timezone issues
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Month is 0-indexed
        const day = parseInt(parts[2]);
        
        console.log(`[LeagueCalendar] setSelectedDate: parsed directly year=${year}, month=${month}, day=${day}`);
        
        this._selectedDate = new Date(year, month, day);
        this._selectedDate.setHours(0, 0, 0, 0);
        
        console.log('[LeagueCalendar] setSelectedDate: _selectedDate set to:', 
            this._selectedDate, 'ISO:', this._selectedDate.toISOString());
        
        // If date changes month/year, update calendar view
        if (this._calendarDate.getFullYear() !== year || 
            this._calendarDate.getMonth() !== month) {
          this._calendarDate = new Date(year, month, 1);
        }
        
        this.render();
        return true;
      }
    } else {
      // Clear the selection
      this._selectedDate = null;
      this.render();
      return true;
    }
    return false;
  }

  /**
   * Public method that can be called by parent components directly instead of using the attribute
   * This allows us to bypass timezone issues in attribute setting
   * @param {Object} detail - The detail object from the calendar event 
   */
  handleSelectedDateDirectly(detail) {
    console.log('[LeagueCalendar] handleSelectedDateDirectly called with:', JSON.stringify(detail));
    
    // Direct access to our needed properties without going through date parser
    if (detail && (detail.dateString || detail.filterDate)) {
      const dateStr = detail.dateString || detail.filterDate;
      const parts = dateStr.split('-');
      
      if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Month is 0-indexed  
        const day = parseInt(parts[2]);
        
        console.log(`[LeagueCalendar] handleSelectedDateDirectly: using exact date parts year=${year}, month=${month}, day=${day}`);
        
        const newSelectedDate = new Date(year, month, day);
        newSelectedDate.setHours(0, 0, 0, 0);
        this._selectedDate = newSelectedDate;
        
        console.log('[LeagueCalendar] handleSelectedDateDirectly: _selectedDate set to:', this._selectedDate);
        
        // Update the calendar view if necessary
        if (this._calendarDate.getFullYear() !== year || 
            this._calendarDate.getMonth() !== month) {
          this._calendarDate = new Date(year, month, 1);
        }
        
        this.render();
        return true;
      }
    } else if (detail && detail.type === 'filterClear') {
      this._selectedDate = null;
      this.render();
      return true;
    }
    
    return false;
  }

  /**
   * Comprehensive date matching that works with all available date representations
   * @param {string} dateStr - ISO date string in YYYY-MM-DD format
   * @param {Temporal.PlainDate|null} temporalDate - Temporal PlainDate object
   * @param {Date|null} legacyDate - JavaScript Date object
   * @returns {boolean} Whether this date matches the selected date
   */
  _isDateMatch(dateStr, temporalDate, legacyDate) {
    // No selection means no match
    if (!this._selectedDate && !this._selectedTemporal && !this._selectedDateString) {
      return false;
    }
    
    // First priority: Compare using Temporal if available on both sides
    if (temporalDate && this._selectedTemporal) {
      const match = temporalDate.equals(this._selectedTemporal);
      if (match) {
        console.log('[LeagueCalendar] _isDateMatch: Match using Temporal comparison');
        return true;
      }
    }
    
    // Second priority: Compare date strings directly (most reliable)
    if (dateStr && this._selectedDateString) {
      const match = dateStr === this._selectedDateString;
      if (match) {
        console.log('[LeagueCalendar] _isDateMatch: Match using string comparison');
        return true;
      }
    }
    
    // Last resort: Compare using legacy Date objects
    if (legacyDate && this._selectedDate) {
      const match = legacyDate.getTime() === this._selectedDate.getTime();
      if (match) {
        console.log('[LeagueCalendar] _isDateMatch: Match using legacy Date timestamp comparison');
        return true;
      }
    }
    
    return false;
  }
}

customElements.define('league-calendar', LeagueCalendar);
export default LeagueCalendar; 