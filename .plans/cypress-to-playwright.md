# Cypress → Playwright Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Cypress with Playwright across the NGXS monorepo (root integration app + `hello-world-ng22` integration), preserving every behavior currently exercised by Cypress while eliminating the Node-22-compatibility friction that motivated this work.

**Architecture:** Playwright at the root acts as the single source of e2e tooling. Both the root integration app and `hello-world-ng22` use `@playwright/test`, with the integration app linking back via a `file:` dependency (mirroring the current Cypress wiring). Playwright's built-in `webServer` config replaces `start-server-and-test` for both apps. SSR vs non-SSR mode (currently toggled by the `SSR` env var) is preserved using the same env var driving `testMatch` and `webServer.command` in `playwright.config.ts`.

**Tech Stack:** `@playwright/test` (latest, currently 1.49.x family), TypeScript 5.9 at root / 6.0 in ng22, Node 22.22.3, Angular 20 (root) / Angular 22 (ng22).

## Global Constraints

- Node version: 22.22.3 (set by `.node-version` and CI `NODE_VERSION: 22.x`).
- Yarn classic (1.22.x) — `preinstall` script enforces yarn-only.
- Browser coverage: chromium only by default (matches current Cypress CI usage). Firefox/WebKit not required for migration parity but can be added later.
- Existing CI entry point must remain `yarn integration:ng22` (workflows in `.github/workflows/{pr-validation,trunk,release}.yml` reference this script verbatim).
- Tests under `cypress/ssr/` rely on `cy.request()` only (no browser rendering). Migrate to Playwright `APIRequestContext` via the `request` fixture — do not introduce headless browser navigation for these.
- Cypress at the root is also referenced by integration via `"cypress": "file:../../node_modules/cypress"`. Replacement dep must follow the same pattern: `"@playwright/test": "file:../../node_modules/@playwright/test"`.
- Mark's commit style: small semantic conventional commits (`build(integration-ng22): …`, `test(e2e): …`, `chore: …`).

---

## File Structure

**Created:**

- `playwright.config.ts` (root) — main config, branches on `SSR` env var like the old `cypress.config.ts`.
- `e2e/list-page.spec.ts` — replaces `cypress/e2e/list-page.cy.ts`.
- `e2e/ssr/ssr.spec.ts` — replaces `cypress/ssr/ssr.cy.ts`.
- `e2e/tsconfig.json` — minimal TS config for Playwright specs at root.
- `integrations/hello-world-ng22/playwright.config.ts` — integration config.
- `integrations/hello-world-ng22/e2e/index-page.spec.ts` — replaces `cypress/e2e/index-page.cy.ts`.
- `integrations/hello-world-ng22/e2e/tsconfig.json` — minimal TS config for integration specs.

**Modified:**

- `package.json` (root) — scripts + devDependencies.
- `integrations/hello-world-ng22/package.json` — scripts + devDependencies.
- `.github/actions/setup/action.yml` — add Playwright browser install step.

**Deleted:**

- `cypress.config.ts` (root).
- `cypress/` directory (root) — includes `e2e/`, `ssr/`, `support/`, `plugins/`, `fixtures/`, `tsconfig.json`.
- `integrations/hello-world-ng22/cypress.config.ts`.
- `integrations/hello-world-ng22/cypress/` directory.

---

## Cypress → Playwright API Translation Reference

This is the exact mapping used across the migration. Engineers should not reinvent these conversions per file.

