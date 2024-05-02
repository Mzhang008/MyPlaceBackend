const HttpError = require("../models/http-error");
const jsonWebToken = require("jsonwebtoken");
require("dotenv").config();

// Verifies and adds token to userData property on request
module.exports = (req, res, next) => {
    //Handle options request sent by browser before actual request (default behavior for non GET methods)
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return next(new HttpError("Authentication failed.", 401));
    }
    const decodedToken = jsonWebToken.verify(token, 'secret_house_15243');
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    return next(new HttpError("Authentication failed.", 403));
  }
};
