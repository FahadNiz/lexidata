const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(
    __dirname,
    "..",
    "data",
    "raw",
    "english-wordnet"
);

function readJsonFile(filePath) {
    return JSON.parse(
        fs.readFileSync(filePath, "utf-8")
    );
}

function normalizeWord(word) {
    return word.trim().toLowerCase();
}

function main() {
    const files = fs
        .readdirSync(DATA_PATH)
        .filter(
            (file) =>
                file.startsWith("entries-") &&
                file.endsWith(".json")
        );

    const normalizedWords = new Map();

    let totalEntries = 0;

    for (const file of files) {
        const filePath = path.join(DATA_PATH, file);
        const data = readJsonFile(filePath);

        for (const word of Object.keys(data)) {
            totalEntries++;

            const normalized = normalizeWord(word);

            if (!normalizedWords.has(normalized)) {
                normalizedWords.set(normalized, []);
            }

            normalizedWords.get(normalized).push(word);
        }
    }

    const duplicates = [...normalizedWords.entries()]
        .filter(([, words]) => words.length > 1);

    console.log("WordNet validation");
    console.log("------------------");
    console.log(`Total entries: ${totalEntries}`);
    console.log(`Unique normalized words: ${normalizedWords.size}`);
    console.log(`Normalized duplicate groups: ${duplicates.length}`);

    console.log("\nFirst 30 duplicate groups:");

    duplicates
        .slice(0, 30)
        .forEach(([normalized, words]) => {
            console.log(`\n${normalized}`);
            console.log(`  ${words.join(" | ")}`);
        });
}

main();