const requiredEnvironmentVariables = [];

function loadEnvironment() {
    for (const variable of requiredEnvironmentVariables) {
        if (!process.env[variable]) {
            throw new Error(
                `Missing required environment variable: ${variable}`
            );
        }
    }

    return {
        nodeEnv: process.env.NODE_ENV || "development",
        port: Number(process.env.PORT) || 3000
    };
}

module.exports = {
    loadEnvironment
};