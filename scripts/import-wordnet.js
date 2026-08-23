const fs = require("fs");
const path = require("path");
const pool = require("../src/database/client");

const DATA_PATH = path.join(
    __dirname,
    "..",
    "data",
    "raw",
    "english-wordnet"
);

const BATCH_SIZE = 500;

function getImportLimit() {
    const limitIndex = process.argv.indexOf("--limit");

    if (limitIndex === -1) {
        return null;
    }

    const value = Number(process.argv[limitIndex + 1]);

    if (!Number.isInteger(value) || value <= 0) {
        throw new Error(
            "The --limit value must be a positive integer."
        );
    }

    return value;
}

function readJsonFile(filePath) {
    return JSON.parse(
        fs.readFileSync(filePath, "utf-8")
    );
}

function normalizeWord(word) {
    return word.trim().toLowerCase();
}

function getPartOfSpeech(fileName) {
    if (fileName.startsWith("noun.")) {
        return "noun";
    }

    if (fileName.startsWith("verb.")) {
        return "verb";
    }

    if (fileName.startsWith("adj.")) {
        return "adjective";
    }

    if (fileName.startsWith("adv.")) {
        return "adverb";
    }

    return null;
}

function getSynsetFiles() {
    return fs
        .readdirSync(DATA_PATH)
        .filter((file) => {
            return (
                file.startsWith("noun.") ||
                file.startsWith("verb.") ||
                file.startsWith("adj.") ||
                file.startsWith("adv.")
            );
        });
}

function getEntryFiles() {
    return fs
        .readdirSync(DATA_PATH)
        .filter(
            (file) =>
                file.startsWith("entries-") &&
                file.endsWith(".json")
        );
}

function extractRelations(synset) {
    const ignoredKeys = new Set([
        "definition",
        "example",
        "members",
        "partOfSpeech",
        "ili"
    ]);

    const relations = [];

    for (const [relationType, values] of Object.entries(
        synset
    )) {
        if (ignoredKeys.has(relationType)) {
            continue;
        }

        if (!Array.isArray(values)) {
            continue;
        }

        for (const target of values) {
            if (typeof target !== "string") {
                continue;
            }

            relations.push({
                relationType,
                target
            });
        }
    }

    return relations;
}

function loadSynsets() {
    const synsets = new Map();

    const files = getSynsetFiles();

    console.log(
        `Loading ${files.length} synset files...`
    );

    for (const file of files) {
        const filePath = path.join(DATA_PATH, file);
        const data = readJsonFile(filePath);
        const partOfSpeech = getPartOfSpeech(file);

        for (const [externalId, synset] of Object.entries(
            data
        )) {
            synsets.set(externalId, {
                externalId,
                partOfSpeech,
                iliId: synset.ili || null,
                definitions: synset.definition || [],
                examples: synset.example || [],
                members: synset.members || [],
                relations: extractRelations(synset)
            });
        }
    }

    return synsets;
}

function loadEntries(limit = null) {
    const entries = new Map();

    const files = getEntryFiles();

    console.log(
        `Loading ${files.length} entry files...`
    );

    for (const file of files) {
        const filePath = path.join(DATA_PATH, file);
        const data = readJsonFile(filePath);

        for (const [word, partsOfSpeech] of Object.entries(
            data
        )) {
            if (
                limit !== null &&
                entries.size >= limit
            ) {
                return entries;
            }

            entries.set(word, []);

            for (const [partOfSpeech, entry] of Object.entries(
                partsOfSpeech
            )) {
                entries.get(word).push({
                    partOfSpeech,
                    pronunciation:
                        entry.pronunciation || [],
                    senses: entry.sense || []
                });
            }
        }
    }

    return entries;
}

function selectSynsets(
    entries,
    allSynsets,
    includeRelatedSynsets
) {
    const selectedIds = new Set();

    for (const wordEntries of entries.values()) {
        for (const entry of wordEntries) {
            for (const sense of entry.senses) {
                if (allSynsets.has(sense.synset)) {
                    selectedIds.add(sense.synset);
                }
            }
        }
    }

    if (includeRelatedSynsets) {
        const originalIds = [...selectedIds];

        for (const synsetId of originalIds) {
            const synset = allSynsets.get(synsetId);

            if (!synset) {
                continue;
            }

            for (const relation of synset.relations) {
                if (allSynsets.has(relation.target)) {
                    selectedIds.add(relation.target);
                }
            }
        }
    }

    const selectedSynsets = new Map();

    for (const synsetId of selectedIds) {
        const synset = allSynsets.get(synsetId);

        if (synset) {
            selectedSynsets.set(
                synsetId,
                synset
            );
        }
    }

    return selectedSynsets;
}

