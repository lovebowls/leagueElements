import { buttonStyles, modalStyles, formStyles, mobileStyles } from '../shared-styles.js';

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
    ${mobileStyles}
  }
  
  :host([open]) {
    display: flex; 
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

  .warning-text {
    color: var(--le-color-status-warning, #f39c12);
    font-weight: bold;
    margin-top: var(--le-padding-s, 0.5rem) !important;
  }

  .form-fieldset-shared {
    border: 1px solid var(--le-border-color-medium, #ddd);
    border-radius: var(--le-border-radius-standard, 4px);
    padding: var(--le-padding-m, 1rem);
    margin: var(--le-padding-m, 1rem) 0;
  }

  .form-legend-shared {
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
    font-size: var(--le-font-size-small, 0.9rem);
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

  .modal-close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--le-text-color-secondary, #666);
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s ease;
  }

  .modal-close-button:hover {
    background-color: var(--le-background-color-button-hover, #e0e0e0);
    color: var(--le-text-color-primary, #333);
  }

  /* Mobile-specific adjustments */
  @media (max-width: 480px) {
    .modal-shared-content {
      width: 95% !important;
      max-width: 95% !important;
      margin: 5% auto;
      font-size: 16px !important;
    }
    
    .modal-shared-header {
      padding: 15px;
      font-size: 18px !important;
    }
    
    .modal-shared-body {
      padding: 15px;
    }
    
    .modal-shared-footer {
      padding: 15px;
    }
    
    .form-label-shared {
      font-size: 16px !important;
      margin-bottom: 8px;
    }
    
    .form-input-shared, 
    .form-select-shared {
      font-size: 16px !important;
      padding: 10px !important;
      height: auto !important;
    }
    
    .form-checkbox-label-shared {
      font-size: 16px !important;
    }
    
    .interval-inputs {
      flex-direction: column;
      align-items: stretch;
      gap: 10px;
    }
    
    .interval-number {
      width: 100%;
      min-width: auto;
    }
    
    .day-checkboxes {
      gap: 8px;
    }
    
    .day-checkbox-label {
      font-size: 16px !important;
      padding: 8px 12px;
      min-height: 44px;
      align-items: center;
      justify-content: center;
    }
    
    .button-shared {
      font-size: 16px !important;
      padding: 10px 15px !important;
      min-height: 44px;
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