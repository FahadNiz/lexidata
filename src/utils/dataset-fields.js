const VALID_FIELDS = new Set([
    "word",
    "part_of_speech",
    "pronunciations",
    "senses",
    "synsets",
    "definitions",
    "examples",
    "relations"
]);

const FIELD_PRESETS = {
    basic: [
        "word",
        "part_of_speech"
    ],

    meaning: [
        "word",
        "part_of_speech",
        "definitions",
        "examples"
    ],

    linguistic: [
        "word",
        "part_of_speech",
        "pronunciations",
        "senses",
        "synsets"
    ],

    all: [
        "word",
        "part_of_speech",
        "pronunciations",
        "senses",
        "synsets",
        "definitions",
        "examples",
        "relations"
    ]
};

function validateFields(fields) {
    if (fields === undefined) {
        return null;
    }

    if (typeof fields !== "string" || !fields.trim()) {
        return {
            code: "INVALID_FIELDS",
            message:
                "The 'fields' parameter must be a non-empty string."
        };
    }

    const requestedFields = fields
        .split(",")
        .map(field => field.trim().toLowerCase())
        .filter(Boolean);

    if (requestedFields.length === 0) {
        return {
            code: "INVALID_FIELDS",
            message:
                "The 'fields' parameter must contain at least one field."
        };
    }

    if (requestedFields.includes("all")) {
        return null;
    }

    for (const field of requestedFields) {
        if (!VALID_FIELDS.has(field)) {
            return {
                code: "INVALID_FIELD",
                message:
                    `Unknown dataset field '${field}'.`
            };
        }
    }

    return null;
}

function normalizeFields(fields) {
    if (fields === undefined) {
        return [...FIELD_PRESETS.basic];
    }

    const value = String(fields)
        .trim()
        .toLowerCase();

    if (value === "all") {
        return [...FIELD_PRESETS.all];
    }

    if (FIELD_PRESETS[value]) {
        return [...FIELD_PRESETS[value]];
    }

    const requestedFields = value
        .split(",")
        .map(field => field.trim())
        .filter(Boolean);

    const uniqueFields = [
        ...new Set(requestedFields)
    ];

    if (!uniqueFields.includes("word")) {
        uniqueFields.unshift("word");
    }

    return uniqueFields;
}

module.exports = {
    VALID_FIELDS,
    FIELD_PRESETS,
    validateFields,
    normalizeFields
};