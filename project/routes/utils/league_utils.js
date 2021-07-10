const axios = require("axios");
const matches_utils = require("./matches_utils");
const DB_utils = require("./DButils")
const LEAGUE_ID = 271;
const MAX_EVENTS_IN_DB = 100000;

//generate random eventId (from 0 to MAX_EVENTS_IN_DB)
async function generateRandId() {
  let random_event_id = Math.floor(Math.random() * MAX_EVENTS_IN_DB);
  let eventsIds = await DB_utils.execQuery(
    `select eventId from dbo.MatchEventCalendar where eventId = '${random_event_id}'`
  );
  while (eventsIds.length !== 0) { // event id already exists. generate new one until finding unused id.
    random_event_id = Math.floor(Math.random() * MAX_EVENTS_IN_DB);
    eventsIds = await DB_utils.execQuery(
      `select eventId from dbo.MatchEventCalendar where eventId = '${random_event_id}'`
    );
  }
  return random_event_id;
}

async function addMatchEvent(event) {
  //generate id:
  eventId = await generateRandId();
  // insert to DB
  await DB_utils.execQuery(
    `INSERT INTO dbo.MatchEventCalendar (minInMatch, description, matchId, eventId, teamName, type, playerName) VALUES
     ('${event.minInMatch}','${event.description}','${event.matchId}','${eventId}','${event.teamName}', '${event.type}','${event.playerName}');`
  );
}


async function getMainRefereesNames() {
  let mainRefereesNames = [];
  const refs = await DB_utils.execQuery(`select name FROM dbo.referees WHERE role='main';`);
  refs.forEach(ref => {
    mainRefereesNames.push(ref.name);
  });
  return mainRefereesNames;
}

async function getLineRefereesNames() {
  let lineRefereesNames = [];
  const refs = await DB_utils.execQuery(`select name FROM dbo.referees WHERE role='line';`);
  refs.forEach(ref => {
    lineRefereesNames.push(ref.name);
  });
  return lineRefereesNames;
}

async function getSeason(seasonId) {
  const season = await axios.get(
    `https://soccer.sportmonks.com/api/v2.0/seasons/${seasonId}`,
    {
      params: {
        api_token: process.env.api_token,

      },
    }
  );

  return season;
}

async function getStage(stageId) {
  const stage = await axios.get(
    `https://soccer.sportmonks.com/api/v2.0/stages/${stageId}`,
    {
      params: {
        api_token: process.env.api_token,

      },
    }
  );
  return stage;
}

async function getAllMatches() {
  const res = await DB_utils.execQuery(`select * FROM dbo.matches`);
  let matches = [];
  for (let i = 0; i < res.length; i++) {
    let match = res[i];
    match.date = new Date(match.date).toJSON().slice(0, 10).replace(/-/g, '/');
    match.time = new Date(match.time).toJSON().slice(11, 19).replace(/-/g, '/');
    let mec = await matches_utils.getEventCalendar(match.id)//mec = match event calendar
    match.matchEventCalendar = mec;
  }
  // for (let match in res) {
  //   console.log(match.date)
  //   match.date = new Date(match.date).toJSON().slice(0, 10).replace(/-/g, '/');
  //   match.time = new Date(match.time).toJSON().slice(11, 19).replace(/-/g, '/');
  //   let mec = await matches_utils.getEventCalendar(match.id)//mec = match event calendar
  //   match.matchEventCalendar = mec;
  // }

  return res;
}

// returns data about the league from the API
async function getLeagueDetails() {
  const league = await axios.get(
    `https://soccer.sportmonks.com/api/v2.0/leagues/${LEAGUE_ID}`,
    {
      params: {
        include: "season",
        api_token: process.env.api_token,
      },
    }
  );
  if (league.data.data.current_stage_id == null) {
    return {
      leagueName: league.data.data.name,
      seasonName: league.data.data.season.data.name,
      stageName: "currently there is no stage available",
      current_season_id: league.data.data.current_season_id,
    };
  }
  const stage = await axios.get(
    `https://soccer.sportmonks.com/api/v2.0/stages/${league.data.data.current_stage_id}`,
    {
      params: {
        api_token: process.env.api_token,
      },
    }
  );
  return {
    leagueName: league.data.data.name,
    seasonName: league.data.data.season.data.name,
    stageName: stage.data.data.name,
    current_season_id: league.data.data.current_season_id,
  };
}

exports.getAllMatches = getAllMatches;
exports.getLeagueDetails = getLeagueDetails;
exports.getSeason = getSeason;
exports.getStage = getStage;
exports.addMatchEvent = addMatchEvent;
exports.getMainRefereesNames = getMainRefereesNames;
exports.getLineRefereesNames = getLineRefereesNames;
