const HttpError = require("../models/http-error");
const { v4: uuid } = require("uuid");
const { validationResult } = require("express-validator");

const DUMMY_USERS = [
  {
    id: "u1",
    name: "Max",
    email: "test@test.com",
    password: "test",
  },
  {
    id: "u2",
    name: "Max2",
    email: "test2@test.com",
    password: "test2",
  },
];

const getUsers = (req, res, next) => {
  res.json({ users: DUMMY_USERS });
};

const signUp = (req, res, next) => {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    console.log(validation);
    throw new HttpError("Invalid inputs passed, please check data", 422);
  }
  const { name, email, password } = req.body;
  const hasUser = DUMMY_USERS.find((u) => u.email === email);
  if (hasUser) {
    throw new HttpError("User already exists", 422);
  }
  const newUser = {
    id: uuid(),
    name,
    email,
    password,
  };
  DUMMY_USERS.push(newUser);
  console.log(DUMMY_USERS);
  res.status(201).json({ user: newUser }); //201: create new data
};

const login = (req, res, next) => {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    console.log(validation);
    throw new HttpError("Invalid inputs passed, please check data", 422);
  }

  const { email, password } = req.body;

  const identifiedUser = DUMMY_USERS.find((user) => {
    return user.email === email;
  });
  if (!identifiedUser || identifiedUser.password !== password) {
    throw new HttpError("No user with matching email or password found", 404);
  }

  res.json({ message: "Logged in" });
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;
