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

  if (typeof state.courseTitle !== "string" || state.courseTitle.trim().length < 12) {
    issues.push("courseTitle must be at least 12 characters long.");
  }

  if (typeof state.headline !== "string" || state.headline.trim().length < 10) {
    issues.push("headline must be at least 10 characters long.");
  }

  if (typeof state.summary !== "string" || state.summary.trim().length < 20) {
    issues.push("summary must be at least 20 characters long.");
  }

  if (!state.changeRequest || typeof state.changeRequest !== "object" || Array.isArray(state.changeRequest)) {
    issues.push("changeRequest must be an object.");
  } else {
    if (typeof state.changeRequest.title !== "string" || state.changeRequest.title.trim().length < 10) {
      issues.push("changeRequest.title must be at least 10 characters long.");
    }

    if (typeof state.changeRequest.description !== "string" || state.changeRequest.description.trim().length < 20) {
      issues.push("changeRequest.description must be at least 20 characters long.");
    }

    if (!Array.isArray(state.changeRequest.owners) || state.changeRequest.owners.length < 2) {
      issues.push("changeRequest.owners must contain at least 2 people or teams.");
    }

    if (!Number.isInteger(state.changeRequest.reviewers) || state.changeRequest.reviewers < 1) {
      issues.push("changeRequest.reviewers must be an integer greater than or equal to 1.");
    }

    if (!Number.isInteger(state.changeRequest.filesChanged) || state.changeRequest.filesChanged < 1) {
      issues.push("changeRequest.filesChanged must be an integer greater than or equal to 1.");
    }

    if (
      !Number.isInteger(state.changeRequest.rollbackWindowMinutes) ||
      state.changeRequest.rollbackWindowMinutes < 1 ||
      state.changeRequest.rollbackWindowMinutes > 180
    ) {
      issues.push("changeRequest.rollbackWindowMinutes must be between 1 and 180.");
    }
  }

  if (!Array.isArray(state.pipelineStages) || state.pipelineStages.length < 4) {
    issues.push("pipelineStages must contain at least 4 stages.");
  } else {
    state.pipelineStages.forEach((stage, index) => {
      if (!stage || typeof stage !== "object" || Array.isArray(stage)) {
        issues.push(`pipelineStages[${index}] must be an object.`);
        return;
      }

      if (typeof stage.name !== "string" || stage.name.trim().length < 3) {
        issues.push(`pipelineStages[${index}].name must be at least 3 characters long.`);
      }

      if (!Number.isInteger(stage.minutes) || stage.minutes < 1) {
        issues.push(`pipelineStages[${index}].minutes must be an integer greater than or equal to 1.`);
      }

      if (typeof stage.automated !== "boolean") {
        issues.push(`pipelineStages[${index}].automated must be a boolean.`);
      }

      if (typeof stage.purpose !== "string" || stage.purpose.trim().length < 12) {
        issues.push(`pipelineStages[${index}].purpose must be a meaningful sentence.`);
      }
    });
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

  if (!Array.isArray(state.releaseNotes) || state.releaseNotes.length < 3) {
    issues.push("releaseNotes must contain at least 3 notes.");
  } else {
    state.releaseNotes.forEach((note, index) => {
      if (typeof note !== "string" || note.trim().length < 12) {
        issues.push(`releaseNotes[${index}] must be a meaningful sentence.`);
      }
    });
  }

  if (!Array.isArray(state.studentQuestions) || state.studentQuestions.length < 3) {
    issues.push("studentQuestions must contain at least 3 prompts.");
  } else {
    state.studentQuestions.forEach((question, index) => {
      if (typeof question !== "string" || question.trim().length < 12) {
        issues.push(`studentQuestions[${index}] must be a meaningful sentence.`);
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
