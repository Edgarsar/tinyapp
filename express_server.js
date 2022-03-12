const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const PORT = 8080; // default port 8080
const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers')

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ["4f3981bb-3a1e-490e-9375-1c88120fd702"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  },
  er8dyr: {
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


// Use res.render to load up a "urls_index.ejs" view file
app.get("/urls", (req, res) => {
  const id = req.session.user_id;
  const templateVars = { urls: urlsForUser(id, urlDatabase), user: users[id] };
  res.render("urls_index", templateVars);
});

// use res.render to load up an "urls_new.ejs" view file
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  if (!users[userId]) {
    res.redirect("/login");
  } else {
    const templateVars = { user: users[userId] };
    res.render("urls_new", templateVars);
  }
});

// use res.render to load up an "urls_show.ejs" view file
app.get("/urls/:shortURL", (req, res) => {
  const id = req.params.shortURL;
  const templateVars = { shortURL: id, longURL: urlDatabase[id]["longURL"], user: users[req.session.user_id] };
  res.render("urls_show", templateVars);
});

//respond with a redirect
app.post("/urls", (req, res) => {
  const user = req.session.user_id;
  if (!users[user]) {
    res.send("Please login or register firts");
  } else {
    // generates a shortURL
    const shortURL = generateRandomString();
    // save the longURL and shortURL to the urlDatabase
    urlDatabase[shortURL] = { longURL: req.body.longURL, userID: user };
    res.redirect(`urls/${shortURL}`);
  }
});

// redirect any request to "/u/:shortURL" to its longURL
app.get("/u/:shortURL", (req, res) => {

  if (urlDatabase[req.params.shortURL]) {
    const { longURL } = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
  } else {
    res.send("The short URL does not exist");
  }
});

// POST route that updates a URL resource
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newURL = req.body.longURL;
  const userId = req.session.user_id;
  urlDatabase[id]["longURL"] = newURL;
  // Make sure that users can only edit their own URLs
  if (urlsForUser(userId, urlDatabase)[id]) {
    const templateVars = { urls: urlsForUser(userId, urlDatabase), user: users[userId] };
    res.render("urls_index", templateVars);
  } else {

    res.send("Not sufficient privileges");
  }
});

// GET route that takes us to the appropriate urls_show page
app.get("/urls/:shortURL/edit", (req, res) => {
  const id = req.params.shortURL;
  const userId = req.session.user_id;
  const templateVars = { shortURL: id, longURL: urlDatabase[id]["longURL"], user: users[userId] };
  res.render("urls_show", templateVars);
});

// POST route that removes a URL resource
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session.user_id;
  const deletetUrl = req.params.shortURL;

  // Make sure that users can only delete their own URLs
  if (urlsForUser(userId, urlDatabase)[deletetUrl]) {
    delete urlDatabase[deletetUrl];
    res.redirect("/urls");
  } else {
    res.send("Not sufficient privileges");
  }
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  // If email/password are empty, send back response with 400 status code
  if (!email || !password) {
    return res.status(400).send("Email and password cannot be blank");
  }
  // If an email that already exists in users object, send response back with 400 status code
  const newUser = getUserByEmail(email, users);

  if (newUser) {
    return res.status(400).send("A user with that email already exist");
  }
  // Register the new user
  const id = generateRandomString();
  const user = { id, email, hashedPassword };
  // add the new user to the user object
  users[id] = user;
  // set the session cookie
  req.session.user_id = id;
  res.redirect("/urls");

});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.useremail;
  const password = req.body.password;

  // The email and password should not be blank
  if (!email || !password) {
    res.send("Email or password cannot be blank");
  }
  // Find the user by email in the user database
  const user = getUserByEmail(email, users);
  //Checks email and user's password is correct
  if (user && bcrypt.compareSync(password, users[user.id].hashedPassword)) {
    // set the session cookie
    req.session.user_id = user.id;
    res.redirect("/urls");
  } else {
    res.send("Hey! the username with the specified email or password does not match!");
  }
});

// POST route that removes the cookies and redirects to the "/urls" page
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});