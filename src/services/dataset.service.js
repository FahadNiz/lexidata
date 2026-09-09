const pool = require("../database/client");
const {
    normalizeFilters,
    buildWordFilters
} = require("../utils/word-filters");
const {
    getWordRecords
} = require("./dataset-record.service");

async function getDataset({
    limit,
    page,
    partOfSpeech,
    minLength,
    maxLength,
    startsWith,
    endsWith,
    contains
} = {}) {
    const filters = normalizeFilters({
        limit,
        page,
        partOfSpeech,
        minLength,
        maxLength,
        startsWith,
        endsWith,
        contains
    });

    const {
        values: filterValues,
        whereClause
    } = buildWordFilters({
        partOfSpeech: filters.partOfSpeech,
        minLength: filters.minLength,
        maxLength: filters.maxLength,
        startsWith: filters.startsWith,
        endsWith: filters.endsWith,
        contains: filters.contains
    });

    const countQuery = `
        SELECT COUNT(*)::integer AS total
        FROM words
        ${whereClause};
    `;

    const countResult = await pool.query(
        countQuery,
        filterValues
    );

    const total = countResult.rows[0].total;

    const offset =
        (filters.page - 1) * filters.limit;

    const dataValues = [
        ...filterValues,
        filters.limit,
        offset
    ];

    const limitPlaceholder =
        `$${filterValues.length + 1}`;

    const offsetPlaceholder =
        `$${filterValues.length + 2}`;

    const dataQuery = `
        SELECT
            words.id,
            words.word
        FROM words
        ${whereClause}
        ORDER BY
            words.normalized_word,
            words.id
        LIMIT ${limitPlaceholder}
        OFFSET ${offsetPlaceholder};
    `;

    const dataResult = await pool.query(
        dataQuery,
        dataValues
    );

    const wordIds = dataResult.rows.map(
        row => row.id
    );

    const records = await getWordRecords({
        wordIds
    });

    const recordMap = new Map(
        records.map(record => [
            record.word,
            record
        ])
    );

    const data = dataResult.rows.map(row => {
        return (
            recordMap.get(row.word) || {
                word: row.word,
                part_of_speech: [],
                pronunciations: [],
                senses: []
            }
        );
    });

    return {
        data,
        pagination: {
            page: filters.page,
            limit: filters.limit,
            offset,
            total,
            totalPages:
                Math.ceil(
                    total / filters.limit
                )
        }
    };
}

async function getDatasetBatch({
    limit = 1000,
    offset = 0,
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

    const {
        values: filterValues,
        whereClause
    } = buildWordFilters({
        partOfSpeech: filters.partOfSpeech,
        minLength: filters.minLength,
        maxLength: filters.maxLength,
        startsWith: filters.startsWith,
        endsWith: filters.endsWith,
        contains: filters.contains
    });

    const values = [
        ...filterValues,
        filters.limit,
        offset
    ];

    const limitPlaceholder =
        `$${filterValues.length + 1}`;

    const offsetPlaceholder =
        `$${filterValues.length + 2}`;

    const query = `
        SELECT
            words.id,
            words.word
        FROM words
        ${whereClause}
        ORDER BY
            words.normalized_word,
            words.id
        LIMIT ${limitPlaceholder}
        OFFSET ${offsetPlaceholder};
    `;

    const result = await pool.query(
        query,
        values
    );

    return result.rows;
}

module.exports = {
    getDataset,
    getDatasetBatch
};