| Cypress                                                                                    | Playwright                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `describe('X', () => { it('Y', () => {...}) })`                                            | `import { test, expect } from '@playwright/test'; test.describe('X', () => { test('Y', async ({ page }) => {...}) })`                                                              |
| `beforeEach(() => cy.visit('/path'))`                                                      | `test.beforeEach(async ({ page }) => { await page.goto('/path'); })`                                                                                                               |
| `cy.visit('/path')`                                                                        | `await page.goto('/path');`                                                                                                                                                        |
| `cy.get('.selector')`                                                                      | `page.locator('.selector')`                                                                                                                                                        |
| `cy.get('.selector').click()`                                                              | `await page.locator('.selector').click()`                                                                                                                                          |
| `cy.get('.selector').invoke('text').should(text => expect(text).to.equal('X'))`            | `await expect(page.locator('.selector')).toHaveText('X')`                                                                                                                          |
| `cy.get('button').click().click().click().get('p').should('contain.text', 'Counter is 3')` | `await page.locator('button').click(); await page.locator('button').click(); await page.locator('button').click(); await expect(page.locator('p')).toContainText('Counter is 3');` |
| `cy.get('app-root').invoke('attr', 'ng-version').should('have.string', '22')`              | `await expect(page.locator('app-root')).toHaveAttribute('ng-version', /^22\./)`                                                                                                    |
| `cy.request(url).its('headers').then(h => expect(h).to.have.property('x-powered-by'))`     | `const res = await request.get(url); expect(res.headers()).toHaveProperty('x-powered-by');`                                                                                        |
| `cy.request(url).its('status').should('equal', 200)`                                       | `const res = await request.get(url); expect(res.status()).toBe(200);`                                                                                                              |
| `cy.request(url).its('body').should('include', 'X')`                                       | `const res = await request.get(url); expect(await res.text()).toContain('X');`                                                                                                     |

For `request`-based specs (SSR), use the `request` fixture: `test('...', async ({ request }) => {...})`. No `page` needed.

---

## Phase A — Root App Migration

### Task A1: Install Playwright at root, scaffold config

**Files:**

- Create: `playwright.config.ts`
- Create: `e2e/tsconfig.json`
- Create: `e2e/.gitkeep` (placeholder, removed in A2)
- Modify: `package.json` (devDependencies only)

**Interfaces:**

- Produces: `@playwright/test` available at root `node_modules/`; `playwright.config.ts` exporting a config that A2/A3 will register tests against.

- [ ] **Step 1: Install Playwright as devDependency**

```bash
yarn add -D @playwright/test
yarn playwright install --with-deps chromium
```

Expected: `package.json` updated, `~/.cache/ms-playwright/` (or `%LOCALAPPDATA%\ms-playwright`) populated with chromium build.

- [ ] **Step 2: Create root `playwright.config.ts`**

```typescript
import { defineConfig, devices } from '@playwright/test';

const isSsr = process.env.SSR === 'true';

export default defineConfig({
  testDir: './e2e',
  testMatch: isSsr ? 'ssr/**/*.spec.ts' : '*.spec.ts',
  testIgnore: isSsr ? undefined : 'ssr/**',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:4200',
    navigationTimeout: 120_000,
    actionTimeout: 60_000,
    trace: 'on-first-retry'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: isSsr ? 'yarn serve:integration:ssr' : 'yarn serve:integration:static',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000
  }
});
```

- [ ] **Step 3: Create `e2e/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "moduleResolution": "node",
    "ignoreDeprecations": "6.0",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["**/*.ts", "../playwright.config.ts"]
}
```

- [ ] **Step 4: Create placeholder `e2e/.gitkeep`** (empty file, deleted in A2)

- [ ] **Step 5: Verify Playwright sees the config**

```bash
yarn playwright test --list
```

Expected: lists zero tests, no errors. Config loads cleanly.

- [ ] **Step 6: Commit**

```bash
git add package.json yarn.lock playwright.config.ts e2e/
git commit -m "chore(e2e): add @playwright/test scaffolding at root"
```

---

### Task A2: Migrate the e2e list-page spec

**Files:**

- Create: `e2e/list-page.spec.ts`
- Delete: `e2e/.gitkeep`

**Interfaces:**

- Consumes: `playwright.config.ts` from A1 (testDir, baseURL, webServer).
- Produces: `e2e/list-page.spec.ts` — first passing Playwright spec at the root.

- [ ] **Step 1: Write the new spec**

`e2e/list-page.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('List page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/list');
  });

  test('should contain form with "h3" title', async ({ page }) => {
    await expect(page.locator('.todo-list h3').first()).toHaveText('Reactive Form');
  });
});
```

