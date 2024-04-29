const HttpError = require("../models/http-error");

const { validationResult } = require("express-validator");
const UserModel = require("../models/user");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await UserModel.find({}, "-password");
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
  console.log(req.file);
  const newUser = new UserModel({
    name,
    email,
    password,
    image: req.file.path,
    places: [],
  });

  try {
    await newUser.save();
  } catch (err) {
    const error = new HttpError("Sign up failed, please try again", 500);
    return next(error);
  }

  res.status(201).json({ user: newUser.toObject({ getters: true }) }); //201: create new data
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
  if (!hasUser || hasUser.password !== password || hasUser.email !== email) {
    return next(
      new HttpError(
        "No user with matching email or password found, please try again.",
        401
      )
    );
  }
  res.json({ message: "Logged in", user: hasUser.toObject({ getters: true }) });
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;
