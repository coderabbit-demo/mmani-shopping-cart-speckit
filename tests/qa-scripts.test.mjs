import assert from "node:assert/strict";
import { constants, accessSync, chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const scripts = ["setup.sh", "start.sh"];

function runWithFakeNpm(script, failBuild = false) {
  const temp = mkdtempSync(join(tmpdir(), "deskdrop-qa-"));
  try {
    const npm = join(temp, "npm");
    const log = join(temp, "calls.jsonl");
    writeFileSync(npm, `#!/usr/bin/env node
const fs = require("node:fs");
fs.appendFileSync(process.env.QA_LOG, JSON.stringify({ args: process.argv.slice(2), cwd: process.cwd(), pid: process.pid }) + "\\n");
if (process.env.QA_FAIL_BUILD === "1" && process.argv[2] === "run" && process.argv[3] === "build") process.exit(7);
`);
    chmodSync(npm, 0o755);
    const result = spawnSync(resolve(root, "scripts/qa", script), {
      cwd: temp,
      encoding: "utf8",
      env: { ...process.env, PATH: `${temp}:${process.env.PATH}`, QA_LOG: log, QA_FAIL_BUILD: failBuild ? "1" : "0" },
    });
    const calls = readFileSync(log, "utf8").trim().split("\n").map(JSON.parse);
    return { result, calls };
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

test("QA scripts are executable bash scripts with strict error handling", () => {
  for (const script of scripts) {
    const path = resolve(root, "scripts/qa", script);
    accessSync(path, constants.X_OK);
    const source = readFileSync(path, "utf8");
    assert.match(source, /^#!\/usr\/bin\/env bash\r?\nset -euo pipefail(?:\r?\n|$)/);
  }
});

test("setup installs the lockfile from the repository root", () => {
  const { result, calls } = runWithFakeNpm("setup.sh");
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(calls.map(({ args, cwd }) => ({ args, cwd })), [
    { args: ["ci"], cwd: root },
  ]);
});

test("startup builds and then execs the server on port 3100", () => {
  const { result, calls } = runWithFakeNpm("start.sh");
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(calls.map(({ args, cwd }) => ({ args, cwd })), [
    { args: ["run", "build"], cwd: root },
    { args: ["run", "start", "--", "--port", "3100"], cwd: root },
  ]);
  assert.equal(calls[1].pid, result.pid, "startup must replace its shell with npm");
  const manifest = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
  assert.match(manifest.scripts.start, /(?:^|\s)--hostname(?:=|\s+)0\.0\.0\.0(?:\s|$)/);
});

test("startup stops when the build fails", () => {
  const { result, calls } = runWithFakeNpm("start.sh", true);
  assert.equal(result.status, 7);
  assert.deepEqual(calls.map(({ args }) => args), [["run", "build"]]);
});
