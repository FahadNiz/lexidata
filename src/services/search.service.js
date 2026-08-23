const pool = require("../database/client");

const {
    DEFAULT_LIMIT,
    MAX_LIMIT,
    normalizeFilters,
    buildWordFilters
} = require("../utils/word-filters");

async function searchWords({
    query,
    limit = DEFAULT_LIMIT,
    page = 1,
    partOfSpeech,
    minLength,
    maxLength,
    startsWith,
    endsWith,
    contains,
    match
}) {
    const normalizedQuery =
        query.trim().toLowerCase();

    const filters = normalizeFilters({
        limit,
        page,
        partOfSpeech,
        minLength,
        maxLength,
        startsWith,
        endsWith,
        contains,
        match
    });

    const safeLimit = Math.min(
        filters.limit,
        MAX_LIMIT
    );

    const offset =
        (filters.page - 1) * safeLimit;

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

    let searchCondition;
    let searchValue;

    if (filters.match === "exact") {
        searchCondition =
            "words.normalized_word = $" +
            (values.length + 1);

        searchValue = normalizedQuery;
    } else if (filters.match === "contains") {
        searchCondition =
            "words.normalized_word LIKE $" +
            (values.length + 1);

        searchValue =
            `%${normalizedQuery}%`;
    } else {
        searchCondition =
            "words.normalized_word LIKE $" +
            (values.length + 1);

        searchValue =
            `${normalizedQuery}%`;
    }

    values.push(searchValue);

    const combinedWhereClause =
        whereClause
            ? `${whereClause}\nAND ${searchCondition}`
            : `WHERE ${searchCondition}`;

    const countQuery = `
        SELECT COUNT(*) AS total
        FROM words
        ${combinedWhereClause};
    `;

    const limitParameter =
        values.length + 1;

    const offsetParameter =
        values.length + 2;

    const wordsQuery = `
        SELECT
            words.word,
            words.normalized_word
        FROM words
        ${combinedWhereClause}
        ORDER BY words.normalized_word
        LIMIT $${limitParameter}
        OFFSET $${offsetParameter};
    `;

    const queryValues = [
        ...values,
        safeLimit,
        offset
    ];

    const [
        countResult,
        wordsResult
    ] = await Promise.all([
        pool.query(
            countQuery,
            values
        ),
        pool.query(
            wordsQuery,
            queryValues
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
        },
        filters: {
            match: filters.match,
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
    searchWords
};