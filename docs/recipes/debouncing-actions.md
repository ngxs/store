# Debouncing Actions

There are situations when there is a need to debounce dispatched actions and reduce requests send to our API. Let's consider a simple application that renders a list of news and provides the ability to search among all of them:

```ts
class SearchNews {
  static readonly type = '[News] Search news';
  constructor(public title: string) {}
}

@Component({
  selector: 'app-news-portal',
  template: `
    <app-news-search
      (search)="search($event)"
      [lastSearchedTitle]="lastSearchedTitle$ | async"
    ></app-news-search>

    <app-news [news]="news$ | async"></app-news>
  `
})
export class NewsPortalComponent implements OnDestroy {

  @Select(NewsState.getNews) news$: Observable<News[]>;

  lastSearchedTitle$ = this.store.selectOnce(NewsState.getLastSearchedTitle);

  private destroy$ = new Subject<void>();

  constructor(private store: Store, actions$: Actions) {
    actions$
      .pipe(
        ofActionDispatched(SearchNews),
        map((action: SearchNews) => action.title),
        debounceTime(2000),
        takeUntil(this.destroy$)
      )
      .subscribe(title => {
        store.dispatch(new GetNews(title));
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  search(title: string): void {
    this.store.dispatch(new SearchNews(title));
  }

}
```

In the above example we've got the `app-news-portal` component that listens to the `search` event, dispatched by the `app-news-search` component. The `search` method, invoked on the `search` event, dispatches the `SearchNews` action. Notice that the `SearchNews` action is defined in the component file because it's never used by any other part of the application. We don't want to overload our server with requests thus we listen to the `Actions` stream that pipes the `SearchNews` action with `debounceTime` operator. Let's look at the below code of how we would implement our `NewsState`:

```ts
export interface NewsStateModel {
  news: News[];
  lastSearchedTitle: string | null;
}

export class GetNews {
  static readonly type = '[News] Get news';
  constructor(public title = '') {}
}

@State<NewsStateModel>({
  name: 'news',
  defaults: {
    news: [],
    lastSearchedTitle: null
  }
})
export class NewsState {

  @Selector()
  static getNews(state: NewsStateModel): News[] {
    return state.news;
  }

  @Selector()
  static getLastSearchedTitle(state: NewsStateModel): string | null {
    return state.lastSearchedTitle;
  }

  constructor(private http: HttpClient) {}

  @Action(GetNews)
  getNews(ctx: StateContext<NewsStateModel>, { title }: GetNews) {
    return this.http.get<News[]>(`/api/news?search=${title}`).pipe(
      tap(news => {
        ctx.setState({ news, lastSearchedTitle: title });
      })
    );
  }

}
```

The above state is pretty simple. As you can see we don't create an action handler for the `SearchNews` but it still will be passed via `Actions` stream and debounced. It all depends on the task in practice but you're already informed about debouncing actions.
