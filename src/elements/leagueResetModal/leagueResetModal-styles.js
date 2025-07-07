import { buttonStyles, modalStyles, formStyles } from '../shared-styles.js';

export const BASE_STYLES = `
  ${buttonStyles}
  ${modalStyles}
  ${formStyles}
  
  :host {
    display: none;
    position: fixed;
    z-index: var(--le-z-index-modal, 1001);
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: var(--le-background-color-modal-overlay, rgba(0,0,0,0.4));
    align-items: center;
    justify-content: center;
  }
  
  :host([open][is-mobile="true"]) {
    display: flex;
  }
  
  :host([open]) {
    display: flex; 
  }

  /* Header warning text styling */
  .header-warning {
    color: var(--le-color-status-warning, #f39c12);
    font-weight: normal;
    font-size: var(--le-font-size-small, 0.8em);
    margin: 0;
    padding: var(--le-padding-xs, 0.25rem) var(--le-padding-m, 1rem);
    line-height: 1.2;
    display: block;
    width: 100%;
  }

  .league-info {
    background-color: var(--le-background-color-light, #f9f9f9);
    border: 1px solid var(--le-border-color-light, #e0e0e0);
    border-radius: var(--le-border-radius-standard, 4px);
    padding: var(--le-padding-m, 1rem);
    margin-bottom: var(--le-padding-m, 1rem);
  }

  .league-info p {
    margin: 0.25rem 0;
  }

  /* Horizontal form row for start date and max rinks */
  .form-row {
    display: flex;
    gap: var(--le-padding-m, 1rem);
    margin-bottom: var(--le-padding-m, 1rem);
  }

  .footer-error {
    color: var(--le-color-status-error, #e74c3c);
    margin: 0;
    text-align: left;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: auto;
  }

  .form-fieldset-shared {
    border: 1px solid var(--le-border-color-medium, #ddd);
    border-radius: var(--le-border-radius-standard, 4px);
    padding: var(--le-padding-m, 1rem);
    margin: var(--le-padding-m, 1rem) 0;
  }

  .form-legend {
    font-weight: bold;
    padding: 0 var(--le-padding-s, 0.5rem);
    color: var(--le-text-color-primary, #333);
  }

  .interval-inputs {
    display: flex;
    align-items: center;
    gap: var(--le-padding-s, 0.5rem);
    margin-top: var(--le-padding-s, 0.5rem);
    margin-left: var(--le-padding-m, 1rem);
  }

  .interval-number {
    width: 80px;
    min-width: 80px;
  }

  .day-checkboxes {
    display: none;
    flex-wrap: wrap;
    gap: var(--le-padding-s, 0.5rem);
    margin-top: var(--le-padding-s, 0.5rem);
    margin-left: var(--le-padding-m, 1rem);
  }

  .day-checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--le-border-color-light, #e0e0e0);
    border-radius: var(--le-border-radius-standard, 4px);
    background-color: var(--le-background-color-panel, #fff);
    transition: background-color 0.2s ease;
  }

  .day-checkbox-label:hover {
    background-color: var(--le-background-color-light, #f9f9f9);
  }

  .day-checkbox-label input[type="checkbox"] {
    margin: 0;
  }

  .preview-section {
    background-color: var(--le-background-color-light, #f9f9f9);
    border: 1px solid var(--le-border-color-light, #e0e0e0);
    border-radius: var(--le-border-radius-standard, 4px);
    padding: var(--le-padding-m, 1rem);
    margin-top: var(--le-padding-m, 1rem);
    margin-bottom: var(--le-padding-s, 0.5rem);
  }

  .preview-section h4 {
    margin: 0 0 var(--le-padding-s, 0.5rem) 0;
    color: var(--le-text-color-primary, #333);
  }

  .preview-text {
    margin: 0;
    font-style: italic;
    color: var(--le-text-color-secondary, #666);
  }

  /* Mobile-specific adjustments */
  @media (max-width: 480px) {
    
    .interval-number {
      width: 100%;
      min-width: auto;
    }
    
    .day-checkboxes {
      gap: 8px;
    }
    
    .day-checkbox-label {
      padding: 8px 12px;
      min-height: 44px;
      align-items: center;
      justify-content: center;
    }

    .league-info,
    .preview-section {
      padding: 12px;
    }
    
    .form-fieldset-shared {
      padding: 12px;
    }

  }
`; 