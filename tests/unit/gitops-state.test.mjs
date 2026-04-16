import assert from "node:assert/strict";
import test from "node:test";

import {
  buildFlowSummary,
  buildPublicState,
  buildVersionLabel,
  countLearningSteps
} from "../../src/gitops-state.mjs";

test("buildVersionLabel creates the expected release label", () => {
  assert.equal(buildVersionLabel("1.2.3"), "Release v1.2.3");
});

test("countLearningSteps counts the declared GitOps flow", () => {
  assert.equal(countLearningSteps(["branch", "pr", "ci", "merge", "cd"]), 5);
  assert.equal(countLearningSteps(null), 0);
});

test("buildFlowSummary describes the full GitOps path", () => {
  const summary = buildFlowSummary(["branch", "pr", "ci", "merge", "cd"]);
  assert.equal(summary, "5 GitOps steps from branch to production");
});

test("buildPublicState adds derived display fields", () => {
  const publicState = buildPublicState(
    {
      version: "1.0.0",
      learningPath: ["branch", "pr", "ci", "merge", "cd"]
    },
    {
      sourceRef: "main"
    }
  );

  assert.equal(publicState.versionLabel, "Release v1.0.0");
  assert.equal(publicState.stepCount, 5);
  assert.equal(publicState.flowSummary, "5 GitOps steps from branch to production");
  assert.equal(publicState.sourceRef, "main");
});
