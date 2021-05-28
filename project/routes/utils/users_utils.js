const DButils = require("./DButils");

async function markPlayerAsFavorite(user_id, player_id) {
  await DButils.execQuery(
    `insert into FavoritePlayers values ('${user_id}',${player_id})`
  );
}

async function markMatchAsFavorite(user_id, match_id) {
  await DButils.execQuery(
    `insert into FavoriteMatches values ('${user_id}',${match_id})`
  );
}

async function getFavoritePlayers(user_id) {
  const player_ids = await DButils.execQuery(
    `select player_id from FavoritePlayers where user_id='${user_id}'`
  );
  return player_ids;
}

async function getFavoriteMatches(user_id) {
  const match_ids = await DButils.execQuery(
    `select match_id from FavoriteMatches where user_id='${user_id}'`
  );
  return match_ids;
}
async function getFavoriteTeams(user_id) {
  const team_ids = await DButils.execQuery(
    `select team_id from FavoriteTeams where user_id='${user_id}'`
  );
  return team_ids;
}

exports.getFavoriteMatches = getFavoriteMatches;
exports.markPlayerAsFavorite = markPlayerAsFavorite;
exports.markMatchAsFavorite = markMatchAsFavorite;
exports.getFavoritePlayers = getFavoritePlayers;
exports.getFavoriteTeams = getFavoriteTeams;
