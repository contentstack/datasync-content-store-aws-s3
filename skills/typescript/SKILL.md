---
name: typescript
description: Use when editing TypeScript source, tsconfig, typings output, or matching TSLint rules in this repository.
---

# TypeScript – Contentstack DataSync Content Store (AWS S3)

## When to use

- Adding or changing `.ts` files under `src/`
- Adjusting compiler options or declaration output
- Ensuring code style matches **TSLint** (`tslint.json`)

## Instructions

### Layout

- **Source:** `src/` only (see `tsconfig.json` `include`)
- **Emit:** JavaScript to `dist/`, declarations to `typings/`
- **Tests:** colocated under `src/__tests__/` with `*.test.ts` (see [jest.config.js](../../jest.config.js))

### Compiler expectations

- **Module:** CommonJS; **target:** ES6; **strictness:** `alwaysStrict`, `noImplicitReturns`, `noUnusedLocals`, `noUnusedParameters`, etc. (see [tsconfig.json](../../tsconfig.json))
- Prefer matching existing patterns: lodash imports, `Debug` from `debug`, explicit interfaces where the file already uses them

### Lint

- Run `npm run tslint` before PRs; rules extend `tslint:recommended` with project-specific limits (e.g. `max-file-line-count`, `max-line-length` 120) — see [tslint.json](../../tslint.json)

### Types for dependencies

- `@types/node`, `@types/aws-sdk`, `@types/lodash`, etc. are listed in `devDependencies`; keep versions compatible with the **TypeScript 4.x** toolchain in use

## References

- [skills/dev-workflow/SKILL.md](../dev-workflow/SKILL.md)
- [skills/testing/SKILL.md](../testing/SKILL.md)
