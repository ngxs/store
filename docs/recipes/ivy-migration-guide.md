# Ivy Migration Guide

## Migration Overview

The Angular team has worked hard to ensure Ivy is as backwards-compatible with the previous rendering engine ("View Engine") as possible. Unfortunately, some changes have to be made so that NGXS and Ivy can function together seamlessly.

In Ivy, all provided or injected tokens must have `@Injectable()` decorator (previously, injected tokens without `@Injectable()` were allowed if another decorator was used, e.g. pipes). In our case the `@State()` decorator was used.

### Changes You Have To Do

All states are providers, you don't care about their initialization as NGXS does it for you underneath. A typical state looks like this:

```ts
import { State } from '@ngxs/store';

@State<string[]>({
  name: 'countries',
  defaults: ['USA', 'Mexico', 'Canada']
})
export class CountriesState {}
```

As `CountriesState` is a provider and Ivy requires to decorate all providers with the `@Injectable()` decorator, then the Ivy compatible code should look like this:

```ts
import { Injectable } from '@angular/core';
import { State } from '@ngxs/store';

@State<string[]>({
  name: 'countries',
  defaults: ['USA', 'Mexico', 'Canada']
})
@Injectable()
export class CountriesState {}
```

Note: you don't have to set `providedIn` to `root` on the `@Injectable()` decorator.
