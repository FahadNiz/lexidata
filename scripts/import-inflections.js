const fs = require("fs");
const path = require("path");
const pool = require("../src/database/client");

const DATA_PATH = path.join(
    __dirname,
    "..",
    "data",
    "raw",
    "english-wordnet"
);

const BATCH_SIZE = 1000;

function normalize(str) {
    return str ? str.trim().toLowerCase() : "";
}

// Vowels and consonant check
const VOWELS = new Set(["a", "e", "i", "o", "u"]);
function isVowel(c) {
    return VOWELS.has(c);
}
function isConsonant(c) {
    return Boolean(c) && /[a-z]/.test(c) && !VOWELS.has(c);
}

// Check CVC (consonant-vowel-consonant ending, not ending in w, x, y)
function endsWithCVC(w) {
    if (w.length < 3) return false;
    const c1 = w[w.length - 3];
    const v = w[w.length - 2];
    const c2 = w[w.length - 1];
    return isConsonant(c1) && isVowel(v) && isConsonant(c2) && !["w", "x", "y"].includes(c2);
}

// Rule-based inflection generators
function generateNounPlurals(lemma) {
    const w = lemma.toLowerCase();
    if (w.includes(" ") || w.includes("-") || w.length < 2) return [];

    const forms = new Set();
    if (w.endsWith("s") || w.endsWith("x") || w.endsWith("z") || w.endsWith("ch") || w.endsWith("sh")) {
        forms.add(w + "es");
    } else if (w.endsWith("y") && isConsonant(w[w.length - 2])) {
        forms.add(w.slice(0, -1) + "ies");
    } else if (w.endsWith("fe") && (w.endsWith("life") || w.endsWith("knife") || w.endsWith("wife"))) {
        forms.add(w.slice(0, -2) + "ves");
    } else if (w.endsWith("f") && (w.endsWith("wolf") || w.endsWith("leaf") || w.endsWith("half") || w.endsWith("thief") || w.endsWith("calf") || w.endsWith("shelf") || w.endsWith("elf") || w.endsWith("scarf"))) {
        forms.add(w.slice(0, -1) + "ves");
    } else {
        forms.add(w + "s");
    }

    return [...forms].map(form => ({ inflected: form, type: "plural" }));
}

function generateVerbForms(lemma) {
    const w = lemma.toLowerCase();
    if (w.includes(" ") || w.includes("-") || w.length < 2) return [];

    const results = [];

    // 1. 3rd person singular present
    if (w.endsWith("s") || w.endsWith("x") || w.endsWith("z") || w.endsWith("ch") || w.endsWith("sh") || w.endsWith("o")) {
        results.push({ inflected: w + "es", type: "present_3rd_person" });
    } else if (w.endsWith("y") && isConsonant(w[w.length - 2])) {
        results.push({ inflected: w.slice(0, -1) + "ies", type: "present_3rd_person" });
    } else {
        results.push({ inflected: w + "s", type: "present_3rd_person" });
    }

    // 2. Past tense & past participle
    if (w.endsWith("e")) {
        results.push({ inflected: w + "d", type: "past_tense" });
        results.push({ inflected: w + "d", type: "past_participle" });
    } else if (w.endsWith("y") && isConsonant(w[w.length - 2])) {
        results.push({ inflected: w.slice(0, -1) + "ied", type: "past_tense" });
        results.push({ inflected: w.slice(0, -1) + "ied", type: "past_participle" });
    } else if (endsWithCVC(w) && w.length <= 5) {
        results.push({ inflected: w + w[w.length - 1] + "ed", type: "past_tense" });
        results.push({ inflected: w + w[w.length - 1] + "ed", type: "past_participle" });
    } else {
        results.push({ inflected: w + "ed", type: "past_tense" });
        results.push({ inflected: w + "ed", type: "past_participle" });
    }

    // 3. Present participle / gerund
    if (w.endsWith("ie")) {
        results.push({ inflected: w.slice(0, -2) + "ying", type: "present_participle" });
    } else if (w.endsWith("e") && !w.endsWith("ee") && !w.endsWith("oe") && !w.endsWith("ye")) {
        results.push({ inflected: w.slice(0, -1) + "ing", type: "present_participle" });
    } else if (endsWithCVC(w) && w.length <= 5) {
        results.push({ inflected: w + w[w.length - 1] + "ing", type: "present_participle" });
    } else {
        results.push({ inflected: w + "ing", type: "present_participle" });
    }

    return results;
}

function generateAdjectiveForms(lemma) {
    const w = lemma.toLowerCase();
    if (w.includes(" ") || w.includes("-") || w.length < 2 || w.length > 8) return [];

    const results = [];

    // Comparative
    if (w.endsWith("e")) {
        results.push({ inflected: w + "r", type: "comparative" });
        results.push({ inflected: w + "st", type: "superlative" });
    } else if (w.endsWith("y") && isConsonant(w[w.length - 2])) {
        results.push({ inflected: w.slice(0, -1) + "ier", type: "comparative" });
        results.push({ inflected: w.slice(0, -1) + "iest", type: "superlative" });
    } else if (endsWithCVC(w) && w.length <= 4) {
        results.push({ inflected: w + w[w.length - 1] + "er", type: "comparative" });
        results.push({ inflected: w + w[w.length - 1] + "est", type: "superlative" });
    } else if (w.length <= 5) {
        results.push({ inflected: w + "er", type: "comparative" });
        results.push({ inflected: w + "est", type: "superlative" });
    }

    return results;
}

