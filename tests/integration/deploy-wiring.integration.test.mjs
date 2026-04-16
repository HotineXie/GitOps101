import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

test("frontend fetches the build metadata file expected by deployment", async () => {
  const appScript = await readFile(path.join(ROOT_DIR, "site", "app.js"), "utf8");
  assert.match(appScript, /fetch\("\.\/site-data\.json"/);
});

test("the live page contains the required deployment markers", async () => {
  const html = await readFile(path.join(ROOT_DIR, "site", "index.html"), "utf8");

  assert.match(html, /id="version"/);
  assert.match(html, /id="commit"/);
  assert.match(html, /id="updated-at"/);
  assert.match(html, /id="source-ref"/);
});
