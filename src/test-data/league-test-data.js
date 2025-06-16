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
 * Generate a skill level for a team (0.1 to 1.0, where 1.0 is strongest)
 * @returns {number} Team skill level
 */
function generateTeamSkill() {
  // Generate skill levels with some variation but not too extreme
  // Most teams will be between 0.3 and 0.8, with occasional very strong/weak teams
  const random = Math.random();
  if (random < 0.1) return 0.1 + Math.random() * 0.2; // 10% chance of weak team (0.1-0.3)
  if (random > 0.9) return 0.8 + Math.random() * 0.2; // 10% chance of strong team (0.8-1.0)
  return 0.3 + Math.random() * 0.5; // 80% chance of average team (0.3-0.8)
}

/**
 * Calculate match result based on team skills with some randomness
 * @param {number} homeSkill - Home team skill level (0.1-1.0)
 * @param {number} awaySkill - Away team skill level (0.1-1.0)
 * @returns {Object} Match result with homeScore and awayScore
 */
function calculateSkillBasedResult(homeSkill, awaySkill) {
  // Home advantage factor (small boost for home team)
  const homeAdvantage = 0.1;
  const adjustedHomeSkill = Math.min(1.0, homeSkill + homeAdvantage);
  
  // Calculate relative strength difference
  const totalSkill = adjustedHomeSkill + awaySkill;
  const homeWinProbability = adjustedHomeSkill / totalSkill;
  
  // Add some randomness to make results less predictable
  const randomFactor = 0.3; // 30% randomness
  const skillFactor = 1 - randomFactor;
  const finalHomeWinProb = (homeWinProbability * skillFactor) + (Math.random() * randomFactor);
  
  // Generate base scores (typically 8-20 for bowls)
  const baseScore = 8 + Math.floor(Math.random() * 13); // 8-20
  const scoreDifference = Math.floor(Math.random() * 8) + 1; // 1-8 point difference
  
  let homeScore, awayScore;
  
  if (finalHomeWinProb > 0.6) {
    // Home team wins
    homeScore = baseScore + scoreDifference;
    awayScore = baseScore;
  } else if (finalHomeWinProb < 0.4) {
    // Away team wins
    homeScore = baseScore;
    awayScore = baseScore + scoreDifference;
  } else {
    // Close match or draw
    if (Math.random() < 0.15) {
      // 15% chance of draw in close matches
      homeScore = awayScore = baseScore;
    } else {
      // Narrow win for one team
      const narrowDiff = Math.floor(Math.random() * 3) + 1; // 1-3 point difference
      if (Math.random() < 0.5) {
        homeScore = baseScore + narrowDiff;
        awayScore = baseScore;
      } else {
        homeScore = baseScore;
        awayScore = baseScore + narrowDiff;
      }
    }
  }
  
  return { homeScore, awayScore };
}

/**
 * Generate a test match object with skill-based results
 * @param {Team} homeTeam - The home team object
 * @param {Team} awayTeam - The away team object
 * @param {Date} matchDate - The date for this match
 * @param {number} homeSkill - Home team skill level
 * @param {number} awaySkill - Away team skill level
 * @param {boolean} shouldHaveResult - Whether this match should have a result
 * @returns {Object} A test match object in the format expected by the system
 */
function generateTestMatch(homeTeam, awayTeam, matchDate, homeSkill, awaySkill, shouldHaveResult = true) {
  const matchData = {
    _id: `match-${generateUniqueId()}`,
    homeTeam: {
      _id: homeTeam._id,
      name: homeTeam.name
    },
    awayTeam: {
      _id: awayTeam._id,
      name: awayTeam.name
    },
    date: matchDate.toISOString().split('T')[0], // Format as YYYY-MM-DD string like the modal does
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Add result if this is a past match
  if (shouldHaveResult) {
    const result = calculateSkillBasedResult(homeSkill, awaySkill);
    
    matchData.result = {
      played: true,
      homeScore: result.homeScore,
      awayScore: result.awayScore,
      homePoints: result.homeScore > result.awayScore ? 2 : (result.homeScore === result.awayScore ? 1 : 0),
      awayPoints: result.awayScore > result.homeScore ? 2 : (result.homeScore === result.awayScore ? 1 : 0),
      rinkPointsUsed: false
    };
  } else {
    // Explicitly set result to null for future matches
    matchData.result = null;
  }
  
  // Return the plain object instead of creating a Match instance
  return matchData;
}

/**
 * Generate test league data for testing using LeagueJS with skill-based results
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
    timesTeamsPlayOther: 2, // Each team plays each other twice (home and away)
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
  
  // Add teams to the league with skill levels
  const teams = [];
  const teamSkills = new Map(); // Store skill levels for each team
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
    teamSkills.set(team._id, generateTeamSkill());
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
    teamSkills.set(team._id, generateTeamSkill());
  }
  
  // Generate match schedule with dates
  const today = new Date();
  const matches = [];
  
  // Calculate total number of matches (each team plays each other twice)
  const totalMatches = teamCount * (teamCount - 1) * settings.timesTeamsPlayOther;
  
  // 80% of matches should be in the past with results, 20% in the future without results
  const pastMatchCount = Math.floor(totalMatches * 0.8);
  
  // Generate all possible match combinations
  let matchIndex = 0;
  const allMatchPairs = [];
  
  for (let round = 0; round < settings.timesTeamsPlayOther; round++) {
    for (let i = 0; i < teams.length; i++) {
      for (let j = 0; j < teams.length; j++) {
        if (i !== j) {
          allMatchPairs.push({
            homeTeam: teams[i],
            awayTeam: teams[j],
            round: round + 1
          });
        }
      }
    }
  }
  
  // Shuffle the matches to create a more realistic schedule
  for (let i = allMatchPairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allMatchPairs[i], allMatchPairs[j]] = [allMatchPairs[j], allMatchPairs[i]];
  }
  
  // Generate matches with dates
  allMatchPairs.forEach((matchPair, index) => {
    const isPastMatch = index < pastMatchCount;
    
    let matchDate;
    if (isPastMatch) {
      // Past matches: spread over the last 12 weeks
      const weeksAgo = Math.floor((index / pastMatchCount) * 12);
      const daysAgo = (weeksAgo * 7) + Math.floor(Math.random() * 7);
      matchDate = new Date(today);
      matchDate.setDate(today.getDate() - daysAgo);
    } else {
      // Future matches: spread over the next 8 weeks
      const futureIndex = index - pastMatchCount;
      const totalFutureMatches = allMatchPairs.length - pastMatchCount;
      const weeksAhead = Math.floor((futureIndex / totalFutureMatches) * 8) + 1;
      const daysAhead = (weeksAhead * 7) + Math.floor(Math.random() * 7);
      matchDate = new Date(today);
      matchDate.setDate(today.getDate() + daysAhead);
    }
    
    const homeSkill = teamSkills.get(matchPair.homeTeam._id);
    const awaySkill = teamSkills.get(matchPair.awayTeam._id);
    
    const matchData = generateTestMatch(
      matchPair.homeTeam,
      matchPair.awayTeam,
      matchDate,
      homeSkill,
      awaySkill,
      isPastMatch
    );
    
    // Add the match data directly to the league's matches array
    league.matches.push(matchData);
  });
  
  // Don't call initialiseFixtures as it might override our match data
  // league.initialiseFixtures();
  
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