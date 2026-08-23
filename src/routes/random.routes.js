const express = require("express");
const randomController = require("../controllers/random.controller");

const router = express.Router();

router.get(
    "/",
    randomController.getRandomWords
);

module.exports = router;