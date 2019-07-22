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

In order to display information about the novel, we need a separate page where the router will be able to redirect the user. This page can have a linked resolver, that will preload particular novel:

```ts
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Store } from '@ngxs/store';
import { mapTo } from 'rxjs/operators';

@Injectable()
export class NovelResolver implements Resolve<Novel> {

  constructor(private store: Store) {}

  resolve(route: ActivatedRouteSnapshot) {
    const id = route.paramMap.get('id');

    return this.store
      .dispatch(new GetNovelById(id))
      .pipe(mapTo(this.store.selectSnapshot(NovelsInfoState.getNovelById(id))));
  }

}
```

The component that displays information about the novel, can access the already loaded novel via the `ActivatedRoute`:

```ts
@Component({
  selector: 'app-novel',
  template: `
    <h1>{{ novel.title }}</h1>
    <span>{{ novel.author }}</span>
    <p>
      {{ novel.content }}
      <del datetime="{{ novel.publishedAt }}></del>
    </p>
  `
})
export class NovelComponent {

  novel: Novel = this.route.snapshot.data.novel;

  constructor(private route: ActivatedRoute) {}

}
```

Don't forget to link the `NovelResolver` with the `NovelComponent`:

```ts
const routes: Routes = [
  {
    path: 'novel/:id',
    component: NovelComponent,
    resolve: {
      novel: NovelResolver
    }
  }
];
```
