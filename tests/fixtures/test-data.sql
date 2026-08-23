INSERT INTO word_senses (
    word_id,
    synset_id,
    external_id
)
SELECT
    w.id,
    s.id,
    s.external_id
FROM words w
JOIN synsets s
    ON s.external_id = '00000124-n'
WHERE w.normalized_word = 'language'
ON CONFLICT (word_id, synset_id) DO NOTHING;


INSERT INTO word_senses (
    word_id,
    synset_id,
    external_id
)
SELECT
    w.id,
    s.id,
    s.external_id
FROM words w
JOIN synsets s
    ON s.external_id = '00000125-n'
WHERE w.normalized_word = 'water'
ON CONFLICT (word_id, synset_id) DO NOTHING;


INSERT INTO word_senses (
    word_id,
    synset_id,
    external_id
)
SELECT
    w.id,
    s.id,
    s.external_id
FROM words w
JOIN synsets s
    ON s.external_id = '00000126-n'
WHERE w.normalized_word = 'apple'
ON CONFLICT (word_id, synset_id) DO NOTHING;


INSERT INTO word_senses (
    word_id,
    synset_id,
    external_id
)
SELECT
    w.id,
    s.id,
    s.external_id
FROM words w
JOIN synsets s
    ON s.external_id = '00000128-n'
WHERE w.normalized_word = 'banana'
ON CONFLICT (word_id, synset_id) DO NOTHING;


INSERT INTO word_senses (
    word_id,
    synset_id,
    external_id
)
SELECT
    w.id,
    s.id,
    s.external_id
FROM words w
JOIN synsets s
    ON s.external_id = '00000129-n'
WHERE w.normalized_word = 'house'
ON CONFLICT (word_id, synset_id) DO NOTHING;