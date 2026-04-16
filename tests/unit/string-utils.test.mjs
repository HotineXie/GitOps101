import assert from "node:assert/strict";
import test from "node:test";

import {
  extractKeywords,
  joinOwners,
  normalizeText,
  slugifyText
} from "../../src/string-utils.mjs";

test("normalizeText lowercases and collapses punctuation into spaces", () => {
  assert.equal(
    normalizeText("  Publish Lesson 4, Faster Feedback!  "),
    "publish lesson 4 faster feedback"
  );
});

test("slugifyText produces a URL-safe slug from the normalized title", () => {
  assert.equal(
    slugifyText("Publish Lesson 4 and Tighten Deployment Feedback"),
    "publish-lesson-4-and-tighten-deployment-feedback"
  );
});

test("extractKeywords keeps unique release terms and drops short filler words", () => {
  assert.deepEqual(
    extractKeywords("Publish lesson 4 and tighten deployment feedback for students"),
    ["publish", "lesson", "tighten", "deployment"]
  );
});

test("joinOwners renders a readable ownership line", () => {
  assert.equal(
    joinOwners(["Platform Team", "Teaching Assistants"]),
    "Platform Team and Teaching Assistants"
  );
});
