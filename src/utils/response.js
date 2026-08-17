function success(res, data, statusCode = 200) {
    return res.status(statusCode).json({
        success: true,
        data
    });
}

function failure(res, message, statusCode = 500) {
    return res.status(statusCode).json({
        success: false,
        error: {
            message
        }
    });
}

module.exports = {
    success,
    failure
};