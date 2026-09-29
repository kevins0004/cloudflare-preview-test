# Project Summary

I set up automatic preview links for pull requests on a Cloudflare Worker. When someone opens a PR, a GitHub Actions workflow deploys that branch's code to its own Cloudflare Preview URL (`pr-<number>-…workers.dev`) and posts the link as a comment on the PR. Every new push updates the same link. When the PR is merged or closed, the workflow deletes the preview. The live production site is never touched, so changes can be tested on a real URL before they ship.

A second workflow deploys production automatically when a PR is merged into `main`, so the full flow is: open a PR, check the change at the preview link, merge, and production updates by itself (about 45 seconds from merge to live).

I tested it end to end with PR #1. The preview served the new version (`v2`) while production stayed on `v1`, and the preview was removed automatically on merge. Along the way I found that the Wrangler config needs `"previews": {}`, otherwise the preview command fails.

## How reviewers use it

1. Someone opens a PR with a change.
2. About a minute later, a comment appears on the PR with the preview link.
3. Anyone clicks it and sees the app running with that PR's change, before merge. The real site stays on the old version.
4. Pushing more fixes updates the same link.
5. Merging deploys the change to production automatically. Closing or merging the PR removes the preview link.

The preview runs the whole app from the PR's code, so any visible change (text, layout, colors) shows up at the link. For example, a PR that changes the page color from yellow to green shows green at the preview link while production stays yellow until merge.

## Workflows

- **`pr-preview.yml`** (on PR opened, pushed, reopened, closed):
  - Creates or updates the `pr-<number>` preview, prints Wrangler's output to the log, checks `/health`, and comments the link on the PR.
  - On close, deletes the preview, then checks the URL returns 404 for up to 2 minutes. If it is still live, the run shows a warning and the PR comment says so.
- **`deploy-main.yml`** (on push to `main`, plus a manual **Run workflow** button):
  - Runs `wrangler deploy` labelled with the commit SHA, then checks production `/health`.
  - Deploys queue instead of cancelling each other.
- Both skip changes that only touch `.md` files.
- Both use the repo secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

Notes:
- To use this on a real app, add both workflows and `"previews": {}` to that app's repo. It works as-is only for apps running as Cloudflare Workers.
- Preview links are public. Anyone with the URL can open them, even though the repo is private. Cloudflare Access can add a login if needed.

## Additional tests (2026-09-29)

| Test | PR | Result |
|---|---|---|
| 1. A second push updates the same link | #2 | ✅ Same URL went from `v3` to `v4`; the one PR comment was edited, not duplicated |
| 2. Close without merging | #2 | ✅ Preview deleted (404), comment updated, `main` and production untouched |
| 4. Two PRs at once | #3, #4 | ✅ Separate links (`pr-3` = `v5-A`, `pr-4` = `v5-B`); closing #3 left `pr-4` working |
| Preview shows a visual change | #5 | ✅ Preview showed yellow while production stayed blue |
| Automatic production deploy | #6, #8 | ✅ Merging #8 turned production from yellow to green with no manual deploy |
| Delete check warns when a preview stays live | #7 | ✅ Run warning and PR note added when `pr-7` was still live after 2 minutes |

## Known issue: some deleted previews stay live

For `pr-3` through `pr-9`, Cloudflare replied "deleted successfully", and a second delete returns "Preview not found", but the old preview URLs keep serving their code. `pr-1` and `pr-2` were removed correctly. This is on Cloudflare's side (Workers Previews is in open beta) and cannot be fixed from the workflow. The delete check flags it on each PR.

Reported to Cloudflare on 2026-09-29: https://github.com/cloudflare/workers-sdk/issues/15945
