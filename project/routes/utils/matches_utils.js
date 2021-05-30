const axios = require("axios");
const league_utils = require("./league_utils");
const team_utils = require("./team_utils");
const db_utils = require("./DButils");
const { select } = require("async");
const { decodeBase64 } = require("bcryptjs");
const { map } = require("methods");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
const MAX_MATCHES_IN_DB = 25000;
// const TEAM_ID = "85";

async function generateRandId() {
    //generate random match_id
    let random_match_id = Math.floor(Math.random() * MAX_MATCHES_IN_DB);
    let matchIds = await db_utils.execQuery(
        `select id from dbo.matches where id = '${random_match_id}'`
    );
    while (matchIds.length !== 0) {
        random_match_id = Math.floor(Math.random() * MAX_MATCHES_IN_DB);
        matchIds = await db_utils.execQuery(
            `select id from dbo.matches where id = '${random_match_id}'`
        );
    }
    return random_match_id;
}

async function getMatchIdsByTeam(team_name) {
    // let match_ids_list = [];
    // const res = db_utils.execQuery(`select id from dbo.matches where homeTeam='${team_name}' or awayTeam='${team_name}' `);
    // return match_ids_list;

    let promises = [];
    promises.push(
        // get the match from local db
        db_utils.execQuery(`select id from dbo.matches where homeTeam='${team_name}' or awayTeam='${team_name}' `));
    let match_ids_list = await Promise.all(promises);
    return match_ids_list;

}

async function getEventCalendar(matchId) {
    return new Promise((res, rej) => {
        const results = db_utils.execQuery(`select * from dbo.MatchEventCalendar where matchId='${matchId}'`);
        res(results);
    })
}


async function getMatchesInfo(matches_ids_list) {
    let promises = [];
    matches_ids_list.map((id) =>
        promises.push(
            // get the match from local db
            db_utils.execQuery(`select * from dbo.matches where id='${id}'`)));
    let matches_info = await Promise.all(promises);
    return extractRelevantMatchData(matches_info);
}

async function extractRelevantMatchData(matches_info) {
    // used for data comes from external API
    // return matches_info.map((match_info) => {
    //     const { league_id, season_id, stage_id, localteam_id, visitorteam_id } = match_info.data.data;
    //     const { date, time } = match_info.data.data.time.starting_at;
    //     return {
    //         league_id: league_id,
    //         season_id: season_id,
    //         stage_id: stage_id,
    //         localteam_id: localteam_id,
    //         visitorteam_id: visitorteam_id,
    //         date: date,
    //         time: time,
    //         //todo: add other things like match result
    //     };
    // });
    //used for matches that come from internal DB

    return matches_info.map((match_info) => {
        const { leagueName, seasonName, stageName, awayTeam, homeTeam, date, time, awayScore, homeScore, id, refereeName, stadium } = match_info[0];
        // build matchEventCalendar object
        // let matchEventCalendar = getEventCalendar(id);
        // let dateTmp = new Date(date).toJSON().slice(0, 10).replace(/-/g, '/');
        // let timeTmp = new Date(time).toJSON().slice(11, 19).replace(/-/g, '/')
        return {
            leagueName: leagueName,
            seasonName: seasonName,
            stageName: stageName,
            awayTeam: awayTeam,
            homeTeam: homeTeam,
            date: new Date(date).toJSON().slice(0, 10).replace(/-/g, '/'),
            time: new Date(time).toJSON().slice(11, 19).replace(/-/g, '/'),
            result: {
                awayScore: awayScore,
                homeScore: homeScore
            },
            id: id,
            refereeName: refereeName,
            stadium: stadium
        };
    });
}
// async function getMatchesByTeam(team_id) {
//     let match_ids_list = await getMatchIdsByTeam(team_id);
//     let matches_info = await getMatchesInfo(match_ids_list);
//     return matches_info;
// }

exports.getMatchIdsByTeam = getMatchIdsByTeam;
exports.getMatchesInfo = getMatchesInfo;
exports.getEventCalendar = getEventCalendar;
exports.generateRandId = generateRandId;
