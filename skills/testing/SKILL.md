---
name: testing
description: Use when writing Jest tests, configuring mocks, or interpreting coverage for this package.
---

# Testing – Contentstack DataSync Content Store (AWS S3)

## When to use

- Adding or changing tests under `src/__tests__/`
- Mocking HTTP with **nock** or validating utilities/messages
- Reading coverage output in `coverage/`

## Instructions

### Runner and layout

- **Jest** with **ts-jest**; config in [jest.config.js](../../jest.config.js)
- **Test match:** `src/__tests__/**/*.test.ts`
- **Environment:** `node`
- **Coverage:** collected from `src/**/*.ts` excluding `__tests__`; reporters include `text`, `lcov`, `html`

### Running tests

- `npm test` — runs Jest with colors, coverage, verbose (see `package.json` `scripts`)

### Existing tests

- `src/__tests__/messages.test.ts`, `src/__tests__/util.test.ts` — follow their patterns for imports and assertions

### Credentials and AWS

- Do **not** put real AWS keys or bucket names in tests or fixtures committed to the repo
- Prefer mocks/stubs for S3 and external calls; use **nock** for HTTP where applicable (`devDependencies` includes `nock`)

## References

- [skills/dev-workflow/SKILL.md](../dev-workflow/SKILL.md)
- [skills/framework/SKILL.md](../framework/SKILL.md)
