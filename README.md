# Lexidata

Open lexical data and a developer-friendly REST API for English words.

Lexidata is an open-source project built with Node.js, Express, PostgreSQL, and data derived from Princeton WordNet.

It provides word lookup, definitions, examples, pronunciations, parts of speech, search, random words, and reusable word filters.

## v1.0.0

Lexidata v1 provides the core dictionary API and query system.

### Features

- Word lookup
- Case-insensitive lookup
- Definitions
- Examples
- Pronunciations
- Multiple senses
- Parts of speech
- WordNet synset identifiers
- Prefix search
- Exact search
- Contains search
- Pagination
- Random words
- Part-of-speech filtering
- Minimum and maximum word length filtering
- Prefix, suffix, and contains filtering
- PostgreSQL-backed storage
- Automated API tests
- GitHub Actions CI

## Quick Start

### Requirements

- Node.js 24+
- PostgreSQL 18 or compatible PostgreSQL version
- Git

### Clone

```bash
git clone https://github.com/FahadNiz/lexidata.git
cd lexidata