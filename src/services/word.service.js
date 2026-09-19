const pool = require("../database/client");

function getCandidateLemmas(w) {
    const candidates = new Set();

    // Plurals / 3rd person singular present
    if (w.endsWith("ies") && w.length > 4) {
        candidates.add(w.slice(0, -3) + "y");
    }
    if (w.endsWith("es") && w.length > 3) {
        candidates.add(w.slice(0, -2));
        candidates.add(w.slice(0, -1)); // e.g. closes -> close
    }
    if (w.endsWith("s") && !w.endsWith("ss") && w.length > 2) {
        candidates.add(w.slice(0, -1));
    }
    if (w.endsWith("ves") && w.length > 4) {
        candidates.add(w.slice(0, -3) + "f");
        candidates.add(w.slice(0, -3) + "fe");
    }

    // Past tense / past participle
    if (w.endsWith("ied") && w.length > 4) {
        candidates.add(w.slice(0, -3) + "y");
    }
    if (w.endsWith("ed") && w.length > 3) {
        candidates.add(w.slice(0, -2)); // walked -> walk
        candidates.add(w.slice(0, -1)); // communicated -> communicate
        // Doubled consonant e.g. stopped -> stop, planned -> plan
        if (w.length > 4 && w[w.length - 3] === w[w.length - 4]) {
            candidates.add(w.slice(0, -3));
        }
    }

    // Present participle / gerund
    if (w.endsWith("ying") && w.length > 5) {
        candidates.add(w.slice(0, -4) + "ie");
    }
    if (w.endsWith("ing") && w.length > 4) {
        candidates.add(w.slice(0, -3)); // walking -> walk
        candidates.add(w.slice(0, -3) + "e"); // communicating -> communicate, making -> make
        // Doubled consonant e.g. running -> run, swimming -> swim
        if (w.length > 5 && w[w.length - 4] === w[w.length - 5]) {
            candidates.add(w.slice(0, -4));
        }
    }

    // Comparatives / superlatives
    if (w.endsWith("ier") && w.length > 4) {
        candidates.add(w.slice(0, -3) + "y");
    }
    if (w.endsWith("er") && w.length > 3) {
        candidates.add(w.slice(0, -2));
        candidates.add(w.slice(0, -1)); // larger -> large
        if (w.length > 4 && w[w.length - 3] === w[w.length - 4]) {
            candidates.add(w.slice(0, -3)); // bigger -> big
        }
    }
    if (w.endsWith("iest") && w.length > 5) {
        candidates.add(w.slice(0, -4) + "y");
    }
    if (w.endsWith("est") && w.length > 4) {
        candidates.add(w.slice(0, -3));
        candidates.add(w.slice(0, -2)); // largest -> large
        if (w.length > 5 && w[w.length - 4] === w[w.length - 5]) {
            candidates.add(w.slice(0, -4)); // biggest -> big
        }
    }

    return [...candidates].filter((c) => c && c !== w);
}

async function resolveWordTarget(rawWord, normalizedWord) {
    // 1. Direct match in words table
    const directRes = await pool.query(
        `SELECT id, word, normalized_word
         FROM words
         WHERE normalized_word = $1
         ORDER BY (CASE WHEN word = $2 THEN 0 WHEN word = lower(word) THEN 1 ELSE 2 END), id
         LIMIT 1;`,
        [normalizedWord, rawWord]
    );

    if (directRes.rows.length > 0) {
        return {
            wordId: directRes.rows[0].id,
            word: directRes.rows[0].word,
            normalizedWord: directRes.rows[0].normalized_word,
            matchedInflection: null
        };
    }

    // 2. Lookup in word_inflections table
    const inflectionRes = await pool.query(
        `SELECT w.id, w.word, w.normalized_word, wi.inflected_word, wi.inflection_type
         FROM word_inflections wi
         JOIN words w ON w.id = wi.word_id
         WHERE wi.normalized_word = $1
         ORDER BY (CASE WHEN w.word = lower(w.word) THEN 0 ELSE 1 END), w.id
         LIMIT 1;`,
        [normalizedWord]
    );

    if (inflectionRes.rows.length > 0) {
        const row = inflectionRes.rows[0];
        return {
            wordId: row.id,
            word: row.word,
            normalizedWord: row.normalized_word,
            matchedInflection: {
                type: row.inflection_type,
                form: row.inflected_word
            }
        };
    }

    // 3. Algorithmic lemmatizer fallback
    const candidates = getCandidateLemmas(normalizedWord);
    if (candidates.length > 0) {
        const lemmaRes = await pool.query(
            `SELECT id, word, normalized_word
             FROM words
             WHERE normalized_word = ANY($1::text[])
             ORDER BY
                (CASE WHEN word = lower(word) THEN 0 ELSE 1 END),
                array_position($1::text[], normalized_word)
             LIMIT 1;`,
            [candidates]
        );

        if (lemmaRes.rows.length > 0) {
            const row = lemmaRes.rows[0];
            return {
                wordId: row.id,
                word: row.word,
                normalizedWord: row.normalized_word,
                matchedInflection: {
                    type: "inflection",
                    form: normalizedWord
                }
            };
        }
    }

    return null;
}

