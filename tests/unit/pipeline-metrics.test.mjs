import assert from "node:assert/strict";
import test from "node:test";

import {
  buildReadinessLabel,
  buildStageDag,
  calculateAutomationRate,
  calculateManualMinutes,
  calculateReadinessScore,
  calculateReviewLoad,
  countAutomatedStages,
  sumStageMinutes
} from "../../src/pipeline-metrics.mjs";

const sampleStages = [
  { name: "Unit Tests", minutes: 3, automated: true },
  { name: "Integration Tests", minutes: 5, automated: true },
  { name: "Preview Review", minutes: 8, automated: false },
  { name: "GitHub Pages Deploy", minutes: 4, automated: true }
];

test("sumStageMinutes totals the delivery path duration", () => {
  assert.equal(sumStageMinutes(sampleStages), 20);
});

test("automation helpers measure how much of the pipeline is automated", () => {
  assert.equal(countAutomatedStages(sampleStages), 3);
  assert.equal(calculateAutomationRate(sampleStages), 75);
  assert.equal(calculateManualMinutes(sampleStages), 8);
});

test("calculateReviewLoad distributes changed files across reviewers", () => {
  assert.equal(calculateReviewLoad(5, 2), 2.5);
});

test("readiness scoring converts timing and review inputs into a bounded score", () => {
  const score = calculateReadinessScore({
    automationRate: 75,
    totalLeadTime: 20,
    manualMinutes: 8,
    rollbackWindowMinutes: 12,
    reviewLoad: 2
  });

  assert.equal(score, 59);
  assert.equal(buildReadinessLabel(score), "Medium");
});

test("buildStageDag links downstream stages to their immediate upstream dependency", () => {
  assert.deepEqual(buildStageDag(sampleStages), [
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
  ]);
});
