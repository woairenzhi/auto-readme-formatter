# Auto README Formatter

[![GitHub Super-Linter](https://img.shields.io/badge/GitHub%20Action-Ready-blue?style=flat-square&logo=github-actions)](https://github.com/features/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-%E2%9D%A4%EF%B8%8F-pink?style=flat-square&logo=github-sponsors)](https://github.com/sponsors/woairenzhi)

A GitHub Action that automatically formats your README.md files. It generates a table of contents, fixes whitespace, standardizes badges, and adds a GitHub Sponsors section.

## Features

- **Table of Contents** - Auto-generates a TOC from your markdown headings (h2 and h3)
- **Whitespace Fixes** - Removes trailing whitespace from all lines
- **Badge Standardization** - Normalizes shields.io badge formatting and removes duplicates
- **Sponsors Section** - Adds a GitHub Sponsors link at the bottom of your README

## Usage

Create a workflow file (e.g., `.github/workflows/format-readme.yml`):

```yaml
name: Format README

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  format:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: woairenzhi/auto-readme-formatter@v1
        with:
          file-path: README.md
          generate-toc: true
          fix-whitespace: true
          standardize-badges: true
          add-sponsors-link: true
      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "chore: auto-format README.md"
```

## Inputs

| Input | Description | Default | Required |
|-------|-------------|---------|----------|
| `file-path` | Path to the README file | `README.md` | No |
| `generate-toc` | Generate a table of contents | `true` | No |
| `fix-whitespace` | Fix trailing whitespace | `true` | No |
| `standardize-badges` | Standardize badge formatting | `true` | No |
| `add-sponsors-link` | Add GitHub Sponsors link | `true` | No |
| `commit-message` | Commit message for auto-commit | `chore: auto-format README.md` | No |

## License

MIT

## Sponsors

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-%E2%9D%A4%EF%B8%8F-pink?style=flat-square&logo=github-sponsors)](https://github.com/sponsors/woairenzhi)

Support this project by becoming a sponsor!