function getRequiredMemberWords(synsets) {
    const words = new Set();

    for (const synset of synsets.values()) {
        for (const member of synset.members) {
            words.add(member);
        }
    }

    return words;
}

function createWordImportSet(
    entries,
    synsets,
    includeMembers
) {
    const words = new Map();

    for (const word of entries.keys()) {
        words.set(word, true);
    }

    if (includeMembers) {
        const memberWords =
            getRequiredMemberWords(synsets);

        for (const word of memberWords) {
            words.set(word, false);
        }
    }

    return words;
}

async function insertWords(
    client,
    words
) {
    const wordList = [...words.keys()];

    console.log(
        `Importing ${wordList.length} words...`
    );

    const wordIds = new Map();

    for (
        let i = 0;
        i < wordList.length;
        i += BATCH_SIZE
    ) {
        const batch = wordList.slice(
            i,
            i + BATCH_SIZE
        );

        const values = [];
        const parameters = [];

        batch.forEach((word, index) => {
            const offset = index * 2;

            values.push(
                `($${offset + 1}, $${offset + 2})`
            );

            parameters.push(
                word,
                normalizeWord(word)
            );
        });

        const result = await client.query(
            `
            INSERT INTO words (
                word,
                normalized_word
            )
            VALUES ${values.join(", ")}
            ON CONFLICT (word)
            DO UPDATE SET
                normalized_word = EXCLUDED.normalized_word
            RETURNING id, word;
            `,
            parameters
        );

        for (const row of result.rows) {
            wordIds.set(
                row.word,
                row.id
            );
        }

        console.log(
            `Words: ${Math.min(
                i + BATCH_SIZE,
                wordList.length
            )} / ${wordList.length}`
        );
    }

    return wordIds;
}

async function insertSynsets(
    client,
    synsets
) {
    const synsetList = [...synsets.values()];

    console.log(
        `Importing ${synsetList.length} synsets...`
    );

    const synsetIds = new Map();

    for (
        let i = 0;
        i < synsetList.length;
        i += BATCH_SIZE
    ) {
        const batch = synsetList.slice(
            i,
            i + BATCH_SIZE
        );

        const values = [];
        const parameters = [];

        batch.forEach((synset, index) => {
            const offset = index * 3;

            values.push(
                `($${offset + 1}, $${offset + 2}, $${offset + 3})`
            );

            parameters.push(
                synset.externalId,
                synset.partOfSpeech,
                synset.iliId
            );
        });

        const result = await client.query(
            `
            INSERT INTO synsets (
                external_id,
                part_of_speech,
                ili_id
            )
            VALUES ${values.join(", ")}
            ON CONFLICT (external_id)
            DO UPDATE SET
                part_of_speech = EXCLUDED.part_of_speech,
                ili_id = EXCLUDED.ili_id
            RETURNING id, external_id;
            `,
            parameters
        );

        for (const row of result.rows) {
            synsetIds.set(
                row.external_id,
                row.id
            );
        }

        console.log(
            `Synsets: ${Math.min(
                i + BATCH_SIZE,
                synsetList.length
            )} / ${synsetList.length}`
        );
    }

    return synsetIds;
}

async function insertDefinitions(
    client,
    synsets,
    synsetIds
) {
    const definitions = [];

    for (const synset of synsets.values()) {
        const synsetId = synsetIds.get(
            synset.externalId
        );

        if (!synsetId) {
            continue;
        }

        synset.definitions.forEach(
            (definition, index) => {
                definitions.push({
                    synsetId,
                    definition,
                    order: index + 1
                });
            }
        );
    }

    console.log(
        `Importing ${definitions.length} definitions...`
    );

    for (
        let i = 0;
        i < definitions.length;
        i += BATCH_SIZE
    ) {
        const batch = definitions.slice(
            i,
            i + BATCH_SIZE
        );

        const values = [];
        const parameters = [];

        batch.forEach((item, index) => {
            const offset = index * 3;

            values.push(
                `($${offset + 1}, $${offset + 2}, $${offset + 3})`
            );

            parameters.push(
                item.synsetId,
                item.definition,
                item.order
            );
        });

        await client.query(
            `
            INSERT INTO definitions (
                synset_id,
                definition,
                definition_order
            )
            VALUES ${values.join(", ")}
            ON CONFLICT (
                synset_id,
                definition_order
            )
            DO UPDATE SET
                definition = EXCLUDED.definition;
            `,
            parameters
        );
    }
}

