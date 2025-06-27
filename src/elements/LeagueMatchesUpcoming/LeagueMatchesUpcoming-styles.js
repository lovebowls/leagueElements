import { panelStyles, buttonStyles, listItemStyles,pagingStyles } from '../shared-styles.js';

const BASE_STYLES = `
      ${panelStyles}
      ${buttonStyles}
      ${listItemStyles}
      ${pagingStyles}
      :host {
        display: block;
        font-family: var(--le-font-family-main, 'Open Sans', Helvetica, Arial, sans-serif);
        box-sizing: border-box;
        color: var(--le-text-color-primary, #333);
      }
      .upcoming-matches-container { /* Renamed for clarity */
        /* display: flex; /* Removed as list is now the primary content */
        /* gap: var(--le-padding-s, 0.5rem); /* Removed */
      }
      .matches-list {
        list-style: none;
        padding: 0;
        margin: 0;
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
        margin-top: var(--le-padding-m, 1rem);
        margin-bottom: var(--le-padding-xs, 0.2em);
        font-size: var(--le-font-size-medium);
        font-weight: bold;
        border-bottom: 1px solid var(--le-border-color-light, #eee);
        padding-bottom: var(--le-padding-xs, 0.2em);
      }
      .match-date:first-child {
        margin-top: 0;
      }
      .no-matches {
        padding: var(--le-padding-m, 1rem);
        text-align: center;
        color: var(--le-text-color-secondary, #666);
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
      .paging-btn {
        padding: 0.2rem 0.7rem;
      }
      /* Mobile: Remove height constraints and scrollbars for dynamic content-based height */
      .matches-list {
        max-height: none;
        overflow-y: visible;
      }
    `;

export const DESKTOP_STYLES = `
      ${BASE_STYLES}
      /* Desktop: Keep max-height and scrollbars for space management */
      .matches-list {
        max-height: 300px;
        overflow-y: auto;
      }
    `;

export const TEMPLATE = `
      <!-- CALENDAR SECTION REMOVED -->
      <div class="upcoming-matches-container">
        <div class="matches-list" id="upcoming-matches-list">
          {{upcomingFixtures}}
        </div>
      </div>
      <div class="paging-controls" id="upcoming-paging" {{showPaging}}>
        <button class="paging-btn button-shared button" id="upcoming-prev" {{prevDisabled}}>&lt; Prev</button>
        <button class="paging-btn button-shared button" id="upcoming-next" {{nextDisabled}}>Next &gt;</button>
      </div>
    `; 