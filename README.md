# GitOps 101 Teaching Project

This repository is a minimal GitOps teaching project:

- `main` is the desired state
- Pull requests are the recommended change entry point
- CI validates whether a proposed state is acceptable
- CI runs both unit tests and integration tests
- After a merge to `main`, CD publishes the site to GitHub Pages
- The page shows the current version, latest commit hash, and deployment time

## What Students See

The deployed page shows:

- Current version
- Latest commit hash
- Last updated time
- Teaching copy that explains the GitOps flow

The site state comes from [`content/site-state.json`](content/site-state.json). In this project, that file is the declarative desired state.

## Project Structure

```text
.
├── .github/workflows/
│   ├── ci.yml
│   └── cd.yml
├── content/
│   └── site-state.json
├── examples/
│   ├── bad-integration-change/
│   │   └── build.mjs
│   ├── bad-unit-change/
│   │   └── gitops-state.mjs
│   └── good-change/
│       └── site-state.json
├── src/
│   └── gitops-state.mjs
├── scripts/
│   ├── build.mjs
│   ├── serve.mjs
│   └── validate.mjs
├── site/
│   ├── app.js
│   ├── index.html
│   └── styles.css
└── tests/
    ├── integration/
    │   ├── build.integration.test.mjs
    │   └── deploy-wiring.integration.test.mjs
    └── unit/
        ├── gitops-state.test.mjs
        └── validate.test.mjs
```

## Run Locally

Node.js 20 or newer is required.

```bash
npm ci
npm run build
npm run serve
```

Then open `http://localhost:4173`.

During a local build, the commit hash is read from the current git repository and the updated time is generated from the build time.

## GitHub Pages Setup

1. Push the repository to GitHub.
2. Open `Settings -> Pages`.
3. Under `Build and deployment`, set `Source` to `GitHub Actions`.
4. Make sure the default branch is `main`.

After that:

- A PR to `main` triggers CI
- A merge to `main` triggers CD
- CD builds `dist/` and deploys it to GitHub Pages

The page URL is usually:

```text
https://<your-github-username>.github.io/GitOps101/
```

## What CI/CD Does

### CI

[`/.github/workflows/ci.yml`](.github/workflows/ci.yml) runs:

```bash
npm ci
npm run validate
npm run test:unit
npm run test:integration
npm run build
```

Key points:

- `npm run validate` checks whether `content/site-state.json` satisfies the project rules
- `npm run test:unit` checks the pure GitOps state logic
- `npm run test:integration` checks that the build artifact is deployable end to end
- If the desired state is invalid, the PR should not pass

### CD

[`/.github/workflows/cd.yml`](.github/workflows/cd.yml) runs after a merge to `main`:

1. Re-run validation and tests
2. Build the static site
3. Write the current commit hash and deployment time into `dist/site-data.json`
4. Deploy to GitHub Pages

This gives students a very clear Git-driven deployment loop.

## Bad Change Example 1: Make the Unit Tests Fail

This example changes a pure function in `src/gitops-state.mjs` so the unit tests fail while validation still passes.

```bash
git switch -c demo/bad-unit-change
cp examples/bad-unit-change/gitops-state.mjs src/gitops-state.mjs
git add src/gitops-state.mjs
git commit -m "demo: break GitOps state unit logic"
git push -u origin demo/bad-unit-change
```

Then create a PR. CI should fail in the unit-test step because the release label and step summary logic no longer match the expected behavior.

## Bad Change Example 2: Make the Integration Tests Fail

This example changes the build script so the deployment artifact is no longer wired the way the site expects.

```bash
git switch -c demo/bad-integration-change
cp examples/bad-integration-change/build.mjs scripts/build.mjs
git add scripts/build.mjs
git commit -m "demo: break deployment artifact wiring"
git push -u origin demo/bad-integration-change
```

Then create a PR. CI should fail in the integration-test step because the build output no longer includes the expected `site-data.json` artifact.

## Good Change Example: Complete a GitOps Release

This example simulates a normal release and should end with a visible page update.

```bash
git switch main
git pull
git switch -c demo/good-change
cp examples/good-change/site-state.json content/site-state.json
git add content/site-state.json
git commit -m "feat: release version 1.1.0"
git push -u origin demo/good-change
```

Then walk through the full flow:

1. Open a new branch
2. Submit a PR
3. Let CI run validation, unit tests, and integration tests
4. Merge into `main`
5. Let CD deploy automatically
6. Watch GitHub Pages update

After deployment you should see:

- Version `1.1.0`
- The latest post-merge commit hash
- A fresh deployment timestamp

## Why This Helps Students Understand GitOps

This repository intentionally avoids complex infrastructure and keeps only the core GitOps mechanics:

- Git is the single source of truth
- Changes go through PR review
- Different automated test layers catch different kinds of mistakes
- Automated checks block invalid state from entering `main`
- The state in `main` is automatically reconciled into the live page

It is not a full replacement for Argo CD or Flux, but it is a strong first GitOps classroom demo.