async function findWord(word) {
    const rawWord = word.trim();
    const normalizedWord = rawWord.toLowerCase();

    const target = await resolveWordTarget(rawWord, normalizedWord);
    if (!target) {
        return null;
    }

    const sensesQuery = `
        SELECT
            w.id AS word_id,
            w.word,
            w.normalized_word,

            s.id AS synset_id,
            s.external_id AS synset_external_id,
            s.part_of_speech,
            s.ili_id,

            d.definition,
            d.definition_order,

            e.example,
            e.example_order,

            p.pronunciation

        FROM words w

        LEFT JOIN word_senses ws
            ON ws.word_id = w.id

        LEFT JOIN synsets s
            ON s.id = ws.synset_id

        LEFT JOIN definitions d
            ON d.synset_id = s.id

        LEFT JOIN examples e
            ON e.synset_id = s.id

        LEFT JOIN pronunciations p
            ON p.word_id = w.id

        WHERE w.id = $1

        ORDER BY
            s.part_of_speech,
            s.external_id,
            d.definition_order,
            e.example_order;
    `;

    const inflectionsQuery = `
        SELECT inflected_word, inflection_type
        FROM word_inflections
        WHERE word_id = $1
        ORDER BY inflection_type, inflected_word;
    `;

    const [sensesResult, inflectionsResult] = await Promise.all([
        pool.query(sensesQuery, [target.wordId]),
        pool.query(inflectionsQuery, [target.wordId])
    ]);

    if (sensesResult.rows.length === 0) {
        return null;
    }

    const firstRow = sensesResult.rows[0];

    const response = {
        word: firstRow.word,
        pronunciations: [],
        inflections: [],
        senses: []
    };

    if (target.matchedInflection) {
        response.searchedWord = rawWord;
        response.matchedInflection = target.matchedInflection;
    }

    const pronunciationSet = new Set();
    const senseMap = new Map();

    for (const row of sensesResult.rows) {
        if (row.pronunciation) {
            pronunciationSet.add(row.pronunciation);
        }

        if (!row.synset_id) {
            continue;
        }

        if (!senseMap.has(row.synset_id)) {
            senseMap.set(row.synset_id, {
                partOfSpeech: row.part_of_speech,
                synset: row.synset_external_id,
                definition: row.definition,
                examples: []
            });
        }

        const sense = senseMap.get(row.synset_id);

        if (row.example && !sense.examples.includes(row.example)) {
            sense.examples.push(row.example);
        }
    }

    // Format inflections
    const inflectionMap = new Map();
    for (const row of inflectionsResult.rows) {
        const key = `${row.inflection_type}:${row.inflected_word}`;
        if (!inflectionMap.has(key)) {
            inflectionMap.set(key, {
                type: row.inflection_type,
                form: row.inflected_word
            });
        }
    }

    response.pronunciations = [...pronunciationSet];
    response.inflections = [...inflectionMap.values()];
    response.senses = [...senseMap.values()];

    return response;
}

module.exports = {
    findWord,
    resolveWordTarget,
    getCandidateLemmas
};
