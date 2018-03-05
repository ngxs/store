# Selects
Its important to note that READS and WRITES are completely separate in ngxs. To read data
out of the store, we can either call the `select` method on the 
`ngxs` service or a `@Select` decorator. First lets look at the `select` method.

```javascript
import { Ngxs } from 'ngxs';
import { AddAnimal } from './animal.events';

@Component({ ... })
export class ZooComponent {
  animals$: Observable<string[]>;
  constructor(private ngxs: Ngxs) {
    this.animals$ = this.ngxs.select(state => state.zoo.animals);
  }
}
```

Thats pretty similar to Redux and NGRX. We can use a handy decorator
the same way but with some other options.


```javascript
import { Ngxs } from 'ngxs';
import { AddAnimal } from './animal.events';

@Component({ ... })
export class ZooComponent {
  // Reads the name of the property minus the $
  @Select() animals$: Observable<string[]>;

  // Reads the parameter passed to the select decorator
  @Select('animals') animals$: Observable<string[]>;

  // These properties can be nested too
  @Select('animals.names') animals$: Observable<string[]>;

  // These properties can be in the form of an array too
  @Select(['animals', 'names']) animals$: Observable<string[]>;

  // Also accepts a function like our select method
  @Select(state => state.animals) animals$: Observable<string[]>;
}
```

Pretty cool huh? Lots of options to get data out! 
