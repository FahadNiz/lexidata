const { error } = require("../utils/logger");

function errorMiddleware(err, req, res, next) {
    error(err.stack || err.message);

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        error: {
            message:
                statusCode === 500
                    ? "Internal server error"
                    : err.message
        }
    });
}

module.exports = errorMiddleware;