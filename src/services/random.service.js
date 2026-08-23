const pool = require("../database/client");

const DEFAULT_LIMIT = 1;
const MAX_LIMIT = 100;

async function getRandomWords({
    limit = DEFAULT_LIMIT,
    partOfSpeech,
    minLength,
    maxLength
} = {}) {
    const parsedLimit = Number(limit);

    const safeLimit =
        Number.isInteger(parsedLimit) &&
        parsedLimit > 0
            ? Math.min(parsedLimit, MAX_LIMIT)
            : DEFAULT_LIMIT;

    const values = [safeLimit];
    const conditions = [];

    if (partOfSpeech) {
        values.push(partOfSpeech);

        conditions.push(
            `EXISTS (
                SELECT 1
                FROM word_senses ws
                JOIN synsets s
                    ON s.id = ws.synset_id
                WHERE ws.word_id = words.id
                  AND s.part_of_speech = $${values.length}
            )`
        );
    }

    if (minLength !== undefined) {
        values.push(Number(minLength));

        conditions.push(
            `char_length(word) >= $${values.length}`
        );
    }

    if (maxLength !== undefined) {
        values.push(Number(maxLength));

        conditions.push(
            `char_length(word) <= $${values.length}`
        );
    }

    const whereClause =
        conditions.length > 0
            ? `WHERE ${conditions.join("\nAND ")}`
            : "";

    const query = `
        SELECT
            word
        FROM words
        ${whereClause}
        ORDER BY RANDOM()
        LIMIT $1;
    `;

    const result = await pool.query(
        query,
        values
    );

    return {
        words: result.rows.map(
            (row) => row.word
        ),
        count: result.rows.length,
        filters: {
            partOfSpeech:
                partOfSpeech || null,
            minLength:
                minLength !== undefined
                    ? Number(minLength)
                    : null,
            maxLength:
                maxLength !== undefined
                    ? Number(maxLength)
                    : null
        }
    };
}

module.exports = {
    getRandomWords
};