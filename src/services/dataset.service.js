const pool = require("../database/client");

async function getDataset({
    limit = 100,
    offset = 0,
    pos = null
}) {
    const values = [];
    const conditions = [];

    if (pos) {
        values.push(pos);

        conditions.push(`
            EXISTS (
                SELECT 1
                FROM word_senses ws_filter
                JOIN synsets s_filter
                    ON s_filter.id = ws_filter.synset_id
                WHERE ws_filter.word_id = w.id
                  AND s_filter.part_of_speech = $${values.length}
            )
        `);
    }

    values.push(limit);
    const limitParameter = `$${values.length}`;

    values.push(offset);
    const offsetParameter = `$${values.length}`;

    const whereClause =
        conditions.length > 0
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

    const query = `
        SELECT
            w.word,
            COALESCE(
                ARRAY_AGG(DISTINCT s.part_of_speech)
                    FILTER (WHERE s.part_of_speech IS NOT NULL),
                '{}'
            ) AS part_of_speech
        FROM words w
        LEFT JOIN word_senses ws
            ON ws.word_id = w.id
        LEFT JOIN synsets s
            ON s.id = ws.synset_id
        ${whereClause}
        GROUP BY w.id, w.word
        ORDER BY w.normalized_word ASC, w.id ASC
        LIMIT ${limitParameter}
        OFFSET ${offsetParameter};
    `;

    const countQuery = `
        SELECT COUNT(*)
        FROM words w
        ${whereClause};
    `;

    const [dataResult, countResult] = await Promise.all([
        pool.query(query, values),
        pool.query(countQuery, values.slice(0, pos ? 1 : 0))
    ]);

    return {
        words: dataResult.rows,
        total: Number(countResult.rows[0].count)
    };
}

module.exports = {
    getDataset
};