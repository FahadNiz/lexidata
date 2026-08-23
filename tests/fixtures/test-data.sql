INSERT INTO words (word, normalized_word)
VALUES
    ('communicate', 'communicate'),
    ('computer', 'computer'),
    ('computable', 'computable'),
    ('computation', 'computation'),
    ('computational', 'computational'),
    ('language', 'language'),
    ('water', 'water'),
    ('apple', 'apple'),
    ('banana', 'banana'),
    ('house', 'house'),
    ('tree', 'tree'),
    ('book', 'book'),
    ('dog', 'dog'),
    ('cat', 'cat'),
    ('science', 'science'),
    ('technology', 'technology')
ON CONFLICT (word) DO NOTHING;


INSERT INTO synsets (
    external_id,
    part_of_speech,
    ili_id
)
VALUES
    ('00742582-v', 'verb', 'i25403'),
    ('13757348-n', 'noun', 'i10001'),
    ('00000123-a', 'adjective', 'i10002'),
    ('00000124-n', 'noun', 'i10003'),
    ('00000125-n', 'noun', 'i10004'),
    ('00000126-n', 'noun', 'i10005'),
    ('00000127-n', 'noun', 'i10006'),
    ('00000128-n', 'noun', 'i10007'),
    ('00000129-n', 'noun', 'i10008'),
    ('00000130-n', 'noun', 'i10009'),
    ('00000131-n', 'noun', 'i10010'),
    ('00000132-n', 'noun', 'i10011'),
    ('00000133-n', 'noun', 'i10012'),
    ('00000134-n', 'noun', 'i10013'),
    ('00000135-n', 'noun', 'i10014'),
    ('00000136-n', 'noun', 'i10015')
ON CONFLICT (external_id) DO NOTHING;


INSERT INTO word_senses (word_id, synset_id, external_id)
SELECT w.id, s.id, s.external_id
FROM words w
JOIN synsets s ON s.external_id = '00742582-v'
WHERE w.normalized_word = 'communicate'
ON CONFLICT (word_id, synset_id) DO NOTHING;


INSERT INTO word_senses (word_id, synset_id, external_id)
SELECT w.id, s.id, s.external_id
FROM words w
JOIN synsets s ON s.external_id = '13757348-n'
WHERE w.normalized_word = 'computer'
ON CONFLICT (word_id, synset_id) DO NOTHING;


INSERT INTO word_senses (word_id, synset_id, external_id)
SELECT w.id, s.id, s.external_id
FROM words w
JOIN synsets s ON s.external_id = '00000124-n'
WHERE w.normalized_word = 'language'
ON CONFLICT (word_id, synset_id) DO NOTHING;


INSERT INTO word_senses (word_id, synset_id, external_id)
SELECT w.id, s.id, s.external_id
FROM words w
JOIN synsets s ON s.external_id = '00000125-n'
WHERE w.normalized_word = 'water'
ON CONFLICT (word_id, synset_id) DO NOTHING;


INSERT INTO word_senses (word_id, synset_id, external_id)
SELECT w.id, s.id, s.external_id
FROM words w
JOIN synsets s ON s.external_id = '00000126-n'
WHERE w.normalized_word = 'apple'
ON CONFLICT (word_id, synset_id) DO NOTHING;


INSERT INTO word_senses (word_id, synset_id, external_id)
SELECT w.id, s.id, s.external_id
FROM words w
JOIN synsets s ON s.external_id = '00000127-n'
WHERE w.normalized_word = 'banana'
ON CONFLICT (word_id, synset_id) DO NOTHING;


INSERT INTO word_senses (word_id, synset_id, external_id)
SELECT w.id, s.id, s.external_id
FROM words w
JOIN synsets s ON s.external_id = '00000128-n'
WHERE w.normalized_word = 'house'
ON CONFLICT (word_id, synset_id) DO NOTHING;


