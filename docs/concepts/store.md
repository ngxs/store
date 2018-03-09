# Store

Next lets define a store class. To do this we create a ES6 class
and decorate it with a `Store` decorator. The `Store` decorator
accepts a few different options:

* `name`: Optional name of the store. If not pass it will take
  the name of the class, camel case it and remove the word `Store` from the end.
* `defaults`: A set of default options to initialize our store with.

So here is our basic store:

```TS
import { Store } from 'ngxs';

export interface AnimalModel { ... }

@Store<Animal[]>({
  defaults: {
    feed: false,
    animals: []
  }
})
export class ZooStore {}
```

because I didn't pass a name, it will use the name `zoo`.
