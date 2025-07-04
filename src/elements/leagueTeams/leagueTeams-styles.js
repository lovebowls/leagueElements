import { buttonStyles, modalStyles, formStyles, listStyles } from '../shared-styles.js';

export const BASE_STYLES = `
  ${buttonStyles}
  ${modalStyles}
  ${formStyles}
  ${listStyles}
  
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
  
  :host {
    display: flex;
  }

  /* Teams Manager Layout */
  .teams-manager-content {
    background: var(--le-background-color-panel, #fff);
    border-radius: var(--le-border-radius-large, 8px);
    max-width: 900px;
    width: 90%;
    max-height: 80vh;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin: auto; /* Center the modal */
  }

  .teams-manager-content.mobile-view {
    width: 95%;
    max-width: 95%;
    max-height: 90vh;
  }

  .teams-manager-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--le-padding-l, 1.5rem);
    border-bottom: 1px solid var(--le-border-color-light, #eee);
    background: var(--le-background-color-header, #f8f9fa);
  }

  .teams-manager-header h3 {
    margin: 0;
    color: var(--le-text-color-primary, #333);
  }

  .teams-manager-body {
    padding: var(--le-padding-l, 1.5rem);
    flex: 1;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: var(--le-padding-l, 1.5rem);
  }

  .teams-manager-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--le-padding-m, 1rem);
    padding: var(--le-padding-l, 1.5rem);
    border-top: 1px solid var(--le-border-color-light, #eee);
    background: var(--le-background-color-footer, #f8f9fa);
  }

  .footer-options {
    display: flex;
    align-items: center;
  }

  .footer-buttons {
    display: flex;
    gap: var(--le-padding-m, 1rem);
    justify-content: flex-end;
    margin-left: auto;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: var(--le-padding-s, 0.5rem);
    cursor: pointer;
    color: var(--le-text-color-primary, #333);
    user-select: none;
  }

  .checkbox-label input[type="checkbox"] {
    margin: 0;
    cursor: pointer;
  }

  /* Team Input with Inline Buttons */
  .team-input-with-buttons {
    display: flex;
    gap: var(--le-padding-m, 1rem);
    align-items: flex-end;
  }

  .team-input-with-buttons .form-input-shared {
    flex: 1;
  }

  .inline-buttons {
    display: flex;
    gap: var(--le-padding-s, 0.5rem);
    flex-shrink: 0;
  }

  .inline-buttons .button-shared {
    min-width: 80px;
    white-space: nowrap;
  }

  /* Update button disabled state */
  .button-update:disabled {
    background-color: var(--le-background-color-disabled, #f5f5f5) !important;
    color: var(--le-text-color-disabled, #999) !important;
    border-color: var(--le-border-color-disabled, #ddd) !important;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .button-update:disabled:hover {
    background-color: var(--le-background-color-disabled, #f5f5f5) !important;
    border-color: var(--le-border-color-disabled, #ddd) !important;
  }

  /* Action Buttons */
  .teams-action-buttons {
    display: flex;
    gap: var(--le-padding-m, 1rem);
    flex-wrap: wrap;
  }

  .teams-action-buttons .button-shared {
    min-width: 100px;
  }

  .teams-action-buttons.disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  /* Custom team styling for the shared list items */
  .list-item .team-name {
    font-weight: 500;
  }

  .list-item .team-source {
    color: var(--le-text-color-secondary, #666);
    font-style: italic;
    margin-left: var(--le-padding-s, 0.5rem);
  }

  .no-teams-message {
    padding: var(--le-padding-l, 1.5rem);
    text-align: center;
    color: var(--le-text-color-secondary, #666);
    font-style: italic;
  }

  /* Team Editor Panel */
  .team-editor-panel {
    border: 1px solid var(--le-border-color-medium, #ddd);
    border-radius: var(--le-border-radius-standard, 4px);
    background: var(--le-background-color-panel, #fff);
    animation: slideDown 0.3s ease-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .team-editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--le-padding-m, 1rem);
    background: var(--le-background-color-header, #f8f9fa);
    border-bottom: 1px solid var(--le-border-color-light, #eee);
  }

  .team-editor-header h4 {
    margin: 0;
    color: var(--le-text-color-primary, #333);
  }

  .team-editor-body {
    padding: var(--le-padding-l, 1.5rem);
  }



  /* These form styles are provided by shared-styles.js formStyles import */

  /* Update button styling */
  .button-update {
    background-color: var(--le-background-color-accent, #4caf50) !important;
    color: white !important;
    border-color: var(--le-border-color-accent, #45a049) !important;
  }

  .button-update:hover {
    background-color: var(--le-background-color-accent-hover, #45a049) !important;
    border-color: var(--le-border-color-accent-hover, #3d8b40) !important;
  }

  /* Mobile-specific adjustments */
  @media (max-width: 480px) {
    .teams-manager-content {
      width: 95% !important;
      max-width: 95% !important;
      margin: 5% auto;
      max-height: 95vh;
    }
    
    .teams-manager-header {
      padding: 15px;
    }
    
    .teams-manager-body {
      padding: 15px;
      gap: 10px; /* Reduced gap to collapse space */
    }
    
    .teams-manager-footer {
      padding: 15px;
      flex-direction: row; /* Keep buttons side by side like league modal */
      gap: 10px;
    }

    .footer-options {
      order: 1;
      justify-content: flex-start;
    }

    .footer-buttons {
      order: 2;
      flex-direction: row; /* Keep buttons side by side */
      gap: 10px;
      margin-left: auto;
    }

    .footer-buttons .button-shared {
      width: auto; /* Allow buttons to size naturally */
      margin: 0;
      min-width: 80px; /* Ensure minimum touch target */
    }
    
    .teams-action-buttons {
      flex-direction: column;
      gap: 10px;
    }

    .teams-action-buttons .button-shared {
      width: 100%;
      min-width: auto;
    }



    .team-editor-header {
      padding: 15px 10px;
      flex-direction: column;
      gap: 10px;
      align-items: flex-start;
    }

    .team-editor-body {
      padding: 15px 10px;
    }

    /* Mobile inline buttons */
    .team-input-with-buttons {
      flex-direction: column;
      gap: 10px;
      align-items: stretch;
    }

    .inline-buttons {
      justify-content: flex-end;
      gap: 10px;
    }

    .inline-buttons .button-shared {
      min-width: 100px;
    }

    /* Form and button styles handled by shared-styles.js */
  }
`; 