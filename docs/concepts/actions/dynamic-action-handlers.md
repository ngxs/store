# Dynamic Action Handlers

Sometimes you need to attach action handlers dynamically after state initialization. For example, you might want to:

- Add action handlers conditionally based on runtime conditions
- Add action handlers for lazy-loaded modules
- Add temporary action handlers that can be removed later

How is a Dynamic Action Handler different to what the [Actions Stream](./actions-stream.md) gives you?

- It gives you the ability to make changes to state from your handler
- It participates in the standard [actions life cycle](./actions-life-cycle.md)
  - The result of the handler will affect the completion result of the action
  - The life cycle for the action will only complete once all dynamic handlers have completed too

NGXS provides the `ActionDirector` service for registering Dynamic Action Handlers.

## DISCLAIMER: Before you use it...

Please bear in mind that this is a power user feature, and should not be used as a replacement for the typical action declarations within a state.

- Overuse of Dynamic Action Handlers can lead to an application that is hard to understand and hard to determine the exact behavior of a state at a specific point in time
- Co-location of the handlers with a state class is a massive benefit for a clean and predictable codebase. When using Dynamic Action Handlers, please consider this fact and try to honour this principle
- The main intended use of this feature is for plugins and utilities that enhance state, so if you are doing something else, please check that you can't solve your problem with the simpler state constructs
- Another potential use is for the lazy loading of action handler logic. This is a very specialised optimisation and should only be used if lazy loading the entire state with a route is not sufficient

## The ActionDirector Service

The `ActionDirector` allows you to attach action handlers to a state at any point after initialization and gives you the ability to detach them when no longer needed.

### Attaching an Action Handler

```ts
import { ActionDirector, createSelector } from '@ngxs/store';
import { inject, Injectable } from '@angular/core';

// State token
const COUNTRIES_STATE_TOKEN = new StateToken<string[]>('countries');

// Action
export class AddCountry {
  static readonly type = '[Countries] Add Country';
  constructor(public country: string) {}
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
    if (this.handle) {
      this.handle.detach();
      this.handle = null;
    }
  }
}
```

### When to Use Dynamic Action Handlers

Dynamic action handlers are useful in several scenarios:

1. **Plugin systems**: Allow plugins to register their own action handlers
2. **Lazy-loaded features**: Attach action handlers when a feature module is loaded
3. **Temporary behaviors**: Create handlers that only exist for a specific duration
4. **Conditional action handling**: Enable action handlers based on runtime conditions

### The detach Function

The `attachAction` method returns an object with a `detach` function that can be called to remove the action handler. This enables proper cleanup and prevents memory leaks.

```ts
// Example of attaching and later detaching a handler
const handle = actionDirector.attachAction(STATE_TOKEN, SomeAction, (ctx, action) => {
  // Handler logic
});

// Later, when the handler is no longer needed:
handle.detach();
```
