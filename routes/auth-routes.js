const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const bcrypt = require("bcryptjs");

//SIGNUP
router.post("/signup", async (req, res) => {
  const { password, role, gender, username } = req.body;

  //check if username and password are filled in
  if (username === "" || password === "") {
    res.status(400).json({ message: "Fill username and password" });
    return;
  }

  //check for password strength
  const myRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (myRegex.test(password) === false) {
    res.status(400).json({ message: "Password is too weak" });
    return;
  }

  //check if username already exists
  const user = await User.findOne({ username });
  if (user !== null) {
    res.status(400).json({ message: "Username already exists" });
    return;
  }

  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  const hashedPassword = bcrypt.hashSync(password, salt);
  //creates user
  const newUser = await User.create({
    role,
    gender,
    username,
    password: hashedPassword,
  });

  res.status(200).json(newUser); //envia resposta do servidor para o client
});

//LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: "Fill username and password" });
    return;
  }

  const user = await User.findOne({ username });
  if (!user) {
    res.status(401).json({ message: "Invalid login" });
    return;
  }

  //Check for password
  if (bcrypt.compareSync(password, user.password)) {
    //Passwords match

    //Initializing the session with the current user
    req.session.currentUser = user;
    res.status(200).json(user);
  } else {
    //Passwords don't match
    res.status(401).json({ message: "Invalid password" });
  }
});

//LOGOUT
router.post("/logout", (req, res) => {
  req.session.destroy();
  res.status(200).json({ message: "user logged out" });
});
//checks if the session is still on course
router.get("/loggedin", (req, res) => {
  if (req.session.currentUser) {
    res.status(200).json(req.session.currentUser);
    return;
  } else {
    res.status(401).json({ message: "user logged out" });
  }
});

/*
router.get("/allUsers", async (req, res) => {
  try {
    const allUsers = await User.find();
    res.status(200).json(allUsers);
  } catch (e) {
    res.status(500).json({ message: `error occurred ${e}` });
  }
});

*/

//finds different users
router.get("/users", async (req, res) => {
  //gets the id of the logged in user
  const userId = req.session.currentUser._id;
  console.log("user id", userId);
  //find the user with that id in the database
  const theUser = await User.findById(userId);

  let allUsers;

  if (theUser.role === "coach" && theUser.gender === "male") {
    allUsers = await User.find({ role: "athlete", gender: "male" }); //shows users that are students
    //console.log("all coaches", allUsers)
  }
  if (theUser.role === "coach" && theUser.gender === "female") {
    allUsers = await User.find({ role: "athlete", gender: "female" }); //shows users that are coaches
    //console.log("athletes", allUsers);
    // if its an object(theUser) no need for curly braces
  }
  //renders all users with the conditions above
  res.status(200).json({ allUsers });
});

//click like button so we can save the favorite on the user profile
router.post("/user/:userId/addfavorite", async (req, res) => {
  // console.log("favorites", req.session.currentUser.favorites)
  //1. Get user by id -> req.params.id
  const userDetails = await User.findById(req.params.userId);
  // ?
  await User.findByIdAndUpdate(req.session.currentUser._id, {
    $push: { favorites: userDetails },
  });
  //resposta do servidor para o cliente
  res.status(200).json({ message: "favorite added succesfully" });
});

// get list of favorites
router.get("/favorites", async (req, res) => {
    try {
      const user = await User.findById(
        req.session.currentUser._id
      ).populate("favorites");
      res.status(200).json(user.favorites);
      console.log("got favorites");
      console.log(user.favorites);
    } catch (e) {
      res.status(500).json({ message: `error occurred ${e}` });
    }
});

 
//User.findById(req.session.currentUser._id).populate('favorites')

//get user by id when click on user
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json(user);
  } catch (e) {
    res.status(500).json({ message: `error occurred ${e}` });
  }
});

module.exports = router;
