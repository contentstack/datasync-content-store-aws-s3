---
name: content-store-aws-s3-sdk
description: Use when changing the public API, configuration, S3 content-store behavior, or DataSync integration boundaries for this package.
---

# Content Store (AWS S3) API – Contentstack DataSync

## When to use

- Editing entry points in `src/index.ts` or the `S3` class in `src/s3.ts`
- Changing config defaults or validation (`src/config.ts`, `src/util/validations.ts`)
- Understanding how this package is wired into DataSync Manager and the asset store

## Instructions

### Public surface (`src/index.ts`)

Exports consumers rely on:

- **`setConfig(config)`** — merges user config; expects `contentStore` settings under the merged app config used by `start`
- **`setAssetStore(instance)`** — asset store instance (must implement `start(): Promise<any>`)
- **`getConfig()`** — returns current app config
- **`start(assetStoreInstance?, config?)`** — validates `appConfig.contentStore`, calls `init()` from `src/setup.ts`, constructs **`S3`** with asset store + AWS client + config

Type **`IConfig`** in `src/index.ts` documents the `assetStore` block; the runtime merge uses **`internalConfig`** from `src/config.ts` and **`contentStore`** for S3 (see `validateConfig(appConfig.contentStore)`).

### Implementation core

- **`src/s3.ts`** — class **`S3`**: implements publish/unpublish/delete/fetch/search flows against S3 using path patterns and messages from `src/messages.ts`
- **`src/setup.ts`** — AWS client/bootstrap for the content store
- **`typings/`** — generated declaration files; align changes with `tsc` output

### Versioning and consumers

- Package version: `package.json` `version`
- Downstream apps pass this module into **`syncManager.setContentStore(contentStore)`** (see product [README.md](../../README.md)); keep CommonJS-compatible `main`/`types` paths stable unless releasing a major version

### Errors and validation

- Config validation is centralized in **`src/util/validations.ts`**; extend there when adding required fields or stricter checks
