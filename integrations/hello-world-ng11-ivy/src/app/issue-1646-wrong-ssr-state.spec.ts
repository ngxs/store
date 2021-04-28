import {
  ApplicationRef,
  Component,
  ComponentRef,
  Injectable,
  NgModule,
  ɵivyEnabled
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import {
  Action,
  NgxsModule,
  Select,
  Selector,
  State,
  StateContext,
  StateToken,
  Store
} from '@ngxs/store';
import { freshPlatform } from '@ngxs/store/internals/testing';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

// This test requires Ivy to be enabled.
describe('Select decorator returning state from the wrong store during SSR (https://github.com/ngxs/store/issues/1646)', () => {
  const COUNTRIES_STATE_TOKEN = new StateToken<string[]>('countries');

  class AddCountry {
    static type = '[Countries] Add country';
    constructor(public country: string) {}
  }

  @State({
    name: COUNTRIES_STATE_TOKEN,
    defaults: ['Mexico', 'USA', 'Canada']
  })
  @Injectable()
  class CountriesState {
    @Selector()
    static getFirstCountry(countries: string[]): string {
      return countries[0];
    }

    @Action(AddCountry)
    addCountry(ctx: StateContext<string[]>, action: AddCountry) {
      ctx.setState(state => [...state, action.country]);
    }
  }

  it(
    'different apps should use its own Store instances',
    freshPlatform(async () => {
      expect(ɵivyEnabled).toBe(true);

      @Component({ selector: 'app-root', template: '' })
      class TestComponent {
        @Select(CountriesState) countries$!: Observable<string[]>;
        @Select(CountriesState.getFirstCountry) firstCountry$!: Observable<string>;
      }

      @NgModule({
        imports: [
          BrowserModule,
          NgxsModule.forRoot([CountriesState], { developmentMode: true })
        ],
        declarations: [TestComponent],
        bootstrap: [TestComponent]
      })
      class TestModule {}

      // Arrange
      const platform = platformBrowserDynamic();
      const firstAppCountries: string[][] = [];
      const secondAppCountries: string[][] = [];
      const subscriptions: Subscription[] = [];

      // Now let's bootstrap 2 different apps in parallel, this is basically the same what
      // Angular Universal does internally for concurrent HTTP requests.
      const [firstNgModuleRef, secondNgModuleRef] = await Promise.all([
        platform.bootstrapModule(TestModule),
        platform.bootstrapModule(TestModule)
      ]);

      // `TestComponent` that belongs to the first application.
      const firstTestComponent: ComponentRef<TestComponent> = firstNgModuleRef.injector.get(
        ApplicationRef
      ).components[0];

      // `TestComponent` that belongs to the second application.
      const secondTestComponent: ComponentRef<TestComponent> = secondNgModuleRef.injector.get(
        ApplicationRef
      ).components[0];

      subscriptions.push(
        firstTestComponent.instance.countries$.subscribe(countries => {
          firstAppCountries.push(countries);
        })
      );

      subscriptions.push(
        secondTestComponent.instance.countries$.subscribe(countries => {
          secondAppCountries.push(countries);
        })
      );

      const firstStore = firstTestComponent.injector.get(Store);
      const secondStore = secondTestComponent.injector.get(Store);

      firstStore.dispatch(new AddCountry('Spain'));
      secondStore.dispatch(new AddCountry('Portugal'));

      // Let's ensure that different states are updated independently.
      expect(firstAppCountries).toEqual([
        ['Mexico', 'USA', 'Canada'],
        ['Mexico', 'USA', 'Canada', 'Spain']
      ]);

      expect(secondAppCountries).toEqual([
        ['Mexico', 'USA', 'Canada'],
        ['Mexico', 'USA', 'Canada', 'Portugal']
      ]);

      // Let's destroy the first app and ensure that the second app will use its own `Store` instance.
      firstNgModuleRef.destroy();

      secondStore.dispatch(new AddCountry('France'));

      // Let's ensure that the first state hasn't been updated since the first app was destroyed.
      expect(firstAppCountries).toEqual([
        ['Mexico', 'USA', 'Canada'],
        ['Mexico', 'USA', 'Canada', 'Spain']
      ]);

      expect(secondAppCountries).toEqual([
        ['Mexico', 'USA', 'Canada'],
        ['Mexico', 'USA', 'Canada', 'Portugal'],
        ['Mexico', 'USA', 'Canada', 'Portugal', 'France']
      ]);

      // Let's subscribe to the `firstCountry$` thus it will call `createSelectObservable()`.
      // Previously it would've thrown an error that `store` is `null` on the `SelectFactory`,
      // since `store` is set to `null` in `SelectFactory.ngOnDestroy`.
      const firstCountry = await secondTestComponent.instance.firstCountry$
        .pipe(take(1))
        .toPromise();

      expect(firstCountry).toEqual('Mexico');

      while (subscriptions.length) {
        subscriptions.pop()!.unsubscribe();
      }
    })
  );
});
