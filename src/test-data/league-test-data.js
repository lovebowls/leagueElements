// league-test-data.js - Test data for league element testing
import { League, Team, Match } from '@lovebowls/leaguejs';

/**
 * Generate a unique ID for test purposes
 * @returns {string} A unique ID
 */
function generateUniqueId() {
  return `id-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

/**
 * Generate a test match object for testing using LeagueJS Match class
 * @param {Team} homeTeam - The home team object
 * @param {Team} awayTeam - The away team object
 * @param {number} index - Index to help create unique dates
 * @returns {Match} A test match object
 */
function generateTestMatch(homeTeam, awayTeam, index = 0) {
  const baseDate = new Date('2024-01-01');
  baseDate.setDate(baseDate.getDate() + index);
  
  const matchData = {
    _id: `match-${generateUniqueId()}`,
    date: baseDate,
    homeTeam,
    awayTeam,
    status: 'scheduled',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Add random result 70% of the time
  if (Math.random() > 0.3) {
    const homeScore = Math.floor(Math.random() * 21);
    const awayScore = Math.floor(Math.random() * 21);
    
    matchData.result = {
      homeScore,
      awayScore,
      homeRinks: Math.max(1, Math.floor(Math.random() * 4)),
      awayRinks: Math.max(1, Math.floor(Math.random() * 4)),
      homeShots: homeScore,
      awayShots: awayScore,
      completed: true
    };
    matchData.status = 'played';
  }
  
  const match = new Match(matchData);
  
  return match;
}

/**
 * Generate test league data for testing using LeagueJS
 * @param {Array} lovebowlsTeams - Array of lovebowls teams to use
 * @param {number} [teamCount=4] - Number of teams to include (min 4, max 12)
 * @param {string} [leagueName='Test League'] - Name for the test league
 * @returns {League} A complete test league object
 */
export function generateTestLeagueData(lovebowlsTeams = [], teamCount = 4, leagueName = 'Test League') {
  // Ensure teamCount is within valid range
  teamCount = Math.max(4, Math.min(12, teamCount));
  
  // Create league settings
  const settings = {
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    promotionPositions: 1,
    relegationPositions: 1,
    timesTeamsPlayOther: 1,
    rinkPoints: {
      enabled: Math.random() > 0.5,
      pointsPerRinkWin: 2,
      pointsPerRinkDraw: 1,
      defaultRinks: 4
    }
  };
  
  // Create league instance
  const league = new League({
    _id: `league-${generateUniqueId()}`,
    name: leagueName,
    settings,
    teams: [],
    matches: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Add teams to the league
  const teams = [];
  const lovebowlsTeamsToUse = lovebowlsTeams.slice(0, teamCount);
  
  // Add LoveBowls teams first
  lovebowlsTeamsToUse.forEach(teamData => {
    const team = new Team({
      _id: teamData._id || `team-${generateUniqueId()}`,
      name: teamData.name || `Team ${teams.length + 1}`,
      shortName: teamData.shortName || `T${teams.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    league.addTeam(team);
    teams.push(team);
  });
  
  // Add remaining teams if needed
  for (let i = teams.length; i < teamCount; i++) {
    const team = new Team({
      _id: `team-${generateUniqueId()}`,
      name: `Custom Team ${i + 1}`,
      shortName: `CT${i + 1}`,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    league.addTeam(team);
    teams.push(team);
  }
  
  // Generate and add matches
  let matchIndex = 0;
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      // Home and away matches
      const homeMatch = generateTestMatch(
        teams[i],
        teams[j],
        matchIndex++
      );

      const awayMatch = generateTestMatch(
        teams[j],
        teams[i],
        matchIndex++
      );
      league.addMatch(homeMatch);
      league.addMatch(awayMatch);
    }
  }
  
  // Initialize fixtures to ensure proper scheduling
  league.initialiseFixtures();
  
  return league;
}

/**
 * Generate multiple test leagues for testing
 * @param {Array} lovebowlsTeams - Array of lovebowls teams to use
 * @param {number} [leagueCount=3] - Number of leagues to generate (1-5)
 * @returns {Array<League>} An array of test league objects
 */
export function generateMultipleTestLeagues(lovebowlsTeams = [], leagueCount = 3) {
  const leagues = [];
  leagueCount = Math.max(1, Math.min(5, leagueCount)); // Ensure between 1-5 leagues
  
  for (let i = 0; i < leagueCount; i++) {
    const teamCount = Math.floor(Math.random() * 5) + 4; // 4-8 teams per league
    leagues.push(
      generateTestLeagueData(
        lovebowlsTeams,
        teamCount,
        `Test League ${i + 1}`
      )
    );
  }
  
  return leagues;
}