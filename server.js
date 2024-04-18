const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

//following code accomplishes basically the same as npm-cors app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
})

app.use("/api/places", placesRoutes);

app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route", 404);
  next(error);
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res
    .status(error.code || 500)
    .json({ message: error.message || "An unknown error has occurred" });
});

//app.use() triggers on all requests
app.use("/", (req, res, next) => {
  res.setHeader("Content-Type", "text/html");
  res.end(`<a href="/api/places/">Test</a>`);
});
//establish connection to database first, then backend server
mongoose
    .connect("mongodb+srv://test:test123@cluster0.jkcknh2.mongodb.net/places?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => {
        app.listen(5000);
        console.log("started");
    })
    .catch(err => {
        console.log(`ERROR ${err}`);
    });
