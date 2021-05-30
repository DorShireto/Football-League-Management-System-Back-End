var express = require("express");
var router = express.Router();
const league_utils = require("./utils/league_utils");
const matches_utils = require("./utils/matches_utils");
const DB_utils = require("./utils/DButils");
/**
 * Authenticate all incoming requests by middleware
 */
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

router.get("/getDetails", async (req, res, next) => {
  try {
    let league_details = await league_utils.getLeagueDetails();
    const match = await DB_utils.execQuery("select TOP 1 * from dbo.matches where date > CURRENT_TIMESTAMP order by date,time;");
    let next_match = {
      "leagueName": match[0].leagueName,
      "seasonName": match[0].seasonName,
      "stageName": match[0].stageName,
      "homeTeam": match[0].homeTeam,
      "awayTeam": match[0].awayTeam,
      "date": new Date(match[0].date).toJSON().slice(0, 10).replace(/-/g, '/'),
      "time": new Date(match[0].time).toJSON().slice(11, 19).replace(/-/g, '/'),
      "refereeName": match[0].refereeName,
      "stadium": match[0].stadium,
      "result": {
        "homeScore": match[0].homeScore,
        "awayScore": match[0].awayScore
      },
    }
    league_details.nextMatch = next_match;
    res.send(league_details);
  } catch (error) {
    next(error);
  }
});

// add new match to DB by association member
router.post("/addMatch", async (req, res, next) => {
  //check if logged user is association member role
  try {

    if (req.session && req.session.user_id) {
      const user_id = req.session.user_id;
      const role = await DB_utils.execQuery(`SELECT role FROM dbo.users where user_id ='${user_id}';`)
      if (role[0].role != "asso_member")
        throw { status: 403, message: "only association member can add new matches to the system!" };

    }

    //get data from body
    const leagueName = req.body.leagueName;
    const seasonName = req.body.seasonName;
    const stageName = req.body.stageName;
    const homeTeam = req.body.homeTeam;
    const awayTeam = req.body.awayTeam;
    const date = req.body.date;
    const time = req.body.time;
    const refereeName = req.body.refereeName;
    const stadium = req.body.stadium;
    const matchId = await matches_utils.generateRandId();

    // insert to DB
    await DB_utils.execQuery(
      `INSERT INTO dbo.matches (leagueName, seasonName, stageName, homeTeam, awayTeam, refereeName, stadium, date,time,id) VALUES
       ('${leagueName}','${seasonName}','${stageName}','${homeTeam}','${awayTeam}', '${refereeName}','${stadium}','${date}','${time}','${matchId}');`
    );

    res.status(201).send("match added successfully");
  } catch (error) {
    next(error);
  }
});

router.post("/updateMatchScore", async (req, res, next) => {
  //check if logged user is association member role
  try {

    if (req.session && req.session.user_id) {
      const user_id = req.session.user_id;
      const role = await DB_utils.execQuery(`SELECT role FROM dbo.users where user_id ='${user_id}';`)
      if (role[0].role != "asso_member")
        throw { status: 403, message: "only association member can update matches score!" };

    }

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


module.exports = router;
