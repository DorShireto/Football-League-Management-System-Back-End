var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const users_utils = require("./utils/users_utils");
const players_utils = require("./utils/players_utils");
const matches_utils = require("./utils/matches_utils");
const league_utils = require("./utils/league_utils");
const team_utils = require("./utils/team_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT user_id FROM dbo.users")
      .then((users) => {
        if (users.find((x) => x.user_id === req.session.user_id)) {
          req.user_id = req.session.user_id;
          next();
        }
      })
      .catch((err) => next(err));
  } else {
    res.sendStatus(401);
  }
});

/**
 * This path gets body with playerId and save this player in the favorites list of the logged-in user
 */
router.post("/addPlayer", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const player_id = req.body.playerId;
    await users_utils.markPlayerAsFavorite(user_id, player_id);
    res.status(201).send("The player successfully saved as favorite");
  } catch (error) {
    next(error);
  }
});
router.delete("/removePlayer/:playerId", async (req, res) => {
  try {
    let playerId = req.params.playerId;
    DButils.execQuery(`delete from FavoritePlayers where player_id='${playerId}'`);
    res.status(201).send("Successfully removed player from favorite players list");
  }
  catch (error) {
    next(error);
  }
});
/**
 * This path returns the favorites players that were saved by the logged-in user
 */
router.get("/favoritePlayers", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    let favorite_players = {};
    const player_ids = await users_utils.getFavoritePlayers(user_id);
    let player_ids_array = [];
    player_ids.map((element) => player_ids_array.push(element.player_id)); //extracting the players ids into array
    const results = await players_utils.getPlayersInfo(player_ids_array);
    if (results.length == 0) {
      res.status(404).send("no favorite players for this user")
    }
    else {
      res.status(200).send(results)
    }
  } catch (error) {
    next(error);
  }
});





router.post("/addMatch", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const match_id = req.body.matchId;
    await users_utils.markMatchAsFavorite(user_id, match_id);
    res.status(201).send("The match successfully saved as favorite");
  } catch (error) {
    next(error);
  }
});
router.delete("/removeMatch/:matchId", async (req, res) => {
  try {
    let matchId = req.params.matchId;
    DButils.execQuery(`delete from FavoriteMatches where match_id='${matchId}'`);
    res.status(201).send("Successfully removed match from favorite matches list");
  }
  catch (error) {
    next(error);
  }
});
router.get("/favoriteMatches", async (req, res, next) => {
  // get matches from API
  // try {
  //   const user_id = req.session.user_id;
  //   let favorite_matches = {};
  //   const match_ids = await users_utils.getFavoriteMatches(user_id);
  //   let match_ids_array = [];
  //   match_ids.map((element) => match_ids_array.push(element.match_id)); //extracting the matchess ids into array
  //   const results = await matches_utils.getMatchesInfo(match_ids_array);
  //   //get league,season,stage name from id
  //   let match_data_list = [];
  //   const league = await league_utils.getLeagueDetails();
  //   const leagueName = league.leagueName;
  //   for (let i = 0; i < results.length; i++) {
  //     const result = results[i];
  //     const season = await league_utils.getSeason(result.season_id);
  //     const seasonName = season.data.data.name;
  //     const stage = await league_utils.getStage(result.stage_id);
  //     const stageName = stage.data.data.name;
  //     //get localTeam,awayTeam names from ids  
  //     const homeTeam = await team_utils.getTeam(result.localteam_id);
  //     const homeTeamName = homeTeam.data.data.name;
  //     const awayTeam = await team_utils.getTeam(result.visitorteam_id);
  //     const awayTeamName = awayTeam.data.data.name;
  //     match_data_list.push(
  //       {
  //         leagueName: leagueName,
  //         seasonName: seasonName,
  //         stageName: stageName,
  //         homeTeam: homeTeamName,
  //         awayTeam: awayTeamName,
  //         date: results[0].date,
  //         time: results[0].time,
  //         //todo: add referee name
  //       });
  //   }
  //   res.status(200).send(
  //     match_data_list)
  // }
  // catch (error) {
  //   next(error);
  // }


  // get the matches from local db
  try {
    const user_id = req.session.user_id;
    let favorite_matches = {};
    const match_ids = await users_utils.getFavoriteMatches(user_id);
    let match_ids_array = [];
    match_ids.map((element) => match_ids_array.push(element.match_id)); //extracting the matchess ids into array
    const results = await matches_utils.getMatchesInfo(match_ids_array);
    for (let i = 0; i < results.length; i++) {
      const element = results[i];
      const matchEventCalendar = await matches_utils.getEventCalendar(matchId);
      results[i].matchEventCalendar = matchEventCalendar;
    }
    if (results.length == 0) {
      res.status(404).send("no favorite matches for this user")
    }
    else {
      res.status(200).send(results)
    }
  }
  catch (error) {
    next(error);
  }
});


router.post("/addTeam", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const team_id = req.body.teamId;
    await users_utils.markTeamAsFavorite(user_id, team_id);
    res.status(201).send("The team successfully saved as favorite");
  } catch (error) {
    next(error);
  }
});
router.delete("/removeTeam/:teamId", async (req, res) => {
  try {
    let teamId = req.params.teamId;
    DButils.execQuery(`delete from FavoriteTeams where team_id='${teamId}'`);
    res.status(201).send("Successfully removed team from favorite teams list");
  }
  catch (error) {
    next(error);
  }
});
router.get("/favoriteTeams", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const team_ids = await users_utils.getFavoriteTeams(user_id);
    let favorite_teams = [];
    let team_ids_array = [];
    team_ids.map((element) => team_ids_array.push(element.team_id)); //extracting the team ids into array
    const results = await team_utils.getTeamsInfo(team_ids_array);
    for (let i = 0; i < results.length; i++) {
      const team = results[i];
      favorite_teams.push(team.data.data);

    }
    if (results.length == 0) {
      res.status(404).send("no favorite teams for this user")
    }
    else {
      res.status(200).send(favorite_teams)
    }
  }
  catch (error) {
    next(error);
  }
});



module.exports = router;
