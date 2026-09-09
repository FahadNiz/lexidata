const datasetService = require("../services/dataset.service");
const datasetRecordService = require("../services/dataset-record.service");

const {
    validateFilters,
    normalizeFilters
} = require("../utils/word-filters");

const {
    validateFields,
    normalizeFields
} = require("../utils/dataset-fields");

const VALID_FORMATS = new Set([
    "json",
    "jsonl",
    "csv",
    "txt"
]);

const EXPORT_BATCH_SIZE = 1000;

function selectFields(record, fields) {
    const selected = {};

    for (const field of fields) {
        switch (field) {
            case "word":
                selected.word = record.word;
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
                            .filter(
                                sense =>
                                    sense.synset
                            )
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
                            .flatMap(sense => {
                                if (
                                    Array.isArray(
                                        sense.definitions
                                    )
                                ) {
                                    return sense.definitions;
                                }

                                if (
                                    sense.definition
                                ) {
                                    return [
                                        sense.definition
                                    ];
                                }

                                return [];
                            })
                            .filter(Boolean)
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
                            .filter(Boolean)
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

function createFallbackRecord(row) {
    return {
        word: row.word,
        part_of_speech: [],
        pronunciations: [],
        senses: [],
        relations: {}
    };
}

async function getRichBatch(rows) {
    if (
        !Array.isArray(rows) ||
        rows.length === 0
    ) {
        return [];
    }

    const wordIds =
        rows.map(row => row.id);

    return datasetRecordService.getWordRecords({
        wordIds
    });
}

function createRecordMap(records) {
    return new Map(
        records.map(record => [
            record.word,
            record
        ])
    );
}

function escapeCsv(value) {
    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    const stringValue =
        String(value);

    if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n") ||
        stringValue.includes("\r")
    ) {
        return `"${stringValue.replace(
            /"/g,
            '""'
        )}"`;
    }

    return stringValue;
}

function csvValue(value) {
    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    if (
        typeof value === "object"
    ) {
        return JSON.stringify(value);
    }

    return String(value);
}

async function streamCsv({
    res,
    filters,
    fields
}) {
    res.setHeader(
        "Content-Type",
        "text/csv; charset=utf-8"
    );

    res.setHeader(
        "Content-Disposition",
        'attachment; filename="lexidata-dataset.csv"'
    );

    res.write(
        fields
            .map(escapeCsv)
            .join(",") + "\n"
    );

    let offset = 0;

    while (true) {
        const rows =
            await datasetService.getDatasetBatch({
                ...filters,
                limit:
                    EXPORT_BATCH_SIZE,
                offset
            });

        if (rows.length === 0) {
            break;
        }

        const records =
            await getRichBatch(rows);

        const recordMap =
            createRecordMap(records);

        for (const row of rows) {
            const record =
                recordMap.get(row.word) ||
                createFallbackRecord(row);

            const selected =
                selectFields(
                    record,
                    fields
                );

            const values =
                fields.map(field =>
                    escapeCsv(
                        csvValue(
                            selected[field]
                        )
                    )
                );

            res.write(
                values.join(",") + "\n"
            );
        }

        offset += rows.length;

        if (
            rows.length <
            EXPORT_BATCH_SIZE
        ) {
            break;
        }
    }

    res.end();
}

async function streamJsonl({
    res,
    filters,
    fields
}) {
    res.setHeader(
        "Content-Type",
        "application/x-ndjson; charset=utf-8"
    );

    res.setHeader(
        "Content-Disposition",
        'attachment; filename="lexidata-dataset.jsonl"'
    );

    let offset = 0;

    while (true) {
        const rows =
            await datasetService.getDatasetBatch({
                ...filters,
                limit:
                    EXPORT_BATCH_SIZE,
                offset
            });

        if (rows.length === 0) {
            break;
        }

        const records =
            await getRichBatch(rows);

        const recordMap =
            createRecordMap(records);

        for (const row of rows) {
            const record =
                recordMap.get(row.word) ||
                createFallbackRecord(row);

            const selected =
                selectFields(
                    record,
                    fields
                );

            res.write(
                JSON.stringify(selected) +
                "\n"
            );
        }

        offset += rows.length;

        if (
            rows.length <
            EXPORT_BATCH_SIZE
        ) {
            break;
        }
    }

    res.end();
}

async function streamTxt({
    res,
    filters,
    fields
}) {
    res.setHeader(
        "Content-Type",
        "text/plain; charset=utf-8"
    );

    res.setHeader(
        "Content-Disposition",
        'attachment; filename="lexidata-dataset.txt"'
    );

    let offset = 0;

    while (true) {
        const rows =
            await datasetService.getDatasetBatch({
                ...filters,
                limit:
                    EXPORT_BATCH_SIZE,
                offset
            });

        if (rows.length === 0) {
            break;
        }

        const records =
            await getRichBatch(rows);

        const recordMap =
            createRecordMap(records);

        for (const row of rows) {
            const record =
                recordMap.get(row.word) ||
                createFallbackRecord(row);

            const selected =
                selectFields(
                    record,
                    fields
                );

            for (const field of fields) {
                const value =
                    selected[field];

                if (
                    value === undefined ||
                    value === null
                ) {
                    continue;
                }

                if (
                    typeof value === "object"
                ) {
                    res.write(
                        `${field}: ${JSON.stringify(value)}\n`
                    );
                } else {
                    res.write(
                        `${field}: ${value}\n`
                    );
                }
            }

            res.write("\n");
        }

        offset += rows.length;

        if (
            rows.length <
            EXPORT_BATCH_SIZE
        ) {
            break;
        }
    }

    res.end();
}

async function streamJson({
    res,
    filters,
    fields
}) {
    res.setHeader(
        "Content-Type",
        "application/json; charset=utf-8"
    );

    res.setHeader(
        "Content-Disposition",
        'attachment; filename="lexidata-dataset.json"'
    );

    res.write("[\n");

    let offset = 0;
    let first = true;

    while (true) {
        const rows =
            await datasetService.getDatasetBatch({
                ...filters,
                limit:
                    EXPORT_BATCH_SIZE,
                offset
            });

        if (rows.length === 0) {
            break;
        }

        const records =
            await getRichBatch(rows);

        const recordMap =
            createRecordMap(records);

        for (const row of rows) {
            const record =
                recordMap.get(row.word) ||
                createFallbackRecord(row);

            const selected =
                selectFields(
                    record,
                    fields
                );

            if (!first) {
                res.write(",\n");
            }

            res.write(
                JSON.stringify(selected)
            );

            first = false;
        }

        offset += rows.length;

        if (
            rows.length <
            EXPORT_BATCH_SIZE
        ) {
            break;
        }
    }

    res.write("\n]\n");
    res.end();
}

async function getDataset(req, res, next) {
    try {
        const {
            limit,
            page,
            partOfSpeech,
            minLength,
            maxLength,
            startsWith,
            endsWith,
            contains,
            fields,
            format
        } = req.query;

        const filterError =
            validateFilters({
                limit,
                page,
                partOfSpeech,
                minLength,
                maxLength,
                startsWith,
                endsWith,
                contains
            });

        if (filterError) {
            return res.status(400).json({
                error: filterError
            });
        }

        const fieldError =
            validateFields(fields);

        if (fieldError) {
            return res.status(400).json({
                error: fieldError
            });
        }

        if (
            format !== undefined &&
            !VALID_FORMATS.has(
                String(format).toLowerCase()
            )
        ) {
            return res.status(400).json({
                error: {
                    code: "INVALID_FORMAT",
                    message:
                        "The 'format' parameter must be one of: json, jsonl, csv, txt."
                }
            });
        }

        const normalizedFields =
            normalizeFields(fields);

        const normalizedFilters =
            normalizeFilters({
                limit,
                page,
                partOfSpeech,
                minLength,
                maxLength,
                startsWith,
                endsWith,
                contains
            });

        const exportFilters = {
            partOfSpeech:
                normalizedFilters.partOfSpeech,

            minLength:
                normalizedFilters.minLength,

            maxLength:
                normalizedFilters.maxLength,

            startsWith:
                normalizedFilters.startsWith,

            endsWith:
                normalizedFilters.endsWith,

            contains:
                normalizedFilters.contains
        };

        if (format !== undefined) {
            const normalizedFormat =
                String(format).toLowerCase();

            if (
                normalizedFormat === "csv"
            ) {
                return streamCsv({
                    res,
                    filters:
                        exportFilters,
                    fields:
                        normalizedFields
                });
            }

            if (
                normalizedFormat === "jsonl"
            ) {
                return streamJsonl({
                    res,
                    filters:
                        exportFilters,
                    fields:
                        normalizedFields
                });
            }

            if (
                normalizedFormat === "txt"
            ) {
                return streamTxt({
                    res,
                    filters:
                        exportFilters,
                    fields:
                        normalizedFields
                });
            }

            if (
                normalizedFormat === "json"
            ) {
                return streamJson({
                    res,
                    filters:
                        exportFilters,
                    fields:
                        normalizedFields
                });
            }
        }

        const result =
            await datasetService.getDataset({
                limit:
                    normalizedFilters.limit,

                page:
                    normalizedFilters.page,

                partOfSpeech:
                    normalizedFilters.partOfSpeech,

                minLength:
                    normalizedFilters.minLength,

                maxLength:
                    normalizedFilters.maxLength,

                startsWith:
                    normalizedFilters.startsWith,

                endsWith:
                    normalizedFilters.endsWith,

                contains:
                    normalizedFilters.contains
            });

        const data =
            result.data.map(record =>
                selectFields(
                    record,
                    normalizedFields
                )
            );

        return res.json({
            data,
            pagination:
                result.pagination
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getDataset
};