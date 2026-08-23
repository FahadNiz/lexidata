const pool = require("../database/client");

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

async function searchWords({
    query,
    limit = DEFAULT_LIMIT,
    page = 1
}) {
    const normalizedQuery = query
        .trim()
        .toLowerCase();

    const parsedLimit = Number(limit);
    const parsedPage = Number(page);

    const safeLimit =
        Number.isInteger(parsedLimit) &&
        parsedLimit > 0
            ? Math.min(parsedLimit, MAX_LIMIT)
            : DEFAULT_LIMIT;

    const safePage =
        Number.isInteger(parsedPage) &&
        parsedPage > 0
            ? parsedPage
            : 1;

    const offset =
        (safePage - 1) * safeLimit;

    const searchPattern = `${normalizedQuery}%`;

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

    const [countResult, wordsResult] =
        await Promise.all([
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
            : Math.ceil(total / safeLimit);

    return {
        query: normalizedQuery,
        results: wordsResult.rows.map(
            (row) => row.word
        ),
        pagination: {
            page: safePage,
            limit: safeLimit,
            total,
            totalPages
        }
    };
}

module.exports = {
    searchWords
};