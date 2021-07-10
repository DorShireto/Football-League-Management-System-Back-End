var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const players_utils = require("./utils/players_utils");
const league_utils = require("./utils/league_utils");
const team_utils = require("./utils/team_utils");



// router.get("/teamFullDetails/:teamId", async (req, res, next) => {
//   let team_details = [];
//   try {
//     const team_details = await players_utils.getPlayersByTeam(
//       req.params.teamId
//     );
//     //we should keep implementing team page.....
//     res.send(team_details);
//   } catch (error) {
//     next(error);
//   }
// });


//      """  GET ALL TEAMS   """
router.get("/", async (req, res, next) => {
  //get season_ID by current league
  try {
    let leagueDetails = await league_utils.getLeagueDetails();
    // console.log(leagueDetails);
    let season_ID = leagueDetails.current_season_id;
    // console.log("Season id: ", season_ID);
    let teamsArray = await team_utils.getTeams(season_ID);
    res.status(200).send(teamsArray);
    // res.status(200).send("teamsArray");

  }
  catch (err) {
    next(err);
  }
});

router.get("/names", async (req, res, next) => {
  //get all teams names
  try {
    let teamsArray = await team_utils.getTeamsNames();
    res.status(200).send(teamsArray);
    // res.status(200).send("teamsArray");

  }
  catch (err) {
    next(err);
  }
});



//      """  GET TEAM BY ID """
router.get("/page/:teamId", async (req, res, next) => {
  try {
    const teamDetails = await team_utils.getTeamByID(req.params.teamId);
    res.status(200).send(teamDetails);
  } catch (error) {
    next(error);
  }
});

router.get("/:teamName/id", async (req, res, next) => {
  try {
    const teamId = await team_utils.getTeamIdByName(req.params.teamName);
    res.status(200).send(teamId);
  } catch (error) {
    next(error);
  }
});


//      """  GET TEAM BY NAME """
router.get("/page/name/:teamName", async (req, res, next) => {
  try {
    const teamDetails = await team_utils.getTeamByName(req.params.teamName);
    res.status(200).send(teamDetails);
  } catch (error) {
    next(error);
  }
});





module.exports = router;
