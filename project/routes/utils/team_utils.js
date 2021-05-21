const axios = require("axios");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
const players_utils = require("./players_utils");
const LEAGUE_ID = 271;

// async function getTeams(season_ID) {
//     let teams_unfilterd = await axios.get(`${api_domain}/teams/season/${season_ID}`,{ param: 
//         {
//             api_token: process.env.api_token,
//             include: "squad",   
//         }
//     }).data; 

//     let teamsArray = [];
//     for(team in teams_unfilterd){
//         let players = players_utils.getPlayersByTeam(team.id);
//         let teams_squads_name_logo = {
//             players: players,
//             name: team.name,
//             logoURL: team.logo_path,
//         };
//         //add prev matches
//         //add futrure matches
//     }








//     let promises = [];
//     players_ids_list.map((id) =>
//       promises.push(
//         axios.get(`${api_domain}/players/${id}`, {
//           params: {
//             api_token: process.env.api_token,
//             include: "team",
//           },
//         })
//       )
//     );
//     let players_info = await Promise.all(promises);
//     return extractRelevantPlayerData(players_info);
//   }



async function getTeamByID(team_ID) {
    let team = await axios.get(`${api_domain}/teams/${team_ID}`, {
        param:
        {
            api_token: process.env.api_token,
        }
    }).data;

    let players = players_utils.getPlayersByTeam(team_ID);
    let teamsDetails = {
        players: players,
        name: team.name,
        logoURL: team.logo_path,
        //add prev matches
        //add futrure matchesz
    };
}
