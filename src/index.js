const { loadEnvironment } = require("./config/env");
const createApp = require("./app");

const env = loadEnvironment();
const app = createApp();

const server = app.listen(env.port, () => {
    console.log(
        `Lexicon API running on port http://localhost:${env.port}`
    );
});

function shutdown(signal) {
    console.log(`${signal} received. Shutting down Lexicon API...`);

    server.close(() => {
        console.log("Lexicon API stopped.");
        process.exit(0);
    });
}

process.on("SIGINT", () => {
    shutdown("SIGINT");
});

process.on("SIGTERM", () => {
    shutdown("SIGTERM");
});