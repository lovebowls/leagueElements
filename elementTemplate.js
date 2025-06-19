// Define custom event types for the new element
class ElementTemplateEvent extends CustomEvent {
  constructor(detail) {
    super('element-template-event', {
      detail,
      bubbles: true,
      composed: true
    });
  }
}

class ElementTemplate extends HTMLElement {
  // Base styles shared between mobile and desktop layouts
  static get BASE_STYLES() {
    return `
      :host {
        display: block;
        border: 1px solid #ccc;
        font-family: 'Open Sans', Helvetica, Arial, sans-serif;
        box-sizing: border-box;
        color: #333; /* Default text color */
      }
      .title {
        font-weight: bold;
        background: #f5f5f5;
        padding: 0.5rem;
        border-bottom: 1px solid #ddd;
      }
      .content {
        padding: 0.5rem;
      }
      .error {
        color: #ff0000;
        padding: 0.5rem;
        background-color: #fff0f0;
        border-radius: 4px;
      }
    `;
  }

  // Mobile-specific styles
  static get MOBILE_STYLES() {
    return `
      ${ElementTemplate.BASE_STYLES}
      :host {
        padding: 0.5rem;
      }
      .title {
        font-size: 1.1rem;
      }
    `;
  }

  // Desktop-specific styles
  static get DESKTOP_STYLES() {
    return `
      ${ElementTemplate.BASE_STYLES}
      :host {
        padding: 1rem;
      }
      .title {
        font-size: 1.2rem;
      }
    `;
  }

  // Mobile layout template
  static get MOBILE_TEMPLATE() {
    return `
      <div class="title">{{title}}</div>
      <div class="content">
        <p>Mobile View Content</p>
        {{mainContent}}
      </div>
    `;
  }

  // Desktop layout template
  static get DESKTOP_TEMPLATE() {
    return `
      <div class="title">{{title}}</div>
      <div class="content">
        <p>Desktop View Content</p>
        {{mainContent}}
      </div>
    `;
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.data = null; // Placeholder for data
    this._elementTitle = 'Element Title'; // Default title
  }

  static get observedAttributes() {
    // Define attributes to observe for changes
    return ['elementTitle', 'data', 'isMobile'];
  }

  connectedCallback() {
    // Called when the element is added to the document
    this._elementTitle = this.getAttribute('elementTitle') || this._elementTitle;
    this.data = this.getAttribute('data');

    if (this.data) {
      this.loadData(this.data);
    } else {
      this.render(); // Render even if no data, with defaults
    }
  }

  disconnectedCallback() {
    // Called when the element is removed from the document
    // Cleanup (e.g., remove event listeners)
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    this.dispatchEvent(new ElementTemplateEvent({ type: 'attributeChange', name, oldValue, newValue }));

    if (name === 'elementTitle') {
      this._elementTitle = newValue;
      this.render();
    } else if (name === 'data') {
      this.data = newValue;
      if (newValue) {
        this.loadData(newValue);
      } else {
        this.showError('Data is required or invalid.');
        // Dispatch an error event
        this.dispatchEvent(new ElementTemplateEvent({ type: 'error', message: 'Data is required or invalid.'}));
      }
    } else if (name === 'isMobile') {
      this.render(); // Re-render if isMobile changes
    }
  }

  async loadData(dataString) {
    try {
      if (typeof dataString === 'string') {
        this.data = JSON.parse(dataString);
      } else {
        this.data = dataString; // Assume it\'s already an object
      }

      // Basic validation example
      if (!this.data || typeof this.data !== 'object') {
        this.showError('Invalid data format.');
        this.dispatchEvent(new ElementTemplateEvent({ type: 'error', message: 'Invalid data format.' }));
        return;
      }

      this.render();
      // Dispatch success event
      this.dispatchEvent(new ElementTemplateEvent({ type: 'dataLoaded', data: this.data }));
    } catch (error) {
      const errorMessage = 'Failed to load data.';
      this.showError(errorMessage);
      console.error('Error loading data:', error);
      this.dispatchEvent(new ElementTemplateEvent({ type: 'error', message: errorMessage, errorObj: error }));
    }
  }

  showError(message) {
    // A simple way to show an error message in the shadow DOM
    // You might want to make this more sophisticated, e.g., a dedicated error area
    const errorDiv = this.shadow.querySelector('.error') || document.createElement('div');
    errorDiv.className = 'error'; // Ensure class is set
    errorDiv.textContent = message;

    // If there\'s a content area, prepend/append error there. Otherwise, just add to shadow.
    const contentArea = this.shadow.querySelector('.content');
    if (contentArea) {
        if (!contentArea.contains(errorDiv)) { // Add only if not already there
             contentArea.insertBefore(errorDiv, contentArea.firstChild);
        }
    } else if (!this.shadow.contains(errorDiv)) {
        this.shadow.appendChild(errorDiv);
    }
  }

  // Helper method to replace placeholders in template
  _fillTemplate(template) {
    let mainContent = '';
    if (this.data) {
      // Example of processing data for the template
      mainContent = `Data received: ${JSON.stringify(this.data, null, 2)}`;
    } else {
      mainContent = 'No data loaded.';
    }

    return template
      .replace(/{{title}}/g, this._elementTitle || 'Default Title')
      .replace('{{mainContent}}', mainContent);
  }

  render() {
    const isMobile = this.getAttribute('isMobile') === 'true';
    const baseTemplate = isMobile ? ElementTemplate.MOBILE_TEMPLATE : ElementTemplate.DESKTOP_TEMPLATE;

    this.shadow.innerHTML = `
      <style>${isMobile ? ElementTemplate.MOBILE_STYLES : ElementTemplate.DESKTOP_STYLES}</style>
      ${this._fillTemplate(baseTemplate)}
    `;

    this._attachEventListeners();
  }

  _attachEventListeners() {
    // Example: Attach listeners to elements within the shadow DOM
    // const button = this.shadow.querySelector('button');
    // if (button) {
    //   button.addEventListener('click', () => {
    //     this.dispatchEvent(new ElementTemplateEvent({ type: 'buttonClick', message: 'Button was clicked!' }));
    //   });
    // }
  }

  // --- Public Methods (example) ---
  updateTitle(newTitle) {
    this.setAttribute('elementTitle', newTitle);
  }

  // --- Utility Methods (example) ---
  _formatDataForDisplay(data) {
    // Process data before rendering
    return `Processed: ${data}`;
  }
}

// Register the custom element
import { safeDefine } from './src/utils/elementRegistry.js';

safeDefine('element-template', ElementTemplate);

export default ElementTemplate; 