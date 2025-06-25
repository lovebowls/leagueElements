import { panelStyles, buttonStyles, listItemStyles, mobileStyles, desktopStyles } from '../shared-styles.js';

// Base styles shared between mobile and desktop layouts
const BASE_STYLES = `
      ${panelStyles}
      ${buttonStyles}
      ${listItemStyles}
      :host {
        display: block;
        font-family: var(--le-font-family-main, 'Open Sans', Helvetica, Arial, sans-serif);
        box-sizing: border-box;
        color: var(--le-text-color-primary, #333);
      }
      .matches-container {
        /* Height will be overridden by mobile/desktop specific styles */
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
      .match-details {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .match-teams {
        flex-grow: 1;
      }
      .team-name {
      }
      .match-score {
        font-weight: bold;
        margin: 0 var(--le-padding-s, 0.5rem);
        color: var(--le-text-color-primary, #333);
      }
      .match-result-indicator {
        padding: var(--le-padding-xs, 0.1em) var(--le-padding-s, 0.3em);
        border-radius: var(--le-border-radius-small, 3px);
        color: var(--le-text-color-on-primary, #fff);
        font-weight: bold;
        margin-left: var(--le-padding-s, 0.5rem);
      }
      .result-w {
        background-color: var(--le-form-color-w, #4CAF50);
      }
      .result-d {
        background-color: var(--le-form-color-d, #FFC107);
      }
      .result-l {
        background-color: var(--le-form-color-l, #F44336);
      }
      .no-matches {
        padding: var(--le-padding-m, 1rem);
        text-align: center;
        color: var(--le-text-color-secondary, #666);
      }
      .error {
        color: var(--le-text-color-error, #ff0000);
        padding: var(--le-padding-s, 0.5rem);
      }
      .paging-controls {
        display: flex;
        justify-content: flex-end;
        gap: var(--le-padding-s, 0.5rem);
        margin-top: var(--le-padding-s, 0.5rem);
      }
      .paging-btn {
        background: var(--swal-background-color-button, #f5f5f5);
        border: 1px solid var(--swal-border-color-dark, #ccc);
        border-radius: var(--swal-border-radius-small, 3px);
        padding: var(--le-padding-xs, 0.2rem) var(--le-padding-s, 0.7rem);
        cursor: pointer;
      }
      .paging-btn:disabled {
        background: var(--swal-background-color-button-disabled, #eee);
        color: var(--le-text-color-secondary, #aaa);
        cursor: not-allowed;
      }
    `;

// Mobile-specific styles
export const MOBILE_STYLES = `
      ${BASE_STYLES}
      :host {
        ${mobileStyles}
      }
      .paging-btn {
        padding: 0.2rem 0.7rem;
      }
      /* Mobile: Remove height constraints and scrollbars for dynamic content-based height */
      .matches-container {
        max-height: none;
        overflow-y: visible;
      }
    `;

// Desktop-specific styles
export const DESKTOP_STYLES = `
      ${BASE_STYLES}
      :host {
        ${desktopStyles}
      }
      /* Desktop: Keep max-height and scrollbars for space management */
      .matches-container {
        max-height: 300px;
        overflow-y: auto;
      }
    `;

// Template
export const TEMPLATE = `
      <div class="recent-results">
        {{recentResults}}
      </div>
      <div class="paging-controls" id="recent-paging" {{showPaging}}>
        <button class="paging-btn button-shared button-sm" id="recent-prev" {{prevDisabled}}>&lt; Prev</button>
        <button class="paging-btn button-shared button-sm" id="recent-next" {{nextDisabled}}>Next &gt;</button>
      </div>
    `; 