# Dispatcher

Dispatcher is a single function that can be used to decorate static methods of states. 
You no longer need to use actions to make changes to the store.

## Dispatcher Decorators

```TS
import { State, Dispatcher, DispatchAction } from '@ngxs/store';

export interface CounterStateModel {
  value: number;
}

@State<CounterStateModel>({
  name: 'counterState',
  defaults: { value: 0 }
})
export class CounterState {

  @Dispatcher()
  public static setValue({ setState }, { payload }: DispatchAction<number>) {
    setState({ value: payload });
  }

}
```

## Dispatch Decorators

```TS
import { Select, Dispatch, DispatchEmitter } from '@ngxs/store';
...

@Component({ 
  selector: 'app-counter'
  template: `
    <ng-container *ngIf="count$ | async as count">
      <h3>Count is {{ count.value }}</h3>
      <div class="add-counter">
        <button (click)="counterValue.emit(count.value + 1)">Increment (+1)</button>
        <button (click)="counterValue.emit(count.value - 1)">Decrement (-1)</button>
      </div>
    </ng-container>  
  `
})
export class CounterComponent {

  // Reads the name of the state from the state class
  @Select(CounterState) count$: Observable<CounterStateModel>;
  
  // Use in components to emit asynchronously payload
  @Dispatch(CounterState.setValue) counterValue: DispatchEmitter<number>;
 
}
```

### Dependency Injection with @Dispatcher functions

If you want to subscribe to the changes, you can easily do this. 
You can also use the action method in store. 
Also you can access the dependencies with the injector.

```TS
import { Dispatcher, State } from '@ngxs/store';
import { Injector } from '@angular/core';

@State<CounterStateModel>({
  name: 'counter',
  defaults: { value: 0 }
})
export class CounterState {

  public static injector: Injector;

  constructor(injector: Injector) {
    CounterState.injector = injector;
  }

  @Dispatcher()
  public static loadData({ setState }) {
    const apiService = CounterState.injector.get(ApiService);
    return apiService.getValueFromServer() // heavy function
      .pipe(tap((value: number) => setState({ value })));
  }

}
```

```TS
import { Select, Dispatch, DispatchEmitter } from '@ngxs/store';
...

@Component({ 
  selector: 'app-count'
  template: `
    <ng-container *ngIf="count$ | async as count">
      <h3>
        Count is {{ count.value }}
        <span *ngIf="isLoading">loading...</span>
      </h3>
      <div class="add-counter">
        <button (click)="loadData()">Load data from server</button>
      </div>
    </ng-container>  
  `
})
export class CounterComponent {
  
  @Select(CounterState) count$: Observable<CounterStateModel>;
  isLoading: boolean;
  
  constuctor(public store: Store) {}
  
  public loadCountData() {
    this.isLoading = true;
    this.store.emitter<void>(CounterState.loadData).emit()
      .subscribe(() => this.isLoading = false);
  }
 
}
```
