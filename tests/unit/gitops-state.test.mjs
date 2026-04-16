import assert from "node:assert/strict";
import test from "node:test";

import {
  buildChangeBrief,
  buildDeliveryInsights,
  buildFlowSummary,
  buildPublicState,
  buildReleaseNarrative,
  buildVersionLabel
} from "../../src/gitops-state.mjs";

const sampleState = {
  version: "1.0.0",
  changeRequest: {
    title: "Publish lesson 4 and tighten deployment feedback",
    description: "Ship a new lesson page, surface faster CI feedback, and keep rollback simple.",
    owners: ["Platform Team", "Teaching Assistants"],
    reviewers: 2,
    filesChanged: 4,
    rollbackWindowMinutes: 12
  },
  pipelineStages: [
    { name: "Unit Tests", minutes: 3, automated: true },
    { name: "Integration Tests", minutes: 5, automated: true },
    { name: "Preview Review", minutes: 8, automated: false },
    { name: "GitHub Pages Deploy", minutes: 4, automated: true }
  ]
};

test("buildVersionLabel returns a release-oriented label", () => {
  assert.equal(buildVersionLabel("1.2.3"), "Release v1.2.3");
});

test("buildChangeBrief composes upstream string utilities into release metadata", () => {
  assert.deepEqual(buildChangeBrief(sampleState.changeRequest), {
    changeSlug: "publish-lesson-4-and-tighten-deployment-feedback",
    keywordTags: ["publish", "lesson", "tighten", "deployment"],
    ownerLine: "Platform Team and Teaching Assistants",
    reviewLoad: 2
  });
});

test("buildDeliveryInsights composes upstream pipeline metrics into delivery analytics", () => {
  assert.deepEqual(buildDeliveryInsights(sampleState.pipelineStages, sampleState.changeRequest), {
    totalLeadTime: 20,
    automationRate: 75,
    manualMinutes: 8,
    reviewLoad: 2,
    readinessScore: 59,
    readinessLabel: "Medium",
    stageDag: [
      {
        name: "Unit Tests",
        dependsOn: [],
        automated: true,
        minutes: 3
      },
      {
        name: "Integration Tests",
        dependsOn: ["Unit Tests"],
        automated: true,
        minutes: 5
      },
      {
        name: "Preview Review",
        dependsOn: ["Integration Tests"],
        automated: false,
        minutes: 8
      },
      {
        name: "GitHub Pages Deploy",
        dependsOn: ["Preview Review"],
        automated: true,
        minutes: 4
      }
    ]
  });
});

test("narrative helpers explain the rollout in plain English", () => {
  const changeBrief = buildChangeBrief(sampleState.changeRequest);
  const insights = buildDeliveryInsights(sampleState.pipelineStages, sampleState.changeRequest);

  assert.equal(
    buildFlowSummary(insights),
    "20 minutes from pull request to GitHub Pages, with 8 manual minutes left in the loop."
  );
  assert.equal(
    buildReleaseNarrative(sampleState.version, changeBrief, insights),
    'Release v1.0.0 ships "publish-lesson-4-and-tighten-deployment-feedback" with 75% automation and a medium rollout score of 59.'
  );
});

test("buildPublicState carries forward raw state plus derived analytics", () => {
  const publicState = buildPublicState(sampleState, { sourceRef: "main" });

  assert.equal(publicState.versionLabel, "Release v1.0.0");
  assert.equal(publicState.changeSlug, "publish-lesson-4-and-tighten-deployment-feedback");
  assert.equal(publicState.readinessScore, 59);
  assert.equal(publicState.flowSummary, "20 minutes from pull request to GitHub Pages, with 8 manual minutes left in the loop.");
  assert.equal(publicState.releaseNarrative, 'Release v1.0.0 ships "publish-lesson-4-and-tighten-deployment-feedback" with 75% automation and a medium rollout score of 59.');
  assert.equal(publicState.sourceRef, "main");
});
