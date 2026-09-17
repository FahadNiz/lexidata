const express = require("express");
const cors = require("cors");

const rootController = require("./controllers/root.controller");
const wordRoutes = require("./routes/word.routes");
const searchRoutes = require("./routes/search.routes");
const randomRoutes = require("./routes/random.routes");
const datasetRoutes = require("./routes/dataset.routes");
const notFoundMiddleware = require("./middleware/not-found.middleware");
const errorMiddleware = require("./middleware/error.middleware");

function createApp() {
    const app = express();

    app.use(
        cors({
            origin: "*",
            methods: ["GET", "HEAD", "OPTIONS"]
        })
    );

    app.use(express.json());

    app.get("/", rootController.getRoot);
    app.get("/api", rootController.getApiIndex);
    app.get("/api/v1", rootController.getApiIndex);
    app.get("/health", rootController.getHealth);

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

    app.use(
        "/api/v1/dataset",
        datasetRoutes
    );

    app.use(notFoundMiddleware);
    app.use(errorMiddleware);

    return app;
}

module.exports = createApp;
