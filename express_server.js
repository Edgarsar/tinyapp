const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

const urlDatabase = {
  b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW"
    }
};

//Database
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// Email lookup function
const getUserByEmail = (email) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

// Generates a string of 6 random alphanumeric characters
const generateRandomString = () => {
  let randomString = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 6;
  for (let i = 0; i < length; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
};
// Check for the email and password in the Users Database
const authenticateUser = (email, password) => {
  for (let key in users) {
    if (users[key].email === email && users[key].password === password) {
      return users[key];
    }
  }
  return false;
};

// Use res.render to load up a "urls_index.ejs" view file
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});

// use res.render to load up an "urls_new.ejs" view file
app.get("/urls/new", (req, res) => {
  const user = req.cookies["user_id"];
  if (!users[user]) {
    res.redirect("/login");
  } else {
    const templateVars = { user: users[req.cookies["user_id"]] };
    res.render("urls_new", templateVars);
  }
});

// use res.render to load up an "urls_show.ejs" view file
app.get("/urls/:shortURL", (req, res) => {
  const id = req.params.shortURL;
  const templateVars = { shortURL: id, longURL: urlDatabase[id]["longURL"], user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

//respond with a redirect
app.post("/urls", (req, res) => {
  const user = req.cookies["user_id"];
  if (!users[user]) {
    res.send("Please login or register firts");
  } else {
  // generates a shortURL
  const shortURL = generateRandomString();
  // save the longURL and shortURL to the urlDatabase
  urlDatabase[shortURL] = {longURL :req.body.longURL,userID:req.cookies["user_id"]};
  res.redirect(`urls/${shortURL}`);
  }
});

// redirect any request to "/u/:shortURL" to its longURL
app.get("/u/:shortURL", (req, res) => {
  
  if(urlDatabase[req.params.shortURL]){
  const {longURL} = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
  } else{
    res.send("The short URL does not exist")
  }
});

// POST route that removes a URL resource
app.post("/urls/:shortURL/delete", (req, res) => {
  const deletetUrl = req.params.shortURL;
  delete urlDatabase[deletetUrl];
  res.redirect("/urls");
});

// POST route that updates a URL resource
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newURL = req.body.longURL;
  urlDatabase[id]["longURL"] = newURL;
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});

// GET route that takes us to the appropriate urls_show page
app.get("/urls/:shortURL/edit", (req, res) => {
  const id = req.params.shortURL
  const templateVars = { shortURL: id, longURL: urlDatabase[id]["longURL"], user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };

  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // 1. if email/password are empty, send back response with 400 status code
  if (!email || !password) {
    return res.status(400).send("Email and password cannot be blank");
  }
  // If an email that already exists in users object, send response back with 400 status code
  const newUser = getUserByEmail(email);
  if (newUser) {
    return res.status(400).send("A user with that email already exist");
  }
  // Register the new user
  const id = generateRandomString();
  const user = { id, email, password };
  // add the new user to the user object
  users[id] = user;
  res.cookie("user_id", id);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.useremail;
  const password = req.body.password;

  // The email and password should not be blank
  if (!email || !password) {
    res.send("Email or password cannot be blank");
  }
  // Check for the email and password in the Users Database
  const user = authenticateUser(email, password);

  if (user) {
    // User was returned
    res.cookie('user_id', user.id);
    res.redirect("/urls");
  } else {
    res.send("Hey! the username with the specified email or password does not match!");
  }
});

// POST route that removes the cookies and redirects to the "/urls" page
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});