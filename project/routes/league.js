var express = require("express");
var router = express.Router();
const league_utils = require("./utils/league_utils");
const matches_utils = require("./utils/matches_utils");
const DB_utils = require("./utils/DButils");

router.get("/getDetails", async (req, res, next) => {
  try {
    let league_details = await league_utils.getLeagueDetails();
    const match = await DB_utils.execQuery("select TOP 1 * from dbo.matches where matchDate > CURRENT_TIMESTAMP order by matchDate;");
    let next_match = {
      "leagueName": match[0].leagueName,
      "seasonName": match[0].seasonName,
      "stageName": match[0].stageName,
      "homeTeam": match[0].homeTeam,
      "awayTeam": match[0].awayTeam,
      "date": match[0].matchDate,
      "refereeName": match[0].refereeName,
      "stadium": match[0].stadium,
      "result": {
        "homeScore": match[0].homeScore,
        "awayScore": match[0].awayScore
      },
      "matchEventCalendar": match[0].matchEventCalendar
    }
    league_details.nextMatch = next_match;
    res.send(league_details);
  } catch (error) {
    next(error);
  }
});

router.post("/addMatch", async (req, res, next) => {
  try {
    const leagueName = req.body.leagueName;
    const seasonName = req.body.seasonName;
    const stageName = req.body.stageName;
    const homeTeam = req.body.homeTeam;
    const awayTeam = req.body.awayTeam;
    const date = req.body.date;
    const time = req.body.time;
    const refereeName = req.body.refereeName;
    const stadium = req.body.stadium;
    const matchId = matches_utils.generateRandId();




    await DB_utils.execQuery(
      `INSERT INTO dbo.matches (leagueName, seasonName, stageName, homeTeam, awayTeam, refereeName, stadium, date,time,id) VALUES
       ('${leagueName}','${seasonName}','${stageName}','${homeTeam}','${awayTeam}', '${refereeName}','${stadium}','${date}','${time}','${matchId}');`
    );

    res.send(league_details);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
