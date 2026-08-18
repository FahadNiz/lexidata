const pool = require("../database/client");

async function findWord(word) {
    const normalizedWord = word
        .trim()
        .toLowerCase();

    const query = `
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

        WHERE w.normalized_word = $1

        ORDER BY
            s.part_of_speech,
            s.external_id,
            d.definition_order,
            e.example_order;
    `;

    const result = await pool.query(
        query,
        [normalizedWord]
    );

    if (result.rows.length === 0) {
        return null;
    }

    const firstRow = result.rows[0];

    const response = {
        word: firstRow.word,
        pronunciations: [],
        senses: []
    };

    const pronunciationSet = new Set();
    const senseMap = new Map();

    for (const row of result.rows) {
        if (row.pronunciation) {
            pronunciationSet.add(
                row.pronunciation
            );
        }

        if (!row.synset_id) {
            continue;
        }

        if (!senseMap.has(row.synset_id)) {
            senseMap.set(row.synset_id, {
                partOfSpeech:
                    row.part_of_speech,
                synset:
                    row.synset_external_id,
                definition:
                    row.definition,
                examples: []
            });
        }

        const sense = senseMap.get(
            row.synset_id
        );

        if (
            row.example &&
            !sense.examples.includes(row.example)
        ) {
            sense.examples.push(
                row.example
            );
        }
    }

    response.pronunciations =
        [...pronunciationSet];

    response.senses =
        [...senseMap.values()];

    return response;
}

module.exports = {
    findWord
};