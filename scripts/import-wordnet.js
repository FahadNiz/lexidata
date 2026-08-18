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

function readJsonFile(filePath) {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function getJsonFiles(prefix) {
    return fs
        .readdirSync(DATA_PATH)
        .filter(
            (file) =>
                file.startsWith(prefix) &&
                file.endsWith(".json")
        );
}

function normalizeWord(word) {
    return word.trim().toLowerCase();
}

function getPartOfSpeechCode(fileName) {
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

async function loadSynsets() {
    const synsets = new Map();

    const files = fs
        .readdirSync(DATA_PATH)
        .filter((file) => {
            return (
                file.startsWith("noun.") ||
                file.startsWith("verb.") ||
                file.startsWith("adj.") ||
                file.startsWith("adv.")
            );
        });

    console.log(`Loading ${files.length} synset files...`);

    for (const file of files) {
        const filePath = path.join(DATA_PATH, file);
        const data = readJsonFile(filePath);
        const partOfSpeech = getPartOfSpeechCode(file);

        for (const [externalId, synset] of Object.entries(data)) {
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

function extractRelations(synset) {
    const ignoredKeys = new Set([
        "definition",
        "example",
        "members",
        "partOfSpeech",
        "ili"
    ]);

    const relations = [];

    for (const [relationType, values] of Object.entries(synset)) {
        if (ignoredKeys.has(relationType)) {
            continue;
        }

        if (!Array.isArray(values)) {
            continue;
        }

        for (const target of values) {
            if (typeof target === "string") {
                relations.push({
                    relationType,
                    target
                });
            }
        }
    }

    return relations;
}

async function loadEntries() {
    const entries = new Map();

    const files = getJsonFiles("entries-");

    console.log(`Loading ${files.length} entry files...`);

    for (const file of files) {
        const filePath = path.join(DATA_PATH, file);
        const data = readJsonFile(filePath);

        for (const [word, partsOfSpeech] of Object.entries(data)) {
            if (!entries.has(word)) {
                entries.set(word, []);
            }

            for (const [partOfSpeech, entry] of Object.entries(
                partsOfSpeech
            )) {
                entries.get(word).push({
                    partOfSpeech,
                    pronunciation: entry.pronunciation || [],
                    senses: entry.sense || []
                });
            }
        }
    }

    return entries;
}

async function getOrCreateWord(client, word) {
    const normalizedWord = normalizeWord(word);

    const result = await client.query(
        `
        INSERT INTO words (word, normalized_word)
        VALUES ($1, $2)
        ON CONFLICT (normalized_word)
        DO UPDATE SET word = words.word
        RETURNING id;
        `,
        [word, normalizedWord]
    );

    return result.rows[0].id;
}

async function getOrCreateSynset(client, synset) {
    const result = await client.query(
        `
        INSERT INTO synsets (
            external_id,
            part_of_speech,
            ili_id
        )
        VALUES ($1, $2, $3)
        ON CONFLICT (external_id)
        DO UPDATE SET
            part_of_speech = EXCLUDED.part_of_speech,
            ili_id = EXCLUDED.ili_id
        RETURNING id;
        `,
        [
            synset.externalId,
            synset.partOfSpeech,
            synset.iliId
        ]
    );

    return result.rows[0].id;
}

async function insertDefinition(
    client,
    synsetId,
    definition,
    order
) {
    await client.query(
        `
        INSERT INTO definitions (
            synset_id,
            definition,
            definition_order
        )
        VALUES ($1, $2, $3)
        ON CONFLICT (synset_id, definition_order)
        DO UPDATE SET definition = EXCLUDED.definition;
        `,
        [synsetId, definition, order]
    );
}

async function insertExample(
    client,
    synsetId,
    example,
    order
) {
    await client.query(
        `
        INSERT INTO examples (
            synset_id,
            example,
            example_order
        )
        VALUES ($1, $2, $3)
        ON CONFLICT (synset_id, example_order)
        DO UPDATE SET example = EXCLUDED.example;
        `,
        [synsetId, example, order]
    );
}

async function insertSense(
    client,
    wordId,
    synsetId,
    externalId
) {
    await client.query(
        `
        INSERT INTO word_senses (
            word_id,
            synset_id,
            external_id
        )
        VALUES ($1, $2, $3)
        ON CONFLICT (word_id, synset_id)
        DO UPDATE SET external_id = EXCLUDED.external_id;
        `,
        [wordId, synsetId, externalId]
    );
}

async function insertPronunciation(
    client,
    wordId,
    pronunciation
) {
    if (!pronunciation?.value) {
        return;
    }

    await client.query(
        `
        INSERT INTO pronunciations (
            word_id,
            pronunciation
        )
        VALUES ($1, $2)
        ON CONFLICT (word_id, pronunciation)
        DO NOTHING;
        `,
        [wordId, pronunciation.value]
    );
}

async function insertSynsetMember(
    client,
    synsetId,
    wordId
) {
    await client.query(
        `
        INSERT INTO synset_members (
            synset_id,
            word_id
        )
        VALUES ($1, $2)
        ON CONFLICT (synset_id, word_id)
        DO NOTHING;
        `,
        [synsetId, wordId]
    );
}

async function insertRelation(
    client,
    sourceSynsetId,
    targetSynsetId,
    relationType
) {
    await client.query(
        `
        INSERT INTO synset_relations (
            source_synset_id,
            target_synset_id,
            relation_type
        )
        VALUES ($1, $2, $3)
        ON CONFLICT (
            source_synset_id,
            target_synset_id,
            relation_type
        )
        DO NOTHING;
        `,
        [
            sourceSynsetId,
            targetSynsetId,
            relationType
        ]
    );
}

async function importSynsets(client, synsets) {
    console.log(`Importing ${synsets.size} synsets...`);

    for (const synset of synsets.values()) {
        const synsetId = await getOrCreateSynset(
            client,
            synset
        );

        for (
            let index = 0;
            index < synset.definitions.length;
            index++
        ) {
            await insertDefinition(
                client,
                synsetId,
                synset.definitions[index],
                index + 1
            );
        }

        for (
            let index = 0;
            index < synset.examples.length;
            index++
        ) {
            await insertExample(
                client,
                synsetId,
                synset.examples[index],
                index + 1
            );
        }
    }
}

async function importWords(client, entries, synsets) {
    console.log(`Importing ${entries.size} words...`);

    for (const [word, wordEntries] of entries) {
        const wordId = await getOrCreateWord(
            client,
            word
        );

        for (const entry of wordEntries) {
            for (const pronunciation of entry.pronunciation) {
                await insertPronunciation(
                    client,
                    wordId,
                    pronunciation
                );
            }

            for (const sense of entry.senses) {
                const synset = synsets.get(
                    sense.synset
                );

                if (!synset) {
                    console.warn(
                        `Missing synset: ${sense.synset}`
                    );

                    continue;
                }

                const synsetId = await getOrCreateSynset(
                    client,
                    synset
                );

                await insertSense(
                    client,
                    wordId,
                    synsetId,
                    sense.id
                );
            }
        }
    }
}

async function importMembers(client, synsets) {
    console.log("Importing synset members...");

    for (const synset of synsets.values()) {
        const synsetResult = await client.query(
            `
            SELECT id
            FROM synsets
            WHERE external_id = $1;
            `,
            [synset.externalId]
        );

        if (synsetResult.rows.length === 0) {
            continue;
        }

        const synsetId = synsetResult.rows[0].id;

        for (const member of synset.members) {
            const wordId = await getOrCreateWord(
                client,
                member
            );

            await insertSynsetMember(
                client,
                synsetId,
                wordId
            );
        }
    }
}

async function importRelations(client, synsets) {
    console.log("Importing synset relations...");

    for (const synset of synsets.values()) {
        const sourceResult = await client.query(
            `
            SELECT id
            FROM synsets
            WHERE external_id = $1;
            `,
            [synset.externalId]
        );

        if (sourceResult.rows.length === 0) {
            continue;
        }

        const sourceSynsetId =
            sourceResult.rows[0].id;

        for (const relation of synset.relations) {
            const targetResult = await client.query(
                `
                SELECT id
                FROM synsets
                WHERE external_id = $1;
                `,
                [relation.target]
            );

            if (targetResult.rows.length === 0) {
                continue;
            }

            await insertRelation(
                client,
                sourceSynsetId,
                targetResult.rows[0].id,
                relation.relationType
            );
        }
    }
}

async function main() {
    const client = await pool.connect();

    try {
        console.log("Starting Lexicon WordNet import...\n");

        const synsets = await loadSynsets();
        const entries = await loadEntries();

        console.log("\nStarting database transaction...");

        await client.query("BEGIN");

        await importSynsets(client, synsets);
        await importWords(client, entries, synsets);
        await importMembers(client, synsets);
        await importRelations(client, synsets);

        await client.query("COMMIT");

        console.log("\nWordNet import completed successfully.");
    } catch (error) {
        await client.query("ROLLBACK");

        console.error("\nWordNet import failed.");
        console.error(error);

        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
}

main();