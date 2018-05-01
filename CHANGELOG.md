# 3.0.0-rc.3 5/1/18

- BREAKING: Update websocket connect to recieve options object #341
- Feature: Consolidate action stream to single-source-of-truth #324
- Fix: Remove reconnection from websocket because of issues #341
- Fix: Enums causing prod build errors #345
- Fix: Router race case when using prod #345

# 3.0.0-rc.2 4/27/18

- Fix: Form update fix #335
- Chore: Upgrade RxJS to official #332


# 3.0.0-rc.1 4/12/18

- Fix: Rename `ofActionComplete` to `ofActionCompleted`
- Fix: Expose `ofActionErrored`
- Fix: Form Plugin Recursive Error

# 3.0.0-rc.0 4/10/18

* Fix: Observable dispatch issues #235
* Fix: Websocket error when socket undefined
* Fix: Devtools not disabling
* Fix: Action Stream has too much exposed
* Chore: Loosen ng deps
* Chore: Upgrade to ng6/rx6

### BREAKING

* feat(store): create action stream that shows the action lifecycle #255

To keep the same behavior switch from the ofAction operator to the `ofActionDispatched` operator

# 3.0.0-beta.0 4/5/18

* BREAKING: Types are now required on actions
* Feature: Devtools can emit actions manually now
* Feature: Better integration w/ RX6
* Fix: Various websocket fixes
* Fix: Fixes for `ofAction`
* Chore: Rename Beta Feature `takeLast` to `cancelUncompleted`

# 2.1.0-beta.9 4/4/18

* Fix: Websocket and form errors caused by #212

# 2.1.0-beta.8 4/4/18

* Fix: Minification issues #212

# 2.1.0-beta.7 4/3/18

* Fix: Websocket plugin sending dupe objects

# 2.1.0-beta.6 4/3/18

* Fix: Action types on objects not matching correctly

# 2.1.0-beta.5 4/3/18

* Fix: Revert #206
* Fix: Websocket send message correctly

# 2.1.0-beta.4 4/3/18

* Feature: Added `snapshot` method to store to get raw value
* Fix: Return `T` from `selectSnapshot`
* Fix: Minification issues #206
* Fix: Websockets not emitting correctly

# 2.1.0-beta.3 4/3/18

* Fix: Revert devtools trigger, due to circular

# 2.1.0-beta.2 4/2/18

* Feature: Devtools can now trigger actions adhoc
* Fix: Websocket optional typekey

# 2.1.0-beta.1 4/2/18

* Fix: Websocket pass options as partial

# 2.1.0-beta.0 4/2/18

* Feature: Lifecycle events
* Feature: Forms plugin
* Fature: takeLast on actions
* Feature: Websocket plugin
* Feature: Snapshot selects

# 2.0.0 3/27/18

First off, 2.0 is a huge change. I want to appologize to everyone about that but
given all the community feedback and ideas, I really wanted to get these ideas in
before it was too late and we were stuck on a API. I can promise that there will
not be this big of a breaking change after this release in the future without
first deprecation periods.

