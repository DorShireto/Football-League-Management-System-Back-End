const axios = require("axios");
const matches_utils = require("./matches_utils");
const LEAGUE_ID = 271;

async function getSeason(seasonId) {
  const season = await axios.get(
    `https://soccer.sportmonks.com/api/v2.0/seasons/${seasonId}`,
    {
      params: {
        api_token: process.env.api_token,

      },
    }
  );

  return season;
}

async function getStage(stageId) {
  const stage = await axios.get(
    `https://soccer.sportmonks.com/api/v2.0/stages/${stageId}`,
    {
      params: {
        api_token: process.env.api_token,

      },
    }
  );
  return stage;
}

// returns data about the league from the API
async function getLeagueDetails() {
  const league = await axios.get(
    `https://soccer.sportmonks.com/api/v2.0/leagues/${LEAGUE_ID}`,
    {
      params: {
        include: "season",
        api_token: process.env.api_token,
      },
    }
  );

  const stage = await axios.get(
    `https://soccer.sportmonks.com/api/v2.0/stages/${league.data.data.current_stage_id}`,
    {
      params: {
        api_token: process.env.api_token,
      },
    }
  );
  return {
    leagueName: league.data.data.name,
    seasonName: league.data.data.season.data.name,
    stageName: stage.data.data.name,
    current_season_id: league.data.data.current_season_id,
  };
}


exports.getLeagueDetails = getLeagueDetails;
exports.getSeason = getSeason;
exports.getStage = getStage;
