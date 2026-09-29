# Project Summary

I set up automatic preview links for pull requests on a Cloudflare Worker. When someone opens a PR, a GitHub Actions workflow deploys that branch's code to its own Cloudflare Preview URL (`pr-<number>-…workers.dev`) and posts the link as a comment on the PR. Every new push updates the same link. When the PR is merged or closed, the workflow deletes the preview. The live production site is never touched, so changes can be tested on a real URL before they ship.

I tested it end to end with PR #1. The preview served the new version (`v2`) while production stayed on `v1`, and the preview was removed automatically on merge. Along the way I found that the Wrangler config needs `"previews": {}`, otherwise the preview command fails.

## How reviewers use it

1. Someone opens a PR with a change.
2. About a minute later, a comment appears on the PR with the preview link.
3. Anyone clicks it and sees the app running with that PR's change, before merge. The real site stays on the old version.
4. Pushing more fixes updates the same link.
5. Closing or merging the PR removes the link.

The preview runs the whole app from the PR's code, so any visible change (text, layout, colors) shows up at the link. For example, a PR that changes the page color from blue to yellow shows yellow at the preview link while production stays blue until merge.

Notes:
- To use this on a real app, add the same workflow and `"previews": {}` to that app's repo. It works as-is only for apps running as Cloudflare Workers.
- Preview links are public. Anyone with the URL can open them, even though the repo is private. Cloudflare Access can add a login if needed.
- Merging to `main` does not update production yet. There is no deploy-on-`main` workflow.

## Additional tests (2026-09-29)

| Test | PR | Result |
|---|---|---|
| 1. A second push updates the same link | #2 | ✅ Same URL went from `v3` to `v4`; the one PR comment was edited, not duplicated |
| 2. Close without merging | #2 | ✅ Preview deleted (404), comment updated, `main` and production untouched |
| 4. Two PRs at once | #3, #4 | ✅ Separate links (`pr-3` = `v5-A`, `pr-4` = `v5-B`); closing #3 left `pr-4` working |
| 4. Cleanup of `pr-3` | #3 | ❌ Workflow ran and Cloudflare replied "deleted successfully", but `pr-3` was still serving 16+ minutes later. `pr-1` and `pr-2` cleaned up correctly. Possibly an open-beta issue when another preview exists. Not yet investigated |

Next: color demo (blue production, PR changes it to yellow, check the preview link shows yellow).
