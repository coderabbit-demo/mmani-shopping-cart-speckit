import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { linkSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const capture = resolve(root, "scripts/goldens/capture.mjs");

function fixture(t, source = 'export const scenarios = [{ name: "z-last", run: () => ({ total: 12 }) }, { name: "a-first", run: () => [1, 2] }];') {
  const temp = mkdtempSync(join(tmpdir(), "deskdrop-goldens-"));
  t.after(() => rmSync(temp, { recursive: true, force: true }));
  const scenarios = join(temp, "scenarios.mjs");
  const output = join(temp, "domain");
  writeFileSync(scenarios, source);
  return { scenarios, output };
}

function run({ scenarios, output }, ...args) {
  return spawnSync(process.execPath, ["--experimental-strip-types", capture, "--scenarios", scenarios, "--output", output, ...args], { cwd: root, encoding: "utf8" });
}

test("capture writes stable JSON, sorted hashes, and the source commit", (t) => {
  const files = fixture(t);
  const result = run(files);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(readdirSync(files.output).sort(), ["BASELINE", "MANIFEST.sha256", "a-first.json", "z-last.json"]);
  const first = '[\n  1,\n  2\n]\n';
  const last = '{\n  "total": 12\n}\n';
  assert.equal(readFileSync(join(files.output, "a-first.json"), "utf8"), first);
  assert.equal(readFileSync(join(files.output, "z-last.json"), "utf8"), last);
  const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
  assert.equal(readFileSync(join(files.output, "MANIFEST.sha256"), "utf8"), `${hash(first)}  a-first.json\n${hash(last)}  z-last.json\n`);
  assert.equal(readFileSync(join(files.output, "BASELINE"), "utf8").trim(), execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim());
  assert.equal(run(files, "--check").status, 0);
  writeFileSync(join(files.output, "BASELINE"), "different commit\n");
  assert.equal(run(files, "--check").status, 0);
});

test("recapture removes obsolete scenario JSON and retains unrelated files", (t) => {
  const files = fixture(t);
  assert.equal(run(files).status, 0);
  const note = join(files.output, "notes.txt");
  writeFileSync(note, "keep me\n");
  writeFileSync(files.scenarios, 'export const scenarios = [{ name: "a-first", run: () => [1, 2] }];');
  assert.equal(run(files).status, 0);
  assert.deepEqual(readdirSync(files.output).sort(), ["BASELINE", "MANIFEST.sha256", "a-first.json", "notes.txt"]);
  assert.equal(readFileSync(note, "utf8"), "keep me\n");
  const checkWithNote = run(files, "--check");
  assert.equal(checkWithNote.status, 1);
  assert.match(checkWithNote.stdout, /golden mismatch: notes\.txt/);
  rmSync(note);
  assert.equal(run(files, "--check").status, 0);
});

test("capture does not overwrite files outside the output directory through links", (t) => {
  const files = fixture(t);
  mkdirSync(files.output);
  const outside = join(files.output, "..", "outside.txt");
  writeFileSync(outside, "untouched\n");
  symlinkSync(outside, join(files.output, "a-first.json"));
  linkSync(outside, join(files.output, "z-last.json"));
  symlinkSync(outside, join(files.output, "obsolete.json"));
  assert.equal(run(files).status, 0);
  assert.equal(readFileSync(outside, "utf8"), "untouched\n");
  assert.equal(run(files, "--check").status, 0);
});

test("check reports changed, missing, and extra files", (t) => {
  const files = fixture(t);
  assert.equal(run(files).status, 0);
  writeFileSync(join(files.output, "a-first.json"), "changed\n");
  rmSync(join(files.output, "z-last.json"));
  writeFileSync(join(files.output, "extra.json"), "{}\n");
  const result = run(files, "--check");
  assert.equal(result.status, 1);
  for (const name of ["a-first", "z-last", "extra"]) assert.match(result.stdout, new RegExp(`golden mismatch: ${name}`));
});

test("check verifies manifest and presence of BASELINE", (t) => {
  const files = fixture(t);
  assert.equal(run(files).status, 0);
  writeFileSync(join(files.output, "MANIFEST.sha256"), "wrong\n");
  rmSync(join(files.output, "BASELINE"));
  const result = run(files, "--check");
  assert.equal(result.status, 1);
  assert.match(result.stdout, /golden mismatch: MANIFEST\.sha256/);
  assert.match(result.stdout, /golden mismatch: BASELINE/);
});

test("check compares bytes and treats directories as missing files", (t) => {
  const files = fixture(t, 'export const scenarios = [{ name: "encoding", run: () => "\\ufffd" }];');
  assert.equal(run(files).status, 0);
  writeFileSync(join(files.output, "encoding.json"), Buffer.from([0x22, 0xff, 0x22, 0x0a]));
  rmSync(join(files.output, "BASELINE"));
  mkdirSync(join(files.output, "BASELINE"));
  const result = run(files, "--check");
  assert.equal(result.status, 1);
  assert.match(result.stdout, /golden mismatch: encoding/);
  assert.match(result.stdout, /golden mismatch: BASELINE/);
});

test("zero scenarios need no output directory", (t) => {
  const files = fixture(t, "export const scenarios = [];\n");
  assert.equal(run(files, "--check").status, 0);
});

test("invalid or duplicate scenario names fail before writing", (t) => {
  for (const source of [
    'export const scenarios = [{ name: "../escape", run: () => 1 }];',
    'export const scenarios = [{ name: "same", run: () => 1 }, { name: "same", run: () => 2 }];',
  ]) {
    const files = fixture(t, source);
    mkdirSync(files.output);
    assert.notEqual(run(files).status, 0);
    assert.deepEqual(readdirSync(files.output), []);
  }
});