INSERT INTO word_senses (word_id, synset_id, external_id)
SELECT w.id, s.id, s.external_id
FROM words w
JOIN synsets s ON s.external_id = '00000129-n'
WHERE w.normalized_word = 'tree'
ON CONFLICT (word_id, synset_id) DO NOTHING;


INSERT INTO word_senses (word_id, synset_id, external_id)
SELECT w.id, s.id, s.external_id
FROM words w
JOIN synsets s ON s.external_id = '00000130-n'
WHERE w.normalized_word = 'book'
ON CONFLICT (word_id, synset_id) DO NOTHING;


INSERT INTO word_senses (word_id, synset_id, external_id)
SELECT w.id, s.id, s.external_id
FROM words w
JOIN synsets s ON s.external_id = '00000131-n'
WHERE w.normalized_word = 'dog'
ON CONFLICT (word_id, synset_id) DO NOTHING;


INSERT INTO word_senses (word_id, synset_id, external_id)
SELECT w.id, s.id, s.external_id
FROM words w
JOIN synsets s ON s.external_id = '00000132-n'
WHERE w.normalized_word = 'cat'
ON CONFLICT (word_id, synset_id) DO NOTHING;


INSERT INTO word_senses (word_id, synset_id, external_id)
SELECT w.id, s.id, s.external_id
FROM words w
JOIN synsets s ON s.external_id = '00000133-n'
WHERE w.normalized_word = 'science'
ON CONFLICT (word_id, synset_id) DO NOTHING;


INSERT INTO word_senses (word_id, synset_id, external_id)
SELECT w.id, s.id, s.external_id
FROM words w
JOIN synsets s ON s.external_id = '00000134-n'
WHERE w.normalized_word = 'technology'
ON CONFLICT (word_id, synset_id) DO NOTHING;


INSERT INTO definitions (
    synset_id,
    definition,
    definition_order
)
SELECT
    id,
    'transmit thoughts or feelings',
    1
FROM synsets
WHERE external_id = '00742582-v'
ON CONFLICT (synset_id, definition_order) DO NOTHING;


INSERT INTO definitions (
    synset_id,
    definition,
    definition_order
)
SELECT
    id,
    'a machine for performing calculations automatically',
    1
FROM synsets
WHERE external_id = '13757348-n'
ON CONFLICT (synset_id, definition_order) DO NOTHING;


INSERT INTO examples (
    synset_id,
    example,
    example_order
)
SELECT
    id,
    'He communicated his anxieties to the psychiatrist',
    1
FROM synsets
WHERE external_id = '00742582-v'
ON CONFLICT (synset_id, example_order) DO NOTHING;


INSERT INTO examples (
    synset_id,
    example,
    example_order
)
SELECT
    id,
    'The computer processed the information',
    1
FROM synsets
WHERE external_id = '13757348-n'
ON CONFLICT (synset_id, example_order) DO NOTHING;


INSERT INTO pronunciations (
    word_id,
    pronunciation
)
SELECT
    id,
    'kəˈmjuːnɪkeɪt'
FROM words
WHERE normalized_word = 'communicate'
ON CONFLICT (word_id, pronunciation) DO NOTHING;


INSERT INTO pronunciations (
    word_id,
    pronunciation
)
SELECT
    id,
    'kəmˈpjuːtə'
FROM words
WHERE normalized_word = 'computer'
ON CONFLICT (word_id, pronunciation) DO NOTHING;


INSERT INTO synset_members (synset_id, word_id)
SELECT s.id, w.id
FROM synsets s
JOIN words w ON w.normalized_word = 'communicate'
WHERE s.external_id = '00742582-v'
ON CONFLICT (synset_id, word_id) DO NOTHING;


INSERT INTO synset_members (synset_id, word_id)
SELECT s.id, w.id
FROM synsets s
JOIN words w ON w.normalized_word = 'computer'
WHERE s.external_id = '13757348-n'
ON CONFLICT (synset_id, word_id) DO NOTHING;