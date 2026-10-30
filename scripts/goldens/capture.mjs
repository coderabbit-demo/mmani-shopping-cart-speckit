import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const args = process.argv.slice(2);
let check = false;
let scenarioPath = join(root, "scripts/goldens/scenarios.mjs");
let output = join(root, "tests/golden/domain");

try {
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--check") check = true;
    else if ((args[i] === "--scenarios" || args[i] === "--output") && args[i + 1]) {
      const value = resolve(args[++i]);
      if (args[i - 1] === "--scenarios") scenarioPath = value;
      else output = value;
    } else throw new Error(`Invalid argument: ${args[i]}`);
  }

  const { scenarios } = await import(pathToFileURL(scenarioPath).href);
  if (!Array.isArray(scenarios)) throw new Error("scenarios must be an array");
  const names = new Set();
  for (const scenario of scenarios) {
    if (!scenario || typeof scenario.name !== "string" || !/^[a-z0-9-]+$/.test(scenario.name) || typeof scenario.run !== "function" || names.has(scenario.name)) {
      throw new Error("Scenario names must be unique and match ^[a-z0-9-]+$, with a run function");
    }
    names.add(scenario.name);
  }

  const files = new Map();
  for (const scenario of scenarios) {
    const json = JSON.stringify(scenario.run(), null, 2);
    if (json === undefined) throw new Error(`Scenario ${scenario.name} did not return a JSON value`);
    files.set(`${scenario.name}.json`, `${json}\n`);
  }
  const manifest = [...files.keys()].sort().map((name) => `${createHash("sha256").update(files.get(name)).digest("hex")}  ${name}\n`).join("");
  files.set("MANIFEST.sha256", manifest);

  if (check) {
    if (scenarios.length === 0 && !existsSync(output)) process.exitCode = 0;
    else {
      const entries = existsSync(output) ? readdirSync(output, { withFileTypes: true }) : [];
      const actual = new Map(entries.map((entry) => [entry.name, entry]));
      const mismatches = new Set();
      for (const [name, contents] of files) {
        if (!actual.get(name)?.isFile() || !readFileSync(join(output, name)).equals(Buffer.from(contents))) mismatches.add(name);
      }
      if (!actual.get("BASELINE")?.isFile()) mismatches.add("BASELINE");
      for (const name of actual.keys()) if (name !== "BASELINE" && !files.has(name)) mismatches.add(name);
      for (const name of [...mismatches].sort()) console.log(`golden mismatch: ${name.endsWith(".json") ? name.slice(0, -5) : name}`);
      if (mismatches.size) process.exitCode = 1;
    }
  } else {
    const baseline = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
    mkdirSync(output, { recursive: true });
    for (const entry of readdirSync(output, { withFileTypes: true })) {
      if (entry.name.endsWith(".json") && !files.has(entry.name) && (entry.isFile() || entry.isSymbolicLink())) {
        unlinkSync(join(output, entry.name));
      }
    }
    const staging = mkdtempSync(join(output, ".golden-capture-"));
    try {
      for (const [name, contents] of [...files, ["BASELINE", `${baseline}\n`]]) {
        writeFileSync(join(staging, name), contents);
        renameSync(join(staging, name), join(output, name));
      }
    } finally {
      rmSync(staging, { recursive: true, force: true });
    }
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
