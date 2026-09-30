const express = require('express');
const router = express.Router();

const { getProfile } = require('../controllers/user.controllers');  
const protect = require('../helpers/auth.middleware');

router.get("/profile", protect, getProfile)

module.exports = router
