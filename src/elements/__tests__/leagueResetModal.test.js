// leagueResetModal.test.js
import '../leagueResetModal/leagueResetModal.js';

// Mock shared styles to avoid import issues in tests
jest.mock('../shared-styles.js', () => ({
  buttonStyles: '',
  modalStyles: '',
  formStyles: '',
  mobileStyles: ''
}));

describe('LeagueResetModal', () => {
  let element;

  beforeEach(() => {
    element = document.createElement('league-reset-modal');
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  it('should initialize with default properties', () => {
    expect(element.open).toBe(false);
    expect(element.isMobile).toBe(false);
    expect(element.leagueName).toBe('');
    expect(element.teamCount).toBe(0);
  });

  it('should set properties correctly', () => {
    element.open = true;
    element.isMobile = true;
    element.leagueName = 'Test League';
    element.teamCount = 4;
    element.leagueSettings = { timesTeamsPlayOther: 3 };

    expect(element.open).toBe(true);
    expect(element.isMobile).toBe(true);
    expect(element.leagueName).toBe('Test League');
    expect(element.teamCount).toBe(4);
    expect(element.leagueSettings.timesTeamsPlayOther).toBe(3);
  });

  it('should calculate estimated matches correctly', () => {
    element.teamCount = 4;
    element.leagueSettings = { timesTeamsPlayOther: 2 };
    
    // 4 teams * 3 opponents * 2 times = 24 matches
    const estimatedMatches = element._calculateEstimatedMatches();
    expect(estimatedMatches).toBe(24);
  });

  it('should validate form correctly', () => {
    // Set up form data
    element._formData = {
      startDate: '2024-01-15',
      maxMatchesPerDay: '2',
      schedulingPattern: 'interval',
      intervalNumber: 1,
      intervalUnit: 'weeks',
      selectedDays: []
    };

    const validation = element._validateForm();
    expect(validation.isValid).toBe(true);
  });

  it('should validate start date requirement', () => {
    element._formData = {
      startDate: '',
      maxMatchesPerDay: '',
      schedulingPattern: 'interval',
      intervalNumber: 1,
      intervalUnit: 'weeks',
      selectedDays: []
    };

    const validation = element._validateForm();
    expect(validation.isValid).toBe(false);
    expect(validation.error).toBe('Start date is required.');
  });

  it('should validate day of week selection', () => {
    element._formData = {
      startDate: '2024-01-15',
      maxMatchesPerDay: '',
      schedulingPattern: 'dayOfWeek',
      intervalNumber: 1,
      intervalUnit: 'weeks',
      selectedDays: []
    };

    const validation = element._validateForm();
    expect(validation.isValid).toBe(false);
    expect(validation.error).toBe('At least one day of the week must be selected.');
  });

  it('should dispatch reset-save event with correct data', () => {
    let eventData = null;
    element.addEventListener('reset-save', (e) => {
      eventData = e.detail;
    });

    element.teamCount = 4;
    element.leagueSettings = { timesTeamsPlayOther: 2 };
    element._formData = {
      startDate: '2024-01-15',
      maxMatchesPerDay: '2',
      schedulingPattern: 'interval',
      intervalNumber: 1,
      intervalUnit: 'weeks',
      selectedDays: []
    };

    element._onOk();

    expect(eventData).toBeTruthy();
    expect(eventData.schedulingParams.startDate).toBe('2024-01-15');
    expect(eventData.schedulingParams.maxMatchesPerDay).toBe(2);
    expect(eventData.schedulingParams.schedulingPattern).toBe('interval');
    expect(eventData.estimatedMatches).toBe(24);
  });

  it('should dispatch reset-cancel event', () => {
    let eventFired = false;
    element.addEventListener('reset-cancel', () => {
      eventFired = true;
    });

    element._onCancel();

    expect(eventFired).toBe(true);
  });

  it('should handle attribute changes', () => {
    element.setAttribute('open', 'true');
    element.setAttribute('is-mobile', 'true');
    element.setAttribute('league-name', 'Test League');
    element.setAttribute('team-count', '6');

    expect(element.open).toBe(true);
    expect(element.isMobile).toBe(true);
    expect(element.leagueName).toBe('Test League');
    expect(element.teamCount).toBe(6);
  });

  it('should calculate date range correctly for interval scheduling', () => {
    element.teamCount = 4;
    element.leagueSettings = { timesTeamsPlayOther: 2 };
    element._formData = {
      startDate: '2024-01-15',
      maxMatchesPerDay: '2',
      schedulingPattern: 'interval',
      intervalNumber: 1,
      intervalUnit: 'weeks',
      selectedDays: []
    };

    const dateRange = element._calculateDateRange();
    expect(dateRange).toBeTruthy();
    expect(dateRange.start).toBeTruthy();
    expect(dateRange.end).toBeTruthy();
  });

  it('should generate preview text correctly', () => {
    element.teamCount = 4;
    element.leagueSettings = { timesTeamsPlayOther: 2 };
    element._formData = {
      startDate: '2024-01-15',
      maxMatchesPerDay: '2',
      schedulingPattern: 'interval',
      intervalNumber: 1,
      intervalUnit: 'weeks',
      selectedDays: []
    };

    const previewText = element._getPreviewText();
    expect(previewText).toContain('Will schedule 24 matches');
    expect(previewText).toContain('from');
    expect(previewText).toContain('to approximately');
  });
}); 