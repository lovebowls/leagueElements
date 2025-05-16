<style>
      
      
  .panel-header-shared {
    padding: var(--le-padding-s, 0.5em) var(--le-padding-m, 1em); /* Using --le- as a placeholder for theme variables */
    border-bottom: 1px solid var(--le-border-color-medium, #eee);
    font-weight: bold;
    color: var(--le-text-color-primary, #333);
    background-color: var(--le-background-color-header, #f9f9f9);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .panel-content-shared {
    padding: var(--le-padding-m, 1em);
    background-color: var(--le-background-color-panel, #fff);
    /* Common border for content area if needed
    border: 1px solid var(--le-border-color-light, #f0f0f0);
    */
  }

      
  .button-shared {
    padding: var(--le-padding-s, 0.5em) var(--le-padding-m, 1em);
    border: 1px solid var(--le-border-color-medium, #ccc);
    background-color: var(--le-background-color-button, #f0f0f0);
    color: var(--le-text-color-primary, #333); /* Ensure text color contrasts with button background */
    cursor: pointer;
    border-radius: var(--le-border-radius-standard, 4px);
    font-size: var(--le-font-size-medium, 1em); /* Base button font size, can be overridden */
    text-decoration: none;
    display: inline-block;
    text-align: center;
    line-height: normal; /* Ensure consistent line height */
    white-space: nowrap; /* Prevent text wrapping */
    vertical-align: middle; /* Align nicely if next to text/icons */
    user-select: none; /* Prevent text selection on click */
    transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out; /* Smooth transitions */
  }

  .button-shared:hover:not(:disabled) {
    background-color: var(--le-background-color-button-hover, #e0e0e0);
    border-color: var(--le-border-color-dark, #bbb); /* Slightly darker border on hover */
    /* color: var(--le-text-color-accent-hover, inherit); Optional: change text color on hover */
  }

  .button-shared:active:not(:disabled) {
    /* Optional: style for active (pressed) state */
    /* background-color: var(--le-background-color-button-active, #d0d0d0); */
  }

  .button-shared:disabled,
  .button-shared.disabled { /* Allow class-based disabling too */
    background-color: var(--le-background-color-button-disabled, #eee);
    color: var(--le-text-color-secondary, #aaa);
    border-color: var(--le-border-color-medium, #ccc); /* Use medium border for disabled state */
    cursor: not-allowed;
    opacity: 0.7; /* Visually indicate disabled state */
  }

  /* Small button variant */
  .button-shared.button-sm {
    padding: var(--le-padding-xs, 0.25rem) var(--le-padding-s, 0.5rem);
    font-size: var(--le-font-size-small, 0.9em);
    /* line-height can be tighter if needed for small buttons */
    /* line-height: 1.2; */
  }

  /* Variations - consider if needed, or handle with specific component styles */
  /*
  .button-shared.primary {
    background-color: var(--le-color-primary, #007bff);
    color: var(--le-text-color-on-primary, #fff);
    border-color: var(--le-color-primary, #007bff);
  }
  .button-shared.primary:hover:not(:disabled) {
    background-color: var(--le-color-primary-hover, #0056b3);
    border-color: var(--le-color-primary-hover, #0056b3);
  }

  .button-shared.accent {
    background-color: var(--le-color-accent, #2196f3);
    color: var(--le-text-color-on-primary, #fff);
    border-color: var(--le-color-accent, #2196f3);
  }
  .button-shared.accent:hover:not(:disabled) {
    background-color: var(--le-color-accent-hover, #1976d2);
    border-color: var(--le-color-accent-hover, #1976d2);
  }
  */

      
  .list-item-shared {
    padding: var(--le-padding-s, 0.5em) var(--le-padding-xs, 0.25em); /* Vertical padding S, horizontal XS by default */
    border-bottom: 1px solid var(--le-border-color-light, #eee);
    display: flex;
    align-items: center;
    justify-content: space-between; /* Common for items with actions on the right */
    gap: var(--le-padding-s, 0.5em); /* Gap between items if they wrap or have multiple elements */
  }

  .list-item-shared:last-child {
    border-bottom: none;
  }

  /* Example of a text part within a list item that should grow */
  .list-item-shared .list-item-text-primary {
    flex-grow: 1;
    /* Potentially add text overflow properties if needed */
    /* white-space: nowrap; */
    /* overflow: hidden; */
    /* text-overflow: ellipsis; */
  }

  /* Example of an actions container part within a list item */
  .list-item-shared .list-item-actions {
    flex-shrink: 0; /* Prevent actions from shrinking */
    display: flex;
    gap: var(--le-padding-xs, 0.25em);
  }

      :host {
        display: block;
        font-family: var(--le-font-family-main, 'Open Sans', Helvetica, Arial, sans-serif);
        box-sizing: border-box;
        color: var(--le-text-color-primary, #333);
        font-size: var(--le-font-size-base, 1em);
      }
      .panel-header {
        margin-bottom: var(--le-padding-s, 0.5rem);
        color: var(--le-text-color-primary, #333);
        font-weight: bold;
        display: flex;
        justify-content: space-between;
        align-items: center;
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
    
      :host {
      }
      .panel-header {
        font-size: var(--le-font-size-medium, 1em);
        margin-bottom: var(--le-padding-xs, 0.3rem);
      }
      .match-item {
        font-size: 1em;
      }
    </style>