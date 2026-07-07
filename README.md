# FOSSBot Marketplace

Git-hosted marketplace index for FOSSBot stage repositories.

## Validation badges

- `Validated`: the indexed commit matches the stage repo default branch and passed marketplace validation.
- `Unvalidated`: validation is missing or stale, usually because the stage repo moved after indexing.
- `Error`: marketplace CI could not validate the stage repo or entry.
- `Verified`: a marketplace maintainer completed human review.

## CI workflow

- Pull requests validate `stages/**/*.json`, source stage repos, and create a GitHub check run.
- Pushes to `main` validate stage repos, update validation metadata in entries, regenerate `index.json`, and commit any generated changes.

## Maintainer verification

Maintainers verify a stage through normal Git review:

1. Inspect the source repo, stage content, preview, and validation result.
2. Open or approve a PR that sets `badges.verified` to `true`.
3. Fill `verification` metadata, for example:

```json
"badges": {
  "verified": true,
  "validation": "validated"
},
"verification": {
  "verified": true,
  "reviewedAt": "2026-07-07T00:00:00Z",
  "reviewedBy": "@maintainer",
  "reviewPullRequest": "https://github.com/jgenc/fossbot-marketplace/pull/1"
}
```

Republishing from the platform preserves the verified badge and verification metadata unless a maintainer changes it in this repo.
