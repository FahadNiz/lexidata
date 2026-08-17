const fs = require("fs");
const path = require("path");

const dataPath = path.join(
    __dirname,
    "..",
    "data",
    "raw",
    "english-wordnet"
);

const filePath = path.join(dataPath, "entries-c.json");

const data = JSON.parse(
    fs.readFileSync(filePath, "utf-8")
);

const word = "communicate";

console.log(`Data for: ${word}`);
console.dir(data[word], { depth: null });