- [ ] **Step 2: Remove the placeholder**

```bash
git rm e2e/.gitkeep
```

- [ ] **Step 3: Run the new spec**

```bash
yarn playwright test e2e/list-page.spec.ts
```

Expected: Playwright spawns `yarn serve:integration:static` (via webServer), waits for `http://localhost:4200`, runs the test, server shuts down. 1 passed.

- [ ] **Step 4: Verify equivalence against old Cypress spec**

Open `cypress/e2e/list-page.cy.ts` side-by-side with the new spec and confirm the selector (`.todo-list h3`) and expected text (`Reactive Form`) match exactly.

- [ ] **Step 5: Commit**

```bash
git add e2e/list-page.spec.ts
git commit -m "test(e2e): port list-page test from Cypress to Playwright"
```

---

### Task A3: Migrate the SSR specs

**Files:**

- Create: `e2e/ssr/ssr.spec.ts`

**Interfaces:**

- Consumes: `playwright.config.ts`'s SSR branch from A1 (testMatch, webServer.command swap).
- Produces: `e2e/ssr/ssr.spec.ts` — passing SSR check using `request` fixture only (no `page`).

- [ ] **Step 1: Write the new spec**

`e2e/ssr/ssr.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

const listUrl = 'http://localhost:4200/list';
const faviconUrl = 'http://localhost:4200/favicon.ico';

const orderedLifecycleHooks = [
  'NgxsOnInit todo',
  'NgxsAfterBootstrap todo',
  'NgxsOnInit lazy',
  'NgxsAfterBootstrap lazy'
];

test.describe('Server side rendering', () => {
  test('should make sure the Express server is running', async ({ request }) => {
    const res = await request.get(listUrl);
    expect(res.headers()).toHaveProperty('x-powered-by');
  });

  test('should serve statics and favicon.ico', async ({ request }) => {
    const res = await request.get(faviconUrl);
    expect(res.status()).toBe(200);
  });

  test('"ngOnInit todo" should exist', async ({ request }) => {
    const res = await request.get(listUrl);
    expect(await res.text()).toContain('ngOnInit todo');
  });

  for (const hook of orderedLifecycleHooks) {
    test(`should have '${hook}' lifecycle hook output visible`, async ({ request }) => {
      const res = await request.get(listUrl);
      expect(await res.text()).toContain(hook);
    });
  }

  test('lifecycle hooks should exist in the correct order (root => lazy)', async ({
    request
  }) => {
    const res = await request.get(listUrl);
    const body = await res.text();
    const indexes = orderedLifecycleHooks.map(text => body.indexOf(text));
    indexes.forEach((idx, i) => {
      const previous = i > 0 ? indexes[i - 1] : -1;
      expect(
        idx,
        `'${orderedLifecycleHooks[i]}' index should be greater than ${previous}`
      ).toBeGreaterThan(previous);
    });
  });

  test('should successfully resolve list of animals', async ({ request }) => {
    const res = await request.get(listUrl);
    const body = await res.text();
    expect(body).toContain('animals were resolved');
    expect(body).toContain('zebras,pandas,lions,giraffes');
  });
});
```

- [ ] **Step 2: Build the SSR bundle (required because `serve:integration:ssr` runs `node dist-integration/server/server.mjs`)**

```bash
yarn build:integration
```

Expected: `dist-integration/server/server.mjs` exists.

- [ ] **Step 3: Run SSR specs**

```bash
cross-env SSR=true yarn playwright test
```

Expected: Playwright loads SSR branch of config → spawns `yarn serve:integration:ssr` → runs 9 tests → all pass.

- [ ] **Step 4: Verify non-SSR still works after this change**

```bash
yarn playwright test
```

Expected: only `list-page.spec.ts` runs (testIgnore excludes `ssr/**`), 1 passed.

- [ ] **Step 5: Commit**

