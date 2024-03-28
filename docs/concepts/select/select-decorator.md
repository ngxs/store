# Select Decorator

{% hint style="danger" %}
**DEPRECATED**

[Find out why we are deprecating the select decorator](../../deprecations/select-decorator-deprecation.md)
{% endhint %}

You can select slices of data from the store using the `@Select` decorator. It has a few different ways to get your data out, whether passing the state class, a function, a different state class or a memoized selector.

```ts
import { Select } from '@ngxs/store';
import { ZooState, ZooStateModel } from './zoo.state';

@Component({ ... })
export class ZooComponent {
  // Reads the name of the state from the state class
  @Select(ZooState) animals$: Observable<string[]>;

  // Uses the pandas memoized selector to only return pandas
  @Select(ZooState.pandas) pandas$: Observable<string[]>;

  // Also accepts a function like our select method
  @Select(state => state.zoo.animals) animals$: Observable<string[]>;

  // Reads the name of the state from the parameter
  @Select() zoo$: Observable<ZooStateModel>;
}
```
