const express = require("express");
const searchController = require("../controllers/search.controller");

const router = express.Router();

router.get(
    "/",
    searchController.searchWords
);

module.exports = router;