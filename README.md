# CI/CD Pipeline Demo

A Node.js REST API with the same 5-stage pipeline implemented on **three CI/CD platforms**: GitHub Actions, GitLab CI, and Azure DevOps Pipelines. The pipeline — not the API — is the point.

## Pipeline Architecture

```
lint ──► unit-test ──► integration-test ──► build-artifact ──► deploy
```

| Stage | What it does |
|---|---|
| `lint` | ESLint code quality gate |
| `unit-test` | Jest unit tests + coverage report published as artifact |
| `integration-test` | Playwright API tests against a live Express server |
| `build-artifact` | Packages app into a tarball, uploads as pipeline artifact |
| `deploy` | Downloads artifact, deploys to staging — **manual gate required** |

Each stage only runs when the previous one passes. Failing tests block the artifact build; a failed build blocks the deploy.

## Three-Platform Comparison

The same pipeline logic is expressed in three different CI/CD syntaxes:

| Platform | Config file | Job gating | Artifact handoff | Deploy gate |
|---|---|---|---|---|
| **GitHub Actions** | `.github/workflows/ci-cd.yml` | `needs:` | `upload-artifact` / `download-artifact` | `environment: staging` + required reviewers |
| **GitLab CI** | `.gitlab-ci.yml` | `needs:` + `stages:` | `artifacts: paths:` | `when: manual` |
| **Azure DevOps** | `azure-pipelines.yml` | `dependsOn:` | `PublishBuildArtifacts` / `DownloadBuildArtifacts` | `deployment:` job + `environment:` approval |

### Key syntax differences

```yaml
# Job dependency — "don't run until X passes"
GitHub Actions:  needs: [unit-test]
GitLab CI:       needs: [unit-test]
Azure DevOps:    dependsOn: UnitTest

# Artifact — pass a file from one job to the next
GitHub Actions:  uses: actions/upload-artifact@v4   /   actions/download-artifact@v4
GitLab CI:       artifacts: paths: [artifact/]       /   (auto-downloaded via needs:)
Azure DevOps:    PublishBuildArtifacts@1             /   DownloadBuildArtifacts@0

# Deploy gate — require a human to approve before deploy runs
GitHub Actions:  environment: staging  (add reviewers in Settings → Environments)
GitLab CI:       when: manual          (click Play in the GitLab pipeline UI)
Azure DevOps:    deployment: + environment: staging  (add approvals in Pipelines → Environments)

# Deploy only from main, not PRs
GitHub Actions:  if: github.ref == 'refs/heads/main'
GitLab CI:       only: [main]
Azure DevOps:    condition: eq(variables['Build.SourceBranch'], 'refs/heads/main')
```

## Tech Stack

| Layer | Tool |
|---|---|
| API | Node.js · Express |
| Unit tests | Jest · Supertest |
| Integration tests | Playwright (API mode) |
| Linting | ESLint 9 |
| CI/CD | GitHub Actions · GitLab CI · Azure DevOps |

## Running Locally

```bash
npm install
npm run lint              # ESLint
npm run test:unit         # Jest unit tests
npm run test:integration  # Playwright integration tests
npm start                 # API on http://localhost:3001
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api/products` | List all products |
| GET | `/api/products/:id` | Get product by ID |
| POST | `/api/products` | Create a product |
| PUT | `/api/products/:id` | Update a product |
| DELETE | `/api/products/:id` | Delete a product |

**Product schema:**

```json
{
  "id": 1,
  "name": "Widget",
  "category": "Tools",
  "price": 9.99,
  "stock": 50,
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

## Test Coverage

**Unit tests** (`tests/unit/` — 39 tests):
- `productService.test.js` — create, getAll, getById, update, remove; validation rules
- `routes.test.js` — route handlers tested with mock-injected service (same pattern as Moq in C# unit testing); covers 200/201/204/400/404 paths

**Integration tests** (`tests/integration/` — 14 tests):
- Full CRUD flow against a live Express server
- Validation error responses (missing name, negative price, fractional stock)
- 404 cases for unknown IDs
- Response header checks (Content-Type present, X-Powered-By absent)

## Project Structure

```
cicd-pipeline-demo/
├── src/
│   ├── services/
│   │   └── productService.js       # Business logic + in-memory store
│   ├── routes/
│   │   └── products.js             # Route factory — accepts service dependency
│   └── middleware/
│       └── errorHandler.js
├── server.js                       # Entry point (separate from app for testability)
├── tests/
│   ├── unit/
│   │   ├── productService.test.js
│   │   └── routes.test.js
│   └── integration/
│       └── products.spec.js
├── .github/workflows/ci-cd.yml     # GitHub Actions pipeline
├── .gitlab-ci.yml                  # GitLab CI pipeline
├── azure-pipelines.yml             # Azure DevOps pipeline
├── jest.config.cjs
├── playwright.config.js
└── eslint.config.js
```
