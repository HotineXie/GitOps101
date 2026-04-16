# GitOps 101 Teaching Project

This repository is a GitOps teaching project built around a fictional student course portal.

- `main` is the desired state
- Pull requests are the recommended change entry point
- CI validates the state and runs multiple layers of automated tests
- CD publishes the merged state to GitHub Pages
- The site is a teaching artifact, not just a status board

The declarative source of truth is [`content/site-state.json`](content/site-state.json). The build step enriches that state with derived business metrics and deployment metadata before publishing it.

## What the Page Teaches

The deployed site explains:

- What business change is being released
- Which teams own the change
- How long the pipeline takes and how much of it is automated
- A DAG-style view of upstream unit checks and downstream integration confidence
- Release notes, classroom prompts, commit hash, and deployment time

## Project Structure

```text
.
├── .github/workflows/
│   ├── ci.yml
│   └── cd.yml
├── content/
│   └── site-state.json
├── examples/
│   ├── bad-unit-change/
│   │   └── string-utils.mjs
│   └── good-change/
│       └── site-state.json
├── src/
│   ├── gitops-state.mjs
│   ├── pipeline-metrics.mjs
│   └── string-utils.mjs
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
    │   └── site-content.integration.test.mjs
    └── unit/
        ├── gitops-state.test.mjs
        ├── pipeline-metrics.test.mjs
        ├── string-utils.test.mjs
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
- `npm run test:unit` checks upstream pure logic such as string handling, calculations, and state composition
- `npm run test:integration` checks that the built artifact contains the data and page structure consumed by the browser
- The tests form a dependency chain: string helpers and metric helpers feed release-state assembly, which feeds the integration layer
- If the desired state is invalid, the PR should not pass

### CD

[`/.github/workflows/cd.yml`](.github/workflows/cd.yml) runs after a merge to `main`:

1. Re-run validation and tests
2. Build the static site
3. Write the current commit hash and deployment time into `dist/site-data.json`
4. Deploy to GitHub Pages

This gives students a very clear Git-driven deployment loop.

## Bad Change Example: Break an Upstream Unit Test

This example changes an upstream string helper in `src/string-utils.mjs`. Validation still passes, but the unit-test layer fails before any downstream build confidence is granted.

```bash
git switch -c demo/bad-unit-change
cp examples/bad-unit-change/string-utils.mjs src/string-utils.mjs
git add src/string-utils.mjs
git commit -m "demo: break upstream unit logic"
git push -u origin demo/bad-unit-change
```

Then create a PR. CI should fail in the unit-test step because slug generation and owner formatting no longer match the downstream expectations used by release-state assembly.

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
2. Submit a PR with a better desired state
3. Let CI run validation, unit tests, and integration tests
4. Merge into `main`
5. Let CD deploy automatically
6. Watch GitHub Pages update

After deployment you should see:

- Version `1.1.0`
- Updated release notes and classroom prompts
- A new derived rollout score, commit hash, and deployment timestamp

## Why This Helps Students Understand GitOps

This repository intentionally avoids complex infrastructure and keeps only the core GitOps mechanics:

- Git is the single source of truth
- Changes go through PR review
- Different automated test layers catch different kinds of mistakes
- Upstream unit checks feed downstream release-state assembly and integration confidence
- Automated checks block invalid state from entering `main`
- The state in `main` is automatically reconciled into the live page

It is not a full replacement for Argo CD or Flux, but it is a strong first GitOps classroom demo.
