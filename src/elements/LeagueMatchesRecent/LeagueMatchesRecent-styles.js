import { panelStyles, buttonStyles, listItemStyles, mobileStyles } from '../shared-styles.js';

// Base styles shared between mobile and desktop layouts
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
      .matches-container {
        max-height: 300px;
        overflow-y: auto;
      }
      .match-item {
      }
      .match-date {
        color: var(--le-text-color-secondary, #666);
        font-size: 0.85em;
        margin-bottom: var(--le-padding-xs, 0.2em);
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
        font-size: 0.8em;
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
    `;

// Mobile-specific styles
export const MOBILE_STYLES = `
      ${BASE_STYLES}
      :host {
        ${mobileStyles}
      }
      .match-item {
        font-size: 1em;
      }
    `;

// Desktop-specific styles
export const DESKTOP_STYLES = `
      ${BASE_STYLES}
      :host {
      }
      .match-item {
        font-size: 1em;
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