* Fix: Prevent null exceptions when accessing state before loaded
* Fix: Move action stream to subject
* Fix: Ensure metadata exists for a Selector (#181)

# 2.0.0-rc.24 3/26/18

* Feature: Expose Init and Update Actions
* Fix: Devtools showing duplicate entries
* Fix: Storage plugin not populating for lazy loaded states

# 2.0.0-rc.23 3/26/18

* Fix: Subscriptions firing twice

# 2.0.0-rc.22 3/26/18

* BREAKING: Storage plugin fixes #154
* Fix: AoT Regression in Storage Plugin

# 2.0.0-rc.21 3/25/18

* BREAKING: Plugins are now their own packages
* Fix: Subscribe firing multiple times
* Fix: Devtools only passing type and payload

# 2.0.0-rc.20 3/23/18

* BREAKING: We moved the npm package from `ngxs` to `@ngxs/store`!
* Fix: devtools not sending payload #132
* Fix: better if condition for localstorage

# 2.0.0-rc.19 3/23/18

* Feature: add overloading to select method in Store #130
* Fix: add empty options object, to prevent errors #131
* Fix: feature-module bugs #135

# 2.0.0-rc.18 3/20/18

* Fix: Types on devtools

# 2.0.0-rc.17 3/20/18

* Feature: Extend devtool options
* Feature: Jump to Action and Jump to State in Dev Tools

# 2.0.0-rc.16 3/20/18

* Fix: Action stream not getting passed correct args, causing error in FF

# 2.0.0-rc.15 3/20/18

* Fix: Lazy load issue introduced by #126

# 2.0.0-rc.14 3/20/18

* Feature: NgxsLoggerPlugin log action payload if present
* Fix: Issues with feature states #126

# 2.0.0-rc.13 3/20/18

* Feature: State can listen to action multiple times

# 2.0.0-rc.12 3/20/18

* Fix: Dev tools showing wrong state

# 2.0.0-rc.11 3/20/18

* BREAKING: Remove string selects, they re not type safe and bad idea
* Feature: Extend `store.select` to support class selectors
* Feature: Expose state stream for users to subscribe to
* Fix: Fix Subscribe dispatching twice #104

# 2.0.0-rc.10 3/19/18

* BREAKING: Rename `EventStream` to `Actions`
* BREAKING: Rename plugins to have NGXS Prefix

# 2.0.0-rc.9 3/18/18

* Feature: Memoized Selectors
* Fix: Default to empty object if no default passed

# 2.0.0-rc.8 3/18/18

* Fix: Patch value not updating state

# 2.0.0-rc.7 3/18/18

* Fix: Patch value patching wrong path

# 2.0.0-rc.6 3/18/18

* Fix: topological sort
* Fix: defaults not working correctly if plain boolean/string/number

# 2.0.0-rc.5 3/18/18

* Fix: patchState typings

# 2.0.0-rc.4 3/18/18

* Fix: patchState typings

# 2.0.0-rc.3 3/18/18

* Fix: Add typings for patchState

# 2.0.0-rc.2 3/18/18

* Feature: Add `patchValue` to make updating state easier

# 2.0.0-rc.1 3/18/18

## Bug Fixes

* Fix: Action `state` arguments cached when destructured, switch to `getState()`
* Fix: Class selectors not working with sub stores
* Fix: missing dispatch on state context interface

# 2.0.0-rc.0 3/17/18

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

# 1.5.3 2/12/18

* Fix: Promises not emitting results

# 1.5.2 2/12/18

* Fix: Devtools plugin not returning correct value

# 1.5.1 2/11/18

* Feature: Add `sessionStorage` strategy to local storage plugin

# 1.5.0 2/11/18

* Feature: Updated Plugin System
* Feature: Add generics to store
* Feature: Implement global error handling
* Fix: Improve DI for lazy loadedd stores
* Fix: Fix dev tools showing previous state
* Chore: Remove redux dev tools by default

# 1.4.8 2/5/18

* Fix: Typo in return

# 1.4.7 2/5/18

* Fix: Catch multiple stores being init'd
* Fix: Clone defaults to prevent mutations

# 1.4.6 2/4/18

* Fix: Plugin injector errors

# 1.4.5 2/4/18

* Fix: Store injector errors
* Fix: Empty local storage throwing null error

# 1.4.4 2/4/18

* Fix: Stores injector errors

# 1.4.3 2/4/18

* Fix: Stores init'd twice

# 1.4.2 2/4/18

* Fix: Feature stores throwing errors

# 1.4.1 2/4/18

* Fix: Misc type improvement
* Fix: `forRoot` plugins not working properly
* Fix: LocalStorage plugin name spelling

# 1.4.0 2/3/18

* Feature: Composition

# 1.3.0 2/3/18

* Feature: Localstore plugin
* Fix: Better dev tools init

# 1.2.1 2/3/18

* Fix: Dev tools init
* Fix: Plugins not recieving proper context
* Fix: Allow multiple forFeature

# 1.2.0 2/3/18

* Feature: Dev Tools Integration
* Chore: Tests!
* Fix: Better builds

# 1.1.0 2/3/18

* Fix: Export plugin interface

# 1.1.0 2/3/18

* Feature: Plugins improvements
* Feature: Init event
* Feature: Logger plugin

# 1.0.4 2/2/18

* Inital release!
