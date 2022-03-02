const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// respond with "Hello!" when a GET request is made to the homepage
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
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});