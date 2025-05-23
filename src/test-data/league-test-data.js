// league-test-data.js - Test data for league element testing

/**
 * Generate a unique ID for test purposes
 * @returns {string} A unique ID
 */
function generateUniqueId() {
  return `id-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

/**
 * Generate a test match object for testing
 * @param {string} homeTeamId - ID of the home team
 * @param {string} awayTeamId - ID of the away team
 * @param {string} homeTeamName - Name of the home team
 * @param {string} awayTeamName - Name of the away team
 * @param {number} index - Index to help create unique dates
 * @returns {Object} A test match object
 */
export function generateTestMatch(homeTeamId, awayTeamId, homeTeamName, awayTeamName, index = 0) {
  // Create date for the match, adding index days to a base date
  const baseDate = new Date('2024-01-01');
  baseDate.setDate(baseDate.getDate() + index);
  const dateString = baseDate.toISOString().split('T')[0]; // YYYY-MM-DD
  
  // Return a match with randomized properties
  return {
    key: `match-${generateUniqueId()}`,
    date: dateString,
    // Use new format: homeTeam and awayTeam objects with _id
    homeTeam: {
      _id: homeTeamId,
      name: homeTeamName
    },
    awayTeam: {
      _id: awayTeamId,
      name: awayTeamName
    },
    result: Math.random() > 0.3 ? {
      homeScore: Math.floor(Math.random() * 21),
      awayScore: Math.floor(Math.random() * 21)
    } : null // 30% chance of having no result
  };
}

/**
 * Generate test league data for testing
 * @param {Array} lovebowlsTeams - Array of lovebowls teams to use
 * @param {number} [teamCount=3] - Number of teams to include
 * @param {string} [leagueName='Test League'] - Name for the test league
 * @returns {Object} A complete test league object
 */
export function generateTestLeagueData(lovebowlsTeams = [], teamCount = 3, leagueName = 'Test League') {
  // Create a unique ID for the league
  const leagueId = generateUniqueId();
  
  // Create teams for the league
  const teams = [];
  
  // Use lovebowls teams first
  const lovebowlsTeamsToUse = lovebowlsTeams.slice(0, teamCount);
  
  // Add lovebowls teams
  teams.push(...lovebowlsTeamsToUse);
  
  // Add custom teams if needed to reach teamCount
  for (let i = lovebowlsTeamsToUse.length; i < teamCount; i++) {
    teams.push({
      _id: `team-${i}-${generateUniqueId()}`,
      name: `Custom Team ${i + 1}`
    });
  }
  
  // Generate matches between all teams
  const matches = [];
  
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      // Create a match between teams[i] and teams[j]
      matches.push(generateTestMatch(
        teams[i]._id, 
        teams[j]._id, 
        teams[i].name,
        teams[j].name,
        matches.length
      ));
      
      // Create a reversed match (away fixture)
      matches.push(generateTestMatch(
        teams[j]._id, 
        teams[i]._id, 
        teams[j].name,
        teams[i].name,
        matches.length
      ));
    }
  }
  
  // Create and return the complete league object with proper structure
  return {
    _id: leagueId,
    name: leagueName,
    table: {
      leagueData: teams.map(team => ({
        teamId: team._id,
        teamDisplayName: team.name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        shotsFor: 0,
        shotsAgainst: 0,
        shotDifference: 0,
        points: 0,
        matches: [],
        allMatchesForTooltip: []
      }))
    },
    matches,
    settings: {
      pointsForWin: 3,
      pointsForDraw: 1,
      pointsForLoss: 0,
      promotionPositions: 1,
      relegationPositions: 1,
      timesTeamsPlayOther: 2,
      rinkPoints: {
        enabled: Math.random() > 0.5, // 50% chance of rink points being enabled
        pointsPerRinkWin: 2,
        pointsPerRinkDraw: 1,
        defaultRinks: 4
      }
    },
    // Include the team list in standardized format
    teams: teams.map(team => ({
      _id: team._id,
      name: team.name
    }))
  };
}

/**
 * Generate multiple test leagues for testing
 * @param {Array} lovebowlsTeams - Array of lovebowls teams to use
 * @param {number} [leagueCount=3] - Number of leagues to generate
 * @returns {Array} An array of test league objects
 */
export function generateMultipleTestLeagues(lovebowlsTeams = [], leagueCount = 3) {
  const leagues = [];
  
  for (let i = 0; i < leagueCount; i++) {
    const teamCount = Math.floor(Math.random() * 3) + 3; // 3-5 teams per league
    leagues.push(generateTestLeagueData(
      lovebowlsTeams,
      teamCount,
      `Test League ${i + 1}`
    ));
  }
  
  return leagues;
}

// Helper function to generate random rink scores
function generateRinkScores(rinkCount) {
  const scores = [];
  for (let i = 0; i < rinkCount; i++) {
    scores.push(Math.max(1, Math.floor(Math.random() * 8) + 1));
  }
  return scores;
} 