const express = require("express");
const app = express();
const shortId = require("shortid");
const mongoose = require("mongoose");
const createHttpError = require("http-errors");
const path = require("path");
const ShortUrl = require("./models/url.model.js");

const PORT = 3000;

//making folder static  public to static
app.use(express.static(path.join(__dirname, "public")));
//applying middle wares
app.use(express.json());
//for any json formate

app.use(express.urlencoded({ extended: false }));

const db =
  "mongodb+srv://mohsin:Ali@1199@cluster0.toyhdoy.mongodb.net/url-shortner?retryWrites=true&w=majority";

//  "mongodb://mohsin:Ali@1199@ac-ypdylw5-shard-00-00.toyhdoy.mongodb.net:27017,ac-ypdylw5-shard-00-01.toyhdoy.mongodb.net:27017,ac-ypdylw5-shard-00-02.toyhdoy.mongodb.net:27017/?ssl=true&replicaSet=atlas-bdt19k-shard-0&authSource=admin&retryWrites=true&w=majority";

//  "mongodb+srv://mohsin:Ali@1199@cluster0.toyhdoy.mongodb.net/?retryWrites=true&w=majority";

// "mongodb+srv://mohsin:Ali@1199@cluster0.toyhdoy.mongodb.net/?retryWrites=true&w=majority";

//mongodb atlas connection setup
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCeateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("connected to mognodb atlas ..."))
  .catch((error) => console.log("Error in  connecting mognodb atlas ..."));
app.set("view engine", "ejs");

//middle wares
//rendering the ejs file UI
app.get("/", async (req, res) => {
  res.render("index");
});

//url which will be posted after conversion  basically a url would be sent and this would
//get redirected to a shorter url

app.post("/", async (req, res) => {
  //   /*
  //   it's a post end point which at the very first recieves the url from the input and validates if url is provide
  // if not then it throws exception that url is not provided*/

  try {
    //if url is not given
    const { url } = req.body;
    if (!url) {
      throw createHttpError.BadRequest(
        "Please provide a valid url you cannot send a blank as link"
      );
    }
    /*if given then this pieces will execute*/

    const urlExists = await ShortUrl.findOne({ url: url });
    if (urlExists) {
      res.render("index", {
        shortUrl: `${req.headers.host}/${urlExists.shortId}`,
      });
      return;
    }

    //if doesnt exist
    const shortUrl = new ShortUrl({ url: url, shortId: shortId.generate() });
    const result = await shortUrl.save();
    console.log(result);
    res.render("index", {
      short_url: `${req.headers.host}/${result.shortId}`,
    });
  } catch (error) {
    //next(error);
  }
});

//handler for not found
app.use((req, res, next) => {
  next(createHttpError.NotFound());
});

//if any internal server error occoured then....
app.use((err, req, res, next) => {
  //internal server err
  res.status(err.status || 500);
  res.render("index", { error: err.message });
});

//for redirection from short url to long string of url
/*if any short url exists then this would redirect using that link 
else if not then this would simpy say that such url does not exist here in the database*/
app.get("/:shortId", async (req, res) => {
  try {
    const shortid = req.params;
    const result = await shortUrl.findOne({ shortId });
    if (!result) {
      throw createHttpError.NotFound("short url does not exist");
    }
    res.redirect(result.url);
  } catch (error) {
    console.log(error);
  }
});

app.listen(3000, () => console.log(`listening on port port ${PORT}`));
