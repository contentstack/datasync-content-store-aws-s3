---
name: dev-workflow
description: Use when setting up the repo locally, running build/test/lint, Husky, or interpreting CI workflows for this package.
---

# Development workflow – Contentstack DataSync Content Store (AWS S3)

## When to use

- First-time clone or onboarding to this repository
- Running the standard build, test, or lint commands
- Understanding what runs in GitHub Actions (security / policy, not a dedicated unit-test workflow)

## Instructions

### Prerequisites

- **Node.js** `>=22` per `package.json` `engines`
- Install dependencies: `npm install`

### Commands (from repo root)

| Task | Command |
| --- | --- |
| Clean build artifacts | `npm run clean` |
| Compile TypeScript | `npm run build-ts` (runs `clean` then `tsc`) |
| Watch mode compile | `npm run watch-ts` |
| Lint (TSLint, auto-fix) | `npm run tslint` |
| Tests with coverage | `npm test` |

### Git hooks

- `pre-commit` script installs Husky; use when setting up hooks: `npm run pre-commit` (see `package.json` `scripts`)

### CI

- [.github/workflows/sca-scan.yml](../../.github/workflows/sca-scan.yml) — Snyk SCA (may `continue-on-error`) and Contentstack policy
- [.github/workflows/policy-scan.yml](../../.github/workflows/policy-scan.yml), [.github/workflows/codeql-analysis.yml](../../.github/workflows/codeql-analysis.yml), [.github/workflows/issues-jira.yml](../../.github/workflows/issues-jira.yml)
- Run **`npm test`** and **`npm run tslint`** locally before relying on automation; there is no workflow here that only runs Jest.

### PR expectations

- Keep changes scoped; match existing TypeScript and TSLint style
- Do not commit secrets or real AWS credentials (see the testing skill for policy)
