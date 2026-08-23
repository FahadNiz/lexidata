const pool = require("../database/client");

const DEFAULT_LIMIT = 1;
const MAX_LIMIT = 100;

async function getRandomWords(limit = DEFAULT_LIMIT) {
    const parsedLimit = Number(limit);

    const safeLimit =
        Number.isInteger(parsedLimit) &&
        parsedLimit > 0
            ? Math.min(parsedLimit, MAX_LIMIT)
            : DEFAULT_LIMIT;

    const query = `
        SELECT
            word
        FROM words
        ORDER BY RANDOM()
        LIMIT $1;
    `;

    const result = await pool.query(
        query,
        [safeLimit]
    );

    return {
        words: result.rows.map(
            (row) => row.word
        ),
        count: result.rows.length
    };
}

module.exports = {
    getRandomWords
};