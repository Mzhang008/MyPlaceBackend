const express = require('express');
const usersControllers = require('../controllers/users-controllers');
const { check } = require("express-validator");
const router = express.Router();

router.post('/signup', [
    check("name").not().isEmpty(),
    check("email").isEmail(),
    check("password").isLength({ min: 6 })
], usersControllers.signUp);

router.post('/login', [
    check("email").isEmail(),
    check("password").isLength({ min: 6 })
], usersControllers.login);

router.get('/', usersControllers.getUsers);

module.exports = router;