async function insertExamples(
    client,
    synsets,
    synsetIds
) {
    const examples = [];

    for (const synset of synsets.values()) {
        const synsetId = synsetIds.get(
            synset.externalId
        );

        if (!synsetId) {
            continue;
        }

        synset.examples.forEach(
            (example, index) => {
                examples.push({
                    synsetId,
                    example,
                    order: index + 1
                });
            }
        );
    }

    console.log(
        `Importing ${examples.length} examples...`
    );

    for (
        let i = 0;
        i < examples.length;
        i += BATCH_SIZE
    ) {
        const batch = examples.slice(
            i,
            i + BATCH_SIZE
        );

        const values = [];
        const parameters = [];

        batch.forEach((item, index) => {
            const offset = index * 3;

            values.push(
                `($${offset + 1}, $${offset + 2}, $${offset + 3})`
            );

            parameters.push(
                item.synsetId,
                item.example,
                item.order
            );
        });

        await client.query(
            `
            INSERT INTO examples (
                synset_id,
                example,
                example_order
            )
            VALUES ${values.join(", ")}
            ON CONFLICT (
                synset_id,
                example_order
            )
            DO UPDATE SET
                example = EXCLUDED.example;
            `,
            parameters
        );
    }
}

async function insertSenses(
    client,
    entries,
    wordIds,
    synsetIds
) {
    const senses = [];

    for (const [word, wordEntries] of entries) {
        const wordId = wordIds.get(word);

        if (!wordId) {
            continue;
        }

        for (const entry of wordEntries) {
            for (const sense of entry.senses) {
                const synsetId = synsetIds.get(
                    sense.synset
                );

                if (!synsetId) {
                    continue;
                }

                senses.push({
                    wordId,
                    synsetId,
                    externalId:
                        sense.id || null
                });
            }
        }
    }

    console.log(
        `Importing ${senses.length} senses...`
    );

    for (
        let i = 0;
        i < senses.length;
        i += BATCH_SIZE
    ) {
        const batch = senses.slice(
            i,
            i + BATCH_SIZE
        );

        const values = [];
        const parameters = [];

        batch.forEach((item, index) => {
            const offset = index * 3;

            values.push(
                `($${offset + 1}, $${offset + 2}, $${offset + 3})`
            );

            parameters.push(
                item.wordId,
                item.synsetId,
                item.externalId
            );
        });

        await client.query(
            `
            INSERT INTO word_senses (
                word_id,
                synset_id,
                external_id
            )
            VALUES ${values.join(", ")}
            ON CONFLICT (word_id, synset_id)
            DO UPDATE SET
                external_id = EXCLUDED.external_id;
            `,
            parameters
        );
    }
}

async function insertPronunciations(
    client,
    entries,
    wordIds
) {
    const pronunciations = [];

    for (const [word, wordEntries] of entries) {
        const wordId = wordIds.get(word);

        if (!wordId) {
            continue;
        }

        for (const entry of wordEntries) {
            for (const pronunciation of entry.pronunciation) {
                if (!pronunciation?.value) {
                    continue;
                }

                pronunciations.push({
                    wordId,
                    pronunciation:
                        pronunciation.value
                });
            }
        }
    }

    console.log(
        `Importing ${pronunciations.length} pronunciations...`
    );

    for (
        let i = 0;
        i < pronunciations.length;
        i += BATCH_SIZE
    ) {
        const batch = pronunciations.slice(
            i,
            i + BATCH_SIZE
        );

        const values = [];
        const parameters = [];

        batch.forEach((item, index) => {
            const offset = index * 2;

            values.push(
                `($${offset + 1}, $${offset + 2})`
            );

            parameters.push(
                item.wordId,
                item.pronunciation
            );
        });

        await client.query(
            `
            INSERT INTO pronunciations (
                word_id,
                pronunciation
            )
            VALUES ${values.join(", ")}
            ON CONFLICT (
                word_id,
                pronunciation
            )
            DO NOTHING;
            `,
            parameters
        );
    }
}

