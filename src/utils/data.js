// data.js - Data utilities for league management
import { Match } from '@lovebowls/leaguejs';

/**
 * Generate a unique ID for data purposes
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
 * Generate a match object with skill-based results
 * @param {Object} homeTeam - The home team object with _id and name
 * @param {Object} awayTeam - The away team object with _id and name
 * @param {Date|null} matchDate - The date for this match, or null for unscheduled matches
 * @param {number} homeSkill - Home team skill level
 * @param {number} awaySkill - Away team skill level
 * @param {boolean} shouldHaveResult - Whether this match should have a result
 * @returns {Object} A match object in the format expected by the system
 */
function generateMatch(homeTeam, awayTeam, matchDate, homeSkill, awaySkill, shouldHaveResult = true) {
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
    date: matchDate ? matchDate.toISOString().split('T')[0] : null, // Format as YYYY-MM-DD string or null
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
  
  return matchData;
}

/**
 * Generate matches for existing teams in a league
 * @param {Array} teams - Array of team objects with _id and name
 * @param {Object} leagueSettings - League settings object containing timesTeamsPlayOther
 * @param {boolean} [allFutureMatches=true] - Whether all matches should be future matches without results
 * @returns {Array} Array of match objects
 */
export function generateMatchesForTeams(teams, leagueSettings = {}, allFutureMatches = true) {
  if (!teams || !Array.isArray(teams) || teams.length < 2) {
    console.warn('generateMatchesForTeams: Need at least 2 teams to generate matches');
    return [];
  }

  const timesTeamsPlayOther = leagueSettings.timesTeamsPlayOther || 2;
  const today = new Date();
  const matches = [];
  
  // Generate team skills for consistent results (only needed if generating past matches)
  const teamSkills = new Map();
  if (!allFutureMatches) {
    teams.forEach(team => {
      teamSkills.set(team._id, generateTeamSkill());
    });
  }
  
  // Calculate total number of matches
  const totalMatches = teams.length * (teams.length - 1) * timesTeamsPlayOther;
  
  // Determine how many matches should have results
  const pastMatchCount = allFutureMatches ? 0 : Math.floor(totalMatches * 0.8);
  
  // Generate all possible match combinations
  const allMatchPairs = [];
  
  for (let round = 0; round < timesTeamsPlayOther; round++) {
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
    const isPastMatch = !allFutureMatches && (index < pastMatchCount);
    
    let matchDate = null; // Default to null for reset matches
    
    if (!allFutureMatches) {
      // Only set dates when not generating all future matches (i.e., for test data)
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
    }
    
    // For future matches, we don't need skills since there are no results
    const homeSkill = isPastMatch ? teamSkills.get(matchPair.homeTeam._id) : 0;
    const awaySkill = isPastMatch ? teamSkills.get(matchPair.awayTeam._id) : 0;
    
    const matchData = generateMatch(
      matchPair.homeTeam,
      matchPair.awayTeam,
      matchDate,
      homeSkill,
      awaySkill,
      isPastMatch
    );
    
    matches.push(matchData);
  });
  
  return matches;
}

/**
 * Generate unscheduled matches for league reset (all matches have null date and null result)
 * @param {Array} teams - Array of team objects with _id and name
 * @param {Object} leagueSettings - League settings object containing timesTeamsPlayOther
 * @returns {Array} Array of match objects with null dates and null results
 */
export function generateResetMatches(teams, leagueSettings = {}) {
  return generateMatchesForTeams(teams, leagueSettings, true);
} 