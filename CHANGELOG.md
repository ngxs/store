# [DEV version](https://www.npmjs.com/package/@ngxs/store/v/dev) 
### To become [3.6.0](https://github.com/ngxs/store/milestone/9)

```bash
$ npm install @ngxs/store@dev
``` 
 
* Feature: expose StateContextFactory, StateFactory [#1325](https://github.com/ngxs/store/pull/1325)
* Feature: implement `propertyPath` parameter in the `UpdateFormValue` [1215](https://github.com/ngxs/store/pull/1215)
* Fix: Warn if the zone is not actual "NgZone" [#1270](https://github.com/ngxs/store/pull/1270)
* Build: add build integration test with Angular 9 (Ivy) [#1278](https://github.com/ngxs/store/pull/1278)
* Build: run SSR tests with cypress [#1281](https://github.com/ngxs/store/pull/1281)

## NGXS-Labs

* Feature: announced [@ngxs-labs/data](https://github.com/ngxs-labs/data)

# 3.5.1 2019-08-29

* Fix: Ensure that `@Action()` is not usable with static methods [#1203](https://github.com/ngxs/store/pull/1203)
* Fix: Router Plugin - normalize URL by stripping base href [#1178](https://github.com/ngxs/store/pull/1178)
* Fix: Router Plugin - revert state back after "RouterCancel" is dispatched [#1236](https://github.com/ngxs/store/pull/1236)
* Fix: Router Plugin - "includeHash" must be truthy requesting path [#1265](https://github.com/ngxs/store/pull/1265)
* Fix: HMR Plugin - trigger ngOnDestroy for all components in app tree [#1192](https://github.com/ngxs/store/pull/1192)
* Fix: HMR Plugin - remove `@angularclass/hmr` peer dependency [#1205](https://github.com/ngxs/store/pull/1205)
* Fix: Forms Plugin - reduce `UpdateFormStatus` action dispatching [#1217](https://github.com/ngxs/store/pull/1217)
* Fix: Logger Plugin - print next state even if error was thrown [#1247](https://github.com/ngxs/store/pull/1247)
* Fix: Devtoos Plugin - send action to the dev tools even if error was thrown [#1249](https://github.com/ngxs/store/pull/1249)
* Build: dtslint must use current version of TypeScript [#1182](https://github.com/ngxs/store/pull/1182)
* Build: add bundle size checker for improved infrastructure [#1199](https://github.com/ngxs/store/pull/1199)
* Build: configure typescript-eslint package [#1201](https://github.com/ngxs/store/pull/1201)
* Build: add cypress for E2E testing [#1258](https://github.com/ngxs/store/pull/1258)

## NGXS-Labs

### Dispatch Decorator v2.1.0
* Fix: remove `DispatchAction` and unnecessary closures [#252](https://github.com/ngxs-labs/dispatch-decorator/pull/252)

### Dispatch Decorator v2.0.0

* Build: prepare package for the Angular 8+ compatibility and support NGXS 3.5 [#247](https://github.com/ngxs-labs/dispatch-decorator/pull/247)
* Build: configure `cypress` for SSR and E2E testing [#248](https://github.com/ngxs-labs/dispatch-decorator/pull/248)
* Feat: implement `cancelUncompleted` option [#250](https://github.com/ngxs-labs/dispatch-decorator/pull/250)

### Emitter-plugin v2.0.0

* Feature: Support NGXS 3.5, TypeScript 3.5 [#317](https://github.com/ngxs-labs/emitter/pull/317)
* Fix: change action type to instance property [#316](https://github.com/ngxs-labs/emitter/pull/316)

# 3.5.0 2019-07-22

* Feature: upgrade to support Angular 8 [#1156](https://github.com/ngxs/store/pull/1156)
* Feature: selector option to disable supressing errors [#1015](https://github.com/ngxs/store/pull/1015), [#1087](https://github.com/ngxs/store/pull/1087)
* Feature: expose NgxsModuleOptions as a named type [#1031](https://github.com/ngxs/store/pull/1031)
* Feature: expose SelectorOptions decorator [#1029](https://github.com/ngxs/store/pull/1029), [#1047](https://github.com/ngxs/store/pull/1047)
* Feature: expose StateClass as a named type [#1042](https://github.com/ngxs/store/pull/1042), [#1070](https://github.com/ngxs/store/pull/1070)
* Feature: Router Plugin - add `RouterDataResolved` action [#1059](https://github.com/ngxs/store/pull/1059)
* Feature: WebSocket Plugin - add `WebSocketConnectionUpdated` action [#1094](https://github.com/ngxs/store/pull/1094)
* Performance: replace array `spread` with `slice` [#1066](https://github.com/ngxs/store/pull/1066), [#1071](https://github.com/ngxs/store/pull/1071)
* Fix: Life-cycle events not triggering in root state [#1048](https://github.com/ngxs/store/pull/1048)
* Fix: Logger Plugin - replace `Object.entries` as it breaks IE11 [#931](https://github.com/ngxs/store/pull/931)
* Fix: Router Plugin - trigger navigation on the `QueryParams` change [#924](https://github.com/ngxs/store/pull/924)
* Fix: Router Plugin - redirect to the manually entered route [#920](https://github.com/ngxs/store/pull/920), [#1159](https://github.com/ngxs/store/pull/1159)
* Fix: Router Plugin - add `RouterDataResolved` to the union `RouterAction` type [#1093](https://github.com/ngxs/store/pull/1093)
* Fix: Router Plugin - manual path check should not fail for SSR [#1158](https://github.com/ngxs/store/pull/1158)
* Fix: HMR Plugin - remove old styles after reload [#1001](https://github.com/ngxs/store/pull/1001)
* Fix: HMR Plugin - correct persistence state in runtime [#1048](https://github.com/ngxs/store/pull/1048)
* Fix: HMR Plugin - does not properly restore state [#1139](https://github.com/ngxs/store/pull/1139)
* Fix: Form Plugin - introduce conditional debounce [#1061](https://github.com/ngxs/store/pull/1061)
* Fix: WebSocket Plugin - don't stop `WebSocketSubject` stream after dispatching `WebSocketDisconnected` [#1091](https://github.com/ngxs/store/pull/1091)
* Fix: Storage Plugin - undefined localStorage error during SSR [#1119](https://github.com/ngxs/store/pull/1119)
* Build: CI - decouple build infrastructure from root package.json [#1163](https://github.com/ngxs/store/pull/1163)
* Build: use `jest` internally for testing [#1068](https://github.com/ngxs/store/pull/1068)

## NGXS-Labs

### Select-snapshot v1.0.0

* Feature: announced [select-snapshot](https://github.com/ngxs-labs/select-snapshot)

### Immer-adapter v3.0.0

* Feature: immutable state context decorator
* Feature: immutable selector decorator
* Feature: support immer v3.x
* Deprecated: produce operator

# 3.4.3 2019-03-14
* Feature: Add state defaults to UpdateState [#956](https://github.com/ngxs/store/pull/956)
* Fix: Router Plugin - serialize after Resolvers have run [#895](https://github.com/ngxs/store/pull/895)
* Fix: HMR Plugin - incorrect destruction of modules in hmr [#908](https://github.com/ngxs/store/pull/908)
* Fix: Logger Plugin - print action properties [#879](https://github.com/ngxs/store/pull/879)

# 3.4.2 2019-03-07
* Fix: Expose `ActionType, ActionOptions` interfaces [#873](https://github.com/ngxs/store/pull/873)
* Fix: Router Plugin - add state selector with generic [#894](https://github.com/ngxs/store/pull/894)
* Fix: Initial state should not be overwritten by defaults [#904](https://github.com/ngxs/store/pull/904)

# 3.4.1 2019-03-04
* Fix: createSelector does not allow for function returning a type unioned with `null` or `undefined` [#891](https://github.com/ngxs/store/pull/891)
* Fix: Action is called multiple times when a module is called by multiple routes [#888](https://github.com/ngxs/store/pull/888)
* Fix: Expose `removeItem` operator [#880](https://github.com/ngxs/store/pull/880)

# 3.4.0 2019-02-28
* Feature: Support server-side rendering [#698](https://github.com/ngxs/store/pull/698)
* Feature: Enable state operator extensibility [#635](https://github.com/ngxs/store/pull/635)
* Feature: Add `ofActionCompleted` action handler [#712](https://github.com/ngxs/store/pull/712)
* Feature: Add `Hot Module Replacement` plugin for manage states [#707](https://github.com/ngxs/store/pull/707)
* Feature: Add possible inheritance of state options [#750](https://github.com/ngxs/store/pull/750)
* Feature: Add new lifecycle hook `ngxsAfterBootstrap` [#753](https://github.com/ngxs/store/pull/753)
* Feature: Add ability to change the Execution strategy (decouple from zone.js) [#811](https://github.com/ngxs/store/pull/811)
* Feature: Add state operators: `patch, updateItem, removeItem, insertItem, append, compose, iif` [#799](https://github.com/ngxs/store/pull/799/)
* Feature: WebSocket Plugin - Add `WebSocketDisconnected` action to notify of disconnection [#825](https://github.com/ngxs/store/pull/825)
* Feature: Defining the default state before module initialization [#791](https://github.com/ngxs/store/pull/791/files#diff-fc35f12bac15f5f65bad0f323be7ae12R46)
* Fix: Expose `ActionCompletion` [#752](https://github.com/ngxs/store/pull/752)
* Fix: Throw error when found duplicate state names [#791](https://github.com/ngxs/store/pull/791)
* Fix: Bind static context to the selector function [#818](https://github.com/ngxs/store/pull/818)
* Fix: WebSocket Plugin - `WebsocketMessageError` notifies of errors [#825](https://github.com/ngxs/store/pull/825)
* Performance: improved reading the name of the state from the parameter [#826](https://github.com/ngxs/store/pull/826)
* Fix: Log group not closed on error [#831](https://github.com/ngxs/store/pull/831)
* Fix: Websocket Plugin - server/network error triggered close should dispatch WebSocketDisconnected [#832](https://github.com/ngxs/store/pull/832)
* Fix: Form Plugin - correct state synchronization with dirty flag [#862](https://github.com/ngxs/store/pull/862)
* Fix: Remove typings introduced since 3.3.4 that are incompatible with TS 2.7 [#853](https://github.com/ngxs/store/pull/853)
* Fix: Remove type usages introduced since 3.3.4 that are incompatible with NG 5 & TS 2.7 [#854](https://github.com/ngxs/store/pull/854)

## NGXS-Labs

### Emitter-plugin

* Feature: Add `EmitterService` [#121](https://github.com/ngxs-labs/emitter/pull/121)
* Feature: Add `StoreTestBedModule` for easy unit testing [#109](https://github.com/ngxs-labs/emitter/pull/109)

# 3.3.4 2018-12-20
* Fix: Remove ref to TestBed to reduce bundle size [#725](https://github.com/ngxs/store/pull/725)

# 3.3.3 2018-12-16
* Fix: Silence console hints in tests [#706](https://github.com/ngxs/store/pull/706)

# 3.3.2 2018-12-04
* Fix: Remove compromised dependencies [#684](https://github.com/ngxs/store/pull/684)
* Fix: Add helper for enable development mode [#674](https://github.com/ngxs/store/pull/674)
* Fix: Support underscore in state name [#663](https://github.com/ngxs/store/pull/663)

# 3.3.1 2018-11-24
* Fix: Storage Plugin should handle 'undefined' string [#671](https://github.com/ngxs/store/pull/671)
* Feature: NGXS [Schematics](https://github.com/ngxs/schematics/pull/3)

## NGXS-Labs

* Feature: Announced [immer-adapter](https://github.com/ngxs-labs/immer-adapter)
* Feature: Announced [dispatch-decorator](https://github.com/ngxs-labs/dispatch-decorator)

# 3.3.0 2018-11-19

* Feature: Support Angular 7, TypeScript 3.1 [#615](https://github.com/ngxs/store/issues/615)
(https://github.com/ngxs/store/issues/543)
* Feature: Add [CLI](https://github.com/ngxs/cli) for generate store [#520](https://github.com/ngxs/store/pull/520)
* Feature: Add strictContentSecurityPolicy compatibility rule [#569](https://github.com/ngxs/store/pull/569)
* Feature: Devtools plugin support for 'IMPORT_STATE' [#507](https://github.com/ngxs/store/pull/507)
* Feature: Form plugin - path to state can contain array [#587](https://github.com/ngxs/store/pull/587)
* Fix: Form plugin to accept form arrays [#659](https://github.com/ngxs/store/pull/659)
* Fix: Show warning when we usage development mode in production [#627](https://github.com/ngxs/store/pull/627)
* Fix: Storage Plugin should handle undefined [#538](https://github.com/ngxs/store/pull/538)
* Fix: Expose ofActionCanceled function [#531](https://github.com/ngxs/store/pull/531)
* Fix: Expose Websocket Plugin WebsocketMessageError action [#504](https://github.com/ngxs/store/pull/504)

## NGXS-Labs

* Feature: [Emitter](https://github.com/ngxs-labs/emitter) plugin (allows you to get rid of actions) [#543]
* Feature: Announced [NGXS Labs](https://ngxs.gitbook.io/ngxs/ngxs-labs/intro)

# 3.2.0 2018-07-15

* Feature: createSelector functions [#484](https://github.com/ngxs/store/pull/484)
* Fix: Expose RouterStateModel interface [#445](https://github.com/ngxs/store/pull/445)
* Fix: State not set correctly when duplicate key in path [#459](https://github.com/ngxs/store/pull/459)
* Fix: Action stream should return in Angular zone [#456](https://github.com/ngxs/store/pull/456)

# 3.1.4 2018-06-13

* Fix: Remove component reference from router plugin state [#441](https://github.com/ngxs/store/pull/441)
* Fix: Fix subscription firing twice [#436](https://github.com/ngxs/store/pull/436)

# 3.1.3 2018-04-06

* Fix: Subscribe running outside of zone [#422](https://github.com/ngxs/store/pull/422)
* Fix: Logger not using custom options [#420](https://github.com/ngxs/store/pull/420)

# 3.1.2 2018-04-06

* Fix: Freeze conflicting issues with router

# 3.1.1 2018-04-06

* Fix: Freeze depedencies

# 3.1.0 2018-03-06

* Feature: Add development mode with freeze on state and actions [#409](https://github.com/ngxs/store/pull/409)
* Feature: Storage engine migrations [#401](https://github.com/ngxs/store/pull/401)
* Feature: Select combinations [#51](https://github.com/ngxs/store/pull/51)
* Feature: Snapshot select can use state class now [#398](https://github.com/ngxs/store/pull/398)
* Feature: Meta selectors [#386](https://github.com/ngxs/store/pull/386)
* Feature: Add ability to reset state
* Performance: Run actions outside of zones [#383](https://github.com/ngxs/store/pull/383)
* Fix: Dispatcher error propogation [#376](https://github.com/ngxs/store/pull/376)
* Fix: Add patchState restriction errors [#371](https://github.com/ngxs/store/pull/371)
* Fix: Remove error when loading same state multiple times [#390](https://github.com/ngxs/store/pull/390)
* Fix: Force route navigation to run in zones [#393](https://github.com/ngxs/store/pull/393)
* Fix: Selector function should still be usable as a function [#398](https://github.com/ngxs/store/pull/398)
* Fix: Memoize inner selector function [#410](https://github.com/ngxs/store/pull/410)

# 3.0.0/3.0.1 2018-05-04

* Chore: Upgrade to official Angular

# 3.0.0-rc.4 2018-05-02

* BREAKING: Rename completed to successful [#349](https://github.com/ngxs/store/pull/349)
* Feature: Add ability to disable logger [#350](https://github.com/ngxs/store/pull/350)
* Fix: Fix options not passed correctly to logger plugin [#350](https://github.com/ngxs/store/pull/350)
* Fix: Patch state mutating the original state [#348](https://github.com/ngxs/store/pull/348)
* Fix: Router plugin not working in prod [#351](https://github.com/ngxs/store/pull/351)

# 3.0.0-rc.3 2018-05-01

* BREAKING: Update websocket connect to recieve options object [#341](https://github.com/ngxs/store/pull/341)
* Feature: Consolidate action stream to single-source-of-truth [#324](https://github.com/ngxs/store/pull/324)
* Fix: Remove reconnection from websocket because of issues [#341](https://github.com/ngxs/store/pull/341)
* Fix: Enums causing prod build errors [#345](https://github.com/ngxs/store/pull/345)
* Fix: Router race case when using prod [#345](https://github.com/ngxs/store/pull/345)

# 3.0.0-rc.2 2018-04-27

* Fix: Form update fix [#335](https://github.com/ngxs/store/pull/335)
* Chore: Upgrade RxJS to official [#332](https://github.com/ngxs/store/pull/332)

# 3.0.0-rc.1 2018-04-12

* Fix: Rename `ofActionComplete` to `ofActionCompleted`
* Fix: Expose `ofActionErrored`
* Fix: Form Plugin Recursive Error

# 3.0.0-rc.0 2018-04-10

* Fix: Observable dispatch issues [#235](https://github.com/ngxs/store/pull/235)
* Fix: Websocket error when socket undefined
* Fix: Devtools not disabling
* Fix: Action Stream has too much exposed
* Chore: Loosen ng deps
* Chore: Upgrade to ng6/rx6

### BREAKING

* feat(store): create action stream that shows the action lifecycle [#255](https://github.com/ngxs/store/pull/255)

To keep the same behavior switch from the ofAction operator to the `ofActionDispatched` operator

# 3.0.0-beta.0 2018-04-05

* BREAKING: Types are now required on actions
* Feature: Devtools can emit actions manually now
* Feature: Better integration w/ RX6
* Fix: Various websocket fixes
* Fix: Fixes for `ofAction`
* Chore: Rename Beta Feature `takeLast` to `cancelUncompleted`

# 2.1.0-beta.9 2018-04-04

* Fix: Websocket and form errors caused by [#212](https://github.com/ngxs/store/pull/212)

# 2.1.0-beta.8 2018-04-04

* Fix: Minification issues [#212](https://github.com/ngxs/store/pull/212)

# 2.1.0-beta.7 2018-04-03

* Fix: Websocket plugin sending dupe objects

# 2.1.0-beta.6 2018-04-03

* Fix: Action types on objects not matching correctly

# 2.1.0-beta.5 2018-04-03

* Fix: Revert #206
* Fix: Websocket send message correctly

# 2.1.0-beta.4 2018-04-03

* Feature: Added `snapshot` method to store to get raw value
* Fix: Return `T` from `selectSnapshot`
* Fix: Minification issues [#206](https://github.com/ngxs/store/pull/206)
* Fix: Websockets not emitting correctly

# 2.1.0-beta.3 2018-04-03

* Fix: Revert devtools trigger, due to circular

# 2.1.0-beta.2 2018-04-02

* Feature: Devtools can now trigger actions adhoc
* Fix: Websocket optional typekey

# 2.1.0-beta.1 2018-04-02

* Fix: Websocket pass options as partial

# 2.1.0-beta.0 2018-04-02

* Feature: Lifecycle events
* Feature: Forms plugin
* Fature: takeLast on actions
* Feature: Websocket plugin
* Feature: Snapshot selects

# 2.0.0 2018-03-27

First off, 2.0 is a huge change. I want to appologize to everyone about that but
given all the community feedback and ideas, I really wanted to get these ideas in
before it was too late and we were stuck on a API. I can promise that there will
not be this big of a breaking change after this release in the future without
first deprecation periods.

* Fix: Prevent null exceptions when accessing state before loaded
* Fix: Move action stream to subject
* Fix: Ensure metadata exists for a Selector [#181](https://github.com/ngxs/store/pull/181)

# 2.0.0-rc.24 2018-03-26

* Feature: Expose Init and Update Actions
* Fix: Devtools showing duplicate entries
* Fix: Storage plugin not populating for lazy loaded states

# 2.0.0-rc.23 2018-03-26

* Fix: Subscriptions firing twice

# 2.0.0-rc.22 2018-03-26

* BREAKING: Storage plugin fixes [#154](https://github.com/ngxs/store/pull/154)
* Fix: AoT Regression in Storage Plugin

# 2.0.0-rc.21 2018-03-25

* BREAKING: Plugins are now their own packages
* Fix: Subscribe firing multiple times
* Fix: Devtools only passing type and payload

# 2.0.0-rc.20 2018-03-23

* BREAKING: We moved the npm package from `ngxs` to `@ngxs/store`!
* Fix: devtools not sending payload [#132](https://github.com/ngxs/store/pull/132)
* Fix: better if condition for localstorage

# 2.0.0-rc.19 2018-03-23

* Feature: add overloading to select method in Store [#130](https://github.com/ngxs/store/pull/130)
* Fix: add empty options object, to prevent errors [#131](https://github.com/ngxs/store/pull/131)
* Fix: feature-module bugs [#135](https://github.com/ngxs/store/pull/135)

# 2.0.0-rc.18 2018-03-20

* Fix: Types on devtools

# 2.0.0-rc.17 2018-03-20

* Feature: Extend devtool options
* Feature: Jump to Action and Jump to State in Dev Tools

# 2.0.0-rc.16 2018-03-20

* Fix: Action stream not getting passed correct args, causing error in FF

# 2.0.0-rc.15 2018-03-20

* Fix: Lazy load issue introduced by [#126](https://github.com/ngxs/store/pull/126)

# 2.0.0-rc.14 2018-03-20

* Feature: NgxsLoggerPlugin log action payload if present
* Fix: Issues with feature states [#126](https://github.com/ngxs/store/pull/126)

# 2.0.0-rc.13 2018-03-20

* Feature: State can listen to action multiple times

# 2.0.0-rc.12 2018-03-20

* Fix: Dev tools showing wrong state

# 2.0.0-rc.11 2018-03-20

* BREAKING: Remove string selects, they re not type safe and bad idea
* Feature: Extend `store.select` to support class selectors
* Feature: Expose state stream for users to subscribe to
* Fix: Fix Subscribe dispatching twice #104

# 2.0.0-rc.10 2018-03-19

* BREAKING: Rename `EventStream` to `Actions`
* BREAKING: Rename plugins to have NGXS Prefix

# 2.0.0-rc.9 2018-03-18

* Feature: Memoized Selectors
* Fix: Default to empty object if no default passed

# 2.0.0-rc.8 2018-03-18

* Fix: Patch value not updating state

# 2.0.0-rc.7 2018-03-18

* Fix: Patch value patching wrong path

# 2.0.0-rc.6 2018-03-18

* Fix: topological sort
* Fix: defaults not working correctly if plain boolean/string/number

# 2.0.0-rc.5 2018-03-18

* Fix: patchState typings

# 2.0.0-rc.4 2018-03-18

* Fix: patchState typings

# 2.0.0-rc.3 2018-03-18

* Fix: Add typings for patchState

# 2.0.0-rc.2 2018-03-18

* Feature: Add `patchValue` to make updating state easier

# 2.0.0-rc.1 2018-03-18

## Bug Fixes

* Fix: Action `state` arguments cached when destructured, switch to `getState()`
* Fix: Class selectors not working with sub stores
* Fix: missing dispatch on state context interface

# 2.0.0-rc.0 2018-03-17

* Breaking: `@Store()` decorator is now `@State()`
* Breaking: `Ngxs` service is now `Store`
* Breaking: Stores should be now renamed to State. Before: `ZooStore` should be `ZooState`
* Breaking: `@Mutation` is gone in favor of just `@Action`
* Breaking: Action's first argument is state context object, `{ state, setState }`
* Breaking: You use `setState` to set the state now rather than returning it in actions
* Breaking: Events are now just called Actions
* Breaking: `ofEvent` is now called `ofAction`
* Breaking: Plugins `next` fn now returns an observable
* Breaking: Local Storage plugins removed Strategy in favor of passing your own engine
* Feature: Simplified APIs by removing Mutations, decreased boilerplate
* Feature: Added sub state capability
* Feature: Add `store.selectOnce()` shortcut function
* Feature: Better tpyings
* Feature: Add `dispatch` function in state context for easier dispatching
* Fix: `dispatch().subscribe()` now works correctly
* Fix: Promises now resolve correctly

# 1.5.3 2018-02-12

* Fix: Promises not emitting results

# 1.5.2 2018-02-12

* Fix: Devtools plugin not returning correct value

# 1.5.1 2018-02-11

* Feature: Add `sessionStorage` strategy to local storage plugin

# 1.5.0 2018-02-11

* Feature: Updated Plugin System
* Feature: Add generics to store
* Feature: Implement global error handling
* Fix: Improve DI for lazy loadedd stores
* Fix: Fix dev tools showing previous state
* Chore: Remove redux dev tools by default

# 1.4.8 2018-02-05

* Fix: Typo in return

# 1.4.7 2018-02-05

* Fix: Catch multiple stores being init'd
* Fix: Clone defaults to prevent mutations

# 1.4.6 2018-02-04

* Fix: Plugin injector errors

# 1.4.5 2018-02-04

* Fix: Store injector errors
* Fix: Empty local storage throwing null error

# 1.4.4 2018-02-04

* Fix: Stores injector errors

# 1.4.3 2018-02-04

* Fix: Stores init'd twice

# 1.4.2 2018-02-04

* Fix: Feature stores throwing errors

# 1.4.1 2018-02-04

* Fix: Misc type improvement
* Fix: `forRoot` plugins not working properly
* Fix: LocalStorage plugin name spelling

# 1.4.0 2018-02-03

* Feature: Composition

# 1.3.0 2018-02-03

* Feature: Localstore plugin
* Fix: Better dev tools init

# 1.2.1 2018-02-03

* Fix: Dev tools init
* Fix: Plugins not recieving proper context
* Fix: Allow multiple forFeature

# 1.2.0 2018-02-03

* Feature: Dev Tools Integration
* Chore: Tests!
* Fix: Better builds

# 1.1.0 2018-02-03

* Fix: Export plugin interface

# 1.1.0 2018-02-03

* Feature: Plugins improvements
* Feature: Init event
* Feature: Logger plugin

# 1.0.4 2018-02-02

* Inital release!
