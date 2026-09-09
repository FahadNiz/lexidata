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

const VALID_PRESETS = new Set(
    Object.keys(FIELD_PRESETS)
);

function validateFields(fields) {
    if (
        fields === undefined ||
        fields === null ||
        fields === ""
    ) {
        return null;
    }

    if (
        typeof fields !== "string"
    ) {
        return {
            code: "INVALID_FIELDS",
            message:
                "The 'fields' parameter must be a comma-separated string."
        };
    }

    const requestedFields =
        fields
            .split(",")
            .map(field => field.trim().toLowerCase())
            .filter(Boolean);

    if (
        requestedFields.length === 0
    ) {
        return {
            code: "INVALID_FIELDS",
            message:
                "The 'fields' parameter must contain at least one field."
        };
    }

    /*
     * A preset must be used by itself.
     *
     * Examples:
     *
     * fields=basic
     * fields=meaning
     * fields=linguistic
     * fields=all
     *
     * Or explicit fields:
     *
     * fields=word,definitions,examples
     */

    if (
        requestedFields.length === 1 &&
        VALID_PRESETS.has(
            requestedFields[0]
        )
    ) {
        return null;
    }

    for (
        const field
        of requestedFields
    ) {
        if (
            !VALID_FIELDS.has(field)
        ) {
            return {
                code: "INVALID_FIELD",
                message:
                    `Unknown dataset field '${field}'. Valid fields are: ${[
                        ...VALID_FIELDS
                    ].join(", ")}.`
            };
        }
    }

    return null;
}

function normalizeFields(fields) {
    if (
        fields === undefined ||
        fields === null ||
        fields === ""
    ) {
        return FIELD_PRESETS.basic;
    }

    const requestedFields =
        String(fields)
            .split(",")
            .map(field => field.trim().toLowerCase())
            .filter(Boolean);

    if (
        requestedFields.length === 1 &&
        FIELD_PRESETS[
            requestedFields[0]
        ]
    ) {
        return [
            ...FIELD_PRESETS[
                requestedFields[0]
            ]
        ];
    }

    const normalized = [];

    for (
        const field
        of requestedFields
    ) {
        if (
            !normalized.includes(field)
        ) {
            normalized.push(field);
        }
    }

    /*
     * 'word' is always included because
     * the dataset is word-centric.
     */

    if (
        !normalized.includes("word")
    ) {
        normalized.unshift("word");
    }

    return normalized;
}

function selectFields(record, fields) {
    const selected = {};

    for (
        const field
        of fields
    ) {
        switch (field) {
            case "word":
                selected.word =
                    record.word;
                break;

            case "part_of_speech":
                selected.part_of_speech =
                    record.part_of_speech || [];
                break;

            case "pronunciations":
                selected.pronunciations =
                    record.pronunciations || [];
                break;

            case "senses":
                selected.senses =
                    record.senses || [];
                break;

            case "synsets":
                selected.synsets = [
                    ...new Map(
                        (record.senses || [])
                            .map(sense => [
                                sense.synset,
                                {
                                    synset:
                                        sense.synset,
                                    ili_id:
                                        sense.ili_id,
                                    part_of_speech:
                                        sense.part_of_speech
                                }
                            ])
                    ).values()
                ];
                break;

            case "definitions":
                selected.definitions = [
                    ...new Set(
                        (record.senses || [])
                            .flatMap(
                                sense =>
                                    sense.definitions || []
                            )
                            .filter(
                                definition =>
                                    definition !== null &&
                                    definition !== undefined
                            )
                    )
                ];
                break;

            case "examples":
                selected.examples = [
                    ...new Set(
                        (record.senses || [])
                            .flatMap(
                                sense =>
                                    sense.examples || []
                            )
                            .filter(
                                example =>
                                    example !== null &&
                                    example !== undefined
                            )
                    )
                ];
                break;

            case "relations":
                selected.relations =
                    record.relations || {};
                break;
        }
    }

    return selected;
}

module.exports = {
    VALID_FIELDS,
    FIELD_PRESETS,
    VALID_PRESETS,
    validateFields,
    normalizeFields,
    selectFields
};