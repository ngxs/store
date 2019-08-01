# Caching
Caching requests executed by Actions is a common practice. NGXS does not
provide this ability out of the box, but it is easy to implement.

There are many different ways to approach this. Below is a simple example of
using the store's current values and returning them instead of calling the HTTP
service.

```TS
import { State, Action, StateContext } from '@ngxs/store';
import { tap } from 'rxjs/operators';

export class GetNovels {
  static readonly type = '[Novels] Get novels';
}

@State<Novel[]>({
  name: 'novels',
  defaults: []
})
export class NovelsState {

  constructor(private novelsService: NovelsService) {}

  @Action(GetNovels)
  getNovels(ctx: StateContext<Novel[]>) {
    return this.novelsService.getNovels().pipe(
      tap(novels => ctx.setState(novels))
    );
  }

}
```

Imagine that this state of novels contains only minimal information about them such as ID and name.
When the user selects a particular novel - he is redirected to a page with full information about this novel.
We want to load this information only once. Let's create a state and call it `novelsInfo`, this will be
the object whose keys are the identifiers of the novels:

```ts
import { State, Action, StateContext, createSelector } from '@ngxs/store';
import { tap } from 'rxjs/operators';

export interface NovelsInfoStateModel {
  [key: string]: Novel;
}

export class GetNovelById {
  static readonly type = '[Novels info] Get novel by ID';
  constructor(public id: string) {}
}

@State<NovelsInfoStateModel>({
  name: 'novelsInfo',
  defaults: {}
})
export class NovelsInfoState {

  static getNovelById(id: string) {
    return createSelector(
      [NovelsInfoState],
      (state: NovelsInfoStateModel) => state[id]
    );
  }

  constructor(private novelsService: NovelsService) {}

  @Action(GetNovelById)
  getNovelById(ctx: StateContext<NovelsInfoStateModel>, action: GetNovelById) {
    const novels = ctx.getState();
    const id = action.id;

    if (novels[id]) {
      // If the novel with ID has been already loaded
      // we just break the execution
      return;
    }

    return this.novelsService.getNovelById(id).pipe(
      tap(novel => {
        ctx.patchState({ [id]: novel });
      })
    );
  }

}
```

The component, that displays information about the novel, can subscribe to the `params` observable of the `ActivatedRoute` to listen to the params change. The code will look as following:

```ts
@Component({
  selector: 'app-novel',
  template: `
    <h1>{{ novel?.title }}</h1>
    <span>{{ novel?.author }}</span>
    <p>
      {{ novel?.content }}
      <del datetime="{{ novel?.publishedAt }}"></del>
    </p>
  `
})
export class NovelComponent implements OnDestroy {

  novel: Novel;

  private destroy$ = new Subject<void>();

  constructor(route: ActivatedRoute, store: Store) {
    route.params
      .pipe(
        switchMap(params =>
          store
            .dispatch(new GetNovelById(params.id))
            .pipe(mapTo(store.selectSnapshot(NovelsInfoState.getNovelById(params.id))))
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(novel => {
        this.novel = novel;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
```

We're using the `switchMap` in this example, so if the user navigates to another novel and `params` observable emits new value - we have to complete previously started asynchronous job (in our case it's getting novel by ID).
