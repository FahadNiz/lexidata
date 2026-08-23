const VALID_PARTS_OF_SPEECH = new Set([
    "noun",
    "verb",
    "adjective",
    "adverb"
]);

const VALID_MATCH_MODES = new Set([
    "prefix",
    "contains",
    "exact"
]);

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function validateFilters({
    limit,
    page,
    partOfSpeech,
    minLength,
    maxLength,
    startsWith,
    endsWith,
    contains,
    match
} = {}) {
    if (
        limit !== undefined &&
        (
            !/^\d+$/.test(String(limit)) ||
            Number(limit) < 1 ||
            Number(limit) > MAX_LIMIT
        )
    ) {
        return {
            code: "INVALID_LIMIT",
            message:
                "The 'limit' parameter must be an integer between 1 and 100."
        };
    }

    if (
        page !== undefined &&
        (
            !/^\d+$/.test(String(page)) ||
            Number(page) < 1
        )
    ) {
        return {
            code: "INVALID_PAGE",
            message:
                "The 'page' parameter must be a positive integer."
        };
    }

    if (
        partOfSpeech !== undefined &&
        !VALID_PARTS_OF_SPEECH.has(
            String(partOfSpeech).toLowerCase()
        )
    ) {
        return {
            code: "INVALID_PART_OF_SPEECH",
            message:
                "The 'partOfSpeech' parameter must be one of: noun, verb, adjective, adverb."
        };
    }

    if (
        minLength !== undefined &&
        (
            !/^\d+$/.test(String(minLength)) ||
            Number(minLength) < 1
        )
    ) {
        return {
            code: "INVALID_MIN_LENGTH",
            message:
                "The 'minLength' parameter must be a positive integer."
        };
    }

    if (
        maxLength !== undefined &&
        (
            !/^\d+$/.test(String(maxLength)) ||
            Number(maxLength) < 1
        )
    ) {
        return {
            code: "INVALID_MAX_LENGTH",
            message:
                "The 'maxLength' parameter must be a positive integer."
        };
    }

    if (
        minLength !== undefined &&
        maxLength !== undefined &&
        Number(minLength) > Number(maxLength)
    ) {
        return {
            code: "INVALID_LENGTH_RANGE",
            message:
                "The 'minLength' parameter cannot be greater than 'maxLength'."
        };
    }

    for (const [name, value] of [
        ["startsWith", startsWith],
        ["endsWith", endsWith],
        ["contains", contains]
    ]) {
        if (
            value !== undefined &&
            (
                typeof value !== "string" ||
                !value.trim()
            )
        ) {
            return {
                code: `INVALID_${name.toUpperCase()}`,
                message:
                    `The '${name}' parameter must be a non-empty string.`
            };
        }
    }

    if (
        match !== undefined &&
        !VALID_MATCH_MODES.has(
            String(match).toLowerCase()
        )
    ) {
        return {
            code: "INVALID_MATCH",
            message:
                "The 'match' parameter must be one of: prefix, contains, exact."
        };
    }

    return null;
}

function normalizeFilters({
    limit,
    page,
    partOfSpeech,
    minLength,
    maxLength,
    startsWith,
    endsWith,
    contains,
    match
} = {}) {
    return {
        limit:
            limit !== undefined
                ? Number(limit)
                : DEFAULT_LIMIT,

        page:
            page !== undefined
                ? Number(page)
                : 1,

        partOfSpeech:
            partOfSpeech !== undefined
                ? String(partOfSpeech).toLowerCase()
                : undefined,

        minLength:
            minLength !== undefined
                ? Number(minLength)
                : undefined,

        maxLength:
            maxLength !== undefined
                ? Number(maxLength)
                : undefined,

        startsWith:
            startsWith !== undefined
                ? String(startsWith).trim().toLowerCase()
                : undefined,

        endsWith:
            endsWith !== undefined
                ? String(endsWith).trim().toLowerCase()
                : undefined,

        contains:
            contains !== undefined
                ? String(contains).trim().toLowerCase()
                : undefined,

        match:
            match !== undefined
                ? String(match).toLowerCase()
                : "prefix"
    };
}

function buildWordFilters({
    partOfSpeech,
    minLength,
    maxLength,
    startsWith,
    endsWith,
    contains
} = {}) {
    const values = [];
    const conditions = [];

    if (partOfSpeech !== undefined) {
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
        values.push(minLength);

        conditions.push(
            `char_length(words.word) >= $${values.length}`
        );
    }

    if (maxLength !== undefined) {
        values.push(maxLength);

        conditions.push(
            `char_length(words.word) <= $${values.length}`
        );
    }

    if (startsWith !== undefined) {
        values.push(`${startsWith}%`);

        conditions.push(
            `words.normalized_word LIKE $${values.length}`
        );
    }

    if (endsWith !== undefined) {
        values.push(`%${endsWith}`);

        conditions.push(
            `words.normalized_word LIKE $${values.length}`
        );
    }

    if (contains !== undefined) {
        values.push(`%${contains}%`);

        conditions.push(
            `words.normalized_word LIKE $${values.length}`
        );
    }

    return {
        values,
        whereClause:
            conditions.length > 0
                ? `WHERE ${conditions.join("\nAND ")}`
                : ""
    };
}

module.exports = {
    DEFAULT_LIMIT,
    MAX_LIMIT,
    VALID_PARTS_OF_SPEECH,
    VALID_MATCH_MODES,
    validateFilters,
    normalizeFilters,
    buildWordFilters
};