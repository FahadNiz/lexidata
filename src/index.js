const express = require("express");

const { loadEnvironment } = require("./config/env");
const wordRoutes = require("./routes/word.routes");
const searchRoutes = require("./routes/search.routes");
const randomRoutes = require("./routes/random.routes");
const notFoundMiddleware = require("./middleware/not-found.middleware");
const errorMiddleware = require("./middleware/error.middleware");

const env = loadEnvironment();

const app = express();

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

app.listen(env.port, () => {
    console.log(
        `Lexicon API running on port https://localhost:${env.port}`
    );
});