// data.js - Data utilities for league management
import { Match } from '@lovebowls/leaguejs';
import writeXlsxFile from 'write-excel-file';

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
 * Generate scheduled matches for league reset with scheduling parameters
 * @param {Array} teams - Array of team objects with _id and name
 * @param {Object} leagueSettings - League settings object containing timesTeamsPlayOther
 * @param {Object} schedulingParams - Scheduling parameters from the reset modal
 * @returns {Array} Array of match objects with scheduled dates and null results
 */
export function generateResetMatches(teams, leagueSettings = {}, schedulingParams = null) {
  if (!schedulingParams) {
    // Fallback to old behavior if no scheduling params provided
    return generateMatchesForTeams(teams, leagueSettings, true);
  }
  
  return generateScheduledMatches(teams, leagueSettings, schedulingParams);
}

/**
 * Generate matches with specific scheduling parameters
 * @param {Array} teams - Array of team objects with _id and name
 * @param {Object} leagueSettings - League settings object containing timesTeamsPlayOther
 * @param {Object} schedulingParams - Scheduling parameters
 * @returns {Array} Array of match objects with scheduled dates
 */
function generateScheduledMatches(teams, leagueSettings, schedulingParams) {
  if (!teams || !Array.isArray(teams) || teams.length < 2) {
    console.warn('generateScheduledMatches: Need at least 2 teams to generate matches');
    return [];
  }

  const timesTeamsPlayOther = leagueSettings.timesTeamsPlayOther || 2;
  const matches = [];
  
  // Generate match pairs in proper round-robin order
  const allMatchPairs = generateRoundRobinMatches(teams, timesTeamsPlayOther);
  
  // Apply intelligent scheduling with constraints
  const scheduledMatches = scheduleMatchesWithConstraints(allMatchPairs, schedulingParams);
  
  // Create match objects
  scheduledMatches.forEach(({ matchPair, date }) => {
    const matchData = generateMatch(
      matchPair.homeTeam,
      matchPair.awayTeam,
      date,
      0, // No skill needed for future matches
      0, // No skill needed for future matches
      false // No results for future matches
    );
    
    matches.push(matchData);
  });
  
  return matches;
}

/**
 * Generate round-robin match pairs maintaining proper structure
 * @param {Array} teams - Array of team objects
 * @param {number} timesTeamsPlayOther - How many times each team plays every other team
 * @returns {Array} Array of match pair objects with round information
 */
function generateRoundRobinMatches(teams, timesTeamsPlayOther) {
  const allMatchPairs = [];
  
  // For each complete round-robin cycle
  for (let cycle = 0; cycle < timesTeamsPlayOther; cycle++) {
    // Generate one complete round-robin (each team plays every other team once)
    for (let i = 0; i < teams.length; i++) {
      for (let j = 0; j < teams.length; j++) {
        if (i !== j) {
          // For first cycle, home advantage goes one way
          // For subsequent cycles, alternate or use different logic
          const isFirstCycle = cycle === 0;
          const shouldSwapHomeAway = cycle % 2 === 1; // Alternate home/away in different cycles
          
          allMatchPairs.push({
            homeTeam: shouldSwapHomeAway ? teams[j] : teams[i],
            awayTeam: shouldSwapHomeAway ? teams[i] : teams[j],
            round: cycle + 1,
            originalFixture: `${teams[i]._id}_vs_${teams[j]._id}`,
            cycle: cycle
          });
        }
      }
    }
  }
  
  return allMatchPairs;
}

/**
 * Schedule matches with constraints: no team plays twice on same day, 
 * balanced home/away, round-robin structure maintained
 * @param {Array} matchPairs - Array of match pair objects
 * @param {Object} schedulingParams - Scheduling parameters
 * @returns {Array} Array of {matchPair, date} objects
 */
