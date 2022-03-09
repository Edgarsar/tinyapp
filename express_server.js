const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

//generates a string of 6 random alphanumeric characters
const generateRandomString = () => {
  let randomString = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 6;
  for (let i = 0; i < length; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
// use res.render to load up a "urls_index.ejs" view file
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});
// use res.render to load up an "urls_new.ejs" view file
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"], };
  res.render("urls_new", templateVars);
});

// use res.render to load up an "urls_show.ejs" view file
app.get("/urls/:shortURL", (req, res) => {
  const id = req.params.shortURL;
  const templateVars = { shortURL: id, longURL: urlDatabase[id], username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});

//respond with a redirect
app.post("/urls", (req, res) => {
  // generates a shortURL
  const shortURL = generateRandomString();
  // save the longURL and shortURL to the urlDatabase
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`urls/${shortURL}`);
});

// redirect any request to "/u/:shortURL" to its longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// POST route that removes a URL resource
app.post("/urls/:shortURL/delete", (req, res) => {
  const deletetUrl = req.params.shortURL
  delete urlDatabase[deletetUrl];
  res.redirect("/urls");
});

// POST route that sets the cookies and redirects to the "/urls" page
app.post("/urls/login", (req, res) => {
  const body = req.body;
  res.cookie("username", body.username);
  res.redirect("/urls");
});

// POST route that removes the cookies and redirects to the "/urls" page
app.post("/urls/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

// POST route that updates a URL resource
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newURL = req.body.longURL;
  urlDatabase[id] = newURL;
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// GET route that takes us to the appropriate urls_show page
app.get("/urls/:shortURL/edit", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],  username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});