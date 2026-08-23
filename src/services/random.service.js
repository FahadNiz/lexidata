const pool = require("../database/client");

const {
    DEFAULT_LIMIT,
    MAX_LIMIT,
    normalizeFilters,
    buildWordFilters
} = require("../utils/word-filters");

async function getRandomWords({
    limit = DEFAULT_LIMIT,
    partOfSpeech,
    minLength,
    maxLength
} = {}) {
    const filters = normalizeFilters({
        limit,
        page: 1,
        partOfSpeech,
        minLength,
        maxLength
    });

    const safeLimit = Math.min(
        filters.limit,
        MAX_LIMIT
    );

    const {
        values,
        whereClause
    } = buildWordFilters({
        partOfSpeech: filters.partOfSpeech,
        minLength: filters.minLength,
        maxLength: filters.maxLength
    });

    const limitParameter = values.length + 1;

    values.push(safeLimit);

    const query = `
        SELECT
            words.word
        FROM words
        ${whereClause}
        ORDER BY RANDOM()
        LIMIT $${limitParameter};
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
                filters.partOfSpeech || null,
            minLength:
                filters.minLength ?? null,
            maxLength:
                filters.maxLength ?? null
        }
    };
}

module.exports = {
    getRandomWords
};