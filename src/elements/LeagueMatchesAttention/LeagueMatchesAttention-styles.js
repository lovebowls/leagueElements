import { panelStyles, buttonStyles, listItemStyles, mobileStyles, desktopStyles } from '../shared-styles.js';

const BASE_STYLES = `
      ${panelStyles}
      ${buttonStyles}
      ${listItemStyles}
      :host {
        display: block;
        font-family: var(--le-font-family-main, 'Open Sans', Helvetica, Arial, sans-serif);
        box-sizing: border-box;
        color: var(--le-text-color-primary, #333);
        /* font-size removed - will be set by mobile/desktop styles */
      }
      .match-item {
        padding: var(--swal-padding-xs, 0.2rem) 0;
        display: flex;
        align-items: center;
        gap: var(--le-padding-xs, 0.25em);
      }
      .match-date {
        color: var(--le-text-color-secondary, #666);
        margin-bottom: var(--le-padding-xs, 0.2em);
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
        border-radius: var(--swal-border-radius-standard, 4px);
      }
      .warning-icon-future-result { color: var(--le-color-status-warning, #f39c12); }
      .warning-icon-conflict { color: var(--le-color-status-conflict, #e67e22); }
      .warning-icon-pending-result { color: var(--le-color-status-pending, #e74c3c); }
      .warning-icon-no-date { color: var(--le-color-status-info, #2196f3); }
      .warning-icon {
        flex-shrink: 0;
      }
      .no-matches {
        padding: var(--le-padding-m, 1rem);
        text-align: center;
        color: var(--le-text-color-secondary, #666);
      }
    `;

export const  MOBILE_STYLES = `
      ${BASE_STYLES}
      :host {
        ${mobileStyles}
      }
      .paging-btn {
      }
      .match-item {
        padding: var(--swal-padding-xs, 0.2rem) 0;
      }
    `;

export const DESKTOP_STYLES = `
      ${BASE_STYLES}
      :host {
        ${desktopStyles}
      }
      .match-item {
        padding: var(--swal-padding-xs, 0.2rem) 0;
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