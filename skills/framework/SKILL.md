---
name: framework
description: Use when working with AWS S3, aws-sdk usage, environment assumptions, or DataSync-related dependencies in this package.
---

# Framework & platform – Contentstack DataSync Content Store (AWS S3)

## When to use

- Changing `src/setup.ts`, S3 client usage in `src/s3.ts`, or AWS-specific options
- Discussing Node.js runtime, region, or credential patterns for consumers
- Updating `aws-sdk` or related typings

## Instructions

### AWS

- This package uses **AWS SDK for JavaScript v2** (`aws-sdk` in `dependencies`)
- Typical consumer configuration includes **region**, **credentials**, **bucket**, ACL/CORS/Policy as documented in [README.md](../../README.md); implementation details live in `src/config.ts` and `src/setup.ts`

### DataSync ecosystem

- Integrates with **`@contentstack/webhook-listener`** (dependency) at the ecosystem level; this repo implements the **content store** contract consumed by DataSync Manager (not bundled here)
- **Asset store** is a separate package; `setAssetStore` wires the asset store instance into `S3` for coordinated behavior

### Examples

- [example/](../../example/) contains mock-oriented samples (`example/mock/`); use for local exploration, not production secrets

### Packaging

- **Main:** `dist` (compiled JS); ensure `npm run build-ts` is run before publish
- **Types:** `./typings` per `package.json`

## References

- [skills/content-store-aws-s3-sdk/SKILL.md](../content-store-aws-s3-sdk/SKILL.md)
- [README.md](../../README.md) — configuration tables
