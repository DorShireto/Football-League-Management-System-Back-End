const axios = require("axios");
const matches_utils = require("./matches_utils");


async function getTeam(teamId) {
    const team = await axios.get(
        `https://soccer.sportmonks.com/api/v2.0/teams/${teamId}`,
        {
            params: {
                api_token: process.env.api_token,
                include: "squad.player",
            },
        }
    );
    return team;
}


async function getTeamsInfo(team_ids_array) {
    let teamsData = [];
    let futureMatches = [];
    let prevMatches = [];
    for (let i = 0; i < team_ids_array.length; i++) {
        const teamId = team_ids_array[i];
        let team = await getTeam(teamId);
        //get team games from local DB
        const matchIdsObject = await matches_utils.getMatchIdsByTeam(team.data.data.name);
        let matchIds = matchIdsObject[0];
        if (matchIds.length == 0)
            throw new Error("no matches for that team");
        let matches = await matches_utils.getMatchesInfo(matchIds[0]);
        let today = new Date();
        matches.foreach(match => {
            if (match.date > today)
                futureMatches.push(match);
            else
                prevMatches.push(match);
        })
        teamsData.push({
            players: team.squad,
            prevMatches: prevMatches,
            futureMatches: futureMatches,
            name: team.name,
            logoURL: team.logo_path,
        });
    }
    return teamsData;
}


exports.getTeam = getTeam;
exports.getTeamsInfo = getTeamsInfo;
