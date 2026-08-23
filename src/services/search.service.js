const pool = require("../database/client");

const {
    DEFAULT_LIMIT,
    MAX_LIMIT,
    normalizeFilters
} = require("../utils/word-filters");

async function searchWords({
    query,
    limit = DEFAULT_LIMIT,
    page = 1
}) {
    const normalizedQuery =
        query.trim().toLowerCase();

    const filters = normalizeFilters({
        limit,
        page
    });

    const safeLimit = Math.min(
        filters.limit,
        MAX_LIMIT
    );

    const offset =
        (filters.page - 1) * safeLimit;

    const searchPattern =
        `${normalizedQuery}%`;

    const countQuery = `
        SELECT COUNT(*) AS total
        FROM words
        WHERE normalized_word LIKE $1;
    `;

    const wordsQuery = `
        SELECT
            word,
            normalized_word
        FROM words
        WHERE normalized_word LIKE $1
        ORDER BY normalized_word
        LIMIT $2
        OFFSET $3;
    `;

    const [
        countResult,
        wordsResult
    ] = await Promise.all([
        pool.query(
            countQuery,
            [searchPattern]
        ),
        pool.query(
            wordsQuery,
            [
                searchPattern,
                safeLimit,
                offset
            ]
        )
    ]);

    const total =
        Number(countResult.rows[0].total);

    const totalPages =
        total === 0
            ? 0
            : Math.ceil(
                total / safeLimit
            );

    return {
        query: normalizedQuery,
        results: wordsResult.rows.map(
            (row) => row.word
        ),
        pagination: {
            page: filters.page,
            limit: safeLimit,
            total,
            totalPages
        }
    };
}

module.exports = {
    searchWords
};