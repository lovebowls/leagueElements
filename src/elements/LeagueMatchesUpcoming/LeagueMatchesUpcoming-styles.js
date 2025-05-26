import { panelStyles, buttonStyles, listItemStyles, mobileStyles } from '../shared-styles.js';

export const BASE_STYLES = `
      ${panelStyles}
      ${buttonStyles}
      ${listItemStyles}
      :host {
        display: block;
        font-family: var(--le-font-family-main, 'Open Sans', Helvetica, Arial, sans-serif);
        box-sizing: border-box;
        color: var(--le-text-color-primary, #333);
        font-size: var(--le-font-size-base, 1em);
      }
      .upcoming-matches-container { /* Renamed for clarity */
        /* display: flex; /* Removed as list is now the primary content */
        /* gap: var(--le-padding-s, 0.5rem); /* Removed */
      }
      .matches-list {
        list-style: none;
        padding: 0;
        margin: 0;
        max-height: 300px; /* Consider making this configurable or dynamic */
        overflow-y: auto;
      }
      .match-item {
        padding: var(--le-padding-s, 0.5rem) 0;
        border-bottom: 1px solid var(--le-border-color-light, #eee);
      }
      .match-item:last-child {
        border-bottom: none;
      }
      .match-date {
        color: var(--le-text-color-secondary, #666);
        font-size: 0.85em;
        margin-bottom: var(--le-padding-xs, 0.2em);
      }
      .match-teams { /* This class was present but not used, can be removed if still unused */
      }
      .no-matches {
        padding: var(--le-padding-m, 1rem);
        text-align: center;
        color: var(--le-text-color-secondary, #666);
      }
      /* CALENDAR STYLES ARE REMOVED FROM HERE */
      .paging-controls {
        display: flex;
        justify-content: flex-end;
        gap: var(--le-padding-s, 0.5rem);
        margin-top: var(--le-padding-s, 0.5rem);
      }
      .paging-btn {
        background: var(--lae-background-color-button, #f5f5f5);
        border: 1px solid var(--lae-border-color-dark, #ccc);
        border-radius: var(--lae-border-radius-small, 3px);
        padding: var(--le-padding-xs, 0.2rem) var(--le-padding-s, 0.7rem);
        font-size: 1em;
        cursor: pointer;
      }
      .paging-btn:disabled {
        background: var(--lae-background-color-button-disabled, #eee);
        color: var(--le-text-color-secondary, #aaa);
        cursor: not-allowed;
      }
      .filter-indicator { /* This style is now managed by LeagueCalendar or parent */
        /* Removed */
      }
      .error {
        color: var(--le-text-color-error, #ff0000); /* Using theme variable */
        padding: var(--le-padding-s, 0.5rem);
        background-color: var(--le-background-color-error, #fff0f0); /* Using theme variable */
        border-radius: var(--le-border-radius-standard, 4px);
      }
    `;

export const MOBILE_STYLES = `
      ${BASE_STYLES}
      :host {
        ${mobileStyles}
      }
      .paging-btn {
        padding: 0.2rem 0.7rem;
      }
    `;

export const DESKTOP_STYLES = `
      ${BASE_STYLES}
    `;

export const TEMPLATE = `
      <!-- CALENDAR SECTION REMOVED -->
      <div class="upcoming-matches-container">
        <div class="matches-list" id="upcoming-matches-list">
          {{upcomingFixtures}}
        </div>
      </div>
      <div class="paging-controls" id="upcoming-paging" {{showPaging}}>
        <button class="paging-btn button-shared button-sm" id="upcoming-prev" {{prevDisabled}}>&lt; Prev</button>
        <button class="paging-btn button-shared button-sm" id="upcoming-next" {{nextDisabled}}>Next &gt;</button>
      </div>
    `; 