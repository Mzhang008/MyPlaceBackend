const HttpError = require("../models/http-error");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const UserModel = require("../models/user");
const jsonWebToken = require("jsonwebtoken");
require("dotenv").config();

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await UserModel.find({}, "-password"); // exclude password in sent data
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not fetch users",
      500
    );
    return next(error);
  }
  if (!users || users.length === 0) {
    return next(new HttpError("Could not find any users", 404));
  }

  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signUp = async (req, res, next) => {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    return next(new HttpError("Invalid inputs passed, please check data", 422));
  }
  const { name, email, password } = req.body;
  let hasUser;
  try {
    hasUser = await UserModel.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("Sign up failed, please try again."), 500);
  }
  if (hasUser) {
    return next(new HttpError("User already exists", 422));
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(new HttpError("Could not create user, please try again.", 500));
  }

  const newUser = new UserModel({
    name,
    email,
    password: hashedPassword,
    image: req.file.path,
    places: [],
  });

  try {
    await newUser.save();
  } catch (err) {
    const error = new HttpError("Sign up failed, please try again", 500);
    return next(error);
  }
  let token;
  try {
    token = jsonWebToken.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.encKey,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError("Login failed, please try again", 500));
  }

  res.status(201).json({ userId: newUser.id, email: newUser.email, token: token}); //201: create new data
};

const login = async (req, res, next) => {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    return next(new HttpError("Invalid inputs passed, please check data", 422));
  }
  const { email, password } = req.body;
  let hasUser;
  try {
    hasUser = await UserModel.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("Login failed, please try again.", 500));
  }
  if (!hasUser) {
    return next(
      new HttpError(
        "No user with matching email or password found, please try again.",
        401
      )
    );
  }
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, hasUser.password);
  } catch (err) {
    return next(new HttpError("Could not login, please try again.", 500));
  }
  if (!isValidPassword) {
    return next(
      new HttpError(
        "No user with matching email or password found, please try again.",
        401
      )
    );
  }

  let token;
  try {
    token = jsonWebToken.sign(
      { userId: hasUser.id, email: hasUser.email },
      process.env.encKey,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError("Login failed, please try again", 500));
  }

  res.json({ userId: hasUser.id, email: hasUser.email, token: token });
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;
