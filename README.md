# Lexicon

An open-source English dictionary API powered by WordNet, PostgreSQL, Node.js, and Express.

Lexicon provides a REST API for accessing English words, definitions, examples, pronunciations, parts of speech, and WordNet senses.

It is designed for applications that need dictionary data, word discovery, search, random word generation, NLP utilities, educational tools, games, language-learning applications, and other language-focused projects.

## Features

- Word lookup
- Definitions
- Examples
- Pronunciations
- Multiple senses per word
- Parts of speech
- WordNet synset identifiers
- Prefix search
- Exact search
- Contains search
- Pagination
- Random word generation
- Part-of-speech filtering
- Minimum and maximum word length filtering
- Prefix, suffix, and contains filtering
- PostgreSQL-backed storage
- REST API
- Open-source development model

## Tech Stack

- Node.js
- Express
- PostgreSQL
- WordNet
- JavaScript
- `pg`
- Nodemon

## Current Version

`v1.0.0`

Lexicon v1 focuses on the core dictionary API, word lookup, search, random word generation, and reusable word filtering.

Future releases may add dataset exports, additional API endpoints, developer tooling, an npm package, and a public web interface.

## Quick Start

### Requirements

Install:

- Node.js 24 or later
- PostgreSQL 18 or compatible PostgreSQL version
- Git

### Clone

```bash
git clone https://github.com/FahadNiz/lexicon.git
cd lexicon