# Changelog

All notable Lexidata releases are documented here.

## [1.0.0] - 2026-08-23

### Added

- PostgreSQL-backed lexical data model
- WordNet validation tooling
- WordNet import pipeline
- Case-insensitive word lookup
- Definitions
- Examples
- Pronunciations
- Multiple word senses
- Parts of speech
- WordNet synset identifiers
- Prefix search
- Exact search
- Contains search
- Search pagination
- Random word generation
- Random word limits
- Part-of-speech filtering
- Minimum and maximum word length filtering
- Prefix filtering
- Suffix filtering
- Contains filtering
- Structured API errors
- Health endpoint
- Database connectivity tests
- API integration tests
- Service-level tests
- Deterministic CI database fixtures
- GitHub Actions CI
- MIT license
- WordNet third-party attribution

### API

```text
GET /health
GET /api/v1/words/:word
GET /api/v1/search
GET /api/v1/random
```

### Production

- Production API deployed at https://api.lexidata.dev
- HTTPS enabled with Let's Encrypt
- Nginx reverse proxy
- Oracle Cloud deployment
- Neon PostgreSQL production database
- systemd service management