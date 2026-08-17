const express = require("express");
const app = express();
const PORT = 3000;

const words = {
    hello: {
        word: "hello",
        definition: "A greeting or expression of goodwill.",
        partOfSpeech: "interjection"
    },

    computer: {
        word: "computer",
        definition: "An electronic device that processes data.",
        partOfSpeech: "noun"
    },

    lexicon: {
        word: "lexicon",
        definition: "A vocabulary or collection of words.",
        partOfSpeech: "noun"
    }
};

app.get("/api/words/:word", (req, res) => {
    const word = req.params.word;
    const result = words[word];

    res.json(result);
});

app.listen(PORT, () => {
    console.log(`Lexicon Api running on port , ${PORT} , http://localhost:${PORT}`)
} );