function scheduleMatchesWithConstraints(matchPairs, schedulingParams) {
  const {
    startDate,
    maxMatchesPerDay,
    schedulingPattern,
    intervalNumber,
    intervalUnit,
    selectedDays
  } = schedulingParams;
  
  const scheduledMatches = [];
  const teamSchedule = new Map(); // Track when each team last played
  const teamHomeAwayCount = new Map(); // Track home/away balance for each team
  const dateSchedule = new Map(); // Track matches per date
  
  // Initialize team tracking
  matchPairs.forEach(pair => {
    if (!teamSchedule.has(pair.homeTeam._id)) {
      teamSchedule.set(pair.homeTeam._id, []);
      teamHomeAwayCount.set(pair.homeTeam._id, { home: 0, away: 0, lastThree: [], gameHistory: [] });
    }
    if (!teamSchedule.has(pair.awayTeam._id)) {
      teamSchedule.set(pair.awayTeam._id, []);
      teamHomeAwayCount.set(pair.awayTeam._id, { home: 0, away: 0, lastThree: [], gameHistory: [] });
    }
  });
  
  // Sort match pairs to prioritize round-robin completion
  const sortedMatches = [...matchPairs].sort((a, b) => {
    // First, sort by cycle (complete first round-robin before starting second)
    if (a.cycle !== b.cycle) {
      return a.cycle - b.cycle;
    }
    // Within same cycle, we can use other criteria or keep original order
    return 0;
  });
  
  // Generate available dates
  const availableDates = generateValidDates(schedulingParams);
  
  for (const matchPair of sortedMatches) {
    let scheduled = false;
    let attempts = 0;
    let currentDateIndex = 0; // Reset for each match to start from the earliest available date
    const maxAttempts = availableDates.length * 2; // Prevent infinite loops
    
    while (!scheduled && attempts < maxAttempts && currentDateIndex < availableDates.length) {
      const currentDate = availableDates[currentDateIndex];
      const dateKey = currentDate.toDateString();
      
      // Check constraints
      const canSchedule = canScheduleMatchOnDate(
        matchPair,
        currentDate,
        teamSchedule,
        dateSchedule,
        maxMatchesPerDay
      );
      
      if (canSchedule) {
        // Consider home/away balance before finalizing
        const balancedMatchPair = balanceHomeAway(matchPair, teamHomeAwayCount);
        
        // Schedule the match
        scheduledMatches.push({
          matchPair: balancedMatchPair,
          date: new Date(currentDate)
        });
        
        // Update tracking
        updateTeamSchedule(balancedMatchPair, currentDate, teamSchedule, teamHomeAwayCount);
        updateDateSchedule(currentDate, dateSchedule);
        
        scheduled = true;
      } else {
        // Try next date
        currentDateIndex++;
        if (currentDateIndex >= availableDates.length) {
          // If we've run out of dates, we might need to add more
          const lastDate = availableDates[availableDates.length - 1];
          const additionalDates = generateValidDatesFrom(lastDate, schedulingParams, 10);
          availableDates.push(...additionalDates);
        }
      }
      
      attempts++;
    }
    
    if (!scheduled) {
      console.warn('Could not schedule match:', matchPair);
      // Add as unscheduled match
      scheduledMatches.push({
        matchPair: matchPair,
        date: null
      });
    }
  }
  
  return scheduledMatches;
}

/**
 * Check if a match can be scheduled on a specific date
 * @param {Object} matchPair - Match pair object
 * @param {Date} date - Date to check
 * @param {Map} teamSchedule - Team schedule tracking
 * @param {Map} dateSchedule - Date schedule tracking
 * @param {number|null} maxMatchesPerDay - Maximum matches per day (null means no limit)
 * @returns {boolean} Whether the match can be scheduled
 */
