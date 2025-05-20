// league-test-data.js - Test data for league element testing

/**
 * Generates test data for a league, optionally incorporating lovebowls teams
 * @param {Array} [lovebowlsTeams=[]] - Array of lovebowls teams objects with {value, label} properties
 * @param {number} [lovebowlsTeamCount=3] - Number of lovebowls teams to include
 * @param {string} [leagueName="2023-24 Bowls League"] - Custom name for the league
 * @returns {Object} Test league data
 */
export function generateTestLeagueData(lovebowlsTeams = [], lovebowlsTeamCount = 3, leagueName = "2023-24 Bowls League") {
  // Generate 8 teams - some may be replaced with lovebowls teams
  const defaultTeams = [
    { name: "Oakwood BC" },
    { name: "Riverdale BC" },
    { name: "Meadowbrook BC" },
    { name: "Hillside BC" },
    { name: "Valley Green BC" },
    { name: "Lakeside BC" },
    { name: "Pinehurst BC" },
    { name: "Westfield BC" }
  ];

  // Create the teams array, possibly incorporating lovebowls teams
  const teams = [...defaultTeams]; // Start with a copy of the default teams
  
  // Replace the first X teams with lovebowls teams if available
  if (lovebowlsTeams && lovebowlsTeams.length > 0) {
    const actualLbCount = Math.min(lovebowlsTeamCount, lovebowlsTeams.length, teams.length);
    console.log(`Including ${actualLbCount} lovebowls teams in test data`);
    
    for (let i = 0; i < actualLbCount; i++) {
      // Replace the team name with the lovebowls team GUID
      teams[i] = { name: lovebowlsTeams[i].value };
      console.log(`Team ${i+1} set to lovebowls team: ${lovebowlsTeams[i].label} (${lovebowlsTeams[i].value})`);
    }
  }

  // Calculate today and yesterday using standard Date
  const nowDate = new Date();
  const today = nowDate.toISOString().slice(0, 10);
  
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().slice(0, 10);
  
  // Generate all matches (each team plays every other team home and away)
  const matches = [];
  let matchKey = 1;
  
  // Create matches where each team plays every other team twice (home and away)
  for (let i = 0; i < teams.length; i++) {
    for (let j = 0; j < teams.length; j++) {
      // Skip if same team
      if (i === j) continue;
      
      // Calculate match date (go back 7 days for each match)
      const matchDateObj = new Date(yesterdayDate);
      matchDateObj.setDate(matchDateObj.getDate() - ((matchKey - 1) * 7));
      const currentMatchDate = matchDateObj.toISOString().slice(0, 10);
      
      // Generate random scores with average around 15
      const homeScore = Math.max(5, Math.floor(Math.random() * 20) + 5);
      const awayScore = Math.max(5, Math.floor(Math.random() * 20) + 5);
      
      // Add the match
      matches.push({
        key: `m${matchKey}`,
        homeTeamName: teams[i].name,
        awayTeamName: teams[j].name,
        date: currentMatchDate,
        result: {
          homeScore,
          awayScore,
          homeRinkScores: generateRinkScores(4),
          awayRinkScores: generateRinkScores(4)
        }
      });
      
      matchKey++;
    }
  }
  
  // Sort matches by date (newest first)
  matches.sort((a, b) => {
    // Simple string comparison works for ISO date format (YYYY-MM-DD)
    return b.date.localeCompare(a.date);
  });
  
  // Generate league table data
  const leagueData = teams.map(team => {
    return {
      teamName: team.name,
      // Will be calculated by the component
    };
  });
  
  return {
    _id: "league" + Date.now() + Math.floor(Math.random() * 1000), // Generate unique IDs for each league
    name: leagueName,
    settings: {
      pointsForWin: 2,
      pointsForDraw: 1,
      pointsForLoss: 0,
      timesTeamsPlayOther: 2,
      rinkPoints: {
        pointsPerRinkWin: 1,
        pointsPerRinkDraw: 0.5,
        defaultRinks: 4,
        enabled: true
      }
    },
    teams,
    matches,
    table: {
      leagueData,
      metaData: {
        promotionPlaces: 1,
        relegationPlaces: 1
      }
    },
    createdAt: "2023-08-01T12:00:00Z",
    updatedAt: today + "T12:00:00Z"
  };
}

// Helper function to generate random rink scores
function generateRinkScores(rinkCount) {
  const scores = [];
  for (let i = 0; i < rinkCount; i++) {
    scores.push(Math.max(1, Math.floor(Math.random() * 8) + 1));
  }
  return scores;
} 