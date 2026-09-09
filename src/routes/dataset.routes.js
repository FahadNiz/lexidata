const express = require("express");
const datasetController = require("../controllers/dataset.controller");

const router = express.Router();

router.get("/", datasetController.getDataset);

module.exports = router;