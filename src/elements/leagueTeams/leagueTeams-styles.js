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

  /* Team-specific form styles */
  .form-group-shared {
    margin-bottom: var(--le-padding-m, 1rem);
  }

  .form-label-shared {
    display: block;
    margin-bottom: var(--le-padding-s, 0.5rem);
    font-weight: bold;
    color: var(--le-text-color-primary, #333);
  }

  .form-label-shared input[type="checkbox"] {
    margin-right: var(--le-padding-xs, 0.25rem);
  }

  .form-input-shared {
    width: 100%;
    padding: var(--le-padding-s, 0.5rem);
    border: 1px solid var(--le-border-color-medium, #ddd);
    border-radius: var(--le-border-radius-standard, 4px);
    font-size: var(--le-font-size-base, 1rem);
    background-color: var(--le-background-color-panel, #fff);
    color: var(--le-text-color-primary, #333);
    box-sizing: border-box;
  }

  .form-input-shared:focus {
    outline: none;
    border-color: var(--le-border-color-focus, #007cba);
    box-shadow: 0 0 0 2px var(--le-background-color-focus-ring, rgba(0, 124, 186, 0.2));
  }

  .form-input-shared:disabled {
    background-color: var(--le-background-color-disabled, #f5f5f5);
    color: var(--le-text-color-disabled, #999);
    cursor: not-allowed;
  }

  .form-error-shared {
    color: var(--le-text-color-error, #d32f2f);
    background-color: var(--le-background-color-error, #ffeaa7);
    padding: var(--le-padding-s, 0.5rem);
    border: 1px solid var(--le-border-color-error, #e74c3c);
    border-radius: var(--le-border-radius-standard, 4px);
    margin-bottom: var(--le-padding-s, 0.5rem);
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
    
    .form-input-shared {
      font-size: 16px !important;
      padding: 10px !important;
      height: auto !important;
    }
    
    .button-shared {
      font-size: 16px !important;
      padding: 10px 15px !important;
      min-height: 44px;
    }
  }
`; 