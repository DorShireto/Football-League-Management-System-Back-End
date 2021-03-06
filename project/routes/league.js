var express = require("express");
var router = express.Router();
const league_utils = require("./utils/league_utils");
const matches_utils = require("./utils/matches_utils");
const DB_utils = require("./utils/DButils");
/**
 * Authenticate all incoming requests by middleware
 */
router.get("/getDetails", async (req, res, next) => {
  try {
    let league_details = await league_utils.getLeagueDetails();
    let next_match = matches_utils.getNextMatch();
    league_details.nextMatch = next_match;
    res.send(league_details);
  } catch (error) {
    next(error);
  }
});

router.get("/matches", async (req, res, next) => {
  try {
    let matches = await league_utils.getAllMatches();
    res.send(matches);
  } catch (error) {
    next(error);
  }
});




//check if logged in
router.use(async function (req, res, next) {
  if (req.session && req.session.user_id) {
    DB_utils.execQuery("SELECT user_id FROM dbo.users")
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




//check if user is association member
router.use(async function (req, res, next) {
  const user_id = req.session.user_id;
  const role = await DB_utils.execQuery(`SELECT role FROM dbo.users where user_id ='${user_id}';`)
  if (role[0].role == "asso_member") {
    next();
  }
  else {
    res.status(403).send("only association member can add new matches to the system!");
  }
});
router.get("/mainReferees", async (req, res, next) => {
  try {
    let referees = await league_utils.getMainRefereesNames();
    res.send(referees);
  } catch (error) {
    next(error);
  }
});
router.get("/lineReferees", async (req, res, next) => {
  try {
    let referees = await league_utils.getLineRefereesNames();
    res.send(referees);
  } catch (error) {
    next(error);
  }
});

// add new match to DB by association member
router.post("/addMatch", async (req, res, next) => {
  try {
    //get data from body
    const leagueName = req.body.leagueName;
    const seasonName = req.body.seasonName;
    const stageName = req.body.stageName;
    const homeTeam = req.body.homeTeam;
    const awayTeam = req.body.awayTeam;
    const date = req.body.date;
    const time = req.body.time;
    const refereeName = req.body.refereeName;
    const lineReferee1 = req.body.lineReferee1;
    const lineReferee2 = req.body.lineReferee2;
    const stadium = req.body.stadium;
    const matchId = await matches_utils.generateRandId();

    // insert to DB
    await DB_utils.execQuery(
      `INSERT INTO dbo.matches (leagueName, seasonName, stageName, homeTeam, awayTeam, refereeName, lineReferee1, lineReferee2, stadium, date,time,id) VALUES
       ('${leagueName}','${seasonName}','${stageName}','${homeTeam}','${awayTeam}', '${refereeName}','${lineReferee1}','${lineReferee2}','${stadium}','${date}','${time}','${matchId}');`
    );

    res.status(201).send("match added successfully");
  } catch (error) {
    next(error);
  }
});

router.put("/updateMatchScore", async (req, res, next) => {
  try {

    //get data from body
    const homeTeamScore = req.body.homeTeamScore;
    const awayTeamScore = req.body.awayTeamScore;
    const matchId = req.body.matchId;


    // insert to DB
    await DB_utils.execQuery(
      `UPDATE dbo.matches
      SET homeScore = '${homeTeamScore}', awayScore = '${awayTeamScore}'
      WHERE id='${matchId}';`
    );

    res.status(201).send("match score updated successfully");
  } catch (error) {
    next(error);
  }
});

router.post("/addMatchEvent", async (req, res, next) => {
  try {
    // insert to DB
    league_utils.addMatchEvent(req.body);
    res.status(201).send("match event added successfully");
  } catch (error) {
    next(error);
  }
});




module.exports = router;