function canScheduleMatchOnDate(matchPair, date, teamSchedule, dateSchedule, maxMatchesPerDay) {
  const dateKey = date.toDateString();
  
  // Check if either team is already playing on this date
  const homeTeamDates = teamSchedule.get(matchPair.homeTeam._id) || [];
  const awayTeamDates = teamSchedule.get(matchPair.awayTeam._id) || [];
  
  if (homeTeamDates.includes(dateKey) || awayTeamDates.includes(dateKey)) {
    return false;
  }
  
  // Check if the date has reached its match limit (only if limit is specified)
  if (maxMatchesPerDay !== null && maxMatchesPerDay !== undefined) {
    const matchesOnDate = dateSchedule.get(dateKey) || 0;
    if (matchesOnDate >= maxMatchesPerDay) {
      return false;
    }
  }
  
  return true;
}

/**
 * Balance home/away assignments to avoid long runs and maintain fairness
 * @param {Object} matchPair - Original match pair
 * @param {Map} teamHomeAwayCount - Home/away tracking for teams
 * @returns {Object} Potentially modified match pair
 */
function balanceHomeAway(matchPair, teamHomeAwayCount) {
  const homeTeamStats = teamHomeAwayCount.get(matchPair.homeTeam._id);
  const awayTeamStats = teamHomeAwayCount.get(matchPair.awayTeam._id);
  
  // Check consecutive games (stronger algorithm)
  const homeTeamLastGames = homeTeamStats.lastThree;
  const awayTeamLastGames = awayTeamStats.lastThree;
  
  // Count consecutive home/away games for each team
  const homeTeamConsecutiveHome = countConsecutiveFromEnd(homeTeamLastGames, 'home');
  const homeTeamConsecutiveAway = countConsecutiveFromEnd(homeTeamLastGames, 'away');
  const awayTeamConsecutiveHome = countConsecutiveFromEnd(awayTeamLastGames, 'home');
  const awayTeamConsecutiveAway = countConsecutiveFromEnd(awayTeamLastGames, 'away');
  
  // Calculate home/away balance ratios
  const homeTeamRatio = homeTeamStats.home / Math.max(1, homeTeamStats.home + homeTeamStats.away);
  const awayTeamRatio = awayTeamStats.home / Math.max(1, awayTeamStats.home + awayTeamStats.away);
  
  // Determine if we should swap based on multiple factors
  let shouldSwap = false;
  let swapReason = '';
  
  // Rule 1: Prevent long consecutive runs (priority 1)
  if (homeTeamConsecutiveHome >= 2 && awayTeamConsecutiveAway < 2) {
    shouldSwap = true;
    swapReason = 'Prevent home team consecutive home games';
  } else if (awayTeamConsecutiveAway >= 2 && homeTeamConsecutiveHome < 2) {
    shouldSwap = true;
    swapReason = 'Prevent away team consecutive away games';
  }
  
  // Rule 2: Balance overall home/away ratio (priority 2)
  else if (Math.abs(homeTeamRatio - awayTeamRatio) > 0.3) {
    // If one team has significantly more home games, try to balance
    if (homeTeamRatio > awayTeamRatio + 0.3) {
      // Home team has too many home games, they should play away
      shouldSwap = true;
      swapReason = 'Balance home team ratio (too many home)';
    } else if (awayTeamRatio > homeTeamRatio + 0.3) {
      // Away team has too many home games, they should play home (no swap needed)
      shouldSwap = false;
      swapReason = 'Balance away team ratio (they need home)';
    }
  }
  
  // Rule 3: Prefer alternating patterns when possible (priority 3)
  else if (homeTeamLastGames.length > 0 && awayTeamLastGames.length > 0) {
    const homeTeamLastGame = homeTeamLastGames[homeTeamLastGames.length - 1];
    const awayTeamLastGame = awayTeamLastGames[awayTeamLastGames.length - 1];
    
    // If home team just played home and away team just played away, swap
    if (homeTeamLastGame === 'home' && awayTeamLastGame === 'away') {
      shouldSwap = true;
      swapReason = 'Encourage alternating pattern';
    }
  }
  
  if (shouldSwap) {
    return {
      ...matchPair,
      homeTeam: matchPair.awayTeam,
      awayTeam: matchPair.homeTeam,
      _balanceReason: swapReason // For debugging
    };
  }
  
  return matchPair; // No change needed
}

