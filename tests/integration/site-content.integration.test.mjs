import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

test("frontend fetches the deployment data file used by the teaching page", async () => {
  const appScript = await readFile(path.join(ROOT_DIR, "site", "app.js"), "utf8");
  assert.match(appScript, /fetch\("\.\/site-data\.json"/);
  assert.match(appScript, /readinessScore/);
  assert.match(appScript, /keywordTags/);
  assert.match(appScript, /pipelineStages/);
});

test("the live page contains the meaningful teaching sections", async () => {
  const html = await readFile(path.join(ROOT_DIR, "site", "index.html"), "utf8");

  assert.match(html, /id="course-title"/);
  assert.match(html, /id="change-title"/);
  assert.match(html, /id="release-notes"/);
  assert.match(html, /id="student-questions"/);
  assert.match(html, /id="pipeline-stages"/);
  assert.match(html, /id="dag-graph"/);
  assert.match(html, /id="readiness-score"/);
});
