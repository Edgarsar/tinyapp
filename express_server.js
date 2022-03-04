const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
// use res.render to load up an "urls_new.ejs" view file
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
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


/* // respond with "Hello!" when a GET request is made to the homepage
app.get("/", (req, res) => {
  res.send("Hello!");
});

// respond with "JSON string urlDatabase object" when a GET request is made to the homepage
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// respond with "html code" when a GET request is made to the homepage
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
}); */


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});