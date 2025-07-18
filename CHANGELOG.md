# [DEV version](https://www.npmjs.com/package/@ngxs/store/v/dev)

```bash
$ npm install @ngxs/store@dev
```

### To become next patch version

...

### 20.1.0 2025-07-16

- Feature(store): Add `withNgxsNoopExecutionStrategy` [#2359](https://github.com/ngxs/store/pull/2359)

### 20.0.2 2025-06-19

- Revert(store): Revert `@Select` decorator removal [#2351](https://github.com/ngxs/store/pull/2351)

### 20.0.1 2025-06-19

- Fix(store): Add missing `detach` to action director [#2349](https://github.com/ngxs/store/pull/2349)

### 20.0.0 2025-06-16

- Build: Add Angular 20 support [#2342](https://github.com/ngxs/store/pull/2342)
- Feature(store): Implement `ActionDirector` [#2329](https://github.com/ngxs/store/pull/2329)
- Feature(store): Add `lazyProvider` utility [#2326](https://github.com/ngxs/store/pull/2326)
- Feature(devtools-plugin): Add `serialize` option [#2337](https://github.com/ngxs/store/pull/2337)
- Refactor: Replace `ngOnDestroy` with `DestroyRef` [#2289](https://github.com/ngxs/store/pull/2289)
- Refactor: Reduce RxJS dependency [#2292](https://github.com/ngxs/store/pull/2292)
- Refactor: Pull less RxJS symbols [#2309](https://github.com/ngxs/store/pull/2309) [#2310](https://github.com/ngxs/store/pull/2310)
- Refactor: Replace `ENVIRONMENT_INITIALIZER` [#2314](https://github.com/ngxs/store/pull/2314)
- Refactor: Replace `const enum` [#2335](https://github.com/ngxs/store/pull/2335)
- Fix(store): Add root store initializer guard [#2278](https://github.com/ngxs/store/pull/2278)
- Fix(store): Reduce change detection cycles with pending tasks [#2280](https://github.com/ngxs/store/pull/2280)
- Fix(store): Complete action results on destroy [#2282](https://github.com/ngxs/store/pull/2282)
- Fix(store): Complete `dispatched$` in internal actions [#2285](https://github.com/ngxs/store/pull/2285)
- Fix(store): Stop contributing to stability once app is stable [#2306](https://github.com/ngxs/store/pull/2306)
- Build(store): Use `ngServerMode` to check whether we are in SSR [#2287](https://github.com/ngxs/store/pull/2287)
- Build(storage-plugin): Use `ngServerMode` to check whether we are in SSR [#2288](https://github.com/ngxs/store/pull/2288)
- Refactor(form-plugin): Replace `takeUntil` with `takeUntilDestroyed` [#2283](https://github.com/ngxs/store/pull/2283)
- Refactor(router-plugin): Reduce RxJS depedency [#2291](https://github.com/ngxs/store/pull/2291)
- Refactor(router-plugin): Change `@Selector` to `createSelector` [#2294](https://github.com/ngxs/store/pull/2294)
- CI(bundlemon): Upgrade to bundlemon v3 [#2330](https://github.com/ngxs/store/pull/2330)

### 19.0.0 2024-12-3

- Build: Add Angular 19 support [#2269](https://github.com/ngxs/store/pull/2269)

### 18.1.6 2024-11-20

- Refactor: Use field initializers for injectees [#2258](https://github.com/ngxs/store/pull/2258)
- Refactor: Allow tree-shaking of dev-only code [#2259](https://github.com/ngxs/store/pull/2259)
- Fix(store): Allow plain functions in `withNgxsPlugin` [#2255](https://github.com/ngxs/store/pull/2255)
- Fix(store): Run plugins in injection context [#2256](https://github.com/ngxs/store/pull/2256)
- Fix(store): Setup unhandled error handler during NGXS initialization [#2263](https://github.com/ngxs/store/pull/2263)
- Fix(websocket-plugin): Do not dispatch action when root injector is destroyed [#2257](https://github.com/ngxs/store/pull/2257)
- Refactor(store): Replace `exhaustMap` [#2254](https://github.com/ngxs/store/pull/2254)
- Refactor(store): Tree-shake development options token [#2260](https://github.com/ngxs/store/pull/2260)
- Performance(store): Prevent initializing state factory at feature levels [#2261](https://github.com/ngxs/store/pull/2261)
- Revert: Revert router state changes [#2264](https://github.com/ngxs/store/pull/2264)

### 18.1.5 2024-11-12

- Fix(store): Prevent writing to state once action handler is unsubscribed [#2231](https://github.com/ngxs/store/pull/2231)
- Performance(store): Replace `instanceof Function` with `typeof` [#2247](https://github.com/ngxs/store/pull/2247)
- Refactor(store): Use `Object.is` as default equality check [#2245](https://github.com/ngxs/store/pull/2245)
- Refactor(store): Tree-shake internal state tokens [#2246](https://github.com/ngxs/store/pull/2246)
- Refactor(router-plugin): Mark selectors as pure [#2248](https://github.com/ngxs/store/pull/2248) **(Note: reverted in 18.1.6)**
- Refactor(storage-plugin): Mark engine tokens as pure [#2249](https://github.com/ngxs/store/pull/2249)

### 18.1.4 2024-10-23

- Fix(store): Disallow nullable actions in `dispatch()` [#2221](https://github.com/ngxs/store/pull/2221)
- Fix(logger-plugin): Run `filter` function in injection context [#2236](https://github.com/ngxs/store/pull/2236)

### 18.1.3 2024-10-21

- Build: Copy LICENSE after build [#2234](https://github.com/ngxs/store/pull/2234)

### 18.1.2 2024-10-21

- Fix(store): Allow selector utils usage within state class [#2210](https://github.com/ngxs/store/pull/2210)
- Fix(store): Register feature plugins correctly [#2228](https://github.com/ngxs/store/pull/2228)
- Fix(store): Memoize selectors which return NaN [#2230](https://github.com/ngxs/store/pull/2230)
- Performance(store): Avoid going over states list every time action is dispatched [#2219](https://github.com/ngxs/store/pull/2219)
- Refactor(store): Add action registry [#2224](https://github.com/ngxs/store/pull/2224)

### 18.1.1 2024-08-06

- Fix(store): allow dispatch within effect [#2201](https://github.com/ngxs/store/pull/2201)
- Fix(store): use computed in selectSignal [#2201](https://github.com/ngxs/store/pull/2201)

### 18.1.0 2024-07-29

- Feature(store): Debounce `selectSignal` by default [#2190](https://github.com/ngxs/store/pull/2190)
- Feature(store): Add `withExperimentalNgxsPendingTasks` [#2186](https://github.com/ngxs/store/pull/2186)
- Fix(store): Decouple state signal updates from synchronous changes [#2189](https://github.com/ngxs/store/pull/2189)
- Fix(schematics): remove local ng utils for schematics [#2184](https://github.com/ngxs/store/pull/2184)

### 18.0.0 2024-06-10

- Feature(store): Improve action decorator types [#2158](https://github.com/ngxs/store/pull/2158)
- Feature(store): Improve selector decorator types [#2042](https://github.com/ngxs/store/pull/2042)
- Feature(store): Add preboot feature and recipe [#2156](https://github.com/ngxs/store/pull/2156)
- Feature(store): Add `dispatch` utility [#2143](https://github.com/ngxs/store/pull/2143)
- Feature(store): Add signals utilities [#2141](https://github.com/ngxs/store/pull/2141)
- Feature(store): Implement NGXS unhandled error handler [#2137](https://github.com/ngxs/store/pull/2137)
- Feature(store): Export selector util types privately [#2140](https://github.com/ngxs/store/pull/2140)
- Feature(store): Expose `withNgxsDevelopmentOptions` standalone API [#2134](https://github.com/ngxs/store/pull/2134)
- Feature(store): Add `selectSignal` [#2097](https://github.com/ngxs/store/pull/2097)
- Feature(store): Deprecate state `children` [#2136](https://github.com/ngxs/store/pull/2136)
- Feature(store): Deprecate `@Select` [#2135](https://github.com/ngxs/store/pull/2135)
- Fix(store): Do not rely on private token when checking whether zone is enabled [#2151](https://github.com/ngxs/store/pull/2151)
- Fix(store): Update `ActionDef` new to return `any` [#2149](https://github.com/ngxs/store/pull/2149)
- Fix(store): Created maps properties should be enumerable [#2150](https://github.com/ngxs/store/pull/2150)
- Fix(store): Remove `RequireAtLeastOneProperty` to make it simpler [#2147](https://github.com/ngxs/store/pull/2147)
- Fix(store): Remove deprecated stuff [#2119](https://github.com/ngxs/store/pull/2119)
- Fix(store): Remove `defaultsState` config property [#2118](https://github.com/ngxs/store/pull/2118)
- Fix(store): Do not inject container state by default [#2117](https://github.com/ngxs/store/pull/2117)
- Fix(store): `select,selectOnce,selectSnapshot` should only accept typed selector [#2116](https://github.com/ngxs/store/pull/2116)
- Fix(store): `setState` and `patchState` should both return `<void>` [#2114](https://github.com/ngxs/store/pull/2114)
- Fix(store): `ofActionErrored` should return `ActionCompletion` [#2112](https://github.com/ngxs/store/pull/2112)
- Fix(store): Enable throwing errors from selectors by default [#2111](https://github.com/ngxs/store/pull/2111)
- Fix(store): `dispatch` return observable should be `<void>` [#2109](https://github.com/ngxs/store/pull/2109)
- Fix(store): Ensure features are initialized after root state [#2083](https://github.com/ngxs/store/pull/2083)
- Fix(store): Log feature states added before store is initialized [#2067](https://github.com/ngxs/store/pull/2067)
- Fix(store): Show error when state initialization order is invalid [#2066](https://github.com/ngxs/store/pull/2066), [#2067](https://github.com/ngxs/store/pull/2067)
- Fix(store): Change `instanceof Promise` to `isPromise` to allow any promisable object [#2093](https://github.com/ngxs/store/pull/2093)
- Fix(store): Router Plugin - Expose `NGXS_ROUTER_PLUGIN_OPTIONS` privately [#2037](https://github.com/ngxs/store/pull/2037)
- Performance(store): Select prop getter implementation only once [#2107](https://github.com/ngxs/store/pull/2107)
- Performance(store): Improve compliant prop getter [#2106](https://github.com/ngxs/store/pull/2106)
- Feature(schematics): Schematics support a project option and standalone detection [#2089](https://github.com/ngxs/store/pull/2089)
- Feature(storage-plugin): Migrate to the property 'keys' [#2108](https://github.com/ngxs/store/pull/2108)
- Feature(storage-plugin): Allow providing feature states [#1994](https://github.com/ngxs/store/pull/1994)
- Feature(storage-plugin): Require explicit options when providing storage plugin [#2100](https://github.com/ngxs/store/pull/2100)
- Fix(schematics): Dasherize the state and store file name [#2090](https://github.com/ngxs/store/pull/2090)
- Fix(websocket-plugin): `WebSocket` title casing should be consistent [#2115](https://github.com/ngxs/store/pull/2115)
- Refactor(store): Move metadata into internals [#2062](https://github.com/ngxs/store/pull/2062)
- Refactor(store): Rely on `ngDevMode` to be always defined [#2138](https://github.com/ngxs/store/pull/2138)
- Refactor(schematics): Enhance schematics behavior for monorepos [#2165](https://github.com/ngxs/store/pull/2165)
- Build: Flatten `.d.ts` files [#2131](https://github.com/ngxs/store/pull/2131)
- Build: Upgrade workspace to Angular 17 [#2087](https://github.com/ngxs/store/pull/2087)
- Build: Add Angular 18 support [#2168](https://github.com/ngxs/store/pull/2168)

# 3.8.2 2023-11-30

- Fix: `patch` state operator must handle existing nulls [#2064](https://github.com/ngxs/store/pull/2064)
- Fix: Storage Plugin - Access local and session storages globals only in browser [#2034](https://github.com/ngxs/store/pull/2034)
- Fix: Storage Plugin - Require only `getItem` and `setItem` on engines [#2036](https://github.com/ngxs/store/pull/2036)
- Fix: Devtools Plugin - Do not re-enter Angular zone when resetting state [#2038](https://github.com/ngxs/store/pull/2038)
- Performance: Tree-shake selectors validation errors [#2020](https://github.com/ngxs/store/pull/2020)
- Build: Add Angular 17 support [#2079](https://github.com/ngxs/store/pull/2079)
- Refactor: Replace `get type()` with `type =` in actions [#2035](https://github.com/ngxs/store/pull/2035)
- Refactor: WebSocket Plugin - Get rid off `rxjs/webSocket` and use `WebSocket` directly [#2033](https://github.com/ngxs/store/pull/2033)

# 3.8.1 2023-05-16

- Fix: Check if state is injectable in JIT [#1988](https://github.com/ngxs/store/pull/1988)
- Fix: State stream should always return latest value even if update is queued up [#1995](https://github.com/ngxs/store/pull/1995)
- Fix: Ensure `StateFactory` does not connect actions multiple times [#2010](https://github.com/ngxs/store/pull/2010)
- Build: Add Angular 16 support [#2008](https://github.com/ngxs/store/pull/2008)
- Refactor: Set singletons as "providedIn: root" [#2015](https://github.com/ngxs/store/pull/2015)

# 3.8.0 2023-03-29

- Feature: Build packages in Ivy format [#1945](https://github.com/ngxs/store/pull/1945)
- Feature: Add advanced selector utilities [#1824](https://github.com/ngxs/store/pull/1824)
- Feature: Expose `ActionContext` and `ActionStatus` [#1766](https://github.com/ngxs/store/pull/1766)
- Feature: `ofAction*` methods should have strong types [#1808](https://github.com/ngxs/store/pull/1808)
- Feature: Improve contextual type inference for state operators [#1806](https://github.com/ngxs/store/pull/1806) [#1947](https://github.com/ngxs/store/pull/1947)
- Feature: Enable warning on unhandled actions [#1870](https://github.com/ngxs/store/pull/1870) [#1951](https://github.com/ngxs/store/pull/1951)
- Feature: Router Plugin - Provide more actions and navigation timing option [#1932](https://github.com/ngxs/store/pull/1932)
- Feature: Storage Plugin - Allow providing namespace for keys [#1841](https://github.com/ngxs/store/pull/1841)
- Feature: Storage Plugin - Enable providing storage engine individually [#1935](https://github.com/ngxs/store/pull/1935)
- Feature: Devtools Plugin - Add new options to the `NgxsDevtoolsOptions` interface [#1879](https://github.com/ngxs/store/pull/1879)
- Feature: Devtools Plugin - Add trace options to `NgxsDevtoolsOptions` [#1968](https://github.com/ngxs/store/pull/1968)
- Feature: Form Plugin - Allow `ngxsFormDebounce` to be string [#1972](https://github.com/ngxs/store/pull/1972)
- Performance: Tree-shake patch errors [#1955](https://github.com/ngxs/store/pull/1955)
- Fix: Get descriptor explicitly when it's considered as a class property [#1961](https://github.com/ngxs/store/pull/1961)
- Fix: Avoid delayed updates from state stream [#1981](https://github.com/ngxs/store/pull/1981)

# 3.7.6 2022-11-23

- Performance: Run change detection once for all `Actions` subscribers once the stream emits [#1939](https://github.com/ngxs/store/pull/1939)
- Fix: Use `isObservable` to test whether actions return an observable [#1925](https://github.com/ngxs/store/pull/1925)
- Fix: Call `ngxsOnChanges` whenever state changes (even through plugins) [#1926](https://github.com/ngxs/store/pull/1926)
- Fix: Do not delegate errors to `ErrorHandler` if users catch them manually [#1927](https://github.com/ngxs/store/pull/1927)
- Fix: Complete `Actions` stream once root view is removed [#1933](https://github.com/ngxs/store/pull/1933)
- Fix: Storage Plugin - Do not skip deserialization for keys with dot notation [#1924](https://github.com/ngxs/store/pull/1924)

# 3.7.5 2022-08-08

- Performance: Tree-shake no type on the action error [#1858](https://github.com/ngxs/store/pull/1858)
- Fix: Give back control to `developmentMode` config property [#1878](https://github.com/ngxs/store/pull/1878)
- Fix: Do not use `refCount()` since it makes selectable stream cold [#1883](https://github.com/ngxs/store/pull/1883)
- Fix: Remove `?` from `ctx` parameter of lifecycle hooks since they are never undefined [#1889](https://github.com/ngxs/store/pull/1889)
- Fix: Avoid incorrectly ordered state observable events [#1908](https://github.com/ngxs/store/pull/1908)
- Fix: Router Plugin - Prevent router overriding valid navigation [#1907](https://github.com/ngxs/store/pull/1907)
- Fix: Storage Plugin - Provide more meaningful error message when the storage quota exceeds [#1863](https://github.com/ngxs/store/pull/1863)
- Fix: Storage Plugin - Ensure the deserialization is not skipped for master key [#1887](https://github.com/ngxs/store/pull/1887)
- Fix: Storage Plugin - Do not re-hydrate the whole state when the feature state is added [#1887](https://github.com/ngxs/store/pull/1887)
- Fix: Devtools Plugin - Enable time-traveling for navigation actions [#1868](https://github.com/ngxs/store/pull/1868)
- Fix: Form Plugin - Prevent actions infinite loop with multiple `ngxsForm` directives [#1890](https://github.com/ngxs/store/pull/1890)
- Fix: Do not check if the state class is injectable within the decorator since the `ɵprov` will not exist in JIT mode [#1867](https://github.com/ngxs/store/pull/1867)
- Revert: revert select decorator changes and add deprecation note [#1871](https://github.com/ngxs/store/pull/1871)

# 3.7.4 2022-06-09

- Build: include support for Angular 14 [#1850](https://github.com/ngxs/store/pull/1850)
- Fix: Do not re-use the global `Store` instance between different apps [#1740](https://github.com/ngxs/store/pull/1740) and [#1804](https://github.com/ngxs/store/pull/1804) **(Note: reverted in v3.7.5)**
- Fix: Handle mixed async scenarios for action handlers [#1762](https://github.com/ngxs/store/pull/1762)
- Fix: An action with cancelUncompleted enabled should unsubscribe before the next action handler is called [#1763](https://github.com/ngxs/store/pull/1763)
- Fix: Do not run `Promise.then` within synchronous tests when decorating factory [#1753](https://github.com/ngxs/store/pull/1753) **(Note: reverted in v3.7.5)**
- Fix: Provide `NoopNgxsExecutionStrategy` explicitly when the zone is nooped [#1819](https://github.com/ngxs/store/pull/1819)
- Fix: Complete the state stream once the root view is removed [#1830](https://github.com/ngxs/store/pull/1830)
- Fix: Be more explicit when checking if Angular is in test mode [#1831](https://github.com/ngxs/store/pull/1831), [#1832](https://github.com/ngxs/store/pull/1832)
- Fix: Devtools Plugin - Do not connect to devtools when the plugin is disabled [#1761](https://github.com/ngxs/store/pull/1761)
- Fix: Router Plugin - Cleanup subscriptions when the root view is destroyed [#1754](https://github.com/ngxs/store/pull/1754)
- Fix: WebSocket Plugin - Cleanup subscriptions and close the connection when the root view is destroyed [#1755](https://github.com/ngxs/store/pull/1755)
- Fix: Storage Plugin - Only restore state if key matches `addedStates` [#1746](https://github.com/ngxs/store/pull/1746)
- Fix: Forms Plugin - Do not destructure primitive types [#1845](https://github.com/ngxs/store/pull/1845)
- Performance: Tree-shake errors and warnings [#1732](https://github.com/ngxs/store/pull/1732)
- Performance: Tree-shake `ConfigValidator`, `HostEnvironment` and `isAngularInTestMode` [#1741](https://github.com/ngxs/store/pull/1741)
- Performance: Tree-shake `SelectFactory` [#1744](https://github.com/ngxs/store/pull/1744)
- Performance: Tree-shake `deepFreeze` [#1819](https://github.com/ngxs/store/pull/1819)
- Performance: Run change detection once for all selectors when asynchronous action has been completed [#1828](https://github.com/ngxs/store/pull/1828)
- Performance: Router Plugin - Tree-shake `isAngularInTestMode()` [#1738](https://github.com/ngxs/store/pull/1738)
- Performance: Tree-shake `isAngularInTestMode()` [#1739](https://github.com/ngxs/store/pull/1739)
- Performance: Storage Plugin - Tree-shake `console.*` calls and expand error messages [#1727](https://github.com/ngxs/store/pull/1727)
- CI: Bundlesize checks should run reliably [#1812](https://github.com/ngxs/store/pull/1812)

# 3.7.3 2021-12-02

- Chore: Add official support for Angular 13 [#1798](https://github.com/ngxs/store/pull/1798)
- CI: Add angular 13 ivy integration test [#1798](https://github.com/ngxs/store/pull/1798)

# 3.7.2 2021-05-18

- Chore: Add official support for Angular 12 [#1752](https://github.com/ngxs/store/pull/1752)
- Fix: Allow to inject the `Store` into the custom error handler [#1708](https://github.com/ngxs/store/pull/1708)
- CI: Add angular 12 ivy integration test [#1750](https://github.com/ngxs/store/pull/1750)
- CI: Add bundlesize check for the latest integration app [#1710](https://github.com/ngxs/store/pull/1710)

# 3.7.1 2020-11-24

- Chore: Add official support for Angular 11 [#1697](https://github.com/ngxs/store/pull/1697)
- Fix: Release NGXS resources when the root module gets destroyed [#1669](https://github.com/ngxs/store/pull/1669)
- Fix: Resilient select if requested before state added [#1701](https://github.com/ngxs/store/pull/1701)
- Fix: Deep merge options with default options [#1686](https://github.com/ngxs/store/pull/1686)
- Fix: Storage Plugin - Resolve state name correctly if the state class has been provided [#1670](https://github.com/ngxs/store/pull/1670)
- CI: Add angular 11 ivy integration test with Ivy on [#1694](https://github.com/ngxs/store/pull/1694) and off [#1696](https://github.com/ngxs/store/pull/1696)

# 3.7.0 2020-09-09

- Feature: Throw an error when actions do not have a static type property [#1625](https://github.com/ngxs/store/pull/1625)
- Feature: Storage Plugin - Add before and after serialize hooks [#1513](https://github.com/ngxs/store/pull/1513)
- Feature: Logger Plugin - Add filter for Logger Plugin [#1571](https://github.com/ngxs/store/pull/1571)
- Feature: Form Plugin - Add reset form action [#1604](https://github.com/ngxs/store/pull/1604)
- Feature: Form Plugin - `ngxsFormClearOnDestroy` should allow the attribute with no value [#1662](https://github.com/ngxs/store/pull/1662)
- Performance: Logger Plugin - Plugin should lazy inject the store once [#1550](https://github.com/ngxs/store/pull/1550)
- Fix: `ofAction*` methods should prevent passing anything except of `ActionType` [#1616](https://github.com/ngxs/store/pull/1616)
- Fix: Remove the recent `@Select` type safety check due to issues with private/protected properties [#1623](https://github.com/ngxs/store/pull/1623)
- Fix: Actions are not canceled when any `Observable` returned by any handler is completed without emitting [#1615](https://github.com/ngxs/store/pull/1615)
- Fix: Router Plugin - Update state after route successfully activates [#1606](https://github.com/ngxs/store/pull/1606)
- Fix: HMR Plugin - Show error when use Angular Ivy with JIT mode [#1607](https://github.com/ngxs/store/pull/1607)
- Fix: Logger Plugin - Filter out only `undefined` payloads [#1617](https://github.com/ngxs/store/pull/1617)
- Fix: Devtools Plugin - Actions with "action" property should not be logged as <UNDEFINED> [#1628](https://github.com/ngxs/store/pull/1628)
- Test: Add integration tests for Angular 10 with Ivy [#1641](https://github.com/ngxs/store/pull/1641) and without Ivy [#1647](https://github.com/ngxs/store/pull/1647)
- Test: Add integration tests for Angular 9 without Ivy [#1649](https://github.com/ngxs/store/pull/1649)
- Build: Upgrade TS to 3.9.5 to ensure that no breaking changes get added [#1626](https://github.com/ngxs/store/pull/1626)
- Build: Compile using Angular 9 [#1596](https://github.com/ngxs/store/pull/1596)

## NGXS-Labs

### Data-plugin v3.0.0 2020-05-05

- Feature: Announced [`@ngxs-labs/data`](https://github.com/ngxs-labs/data/)

# 3.6.2 2020-02-07

- Fix: Handle empty array dispatch edge case [#1521](https://github.com/ngxs/store/pull/1521)
- Fix: Fix regression after upgrade to angular.rc-11 [#1526](https://github.com/ngxs/store/pull/1526)

# 3.6.1 2020-01-15

- Fix: Selectors should not be declaration order sensitive [#1514](https://github.com/ngxs/store/pull/1514)
- Fix: Selectors should be deterministic based on store being used [#1508](https://github.com/ngxs/store/pull/1508)
- Fix: Add support for using State Tokens in sub states [#1509](https://github.com/ngxs/store/pull/1509)
- Fix: Optimize selector runtime binding [#1510](https://github.com/ngxs/store/pull/1510)
- Build: Add router-plugin back to `Ivy` integration test [#1506](https://github.com/ngxs/store/pull/1506)
- Build: Run ngcc synchronously to get `Ivy` build working again [#1497](https://github.com/ngxs/store/pull/1497)

## NGXS-Labs

### Data-plugin v2.0.0 2019-12-16

- Feature: Support NGXS 3.6

#### BREAKING CHANGES

- Compatible only with NGXS 3.6+
- Now `patchState, setState` return `void`
- No longer support options in `NgxsDataPluginModule.forRoot()`
- No longer support `@query` decorator

# 3.6.0 2019-12-11

- Feature: Add `ngxsOnChanges` lifecycle hook [#1389](https://github.com/ngxs/store/pull/1389)
- Feature: Expose `StateContextFactory`, `StateFactory` [#1325](https://github.com/ngxs/store/pull/1325)
- Feature: Improved type safety for children states [#1388](https://github.com/ngxs/store/pull/1388)
- Feature: Improved type safety for `@Select` decorator [#1453](https://github.com/ngxs/store/pull/1453)
- Feature: Add `StateToken<T>` construct [#1436](https://github.com/ngxs/store/pull/1436)
- Feature: Warn about undecorated state class if Ivy is enabled in dev (both JIT/AOT) [#1472](https://github.com/ngxs/store/pull/1472), [#1474](https://github.com/ngxs/store/pull/1474)
- Feature: Storage Plugin - Use state classes as keys [#1380](https://github.com/ngxs/store/pull/1380)
- Feature: Form Plugin - Implement `propertyPath` parameter in the `UpdateFormValue` [#1215](https://github.com/ngxs/store/pull/1215)
- Feature: WebSocket Plugin - Implement `WebSocketConnected` action [#1371](https://github.com/ngxs/store/pull/1371)
- Feature: HMR Plugin - Add `hmrIsReloaded` utility [#1435](https://github.com/ngxs/store/pull/1435)
- Fix: Use generic `ModuleWithProviders` type for Ivy compatiblility [#1469](https://github.com/ngxs/store/pull/1469)
- Fix: Explicit typings for state operators [#1395](https://github.com/ngxs/store/pull/1395), [#1405](https://github.com/ngxs/store/pull/1405)
- Fix: Warn if the zone is not actual "NgZone" [#1270](https://github.com/ngxs/store/pull/1270)
- Fix: Do not re-throw error to the global handler if custom is provided [#1379](https://github.com/ngxs/store/pull/1379)
- Fix: Group `Actions` subscriptions to remove memory leak [#1381](https://github.com/ngxs/store/pull/1381)
- Fix: Upgrade ng-packagr to fix Ivy issues [#1397](https://github.com/ngxs/store/pull/1397)
- Fix: Router Plugin - resolve infinite redirects and browser hanging [#1430](https://github.com/ngxs/store/pull/1430)
- Fix: Router Plugin - build compatibility with Angular 9 (Ivy) [#1459](https://github.com/ngxs/store/pull/1459)
- Fix: Devtools Plugin - remove `NgxsModule` from imports to ensure Ivy compatibility [#1491](https://github.com/ngxs/store/pull/1491)
- Build: Add build integration test with Angular 9 (Ivy) [#1278](https://github.com/ngxs/store/pull/1278)
- Build: Run SSR tests with cypress [#1281](https://github.com/ngxs/store/pull/1281)
- Build: Add E2E tests for the Ivy integration [#1492](https://github.com/ngxs/store/pull/1492)

### BREAKING CHANGES

- If you are using `TypeScript 2.7` and `Angular 5` you will need to update to `TypeScript 2.8.1` and `Angular 6.1.0` at a minimum. We were forced to drop support for these in order to provide support for Ivy. These versions are also no longer supported the Angular team either. This has not resulted in a major version change for NGXS due to the fact that it is not our API that has changed, rather a dependency.

## NGXS-Labs

- Feature: announced [@ngxs-labs/data](https://github.com/ngxs-labs/data)
- Feature: announced [@ngxs-labs/actions-executing](https://github.com/ngxs-labs/actions-executing)
- Feature: announced [@ngxs-labs/attach-action](https://github.com/ngxs-labs/attach-action)

# 3.5.1 2019-08-29

- Fix: Ensure that `@Action()` is not usable with static methods [#1203](https://github.com/ngxs/store/pull/1203)
- Fix: Router Plugin - normalize URL by stripping base href [#1178](https://github.com/ngxs/store/pull/1178)
- Fix: Router Plugin - revert state back after "RouterCancel" is dispatched [#1236](https://github.com/ngxs/store/pull/1236)
- Fix: Router Plugin - "includeHash" must be truthy requesting path [#1265](https://github.com/ngxs/store/pull/1265)
- Fix: HMR Plugin - trigger ngOnDestroy for all components in app tree [#1192](https://github.com/ngxs/store/pull/1192)
- Fix: HMR Plugin - remove `@angularclass/hmr` peer dependency [#1205](https://github.com/ngxs/store/pull/1205)
- Fix: Forms Plugin - reduce `UpdateFormStatus` action dispatching [#1217](https://github.com/ngxs/store/pull/1217)
- Fix: Logger Plugin - print next state even if error was thrown [#1247](https://github.com/ngxs/store/pull/1247)
- Fix: Devtoos Plugin - send action to the dev tools even if error was thrown [#1249](https://github.com/ngxs/store/pull/1249)
- Build: dtslint must use current version of TypeScript [#1182](https://github.com/ngxs/store/pull/1182)
- Build: add bundle size checker for improved infrastructure [#1199](https://github.com/ngxs/store/pull/1199)
- Build: configure typescript-eslint package [#1201](https://github.com/ngxs/store/pull/1201)
- Build: add cypress for E2E testing [#1258](https://github.com/ngxs/store/pull/1258)

## NGXS-Labs

### Dispatch Decorator v2.1.0

- Fix: remove `DispatchAction` and unnecessary closures [#252](https://github.com/ngxs-labs/dispatch-decorator/pull/252)

### Dispatch Decorator v2.0.0

- Build: prepare package for the Angular 8+ compatibility and support NGXS 3.5 [#247](https://github.com/ngxs-labs/dispatch-decorator/pull/247)
- Build: configure `cypress` for SSR and E2E testing [#248](https://github.com/ngxs-labs/dispatch-decorator/pull/248)
- Feat: implement `cancelUncompleted` option [#250](https://github.com/ngxs-labs/dispatch-decorator/pull/250)

### Emitter-plugin v2.0.0

- Feature: Support NGXS 3.5, TypeScript 3.5 [#317](https://github.com/ngxs-labs/emitter/pull/317)
- Fix: change action type to instance property [#316](https://github.com/ngxs-labs/emitter/pull/316)

# 3.5.0 2019-07-22

- Feature: upgrade to support Angular 8 [#1156](https://github.com/ngxs/store/pull/1156)
- Feature: selector option to disable supressing errors [#1015](https://github.com/ngxs/store/pull/1015), [#1087](https://github.com/ngxs/store/pull/1087)
- Feature: expose NgxsModuleOptions as a named type [#1031](https://github.com/ngxs/store/pull/1031)
- Feature: expose SelectorOptions decorator [#1029](https://github.com/ngxs/store/pull/1029), [#1047](https://github.com/ngxs/store/pull/1047)
- Feature: expose StateClass as a named type [#1042](https://github.com/ngxs/store/pull/1042), [#1070](https://github.com/ngxs/store/pull/1070)
- Feature: Router Plugin - add `RouterDataResolved` action [#1059](https://github.com/ngxs/store/pull/1059)
- Feature: WebSocket Plugin - add `WebSocketConnectionUpdated` action [#1094](https://github.com/ngxs/store/pull/1094)
- Performance: replace array `spread` with `slice` [#1066](https://github.com/ngxs/store/pull/1066), [#1071](https://github.com/ngxs/store/pull/1071)
- Fix: Life-cycle events not triggering in root state [#1048](https://github.com/ngxs/store/pull/1048)
- Fix: Logger Plugin - replace `Object.entries` as it breaks IE11 [#931](https://github.com/ngxs/store/pull/931)
- Fix: Router Plugin - trigger navigation on the `QueryParams` change [#924](https://github.com/ngxs/store/pull/924)
- Fix: Router Plugin - redirect to the manually entered route [#920](https://github.com/ngxs/store/pull/920), [#1159](https://github.com/ngxs/store/pull/1159)
- Fix: Router Plugin - add `RouterDataResolved` to the union `RouterAction` type [#1093](https://github.com/ngxs/store/pull/1093)
- Fix: Router Plugin - manual path check should not fail for SSR [#1158](https://github.com/ngxs/store/pull/1158)
- Fix: HMR Plugin - remove old styles after reload [#1001](https://github.com/ngxs/store/pull/1001)
- Fix: HMR Plugin - correct persistence state in runtime [#1048](https://github.com/ngxs/store/pull/1048)
- Fix: HMR Plugin - does not properly restore state [#1139](https://github.com/ngxs/store/pull/1139)
- Fix: Form Plugin - introduce conditional debounce [#1061](https://github.com/ngxs/store/pull/1061)
- Fix: WebSocket Plugin - don't stop `WebSocketSubject` stream after dispatching `WebSocketDisconnected` [#1091](https://github.com/ngxs/store/pull/1091)
- Fix: Storage Plugin - undefined localStorage error during SSR [#1119](https://github.com/ngxs/store/pull/1119)
- Build: CI - decouple build infrastructure from root package.json [#1163](https://github.com/ngxs/store/pull/1163)
- Build: use `jest` internally for testing [#1068](https://github.com/ngxs/store/pull/1068)

## NGXS-Labs

### Select-snapshot v1.0.0

- Feature: announced [select-snapshot](https://github.com/ngxs-labs/select-snapshot)

### Immer-adapter v3.0.0

- Feature: immutable state context decorator
- Feature: immutable selector decorator
- Feature: support immer v3.x
- Deprecated: produce operator

# 3.4.3 2019-03-14

- Feature: Add state defaults to UpdateState [#956](https://github.com/ngxs/store/pull/956)
- Fix: Router Plugin - serialize after Resolvers have run [#895](https://github.com/ngxs/store/pull/895)
- Fix: HMR Plugin - incorrect destruction of modules in hmr [#908](https://github.com/ngxs/store/pull/908)
- Fix: Logger Plugin - print action properties [#879](https://github.com/ngxs/store/pull/879)

# 3.4.2 2019-03-07

- Fix: Expose `ActionType, ActionOptions` interfaces [#873](https://github.com/ngxs/store/pull/873)
- Fix: Router Plugin - add state selector with generic [#894](https://github.com/ngxs/store/pull/894)
- Fix: Initial state should not be overwritten by defaults [#904](https://github.com/ngxs/store/pull/904)

# 3.4.1 2019-03-04

- Fix: createSelector does not allow for function returning a type unioned with `null` or `undefined` [#891](https://github.com/ngxs/store/pull/891)
- Fix: Action is called multiple times when a module is called by multiple routes [#888](https://github.com/ngxs/store/pull/888)
- Fix: Expose `removeItem` operator [#880](https://github.com/ngxs/store/pull/880)

# 3.4.0 2019-02-28

- Feature: Support server-side rendering [#698](https://github.com/ngxs/store/pull/698)
- Feature: Enable state operator extensibility [#635](https://github.com/ngxs/store/pull/635)
- Feature: Add `ofActionCompleted` action handler [#712](https://github.com/ngxs/store/pull/712)
- Feature: Add `Hot Module Replacement` plugin for manage states [#707](https://github.com/ngxs/store/pull/707)
- Feature: Add possible inheritance of state options [#750](https://github.com/ngxs/store/pull/750)
- Feature: Add new lifecycle hook `ngxsAfterBootstrap` [#753](https://github.com/ngxs/store/pull/753)
- Feature: Add ability to change the Execution strategy (decouple from zone.js) [#811](https://github.com/ngxs/store/pull/811)
- Feature: Add state operators: `patch, updateItem, removeItem, insertItem, append, compose, iif` [#799](https://github.com/ngxs/store/pull/799/)
- Feature: WebSocket Plugin - Add `WebSocketDisconnected` action to notify of disconnection [#825](https://github.com/ngxs/store/pull/825)
- Feature: Defining the default state before module initialization [#791](https://github.com/ngxs/store/pull/791/files#diff-fc35f12bac15f5f65bad0f323be7ae12R46)
- Fix: Expose `ActionCompletion` [#752](https://github.com/ngxs/store/pull/752)
- Fix: Throw error when found duplicate state names [#791](https://github.com/ngxs/store/pull/791)
- Fix: Bind static context to the selector function [#818](https://github.com/ngxs/store/pull/818)
- Fix: WebSocket Plugin - `WebsocketMessageError` notifies of errors [#825](https://github.com/ngxs/store/pull/825)
- Performance: improved reading the name of the state from the parameter [#826](https://github.com/ngxs/store/pull/826)
- Fix: Log group not closed on error [#831](https://github.com/ngxs/store/pull/831)
- Fix: Websocket Plugin - server/network error triggered close should dispatch WebSocketDisconnected [#832](https://github.com/ngxs/store/pull/832)
- Fix: Form Plugin - correct state synchronization with dirty flag [#862](https://github.com/ngxs/store/pull/862)
- Fix: Remove typings introduced since 3.3.4 that are incompatible with TS 2.7 [#853](https://github.com/ngxs/store/pull/853)
- Fix: Remove type usages introduced since 3.3.4 that are incompatible with NG 5 & TS 2.7 [#854](https://github.com/ngxs/store/pull/854)

## NGXS-Labs

### Emitter-plugin

- Feature: Add `EmitterService` [#121](https://github.com/ngxs-labs/emitter/pull/121)
- Feature: Add `StoreTestBedModule` for easy unit testing [#109](https://github.com/ngxs-labs/emitter/pull/109)

# 3.3.4 2018-12-20

- Fix: Remove ref to TestBed to reduce bundle size [#725](https://github.com/ngxs/store/pull/725)

# 3.3.3 2018-12-16

- Fix: Silence console hints in tests [#706](https://github.com/ngxs/store/pull/706)

# 3.3.2 2018-12-04

- Fix: Remove compromised dependencies [#684](https://github.com/ngxs/store/pull/684)
- Fix: Add helper for enable development mode [#674](https://github.com/ngxs/store/pull/674)
- Fix: Support underscore in state name [#663](https://github.com/ngxs/store/pull/663)

# 3.3.1 2018-11-24

- Fix: Storage Plugin should handle 'undefined' string [#671](https://github.com/ngxs/store/pull/671)
- Feature: NGXS [Schematics](https://github.com/ngxs/schematics/pull/3)

## NGXS-Labs

- Feature: Announced [immer-adapter](https://github.com/ngxs-labs/immer-adapter)
- Feature: Announced [dispatch-decorator](https://github.com/ngxs-labs/dispatch-decorator)

# 3.3.0 2018-11-19

- Feature: Support Angular 7, TypeScript 3.1 [#615](https://github.com/ngxs/store/issues/615)
  (https://github.com/ngxs/store/issues/543)
- Feature: Add [CLI](https://github.com/ngxs/cli) for generate store [#520](https://github.com/ngxs/store/pull/520)
- Feature: Add strictContentSecurityPolicy compatibility rule [#569](https://github.com/ngxs/store/pull/569)
- Feature: Devtools plugin support for 'IMPORT_STATE' [#507](https://github.com/ngxs/store/pull/507)
- Feature: Form plugin - path to state can contain array [#587](https://github.com/ngxs/store/pull/587)
- Fix: Form plugin to accept form arrays [#659](https://github.com/ngxs/store/pull/659)
- Fix: Show warning when we usage development mode in production [#627](https://github.com/ngxs/store/pull/627)
- Fix: Storage Plugin should handle undefined [#538](https://github.com/ngxs/store/pull/538)
- Fix: Expose ofActionCanceled function [#531](https://github.com/ngxs/store/pull/531)
- Fix: Expose Websocket Plugin WebsocketMessageError action [#504](https://github.com/ngxs/store/pull/504)

## NGXS-Labs

- Feature: [Emitter](https://github.com/ngxs-labs/emitter) plugin (allows you to get rid of actions) [#543]
- Feature: Announced [NGXS Labs](https://ngxs.gitbook.io/ngxs/ngxs-labs/intro)

# 3.2.0 2018-07-15

- Feature: createSelector functions [#484](https://github.com/ngxs/store/pull/484)
- Fix: Expose RouterStateModel interface [#445](https://github.com/ngxs/store/pull/445)
- Fix: State not set correctly when duplicate key in path [#459](https://github.com/ngxs/store/pull/459)
- Fix: Action stream should return in Angular zone [#456](https://github.com/ngxs/store/pull/456)

# 3.1.4 2018-06-13

- Fix: Remove component reference from router plugin state [#441](https://github.com/ngxs/store/pull/441)
- Fix: Fix subscription firing twice [#436](https://github.com/ngxs/store/pull/436)

# 3.1.3 2018-04-06

- Fix: Subscribe running outside of zone [#422](https://github.com/ngxs/store/pull/422)
- Fix: Logger not using custom options [#420](https://github.com/ngxs/store/pull/420)

# 3.1.2 2018-04-06

- Fix: Freeze conflicting issues with router

# 3.1.1 2018-04-06

- Fix: Freeze depedencies

# 3.1.0 2018-03-06

- Feature: Add development mode with freeze on state and actions [#409](https://github.com/ngxs/store/pull/409)
- Feature: Storage engine migrations [#401](https://github.com/ngxs/store/pull/401)
- Feature: Select combinations [#51](https://github.com/ngxs/store/pull/51)
- Feature: Snapshot select can use state class now [#398](https://github.com/ngxs/store/pull/398)
- Feature: Meta selectors [#386](https://github.com/ngxs/store/pull/386)
- Feature: Add ability to reset state
- Performance: Run actions outside of zones [#383](https://github.com/ngxs/store/pull/383)
- Fix: Dispatcher error propogation [#376](https://github.com/ngxs/store/pull/376)
- Fix: Add patchState restriction errors [#371](https://github.com/ngxs/store/pull/371)
- Fix: Remove error when loading same state multiple times [#390](https://github.com/ngxs/store/pull/390)
- Fix: Force route navigation to run in zones [#393](https://github.com/ngxs/store/pull/393)
- Fix: Selector function should still be usable as a function [#398](https://github.com/ngxs/store/pull/398)
- Fix: Memoize inner selector function [#410](https://github.com/ngxs/store/pull/410)

# 3.0.0/3.0.1 2018-05-04

- Chore: Upgrade to official Angular

# 3.0.0-rc.4 2018-05-02

- BREAKING: Rename completed to successful [#349](https://github.com/ngxs/store/pull/349)
- Feature: Add ability to disable logger [#350](https://github.com/ngxs/store/pull/350)
- Fix: Fix options not passed correctly to logger plugin [#350](https://github.com/ngxs/store/pull/350)
- Fix: Patch state mutating the original state [#348](https://github.com/ngxs/store/pull/348)
- Fix: Router plugin not working in prod [#351](https://github.com/ngxs/store/pull/351)

# 3.0.0-rc.3 2018-05-01

- BREAKING: Update websocket connect to recieve options object [#341](https://github.com/ngxs/store/pull/341)
- Feature: Consolidate action stream to single-source-of-truth [#324](https://github.com/ngxs/store/pull/324)
- Fix: Remove reconnection from websocket because of issues [#341](https://github.com/ngxs/store/pull/341)
- Fix: Enums causing prod build errors [#345](https://github.com/ngxs/store/pull/345)
- Fix: Router race case when using prod [#345](https://github.com/ngxs/store/pull/345)

# 3.0.0-rc.2 2018-04-27

- Fix: Form update fix [#335](https://github.com/ngxs/store/pull/335)
- Chore: Upgrade RxJS to official [#332](https://github.com/ngxs/store/pull/332)

# 3.0.0-rc.1 2018-04-12

- Fix: Rename `ofActionComplete` to `ofActionCompleted`
- Fix: Expose `ofActionErrored`
- Fix: Form Plugin Recursive Error

# 3.0.0-rc.0 2018-04-10

- Fix: Observable dispatch issues [#235](https://github.com/ngxs/store/pull/235)
- Fix: Websocket error when socket undefined
- Fix: Devtools not disabling
- Fix: Action Stream has too much exposed
- Chore: Loosen ng deps
- Chore: Upgrade to ng6/rx6

### BREAKING

- feat(store): create action stream that shows the action lifecycle [#255](https://github.com/ngxs/store/pull/255)

To keep the same behavior switch from the ofAction operator to the `ofActionDispatched` operator

# 3.0.0-beta.0 2018-04-05

- BREAKING: Types are now required on actions
- Feature: Devtools can emit actions manually now
- Feature: Better integration w/ RX6
- Fix: Various websocket fixes
- Fix: Fixes for `ofAction`
- Chore: Rename Beta Feature `takeLast` to `cancelUncompleted`

# 2.1.0-beta.9 2018-04-04

- Fix: Websocket and form errors caused by [#212](https://github.com/ngxs/store/pull/212)

# 2.1.0-beta.8 2018-04-04

- Fix: Minification issues [#212](https://github.com/ngxs/store/pull/212)

# 2.1.0-beta.7 2018-04-03

- Fix: Websocket plugin sending dupe objects

# 2.1.0-beta.6 2018-04-03

- Fix: Action types on objects not matching correctly

# 2.1.0-beta.5 2018-04-03

- Fix: Revert #206
- Fix: Websocket send message correctly

# 2.1.0-beta.4 2018-04-03

- Feature: Added `snapshot` method to store to get raw value
- Fix: Return `T` from `selectSnapshot`
- Fix: Minification issues [#206](https://github.com/ngxs/store/pull/206)
- Fix: Websockets not emitting correctly

# 2.1.0-beta.3 2018-04-03

- Fix: Revert devtools trigger, due to circular

# 2.1.0-beta.2 2018-04-02

- Feature: Devtools can now trigger actions adhoc
- Fix: Websocket optional typekey

# 2.1.0-beta.1 2018-04-02

- Fix: Websocket pass options as partial

# 2.1.0-beta.0 2018-04-02

- Feature: Lifecycle events
- Feature: Forms plugin
- Fature: takeLast on actions
- Feature: Websocket plugin
- Feature: Snapshot selects

# 2.0.0 2018-03-27

First off, 2.0 is a huge change. I want to appologize to everyone about that but
given all the community feedback and ideas, I really wanted to get these ideas in
before it was too late and we were stuck on a API. I can promise that there will
not be this big of a breaking change after this release in the future without
first deprecation periods.

- Fix: Prevent null exceptions when accessing state before loaded
- Fix: Move action stream to subject
- Fix: Ensure metadata exists for a Selector [#181](https://github.com/ngxs/store/pull/181)

# 2.0.0-rc.24 2018-03-26

- Feature: Expose Init and Update Actions
- Fix: Devtools showing duplicate entries
- Fix: Storage plugin not populating for lazy loaded states

# 2.0.0-rc.23 2018-03-26

- Fix: Subscriptions firing twice

# 2.0.0-rc.22 2018-03-26

- BREAKING: Storage plugin fixes [#154](https://github.com/ngxs/store/pull/154)
- Fix: AoT Regression in Storage Plugin

# 2.0.0-rc.21 2018-03-25

- BREAKING: Plugins are now their own packages
- Fix: Subscribe firing multiple times
- Fix: Devtools only passing type and payload

# 2.0.0-rc.20 2018-03-23

- BREAKING: We moved the npm package from `ngxs` to `@ngxs/store`!
- Fix: devtools not sending payload [#132](https://github.com/ngxs/store/pull/132)
- Fix: better if condition for localstorage

# 2.0.0-rc.19 2018-03-23

- Feature: add overloading to select method in Store [#130](https://github.com/ngxs/store/pull/130)
- Fix: add empty options object, to prevent errors [#131](https://github.com/ngxs/store/pull/131)
- Fix: feature-module bugs [#135](https://github.com/ngxs/store/pull/135)

# 2.0.0-rc.18 2018-03-20

- Fix: Types on devtools

# 2.0.0-rc.17 2018-03-20

- Feature: Extend devtool options
- Feature: Jump to Action and Jump to State in Dev Tools

# 2.0.0-rc.16 2018-03-20

- Fix: Action stream not getting passed correct args, causing error in FF

# 2.0.0-rc.15 2018-03-20

- Fix: Lazy load issue introduced by [#126](https://github.com/ngxs/store/pull/126)

# 2.0.0-rc.14 2018-03-20

- Feature: NgxsLoggerPlugin log action payload if present
- Fix: Issues with feature states [#126](https://github.com/ngxs/store/pull/126)

# 2.0.0-rc.13 2018-03-20

- Feature: State can listen to action multiple times

# 2.0.0-rc.12 2018-03-20

- Fix: Dev tools showing wrong state

# 2.0.0-rc.11 2018-03-20

- BREAKING: Remove string selects, they re not type safe and bad idea
- Feature: Extend `store.select` to support class selectors
- Feature: Expose state stream for users to subscribe to
- Fix: Fix Subscribe dispatching twice #104

# 2.0.0-rc.10 2018-03-19

- BREAKING: Rename `EventStream` to `Actions`
- BREAKING: Rename plugins to have NGXS Prefix

# 2.0.0-rc.9 2018-03-18

- Feature: Memoized Selectors
- Fix: Default to empty object if no default passed

# 2.0.0-rc.8 2018-03-18

- Fix: Patch value not updating state

# 2.0.0-rc.7 2018-03-18

- Fix: Patch value patching wrong path

# 2.0.0-rc.6 2018-03-18

- Fix: topological sort
- Fix: defaults not working correctly if plain boolean/string/number

# 2.0.0-rc.5 2018-03-18

- Fix: patchState typings

# 2.0.0-rc.4 2018-03-18

- Fix: patchState typings

# 2.0.0-rc.3 2018-03-18

- Fix: Add typings for patchState

# 2.0.0-rc.2 2018-03-18

- Feature: Add `patchValue` to make updating state easier

# 2.0.0-rc.1 2018-03-18

## Bug Fixes

- Fix: Action `state` arguments cached when destructured, switch to `getState()`
- Fix: Class selectors not working with sub stores
- Fix: missing dispatch on state context interface

# 2.0.0-rc.0 2018-03-17

- Breaking: `@Store()` decorator is now `@State()`
- Breaking: `Ngxs` service is now `Store`
- Breaking: Stores should be now renamed to State. Before: `ZooStore` should be `ZooState`
- Breaking: `@Mutation` is gone in favor of just `@Action`
- Breaking: Action's first argument is state context object, `{ state, setState }`
- Breaking: You use `setState` to set the state now rather than returning it in actions
- Breaking: Events are now just called Actions
- Breaking: `ofEvent` is now called `ofAction`
- Breaking: Plugins `next` fn now returns an observable
- Breaking: Local Storage plugins removed Strategy in favor of passing your own engine
- Feature: Simplified APIs by removing Mutations, decreased boilerplate
- Feature: Added sub state capability
- Feature: Add `store.selectOnce()` shortcut function
- Feature: Better tpyings
- Feature: Add `dispatch` function in state context for easier dispatching
- Fix: `dispatch().subscribe()` now works correctly
- Fix: Promises now resolve correctly

# 1.5.3 2018-02-12

- Fix: Promises not emitting results

# 1.5.2 2018-02-12

- Fix: Devtools plugin not returning correct value

# 1.5.1 2018-02-11

- Feature: Add `sessionStorage` strategy to local storage plugin

# 1.5.0 2018-02-11

- Feature: Updated Plugin System
- Feature: Add generics to store
- Feature: Implement global error handling
- Fix: Improve DI for lazy loadedd stores
- Fix: Fix dev tools showing previous state
- Chore: Remove redux dev tools by default

# 1.4.8 2018-02-05

- Fix: Typo in return

# 1.4.7 2018-02-05

- Fix: Catch multiple stores being init'd
- Fix: Clone defaults to prevent mutations

# 1.4.6 2018-02-04

- Fix: Plugin injector errors

# 1.4.5 2018-02-04

- Fix: Store injector errors
- Fix: Empty local storage throwing null error

# 1.4.4 2018-02-04

- Fix: Stores injector errors

# 1.4.3 2018-02-04

- Fix: Stores init'd twice

# 1.4.2 2018-02-04

- Fix: Feature stores throwing errors

# 1.4.1 2018-02-04

- Fix: Misc type improvement
- Fix: `forRoot` plugins not working properly
- Fix: LocalStorage plugin name spelling

# 1.4.0 2018-02-03

- Feature: Composition

# 1.3.0 2018-02-03

- Feature: Localstore plugin
- Fix: Better dev tools init

# 1.2.1 2018-02-03

- Fix: Dev tools init
- Fix: Plugins not recieving proper context
- Fix: Allow multiple forFeature

# 1.2.0 2018-02-03

- Feature: Dev Tools Integration
- Chore: Tests!
- Fix: Better builds

# 1.1.0 2018-02-03

- Fix: Export plugin interface

# 1.1.0 2018-02-03

- Feature: Plugins improvements
- Feature: Init event
- Feature: Logger plugin

# 1.0.4 2018-02-02

- Inital release!
