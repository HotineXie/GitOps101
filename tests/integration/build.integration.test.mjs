import assert from "node:assert/strict";
import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";

import { buildSite } from "../../scripts/build.mjs";

test("buildSite produces a deployable artifact", async () => {
  const outputDir = await mkdtemp(path.join(tmpdir(), "gitops101-build-"));

  try {
    const metadata = await buildSite({
      outputDir,
      env: {
        GITOPS_COMMIT_SHA: "abc1234def5678",
        GITOPS_DEPLOYED_AT: "2026-04-15T12:30:00.000Z",
        GITOPS_REF_NAME: "main",
        GITHUB_REPOSITORY: "HotineXie/GitOps101",
        GITHUB_SERVER_URL: "https://github.com"
      }
    });

    await access(path.join(outputDir, "index.html"));
    await access(path.join(outputDir, "app.js"));
    await access(path.join(outputDir, "styles.css"));
    await access(path.join(outputDir, "site-data.json"));
    await access(path.join(outputDir, ".nojekyll"));

    const raw = await readFile(path.join(outputDir, "site-data.json"), "utf8");
    const builtState = JSON.parse(raw);

    assert.equal(metadata.version, "1.0.0");
    assert.equal(builtState.shortCommitHash, "abc1234");
    assert.equal(builtState.sourceRef, "main");
    assert.equal(builtState.changeSlug, "publish-lesson-4-and-tighten-deployment-feedback");
    assert.equal(builtState.totalLeadTime, 20);
    assert.equal(builtState.readinessScore, 59);
    assert.deepEqual(builtState.keywordTags, ["publish", "lesson", "tighten", "deployment"]);
    assert.equal(
      builtState.commitUrl,
      "https://github.com/HotineXie/GitOps101/commit/abc1234def5678"
    );
  } finally {
    await rm(outputDir, { recursive: true, force: true });
  }
});
