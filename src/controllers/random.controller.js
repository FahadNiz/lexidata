const randomService = require("../services/random.service");
const {
    validateFilters
} = require("../utils/word-filters");

async function getRandomWords(req, res, next) {
    try {
        const {
            limit,
            partOfSpeech,
            minLength,
            maxLength,
            startsWith,
            endsWith,
            contains
        } = req.query;

        const validationError =
            validateFilters({
                limit,
                partOfSpeech,
                minLength,
                maxLength,
                startsWith,
                endsWith,
                contains
            });

        if (validationError) {
            return res.status(400).json({
                error: validationError
            });
        }

        const result =
            await randomService.getRandomWords({
                limit,
                partOfSpeech,
                minLength,
                maxLength,
                startsWith,
                endsWith,
                contains
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