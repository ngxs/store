# Announcing NGXS v20

We are excited to announce the release of NGXS v20, our latest major version of the state management library for Angular! This release includes support for Angular 20, introduces new powerful features, and brings significant performance improvements to help you build more efficient Angular applications.

For a complete list of changes, see our [v20.0.0 changelog entry](https://github.com/ngxs/store/blob/master/CHANGELOG.md#2000-2025-06-16).

## Overview

- 🚀 [Angular 20 Support](#angular-20-support) ([PR #2342](https://github.com/ngxs/store/pull/2342))
- 🎨 [New ActionDirector for Dynamic Action Handlers](#actiondirector) ([PR #2329](https://github.com/ngxs/store/pull/2329))
- 🧩 [lazyProvider Utility for Better Lazy Loading](#lazyprovider-utility) ([PR #2326](https://github.com/ngxs/store/pull/2326))
- 📦 [RxJS Dependency Reduction](#reduced-rxjs-dependency) ([PR #2292](https://github.com/ngxs/store/pull/2292), [PR #2309](https://github.com/ngxs/store/pull/2309), [PR #2310](https://github.com/ngxs/store/pull/2310))
- 🐛 [Bug Fixes and Performance Improvements](#bug-fixes)
- 🔌 [Plugin Improvements](#plugin-improvements)

---

## Angular 20 Support

NGXS v20 adds full support for Angular 20, ensuring that you can use the latest Angular features with our state management solution. This update maintains compatibility with the Angular ecosystem and takes advantage of the latest improvements in the framework ([PR #2342](https://github.com/ngxs/store/pull/2342)).

## ActionDirector

One of the most exciting new features in this release is the `ActionDirector` service, which provides a powerful way to attach and detach action handlers dynamically ([PR #2329](https://github.com/ngxs/store/pull/2329)).

You can find detailed documentation on this feature in our [Dynamic Action Handlers](https://www.ngxs.io/concepts/actions/dynamic-action-handlers) guide.

The `ActionDirector` allows you to:

- Add action handlers conditionally based on runtime conditions
- Add action handlers for lazy-loaded modules
- Create temporary action handlers that can be removed later

Here's an example of how to use the `ActionDirector`:

```ts
import { ActionDirector, createSelector } from '@ngxs/store';
import { inject, Injectable } from '@angular/core';

// State token
const COUNTRIES_STATE_TOKEN = new StateToken<string[]>('countries');

// Action
export class AddCountry {
  static readonly type = '[Countries] Add Country';

  constructor(readonly country: string) {}
}

@Injectable({ providedIn: 'root' })
export class CountryService {
  private actionDirector = inject(ActionDirector);
  private handle: { detach: () => void } | null = null;

  // Attach the action handler
  attachCountryHandler() {
    if (this.handle) return; // Already attached

    this.handle = this.actionDirector.attachAction(
      COUNTRIES_STATE_TOKEN,
      AddCountry,
      (ctx, action) => {
        // Update state
        ctx.setState(countries => [...countries, action.country]);
      }
    );
  }

  // Detach the action handler when no longer needed
  detachCountryHandler() {
    this.handle?.detach();
    this.handle = null;
  }
}
```

This feature is particularly useful for plugin systems, lazy-loaded features, temporary behaviors, and conditional action handling.

## lazyProvider Utility

The new `lazyProvider` utility function helps you defer the registration of Angular providers until they are explicitly needed ([PR #2326](https://github.com/ngxs/store/pull/2326)). This is especially valuable for feature state libraries, preventing them from being unnecessarily included in the initial application bundle.

You can find this feature documented in our [Lazy Loaded States](https://www.ngxs.io/concepts/state/lazy#lazyprovider) guide.

```ts
import { lazyProvider } from '@ngxs/store';

const routes = [
  {
    path: 'invoices',
    loadComponent: () =>
      import('./invoices/invoices.component').then(m => m.InvoicesComponent),
    canActivate: [
      lazyProvider(async () => (await import('./states/invoices')).invoicesStateProvider)
    ]
  }
];
```

In your state library, you can export a provider:

```ts
// states/invoices.ts
export const invoicesStateProvider = provideStates([InvoicesState]);

// OR using default export
export default provideStates([InvoicesState]);
```

This approach reduces your initial bundle size and ensures that state providers are only loaded when they're actually needed.

## Reduced RxJS Dependency

NGXS v20 continues our efforts to reduce reliance on RxJS by:

- Pulling fewer RxJS symbols ([PR #2309](https://github.com/ngxs/store/pull/2309), [PR #2310](https://github.com/ngxs/store/pull/2310))
- Optimizing how we handle observable streams ([PR #2292](https://github.com/ngxs/store/pull/2292))

These changes result in smaller bundle sizes and improved performance, especially for applications that don't heavily use RxJS elsewhere.

## Bug Fixes

We've addressed several important issues in this release:

- Added root store initializer guard to prevent initialization issues ([PR #2278](https://github.com/ngxs/store/pull/2278))
- Reduced change detection cycles with pending tasks ([PR #2280](https://github.com/ngxs/store/pull/2280))
- Completed action results on destroy to prevent memory leaks ([PR #2282](https://github.com/ngxs/store/pull/2282))
- Stopped contributing to stability once app is stable ([PR #2306](https://github.com/ngxs/store/pull/2306))

## Plugin Improvements

### Router Plugin

- Changed `@Selector` to `createSelector` for better type safety and tree-shaking ([PR #2294](https://github.com/ngxs/store/pull/2294))

### DevTools Plugin

- Added `serialize` option for better control over state serialization ([PR #2337](https://github.com/ngxs/store/pull/2337))

## Breaking Changes

While we've worked to minimize breaking changes, there are a few changes to be aware of:

- `executionStrategy` option has been removed, consider removing this option in your applications.
- To get the `RouterState.state`, it is now required to call the state function — `select(RouterState.state<CustomRouterState>())`. Previously, it was possible to provide a generic type for the router state, e.g., `select(RouterState.state<CustomRouterState>)`, but this is not possible if state were a property.

If you encounter any issues when upgrading, please check our [full documentation](https://www.ngxs.io/) and [deprecations documentation](https://www.ngxs.io/deprecations) first to see if there is anything that can help. Feel free to comment on the [discussion on GitHub](https://github.com/ngxs/store/discussions/2347) if you believe that there is an issue introduced by this release.

---

## Some Useful Links

If you would like any further information on changes in this release please feel free to have a look at our [changelog](https://github.com/ngxs/store/blob/master/CHANGELOG.md). The code for NGXS is all available at [https://github.com/ngxs/store](https://github.com/ngxs/store) and our docs are available at [https://www.ngxs.io/](https://www.ngxs.io/).

Helpful resources:

- [NGXS Concepts Documentation](https://www.ngxs.io/concepts)
- [NGXS Plugins Documentation](https://www.ngxs.io/plugins)
- [NGXS Recipes](https://www.ngxs.io/recipes)
- [Github Repository](https://github.com/ngxs/store)

We have a thriving community on our Discord server so come and join us to keep abreast of the latest developments. Here is the Discord invitation link: [https://discord.gg/yT3Q8cXTnz](https://discord.gg/yT3Q8cXTnz)
