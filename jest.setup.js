// Mock CustomEvent constructor for JSDOM
global.CustomEvent = class CustomEvent extends Event {
  constructor(type, options = {}) {
    super(type, options);
    this.detail = options.detail || {};
  }
};

// Mock ShadowRoot for JSDOM
class MockShadowRoot extends DocumentFragment {
  constructor() {
    super();
    this.host = null;
  }
}

// Add shadowRoot property to Element prototype
Object.defineProperty(Element.prototype, 'shadowRoot', {
  get() {
    if (!this._shadowRoot) {
      this._shadowRoot = new MockShadowRoot();
      this._shadowRoot.host = this;
    }
    return this._shadowRoot;
  }
});

// Add attachShadow method to Element prototype if not present
if (!Element.prototype.attachShadow) {
  Element.prototype.attachShadow = function() {
    if (!this._shadowRoot) {
      this._shadowRoot = new MockShadowRoot();
      this._shadowRoot.host = this;
    }
    return this._shadowRoot;
  };
}

console.log('Jest setup completed: Added CustomEvent and ShadowRoot mocks'); 