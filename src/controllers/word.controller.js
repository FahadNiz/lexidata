const wordService = require("../services/word.service");

async function getWord(req, res, next) {
    try {
        const { word } = req.params;

        if (!word || !word.trim()) {
            return res.status(400).json({
                error: {
                    code: "INVALID_WORD",
                    message: "A word is required."
                }
            });
        }

        const result =
            await wordService.findWord(word);

        if (!result) {
            return res.status(404).json({
                error: {
                    code: "WORD_NOT_FOUND",
                    message: `Word '${word}' was not found.`
                }
            });
        }

        return res.status(200).json({
            data: result
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getWord
};