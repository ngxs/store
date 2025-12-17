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
    <app-news-search [lastSearchedTitle]="lastSearchedTitle()" (search)="search($event)" />
    <app-news [news]="news()" />
  `,
  standalone: true,
  imports: [NewsSearchComponent, NewsComponents]
})
export class NewsPortalComponent {
  news: Signal<News[]> = this.store.selectSignal(NewsState.getNews);

  lastSearchedTitle = this.store.selectSignal(NewsState.getLastSearchedTitle);

  constructor(
    private store: Store,
    actions$: Actions
  ) {
    actions$
      .pipe(
        ofActionDispatched(SearchNews),
        map((action: SearchNews) => action.title),
        debounceTime(2000),
        takeUntilDestroyed()
      )
      .subscribe(title => {
        store.dispatch(new GetNews(title));
      });
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
@Injectable()
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

## Alternative Approach: Using cancelUncompleted

Instead of debouncing in the component, you can use the `cancelUncompleted` option with the `abortSignal` (available in v21+) to automatically cancel previous search requests:

```ts
@Component({
  selector: 'app-news-portal',
  template: `
    <app-news-search [lastSearchedTitle]="lastSearchedTitle()" (search)="search($event)" />
    <app-news [news]="news()" />
  `,
  standalone: true,
  imports: [NewsSearchComponent, NewsComponents]
})
export class NewsPortalComponent {
  news = this.store.selectSignal(NewsState.getNews);
  lastSearchedTitle = this.store.selectSignal(NewsState.getLastSearchedTitle);

  constructor(private store: Store) {}

  search(title: string): void {
    // Dispatch directly - cancellation is handled by the state
    this.store.dispatch(new GetNews(title));
  }
}
```

```ts
@State<NewsStateModel>({
  name: 'news',
  defaults: {
    news: [],
    lastSearchedTitle: null
  }
})
@Injectable()
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

  @Action(GetNews, { cancelUncompleted: true })
  async getNews(ctx: StateContext<NewsStateModel>, { title }: GetNews) {
    try {
      // Pass abortSignal to automatically cancel previous requests
      const response = await fetch(`/api/news?search=${title}`, {
        signal: ctx.abortSignal
      });

      const news = await response.json();
      ctx.setState({ news, lastSearchedTitle: title });
    } catch (error) {
      if (error.name === 'AbortError') {
        return; // Gracefully handle cancellation
      }
      throw error;
    }
  }
}
```

This approach is simpler as it moves the cancellation logic into the state where it belongs, and automatically cancels in-flight HTTP requests when a new search is dispatched. You can still combine this with debouncing in the component if you want to delay the dispatch itself.
