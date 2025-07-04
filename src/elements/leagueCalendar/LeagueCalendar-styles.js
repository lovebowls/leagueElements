// Base styles shared between mobile and desktop layouts
const BASE_STYLES = `
      :host {
        display: block;
        font-family: var(--le-font-family-main, 'Open Sans', Helvetica, Arial, sans-serif);
        box-sizing: border-box;
        color: var(--le-text-color-primary, #333);
      }
      .calendar-container {
        padding: var(--le-padding-s, 0.5rem);
        background-color: var(--le-background-color-panel, #fff);
      }
      .calendar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--le-padding-s, 0.5rem);
        font-weight: bold;
      }
      .calendar-nav {
        cursor: pointer;
        padding: var(--le-padding-xs, 0.25rem) var(--le-padding-s, 0.5rem);
        color: var(--le-text-color-accent, #2196f3);
        user-select: none; /* Prevents text selection on rapid clicks */
      }
      .calendar-nav:hover {
        color: var(--le-text-color-accent-hover, #1976d2);
      }
      .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: var(--le-padding-xs, 2px);
        text-align: center;
      }
      .calendar-grid > div { /* Applies to headers and days */
        padding: var(--le-padding-s, 0.5rem) var(--le-padding-xs, 0.25rem);
        border-radius: var(--le-border-radius-small, 2px);
      }
      .calendar-day-header { /* Specifically for Su, Mo, Tu... */
        font-weight: bold;
        color: var(--le-text-color-secondary, #666);
      }
      .calendar-day {
        cursor: pointer;
        transition: background-color 0.2s, border-color 0.2s;
        position: relative; /* For tooltip positioning */
      }
      .calendar-day:hover {
        background-color: var(--le-border-color-light, #f0f0f0);
      }
      .calendar-day.other-month {
        color: var(--le-text-color-secondary, #ccc); /* Using secondary for better visibility than light gray */
        cursor: default;
      }
      .calendar-day.today {
        /* Using a distinct style for today that\'s not just background, e.g., a border or font weight */
        border: 1px solid var(--le-text-color-accent, #2196f3);
        font-weight: bold;
      }
      .calendar-day.has-fixture {
        background-color: var(--le-color-status-warning, #ffc107); /* Changed from info blue to warning amber */
        border: 1px solid var(--le-color-status-warning-dark, #ff8f00); /* Changed border to darker amber */
        /* Consider color for text on this background if needed */
      }
      .calendar-day.has-result {
        background-color: var(--le-color-status-success, #c8e6c9); /* Using theme variable for success */
        border: 1px solid var(--le-form-color-w, #388e3c); /* Assuming form-w is a green success */
      }
      .calendar-day.has-fixture.has-result {
        background: linear-gradient(135deg, var(--le-color-status-success, #c8e6c9) 50%, var(--le-color-status-warning, #ffc107) 50%); /* Changed from info blue to warning amber */
        border: 1px solid var(--le-color-status-warning-dark, #ff8f00); /* Changed border to darker amber */
      }
      .calendar-day.selected {
        background-color: var(--le-text-color-accent, #2196f3) !important;
        color: var(--le-text-color-on-accent, #fff) !important;
        font-weight: bold;
      }
      .calendar-tooltip {
        position: absolute;
        background-color: var(--le-background-color-tooltip, #333);
        color: var(--le-text-color-on-primary, white); /* Assuming on-primary is suitable for tooltip text */
        padding: var(--le-padding-s, 0.5rem);
        border-radius: var(--le-border-radius-standard, 4px);
        white-space: pre-wrap; /* Allows line breaks from \n */
        z-index: 100;
        visibility: hidden;
        opacity: 0;
        transition: opacity 0.2s, visibility 0.2s;
        bottom: calc(100% + 5px); /* Position above the day cell */
        left: 50%;
        transform: translateX(-50%);
        min-width: 150px; /* Minimum width for better readability */
        text-align: left; /* Align text to the left within the tooltip */
      }
      .calendar-day:hover .calendar-tooltip {
        visibility: visible;
        opacity: 1;
      }
      .calendar-filter-controls {
        margin-top: var(--le-padding-s, 0.5rem);
        display: flex;
        gap: var(--le-padding-s, 0.5rem);
      }
      /* Using shared button styles will be better, but for now, specific styles */
      .calendar-filter-controls button {
        background: var(--le-background-color-button, #f5f5f5);
        border: 1px solid var(--le-border-color-dark, #ccc);
        border-radius: var(--le-border-radius-small, 3px);
        padding: var(--le-padding-xs, 0.2rem) var(--le-padding-s, 0.7rem);
        cursor: pointer;
        color: var(--le-text-color-button, var(--le-text-color-primary));
      }
      .calendar-filter-controls button:hover {
        border-color: var(--le-border-color-accent, #2196f3);
        background-color: var(--le-background-color-button-hover, #e9e9e9);
      }
      .calendar-filter-controls button.active {
        background-color: var(--le-text-color-accent, #2196f3);
        color: var(--le-text-color-on-accent, #fff);
        border-color: var(--le-text-color-accent-hover, #1976d2);
      }
      .error {
        color: var(--le-text-color-error, #ff0000);
        padding: var(--le-padding-s, 0.5rem);
        background-color: var(--le-background-color-error, #fff0f0);
        border-radius: var(--le-border-radius-standard, 4px);
        margin-top: var(--le-padding-s, 0.5rem);
      }
      .filter-indicator {
        background-color: var(--le-background-color-info-light, #e3f2fd); /* A light blue */
        border-left: 3px solid var(--le-text-color-accent, #2196f3);
        padding: var(--le-padding-s, 0.3rem) var(--le-padding-m, 0.5rem);
        margin-bottom: var(--le-padding-s, 0.5rem);
        color: var(--le-text-color-accent-hover, #1976d2);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .filter-indicator button {
        background: transparent;
        border: none;
        color: var(--le-text-color-accent, #2196f3);
        cursor: pointer;
        padding: var(--le-padding-xs, 0.2rem) var(--le-padding-s, 0.5rem);
      }
      .filter-indicator button:hover {
        text-decoration: underline;
      }
    `;

// Mobile-specific styles
export const MOBILE_STYLES = `
      ${BASE_STYLES}
      .calendar-container {
        font-size: var(--le-font-size-small);
      }
      .calendar-grid > div { /* Applies to headers and days */
        padding: var(--le-padding-s, 0.5rem) var(--le-padding-xs, 0.25rem);
        border-radius: var(--le-border-radius-small, 2px);
      }
    `;

// Desktop-specific styles
export const DESKTOP_STYLES = `
      ${BASE_STYLES}
    `;

export const TEMPLATE = `
      <div class="calendar-container">
        <div id="calendar-content">
          <!-- Calendar HTML will be injected here by _renderCalendarHTML() -->
        </div>
        <div class="calendar-filter-controls" id="calendar-filter-buttons">
          <!-- Filter buttons HTML will be injected here by _renderCalendarFilterHTML() -->
        </div>
      </div>
      <div id="filter-indicator-container"></div>
      <div id="error-container"></div>
    `; 