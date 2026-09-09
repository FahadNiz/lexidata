const datasetService = require("../services/dataset.service");

async function getDataset(req, res, next) {
    try {
        const limit = Number(req.query.limit ?? 100);
        const offset = Number(req.query.offset ?? 0);
        const pos = req.query.pos
            ? String(req.query.pos).toLowerCase()
            : null;

        if (
            !Number.isInteger(limit) ||
            limit < 1 ||
            limit > 1000
        ) {
            return res.status(400).json({
                error: {
                    code: "INVALID_LIMIT",
                    message: "limit must be an integer between 1 and 1000."
                }
            });
        }

        if (
            !Number.isInteger(offset) ||
            offset < 0
        ) {
            return res.status(400).json({
                error: {
                    code: "INVALID_OFFSET",
                    message: "offset must be a non-negative integer."
                }
            });
        }

        const allowedPartsOfSpeech = [
            "noun",
            "verb",
            "adjective",
            "adverb"
        ];

        if (
            pos !== null &&
            !allowedPartsOfSpeech.includes(pos)
        ) {
            return res.status(400).json({
                error: {
                    code: "INVALID_POS",
                    message:
                        "pos must be one of: noun, verb, adjective, adverb."
                }
            });
        }

        const result = await datasetService.getDataset({
            limit,
            offset,
            pos
        });

        return res.status(200).json({
            data: result.words,
            pagination: {
                limit,
                offset,
                total: result.total
            }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getDataset
};