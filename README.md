[![CI/CD Pipeline Demo: one five-stage pipeline on three CI/CD platforms](docs/assets/banner.svg)](https://github.com/rizvihiqrar/cicd-pipeline-demo/actions/workflows/ci-cd.yml)

# CI/CD Pipeline Demo

[![CI / CD Pipeline](https://github.com/rizvihiqrar/cicd-pipeline-demo/actions/workflows/ci-cd.yml/badge.svg?branch=main)](https://github.com/rizvihiqrar/cicd-pipeline-demo/actions/workflows/ci-cd.yml)

A small Node.js REST API with the same five-stage pipeline written for three CI/CD platforms: GitHub Actions, GitLab CI and Azure DevOps Pipelines. The pipeline, not the API, is the point. Code has to pass lint, unit tests and integration tests before it is packaged, and a person has to approve the deploy. It is for anyone who wants to see how a release gate works, or how the same gate is written on each platform.

**[Technical guide →](TECHNICAL.md)**

## In plain English

When a developer changes code, a robot checks it before it can go live: it reads the code for mistakes, runs the tests, packages the app, and then waits for a person to say "deploy". If any check fails, everything after it is skipped, so broken code never reaches the package or the deploy.

<a href="docs/assets/actions-run.png">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/assets/actions-run-dark.png">
    <img src="docs/assets/actions-run.png" alt="A GitHub Actions run page: status Success, total duration 1m 38s, 3 artifacts, and a graph of five green jobs in a row: Lint, Unit Tests, Integration Tests, Build Artifact and Deploy to Staging">
  </picture>
</a>

*A real [run on main](https://github.com/rizvihiqrar/cicd-pipeline-demo/actions/runs/39320454369): five jobs in order, all green, 1 minute 38 seconds in total. Shown in the viewer's light or dark theme.*

## Installation

```bash
git clone https://github.com/rizvihiqrar/cicd-pipeline-demo.git && cd cicd-pipeline-demo && npm install
```

## Quick start

Run the same checks the pipeline runs, then start the API on `http://localhost:3001`:

```bash
npm run lint && npm run test:unit && npm run test:integration && npm start
```

## At a glance

- One pipeline, five stages: lint, unit test, integration test, build artifact, deploy
- Written three times: GitHub Actions, GitLab CI and Azure DevOps Pipelines
- Every stage waits for the one before it, so a failure stops everything after it
- 42 unit tests (Jest) and 14 integration tests (Playwright against a live server)
- Unit-test coverage is published as a build artifact, with an 80% line-coverage minimum
- The deploy waits for a person to approve it, and only runs from `main`
- The app is packaged once, as a tarball, and that same file is deployed
- Production dependencies only in the package, with no tests or coverage inside
- A side-by-side [syntax comparison](TECHNICAL.md#three-platform-comparison) of how each platform does gating, artifacts and approval
- Dependabot pull requests run through the same pipeline before they merge

## The pipeline

```
lint ──► unit-test ──► integration-test ──► build-artifact ──► deploy
```

| Stage | What it does |
|---|---|
| `lint` | ESLint code quality gate |
| `unit-test` | Jest unit tests, with the coverage report published as an artifact |
| `integration-test` | Playwright API tests against a live Express server |
| `build-artifact` | Packages the app into a tarball and uploads it as a pipeline artifact |
| `deploy` | Downloads the artifact and deploys to staging, with a **manual gate required** |

Each stage only runs when the previous one passes. Failing tests block the artifact build, and a failed build blocks the deploy.

<a href="docs/assets/actions-artifacts.png">
  <img src="docs/assets/actions-artifacts.png" alt="The Artifacts table of a GitHub Actions run, listing coverage-report (28.6 KB), playwright-report (193 KB) and product-api (855 KB)">
</a>

*What a run leaves behind: the coverage report, the Playwright test report and the packaged app (`product-api`).*

## Three platforms, one pipeline

| Platform | Config file | Job gating | Deploy gate |
|---|---|---|---|
| **GitHub Actions** | [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml) | `needs:` | `environment: staging` + required reviewers |
| **GitLab CI** | [`.gitlab-ci.yml`](.gitlab-ci.yml) | `needs:` + `stages:` | `when: manual` |
| **Azure DevOps** | [`azure-pipelines.yml`](azure-pipelines.yml) | `dependsOn:` | `deployment:` job + `environment:` approval |

The [Technical guide](TECHNICAL.md#key-syntax-differences) shows the same four ideas (job order, artifacts, deploy gate, deploy only from main) side by side in each syntax.

## Results

| Evidence | Where |
|---|---|
| 42 unit tests and 14 integration tests, all passing | [Run on main (2026-10-19)](https://github.com/rizvihiqrar/cicd-pipeline-demo/actions/runs/39320454369) |
| All five jobs green in 1 minute 38 seconds | [Same run](https://github.com/rizvihiqrar/cicd-pipeline-demo/actions/runs/39320454369) |
| 81.8% line coverage against an 80% minimum | `npm run test:unit -- --coverage` |
| The gate caught a failure: the first run on main failed at Unit Tests, so integration, build and deploy were skipped | [First run](https://github.com/rizvihiqrar/cicd-pipeline-demo/actions/workflows/ci-cd.yml?query=branch%3Amain) |

<a href="docs/assets/actions-workflow-runs.png">
  <img src="docs/assets/actions-workflow-runs.png" alt="The run history of the CI / CD Pipeline workflow on main: the first run failed, the five that followed all passed">
</a>

*Run history on main. The first run failed, and the next commit added the unit tests that met the coverage threshold.*

<a href="docs/assets/playwright-report.png">
  <img src="docs/assets/playwright-report.png" alt="The Playwright HTML report: 14 tests, 14 passed, 0 failed, 0 flaky, each tagged smoke or regression">
</a>

*The Playwright report the integration stage publishes: 14 of 14 passed, each test tagged `smoke` or `regression`.*

## API

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api/products` | List all products |
| GET | `/api/products/:id` | Get product by ID |
| POST | `/api/products` | Create a product |
| PUT | `/api/products/:id` | Update a product |
| DELETE | `/api/products/:id` | Delete a product |

Tech stack: Node.js and Express, Jest and Supertest, Playwright (API mode), ESLint 9. More detail, the product schema and the project layout are in the [Technical guide](TECHNICAL.md).