/**
 * Count consecutive games of a specific type from the end of the array
 * @param {Array} games - Array of 'home' or 'away' strings
 * @param {string} type - 'home' or 'away'
 * @returns {number} Number of consecutive games of that type from the end
 */
function countConsecutiveFromEnd(games, type) {
  let count = 0;
  for (let i = games.length - 1; i >= 0; i--) {
    if (games[i] === type) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

/**
 * Update team schedule tracking
 */
function updateTeamSchedule(matchPair, date, teamSchedule, teamHomeAwayCount) {
  const dateKey = date.toDateString();
  
  // Update team dates
  const homeTeamDates = teamSchedule.get(matchPair.homeTeam._id);
  const awayTeamDates = teamSchedule.get(matchPair.awayTeam._id);
  
  homeTeamDates.push(dateKey);
  awayTeamDates.push(dateKey);
  
  // Update home/away tracking
  const homeTeamStats = teamHomeAwayCount.get(matchPair.homeTeam._id);
  const awayTeamStats = teamHomeAwayCount.get(matchPair.awayTeam._id);
  
  // Update home team stats
  homeTeamStats.home++;
  homeTeamStats.lastThree.push('home');
  homeTeamStats.gameHistory.push({ date: new Date(date), type: 'home' });
  if (homeTeamStats.lastThree.length > 5) { // Keep track of last 5 games instead of 3
    homeTeamStats.lastThree.shift();
  }
  
  // Update away team stats
  awayTeamStats.away++;
  awayTeamStats.lastThree.push('away');
  awayTeamStats.gameHistory.push({ date: new Date(date), type: 'away' });
  if (awayTeamStats.lastThree.length > 5) { // Keep track of last 5 games instead of 3
    awayTeamStats.lastThree.shift();
  }
}

/**
 * Update date schedule tracking
 */
function updateDateSchedule(date, dateSchedule) {
  const dateKey = date.toDateString();
  const current = dateSchedule.get(dateKey) || 0;
  dateSchedule.set(dateKey, current + 1);
}

/**
 * Generate valid dates based on scheduling parameters
 * @param {Object} schedulingParams - Scheduling parameters
 * @param {number} estimatedDays - Estimated number of days needed
 * @returns {Array} Array of Date objects
 */
function generateValidDates(schedulingParams, estimatedDays = 365) {
  const { startDate, schedulingPattern, intervalNumber, intervalUnit, selectedDays } = schedulingParams;
  
  const dates = [];
  const startDateObj = new Date(startDate);
  let currentDate = new Date(startDateObj);
  
  if (schedulingPattern === 'interval') {
    const intervalDays = intervalUnit === 'weeks' ? intervalNumber * 7 : intervalNumber;
    
    for (let i = 0; i < estimatedDays / intervalDays; i++) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + intervalDays);
    }
  } else if (schedulingPattern === 'dayOfWeek') {
    let daysGenerated = 0;
    
    // Find first valid day
    while (!selectedDays.includes(currentDate.getDay()) && daysGenerated < 7) {
      currentDate.setDate(currentDate.getDate() + 1);
      daysGenerated++;
    }
    
    // Generate dates for selected days of week
    while (dates.length < estimatedDays) {
      if (selectedDays.includes(currentDate.getDay())) {
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }
  
  return dates;
}

/**
 * Generate additional valid dates from a starting point
 */
function generateValidDatesFrom(fromDate, schedulingParams, count = 10) {
  const { schedulingPattern, intervalNumber, intervalUnit, selectedDays } = schedulingParams;
  
  const dates = [];
  let currentDate = new Date(fromDate);
  
  if (schedulingPattern === 'interval') {
    const intervalDays = intervalUnit === 'weeks' ? intervalNumber * 7 : intervalNumber;
    
    for (let i = 0; i < count; i++) {
      currentDate.setDate(currentDate.getDate() + intervalDays);
      dates.push(new Date(currentDate));
    }
  } else if (schedulingPattern === 'dayOfWeek') {
    let datesGenerated = 0;
    
    while (datesGenerated < count) {
      currentDate.setDate(currentDate.getDate() + 1);
      if (selectedDays.includes(currentDate.getDay())) {
        dates.push(new Date(currentDate));
        datesGenerated++;
      }
    }
  }
  
  return dates;
}

/**
 * Generate an array of dates based on scheduling parameters
 * @param {Object} schedulingParams - Scheduling parameters from modal
 * @param {number} totalMatches - Total number of matches to schedule
 * @returns {Array} Array of Date objects
 * @deprecated - Use scheduleMatchesWithConstraints instead for proper scheduling
 */
function generateScheduleDates(schedulingParams, totalMatches) {
  const {
    startDate,
    maxMatchesPerDay,
    schedulingPattern,
    intervalNumber,
    intervalUnit,
    selectedDays
  } = schedulingParams;
  
  const dates = [];
  const startDateObj = new Date(startDate);
  const maxPerDay = maxMatchesPerDay || totalMatches; // No limit if not specified
  
  if (schedulingPattern === 'interval') {
    // Schedule matches at regular intervals
    const intervalDays = intervalUnit === 'weeks' ? intervalNumber * 7 : intervalNumber;
    let currentDate = new Date(startDateObj);
    let matchesScheduled = 0;
    let matchesOnCurrentDate = 0;
    
    while (matchesScheduled < totalMatches) {
      // Add matches to current date up to the limit
      if (matchesOnCurrentDate < maxPerDay) {
        dates.push(new Date(currentDate));
        matchesScheduled++;
        matchesOnCurrentDate++;
      } else {
        // Move to next scheduled date
        currentDate.setDate(currentDate.getDate() + intervalDays);
        matchesOnCurrentDate = 0;
      }
    }
  } else if (schedulingPattern === 'dayOfWeek') {
    // Schedule matches on specific days of the week
    let currentDate = new Date(startDateObj);
    let matchesScheduled = 0;
    let matchesOnCurrentDate = 0;
    
    // Find the first valid day
    while (!selectedDays.includes(currentDate.getDay()) && matchesScheduled === 0) {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    while (matchesScheduled < totalMatches) {
      if (selectedDays.includes(currentDate.getDay())) {
        // This is a valid day for matches
        if (matchesOnCurrentDate < maxPerDay) {
          dates.push(new Date(currentDate));
          matchesScheduled++;
          matchesOnCurrentDate++;
        } else {
          // Move to next valid day
          matchesOnCurrentDate = 0;
          do {
            currentDate.setDate(currentDate.getDate() + 1);
          } while (!selectedDays.includes(currentDate.getDay()));
        }
      } else {
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
  }
  
  return dates;
}

/**
 * Export matches to CSV format and trigger download
 * @param {Array} matches - Array of match objects
 * @param {string} filename - Filename for the export (without extension)
 */
export function exportMatchesToCSV(matches, filename = 'league-matches') {
  if (!matches || !Array.isArray(matches)) {
    console.warn('exportMatchesToCSV: Invalid matches data');
    return;
  }

  // CSV headers
  const headers = ['Date', 'Home Team', 'Away Team', 'Home Score', 'Away Score'];
  
  // Convert matches to CSV rows
  const rows = matches.map(match => {
    const date = match.date ? new Date(match.date).toLocaleDateString() : 'TBD';
    const homeTeam = match.homeTeam?.name || 'Unknown';
    const awayTeam = match.awayTeam?.name || 'Unknown';
    const homeScore = match.result?.homeScore ?? '';
    const awayScore = match.result?.awayScore ?? '';
    
    return [date, homeTeam, awayTeam, homeScore, awayScore];
  });
  
  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  
  // Create and download file
  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
}

/**
 * Export matches to Excel format and trigger download
 * @param {Array} matches - Array of match objects
 * @param {string} filename - Filename for the export (without extension)
 */
export async function exportMatchesToExcel(matches, filename = 'league-matches') {
  if (!matches || !Array.isArray(matches)) {
    console.warn('exportMatchesToExcel: Invalid matches data');
    return;
  }

  try {
    // Define the schema for the Excel file
    const schema = [
      {
        column: 'Date',
        type: String,
        value: match => match.date ? new Date(match.date).toLocaleDateString() : 'TBD',
        width: 12,
        align: 'left'
      },
      {
        column: 'Home Team',
        type: String,
        value: match => match.homeTeam?.name || 'Unknown',
        width: 25,
        align: 'left'
      },
      {
        column: 'Away Team',
        type: String,
        value: match => match.awayTeam?.name || 'Unknown',
        width: 25,
        align: 'left'
      },
      {
        column: 'Home Score',
        type: String,
        value: match => match.result?.homeScore?.toString() || '',
        width: 12,
        align: 'center'
      },
      {
        column: 'Away Score',
        type: String,
        value: match => match.result?.awayScore?.toString() || '',
        width: 12,
        align: 'center'
      }
    ];

    // Generate the Excel file
    await writeXlsxFile(matches, {
      schema,
      fileName: `${filename}.xlsx`,
      fontFamily: 'Calibri',
      fontSize: 11,
      getHeaderStyle: () => ({
        fontWeight: 'bold',
        backgroundColor: '#f2f2f2',
        align: 'center'
      })
    });

    console.log(`Excel file "${filename}.xlsx" has been downloaded successfully`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert('Error creating Excel file. Please try again.');
  }
}

/**
 * Export matches to Word format and trigger download
 * @param {Array} matches - Array of match objects
 * @param {string} filename - Filename for the export (without extension)
 */
export function exportMatchesToWord(matches, filename = 'league-matches') {
  if (!matches || !Array.isArray(matches)) {
    console.warn('exportMatchesToWord: Invalid matches data');
    return;
  }

  // Create HTML document that Word can open
  let htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>League Matches</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
    </style>
</head>
<body>
    <h1>League Matches Export</h1>
    <p>Generated on: ${new Date().toLocaleDateString()}</p>
    <p>Total matches: ${matches.length}</p>
    
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Home Team</th>
                <th>Away Team</th>
                <th>Result</th>
            </tr>
        </thead>
        <tbody>`;

  matches.forEach(match => {
    const date = match.date ? new Date(match.date).toLocaleDateString() : 'TBD';
    const homeTeam = escapeHtml(match.homeTeam?.name || 'Unknown');
    const awayTeam = escapeHtml(match.awayTeam?.name || 'Unknown');
    const result = match.result?.played 
      ? `${match.result.homeScore}-${match.result.awayScore}`
      : '-';
    
    htmlContent += `
            <tr>
                <td>${date}</td>
                <td>${homeTeam}</td>
                <td>${awayTeam}</td>
                <td>${result}</td>
            </tr>`;
  });

  htmlContent += `
        </tbody>
    </table>
</body>
</html>`;

  // Create and download file
  downloadFile(htmlContent, `${filename}.doc`, 'application/msword');
}

/**
 * Export matches to PDF format and trigger download
 * @param {Array} matches - Array of match objects
 * @param {string} filename - Filename for the export (without extension)
 */
export function exportMatchesToPDF(matches, filename = 'league-matches') {
  if (!matches || !Array.isArray(matches)) {
    console.warn('exportMatchesToPDF: Invalid matches data');
    return;
  }

  // Create a simple HTML structure that can be printed to PDF
  // Note: This creates an HTML file that users can print to PDF
  // For true PDF generation, you'd need a library like jsPDF or PDFKit
  let htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>League Matches</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            font-size: 12px;
        }
        h1 { 
            color: #333; 
            border-bottom: 2px solid #333; 
            padding-bottom: 10px; 
            font-size: 18px;
        }
        table { 
            border-collapse: collapse; 
            width: 100%; 
            margin-top: 20px; 
            page-break-inside: avoid;
        }
        th, td { 
            border: 1px solid #ddd; 
            padding: 6px; 
            text-align: left; 
            font-size: 11px;
        }
        th { 
            background-color: #f2f2f2; 
            font-weight: bold; 
        }
        tr:nth-child(even) { 
            background-color: #f9f9f9; 
        }
        .print-instruction {
            background: #e9ecef;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="print-instruction no-print">
        <strong>Instructions:</strong> Use your browser's print function (Ctrl+P) and select "Save as PDF" to create a PDF file.
    </div>
    
    <h1>League Matches Export</h1>
    <p>Generated on: ${new Date().toLocaleDateString()}</p>
    <p>Total matches: ${matches.length}</p>
    
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Home Team</th>
                <th>Away Team</th>
                <th>Result</th>
            </tr>
        </thead>
        <tbody>`;

  matches.forEach(match => {
    const date = match.date ? new Date(match.date).toLocaleDateString() : 'TBD';
    const homeTeam = escapeHtml(match.homeTeam?.name || 'Unknown');
    const awayTeam = escapeHtml(match.awayTeam?.name || 'Unknown');
    const result = match.result?.played 
      ? `${match.result.homeScore}-${match.result.awayScore}`
      : '-';
    
    htmlContent += `
            <tr>
                <td>${date}</td>
                <td>${homeTeam}</td>
                <td>${awayTeam}</td>
                <td>${result}</td>
            </tr>`;
  });

  htmlContent += `
        </tbody>
    </table>
</body>
</html>`;

  // Open in new window for printing to PDF
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.write(htmlContent);
    newWindow.document.close();
    newWindow.focus();
  } else {
    // Fallback: download as HTML file
    downloadFile(htmlContent, `${filename}.html`, 'text/html');
  }
}

/**
 * Export matches to JSON format and trigger download
 * @param {Array} matches - Array of match objects
 * @param {string} filename - Filename for the export (without extension)
 */
export function exportMatchesToJSON(matches, filename = 'league-matches') {
  if (!matches || !Array.isArray(matches)) {
    console.warn('exportMatchesToJSON: Invalid matches data');
    return;
  }

  // Create export object with metadata
  const exportData = {
    exportDate: new Date().toISOString(),
    totalMatches: matches.length,
    matches: matches.map(match => ({
      id: match._id,
      date: match.date,
      homeTeam: {
        id: match.homeTeam?._id,
        name: match.homeTeam?.name
      },
      awayTeam: {
        id: match.awayTeam?._id,
        name: match.awayTeam?.name
      },
      result: match.result ? {
        played: match.result.played,
        homeScore: match.result.homeScore,
        awayScore: match.result.awayScore,
        homePoints: match.result.homePoints,
        awayPoints: match.result.awayPoints,
        rinkPointsUsed: match.result.rinkPointsUsed
      } : null,
      createdAt: match.createdAt,
      updatedAt: match.updatedAt
    }))
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  downloadFile(jsonContent, `${filename}.json`, 'application/json');
}

/**
 * Helper function to create and trigger file download
 * @param {string} content - File content
 * @param {string} filename - Filename with extension
 * @param {string} mimeType - MIME type of the file
 */
function downloadFile(content, filename, mimeType) {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error('Error downloading file:', error);
    alert('Error downloading file. Please try again.');
  }
}

/**
 * Helper function to escape XML content
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Helper function to escape HTML content
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
} 