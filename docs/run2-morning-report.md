# Run 2 report (2026-10-31, 07:00 UTC)

## Where it stands

- **All 9 lane-map PRs are merged**, plus two follow-ups (5b and 9b) and two docs PRs. Every merge went
  through `scripts/golden/strict-gate.sh`:
  - CodeRabbit approved the exact head, no thread was open, and CI was green.
  - The maintainer merged PRs #2, #3, #4 and #6, and docs PR #1.
  - From 03:03 UTC the maintainer authorized the orchestrator to merge gated PRs. It then merged
    #7, #8, #9, #10, #11, #12, #13 and #15 with `--match-head-commit`.
- **Jira:** SC-26 through SC-34 are Done. The post-merge automation never moved a ticket, so each
  one was moved by hand (PLAYBOOK step 11).
- **Code writing:** every product change came from the Coding Agent. The orchestrator wrote only
  briefs, specs, round messages and this log. The Codex judges ran read-only.

## Per PR (from `docs/stage-log.csv`)

Elapsed time runs from the first task start to the merge. Wait times are included in it.

| PR | GitHub | Elapsed (min) | Maintainer wait | CodeRabbit wait | Fix rounds |
|---|---|---|---|---|---|
| 1 scaffold | #2 | 443 | 366 | 21 | 0 |
| 2 domain | #4 | 714 | 133 | 8 | 1 (pre-PR) |
| 3 tooling | #3 | 142 | 115 | 8 | 1 (pre-PR) |
| 4 domain goldens | #6 | 93 | 73 | 8 | 0 |
| 5 storefront | #7 | 128 | 29 | 25 | 6 |
| 5b bag link | #9 | 36 | 0 | 5 | 0 |
| 6 detail and cart | #11 | 98 | 0 | 22 | 2 |
| 7 persistence | #10 | 101 | 70 | 11 | 1 |
| 8 checkout | #12 | 28 | 0 | 8 | 0 |
| 9 account | #13 | 48 | 0 | 19 | 1 |
| 9b success golden | #15 | 20 | 0 | 6 | 0 |

Notes:
- PR 2's 714 minutes include a 6 h 23 min pause while the Coding Agent was down (13:43 to 20:06).
- PR 7's maintainer wait was the storage-limit decision, not a merge.
- Once the orchestrator could merge, maintainer wait dropped to zero for PRs 6, 8 and 9.

## What the gates caught

- **Pre-flight stopped five briefs on real conflicts:**
  - PR 2: `golden:check` was missing, and the contract contradicted itself.
  - PR 5: the offline Geist build failed. research.md R2 was amended in #8.
  - PR 6: spec FR-008 forbade the shell change the bag link needed. That change became PR 5b.
  - PR 5b: its brief was not yet on `main`.
  - PR 6 again: the storefront 404 tests used the lamp link.
- **Judges and the CLI caught real defects before any PR was opened:**
  - light-theme contrast for orange text, the focus outline and field borders;
  - a stale "not found" view that could show the wrong page at `/`;
  - a coupon notice hidden on an empty bag;
  - a reset that left the stored key after a failed save;
  - untested FR-009, FR-003 and parse rules, found by mutation.
- **CodeRabbit PR review caught gaps the pre-PR gates missed:**
  - PR #7: the focus color had to be primary orange (US4.3), and page goldens accepted extra
    nodes.
  - PR #11 and PR #13: approved scope changes had been recorded only in round messages.

## Process issues for the next run

1. **The CLI keeps finding new Minors.** On PR 5 it raised new Minor CSS items on every pass, for 4
   extra rounds. After round 4 the remaining Minor (decorative Mint) was left for the PR review.
2. **The Codex behavior judge misapplies BASELINE.** It asked for BASELINE on page goldens four
   times, but BASELINE applies only to domain goldens (`contracts/goldens.md:3`). From PR 9 the
   prompts state this. `judges/behavior.md:7` should say it directly.
3. **Scope approvals belong in the brief on `main`.** Approvals given only in a round message were
   flagged by CodeRabbit twice. Put the `ALLOW` change in the brief before or with the PR.
4. **Updating a branch with `main` loses the approval.** CodeRabbit skips heads that only merge
   `main`, so the approval is lost. It cost two maintainer approvals (docs PR #1, PR #4). After
   that, the orchestrator merged `main` into each branch before opening it, and the problem did
   not recur.
5. **One aria snapshot flaked.** The checkout-success golden pinned Next.js's route announcer, which
   Next fills on its own timing. It failed this docs PR's CI twice; with a 20-run repeat, main passed
   13 of 20. PR 9b (#15) scoped the snapshot to `.site`, and the head then passed 20 of 20 and three
   full runs.
6. **`/speckit-converge` was not run after each merge**, though PR-MAP asks for it. It should run
   once per spec now.

## Known limit, accepted by the maintainer

A saved state over `MAX_STORED_LENGTH` (200,000 characters, about 490 one-item orders) loads as
empty, per the persistence contract. PR #10 documents it.

## Needs the maintainer

- Deep Scan baseline (after PR 5) and the pre-release Deep Scan (after PR 9). Both are on the
  maintainer list in PR-MAP.
- Merge this docs PR (stage log and report).
