const express = require('express');
const bodyParser = require('body-parser');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');


const app = express();

app.use(bodyParser.json());

app.use('/api/places', placesRoutes);

app.use('/api/users', usersRoutes);

app.use((req, res, next) => {
    const error = new HttpError("Could not find this route", 404);
    next(error);
});

app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500)
        .json({ message: error.message || "An unknown error has occurred"});
})

//app.use() triggers on all requests
app.use('/', (req, res, next) => {
    res.setHeader("Content-Type", "text/html");
    res.end(`<a href="/api/places/">Test</a>`);
})

app.listen(5000);
console.log("started");


