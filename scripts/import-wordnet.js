const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(
    __dirname,
    "..",
    "data",
    "raw",
    "english-wordnet"
);

const PROCESSED_PATH = path.join(
    __dirname,
    "..",
    "data",
    "processed"
);

function main() {
    console.log("Lexicon WordNet importer");
    console.log("------------------------");
    console.log(`Source: ${DATA_PATH}`);
    console.log(`Output: ${PROCESSED_PATH}`);
}

main();