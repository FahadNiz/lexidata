const searchService = require("../services/search.service");
const {
    validateFilters
} = require("../utils/word-filters");

async function searchWords(req, res, next) {
    try {
        const {
            q,
            limit,
            page,
            partOfSpeech,
            minLength,
            maxLength,
            startsWith,
            endsWith,
            contains,
            match
        } = req.query;

        if (
            typeof q !== "string" ||
            !q.trim()
        ) {
            return res.status(400).json({
                error: {
                    code: "INVALID_QUERY",
                    message:
                        "The 'q' query parameter is required."
                }
            });
        }

        const validationError =
            validateFilters({
                limit,
                page,
                partOfSpeech,
                minLength,
                maxLength,
                startsWith,
                endsWith,
                contains,
                match
            });

        if (validationError) {
            return res.status(400).json({
                error: validationError
            });
        }

        const result =
            await searchService.searchWords({
                query: q,
                limit,
                page,
                partOfSpeech,
                minLength,
                maxLength,
                startsWith,
                endsWith,
                contains,
                match
            });

        return res.status(200).json({
            data: result
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    searchWords
};