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

//generate random match_id (from 0 to MAX_MATCHES_IN_DB)
async function generateRandId() {
    let random_match_id = Math.floor(Math.random() * MAX_MATCHES_IN_DB);
    let matchIds = await db_utils.execQuery(
        `select id from dbo.matches where id = '${random_match_id}'`
    );
    while (matchIds.length !== 0) { // match id already exists. generate new one until finding unused id.
        random_match_id = Math.floor(Math.random() * MAX_MATCHES_IN_DB);
        matchIds = await db_utils.execQuery(
            `select id from dbo.matches where id = '${random_match_id}'`
        );
    }
    return random_match_id;
}
//get array of matches ids of a team
async function getMatchIdsByTeam(team_name) {
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
    });
}

//get all data about matches
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
    return matches_info.map((match_info) => {
        const { leagueName, seasonName, stageName, awayTeam, homeTeam, date, time, awayScore, homeScore, id, refereeName, lineReferee1, lineReferee2, stadium } = match_info[0];
        return {
            leagueName: leagueName,
            seasonName: seasonName,
            stageName: stageName,
            awayTeam: awayTeam,
            homeTeam: homeTeam,
            date: new Date(date).toJSON().slice(0, 10).replace(/-/g, '/'),
            time: new Date(time).toJSON().slice(11, 19).replace(/-/g, '/'),

            awayScore: awayScore,
            homeScore: homeScore,

            id: id,
            refereeName: refereeName,
            lineReferee1: lineReferee1,
            lineReferee2: lineReferee2,
            stadium: stadium
        };
    });
}

//returns future match closest to current date time
async function getNextMatch() {
    const match = await db_utils.execQuery("select TOP 1 * from dbo.matches where date > CURRENT_TIMESTAMP order by date,time;");
    let next_match = {
        leagueName: match[0].leagueName,
        seasonName: match[0].seasonName,
        stageName: match[0].stageName,
        homeTeam: match[0].homeTeam,
        awayTeam: match[0].awayTeam,
        date: new Date(match[0].date).toJSON().slice(0, 10).replace(/-/g, '/'),
        time: new Date(match[0].time).toJSON().slice(11, 19).replace(/-/g, '/'),
        refereeName: match[0].refereeName,
        lineReferee1: match[0].lineReferee1,
        lineReferee2: match[0].lineReferee2,
        stadium: match[0].stadium,

        homeScore: match[0].homeScore,
        awayScore: match[0].awayScore,

        matchEventCalendar: match[0].matchEventCalendar
    }
    return next_match;
}

exports.getMatchIdsByTeam = getMatchIdsByTeam;
exports.getMatchesInfo = getMatchesInfo;
exports.getEventCalendar = getEventCalendar;
exports.generateRandId = generateRandId;
exports.getNextMatch = getNextMatch;
