const fs = require("fs");
const path = require("path");

const dataPath = path.join(
    __dirname,
    "..",
    "data",
    "raw",
    "english-wordnet"
);

const synsetId = "00742582-v";

const files = fs
    .readdirSync(dataPath)
    .filter((file) => file.startsWith("verb."));

let found = false;

for (const file of files) {
    const filePath = path.join(dataPath, file);

    const data = JSON.parse(
        fs.readFileSync(filePath, "utf-8")
    );

    if (data[synsetId]) {
        console.log(`Found synset in: ${file}`);
        console.log(`Synset ID: ${synsetId}\n`);

        console.dir(data[synsetId], {
            depth: null
        });

        found = true;
        break;
    }
}

if (!found) {
    console.error(`Synset not found: ${synsetId}`);
    process.exit(1);
}