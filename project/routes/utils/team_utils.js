const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
const players_utils = require("./players_utils");
const DButils = require("./DButils");
const LEAGUE_ID = 271;

async function getTeams(season_ID) {
    let teams_unfilterd = await axios.get(`${api_domain}/teams/season/${season_ID}`, {
        param:
        {
            api_token: process.env.api_token
        }
    });

    let teamsArray = [];
    for (team in teams_unfilterd) {
        let teamDetails = getTeamByName(team.name);
        teamsArray.push(teamDetails);
    }
    return teamsArray;
}



async function getTeamByID(team_ID) {
    console.log(team_ID);
    let team = await axios.get(`${api_domain}/teams/${team_ID}`, {
        params:
        {
            api_token: process.env.api_token,
        }
    });
    team = team.data.data;
    let games = await getGamesByTeamName(team.name);
    let players = players_utils.getPlayersByTeam(team_ID);
    let teamDetails = {
        players: players,
        prevMatches: games.prevGames,
        futureMatches: games.futureGames,
        name: team.name,
        logoURL: team.logo_path
    };
    console.log(teamDetails);
    return teamDetails;
}

async function getTeamByName(team_Name) {
    console.log("Getting detials on team: ", team_Name, " by name");
    let team = await axios.get(`${api_domain}/teams/search/${team_Name}`, {
        params:
        {
            api_token: process.env.api_token,
        }
    });

    team = team.data.data[0];
    let team_ID = team.id;
    let players = await players_utils.getPlayersByTeam(team_ID);
    let games = await getGamesByTeamName(team_Name)
    let teamDetails = {
        players: players,
        prevMatches: games.prevGames,
        futureMatches: games.futureGames,
        name: team.name,
        logoURL: team.logo_path
    };
    console.log(teamDetails)
    return teamDetails;
}


async function getGamesByTeamName(team_Name) {
    let date_ob = new Date();

    const current_date = date_ob;
    // const current_date = new Date().toString().replace(/T/, ':').replace(/\.\w*/, '');
    // console.log("current_date: ", current_date);
    try {

        let prev_and_future_games = new Object();
        let prevGames = [];
        let futureGames = [];
        const games = await DButils.execQuery(`SELECT * FROM dbo.matches AS m WHERE m.homeTeam= '${team_Name}' OR m.awayTeam='${team_Name}'`);
        for (let i = 0; i < games.length; i++) {
            let currentGame = games[i];
            // console.log("current game date:", currentGame.date);
            if (Date.parse(currentGame.date) < Date.parse(current_date)) { // past game
                // console.log("Pre game, curernt date ", current_date, " Game Date: ", currentGame.date);
                prevGames.push(games[i]);
            }
            else { // future matches
                // console.log("Future game, curernt date ", current_date, " Game Date: ", currentGame.date);
                futureGames.push(games[i]);
            }
        }

        prev_and_future_games.prevGames = prevGames;
        prev_and_future_games.futureGames = futureGames;
        // console.log("Prev and Future Mathces:\n", prev_and_future_games)
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
            },
        }
    );
    return team;
}


exports.getTeamByID = getTeamByID;
exports.getTeam = getTeam;
exports.getGamesByTeamName = getGamesByTeamName;
exports.getTeamByName = getTeamByName;

// getTeamByName("Horsens");
// getTeamByID(211);
