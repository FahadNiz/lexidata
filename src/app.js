const express = require("express");
const cors = require("cors");

const wordRoutes = require("./routes/word.routes");
const searchRoutes = require("./routes/search.routes");
const randomRoutes = require("./routes/random.routes");
const notFoundMiddleware = require("./middleware/not-found.middleware");
const errorMiddleware = require("./middleware/error.middleware");

function createApp() {
    const app = express();

    app.use(
        cors({
            origin: [
                "https://lexidata.dev",
                "http://localhost:3000"
            ],
            methods: ["GET", "HEAD", "OPTIONS"]
        })
    );

    app.use(express.json());

    app.get("/health", (req, res) => {
        res.status(200).json({
            status: "ok"
        });
    });

    app.use(
        "/api/v1/words",
        wordRoutes
    );

    app.use(
        "/api/v1/search",
        searchRoutes
    );

    app.use(
        "/api/v1/random",
        randomRoutes
    );

    app.use(notFoundMiddleware);
    app.use(errorMiddleware);

    return app;
}

module.exports = createApp;