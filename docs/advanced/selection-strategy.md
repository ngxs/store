# Selection strategy

The default state selection behavior in the NGXS is correct slices of data from the store. However, there may be situations in which you may get unobvious behavior. By default, all type errors that occur in NGXS are not displayed in console to the user.

```ts
@State({
  name: 'myState',
  defaults: {
    foo: 'Hello'
  }
})
class MyState {
  @Selector() static notHere(state: any) {
    return state.does.not.exist; // TypeError
  }
}
```

```ts
@Component({
  selector: 'app',
  template: '{{ state$ | async | json }}'
})
class AppComponent {
  @Select(MyState.notHere) state$: Observable<any>;
}
```

As you can see here is an obvious type error. Nothing will be displayed in the component template, but you will not see any errors in the console. In more difficult situations, you spend much more time before you understand where you made a mistake.

Well, to correct this point you can use additional parameters in the NGXS module configuration.

```ts
@NgModule({
  import: [
    NgxsModule.forRoot([MyState], { selectorOptions: { suppressErrors: false } })
  ]
})
export AppModule {}
```

```text
TypeError: Cannot read property 'not' of undefined
    at Function.NullSelectorState.notHere
```

And only then can you see the error in the console.

### Custom error catch strategy

However, you most likely want to control the error handling process yourself. To do this, you can override the default behavior of the strategy.

```ts
import { SelectorStrategy } from '@ngxs/store';
...

@Injectable()
class CustomSelectionStrategy implements SelectorStrategy {
  ...

  public retryWhenHandler(errors: Observable<Error>): Observable<never> {
   ...
  }

  public catchErrorHandler(err: Error): Observable<undefined> {
    console.error(err); // only output console without throw exception
    return of(undefined);
  }
}
```

You can implement your own error handling, in which you can only write messages in console without closing the state stream.

```ts
import { SelectionGlobalStrategy } from '@ngxs/store';
...

@NgModule({
  import: [
    NgxsModule.forRoot([MyState])
  ],
  providers: [
    { provide: SelectionGlobalStrategy, useClass: CustomSelectionStrategy }
  ]
})
export AppModule {}
```

### Custom retry when strategy

Also with retryWhen handler you can retry the subscription state if specified conditions are met.

```ts
@Component({
  selector: 'app',
  template: '{{ state$ | async }}'
})
class AppComponent {
  @Select(MyState.notHere) state$: Observable<any>;
}
```

One of the main problems is that after the first error in selector, the data stream no longer subscribes to state changes. And you will never again be able to see changes in the component template, as in this example, until you manually resubscribe yourself.

However, if you can define your error strategy, then you can always use your auto subscribe stream.

```ts
import { SelectionGlobalStrategy } from '@ngxs/store';
import { delay, scan } from 'rxjs/operators';
...

@Injectable()
class CustomSelectionStrategy extends SelectionGlobalStrategy {
 private readonly delay: number = 500;
 private readonly maxRetry: number = 2;

 public retryWhenHandler(errors: Observable<Error>): Observable<number> {
   return errors.pipe(
     scan((count: number, err: Error): number => {
       if (count > this.maxRetry) {
            throw err; // unsubscribe stream after exception
        }

        return count + 1;
     }, 0),
     delay(this.delay)
   );
 }
}
```

```ts
import { SelectionGlobalStrategy } from '@ngxs/store';
...

@NgModule({
  import: [
    NgxsModule.forRoot([MyState])
  ],
  providers: [
    { provide: SelectionGlobalStrategy, useClass: CustomSelectionStrategy }
  ]
})
export AppModule {}
```

```ts
@Component({
  selector: 'app',
  template: '{{ state$ | async | json }}'
})
class AppComponent {
  @Select(MyState.notHere) state$: Observable<any>;

  constuctor(private store: Store) {}

  public ngOnInit(): void {
    this.store.reset({
      myState: {
        foo: 'Hello',
        does: {
          not: {
            exist: 'World'
          }
        }
      }
    });
  }
}
```

And then if your condition is correctly, then even after errors occur, you can always correctly process the data stream.
