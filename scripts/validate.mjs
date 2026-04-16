import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_CONTENT_FILE = path.join(ROOT_DIR, "content", "site-state.json");
const SEMVER_PATTERN = /^\d+\.\d+\.\d+$/;

export function validateState(state) {
  const issues = [];

  if (!state || typeof state !== "object" || Array.isArray(state)) {
    return ["site-state.json must contain a JSON object."];
  }

  if (typeof state.version !== "string" || !SEMVER_PATTERN.test(state.version)) {
    issues.push("version must be a semantic version string such as 1.0.0.");
  }

  if (typeof state.headline !== "string" || state.headline.trim().length < 10) {
    issues.push("headline must be at least 10 characters long.");
  }

  if (typeof state.summary !== "string" || state.summary.trim().length < 20) {
    issues.push("summary must be at least 20 characters long.");
  }

  if (!Array.isArray(state.learningPath) || state.learningPath.length !== 5) {
    issues.push("learningPath must contain exactly 5 steps.");
  } else {
    state.learningPath.forEach((step, index) => {
      if (typeof step !== "string" || step.trim().length < 8) {
        issues.push(`learningPath[${index}] must be a meaningful sentence.`);
      }
    });
  }

  return issues;
}

export async function loadState(filePath = DEFAULT_CONTENT_FILE) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

export async function validateFile(filePath = DEFAULT_CONTENT_FILE) {
  const state = await loadState(filePath);
  const issues = validateState(state);

  if (issues.length > 0) {
    throw new Error(`Invalid desired state:\n- ${issues.join("\n- ")}`);
  }

  return state;
}

async function main() {
  const state = await validateFile();
  console.log(`Desired state is valid for version ${state.version}.`);
}

const isEntryPoint = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isEntryPoint) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
