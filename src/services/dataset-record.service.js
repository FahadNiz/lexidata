const pool = require("../database/client");

function createRecord(row) {
    return {
        word_id: row.word_id,
        word: row.word,
        part_of_speech: [],
        pronunciations: [],
        senses: []
    };
}

function addPartOfSpeech(record, partOfSpeech) {
    if (
        partOfSpeech &&
        !record.part_of_speech.includes(partOfSpeech)
    ) {
        record.part_of_speech.push(partOfSpeech);
    }
}

function addPronunciation(record, pronunciation) {
    if (
        pronunciation &&
        !record.pronunciations.includes(pronunciation)
    ) {
        record.pronunciations.push(pronunciation);
    }
}

function addSense(record, row) {
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
            definitions: [],
            examples: []
        };

        record.senses.push(sense);
    }
}

function addDefinition(record, row) {
    if (
        !row.synset_id ||
        !row.definition
    ) {
        return;
    }

    const sense = record.senses.find(
        item => item.synset_id === row.synset_id
    );

    if (
        sense &&
        !sense.definitions.includes(
            row.definition
        )
    ) {
        sense.definitions.push(
            row.definition
        );
    }
}

function addExample(record, row) {
    if (
        !row.synset_id ||
        !row.example
    ) {
        return;
    }

    const sense = record.senses.find(
        item => item.synset_id === row.synset_id
    );

    if (
        sense &&
        !sense.examples.includes(row.example)
    ) {
        sense.examples.push(row.example);
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

    /*
     * ---------------------------------------------------------
     * 1. Base words + senses
     * ---------------------------------------------------------
     */

    const wordSenseQuery = `
        SELECT
            words.id AS word_id,
            words.word,

            synsets.id AS synset_id,
            synsets.external_id AS synset_external_id,
            synsets.part_of_speech,
            synsets.ili_id

        FROM words

        LEFT JOIN word_senses
            ON word_senses.word_id = words.id

        LEFT JOIN synsets
            ON synsets.id = word_senses.synset_id

        WHERE words.id = ANY($1::bigint[])

        ORDER BY
            words.id,
            synsets.part_of_speech,
            synsets.external_id;
    `;

    const wordSenseResult =
        await pool.query(
            wordSenseQuery,
            [wordIds]
        );

    const recordMap = new Map();

    for (
        const row
        of wordSenseResult.rows
    ) {
        if (
            !recordMap.has(row.word_id)
        ) {
            recordMap.set(
                row.word_id,
                createRecord(row)
            );
        }

        const record =
            recordMap.get(row.word_id);

        addPartOfSpeech(
            record,
            row.part_of_speech
        );

        addSense(
            record,
            row
        );
    }

    /*
     * ---------------------------------------------------------
     * 2. Definitions
     * ---------------------------------------------------------
     */

    const definitionQuery = `
        SELECT
            word_senses.word_id,
            definitions.synset_id,
            definitions.definition,
            definitions.definition_order

        FROM word_senses

        JOIN definitions
            ON definitions.synset_id =
               word_senses.synset_id

        WHERE word_senses.word_id =
              ANY($1::bigint[])

        ORDER BY
            word_senses.word_id,
            definitions.synset_id,
            definitions.definition_order;
    `;

    const definitionResult =
        await pool.query(
            definitionQuery,
            [wordIds]
        );

    for (
        const row
        of definitionResult.rows
    ) {
        const record =
            recordMap.get(row.word_id);

        if (record) {
            addDefinition(
                record,
                row
            );
        }
    }

    /*
     * ---------------------------------------------------------
     * 3. Examples
     * ---------------------------------------------------------
     */

    const exampleQuery = `
        SELECT
            word_senses.word_id,
            examples.synset_id,
            examples.example,
            examples.example_order

        FROM word_senses

        JOIN examples
            ON examples.synset_id =
               word_senses.synset_id

        WHERE word_senses.word_id =
              ANY($1::bigint[])

        ORDER BY
            word_senses.word_id,
            examples.synset_id,
            examples.example_order;
    `;

    const exampleResult =
        await pool.query(
            exampleQuery,
            [wordIds]
        );

    for (
        const row
        of exampleResult.rows
    ) {
        const record =
            recordMap.get(row.word_id);

        if (record) {
            addExample(
                record,
                row
            );
        }
    }

    /*
     * ---------------------------------------------------------
     * 4. Pronunciations
     * ---------------------------------------------------------
     */

    const pronunciationQuery = `
        SELECT
            words.id AS word_id,
            pronunciations.pronunciation

        FROM words

        JOIN pronunciations
            ON pronunciations.word_id =
               words.id

        WHERE words.id =
              ANY($1::bigint[])

        ORDER BY
            words.id,
            pronunciations.pronunciation;
    `;

    const pronunciationResult =
        await pool.query(
            pronunciationQuery,
            [wordIds]
        );

    for (
        const row
        of pronunciationResult.rows
    ) {
        const record =
            recordMap.get(row.word_id);

        if (record) {
            addPronunciation(
                record,
                row.pronunciation
            );
        }
    }

    /*
     * ---------------------------------------------------------
     * Return records in the same order as wordIds
     * ---------------------------------------------------------
     */

    return wordIds
        .filter(id =>
            recordMap.has(id)
        )
        .map(id =>
            recordMap.get(id)
        );
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