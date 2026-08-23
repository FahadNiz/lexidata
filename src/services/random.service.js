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
    maxLength,
    startsWith,
    endsWith,
    contains
} = {}) {
    const filters = normalizeFilters({
        limit,
        page: 1,
        partOfSpeech,
        minLength,
        maxLength,
        startsWith,
        endsWith,
        contains
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
        maxLength: filters.maxLength,
        startsWith: filters.startsWith,
        endsWith: filters.endsWith,
        contains: filters.contains
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
                filters.maxLength ?? null,
            startsWith:
                filters.startsWith || null,
            endsWith:
                filters.endsWith || null,
            contains:
                filters.contains || null
        }
    };
}

module.exports = {
    getRandomWords
};