---
name: code-review
description: Use when preparing or reviewing pull requests for this repository—scope, tests, security, and API stability.
---

# Code review – Contentstack DataSync Content Store (AWS S3)

## When to use

- Authoring a PR that touches `src/`, tests, or config
- Reviewing a teammate’s change for this npm package

## Instructions

### Checklist

- **Scope:** Change matches the stated goal; no unrelated refactors or drive-by formatting outside touched lines
- **Build:** `npm run build-ts` succeeds; `typings/` and `dist/` behavior is intentional if committed (prefer not to commit stale build output unless repo convention requires it—check `.gitignore` and existing practice)
- **Tests:** `npm test` passes; new behavior has tests where feasible
- **Lint:** `npm run tslint` passes
- **API:** Public exports in `src/index.ts` and documented config keys remain backward compatible, or version bump + changelog is planned
- **Security:** No secrets; AWS credentials only via documented consumer config, not hardcoded
- **Dependencies:** New packages are justified; lockfile updated if the project uses one

### Severity (optional)

| Level | Examples |
| --- | --- |
| **Blocker** | Broken build, failing tests, secret leak, breaking API without version strategy |
| **Major** | Missing tests for non-trivial logic, unclear validation, regression risk |
| **Minor** | Naming nits, small doc gaps, optional refactors |
