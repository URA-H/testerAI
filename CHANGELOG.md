# Changelog

All notable changes will be documented here.
This project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html) loosely.

## [Unreleased]

### Added
- GitHub Actions CI (lint / type-check / test / build) on push and PR.
- README badges (CI, License, Node, TypeScript).
- `CONTRIBUTING.md`, `CHANGELOG.md`, `.editorconfig`.

## [0.0.1] - 2026-06-11

### Added
- Initial scaffold of testerAI MVP.
- `.docx` → HTML via mammoth (`src/parser/docx.ts`).
- HTML + config → `TestCase[]` via Anthropic Claude (`src/generator/claude.ts`).
- `TestCase[]` + config → `.xlsx` via exceljs (`src/formatter/xlsx.ts`).
- YAML config loader with mandatory `viewpoint` column validation (`src/config/load.ts`).
- `commander`-based CLI: `testerai generate <input> [-c config] [-o output]`.
- Unit tests covering config validation and Excel column customization.
- MIT License.
