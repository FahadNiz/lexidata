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

    // A preset can be used directly.
    if (
        requestedFields.length === 1 &&
        Object.prototype.hasOwnProperty.call(
            FIELD_PRESETS,
            requestedFields[0]
        )
    ) {
        return null;
    }

    // Otherwise every requested value must be a real field.
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
        return FIELD_PRESETS.basic;
    }

    const requestedFields = fields
        .split(",")
        .map(field => field.trim().toLowerCase())
        .filter(Boolean);

    // Preset
    if (
        requestedFields.length === 1 &&
        Object.prototype.hasOwnProperty.call(
            FIELD_PRESETS,
            requestedFields[0]
        )
    ) {
        return [...FIELD_PRESETS[requestedFields[0]]];
    }

    // Explicit fields
    const normalized = [
        ...new Set(requestedFields)
    ];

    // Word is always included.
    if (!normalized.includes("word")) {
        normalized.unshift("word");
    }

    return normalized;
}

module.exports = {
    VALID_FIELDS,
    FIELD_PRESETS,
    validateFields,
    normalizeFields
};