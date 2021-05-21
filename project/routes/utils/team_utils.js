const axios = require("axios");

async function getTeam(teamId) {
    const team = await axios.get(
        `https://soccer.sportmonks.com/api/v2.0/teams/${teamId}`,
        {
            params: {
                api_token: process.env.api_token,
            },
        }
    );
    return team;
}



exports.getTeam = getTeam;
