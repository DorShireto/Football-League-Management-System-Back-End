const axios = require("axios");
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

  console.log("League detials from league_utiles: \n", league);

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
    current_season_id: league.data.data.current_season_id
    // next game details should come from DB
  };
}


exports.getLeagueDetails = getLeagueDetails;
exports.getSeason = getSeason;
exports.getStage = getStage;
