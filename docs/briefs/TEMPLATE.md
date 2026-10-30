# Brief NN — `<conventional PR title>`

**Mode:** <greenfield | brownfield feature | fix | refactor>. <Golden changes allowed, or "goldens stay byte-identical".> **Jira:** <KEY-N>
**Read first:** specs/NNN-feature/spec.md, plan.md, tasks.md; AGENTS.md; docs/BRAND.md for visual work

<!-- With Spec Kit: this brief stays thin. The spec, plan and tasks carry the "what" and
"how"; the brief scopes one PR to a task range and adds the gate fields Spec Kit lacks. -->

## Tasks in scope (Spec Kit only)

Implement tasks <T001–T0NN> of `specs/NNN-feature/tasks.md`. Mark each task done in tasks.md as you finish it. Leave tasks outside this range untouched.

## Assumptions (verified <YYYY-MM-DD> on <branch> <short-sha>)

<!-- Check every outside fact against the code before briefing. Each line names the
file:line or command that proves it. Run 1: every brief error was an unverified
assumption here. -->

- <fact> (`path/to/file.ts:NN`).

## Goal

<One paragraph: the observable outcome.>

## Deliverables

1. <file or behavior, with exact copy and acceptance details>

## Golden changes this PR is allowed to make

- <Add / change, by exactly what, or "none">.

## Red-then-green

<Which new tests must fail on the base and pass on the head. Brand-new modules are
exempt; the tests judge proves them by mutation.>

## CLI review

The orchestrator runs the required CodeRabbit CLI review on the pushed commit. If your task's review is enabled, run `coderabbit review --agent` on your patch too, and list its findings as fixed or skipped. If it is blocked, say so.

## ALLOW

```
ALLOW: <glob>
```

<Files that must not change.>

## Required checks

- <exact commands>

## Report

Changed files with the count, the output of each check, red-then-green evidence, and the CLI review status.
