const pool = require("../database/client");

function createRecord(row) {
    return {
        word: row.word,
        part_of_speech: [],
        pronunciations: [],
        senses: []
    };
}

function addRowToRecord(record, row) {
    if (row.part_of_speech) {
        if (
            !record.part_of_speech.includes(
                row.part_of_speech
            )
        ) {
            record.part_of_speech.push(
                row.part_of_speech
            );
        }
    }

    if (row.pronunciation) {
        if (
            !record.pronunciations.includes(
                row.pronunciation
            )
        ) {
            record.pronunciations.push(
                row.pronunciation
            );
        }
    }

    if (!row.synset_id) {
        return;
    }

    let sense = record.senses.find(
        item => item.synset_id === row.synset_id
    );

    if (!sense) {
        sense = {
            synset_id: row.synset_id,
            synset: row.synset_external_id,
            ili_id: row.ili_id,
            part_of_speech:
                row.part_of_speech,
            definition:
                row.definition || null,
            examples: []
        };

        record.senses.push(sense);
    }

    if (
        row.example &&
        !sense.examples.includes(row.example)
    ) {
        sense.examples.push(
            row.example
        );
    }
}

async function getWordRecords({
    wordIds
} = {}) {
    if (
        !Array.isArray(wordIds) ||
        wordIds.length === 0
    ) {
        return [];
    }

    const query = `
        SELECT
            words.id AS word_id,
            words.word,

            synsets.id AS synset_id,
            synsets.external_id AS synset_external_id,
            synsets.part_of_speech,
            synsets.ili_id,

            definitions.definition,
            definitions.definition_order,

            examples.example,
            examples.example_order,

            pronunciations.pronunciation

        FROM words

        LEFT JOIN word_senses
            ON word_senses.word_id = words.id

        LEFT JOIN synsets
            ON synsets.id = word_senses.synset_id

        LEFT JOIN definitions
            ON definitions.synset_id = synsets.id

        LEFT JOIN examples
            ON examples.synset_id = synsets.id

        LEFT JOIN pronunciations
            ON pronunciations.word_id = words.id

        WHERE words.id = ANY($1::bigint[])

        ORDER BY
            words.id,
            synsets.part_of_speech,
            synsets.external_id,
            definitions.definition_order,
            examples.example_order;
    `;

    const result = await pool.query(
        query,
        [wordIds]
    );

    const recordMap = new Map();

    for (const row of result.rows) {
        if (!recordMap.has(row.word_id)) {
            recordMap.set(
                row.word_id,
                createRecord(row)
            );
        }

        addRowToRecord(
            recordMap.get(row.word_id),
            row
        );
    }

    return wordIds
        .filter(id => recordMap.has(id))
        .map(id => recordMap.get(id));
}

async function getWordRecord(wordId) {
    const records =
        await getWordRecords({
            wordIds: [wordId]
        });

    return records[0] || null;
}

module.exports = {
    getWordRecord,
    getWordRecords
};