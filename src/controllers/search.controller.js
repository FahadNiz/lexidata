const searchService = require("../services/search.service");

async function searchWords(req, res, next) {
    try {
        const {
            q,
            limit,
            page
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

        if (
            page !== undefined &&
            (
                !/^\d+$/.test(String(page)) ||
                Number(page) < 1
            )
        ) {
            return res.status(400).json({
                error: {
                    code: "INVALID_PAGE",
                    message:
                        "The 'page' parameter must be a positive integer."
                }
            });
        }

        const result =
            await searchService.searchWords({
                query: q,
                limit,
                page
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