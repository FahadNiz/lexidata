CREATE TABLE words (
    id BIGSERIAL PRIMARY KEY,
    word TEXT NOT NULL,
    normalized_word TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT words_word_unique UNIQUE (word)
);


CREATE TABLE synsets (
    id BIGSERIAL PRIMARY KEY,
    external_id TEXT NOT NULL,
    part_of_speech VARCHAR(20) NOT NULL,
    ili_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT synsets_external_id_unique UNIQUE (external_id)
);


CREATE TABLE word_senses (
    id BIGSERIAL PRIMARY KEY,
    word_id BIGINT NOT NULL,
    synset_id BIGINT NOT NULL,
    external_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT word_senses_word_fk
        FOREIGN KEY (word_id)
        REFERENCES words(id)
        ON DELETE CASCADE,

    CONSTRAINT word_senses_synset_fk
        FOREIGN KEY (synset_id)
        REFERENCES synsets(id)
        ON DELETE CASCADE,

    CONSTRAINT word_senses_unique
        UNIQUE (word_id, synset_id)
);


CREATE TABLE definitions (
    id BIGSERIAL PRIMARY KEY,
    synset_id BIGINT NOT NULL,
    definition TEXT NOT NULL,
    definition_order INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT definitions_synset_fk
        FOREIGN KEY (synset_id)
        REFERENCES synsets(id)
        ON DELETE CASCADE,

    CONSTRAINT definitions_order_positive
        CHECK (definition_order > 0),

    CONSTRAINT definitions_unique
        UNIQUE (synset_id, definition_order)
);


CREATE TABLE examples (
    id BIGSERIAL PRIMARY KEY,
    synset_id BIGINT NOT NULL,
    example TEXT NOT NULL,
    example_order INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT examples_synset_fk
        FOREIGN KEY (synset_id)
        REFERENCES synsets(id)
        ON DELETE CASCADE,

    CONSTRAINT examples_order_positive
        CHECK (example_order > 0),

    CONSTRAINT examples_unique
        UNIQUE (synset_id, example_order)
);


CREATE TABLE pronunciations (
    id BIGSERIAL PRIMARY KEY,
    word_id BIGINT NOT NULL,
    pronunciation TEXT NOT NULL,

    CONSTRAINT pronunciations_word_fk
        FOREIGN KEY (word_id)
        REFERENCES words(id)
        ON DELETE CASCADE,

    CONSTRAINT pronunciations_unique
        UNIQUE (word_id, pronunciation)
);


CREATE TABLE synset_members (
    id BIGSERIAL PRIMARY KEY,
    synset_id BIGINT NOT NULL,
    word_id BIGINT NOT NULL,

    CONSTRAINT synset_members_synset_fk
        FOREIGN KEY (synset_id)
        REFERENCES synsets(id)
        ON DELETE CASCADE,

    CONSTRAINT synset_members_word_fk
        FOREIGN KEY (word_id)
        REFERENCES words(id)
        ON DELETE CASCADE,

    CONSTRAINT synset_members_unique
        UNIQUE (synset_id, word_id)
);


CREATE TABLE synset_relations (
    id BIGSERIAL PRIMARY KEY,
    source_synset_id BIGINT NOT NULL,
    target_synset_id BIGINT NOT NULL,
    relation_type TEXT NOT NULL,

    CONSTRAINT synset_relations_source_fk
        FOREIGN KEY (source_synset_id)
        REFERENCES synsets(id)
        ON DELETE CASCADE,

    CONSTRAINT synset_relations_target_fk
        FOREIGN KEY (target_synset_id)
        REFERENCES synsets(id)
        ON DELETE CASCADE,

    CONSTRAINT synset_relations_unique
        UNIQUE (
            source_synset_id,
            target_synset_id,
            relation_type
        )
);


CREATE INDEX idx_words_normalized_word
    ON words(normalized_word);

CREATE INDEX idx_word_senses_word_id
    ON word_senses(word_id);

CREATE INDEX idx_word_senses_synset_id
    ON word_senses(synset_id);

CREATE INDEX idx_definitions_synset_id
    ON definitions(synset_id);

CREATE INDEX idx_examples_synset_id
    ON examples(synset_id);

CREATE INDEX idx_pronunciations_word_id
    ON pronunciations(word_id);

CREATE INDEX idx_synset_members_synset_id
    ON synset_members(synset_id);

CREATE INDEX idx_synset_members_word_id
    ON synset_members(word_id);

CREATE INDEX idx_synset_relations_source
    ON synset_relations(source_synset_id);

CREATE INDEX idx_synset_relations_target
    ON synset_relations(target_synset_id);