```bash
git add e2e/ssr/ssr.spec.ts
git commit -m "test(e2e): port SSR specs from Cypress to Playwright"
```

---

### Task A4: Replace root yarn scripts and remove start-server-and-test

**Files:**

- Modify: `package.json` (scripts + devDependencies)

**Interfaces:**

- Consumes: working `playwright.config.ts` from A1.
- Produces: `yarn e2e`, `yarn e2e:ssr`, `yarn test:ci:e2e`, `yarn test:ci:integration:ssr` as Playwright invocations.

- [ ] **Step 1: Modify `package.json` scripts block**

Remove:

```
"start-test": "start-server-and-test",
"cy:open": "cypress open",
"cy:open:ssr": "cross-env SSR=true cypress open",
"cy:run": "cypress run",
"cy:run:ssr": "cross-env SSR=true cypress run",
"cy:run:chrome": "yarn cy:run --browser chrome",
"cy:run:chromium": "yarn cy:run --browser chromium",
"e2e": "start-test serve:integration 4200 cy:open",
"e2e:ssr": "start-test serve:integration:ssr 4200 cy:open:ssr",
"e2e:chrome": "start-test serve:integration 4200 cy:run:chrome",
"e2e:chromium": "start-test serve:integration 4200 cy:run:chromium",
"test:ci:e2e": "yarn start-test serve:integration:static 4200 cy:run",
"test:ci:integration:ssr": "cross-env CI=true yarn build:integration && yarn start-test serve:integration:ssr 4200 cy:run:ssr",
```

Add (under the same `// - E2E` / `// - CI` section comments):

```
"e2e": "playwright test --ui",
"e2e:ssr": "cross-env SSR=true playwright test --ui",
"e2e:headless": "playwright test",
"test:ci:e2e": "cross-env CI=true playwright test",
"test:ci:integration:ssr": "cross-env CI=true SSR=true yarn build:integration && playwright test",
```

- [ ] **Step 2: Remove `start-server-and-test` from devDependencies**

In `package.json` devDependencies, remove the line:

```
"start-server-and-test": "^3.0.11",
```

- [ ] **Step 3: Remove `cypress` from devDependencies**

In `package.json` devDependencies, remove the line:

```
"cypress": "^14.5.4",
```

- [ ] **Step 4: Reinstall**

```bash
yarn install
```

Expected: lockfile shrinks; cypress and start-server-and-test removed.

- [ ] **Step 5: Smoke-test the new scripts**

```bash
yarn test:ci:e2e
```

Expected: 1 passed (list-page spec).

```bash
yarn test:ci:integration:ssr
```

Expected: integration builds, SSR specs run, 9 passed.

- [ ] **Step 6: Commit**

```bash
git add package.json yarn.lock
git commit -m "build(e2e): switch root scripts from Cypress to Playwright"
```

---

### Task A5: Delete legacy Cypress files at root

**Files:**

- Delete: `cypress.config.ts`
- Delete: `cypress/` (entire directory: `e2e/`, `ssr/`, `support/`, `plugins/`, `fixtures/`, `tsconfig.json`)

**Interfaces:**

- Consumes: working Playwright pipeline from A4.
- Produces: clean repo with no Cypress references at root.

- [ ] **Step 1: Confirm nothing else references these paths**

```bash
yarn nx graph --file=/dev/null 2>&1 | grep -i cypress || echo "no cypress references"
```

And:

```bash
grep -r "cypress" --include="*.ts" --include="*.json" --include="*.yml" -l . | grep -v node_modules | grep -v .plans
```

Expected: no Cypress references outside `cypress.config.ts` and `cypress/`.

- [ ] **Step 2: Remove the files**

```bash
git rm -r cypress.config.ts cypress/
```

- [ ] **Step 3: Run full pipeline once more**

```bash
yarn test:ci:e2e && yarn test:ci:integration:ssr
```

