const axios = require("axios");
const league_utils = require("./league_utils");
const team_utils = require("./team_utils");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
// const TEAM_ID = "85";

async function getMatchIdsByTeam(team_id) {
    let match_ids_list = [];
    const team = await axios.get(`${api_domain}/fixtures/${team_id}`, {
        params: {
            include: "squad",
            api_token: process.env.api_token,
        },
    });
    team.data.data.squad.data.map((player) =>
        player_ids_list.push(player.player_id)
    );
    return player_ids_list;
}

async function getMatchesInfo(matches_ids_list) {
    let promises = [];
    matches_ids_list.map((id) =>
        promises.push(
            axios.get(`${api_domain}/fixtures/${id}`, {
                params: {
                    api_token: process.env.api_token,
                },
            })
        )
    );
    let matches_info = await Promise.all(promises);
    return extractRelevantMatchData(matches_info);
}

function extractRelevantMatchData(matches_info) {
    return matches_info.map((match_info) => {
        const { league_id, season_id, stage_id, localteam_id, visitorteam_id } = match_info.data.data;
        const { date, time } = match_info.data.data.time.starting_at;
        return {
            league_id: league_id,
            season_id: season_id,
            stage_id: stage_id,
            localteam_id: localteam_id,
            visitorteam_id: visitorteam_id,
            date: date,
            time: time,
            //todo: add other things like match result
        };


    });
}

// async function getMatchesByTeam(team_id) {
//     let match_ids_list = await getMatchIdsByTeam(team_id);
//     let matches_info = await getMatchesInfo(match_ids_list);
//     return matches_info;
// }

// exports.getMatchesByTeam = getMatchesByTeam;
exports.getMatchesInfo = getMatchesInfo;
