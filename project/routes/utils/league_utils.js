const axios = require("axios");
const LEAGUE_ID = 271;

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
    // next game details should come from DB
  };
}
exports.getLeagueDetails = getLeagueDetails;