Expected: both succeed.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore(e2e): remove legacy Cypress config and specs from root"
```

---

## Phase B — `hello-world-ng22` Integration Migration

### Task B1: Install Playwright in the integration app

**Files:**

- Modify: `integrations/hello-world-ng22/package.json` (devDependencies)

**Interfaces:**

- Consumes: `@playwright/test` already present in root `node_modules` from Task A1.
- Produces: integration's `node_modules/@playwright/test` linked via `file:` reference.

- [ ] **Step 1: Add `@playwright/test` as devDependency in `integrations/hello-world-ng22/package.json`**

Replace this block:

```json
"cypress": "file:../../node_modules/cypress",
```

with:

```json
"@playwright/test": "file:../../node_modules/@playwright/test",
```

Remove:

```json
"start-server-and-test": "file:../../node_modules/start-server-and-test",
```

Keep `serve` (still needed by the static file server for the integration).

- [ ] **Step 2: Reinstall integration deps**

```bash
cd integrations/hello-world-ng22
yarn install --force
```

Expected: `node_modules/@playwright/test/package.json` exists, version matches root.

- [ ] **Step 3: Verify Playwright CLI is reachable**

```bash
yarn playwright --version
```

Expected: prints Playwright version (matches root install).

- [ ] **Step 4: Commit**

```bash
cd ../..
git add integrations/hello-world-ng22/package.json integrations/hello-world-ng22/yarn.lock
git commit -m "build(integration-ng22): swap cypress dep for @playwright/test"
```

---

### Task B2: Create integration Playwright config and spec

**Files:**

- Create: `integrations/hello-world-ng22/playwright.config.ts`
- Create: `integrations/hello-world-ng22/e2e/index-page.spec.ts`
- Create: `integrations/hello-world-ng22/e2e/tsconfig.json`

**Interfaces:**

- Consumes: `@playwright/test` from B1; `yarn serve:integration:static` script already in `integrations/hello-world-ng22/package.json`.
- Produces: passing integration e2e under Playwright.

- [ ] **Step 1: Create `integrations/hello-world-ng22/playwright.config.ts`**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:4200',
    navigationTimeout: 120_000,
    actionTimeout: 60_000,
    trace: 'on-first-retry'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'yarn serve:integration:static',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000
  }
});
```

- [ ] **Step 2: Create `integrations/hello-world-ng22/e2e/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "moduleResolution": "node",
    "ignoreDeprecations": "6.0",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["**/*.ts", "../playwright.config.ts"]
}
```

