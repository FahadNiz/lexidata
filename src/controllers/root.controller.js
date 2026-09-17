const { renderApiLandingHtml } = require("../views/landing.html");

const API_META = {
    name: "Lexidata API",
    version: "1.0.0",
    description:
        "Open lexical data and REST API for English words, definitions, senses, pronunciations, and datasets powered by Open English WordNet.",
    status: "operational",
    documentation: "https://lexidata.dev/docs",
    homepage: "https://lexidata.dev",
    repository: "https://github.com/FahadNiz/lexidata",
    npm: "https://www.npmjs.com/package/lexidata",
    endpoints: {
        words: {
            path: "/api/v1/words/:word",
            method: "GET",
            description:
                "Retrieve full lexical entry for a word including definitions, pronunciations, parts of speech, and synsets.",
            example: "/api/v1/words/lexicon"
        },
        search: {
            path: "/api/v1/search",
            method: "GET",
            params: {
                q: "Search term (required)",
                match: "prefix | suffix | contains | exact | regex (default: prefix)",
                partOfSpeech: "noun | verb | adj | adv",
                minLength: "integer",
                maxLength: "integer",
                limit: "integer (1-100, default: 20)",
                page: "integer (default: 1)"
            },
            description:
                "Search words with pattern matching, POS, and length filters.",
            example: "/api/v1/search?q=comput&limit=10"
        },
        random: {
            path: "/api/v1/random",
            method: "GET",
            params: {
                limit: "integer (1-100, default: 1)",
                partOfSpeech: "noun | verb | adj | adv",
                minLength: "integer",
                maxLength: "integer"
            },
            description:
                "Retrieve random words with optional part of speech and length filters.",
            example: "/api/v1/random?limit=5"
        },
        dataset: {
            path: "/api/v1/dataset",
            method: "GET",
            params: {
                format: "json | jsonl | csv | txt (default: json)",
                fields: "comma-separated fields (default: all)",
                partOfSpeech: "noun | verb | adj | adv",
                limit: "integer (default: 100)",
                page: "integer (default: 1)"
            },
            description:
                "Export structured dictionary datasets in various formats.",
            example: "/api/v1/dataset?format=json&limit=50"
        },
        health: {
            path: "/health",
            method: "GET",
            description: "API health check endpoint.",
            example: "/health"
        }
    }
};

function prefersHtml(req) {
    if (req.query.format === "json") {
        return false;
    }

    const accept = req.headers.accept || "";

    if (accept.includes("text/html")) {
        return true;
    }

    return false;
}

function getRoot(req, res) {
    if (prefersHtml(req)) {
        const html = renderApiLandingHtml(API_META);
        return res.status(200).type("html").send(html);
    }

    return res.status(200).json(API_META);
}

function getApiIndex(req, res) {
    if (prefersHtml(req)) {
        const html = renderApiLandingHtml(API_META);
        return res.status(200).type("html").send(html);
    }

    return res.status(200).json(API_META);
}

function getHealth(req, res) {
    return res.status(200).json({
        status: "ok"
    });
}

module.exports = {
    API_META,
    getRoot,
    getApiIndex,
    getHealth
};
