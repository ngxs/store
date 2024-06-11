# Caching

Caching requests executed by Actions is a common practice. NGXS does not
provide this ability out of the box, but it is easy to implement.

There are many different ways to approach this. Below is a simple example of
using the store's current values and returning them instead of calling the HTTP
service.

```ts
import { Injectable } from '@angular/core';
import { State, Action, StateContext } from '@ngxs/store';
import { tap } from 'rxjs';

export class GetNovels {
  static readonly type = '[Novels] Get novels';
}

@State<Novel[]>({
  name: 'novels',
  defaults: []
})
@Injectable()
export class NovelsState {
  constructor(private novelsService: NovelsService) {}

  @Action(GetNovels)
  getNovels(ctx: StateContext<Novel[]>) {
    return this.novelsService.getNovels().pipe(tap(novels => ctx.setState(novels)));
  }
}
```

Imagine that this state of novels contains only minimal information about them such as ID and name.
When the user selects a particular novel - he is redirected to a page with full information about this novel.
We want to load this information only once. Let's create a state and call it `novelsInfo`, this will be
the object whose keys are the identifiers of the novels:

```ts
import { Injectable } from '@angular/core';
import { State, Action, StateContext, createSelector } from '@ngxs/store';
import { tap } from 'rxjs';

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
@Injectable()
export class NovelsInfoState {
  static getNovelById(id: string) {
    return createSelector([NovelsInfoState], (state: NovelsInfoStateModel) => state[id]);
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

The component responsible for displaying information about the novel can subscribe to the `params` observable of the `ActivatedRoute` to listen for changes in the parameters. The code will appear as follows:

```ts
@Component({
  selector: 'app-novel',
  template: `
    @if (novel(); as novel) {
      <h1>{{ novel.title }}</h1>
      <span>{{ novel.author }}</span>
      <p>
        {{ novel.content }}
        <del datetime="{{ novel.publishedAt }}"></del>
      </p>
    }
  `,
  standalone: true
})
export class NovelComponent {
  novel = signal<Novel | null>(null);

  constructor(route: ActivatedRoute, store: Store) {
    route.params
      .pipe(
        switchMap(params =>
          store
            .dispatch(new GetNovelById(params.id))
            .pipe(mergeMap(() => store.select(NovelsInfoState.getNovelById(params.id))))
        ),
        takeUntilDestroyed()
      )
      .subscribe(novel => {
        this.novel.set(novel);
      });
  }
}
```

In this example, we're utilizing `switchMap`, so if the user navigates to another novel and the `params` observable emits a new value, we need to complete the previously started asynchronous job, which, in our case, involves fetching the novel by its ID.
