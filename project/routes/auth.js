var express = require("express");
var router = express.Router();
const DButils = require("../routes/utils/DButils");
const bcrypt = require("bcryptjs");
const { select } = require("async");
let maxUsersInSys = 25000;
router.post("/Register", async (req, res, next) => {
  try {
    // parameters exists
    // valid parameters
    // username exists
    const users = await DButils.execQuery(
      "SELECT username FROM dbo.users"
    );


    if (users.find((x) => x.username === req.body.username))
      throw { status: 409, message: "Username taken" };


    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let country = req.body.country;
    let email = req.body.email;
    let profilePic = req.body.profilePic;
    let role = req.body.role;
    //hash the password
    let hash_password = bcrypt.hashSync(
      req.body.password,
      parseInt(process.env.bcrypt_saltRounds)
    );
    req.body.password = hash_password;
    //generate random user_id
    let random_user_id = Math.floor(Math.random() * maxUsersInSys);
    let userId = await DButils.execQuery(
      `select user_id from dbo.users where user_id = '${random_user_id}'`
    );
    while (userId.length !== 0) {
      random_user_id = Math.floor(Math.random() * maxUsersInSys);
      userId = await DButils.execQuery(
        `select user_id from dbo.users where user_id = '${random_user_id}'`
      );
    }
    // add the new username
    await DButils.execQuery(
      `INSERT INTO dbo.users (user_id, username, firstName, lastName, country, password, email, profilePic,role) VALUES
       ('${random_user_id}','${req.body.username}','${firstName}','${lastName}','${country}', '${hash_password}','${email}','${profilePic}','${role}');`
    );
    res.status(201).send("user created");
  } catch (error) {
    next(error);
  }
});

router.post("/Login", async (req, res, next) => {
  try {
    const user = (
      await DButils.execQuery(
        `SELECT * FROM dbo.users WHERE username = '${req.body.username}'`
      )
    )[0];
    // user = user[0];
    console.log(user);

    // check that username exists & the password is correct
    if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
      throw { status: 401, message: "Username or Password incorrect" };
    }

    // Set cookie
    req.session.user_id = user.user_id;

    // return cookie
    res.status(200).send("login succeeded");
  } catch (error) {
    next(error);
  }
});

router.post("/Logout", function (req, res) {
  req.session.reset(); // reset the session info --> send cookie when  req.session == undefined!!
  res.status(200).send({ success: true, message: "logout succeeded" });
});

module.exports = router;