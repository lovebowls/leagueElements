import { getMobileStyles, getDesktopStyles, panelStyles, buttonStyles } from '../shared-styles.js';

const BASE_STYLES = `
  ${panelStyles}
  ${buttonStyles}
  
  :host {
    display: block;
    font-family: var(--le-font-family-main, 'Open Sans', Helvetica, Arial, sans-serif);
    box-sizing: border-box;
    color: var(--le-text-color-primary, #333);
  }

  .dashboard-content {
    padding: 0;
    margin: 0;
  }

  .dashboard-sections {
    display: flex;
    flex-direction: column;
    gap: var(--le-padding-m, 1rem);
  }

  .dashboard-section {
    background: var(--le-background-color-panel, #fff);
    border: 1px solid var(--le-border-color-light, #f0f0f0);
    border-radius: var(--le-border-radius-standard, 4px);
    padding: var(--le-padding-m, 1rem);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.2s ease;
  }

  .dashboard-section:hover {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }

  .section-title {
    margin: 0 0 var(--le-padding-m, 1rem) 0;
    font-size: var(--le-font-size-large, 1.2em);
    font-weight: 600;
    color: var(--le-text-color-primary, #333);
    border-bottom: 2px solid var(--le-border-color-light, #f0f0f0);
    padding-bottom: var(--le-padding-s, 0.5rem);
  }

  .info-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--le-padding-s, 0.75rem);
    margin-bottom: var(--le-padding-m, 1rem);
  }

  .info-card {
    background: var(--le-background-color-header, #f9f9f9);
    border: 1px solid var(--le-border-color-medium, #ddd);
    border-radius: var(--le-border-radius-small, 3px);
    padding: var(--le-padding-s, 0.75rem);
    text-align: center;
    transition: all 0.2s ease;
    min-height: 3rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .info-card:hover {
    background: var(--le-background-color-hover, #f5f5f5);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .info-card.attention-highlight {
    background: var(--le-background-color-error, #fff0f0);
    border-color: var(--le-color-status-warning, #f39c12);
  }

  .card-label {
    font-size: var(--le-font-size-small, 0.9em);
    color: var(--le-text-color-secondary, #666);
    margin-bottom: var(--le-padding-xs, 0.25rem);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .card-value {
    font-size: var(--le-font-size-medium, 1.0em);
    font-weight: 600;
    color: var(--le-text-color-primary, #333);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--le-padding-xs, 0.25rem);
  }

  .status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
    margin-right: var(--le-padding-xs, 0.25rem);
  }

  .status-setup {
    background-color: var(--le-color-status-info, #2196f3);
  }

  .status-upcoming {
    background-color: var(--le-color-status-warning, #f39c12);
  }

  .status-active {
    background-color: var(--le-color-status-success, #28a745);
  }

  .status-completed {
    background-color: var(--le-color-status-neutral, #6c757d);
  }

  .progress-section {
    margin: var(--le-padding-m, 1rem) 0;
    padding: var(--le-padding-s, 0.75rem);
    background: var(--le-background-color-header, #f9f9f9);
    border-radius: var(--le-border-radius-small, 3px);
    border: 1px solid var(--le-border-color-medium, #ddd);
  }

  .progress-label {
    font-size: var(--le-font-size-small, 0.9em);
    color: var(--le-text-color-secondary, #666);
    margin-bottom: var(--le-padding-xs, 0.25rem);
    font-weight: 500;
    text-align: center;
  }

  .progress-bar {
    width: 100%;
    height: 20px;
    background: var(--le-background-color-panel, #fff);
    border: 1px solid var(--le-border-color-medium, #ddd);
    border-radius: var(--le-border-radius-small, 3px);
    overflow: hidden;
    margin-bottom: var(--le-padding-xs, 0.25rem);
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--le-color-primary, #007bff) 0%, var(--le-color-primary-hover, #0056b3) 100%);
    transition: width 0.5s ease;
    position: relative;
  }

  .progress-fill::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.1) 100%);
  }

  .progress-percentage {
    text-align: center;
    font-size: var(--le-font-size-small, 0.9em);
    font-weight: 600;
    color: var(--le-text-color-primary, #333);
  }

  .attention-count {
    color: var(--le-color-status-warning, #f39c12);
    font-weight: 700;
  }



  .no-league {
    text-align: center;
    color: var(--le-text-color-secondary, #666);
    padding: var(--le-padding-m, 1rem);
    font-style: italic;
  }

  .error {
    color: var(--le-text-color-error, #dc3545);
    padding: var(--le-padding-s, 0.75rem);
    background-color: var(--le-background-color-error, #fff0f0);
    border: 1px solid var(--le-color-status-error, #dc3545);
    border-radius: var(--le-border-radius-standard, 4px);
    text-align: center;
  }

  /* Section-specific styling */
  .league-overview {
    background: linear-gradient(135deg, var(--le-background-color-panel, #fff) 0%, var(--le-background-color-header, #f9f9f9) 100%);
  }

  .match-statistics {
    background: linear-gradient(135deg, var(--le-background-color-panel, #fff) 0%, rgba(33, 150, 243, 0.02) 100%);
  }

  .league-settings {
    background: linear-gradient(135deg, var(--le-background-color-panel, #fff) 0%, rgba(40, 167, 69, 0.02) 100%);
  }
`;

