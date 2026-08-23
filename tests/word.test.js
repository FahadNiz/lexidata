const test = require("node:test");
const assert = require("node:assert/strict");

const wordService = require("../src/services/word.service");

test("findWord returns dictionary data for communicate", async () => {
    const result = await wordService.findWord("communicate");

    assert.equal(result.word, "communicate");
    assert.ok(Array.isArray(result.pronunciations));
    assert.ok(result.pronunciations.includes("kəˈmjuːnɪkeɪt"));

    assert.ok(Array.isArray(result.senses));
    assert.ok(result.senses.length > 0);

    const firstSense = result.senses[0];

    assert.equal(firstSense.partOfSpeech, "verb");
    assert.equal(firstSense.synset, "00742582-v");
    assert.equal(
        firstSense.definition,
        "transmit thoughts or feelings"
    );

    assert.ok(Array.isArray(firstSense.examples));
});

test("findWord is case-insensitive", async () => {
    const result = await wordService.findWord("COMMUNICATE");

    assert.equal(result.word, "communicate");
});

test("findWord returns null for an unknown word", async () => {
    const result =
        await wordService.findWord(
            "thisworddoesnotexist"
        );

    assert.equal(result, null);
});