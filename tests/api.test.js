const test = require("node:test");
const assert = require("node:assert/strict");

const http = require("node:http");

const createApp = require("../src/app");

let server;
let baseUrl;

function request(path) {
    return new Promise((resolve, reject) => {
        const req = http.get(
            `${baseUrl}${path}`,
            (res) => {
                let body = "";

                res.on("data", (chunk) => {
                    body += chunk;
                });

                res.on("end", () => {
                    let data;

                    try {
                        data = JSON.parse(body);
                    } catch {
                        data = body;
                    }

                    resolve({
                        statusCode: res.statusCode,
                        data
                    });
                });
            }
        );

        req.on("error", reject);
    });
}

test.before(async () => {
    const app = createApp();

    server = await new Promise((resolve) => {
        const instance = app.listen(0, () => {
            resolve(instance);
        });
    });

    const address = server.address();

    baseUrl = `http://127.0.0.1:${address.port}`;
});

test.after(async () => {
    await new Promise((resolve, reject) => {
        server.close((error) => {
            if (error) {
                reject(error);
                return;
            }

            resolve();
        });
    });
});

test("GET /health returns ok", async () => {
    const response =
        await request("/health");

    assert.equal(response.statusCode, 200);
    assert.deepEqual(
        response.data,
        {
            status: "ok"
        }
    );
});

test("GET /api/v1/words/communicate returns dictionary data", async () => {
    const response =
        await request(
            "/api/v1/words/communicate"
        );

    assert.equal(response.statusCode, 200);

    assert.equal(
        response.data.data.word,
        "communicate"
    );

    assert.ok(
        Array.isArray(
            response.data.data.senses
        )
    );

    assert.ok(
        response.data.data.senses.length > 0
    );
});

test("word lookup is case-insensitive", async () => {
    const response =
        await request(
            "/api/v1/words/COMMUNICATE"
        );

    assert.equal(response.statusCode, 200);
    assert.equal(
        response.data.data.word,
        "communicate"
    );
});

test("unknown word returns 404", async () => {
    const response =
        await request(
            "/api/v1/words/thisworddoesnotexist"
        );

    assert.equal(response.statusCode, 404);

    assert.equal(
        response.data.error.code,
        "WORD_NOT_FOUND"
    );
});

test("search requires q", async () => {
    const response =
        await request(
            "/api/v1/search"
        );

    assert.equal(response.statusCode, 400);

    assert.equal(
        response.data.error.code,
        "INVALID_QUERY"
    );
});

test("search returns paginated results", async () => {
    const response =
        await request(
            "/api/v1/search?q=comput&limit=10&page=1"
        );

    assert.equal(response.statusCode, 200);

    assert.equal(
        response.data.data.query,
        "comput"
    );

    assert.ok(
        Array.isArray(
            response.data.data.results
        )
    );

    assert.ok(
        response.data.data.results.length <= 10
    );

    assert.equal(
        response.data.data.pagination.limit,
        10
    );

    assert.ok(
        response.data.data.pagination.total > 0
    );
});

test("exact search returns computer only", async () => {
    const response =
        await request(
            "/api/v1/search?q=computer&match=exact"
        );

    assert.equal(response.statusCode, 200);

    assert.deepEqual(
        response.data.data.results,
        ["computer"]
    );

    assert.equal(
        response.data.data.filters.match,
        "exact"
    );
});

test("invalid search match returns 400", async () => {
    const response =
        await request(
            "/api/v1/search?q=computer&match=banana"
        );

    assert.equal(response.statusCode, 400);

    assert.equal(
        response.data.error.code,
        "INVALID_MATCH"
    );
});

test("random endpoint returns requested number of words", async () => {
    const response =
        await request(
            "/api/v1/random?limit=5"
        );

    assert.equal(response.statusCode, 200);

    assert.equal(
        response.data.data.count,
        5
    );

    assert.equal(
        response.data.data.words.length,
        5
    );
});

test("random endpoint supports part of speech filtering", async () => {
    const response =
        await request(
            "/api/v1/random?limit=5&partOfSpeech=noun"
        );

    assert.equal(response.statusCode, 200);

    assert.equal(
        response.data.data.count,
        5
    );

    assert.equal(
        response.data.data.filters.partOfSpeech,
        "noun"
    );
});

test("invalid part of speech returns 400", async () => {
    const response =
        await request(
            "/api/v1/random?limit=5&partOfSpeech=banana"
        );

    assert.equal(response.statusCode, 400);

    assert.equal(
        response.data.error.code,
        "INVALID_PART_OF_SPEECH"
    );
});

test("invalid random limit returns 400", async () => {
    const response =
        await request(
            "/api/v1/random?limit=101"
        );

    assert.equal(response.statusCode, 400);

    assert.equal(
        response.data.error.code,
        "INVALID_LIMIT"
    );
});

test("unknown route returns 404", async () => {
    const response =
        await request(
            "/api/v1/does-not-exist"
        );

    assert.equal(response.statusCode, 404);
});