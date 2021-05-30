var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const players_utils = require("./utils/players_utils");
const league_utils = require("./utils/league_utils");
const team_utils = require("./utils/team_utils");
const { default: axios } = require("axios");



router.get("/preview/:playerId", async (req, res) => {
    try {
        let playerId = req.params.playerId;
        let player = await players_utils.getPlayerPreviewInfo(playerId);
        res.status(200).send(player);
    }
    catch (error) {
        next(error);
    }
});


router.get("/fullDetails/:playerId", async (req, res) => {
    try {
        let playerId = req.params.playerId;
        let player = await players_utils.getPlayerFullInfo(playerId);
        res.status(200).send(player);
    }
    catch (error) {
        next(error);
    }
});


router.get("/", async (req, res) => {
    try {
        let leagueDetails = await league_utils.getLeagueDetails();
        console.log(leagueDetails);
        let season_ID = leagueDetails.current_season_id;
        console.log("Season id: ", season_ID);
        let teamsArray = await team_utils.getTeams(season_ID);
        let playersArray = [];
        for (let i = 0; i < teamsArray.length; i++) {
            let team = teamsArray[i];
            for (let j = 0; j < team.players.length; j++) {
                let previewPlayer = {
                    fullName: team.players[j].fullname,
                    acviteTeam: team.players[j].activeTeam,
                    priflePicURL: team.players[j].profilePicURL,
                    position: team.players[j].position,
                };
                playersArray.push(previewPlayer);

            }
        }
        res.status(200).send(playersArray);
    }
    catch (error) {
        next(error);
    }
});

module.exports = router;