// Load irregular forms from WordNet raw entries or packaged JSON
function loadIrregularForms() {
    const irregulars = new Map(); // lemma -> Array<{ inflected: string, type: string }>

    const packagedPath = path.join(__dirname, "..", "src", "data", "wordnet-irregulars.json");
    if (fs.existsSync(packagedPath)) {
        const json = JSON.parse(fs.readFileSync(packagedPath, "utf8"));
        for (const [lemma, list] of Object.entries(json)) {
            irregulars.set(lemma, list);
        }
        return irregulars;
    }

    if (!fs.existsSync(DATA_PATH)) {
        return irregulars;
    }

    const files = fs.readdirSync(DATA_PATH).filter(f => f.startsWith("entries-") && f.endsWith(".json"));
    for (const file of files) {
        const filePath = path.join(DATA_PATH, file);
        const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
        for (const [lemma, posEntries] of Object.entries(data)) {
            for (const [pos, entry] of Object.entries(posEntries)) {
                if (entry.form && Array.isArray(entry.form)) {
                    if (!irregulars.has(lemma)) {
                        irregulars.set(lemma, []);
                    }
                    for (const rawForm of entry.form) {
                        const form = rawForm.trim();
                        if (!form) continue;

                        let type = "irregular";
                        if (pos === "n") {
                            type = "plural";
                        } else if (pos === "v") {
                            if (form.endsWith("ing")) {
                                type = "present_participle";
                            } else if (form.endsWith("s") || form.endsWith("es")) {
                                type = "present_3rd_person";
                            } else {
                                type = "past_tense";
                            }
                        } else if (pos === "a" || pos === "s") {
                            if (form.endsWith("est") || form.endsWith("st")) {
                                type = "superlative";
                            } else if (form.endsWith("er") || form.endsWith("r")) {
                                type = "comparative";
                            }
                        }

                        irregulars.get(lemma).push({
                            inflected: form,
                            type
                        });
                    }
                }
            }
        }
    }

    return irregulars;
}

async function main() {
    console.log("Starting inflections generation and import...");
    const client = await pool.connect();
    const startTime = Date.now();

    try {
        // 1. Fetch all words with their parts of speech from database
        console.log("Fetching words and parts of speech from database...");
        const wordsRes = await client.query(`
            SELECT w.id, w.word, w.normalized_word, array_agg(DISTINCT s.part_of_speech) AS poses
            FROM words w
            LEFT JOIN word_senses ws ON ws.word_id = w.id
            LEFT JOIN synsets s ON s.id = ws.synset_id
            GROUP BY w.id, w.word, w.normalized_word;
        `);

        console.log(`Loaded ${wordsRes.rows.length} words from database.`);

        // 2. Load WordNet irregular exceptions
        console.log("Loading irregular forms from WordNet raw entries...");
        const irregularsMap = loadIrregularForms();
        console.log(`Found irregular mappings for ${irregularsMap.size} lemmas.`);

        // 3. Build inflections for all words
        const inflectionRows = [];
        const seen = new Set(); // dedup: `${word_id}:${inflected}:${type}`

        function addInflection(wordId, inflected, type) {
            const norm = normalize(inflected);
            if (!norm || norm.length === 0) return;
            const key = `${wordId}:${norm}:${type}`;
            if (seen.has(key)) return;
            seen.add(key);
            inflectionRows.push({
                wordId,
                inflectedWord: inflected,
                inflectionType: type,
                normalizedWord: norm
            });
        }

        for (const row of wordsRes.rows) {
            const { id: wordId, word } = row;
            const poses = (row.poses || []).filter(Boolean);

            // Add irregulars if any
            if (irregularsMap.has(word)) {
                for (const item of irregularsMap.get(word)) {
                    addInflection(wordId, item.inflected, item.type);
                }
            }

            // Generate regular forms per POS
            const isNoun = poses.includes("noun") || poses.length === 0;
            const isVerb = poses.includes("verb") || poses.length === 0;
            const isAdj = poses.includes("adjective") || poses.length === 0;

            if (isNoun) {
                const plurals = generateNounPlurals(word);
                for (const p of plurals) {
                    addInflection(wordId, p.inflected, p.type);
                }
            }

            if (isVerb) {
                const verbs = generateVerbForms(word);
                for (const v of verbs) {
                    addInflection(wordId, v.inflected, v.type);
                }
            }

            if (isAdj) {
                const adjs = generateAdjectiveForms(word);
                for (const a of adjs) {
                    addInflection(wordId, a.inflected, a.type);
                }
            }
        }

        console.log(`Generated ${inflectionRows.length} total inflection rows. Importing to database in batches...`);

        // 4. Batch insert into word_inflections
        for (let i = 0; i < inflectionRows.length; i += BATCH_SIZE) {
            const batch = inflectionRows.slice(i, i + BATCH_SIZE);
            const values = [];
            const parameters = [];

            batch.forEach((item, index) => {
                const offset = index * 4;
                values.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`);
                parameters.push(item.wordId, item.inflectedWord, item.inflectionType, item.normalizedWord);
            });

            await client.query(`
                INSERT INTO word_inflections (
                    word_id,
                    inflected_word,
                    inflection_type,
                    normalized_word
                )
                VALUES ${values.join(", ")}
                ON CONFLICT (word_id, inflected_word, inflection_type)
                DO NOTHING;
            `, parameters);

            if ((i + BATCH_SIZE) % 50000 < BATCH_SIZE || i + BATCH_SIZE >= inflectionRows.length) {
                console.log(`Inflections: ${Math.min(i + BATCH_SIZE, inflectionRows.length)} / ${inflectionRows.length}`);
            }
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`\nInflections imported successfully in ${duration} seconds.`);
    } catch (err) {
        console.error("Error importing inflections:", err);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    generateNounPlurals,
    generateVerbForms,
    generateAdjectiveForms,
    loadIrregularForms
};
