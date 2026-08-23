const randomService = require("../services/random.service");

const VALID_PARTS_OF_SPEECH = new Set([
    "noun",
    "verb",
    "adjective",
    "adverb"
]);

async function getRandomWords(req, res, next) {
    try {
        const {
            limit,
            partOfSpeech,
            minLength,
            maxLength
        } = req.query;

        if (
            limit !== undefined &&
            (
                !/^\d+$/.test(String(limit)) ||
                Number(limit) < 1 ||
                Number(limit) > 100
            )
        ) {
            return res.status(400).json({
                error: {
                    code: "INVALID_LIMIT",
                    message:
                        "The 'limit' parameter must be an integer between 1 and 100."
                }
            });
        }

        const normalizedPartOfSpeech =
            partOfSpeech !== undefined
                ? String(partOfSpeech).toLowerCase()
                : undefined;

        if (
            normalizedPartOfSpeech !== undefined &&
            !VALID_PARTS_OF_SPEECH.has(
                normalizedPartOfSpeech
            )
        ) {
            return res.status(400).json({
                error: {
                    code: "INVALID_PART_OF_SPEECH",
                    message:
                        "The 'partOfSpeech' parameter must be one of: noun, verb, adjective, adverb."
                }
            });
        }

        if (
            minLength !== undefined &&
            (
                !/^\d+$/.test(String(minLength)) ||
                Number(minLength) < 1
            )
        ) {
            return res.status(400).json({
                error: {
                    code: "INVALID_MIN_LENGTH",
                    message:
                        "The 'minLength' parameter must be a positive integer."
                }
            });
        }

        if (
            maxLength !== undefined &&
            (
                !/^\d+$/.test(String(maxLength)) ||
                Number(maxLength) < 1
            )
        ) {
            return res.status(400).json({
                error: {
                    code: "INVALID_MAX_LENGTH",
                    message:
                        "The 'maxLength' parameter must be a positive integer."
                }
            });
        }

        if (
            minLength !== undefined &&
            maxLength !== undefined &&
            Number(minLength) > Number(maxLength)
        ) {
            return res.status(400).json({
                error: {
                    code: "INVALID_LENGTH_RANGE",
                    message:
                        "The 'minLength' parameter cannot be greater than 'maxLength'."
                }
            });
        }

        const result =
            await randomService.getRandomWords({
                limit,
                partOfSpeech:
                    normalizedPartOfSpeech,
                minLength,
                maxLength
            });

        return res.status(200).json({
            data: result
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getRandomWords
};