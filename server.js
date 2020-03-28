const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 3000;

//Axios
const axios = require("axios");
const cheerio = require("cheerio");

//Models
const db = require("./models");

//Express
const app = express();

//Middleware:Morgan
app.use(logger("dev"));

//JsonParse:ReqBody
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());

//Public
app.use(express.static("public"));

//MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI);

//NewsScraper
app.get("/scrape", async function (req, {send}) {

  const { data } = await axios.get("https://www.nytimes.com/");
  const $ = cheerio.load(data);

  $("header h2").each( async function (i, element) {
    const result = {
      title: $(this).children("a").text(),
      link: $(this).children("a").attr("href")
    };
    try {
      const dbArticle = await db.Article.create(result);
      console.log({dbArticle})
    }
    catch(err){
      console.log(err)
    }
    send("Scrape Complete");
  });
});

app.get("/articles", async function (req, res) {
  try {
    const dbArticle = await db.Article.find({});
    res.json(dbArticle);
  }
  catch(err){ res.json(err) }
});

app.get("/articles/:id", async function (req, res) {
  try {
    const dbArticle = await db.Article.findOne({_id: req.params.id}).populate("note")
    res.json(dbArticle);
  }
  catch(err){
    res.json(err);
  }
});

app.post("/articles/:id", function (req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function (dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({
        _id: req.params.id
      }, {
        note: dbNote._id
      }, {
        new: true
      });
    })
    .then(function (dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});