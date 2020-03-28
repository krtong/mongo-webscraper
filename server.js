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


//NewsScraper routes
app.get("/scrape", async function (req, {send}) {

  const { data } = await axios.get("https://www.nytimes.com/");
  const $ = cheerio.load(data);

  $("header h2").each( async function (i, element) {

    const result = {
      title: $(this).children("a").text(),
      link: $(this).children("a").attr("href")
    }

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


app.post("/articles/:id", function(req, res) {
  db.Note.create(req.body)
    .then(function(dbNote) {
     return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});



//npm start server
app.listen(PORT, function () {
  console.log(`App running on port ${PORT}! 🌵`);
});