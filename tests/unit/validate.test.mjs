import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { validateState } from "../../scripts/validate.mjs";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

async function readJson(relativePath) {
  const raw = await readFile(path.join(ROOT_DIR, relativePath), "utf8");
  return JSON.parse(raw);
}

test("main desired state is valid", async () => {
  const state = await readJson("content/site-state.json");
  assert.deepEqual(validateState(state), []);
});

test("good example desired state is valid", async () => {
  const state = await readJson("examples/good-change/site-state.json");
  assert.deepEqual(validateState(state), []);
});
