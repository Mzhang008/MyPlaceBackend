const express = require("express");
const usersControllers = require("../controllers/users-controllers");
const { check } = require("express-validator");
const fileUpload = require("../middleware/file-upload");

const router = express.Router();

router.post(
  "/signup",
  fileUpload.single("image"),
  [
    check("name").not().isEmpty(),
    check("email").isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersControllers.signUp
);

router.post(
  "/login",
  [check("email").isEmail(), check("password").isLength({ min: 6 })],
  usersControllers.login
);

router.get("/", usersControllers.getUsers);

module.exports = router;
