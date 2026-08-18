const express = require("express");
const wordController = require("../controllers/word.controller");

const router = express.Router();

router.get(
    "/:word",
    wordController.getWord
);

module.exports = router;