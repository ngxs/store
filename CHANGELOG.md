# 2.0.0-rc.4
### Fix
- Better typings

# 2.0.0-rc.3
### Fix
- Better typings

# 2.0.0-rc.2
### Features
- Add `patchValue` to make updating state easier

# 2.0.0-rc.1
## Bug Fixes
- Action `state` arguments cached when destructured, switch to `getState()`
- Class selectors not working with sub stores
- Fix missing dispatch on state context interface

# 2.0.0-rc.0
First off, 2.0 is a huge change. I want to appologize to everyone about that but
given all the community feedback and ideas, I really wanted to get these ideas in
before it was too late and we were stuck on a API. I can promise that there will
not be this big of a breaking change after this release in the future without 
first deprecation periods.

## Breaking
- `@Store()` decorator is now `@State()`
- `Ngxs` service is now `Store`
- Stores should be now renamed to State. Before: `ZooStore` should be `ZooState`
- `@Mutation` is gone in favor of just `@Action`
- Action's first argument is state context object, `{ state, setState }`
- You use `setState` to set the state now rather than returning it in actions
- Events are now just called Actions
- `ofEvent` is now called `ofAction`
- Plugins `next` fn now returns an observable
- Local Storage plugins removed Strategy in favor of passing your own engine

## Features
- Simplified APIs by removing Mutations, decreased boilerplate
- Added sub state capability
- Add `store.selectOnce()` shortcut function
- Better tpyings
- Add `dispatch` function in state context for easier dispatching

## Bug Fixes
- `dispatch().subscribe()` now works correctly
- Promises now resolve correctly

# 1.5.3 2/12/18
- Fix: Promises not emitting results

# 1.5.2 2/12/18
- Fix: Devtools plugin not returning correct value

# 1.5.1 2/11/18
- Feature: Add `sessionStorage` strategy to local storage plugin

# 1.5.0 2/11/18
- Feature: Updated Plugin System
- Feature: Add generics to store
- Feature: Implement global error handling
- Fix: Improve DI for lazy loadedd stores
- Fix: Fix dev tools showing previous state
- Chore: Remove redux dev tools by default

# 1.4.8 2/5/18
- Fix: Typo in return

# 1.4.7 2/5/18
- Fix: Catch multiple stores being init'd
- Fix: Clone defaults to prevent mutations

# 1.4.6 2/4/18
- Fix: Plugin injector errors

# 1.4.5 2/4/18
- Fix: Store injector errors
- Fix: Empty local storage throwing null error

# 1.4.4 2/4/18
- Fix: Stores injector errors

# 1.4.3 2/4/18
- Fix: Stores init'd twice

# 1.4.2 2/4/18
- Fix: Feature stores throwing errors

# 1.4.1 2/4/18
- Fix: Misc type improvement
- Fix: `forRoot` plugins not working properly
- Fix: LocalStorage plugin name spelling

# 1.4.0 2/3/18
- Feature: Composition

# 1.3.0 2/3/18
- Feature: Localstore plugin
- Fix: Better dev tools init

# 1.2.1 2/3/18
- Fix: Dev tools init
- Fix: Plugins not recieving proper context
- Fix: Allow multiple forFeature

# 1.2.0 2/3/18
- Feature: Dev Tools Integration
- Chore: Tests!
- Fix: Better builds

# 1.1.0 2/3/18
- Fix: Export plugin interface

# 1.1.0 2/3/18
- Feature: Plugins improvements
- Feature: Init event
- Feature: Logger plugin

# 1.0.4 2/2/18
- Inital release!