- [ ] **Step 3: Create `integrations/hello-world-ng22/e2e/index-page.spec.ts`**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Index page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should render application using the latest version', async ({ page }) => {
    await expect(page.locator('app-root')).toHaveAttribute('ng-version', /^22\./);
  });

  test('should click on the button and increase the counter', async ({ page }) => {
    const button = page.locator('button');
    await button.click();
    await button.click();
    await button.click();
    await expect(page.locator('p')).toContainText('Counter is 3');
  });
});
```

- [ ] **Step 4: Build the integration app (required so the static server has something to serve)**

```bash
cd integrations/hello-world-ng22
yarn build:prod
```

Expected: `dist-integration/browser/` populated.

- [ ] **Step 5: Run the new spec locally**

```bash
yarn playwright test
```

Expected: webServer spawns `yarn serve:integration:static`, both tests pass.

- [ ] **Step 6: Commit**

```bash
cd ../..
git add integrations/hello-world-ng22/playwright.config.ts integrations/hello-world-ng22/e2e/
git commit -m "test(integration-ng22): port index-page spec from Cypress to Playwright"
```

---

### Task B3: Replace integration yarn scripts

**Files:**

- Modify: `integrations/hello-world-ng22/package.json` (scripts only)

**Interfaces:**

- Consumes: working `playwright.config.ts` from B2.
- Produces: `yarn e2e` and `yarn e2e:ci` in the integration are Playwright invocations; `yarn test:integration` (called by CI from root) is unchanged at its name boundary.

- [ ] **Step 1: Modify `integrations/hello-world-ng22/package.json` scripts block**

Replace:

```json
"start-test": "start-server-and-test",
"cy:open": "cypress open",
"cy:run": "cypress run",
"e2e": "start-test serve:integration:static 4200 cy:open",
"e2e:ci": "start-test serve:integration:static 4200 cy:run"
```

with:

```json
"e2e": "playwright test --ui",
"e2e:ci": "playwright test"
```

Leave `test:integration` definition unchanged:

```json
"test:integration": "yarn install:ci && yarn test:ci && yarn build:prod && yarn e2e:ci"
```

(The internal step `yarn e2e:ci` now resolves to Playwright instead of Cypress; the CI entry point `yarn integration:ng22` from the root keeps working.)

- [ ] **Step 2: Smoke-test from the integration folder**

```bash
cd integrations/hello-world-ng22
yarn e2e:ci
```

Expected: 2 passed.

- [ ] **Step 3: Smoke-test the full CI entry point from root**

```bash
cd ../..
yarn integration:ng22
```

Expected: vitest unit tests pass, build succeeds, Playwright e2e passes, exit 0.

- [ ] **Step 4: Commit**

```bash
git add integrations/hello-world-ng22/package.json
git commit -m "build(integration-ng22): switch e2e scripts to Playwright"
```

---

### Task B4: Delete legacy Cypress files in integration

**Files:**

- Delete: `integrations/hello-world-ng22/cypress.config.ts`
- Delete: `integrations/hello-world-ng22/cypress/` (entire directory)

**Interfaces:**

- Consumes: working Playwright integration pipeline from B3.
- Produces: clean integration folder, only Playwright artifacts remain.

- [ ] **Step 1: Remove the files**

```bash
git rm -r integrations/hello-world-ng22/cypress.config.ts integrations/hello-world-ng22/cypress/
```

- [ ] **Step 2: Re-run the CI entry point one final time**

```bash
yarn integration:ng22
```

Expected: 2 e2e tests + 3 vitest tests pass.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore(integration-ng22): remove legacy Cypress config and specs"
```

---

## Phase C — CI Wiring

### Task C1: Install Playwright browsers in CI setup action

**Files:**

- Modify: `.github/actions/setup/action.yml`

**Interfaces:**

- Consumes: nothing from previous tasks beyond the fact that `@playwright/test` is now a project dep at root and integration.
- Produces: every CI job that uses `./.github/actions/setup` has chromium pre-installed for Playwright.

- [ ] **Step 1: Inspect the current setup action**

Read `.github/actions/setup/action.yml`. Identify the step that runs `yarn install` (or equivalent).

- [ ] **Step 2: Add a browser-install step immediately after `yarn install`**

Append a step like:

```yaml
- name: Install Playwright browsers
  shell: bash
  run: yarn playwright install --with-deps chromium
```

**Why `--with-deps`:** On Linux runners, chromium needs system libraries that Playwright knows how to apt-install. `--with-deps` handles this in one step. (Mac/Windows runners do not require this flag but it is a no-op there.)

- [ ] **Step 3: Verify locally that the same install works on a fresh `node_modules`**

```bash
rm -rf node_modules ~/.cache/ms-playwright
yarn install
yarn playwright install --with-deps chromium
yarn test:ci:e2e
```

Expected: end-to-end success from cold start.

- [ ] **Step 4: Commit**

```bash
git add .github/actions/setup/action.yml
git commit -m "ci: install Playwright chromium in setup composite action"
```

---

### Task C2: Verify CI artifact upload pattern still works

**Files:**

- Verify only (no changes expected): `.github/actions/upload-integration-test-artifact/action.yml`

**Interfaces:**

- Consumes: build output from `yarn integration:ng22` (path `./integrations/**/dist-integration/**/main*.js`).
- Produces: confirmation that Playwright's introduction did not break artifact paths.

- [ ] **Step 1: Re-read the action**

```bash
cat .github/actions/upload-integration-test-artifact/action.yml
```

Confirm `path: ./integrations/**/dist-integration/**/main*.js` still matches the integration build output. Playwright does not change the build path — only the test runner — so this should be a no-op.

