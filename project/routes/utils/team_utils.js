const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
const players_utils = require("./players_utils");
const DButils = require("./DButils");
const matches_utils = require("./matches_utils");
const { nextTick } = require("process");
const LEAGUE_ID = 271;

async function getTeamsNames() {
    const names = await DButils.execQuery(`SELECT teamName FROM dbo.teams;`)
    return names;

}


async function getTeams(season_ID) {
    console.log("getTeams season_id: ", season_ID);
    let teams_unfilterd = await axios.get(`${api_domain}/teams/season/${season_ID}`, {
        params:
        {
            api_token: process.env.api_token
        }
    });
    let teamsArray = [];
    for (let i = 0; i < teams_unfilterd.data.data.length; i++) {
        let team = teams_unfilterd.data.data[i];
        // console.log(team);
        let teamDetails = await getTeamByID(team.id);
        teamsArray.push(teamDetails);
    }
    return teamsArray;
}

async function getTeamByID(team_ID) {
    // console.log(team_ID);
    let team = await axios.get(`${api_domain}/teams/${team_ID}`, {
        params:
        {
            include: "squad.player",
            api_token: process.env.api_token,
        }
    });
    team = team.data.data;
    let games = await getGamesByTeamName(team.name);
    //build players in team array
    let squad = team.squad.data;
    let players = [];
    for (let i = 0; i < squad.length; i++) {
        let player = squad[i];
        let { fullname, image_path, position_id, player_id } = player.player.data;
        let playerToAdd = {
            fullname: fullname,
            profilePicURL: image_path,
            position: position_id,
            activeTeam: team.name,
            id: player_id
        };
        players.push(playerToAdd);
    }
    let teamDetails = {
        players: players,
        prevMatches: games.prevGames,
        futureMatches: games.futureGames,
        name: team.name,
        logoURL: team.logo_path
    };
    // console.log(teamDetails);
    return teamDetails;
}


async function getGamesByTeamName(team_Name) {
    let date_ob = new Date();

    const current_date = date_ob;
    try {
        let prev_and_future_games = new Object();
        let prevGames = [];
        let futureGames = [];
        const games = await DButils.execQuery(`SELECT * FROM dbo.matches AS m WHERE m.homeTeam= '${team_Name}' OR m.awayTeam='${team_Name}'`);
        for (let i = 0; i < games.length; i++) {
            let currentGame = games[i];
            let match = {
                id: currentGame.id,
                leagueName: currentGame.leagueName,
                seasonName: currentGame.seasonName,
                stageName: currentGame.stageName,
                homeTeam: currentGame.homeTeam,
                awayTeam: currentGame.awayTeam,
                date: new Date(currentGame.date).toJSON().slice(0, 10).replace(/-/g, '/'),
                time: new Date(currentGame.time).toJSON().slice(11, 19).replace(/-/g, '/'),
                refereeName: currentGame.refereeName,
                lineReferee1: currentGame.lineReferee1,
                lineReferee2: currentGame.lineReferee2,
                stadium: currentGame.stadium,
                homeScore: currentGame.homeScore,
                awayScore: currentGame.awayScore,
                matchEventCalendar: await matches_utils.getEventCalendar(currentGame.id)
            };
            if (Date.parse(currentGame.date) < Date.parse(current_date)) { // past game
                prevGames.push(match);
            }
            else { // future matches
                futureGames.push(match);
            }
        }
        prev_and_future_games.prevGames = prevGames;
        prev_and_future_games.futureGames = futureGames;
        return prev_and_future_games;


    }
    catch (err) {
        console.log(err);
    }
}

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
    for (let i = 0; i < team_ids_array.length; i++) {
        teamsData.push(await getTeamByID(team_ids_array[i]));
    }
    return teamsData;
}

async function getTeamIdByName(teamName) {
    try {
        let id = await DButils.execQuery(`select teamId from dbo.teams where teamName='${teamName}'`)
        return id[0];

    }
    catch (err) {
        console.log(err);
    }
}

exports.getTeamIdByName = getTeamIdByName;
exports.getTeamByID = getTeamByID;
exports.getTeams = getTeams;
exports.getGamesByTeamName = getGamesByTeamName;
exports.getTeamsNames = getTeamsNames;
exports.getTeam = getTeam;
exports.getTeamsInfo = getTeamsInfo;