export const MOBILE_STYLES = (fontScale = 1.0) => `
  ${getMobileStyles(fontScale)}
  ${BASE_STYLES}
  
  .dashboard-sections {
    gap: var(--le-padding-s, 0.75rem);
  }

  .dashboard-section {
    padding: var(--le-padding-s, 0.75rem);
  }

  .section-title {
    font-size: var(--le-font-size-medium, 1.0em);
    margin-bottom: var(--le-padding-s, 0.75rem);
  }

  .info-cards {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: var(--le-padding-s, 0.75rem);
    margin-bottom: var(--le-padding-s, 0.75rem);
  }

  .info-card {
    min-height: 2.5rem;
    padding: var(--le-padding-s, 0.75rem) var(--le-padding-xs, 0.5rem);
  }

  .card-label {
    font-size: var(--le-font-size-xs, 0.75em);
    margin-bottom: var(--le-padding-xs, 0.25rem);
  }

  .card-value {
    font-size: var(--le-font-size-small, 0.9em);
  }



  .progress-bar {
    height: 16px;
  }

  .progress-section {
    margin: var(--le-padding-s, 0.75rem) 0;
    padding: var(--le-padding-s, 0.75rem);
  }

  /* Mobile-specific responsive adjustments */
  @media (max-width: 480px) {
    .info-cards {
      grid-template-columns: 1fr;
    }
    
    .dashboard-section {
      padding: var(--le-padding-s, 0.75rem) var(--le-padding-xs, 0.5rem);
    }
  }
`;

export const DESKTOP_STYLES = (fontScale = 1.0) => `
  ${getDesktopStyles(fontScale)}
  ${BASE_STYLES}
  
  .dashboard-sections {
    gap: var(--le-padding-m, 1rem);
  }

  .dashboard-section {
    padding: var(--le-padding-m, 1rem) var(--le-padding-m, 1.5rem);
  }

  .section-title {
    font-size: var(--le-font-size-large, 1.2em);
    margin-bottom: var(--le-padding-m, 1rem);
  }

  .info-cards {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: var(--le-padding-m, 1rem);
    margin-bottom: var(--le-padding-m, 1rem);
  }

  .info-card {
    min-height: 3.5rem;
    padding: var(--le-padding-m, 1rem);
  }

  .card-label {
    font-size: var(--le-font-size-small, 0.9em);
    margin-bottom: var(--le-padding-s, 0.5rem);
  }

  .card-value {
    font-size: var(--le-font-size-medium, 1.0em);
  }



  .progress-bar {
    height: 24px;
  }

  .progress-section {
    margin: var(--le-padding-m, 1rem) 0;
    padding: var(--le-padding-m, 1rem);
  }

  /* Desktop hover effects */
  .dashboard-section:hover .section-title {
    color: var(--le-text-color-accent, #2196f3);
  }
`;

export const TEMPLATE = `
  <div class="dashboard-content">
    {{dashboardContent}}
  </div>
`; 