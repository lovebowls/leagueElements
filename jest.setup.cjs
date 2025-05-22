// Mock the customElements global API
globalThis.customElements = {
  define: jest.fn(),
  get: jest.fn(),
  whenDefined: jest.fn().mockResolvedValue(true),
};

// Add any necessary DOM mocks for tests
class MockCustomEvent extends Event {
  constructor(type, options = {}) {
    super(type, options);
    this.detail = options.detail || {};
  }
}

// Replace native CustomEvent with our mock
globalThis.CustomEvent = MockCustomEvent;

// Mock shadowRoot functionality
Element.prototype.attachShadow = function() {
  const shadowRoot = document.createElement('div');
  shadowRoot.innerHTML = '';
  
  // Add shadow root query selector methods
  shadowRoot.querySelector = selector => {
    const element = document.createElement('div');
    element.setAttribute('mock-selector', selector);
    return element;
  };
  
  shadowRoot.querySelectorAll = selector => {
    return [shadowRoot.querySelector(selector)];
  };
  
  this.shadowRoot = shadowRoot;
  return shadowRoot;
}; 