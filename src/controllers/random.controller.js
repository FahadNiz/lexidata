const randomService = require("../services/random.service");

async function getRandomWords(req, res, next) {
    try {
        const { limit } = req.query;

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

        const result =
            await randomService.getRandomWords(
                limit
            );

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