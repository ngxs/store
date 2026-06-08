# Angular v22 Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare the ngxs monorepo for Angular v22 by adding a v22 integration test app, bumping all plugin peer-dependency ranges to `>=22.0.0 <23.0.0`, updating CI references, and bumping Nx to v22 (latest stable `22.7.5`). This produces a `chore/release-v22` branch ready for the eventual `chore: release v22.0.0` cut, matching the pattern from PR #2387 (v21 support) and the subsequent release commit.

**Architecture:**

- **Mirror the v20→v21 pattern (PR #2387)** for the integration app + peer-dep bumps + CI rename. That PR was deliberately minimal — it did not touch root workspace Angular versions or library source — and shipped Angular v21 support cleanly. We replicate that for v22.
- **Bundle the Nx workspace migration** (`21.6.2 → 22.7.5`) into this branch because Nx 22 is the "previous" tag on npm now (latest = 23-beta) and is the natural peer for Angular 22. PR #2376 was a separate Nx upgrade for v21; for v22 we do them together since the user explicitly requested NX/Angular migrations be considered.
- **Bump Node toolchain** from 22.12.0 → 22.22.3+ to satisfy `@angular/core@22`'s `engines.node = "^22.22.3 || ^24.15.0 || >=26.0.0"` requirement.
- **Do NOT bump the package version** in this branch. The v21 release pattern (commit `6ca44407`) cuts the version bump (`20.1.0 → 21.0.0`) as a separate commit AFTER the support PR merges. We follow the same separation.
- **Do NOT upgrade root workspace Angular devDeps.** PR #2387 left root on `@angular/core@20.3.2` even though peer dep range was bumped to `>=21 <22`. The library builds with the older Angular and the integration app exercises the newer one. We preserve this asymmetry.

**Tech Stack:**

- Angular 22.x (`@angular/core@22.0.0` latest), TypeScript ~5.9, RxJS ^7.4
- Nx 22.7.5 (`@nx/angular`, `@nx/eslint`, `@nx/jest`, `@nx/js`, `@nx/workspace`)
- Node `^22.22.3` (currently `22.12.0` in `.node-version`; CircleCI image `cimg/node:22.16.0-browsers`)
- Vitest 4.x (already in ng21 integration), jsdom 27.x

**Reference commits:**

- `31490f03` — `build: angular v21 support (#2387)` — the template for this work
- `6ca44407` — `chore: release v21.0.0` — the follow-up release commit (NOT included in this plan)
- `a33e1b99` — `build: upgrade Nx workspace (#2376)` — pattern for Nx migration commits
- `d3dad28f` — `build: add Angular 20 support (#2342)` — example of a "heavier" upgrade that also restructured the integration folder

**Verification model:** every task ends with running the package's tests OR build OR a focused integration smoke. The full CI matrix only runs on push, so local verification is the gate.

---

## Pre-flight check

### Task 0: Confirm baseline state

**Files:**

- Read: `package.json`, `.node-version`, `packages/store/package.json`, `integrations/hello-world-ng21/package.json`

- [ ] **Step 1: Verify branch & cleanliness**

Run: `git status && git rev-parse --abbrev-ref HEAD`
Expected: clean tree on `chore/release-v22`.

- [ ] **Step 2: Confirm Angular 22 is published on npm**

Run: `yarn info @angular/core version 2>&1 | tail -5`
Expected: `22.0.0` or higher.

- [ ] **Step 3: Confirm Nx 22 latest**

Run: `yarn info @nx/angular dist-tags 2>&1 | tail -10`
Expected: `latest` tag pointing at `22.x.x` (currently `22.7.5`).

- [ ] **Step 4: Install current deps (sanity baseline)**

Run: `yarn install --frozen-lockfile`
Expected: success, no lockfile changes.

- [ ] **Step 5: Run the existing test suite to record a green baseline**

Run: `yarn nx run-many --target=test --all --maxWorkers=4`
Expected: all pass (record any pre-existing failures so we don't blame v22).

No commit at end of Task 0 — this is verification only.

---

## Phase 1 — Bump Node toolchain

### Task 1: Bump `.node-version` and CircleCI Node image

**Files:**

- Modify: `.node-version`
- Modify: `.circleci/config.yml` (line 10)

**Why first:** Angular 22's `engines.node` floor is `22.22.3`. The repo currently pins `22.12.0`. If we install Angular 22 deps with the old Node, yarn warns (or `npm` errors). Doing this first means everything downstream runs on a supported Node.

- [ ] **Step 1: Update `.node-version`**

Replace file content with:

```
22.22.3
```

- [ ] **Step 2: Update CircleCI image**

In `.circleci/config.yml`, change the docker image (line ~10):

```yaml
job_defaults_var: &job_defaults
  working_directory: ~/workspace/app
  docker:
    - image: cimg/node:22.22.3-browsers
```

(The original is `cimg/node:22.16.0-browsers`.)

- [ ] **Step 3: Verify no other Node-version pins**

Run: `grep -rn "22\.12\|22\.16" .github .circleci package.json 2>&1 | grep -v node_modules`
Expected: no hits (or only matches inside this plan / comments).

- [ ] **Step 4: Smoke test — yarn install still works**

Run: `yarn install --frozen-lockfile`
Expected: success.

- [ ] **Step 5: Commit**

```bash
git add .node-version .circleci/config.yml
git commit -m "chore: bump Node toolchain to 22.22.3 for Angular 22"
```

---

## Phase 2 — Nx workspace migration to v22

This phase mirrors PR #2376 (`build: upgrade Nx workspace`). Nx ships a `nx migrate` command that bumps `@nx/*`, regenerates configs, and writes a `migrations.json` of follow-up migrations to run.

### Task 2: Run `nx migrate` to set target versions

**Files:**

- Modify (auto): `package.json` (all `@nx/*` versions, possibly `nx` itself)
- Create (auto): `migrations.json` at workspace root

- [ ] **Step 1: Run nx migrate to latest 22.x**

Run: `yarn nx migrate @nx/workspace@22`
Expected: `package.json` updated; `migrations.json` file appears at repo root.

If `nx migrate` resolves to a 23-beta by accident, pin: `yarn nx migrate @nx/workspace@22.7.5`.

- [ ] **Step 2: Install the new Nx versions**

Run: `yarn install`
Expected: lockfile updates; install succeeds.

- [ ] **Step 3: Inspect migrations.json**

Run: `cat migrations.json | head -50` (or open in editor).
Expected: a list of `@nx/*` migrations. Note any `@angular/cli` migrations — we'll skip those (we are NOT bumping root Angular).

- [ ] **Step 4: Commit the version bump**

```bash
git add package.json yarn.lock migrations.json
git commit -m "build: bump Nx workspace to 22.7.5 (migration manifest)"
```

### Task 3: Execute Nx migrations

**Files:**

- Modify (auto): `nx.json`, `project.json` files under `packages/*` and `integration/`, possibly `jest.config.js`, `tsconfig.*.json`

- [ ] **Step 1: Run the migrations**

Run: `yarn nx migrate --run-migrations=migrations.json`
Expected: each migration runs; some may print warnings. Note any that fail — we may need to skip Angular-CLI-only migrations.

If a migration fails because it tries to bump Angular root deps, skip it: edit `migrations.json` to remove the failing entry and rerun.

- [ ] **Step 2: Delete the migrations manifest**

```bash
git rm migrations.json
```

- [ ] **Step 3: Format**

Run: `yarn format`
Expected: any reformatted files.

- [ ] **Step 4: Verify build still works**

Run: `yarn build`
Expected: all packages build (`@ngxs/store`, all plugins). If a typecheck error appears, fix it minimally — Nx migrations sometimes change tsconfig paths.

- [ ] **Step 5: Run unit tests**

Run: `yarn nx run-many --target=test --all --maxWorkers=4`
Expected: all pass.

- [ ] **Step 6: Run type tests**

Run: `yarn test:types`
Expected: pass.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "build: apply Nx 22 workspace migrations"
```

---

## Phase 3 — Create the ng22 integration app

We clone `integrations/hello-world-ng21/` into `integrations/hello-world-ng22/`, bump Angular versions and version-coded strings inside it, then delete the ng21 folder.

### Task 4: Clone ng21 → ng22

**Files:**

- Create: entire `integrations/hello-world-ng22/` directory mirroring `integrations/hello-world-ng21/`

- [ ] **Step 1: Copy the directory**

Run (PowerShell):

```powershell
Copy-Item -Recurse -Path integrations/hello-world-ng21 -Destination integrations/hello-world-ng22 -Exclude @('node_modules','dist-integration','.angular','coverage','out-tsc')
```

- [ ] **Step 2: Remove the stale yarn.lock**

Run: `Remove-Item integrations/hello-world-ng22/yarn.lock`
(We'll regenerate it via `yarn install` in Task 6 Step 6.)

- [ ] **Step 3: Verify file listing**

Run: `Get-ChildItem integrations/hello-world-ng22 -Recurse -File | Select-Object -ExpandProperty FullName`
Expected: same set as ng21 minus `yarn.lock`, `node_modules`, build artifacts.

No commit yet — Task 5 finishes the rename inside the files.

### Task 5: Rewrite ng22 file contents

**Files:**

- Modify: `integrations/hello-world-ng22/package.json`
- Modify: `integrations/hello-world-ng22/angular.json`
- Modify: `integrations/hello-world-ng22/vitest.config.ts`
- Modify: `integrations/hello-world-ng22/src/index.html`
- Modify: `integrations/hello-world-ng22/src/app/app.html`
- Modify: `integrations/hello-world-ng22/src/app/app.spec.ts`
- Modify: `integrations/hello-world-ng22/cypress/e2e/index-page.cy.ts`

- [ ] **Step 1: Edit `package.json`**

Full replacement content:

```json
{
  "name": "hello-world-ng22",
  "version": "0.0.0",
  "scripts": {
    "ng": "ng",
    "start-test": "start-server-and-test",
    "start": "ng serve",
    "build": "ng build",
    "build:prod": "ng build --configuration production",
    "test": "ng test",
    "test:ci": "ng test --no-watch --coverage",
    "test:integration": "yarn install:ci && yarn test:ci && yarn build:prod && yarn e2e:ci",
    "preinstall": "yarn --cwd ../../ cpx -v -C \"@ngxs/**/*\" integrations/hello-world-ng22/node_modules/@ngxs",
    "install:ci": "yarn --frozen-lockfile --non-interactive --no-progress",
    "cy:open": "cypress open",
    "cy:run": "cypress run",
    "serve:integration:static": "serve dist-integration/browser -s -l 4200 --cors",
    "e2e": "start-test serve:integration:static 4200 cy:open",
    "e2e:ci": "start-test serve:integration:static 4200 cy:run"
  },
  "private": true,
  "dependencies": {
    "@angular/common": "^22.0.0",
    "@angular/compiler": "^22.0.0",
    "@angular/core": "^22.0.0",
    "@angular/forms": "^22.0.0",
    "@angular/platform-browser": "^22.0.0",
    "@angular/router": "^22.0.0",
    "@ngxs/devtools-plugin": "file:./node_modules/@ngxs/devtools-plugin",
    "@ngxs/form-plugin": "file:./node_modules/@ngxs/form-plugin",
    "@ngxs/logger-plugin": "file:./node_modules/@ngxs/logger-plugin",
    "@ngxs/router-plugin": "file:./node_modules/@ngxs/router-plugin",
    "@ngxs/storage-plugin": "file:./node_modules/@ngxs/storage-plugin",
    "@ngxs/store": "file:./node_modules/@ngxs/store",
    "@ngxs/websocket-plugin": "file:./node_modules/@ngxs/websocket-plugin",
    "rxjs": "~7.8.0",
    "tslib": "^2.3.0"
  },
  "devDependencies": {
    "@angular/build": "^22.0.0",
    "@angular/cli": "^22.0.0",
    "@angular/compiler-cli": "^22.0.0",
    "@types/node": "^22.10.0",
    "cypress": "file:../../node_modules/cypress",
    "@vitest/coverage-v8": "^4.0.15",
    "jsdom": "^27.1.0",
    "serve": "file:../../node_modules/serve",
    "start-server-and-test": "file:../../node_modules/start-server-and-test",
    "typescript": "~5.9.2",
    "vitest": "^4.0.8"
  }
}
```

Notes:

- `@angular/*` bumped from `^21` to `^22`.
- `@types/node` bumped from `^20.17.19` to `^22.10.0` to align with Node 22 runtime.
- `preinstall` cpx path: `hello-world-ng21` → `hello-world-ng22`.

- [ ] **Step 2: Edit `angular.json`**

Replace all 3 occurrences of `hello-world-ng21` with `hello-world-ng22`:

```bash
# Or use the Edit tool with replace_all on the project name string
```

- [ ] **Step 3: Edit `vitest.config.ts`**

Change `reportsDirectory`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage/ng22',
      reporter: ['html', 'text-summary']
    },
    environment: 'jsdom',
    reporters: ['default']
  }
});
```

- [ ] **Step 4: Edit `src/index.html`**

Change title:

```html
<title>HelloWorldNg22</title>
```

- [ ] **Step 5: Edit `src/app/app.html`**

Change h1:

```html
<h1>Angular 22 Integration Test</h1>
```

- [ ] **Step 6: Edit `src/app/app.spec.ts`**

Change the expected text:

```typescript
expect(compiled.querySelector('h1').textContent).toContain('Angular 22 Integration Test');
```

- [ ] **Step 7: Edit `cypress/e2e/index-page.cy.ts`**

Change the ng-version assertion:

```typescript
cy.get('app-root').invoke('attr', 'ng-version').should('have.string', '22');
```

- [ ] **Step 8: Sanity-grep — no stray ng21 refs in ng22 folder**

Run: `grep -rn "ng21\|ng-21\|Angular 21\|HelloWorldNg21" integrations/hello-world-ng22 2>&1 | head -20`
Expected: no matches.

- [ ] **Step 9: Commit**

```bash
git add integrations/hello-world-ng22
git commit -m "build: add hello-world-ng22 integration app"
```

---

## Phase 4 — Bump plugin peer dependencies

All plugin `package.json` files declare `"@angular/core": ">=21.0.0 <22.0.0"`. We bump to `>=22.0.0 <23.0.0`. Plugins that also declare `@angular/forms` or `@angular/router` get the same bump for those.

### Task 6: Bump peer deps across all plugins

**Files:**

- Modify: `packages/store/package.json:7`
- Modify: `packages/devtools-plugin/package.json:8`
- Modify: `packages/form-plugin/package.json:8-9` (both `@angular/core` and `@angular/forms`)
- Modify: `packages/hmr-plugin/package.json:7`
- Modify: `packages/logger-plugin/package.json:8`
- Modify: `packages/router-plugin/package.json:8-9` (both `@angular/core` and `@angular/router`)
- Modify: `packages/storage-plugin/package.json:8`
- Modify: `packages/websocket-plugin/package.json:8`

- [ ] **Step 1: Bump `packages/store/package.json`**

Edit the peerDependencies block:

```json
"peerDependencies": {
  "@angular/core": ">=22.0.0 <23.0.0",
  "rxjs": ">=7.0.0"
}
```

- [ ] **Step 2: Bump `packages/devtools-plugin/package.json`**

```json
"peerDependencies": {
  "@ngxs/store": "^0.0.0",
  "@angular/core": ">=22.0.0 <23.0.0",
  "rxjs": ">=7.0.0"
}
```

- [ ] **Step 3: Bump `packages/form-plugin/package.json`**

```json
"peerDependencies": {
  "@ngxs/store": "^0.0.0",
  "@angular/core": ">=22.0.0 <23.0.0",
  "@angular/forms": ">=22.0.0 <23.0.0",
  "rxjs": ">=7.0.0"
}
```

- [ ] **Step 4: Bump `packages/hmr-plugin/package.json`**

```json
"peerDependencies": {
  "@angular/core": ">=22.0.0 <23.0.0"
}
```

- [ ] **Step 5: Bump `packages/logger-plugin/package.json`**

```json
"peerDependencies": {
  "@ngxs/store": "^0.0.0",
  "@angular/core": ">=22.0.0 <23.0.0",
  "rxjs": ">=7.0.0"
}
```

- [ ] **Step 6: Bump `packages/router-plugin/package.json`**

```json
"peerDependencies": {
  "@ngxs/store": "^0.0.0",
  "@angular/core": ">=22.0.0 <23.0.0",
  "@angular/router": ">=22.0.0 <23.0.0",
  "rxjs": ">=7.0.0"
}
```

- [ ] **Step 7: Bump `packages/storage-plugin/package.json`**

```json
"peerDependencies": {
  "@ngxs/store": "^0.0.0",
  "@angular/core": ">=22.0.0 <23.0.0",
  "rxjs": ">=7.0.0",
  "ts-morph": "21.0.1"
}
```

(Keep `ts-morph` pinned at `21.0.1` — unrelated to Angular major; bumping it would be out-of-scope.)

- [ ] **Step 8: Bump `packages/websocket-plugin/package.json`**

```json
"peerDependencies": {
  "@ngxs/store": "^0.0.0",
  "@angular/core": ">=22.0.0 <23.0.0",
  "rxjs": ">=7.0.0"
}
```

- [ ] **Step 9: Verify no peer dep stragglers**

Run: `grep -rn "\">=21\.0\.0 <22\.0\.0\"" packages/ 2>&1 | grep package.json`
Expected: no matches.

- [ ] **Step 10: Rebuild packages so the dist `package.json` files pick up the new ranges**

Run: `yarn build`
Expected: clean build.

- [ ] **Step 11: Commit**

```bash
git add packages/*/package.json
git commit -m "build: bump @angular/core peer dependency to >=22 <23"
```

---

## Phase 5 — Wire CI to the new integration app

### Task 7: Update root `package.json` integration scripts

**Files:**

- Modify: `package.json:105`, `:107` (the `integration:ng21` and `version:integration:ng21` scripts)

- [ ] **Step 1: Rename integration scripts**

In `package.json`, change:

```json
"integration:ng21": "cd integrations/hello-world-ng21 && yarn test:integration",
```

to:

```json
"integration:ng22": "cd integrations/hello-world-ng22 && yarn test:integration",
```

And:

```json
"version:integration:ng21": "cd integrations/hello-world-ng21 && yarn install --force && cd ../..",
```

to:

```json
"version:integration:ng22": "cd integrations/hello-world-ng22 && yarn install --force && cd ../..",
```

- [ ] **Step 2: Smoke-test the rename**

Run: `yarn run 2>&1 | grep integration`
Expected: `integration:ng22` and `version:integration:ng22` appear; no `ng21` script remains.

No commit yet — bundle with Task 8.

### Task 8: Update CI workflow files

**Files:**

- Modify: `.circleci/config.yml:142-153, 219` (`integration_ng21_tests` job + workflow reference)
- Modify: `.github/actions/setup/action.yml:57` (workspace cache path)
- Modify: `.github/actions/upload-integration-test-artifact/action.yml:10, 14, 24` (description + example artifact name)
- Modify: `.github/workflows/pr-validation.yml:95` (matrix script)
- Modify: `.github/workflows/release.yml:84` (matrix script)
- Modify: `.github/workflows/trunk.yml:84` (matrix script)

- [ ] **Step 1: Edit `.circleci/config.yml`**

Replace `integration_ng21_tests` job (lines ~142-153) with:

```yaml
  integration_ng22_tests:
    <<: *job_defaults
    steps:
      - *attach_workspace
      - browser-tools/install-browser-tools
      - run:
          name: Run integration tests for ng22 application
          command: yarn integration:ng22
      - persist_to_workspace:
          root: ~/workspace
          paths:
            - app/integrations/hello-world-ng22/dist-integration
```

And in the `workflows` section (line ~219):

```yaml
- integration_ng22_tests:
    requires:
      - build
```

- [ ] **Step 2: Edit `.github/actions/setup/action.yml`**

Change the cache path (line ~57):

```yaml
./integrations/hello-world-ng22/dist-integration
```

- [ ] **Step 3: Edit `.github/actions/upload-integration-test-artifact/action.yml`**

Update the description and example references:

```yaml
description: Upload an integration test artifact with a name such as 'hello-world-ng22'.

inputs:
  script:
    description: A script with a name such as 'integration:ng22' that generates an integration test artifact.
    required: true
```

And the echo example string:

```yaml
echo "Replace colons with dashes, substring 'integration' with a substring 'hello-world'. Example result: hello-world-ng22"
```

- [ ] **Step 4: Edit `.github/workflows/pr-validation.yml`**

Change the matrix entry from `'integration:ng21'` to `'integration:ng22'` (line ~95).

- [ ] **Step 5: Edit `.github/workflows/release.yml`**

Same change as Step 4.

- [ ] **Step 6: Edit `.github/workflows/trunk.yml`**

Same change as Step 4.

- [ ] **Step 7: Sanity-grep for any remaining ng21 references**

Run: `grep -rn "ng21\|hello-world-ng21" .github .circleci package.json 2>&1`
Expected: no matches (anywhere).

- [ ] **Step 8: Commit**

```bash
git add package.json .circleci/config.yml .github/
git commit -m "ci: wire integration suite to hello-world-ng22"
```

---

## Phase 6 — Remove the ng21 integration folder

### Task 9: Delete `integrations/hello-world-ng21/`

**Files:**

- Delete: `integrations/hello-world-ng21/` (entire directory)

- [ ] **Step 1: Confirm nothing still references ng21**

Run: `grep -rn "hello-world-ng21\|ng21" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.nx --exclude-dir=integrations/hello-world-ng21 2>&1`
Expected: matches only inside `integrations/hello-world-ng21/` itself, and possibly stale entries in `.nx/workspace-data/file-map.json` (auto-regenerated, OK to ignore).

- [ ] **Step 2: Remove the folder**

Run (PowerShell): `Remove-Item -Recurse -Force integrations/hello-world-ng21`

- [ ] **Step 3: Commit**

```bash
git add -A integrations/
git commit -m "build: remove hello-world-ng21 integration app"
```

---

## Phase 7 — Verify the ng22 integration

### Task 10: Local integration run

**Files:** none (verification only)

- [ ] **Step 1: Build all packages so the `file:` links resolve**

Run: `yarn build`
Expected: clean build of all `@ngxs/*` packages.

- [ ] **Step 2: Install the ng22 integration deps**

Run: `yarn version:integration:ng22`
Expected: success — yarn installs Angular 22, all `@ngxs/*` packages link via `file:`.

- [ ] **Step 3: Run the integration test target**

Run: `yarn integration:ng22`
Expected: ng22's `test:integration` runs (`install:ci && test:ci && build:prod && e2e:ci`).

- If `e2e:ci` fails because Cypress can't find a display: skip with `yarn --cwd integrations/hello-world-ng22 test:ci && yarn --cwd integrations/hello-world-ng22 build:prod` (no e2e locally — CI will run it).
- If a Vitest or build error is genuinely caused by Angular 22 incompat, capture the error and investigate before continuing.

- [ ] **Step 4: Confirm the ng-version check would pass**

The cypress test asserts `ng-version` attribute contains `'22'`. Smoke check: after `build:prod`, inspect `integrations/hello-world-ng22/dist-integration/browser/index.html` (or grep the built JS) for `ng-version="22.`.

Run: `grep -o "ng-version[^\"']*22\.[0-9]*\.[0-9]*" integrations/hello-world-ng22/dist-integration/browser/*.html 2>&1 | head -3`
Expected: at least one match like `ng-version="22.0.0"`.

(Skip this step if `dist-integration` doesn't include the ng-version attribute pre-hydration — it's set at runtime. The cypress test is the real assertion.)

No commit at end of Task 10 — verification only.

---

## Phase 8 — Final sweep

### Task 11: Repository-wide sanity check

**Files:** none (verification only)

- [ ] **Step 1: No stray ng21 references anywhere**

Run: `grep -rn "ng21\|hello-world-ng21\|>=21\.0\.0 <22\.0\.0" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.nx --exclude-dir=dist 2>&1`
Expected: matches only in `.plans/angular-v22-support.md` (this plan, intentional), `CHANGELOG.md` (historical entries), `docs/articles/2025-12-17_announcing_ngxs_21/` (the v21 announcement), and other historical/announcement content. No matches in `packages/`, `.github/`, `.circleci/`, `package.json`, or any `*.ts`/`*.json` config.

- [ ] **Step 2: Confirm all peer ranges**

Run: `grep -rn "@angular/core" packages/*/package.json`
Expected: every line shows `">=22.0.0 <23.0.0"`.

- [ ] **Step 3: Confirm Nx versions**

Run: `grep -E '"@nx/' package.json`
Expected: every `@nx/*` entry shows `22.7.5` (or the migrated version, but consistent across all `@nx/*`).

- [ ] **Step 4: Final build + test**

Run: `yarn build && yarn nx run-many --target=test --all --maxWorkers=4 && yarn test:types`
Expected: all green.

- [ ] **Step 5: Inspect git log**

Run: `git log master..HEAD --oneline`
Expected: a clean list of semantic commits roughly matching:

```
ci: wire integration suite to hello-world-ng22
build: remove hello-world-ng21 integration app
build: bump @angular/core peer dependency to >=22 <23
build: add hello-world-ng22 integration app
build: apply Nx 22 workspace migrations
build: bump Nx workspace to 22.7.5 (migration manifest)
chore: bump Node toolchain to 22.22.3 for Angular 22
```

(Plus the plan-commit at the very start.)

No commit at end of Task 11 — done. Stop here and hand back to Mark for review.

---

## Out of scope (NOT in this branch)

The following follow up changes are deliberately **excluded** from this plan and should each be a separate commit/PR after this branch merges:

- **`chore: release v22.0.0`** — bumps root `package.json` `version` from `21.0.0` → `22.0.0` and updates `packages/store/schematics/src/utils/versions.json` + `packages/storage-plugin/schematics/src/utils/versions.json` to `22.0.0`. Mirrors commit `6ca44407`.
- **CHANGELOG update** — adds the `### 22.0.0 YYYY-MM-DD` section under the "To become next version" header in `CHANGELOG.md`.
- **v22 announcement article** — a docs PR adds `docs/articles/<date>_announcing_ngxs_22/article.md` mirroring the v21 article.
- **Root workspace Angular bump** — moving root `devDependencies` from `@angular/core@20.3.2` → `@angular/core@22.x` was deliberately skipped in PR #2387 and we preserve that. If the team decides ng-packagr + the library source need a newer Angular to build, that's a separate cleanup.

## Rollback notes

If any phase breaks the build irrecoverably:

- **Phase 1 (Node)** — revert the single commit; safe.
- **Phase 2 (Nx)** — revert both Nx commits; safe. Keep an eye on `nx.json` getting auto-rewritten by migrations in ways that conflict with custom config.
- **Phase 3 (ng22 folder)** — revert; the ng21 folder isn't deleted until Phase 6, so the integration matrix still works after a revert.
- **Phase 4 (peer deps)** — revert; consumers on Angular 21 stay supported.
- **Phase 6 (ng21 deletion)** — if it turns out ng22 has a blocker, revert this commit to bring ng21 back, and pause merging the branch until ng22 is fixed.

If Phase 6 has been merged before a blocker is found, restore the ng21 folder via `git checkout <pre-v22-commit> -- integrations/hello-world-ng21` and revert the CI rename in Phase 5.