async function insertMembers(
    client,
    synsets,
    synsetIds,
    wordIds
) {
    const members = [];

    for (const synset of synsets.values()) {
        const synsetId = synsetIds.get(
            synset.externalId
        );

        if (!synsetId) {
            continue;
        }

        for (const member of synset.members) {
            const wordId = wordIds.get(member);

            if (!wordId) {
                continue;
            }

            members.push({
                synsetId,
                wordId
            });
        }
    }

    console.log(
        `Importing ${members.length} synset members...`
    );

    for (
        let i = 0;
        i < members.length;
        i += BATCH_SIZE
    ) {
        const batch = members.slice(
            i,
            i + BATCH_SIZE
        );

        const values = [];
        const parameters = [];

        batch.forEach((item, index) => {
            const offset = index * 2;

            values.push(
                `($${offset + 1}, $${offset + 2})`
            );

            parameters.push(
                item.synsetId,
                item.wordId
            );
        });

        await client.query(
            `
            INSERT INTO synset_members (
                synset_id,
                word_id
            )
            VALUES ${values.join(", ")}
            ON CONFLICT (
                synset_id,
                word_id
            )
            DO NOTHING;
            `,
            parameters
        );
    }
}

async function insertRelations(
    client,
    synsets,
    synsetIds
) {
    const relations = [];

    for (const synset of synsets.values()) {
        const sourceSynsetId = synsetIds.get(
            synset.externalId
        );

        if (!sourceSynsetId) {
            continue;
        }

        for (const relation of synset.relations) {
            const targetSynsetId = synsetIds.get(
                relation.target
            );

            if (!targetSynsetId) {
                continue;
            }

            relations.push({
                sourceSynsetId,
                targetSynsetId,
                relationType:
                    relation.relationType
            });
        }
    }

    console.log(
        `Importing ${relations.length} synset relations...`
    );

    for (
        let i = 0;
        i < relations.length;
        i += BATCH_SIZE
    ) {
        const batch = relations.slice(
            i,
            i + BATCH_SIZE
        );

        const values = [];
        const parameters = [];

        batch.forEach((item, index) => {
            const offset = index * 3;

            values.push(
                `($${offset + 1}, $${offset + 2}, $${offset + 3})`
            );

            parameters.push(
                item.sourceSynsetId,
                item.targetSynsetId,
                item.relationType
            );
        });

        await client.query(
            `
            INSERT INTO synset_relations (
                source_synset_id,
                target_synset_id,
                relation_type
            )
            VALUES ${values.join(", ")}
            ON CONFLICT (
                source_synset_id,
                target_synset_id,
                relation_type
            )
            DO NOTHING;
            `,
            parameters
        );
    }
}

async function main() {
    const limit = getImportLimit();
    const isTestMode = limit !== null;

    if (isTestMode) {
        console.log(
            `TEST MODE: importing ${limit} primary words.\n`
        );
    } else {
        console.log(
            "FULL IMPORT MODE: importing complete WordNet dataset.\n"
        );
    }

    const startTime = Date.now();
    const client = await pool.connect();

    try {
        console.log(
            "Starting Lexidata WordNet import...\n"
        );

        const allSynsets = loadSynsets();

        const entries = loadEntries(limit);

        console.log(
            `Loaded ${allSynsets.size} total synsets.`
        );

        console.log(
            `Loaded ${entries.size} primary words.\n`
        );

        let synsets;

        if (isTestMode) {
            synsets = selectSynsets(
                entries,
                allSynsets,
                true
            );

            console.log(
                `Selected ${synsets.size} relevant synsets for test mode.\n`
            );
        } else {
            synsets = allSynsets;
        }

        const words = createWordImportSet(
            entries,
            synsets,
            isTestMode
        );

        console.log(
            `Total words required for import: ${words.size}\n`
        );

        await client.query("BEGIN");

        console.log(
            "Database transaction started.\n"
        );

        const wordIds = await insertWords(
            client,
            words
        );

        const synsetIds = await insertSynsets(
            client,
            synsets
        );

        await insertDefinitions(
            client,
            synsets,
            synsetIds
        );

        await insertExamples(
            client,
            synsets,
            synsetIds
        );

        await insertSenses(
            client,
            entries,
            wordIds,
            synsetIds
        );

        await insertPronunciations(
            client,
            entries,
            wordIds
        );

        await insertMembers(
            client,
            synsets,
            synsetIds,
            wordIds
        );

        await insertRelations(
            client,
            synsets,
            synsetIds
        );

        await client.query("COMMIT");

        const duration =
            (
                (Date.now() - startTime) /
                1000
            ).toFixed(2);

        console.log(
            `\nWordNet import completed successfully in ${duration} seconds.`
        );
    } catch (error) {
        await client.query("ROLLBACK");

        console.error(
            "\nWordNet import failed."
        );

        console.error(error);

        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
}

main();

