# Project Summary

I set up automatic preview links for pull requests on a Cloudflare Worker. When someone opens a PR, a GitHub Actions workflow deploys that branch's code to its own Cloudflare Preview URL (`pr-<number>-…workers.dev`) and posts the link as a comment on the PR. Every new push updates the same link. When the PR is merged or closed, the workflow deletes the preview. The live production site is never touched, so changes can be tested on a real URL before they ship.

I tested it end to end with PR #1. The preview served the new version (`v2`) while production stayed on `v1`, and the preview was removed automatically on merge. Along the way I found that the Wrangler config needs `"previews": {}`, otherwise the preview command fails.
