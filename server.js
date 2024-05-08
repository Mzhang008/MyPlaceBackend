const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");


const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

require("dotenv").config();


const app = express();

app.use(bodyParser.json());

app.use("/uploads/images", express.static(path.join("uploads", "images")));

//following code accomplishes basically the same as npm-cors pkg, app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/api/places", placesRoutes);

app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route", 404);
  return next(error);
});

//error handler
app.use((error, req, res, next) => {
  // if (req.file) {
  //   fs.unlink(req.file.path, (err) => {
  //     return next(err);
  //   }); //multer adds req.file path param
  // }
  if (res.headerSent) {
    return next(error);
  }
  res
    .status(error.code || 500)
    .json({ message: error.message || "An unknown error has occurred" });
});

// app.use("/", (req, res, next) => {
//   res.setHeader("Content-Type", "text/html");
//   res.end(`<a href="/api/places/">Test</a>`);
// });

//establish connection to database first, then backend server

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_URL}/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then(() => {
    app.listen(5000);
    console.log("started");
  })
  .catch((err) => {
    console.log(`ERROR ${err}`);
  });
