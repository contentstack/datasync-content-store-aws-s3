# Contentstack DataSync Content Store (AWS S3) – Agent guide

**Universal entry point** for contributors and AI agents. Detailed conventions live in **`skills/*/SKILL.md`**.

## What this repo is

| Field | Detail |
| --- | --- |
| **Name:** | `contentstack-content-store-aws-s3` ([package.json](package.json)); published usage in docs may reference `@contentstack/datasync-content-store-aws-s3`. Repository: see [package.json `repository`](package.json) for the canonical Git URL. |
| **Purpose:** | TypeScript npm package that implements the Contentstack DataSync **content store** driver for **Amazon S3**: persists published entries, content types, and related payloads to a bucket when used with DataSync Manager and the webhook listener. |
| **Out of scope (if any):** | Does not implement the HTTP webhook server (use `@contentstack/webhook-listener`), asset storage (separate asset-store package), or DataSync orchestration (`datasync-manager`)—this repo is only the S3 content-store implementation. |

## Tech stack (at a glance)

| Area | Details |
| --- | --- |
| Language | TypeScript (see [tsconfig.json](tsconfig.json)); **Node.js** `>=22` ([package.json `engines`](package.json)). |
| Build | `npm run build-ts` → `tsc`; output `dist/`, declarations `typings/`. |
| Tests | Jest + ts-jest ([jest.config.js](jest.config.js)); tests under `src/__tests__/**/*.test.ts`. |
| Lint / coverage | TSLint ([tslint.json](tslint.json)), `npm run tslint`; Jest coverage to `coverage/` (see [jest.config.js](jest.config.js)). |
| Other | AWS SDK v2 (`aws-sdk`); lodash; debug; integrates with `@contentstack/webhook-listener` types at the DataSync boundary. |

## Commands (quick reference)

| Command type | Command |
| --- | --- |
| Build | `npm run build-ts` |
| Test | `npm test` |
| Lint | `npm run tslint` |

**CI / automation:** GitHub Actions under [.github/workflows/](.github/workflows/) (e.g. SCA via Snyk [.github/workflows/sca-scan.yml](.github/workflows/sca-scan.yml), policy scan, CodeQL, Jira integration). There is no separate workflow file in this repo that only runs `npm test`; run tests locally before opening a PR.

## Where the documentation lives: skills

| Skill | Path | What it covers |
| --- | --- | --- |
| Development workflow | [skills/dev-workflow/SKILL.md](skills/dev-workflow/SKILL.md) | Branches, commands, Husky, CI touchpoints. |
| Content Store (AWS S3) API | [skills/content-store-aws-s3-sdk/SKILL.md](skills/content-store-aws-s3-sdk/SKILL.md) | Public exports, config, DataSync boundaries, errors. |
| TypeScript conventions | [skills/typescript/SKILL.md](skills/typescript/SKILL.md) | Layout, compiler expectations, style alignment with TSLint. |
| Testing | [skills/testing/SKILL.md](skills/testing/SKILL.md) | Jest layout, mocks, coverage, credentials. |
| Code review | [skills/code-review/SKILL.md](skills/code-review/SKILL.md) | PR checklist for this package. |
| Framework & platform | [skills/framework/SKILL.md](skills/framework/SKILL.md) | AWS S3 usage, dependencies, packaging notes. |

An index with “when to use” hints is in [skills/README.md](skills/README.md).

## Using Cursor (optional)

If you use **Cursor**, [.cursor/rules/README.md](.cursor/rules/README.md) only points to **`AGENTS.md`**—same docs as everyone else.
