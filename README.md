# Lexidata

Open lexical data and a developer-friendly REST API for English words.

Lexidata is an open-source project built with Node.js, Express, PostgreSQL, and data derived from Princeton WordNet.

The production API is available at:

**https://api.lexidata.dev**

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

## Production API

Base URL:

```text
https://api.lexidata.dev
```

### Health

```http
GET /health
```

Example:

```bash
curl https://api.lexidata.dev/health
```

Response:

```json
{
  "status": "ok"
}
```

### Word lookup

```http
GET /api/v1/words/:word
```

Example:

```bash
curl https://api.lexidata.dev/api/v1/words/communicate
```

The response contains the word, pronunciations, senses, parts of speech, definitions, examples, and WordNet synset identifiers.

### Search

```http
GET /api/v1/search
```

Example:

```bash
curl "https://api.lexidata.dev/api/v1/search?q=comput&limit=5"
```

Search supports matching and word filters including:

- Prefix
- Exact
- Contains
- Part of speech
- Minimum length
- Maximum length
- Starts with
- Ends with

### Random words

```http
GET /api/v1/random
```

Example:

```bash
curl "https://api.lexidata.dev/api/v1/random?limit=5"
```

Random word selection can also be filtered by part of speech and word constraints.

## Quick Start

### Requirements

- Node.js 24+
- PostgreSQL 18 or compatible PostgreSQL version
- Git

### Clone

```bash
git clone https://github.com/FahadNiz/lexidata.git
cd lexidata
```

### Install dependencies

```bash
npm install
```

### Environment

Create a `.env` file:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/lexidata
PORT=3000
```

Do not commit `.env` to the repository.

### Database

Initialize the database schema:

```bash
psql -U postgres -d lexidata -f src/database/schema.sql
```

The repository also contains tooling for validating and importing the WordNet dataset.

### Run

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

The API will be available at:

```text
http://localhost:3000
```

## Testing

Run the complete test suite:

```bash
npm test
```

Database connectivity:

```bash
npm run db:test
```

WordNet data validation:

```bash
npm run data:validate
```

## Data

Lexidata uses lexical data derived from Princeton WordNet.

See [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) for attribution and licensing information.

## Project Structure

```text
lexidata/
├── src/
│   ├── database/
│   ├── routes/
│   ├── services/
│   └── index.js
├── scripts/
├── tests/
├── .github/
├── README.md
├── CHANGELOG.md
├── CONTRIBUTING.md
└── LICENSE
```

## Development

Contributions are welcome.

Please see [CONTRIBUTING.md](CONTRIBUTING.md) before submitting changes.

## License

Lexidata is released under the MIT License.

See [LICENSE](LICENSE).

## Links

- Repository: https://github.com/FahadNiz/lexidata
- Production API: https://api.lexidata.dev
- API health: https://api.lexidata.dev/health