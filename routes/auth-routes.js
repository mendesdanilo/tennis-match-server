const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const bcrypt = require("bcryptjs");

router.post("/signup", async (req, res) => {
  const { username, password, role, name, lastname, gender } = req.body;

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
  const newUser = await User.create({
    username,
    password: hashedPassword,
    role,
    name,
    lastname,
    gender,
  });
  res.status(200).json(newUser);
});

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
    res.status(401).json({ message: "Invalid login" });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy();
  res.status(200).json({ message: "user logged out" });
});

router.get("/loggedin", (req, res) => {
  if (req.session.currentUser) {
    res.status(200).json(req.session.currentUser);
    return;
  } else {
    res.status(401).json({ message: "user logged out" });
  }
});

router.get("/users", async (req, res) => {
  const userId = req.session.currentUser._id; //get the id of the logged in user
  //console.log("user id", userId);
  const theUser = await User.findById(userId); //find the user with that id in the database
  //console.log(theUser.role);

  let allUsers;

  if (theUser.role === "coach") {
    allUsers = await User.find({ role: "student" }); //shows users that are students
    //console.log("all coaches", allUsers)
  } else {
    allUsers = await User.find({ role: "coach" }); //shows users that are coaches
    //console.log("students", allUsers);
    // if its an object(theUser) no need for curly braces
  }
  res.status(200).json({ allUsers }); //renders
});

//click like button so we can save the favorite on the user profile
router.post("/user/:userId/addfavorite", async (req, res) => {
  //require login ?
  // console.log("favorites", req.session.currentUser.favorites)

  //1. Get user by id -> req.params.id
  const userDetails = await User.findById(req.params.userId);
  //2. Obter current logged user

  // if
  await User.findByIdAndUpdate(req.session.currentUser._id, {
    $push: { favorites: userDetails },
  });

  res.status(200).json("/favorites");
});

module.exports = router;
