function selectFields(record, fields) {
    const selected = {};

    if (fields.includes("word")) {
        selected.word = record.word;
    }

    if (fields.includes("part_of_speech")) {
        selected.part_of_speech =
            record.part_of_speech;
    }

    if (fields.includes("pronunciations")) {
        selected.pronunciations =
            record.pronunciations;
    }

    if (fields.includes("senses")) {
        selected.senses =
            record.senses;
    }

    if (fields.includes("synsets")) {
        selected.synsets =
            record.senses.map(sense => ({
                synset: sense.synset,
                ili_id: sense.ili_id,
                part_of_speech:
                    sense.part_of_speech
            }));
    }

    if (fields.includes("definitions")) {
        selected.definitions = [
            ...new Set(
                record.senses
                    .map(sense => sense.definition)
                    .filter(Boolean)
            )
        ];
    }

    if (fields.includes("examples")) {
        selected.examples = [
            ...new Set(
                record.senses
                    .flatMap(
                        sense => sense.examples
                    )
            )
        ];
    }

    if (fields.includes("relations")) {
        selected.relations =
            record.relations || {};
    }

    return selected;
}

module.exports = {
    selectFields
};