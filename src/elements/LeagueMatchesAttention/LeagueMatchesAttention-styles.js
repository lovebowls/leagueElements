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
      .match-item {
        padding: var(--lae-padding-xs, 0.2rem) 0;
        display: flex;
        align-items: center;
        gap: var(--le-padding-xs, 0.25em);
      }
      .match-date {
        color: var(--le-text-color-secondary, #666);
        font-size: 0.85em;
        margin-bottom: var(--le-padding-xs, 0.2em);
      }
      .match-link {
        color: var(--le-text-color-accent, #2196f3);
        text-decoration: none;
        transition: color 0.2s;
        flex-grow: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        min-width: 0;
      }
      .match-link:hover {
        color: var(--le-text-color-accent-hover, #1976d2);
        text-decoration: underline;
      }
      .paging-controls {
        display: flex;
        justify-content: flex-end;
        gap: var(--le-padding-s, 0.5rem);
        margin-top: var(--le-padding-s, 0.5rem);
      }
      .error {
        color: var(--le-text-color-error, #ff0000);
        padding: var(--le-padding-s, 0.5rem);
        background-color: var(--le-background-color-error, #fff0f0);
        border-radius: var(--lae-border-radius-standard, 4px);
      }
      .warning-icon-future-result { color: var(--le-color-status-warning, #f39c12); }
      .warning-icon-conflict { color: var(--le-color-status-conflict, #e67e22); }
      .warning-icon-pending-result { color: var(--le-color-status-pending, #e74c3c); }
      .warning-icon-no-date { color: var(--le-color-status-info, #2196f3); }
      .warning-icon {
        font-size:1.2em;
        flex-shrink: 0;
      }
      .no-matches {
        padding: var(--le-padding-m, 1rem);
        text-align: center;
        color: var(--le-text-color-secondary, #666);
      }
    `;

export const MOBILE_STYLES = `
      ${BASE_STYLES}
      :host {
        ${mobileStyles}
      }
      .paging-btn {
      }
      .match-item {
        font-size: 1em;
        padding: var(--lae-padding-xs, 0.2rem) 0;
      }
    `;

export const DESKTOP_STYLES = `
      ${BASE_STYLES}
      :host {
      }
      .match-item {
        font-size: 1em;
        padding: var(--lae-padding-xs, 0.2rem) 0;
      }
    `;

export const TEMPLATE = `
      <div class="attention-matches">
        {{attentionMatches}}
      </div>
      <div class="paging-controls" id="attention-paging" {{showPaging}}>
        <button class="paging-btn button-shared button-sm" id="attention-prev" {{prevDisabled}}>&lt; Prev</button>
        <button class="paging-btn button-shared button-sm" id="attention-next" {{nextDisabled}}>Next &gt;</button>
      </div>
    `; 