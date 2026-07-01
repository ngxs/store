# Announcing NGXS v22

We are excited to announce the release of NGXS v22, our latest major version of the state management library for Angular! This release brings support for Angular 22, a long-awaited ergonomic improvement to `dispatch` for async/await consumers, a richer set of state operators, dynamic plugin registration, sharper `createSelector` typings, and a clear signal that the future of NGXS configuration lies with standalone providers.

For a complete list of changes, see our [v22.0.0 changelog entry](https://github.com/ngxs/store/blob/master/CHANGELOG.md#2200).

## Overview

- 🚀 [Angular 22 Support](#angular-22-support)
- ⏳ [Async/await Support for `dispatch`](#asyncawait-support-for-dispatch) ([PR #2399](https://github.com/ngxs/store/pull/2399))
- 🧮 [New State Operators: `safePatch`, `updateItems`, `removeItems`](#new-state-operators) ([PR #2408](https://github.com/ngxs/store/pull/2408), [PR #2413](https://github.com/ngxs/store/pull/2413), [PR #2414](https://github.com/ngxs/store/pull/2414))
- 🧩 [Dynamic Plugin Registration with `registerNgxsPlugin`](#dynamic-plugin-registration) ([PR #2396](https://github.com/ngxs/store/pull/2396))
- 🪶 [Standalone-First: NgModule APIs Are Now Deprecated](#standalone-first-ngmodule-apis-are-now-deprecated) ([PR #2445](https://github.com/ngxs/store/pull/2445))
- 🎯 [Sharper `createSelector` Type Inference & Checking](#sharper-createselector-type-inference--checking) ([PR #2402](https://github.com/ngxs/store/pull/2402))
- 🛠️ [Developer-Experience Improvements](#developer-experience-improvements)
- 🐛 [Bug Fixes and Stability Improvements](#bug-fixes)
- ⚡ [Performance Improvements](#performance-improvements)
- 🔌 [Plugin Improvements](#plugin-improvements)

---

## Angular 22 Support

NGXS v22 adds full support for Angular 22 so you can use the latest Angular features alongside our state management solution. The peer-dependency range on all `@ngxs/*` packages now targets `@angular/core@>=22.0.0 <23.0.0`. As with previous major releases, this is a straightforward upgrade for the vast majority of applications — there are no public API breaks.

## Async/await Support for `dispatch` utility

Calling `dispatch()` and then `await`-ing the result has historically required a small dance: you had to wrap the returned `Observable<void>` in `lastValueFrom` (or the older `toPromise`) before `await` would do the right thing. v22 removes that ceremony.

`dispatch()` now returns a dual-natured value that both extends `Observable` and implements `PromiseLike<void>`. The shape of your code decides which API you get — `subscribe()` for the reactive flow, `await` for the imperative one. There is no API change for existing callers ([PR #2399](https://github.com/ngxs/store/pull/2399)).

```ts
// Reactive style — unchanged
this.store.dispatch(new FetchOrders()).subscribe(() => {
  console.log('orders fetched');
});
```

To support this without changing the public dispatch type from your perspective, we've also exposed `AsyncReturnType` from the public API ([PR #2405](https://github.com/ngxs/store/pull/2405)) so you can reference it when mocking dispatch-returning methods in your unit tests:

```ts
jest
  .spyOn(component.state, 'updateCompanyProfile')
  .mockReturnValue(new AsyncReturnType(EMPTY));
```

## New State Operators

This release adds three new state operators that fill long-standing gaps in the `@ngxs/store/operators` toolbox.

### `safePatch`

`safePatch` is a null-safe variant of `patch` that coerces a `null` or `undefined` existing value to `{}` before applying the patch spec. It prevents crashes when patching uninitialized or partially hydrated state branches ([PR #2408](https://github.com/ngxs/store/pull/2408)).

```ts
import { safePatch } from '@ngxs/store/operators';

@Action(UpdatePreferences)
updatePreferences(ctx: StateContext<UserSettings>, { theme }: UpdatePreferences) {
  ctx.setState(
    safePatch<UserSettings>({
      preferences: safePatch({ theme })
    })
  );
}
```

Even if `preferences` has never been set, the nested `safePatch` will treat the slot as `{}` and apply the update cleanly. Referential equality is preserved when nothing actually changes.

### `updateItems`

`updateItems` is the multi-match counterpart to the existing `updateItem`. It applies a replacement value — or another state operator — to every array element that satisfies a predicate, in a single pass ([PR #2413](https://github.com/ngxs/store/pull/2413)).

```ts
import { patch, updateItems } from '@ngxs/store/operators';

@Action(MarkOverdue)
markOverdue(ctx: StateContext<TodosStateModel>) {
  const now = Date.now();
  ctx.setState(
    patch({
      todos: updateItems<Todo>(
        todo => !todo.completed && todo.dueDate < now,
        patch({ overdue: true })
      )
    })
  );
}
```

When no element matches, `updateItems` returns the original array reference, so it composes safely inside `patch` without triggering unnecessary downstream recomputation.

### `removeItems`

`removeItems` is the multi-match counterpart to `removeItem`. It removes every array element satisfying a predicate in a single pass ([PR #2414](https://github.com/ngxs/store/pull/2414)).

```ts
import { patch, removeItems } from '@ngxs/store/operators';

@Action(ClearCompleted)
clearCompleted(ctx: StateContext<TodosStateModel>) {
  ctx.setState(
    patch({
      todos: removeItems<Todo>(todo => todo.completed)
    })
  );
}
```

Like `updateItems`, the no-match case is referentially stable — it returns the original array reference.

## Dynamic Plugin Registration

NGXS plugins have historically been configured at root bootstrap time via `withNgxsPlugin()` (or `NgxsModule.forRoot`'s `plugins` option). In v22 we add a runtime equivalent: `registerNgxsPlugin()` ([PR #2396](https://github.com/ngxs/store/pull/2396)).

This unlocks several patterns that previously required workarounds:

- Adding a plugin from a lazy-loaded feature module
- Registering a plugin only when a feature flag is enabled
- Wiring per-tenant or per-environment plugins after bootstrap
- Federating plugins from micro-frontends

Internally, every plugin (whether registered statically or dynamically) flows through the same `NGXS_PLUGINS` pipeline, so dynamically registered plugins are first-class citizens — they participate in dispatch, can be removed, and integrate with the existing tooling.

## Standalone-First: NgModule APIs Are Now Deprecated

NGXS embraced standalone Angular when it introduced `provideStore()`, `provideStates()`, and the `withNgxs*()` feature providers. In v22 we take the next step: all NgModule-based bootstrap APIs across NGXS packages are now marked as `@deprecated` in favor of their standalone equivalents ([PR #2445](https://github.com/ngxs/store/pull/2445)).

**This is a deprecation, not a removal.** Existing code using `NgxsModule.forRoot()`, `NgxsModule.forFeature()`, and the `forRoot()`/`forFeature()` methods on plugin modules continues to work unchanged. IDE tooling and compilers will surface the deprecation so you can plan a migration at your own pace.

The recommended migration:

```ts
// Before (deprecated)
@NgModule({
  imports: [
    NgxsModule.forRoot([AppState]),
    NgxsLoggerPluginModule.forRoot(),
    NgxsRouterPluginModule.forRoot()
  ]
})
export class AppModule {}

// After
export const appConfig: ApplicationConfig = {
  providers: [provideStore([AppState], withNgxsLoggerPlugin(), withNgxsRouterPlugin())]
};
```

If you are still on `NgModule`-based bootstrap, the [Getting Started](https://www.ngxs.io/introduction/installation) documentation walks through the equivalent standalone setup for every plugin.

## Sharper `createSelector` Type Inference & Checking

`createSelector` is a heavily-used corner of the NGXS API, and historically its type signature had two stubborn limitations: it was implemented as a stack of nine hand-written overloads (one for each supported arity from 1 to 9 selectors), and the projector argument types were inferred via a chain of `Sn extends SelectorArg` constraints that didn't enforce strict assignability when the developer wrote explicit annotations on the projector parameters.

In v22 we replace the entire overload stack with a single variadic-tuple signature ([PR #2402](https://github.com/ngxs/store/pull/2402)):

```ts
export function createSelector<
  Selectors extends SelectorArg[],
  TProjector extends (
    ...selectorResult: { [K in keyof Selectors]: ɵSelectorReturnType<Selectors[K]> }
  ) => any
>(
  selectors: [...Selectors],
  projector: TProjector,
  creationMetadata?: Partial<CreationMetadata>
): TProjector;
```

This is a small change with two visible effects.

### 1. Better inferred projector arguments — at any arity

The previous overload stack stopped at 8 selectors. The moment you reached 9 selectors, TypeScript fell through to the variadic catch-all and collapsed the projector parameter types to `any[]`. With the variadic-tuple signature, inference works uniformly regardless of how many selectors you pass in:

```ts
const a = () => 'a' as const;
const b = () => 'b' as const;
const c = () => 'c' as const;
// ...up to nine selectors
const i = () => 'i' as const;

const all = createSelector(
  [a, b, c, d, e, f, g, h, i],
  // Before v22: (a: any, b: any, ..., i: any) => readonly any[]
  // From v22:   (a: 'a', b: 'b', ..., i: 'i') => readonly ['a', 'b', ..., 'i']
  (a, b, c, d, e, f, g, h, i) => [a, b, c, d, e, f, g, h, i] as const
);
```

The same applies to the "mixed" case where some selectors are typed and others are not — typed slots now keep their precise types right through to the projector and to the return type.

### 2. Mismatched explicit projector argument types are now caught

When you _do_ annotate projector parameters explicitly — for example to widen `readonly ['a']` to `readonly [string]` — the new signature checks that your annotation is assignable from the corresponding selector's return type. Previously this check was silently skipped, and you could write a projector that took a parameter type completely incompatible with the selector feeding it:

```ts
// Before v22: allowed (silently)
// From v22:   compile error — number is not assignable to string
createSelector([() => 1], (state: string) => state);
```

Widening that _is_ legitimate continues to compile:

```ts
const a = () => ['a'] as const; // returns readonly ['a']

// Widening to readonly [string] is a valid supertype — compiles fine
createSelector([a], (a: readonly [string]) => [...a] as const);
```

### What this means for your codebase

This change is technically additive — there is no API surface change — but on first compile after the upgrade you may see new errors at `createSelector` call sites. **Those errors almost certainly represent real bugs.** As part of this PR we caught one such latent bug in the router plugin's own selector definition and fixed it in the same change. If TypeScript starts complaining at a `createSelector` you wrote, the most productive first move is to look at the selector's actual return type rather than to suppress the error.

## Developer-Experience Improvements

### Catching missing memoization in `selectSignal`

`selectSignal` now actively helps you catch a common performance footgun: selectors that return a new object reference on every read with no underlying data change. In dev mode, NGXS will log a `console.error` when this happens ([PR #2441](https://github.com/ngxs/store/pull/2441)), pointing you straight to the un-memoized selector.

The check uses `Object.is(a, b)` and only flags genuinely new references, so properly memoized selectors stay silent.

For projects that want a stricter (deep) check, v22 also adds the `warnOnNewReferenceWithIdenticalValue` option to `NgxsDevelopmentOptions` ([PR #2442](https://github.com/ngxs/store/pull/2442)):

```ts
import { isEqual } from 'lodash-es';

provideStore(
  [AppState],
  withNgxsDevelopmentOptions({
    warnOnNewReferenceWithIdenticalValue: { isEqual }
  })
);
```

Because the equality check runs inside every signal read, you supply the comparator (e.g. lodash `isEqual`) — NGXS deliberately avoids `JSON.stringify`-based deep equality, which is prohibitively slow on a hot path.

### Type-Safe Selectors guide

A new [Type-Safe Selectors](https://www.ngxs.io/concepts/select/type-safe-selectors) page walks through the progression from untyped state-class selectors to fully type-safe ones, using `StateToken`, `createPropertySelectors`, `createPickSelector`, and `createModelSelector` ([PR #2417](https://github.com/ngxs/store/pull/2417)). It includes a `createSelector` wrapping pattern as a migration path for codebases that cannot adopt `StateToken` immediately.

### Better errors when a destroyed injector is touched

Errors raised by writes against a destroyed injector are now reported through Angular's `ErrorHandler` ([PR #2410](https://github.com/ngxs/store/pull/2410)) and the production-mode `StateContextDestroyedError` message now includes the offending state path ([PR #2421](https://github.com/ngxs/store/pull/2421)), making these issues much easier to track down in error monitoring tools.

## Bug Fixes

- **Injector lifecycle**: Skip state mutations when the injector is destroyed mid-action ([PR #2406](https://github.com/ngxs/store/pull/2406)) and warn when state is mutated after injector destruction ([PR #2407](https://github.com/ngxs/store/pull/2407)).
- **Subject cleanup**: Observers are now cleaned up once subjects complete ([PR #2401](https://github.com/ngxs/store/pull/2401)).
- **`updateItems` referential stability**: Returns the original array reference when no elements match the predicate ([PR #2424](https://github.com/ngxs/store/pull/2424)).
- **Pending tasks**: Silenced an unnecessary `console.warn` in `withNgxsPendingTasks` for the browser ([PR #2425](https://github.com/ngxs/store/pull/2425)).
- **`selectSignal` defaulting**: `selectSignal()` now falls back correctly to the default signal equality when no comparator is supplied ([PR #2443](https://github.com/ngxs/store/pull/2443)).
- **Prototype-pollution hardening**: Plain lookup maps now use `Object.create(null)` so they cannot inherit prototype properties ([PR #2446](https://github.com/ngxs/store/pull/2446)).

## Performance Improvements

- **Action dispatch hot path**: Reduced operator allocations on every dispatch ([PR #2435](https://github.com/ngxs/store/pull/2435)).
- **Action handler connection**: Replaced `map`/`defaultIfEmpty`/`catchError` with a hand-rolled `Observable` in `connectActionHandlers` ([PR #2437](https://github.com/ngxs/store/pull/2437)).
- **GC**: Prevented `StateFactory` retention via an unhandled error callback ([PR #2438](https://github.com/ngxs/store/pull/2438)).

## Plugin Improvements

### Storage Plugin

- **Factory engines**: `KeyWithExplicitEngine.engine` now accepts `() => StorageEngine` in addition to `Type<StorageEngine>` and `InjectionToken<StorageEngine>` ([PR #2444](https://github.com/ngxs/store/pull/2444)). Factories run inside an injection context, so `inject()` works as expected. This makes per-key engine configuration possible without defining a separate `InjectionToken` for every variant.

  ```ts
  withNgxsStoragePlugin({
    keys: [
      { key: 'session', engine: () => new MemoryEngine({ ttlMs: 60_000 }) },
      { key: 'preferences', engine: () => new MemoryEngine({ ttlMs: Infinity }) }
    ]
  });
  ```

- **SSR safety**: Guarded against environments that do not provide `ngServerMode` ([PR #2400](https://github.com/ngxs/store/pull/2400)).
- **Migration robustness**: A missing version key is now treated as `0` when matching migrations, so previously unkeyed state migrates cleanly the first time around ([PR #2422](https://github.com/ngxs/store/pull/2422)).
- **Security**: Dependency ranges tightened to pull in security fixes from transitive dependencies ([PR #2404](https://github.com/ngxs/store/pull/2404)).

---

## Upgrading from v21

Most projects should be able to upgrade by bumping the `@ngxs/*` packages alongside Angular 22 — there are no public API breaks.

A few things to be aware of:

1. **NgModule APIs surface deprecation warnings.** Your code keeps working. Plan a migration to `provideStore()` and the `withNgxs*()` providers when convenient. See the [Standalone-First](#standalone-first-ngmodule-apis-are-now-deprecated) section above.
2. **`createSelector` typings are stricter.** If TypeScript starts complaining at a `createSelector` call site after the upgrade, it is almost certainly catching a real type mismatch — the legacy signature accepted some incorrect types silently. See the [Sharper `createSelector` Type Inference & Checking](#sharper-createselector-type-inference--checking) section for details.
3. **Dev-mode signal warnings.** If you see new `console.error` output from `selectSignal` after upgrading, you have a selector that returns a fresh reference for an unchanged value. Memoize it (e.g. via `createSelector`, `createPropertySelectors`, etc.) to eliminate the warning and the wasted recomputation it represents.

If you encounter any issues when upgrading, please check the [full documentation](https://www.ngxs.io/) first. If you believe you've found a regression, please open a [discussion on GitHub](https://github.com/ngxs/store/discussions) so we can take a look.

---

## Some Useful Links

If you would like any further information on changes in this release please feel free to have a look at our [changelog](https://github.com/ngxs/store/blob/master/CHANGELOG.md). The code for NGXS is all available at [https://github.com/ngxs/store](https://github.com/ngxs/store) and our docs are available at [https://www.ngxs.io/](https://www.ngxs.io/).

Helpful resources:

- [NGXS Concepts Documentation](https://www.ngxs.io/concepts)
- [State Operators Reference](https://www.ngxs.io/concepts/state/operators)
- [Type-Safe Selectors Guide](https://www.ngxs.io/concepts/select/type-safe-selectors)
- [Lazy Loading Action Handlers Recipe](https://www.ngxs.io/recipes/lazy-loading-action-handlers)
- [NGXS Plugins Documentation](https://www.ngxs.io/plugins)
- [Github Repository](https://github.com/ngxs/store)

We have a thriving community on our Discord server so come and join us to keep abreast of the latest developments. Here is the Discord invitation link: [https://discord.gg/yT3Q8cXTnz](https://discord.gg/yT3Q8cXTnz)
