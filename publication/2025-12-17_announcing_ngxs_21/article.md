# Announcing NGXS v21

We are excited to announce the release of NGXS v21, our latest major version of the state management library for Angular! This release introduces a powerful new feature for managing asynchronous action lifecycles, along with important bug fixes and performance improvements to help you build more robust Angular applications.

For a complete list of changes, see our [v21.0.0 changelog entry](https://github.com/ngxs/store/blob/master/CHANGELOG.md#2100-2025-12-17).

## Overview

- 🎯 [AbortSignal Support for Action Handlers](#abortsignal-support) ([PR #2244](https://github.com/ngxs/store/pull/2244))
- 🐛 [Bug Fixes and Stability Improvements](#bug-fixes)
- 🔌 [Plugin Improvements](#plugin-improvements)

---

## AbortSignal Support

One of the most exciting features in this release is the addition of `AbortSignal` support on the state context. This provides a standardized way to handle cancellation of asynchronous operations in your action handlers ([PR #2244](https://github.com/ngxs/store/pull/2244)).

### Why AbortSignal?

When working with asynchronous actions, especially those marked with `cancelUncompleted: true`, you may need to gracefully handle cancellation when a new action is dispatched before the previous one completes. The `AbortSignal` provides a standard browser API to detect and respond to these cancellations.

### How to Use It

The `StateContext` now includes an `abortSignal` property that you can use in your action handlers:

```ts
import { Injectable } from '@angular/core';
import { State, Action, StateContext } from '@ngxs/store';

export class FetchCountries {
  static readonly type = '[Countries] Fetch';
}

@State<string[]>({
  name: 'countries',
  defaults: []
})
@Injectable()
export class CountriesState {
  @Action(FetchCountries, { cancelUncompleted: true })
  async fetchCountries(ctx: StateContext<string[]>) {
    // Simulate some async work
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check if the action was canceled before updating state
    if (ctx.abortSignal.aborted) {
      console.log('Action was canceled, skipping state update');
      return;
    }

    ctx.setState(['USA', 'Canada', 'Mexico']);
  }
}
```

### Integration with Fetch API

The `AbortSignal` works seamlessly with modern browser APIs like `fetch`:

```ts
@Action(FetchUsers, { cancelUncompleted: true })
async fetchUsers(ctx: StateContext<User[]>) {
  try {
    // Pass the abort signal directly to fetch
    const response = await fetch('/api/users', {
      signal: ctx.abortSignal
    });

    const users = await response.json();
    ctx.setState(users);
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Fetch was canceled');
      return; // Gracefully exit if canceled
    }
    throw error;
  }
}
```

### Key Benefits

- **Standardized API**: Uses the browser's native `AbortSignal` API, making it familiar and compatible with other web APIs
- **Graceful Cancellation**: Allows you to clean up resources and avoid unnecessary state updates when actions are canceled
- **Better Performance**: Prevents wasted work by detecting cancellation early in your async operations
- **Observable Auto-unsubscribe**: When using observables, they are automatically unsubscribed when the signal is aborted

## Bug Fixes

We've addressed several important issues to improve stability and reliability:

- **Lifecycle Safety**: Added guards against running state functions after the injector is destroyed ([PR #2366](https://github.com/ngxs/store/pull/2366), [PR #2377](https://github.com/ngxs/store/pull/2377))
- **Selector Improvements**: Fixed `createPickSelector` to not throw on unregistered states ([PR #2378](https://github.com/ngxs/store/pull/2378))
- **Type Safety**: Updated action handler types to allow `Observable<unknown>` and `Promise<unknown>` ([PR #2385](https://github.com/ngxs/store/pull/2385))

## Debugging Improvements

This release includes the following debugging improvements:

- **Signal Debugging**: Added `debugName` to computed signals in `selectSignal` for better developer experience ([PR #2370](https://github.com/ngxs/store/pull/2370))

## Performance Improvements

This release includes several performance optimizations:

- **Memory Management**: Cleared internal `_states` on destroy to aid garbage collection under high load ([PR #2365](https://github.com/ngxs/store/pull/2365))
- **Task Management**: Fixed issue where tasks could cause unnecessary unsubscribe operations ([PR #2388](https://github.com/ngxs/store/pull/2388))
- **Application Stability**: Stopped contributing to stability once the app is stable, improving performance ([PR #2379](https://github.com/ngxs/store/pull/2379))

## Plugin Improvements

### Storage Plugin

- **Null Safety**: Added guards to prevent errors when storage engine may be falsy ([PR #2367](https://github.com/ngxs/store/pull/2367), [PR #2368](https://github.com/ngxs/store/pull/2368))
- **Performance**: Replaced closure-based action matcher with direct type comparison for better performance ([PR #2369](https://github.com/ngxs/store/pull/2369))

### Router Plugin

- **State Update Optimization**: Avoids redundant NGXS state updates for identical router snapshots ([PR #2372](https://github.com/ngxs/store/pull/2372))

---

## Upgrading from v20

Upgrading to v21 should be straightforward for most applications. The main addition is the new `abortSignal` property on `StateContext`, which is additive and doesn't break existing code.

If you're using `cancelUncompleted` actions with async/await, we recommend adding `abortSignal` checks after await points to ensure your handlers gracefully handle cancellation:

```ts
// Before
@Action(MyAction, { cancelUncompleted: true })
async myHandler(ctx: StateContext<MyState>) {
  await someAsyncWork();
  ctx.setState(newState); // May execute even if canceled
}

// After (recommended)
@Action(MyAction, { cancelUncompleted: true })
async myHandler(ctx: StateContext<MyState>) {
  await someAsyncWork();
  if (ctx.abortSignal.aborted) return; // Gracefully exit if canceled
  ctx.setState(newState);
}
```

If you encounter any issues when upgrading, please check our [full documentation](https://www.ngxs.io/) first. Feel free to comment on the [discussion on GitHub](https://github.com/ngxs/store/discussions) if you believe there is an issue introduced by this release.

---

## Some Useful Links

If you would like any further information on changes in this release please feel free to have a look at our [changelog](https://github.com/ngxs/store/blob/master/CHANGELOG.md). The code for NGXS is all available at [https://github.com/ngxs/store](https://github.com/ngxs/store) and our docs are available at [https://www.ngxs.io/](https://www.ngxs.io/).

Helpful resources:

- [NGXS Concepts Documentation](https://www.ngxs.io/concepts)
- [Action Cancellation Guide](https://www.ngxs.io/concepts/actions/cancellation)
- [NGXS Plugins Documentation](https://www.ngxs.io/plugins)
- [NGXS Recipes](https://www.ngxs.io/recipes)
- [Github Repository](https://github.com/ngxs/store)

We have a thriving community on our Discord server so come and join us to keep abreast of the latest developments. Here is the Discord invitation link: [https://discord.gg/yT3Q8cXTnz](https://discord.gg/yT3Q8cXTnz)