- [ ] **Step 2: Open a PR**

Push the branch and open a draft PR. Watch `premerge-integration-test` job complete green.

- [ ] **Step 3: If green, mark plan complete; if red, capture the failing logs and fall back to Phase A/B for the affected sub-step**

---

## Risks & Open Questions

These are flagged for the engineer/reviewer — not blockers, but worth a conscious decision in flight.

1. **Browser strategy** — The plan installs only chromium to match current CI behavior. If the team wants the migration to expand coverage to Firefox/WebKit, add projects in both `playwright.config.ts` files and adjust the install step to omit the explicit `chromium` arg.

2. **`webServer` vs `start-server-and-test` semantics** — Playwright's `webServer` blocks until the URL responds and tears it down at the end of the run. This is equivalent to `start-server-and-test`'s contract, but if any external script outside Playwright also expected `start-server-and-test` to be available (e.g., a developer's personal alias), it disappears with this migration. Search the repo before merging: `grep -r "start-server-and-test\|start-test " --include="*.json" --include="*.md"` should return only the touch points listed in this plan.

3. **`reuseExistingServer: !process.env.CI`** — Locally, if a dev already has `yarn serve:integration:static` running on 4200, Playwright will use it. On CI it will always spawn a fresh one. This matches the Cypress + start-server-and-test behavior closely enough; flag if a different policy is wanted.

4. **Trace/video/screenshot policy** — The plan sets `trace: 'on-first-retry'`. The old Cypress config disabled video and screenshots. Playwright's defaults are off for screenshot/video, on for trace-on-retry. Decide whether to dial trace down to `off` to match Cypress exactly, or keep `on-first-retry` for CI debugging value (recommended: keep).

5. **TypeScript deprecations in TS 6 (ng22)** — The new `e2e/tsconfig.json` in the integration uses `ignoreDeprecations: "6.0"` for the same reason as the cypress tsconfig fix already committed. If TS 7 lands before the next refresh, both these tsconfigs will need an update — track via the same surface as the existing tsconfigs that carry this flag.

6. **`integration` Nx project has no `e2e` target** — Currently e2e is driven entirely from root yarn scripts, not Nx. The plan keeps this pattern (does not introduce an Nx `e2e` target). If a future cleanup wants to put e2e behind `nx run integration:e2e`, that's a separate refactor.

7. **Tutorials directory** — `tutorials/create-app/` has its own install. The audit confirmed no Cypress usage there, so it's untouched. Re-verify with `grep -r cypress tutorials/` before declaring done.

---

## Self-Review

**Spec coverage check:**

- Root e2e (`list-page.cy.ts`) → Task A2 ✓
- Root SSR (`ssr.cy.ts`) → Task A3 ✓
- Integration e2e (`index-page.cy.ts`) → Task B2 ✓
- Root configuration (`cypress.config.ts`, SSR toggle) → Task A1 (config), A5 (delete) ✓
- Integration configuration → Task B2 (config), B4 (delete) ✓
- Root yarn scripts (12 of them) → Task A4 ✓
- Integration yarn scripts (4 of them) → Task B3 ✓
- `cypress` devDependency at root → Task A4 (remove) ✓
- `cypress` devDependency in integration → Task B1 (swap) ✓
- `start-server-and-test` at root → Task A4 (remove) ✓
- `start-server-and-test` in integration → Task B1 (remove) ✓
- CI workflows (`pr-validation`, `trunk`, `release`) — unchanged at the `yarn integration:ng22` entry point, but browser install is added → Task C1 ✓
- CI artifact upload — verified unchanged → Task C2 ✓

**Type consistency check:**

- `playwright.config.ts` exports a single default config in both root and integration. Both use `defineConfig` from `@playwright/test`. ✓
- `test`, `expect`, and `request` fixture used consistently across A2, A3, B2. ✓
- Selector style (`page.locator(...)`) consistent. ✓

**Placeholder scan:** No "TBD", no "implement later", no "similar to Task N". Each spec file has full code. ✓
