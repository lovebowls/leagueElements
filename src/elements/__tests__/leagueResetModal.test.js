// leagueResetModal.test.js
import '../leagueResetModal/leagueResetModal.js';
import { jest } from '@jest/globals';

// Mock shared styles to avoid import issues in tests
jest.mock('../shared-styles.js', () => ({
  buttonStyles: '',
  modalStyles: '',
  formStyles: '',
  mobileStyles: ''
}));

// Mock the League import
jest.mock('@lovebowls/leaguejs', () => ({
  League: jest.fn().mockImplementation((data) => {
    const instance = {
      _id: data._id,
      name: data.name,
      settings: data.settings,
      teams: data.teams,
      matches: data.matches || [],
      initialiseFixtures: jest.fn().mockImplementation(() => {
        // Generate some mock matches for testing
        instance.matches = [
          {
            _id: 'match1',
            homeTeam: data.teams[0],
            awayTeam: data.teams[1],
            date: new Date().toISOString(),
            result: null
          },
          {
            _id: 'match2',
            homeTeam: data.teams[2],
            awayTeam: data.teams[3],
            date: new Date().toISOString(),
            result: null
          }
        ];
        return true;
      })
    };
    return instance;
  })
}));

describe('LeagueResetModal', () => {
  let element;
  let mockLeague;

  beforeEach(() => {
    element = document.createElement('league-reset-modal');
    document.body.appendChild(element);
    
    // Create a mock League object
    mockLeague = {
      _id: 'test-league-1',
      name: 'Test League',
      teams: [
        { _id: 'team1', name: 'Team 1' },
        { _id: 'team2', name: 'Team 2' },
        { _id: 'team3', name: 'Team 3' },
        { _id: 'team4', name: 'Team 4' }
      ],
      settings: {
        timesTeamsPlayOther: 2,
        pointsForWin: 3,
        pointsForDraw: 1,
        pointsForLoss: 0
      },
      matches: []
    };
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  it('should initialize with default properties', () => {
    expect(element.open).toBe(false);
    expect(element.isMobile).toBe(false);
    expect(element.leagueName).toBe('Unknown League'); // Default when no data
    expect(element.teamCount).toBe(0); // Default when no data
  });

  it('should set properties correctly via data attribute', () => {
    element.open = true;
    element.isMobile = true;
    element.data = mockLeague;

    expect(element.open).toBe(true);
    expect(element.isMobile).toBe(true);
    expect(element.leagueName).toBe('Test League');
    expect(element.teamCount).toBe(4);
    expect(element.leagueSettings.timesTeamsPlayOther).toBe(2);
  });

  it('should handle JSON string data', () => {
    element.data = JSON.stringify(mockLeague);

    expect(element.leagueName).toBe('Test League');
    expect(element.teamCount).toBe(4);
    expect(element.leagueSettings.timesTeamsPlayOther).toBe(2);
  });

  it('should calculate estimated matches correctly', () => {
    element.data = mockLeague;
    
    // 4 teams: (4 * 3) / 2 * 2 = 12 matches (corrected formula)
    const estimatedMatches = element._calculateEstimatedMatches();
    expect(estimatedMatches).toBe(12);
  });

  it('should validate form correctly', () => {
    element.data = mockLeague;
    
    // Set up form data with a future date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 days from now
    element._formData = {
      startDate: futureDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
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
    element.data = mockLeague;
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
    element.data = mockLeague;
    
    // Use a future date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 days from now
    element._formData = {
      startDate: futureDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
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

    element.data = mockLeague;
    
    // Use a future date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 days from now
    element._formData = {
      startDate: futureDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      maxMatchesPerDay: '2',
      schedulingPattern: 'interval',
      intervalNumber: 1,
      intervalUnit: 'weeks',
      selectedDays: []
    };

    // Mock the shadow DOM querySelector to return mock form elements
    const mockStartDateInput = { value: element._formData.startDate };
    const mockMaxMatchesInput = { value: element._formData.maxMatchesPerDay };
    const mockIntervalPatternRadio = { checked: true };
    const mockDayOfWeekPatternRadio = { checked: false };
    const mockIntervalNumberInput = { value: element._formData.intervalNumber.toString() };
    const mockIntervalUnitSelect = { value: element._formData.intervalUnit };
    
    element.shadow.querySelector = jest.fn((selector) => {
      switch (selector) {
        case '#startDate': return mockStartDateInput;
        case '#maxMatchesPerDay': return mockMaxMatchesInput;
        case '#intervalPattern': return mockIntervalPatternRadio;
        case '#dayOfWeekPattern': return mockDayOfWeekPatternRadio;
        case '#intervalNumber': return mockIntervalNumberInput;
        case '#intervalUnit': return mockIntervalUnitSelect;
        default: return null;
      }
    });
    
    element.shadow.querySelectorAll = jest.fn((selector) => {
      if (selector === '#dayCheckboxes input[type="checkbox"]') {
        return []; // Empty array for day checkboxes
      }
      return [];
    });

    element._onOk();

    expect(eventData).toBeTruthy();
    expect(eventData.matches).toBeDefined();
    expect(eventData.estimatedMatches).toBeDefined();
    expect(eventData.dateRange).toBeDefined();
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
    element.setAttribute('data', JSON.stringify(mockLeague));

    expect(element.open).toBe(true);
    expect(element.isMobile).toBe(true);
    expect(element.leagueName).toBe('Test League');
    expect(element.teamCount).toBe(4);
  });

  it('should calculate date range correctly for interval scheduling', () => {
    element.data = mockLeague;
    
    // Use a future date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 days from now
    element._formData = {
      startDate: futureDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
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
    element.data = mockLeague;
    
    // Use a future date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 days from now
    element._formData = {
      startDate: futureDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      maxMatchesPerDay: '2',
      schedulingPattern: 'interval',
      intervalNumber: 1,
      intervalUnit: 'weeks',
      selectedDays: []
    };

    const previewText = element._getPreviewText();
    expect(previewText).toContain('Will schedule 12 matches');
    expect(previewText).toContain('from');
    expect(previewText).toContain('to approximately');
  });

  it('should handle null/empty data gracefully', () => {
    element.data = null;
    
    expect(element.leagueName).toBe('Unknown League');
    expect(element.teamCount).toBe(0);
    expect(element.leagueSettings).toEqual({});
  });

  it('should handle invalid JSON data gracefully', () => {
    element.data = 'invalid json';
    
    expect(element.leagueName).toBe('Unknown League');
    expect(element.teamCount).toBe(0);
    expect(element.leagueSettings).toEqual({});
  });
}); 