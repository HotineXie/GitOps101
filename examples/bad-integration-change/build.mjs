import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildPublicState } from "../src/gitops-state.mjs";
import { validateFile } from "./validate.mjs";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const SITE_DIR = path.join(ROOT_DIR, "site");
const DEFAULT_CONTENT_FILE = path.join(ROOT_DIR, "content", "site-state.json");
const DEFAULT_OUTPUT_DIR = path.join(ROOT_DIR, "dist");

function readGitValue(args, fallback = "local-preview") {
  try {
    return execFileSync("git", args, {
      cwd: ROOT_DIR,
      encoding: "utf8"
    }).trim();
  } catch {
    return fallback;
  }
}

function buildMetadata(state, env, now) {
  const commitHash = env.GITOPS_COMMIT_SHA ?? env.GITHUB_SHA ?? readGitValue(["rev-parse", "HEAD"]);
  const updatedAt = env.GITOPS_DEPLOYED_AT ?? now.toISOString();
  const sourceRef = env.GITOPS_REF_NAME ?? env.GITHUB_REF_NAME ?? readGitValue(["branch", "--show-current"], "main");
  const repository = env.GITHUB_REPOSITORY ?? "";
  const serverUrl = env.GITHUB_SERVER_URL ?? "https://github.com";
  const commitUrl = repository && commitHash !== "local-preview"
    ? `${serverUrl}/${repository}/commit/${commitHash}`
    : "";

  return buildPublicState(state, {
    commitHash,
    shortCommitHash: commitHash.slice(0, 7),
    updatedAt,
    sourceRef,
    repository,
    commitUrl
  });
}

export async function buildSite(options = {}) {
  const contentFile = options.contentFile ?? DEFAULT_CONTENT_FILE;
  const outputDir = options.outputDir ?? DEFAULT_OUTPUT_DIR;
  const env = options.env ?? process.env;
  const now = options.now ?? new Date();

  const state = await validateFile(contentFile);
  const metadata = buildMetadata(state, env, now);

  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });
  await cp(SITE_DIR, outputDir, { recursive: true });
  await writeFile(path.join(outputDir, "deploy-state.json"), `${JSON.stringify(metadata, null, 2)}\n`, "utf8");
  await writeFile(path.join(outputDir, ".nojekyll"), "", "utf8");

  return metadata;
}

async function main() {
  const metadata = await buildSite();
  console.log(`Built GitOps demo site for version ${metadata.version} from ${metadata.shortCommitHash}.`);
}

const isEntryPoint = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isEntryPoint) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
