# Integration with RxAngular

There are use cases when is desired to have a transient component state has it's lifetime bound to the component lifecycle.
[RxAngular](https://github.com/rx-angular/rx-angular) provides a solution for this problem that is fully reactive and with focus on runtime performance and template rendering.

In order to leverage this library and all the power of a global state management is possible to integrate RxAngular with NGXS.
First, let's bind a value from NGXS state to RxAngular component state:

```ts
interface HeroesComponentState {
  heroes: Hero[];
}

const initHeroesComponentState: Partial<HeroesComponentState> = {
  heroes: []
};

@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.css'],
  providers: [RxState] // <--- This binds RxState to the lifetime of the component
})
export class HeroesComponent {
  @Select(getHeroes) stateHeroes$: Observable<Hero[]>; // <--- normal @Select use from NGXS

  heroes: Hero[];

  readonly heroes$: Observable<Hero[]> = this.state.select('heroes');

  constructor(private state: RxState<HeroesComponentState>) {
    this.state.set(initHeroesComponentState);
    this.state.connect('heroes', this.stateHeroes$); // <--- Here we connect NGXS with RxAngular
  }
}
```

It is also important to connect the changes on the component local state to NGXS.
For example, let's bind the addHero and deleteHero on the following code:

```ts
@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.css'],
  providers: [RxState]
})
export class HeroesComponent {
  heroes: Hero[];

  readonly add = new Subject<string>();
  readonly delete = new Subject<Hero>();

  constructor(
    private state: RxState<HeroesComponentState>,
    private store: Store
  ) {
    this.state.hold(
      // <--- RxAngular hold will manage the subscription for us
      this.add.pipe(switchMap(name => this.store.dispatch(new AddHero(name)))) // <--- dispatch action to NGXS
    );

    this.state.hold(
      this.delete.pipe(switchMap(hero => this.store.dispatch(new DeleteHero(hero))))
    );
  }
}
```

That's it! The advantage of this approach is that you can leverage all the reactivity from RxAngular and still manage your global state using NGXS.
This allows you to combine the best of both libraries.

To check a full example integrating NGXS with RxAngular checkout this Tour of Heroes example [here](https://github.com/rx-angular/rx-angular/tree/master/apps/tour-of-heroes-ngxs)
