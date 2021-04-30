import { APP_BASE_HREF } from '@angular/common';
import {
  ApplicationRef,
  Component,
  ComponentRef,
  Injectable,
  NgModule,
  NgZone,
  ɵivyEnabled,
  ɵglobal
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { RouterModule, Router } from '@angular/router';
import { Action, NgxsModule, Select, Selector, State, StateContext, Store } from '@ngxs/store';
import { freshPlatform } from '@ngxs/store/internals/testing';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

describe('Select decorator returning state from the wrong store during SSR (https://github.com/ngxs/store/issues/1646)', () => {
  if (!ɵivyEnabled) {
    throw new Error('This test requires Ivy to be enabled.');
  }

  class AddCountry {
    static type = '[Countries] Add country';
    constructor(public country: string) {}
  }

  @State({
    name: 'countries',
    defaults: ['Mexico', 'USA', 'Canada']
  })
  @Injectable()
  class CountriesState {
    @Selector()
    static getLastCountry(countries: string[]): string {
      return countries[countries.length - 1];
    }

    @Action(AddCountry)
    addCountry(ctx: StateContext<string[]>, action: AddCountry) {
      ctx.setState(state => [...state, action.country]);
    }
  }

  describe('Declarations (directives, components and pipes)', () => {
    it(
      'different apps should use its own Store instances',
      freshPlatform(async () => {
        // Arrange
        @Component({ selector: 'app-root', template: '' })
        class TestComponent {
          @Select(CountriesState) countries$!: Observable<string[]>;
          @Select(CountriesState.getLastCountry) lastCountry$!: Observable<string>;
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

        // Act
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

        // Let's subscribe to the `lastCountry$` thus it will call `createSelectObservable()`.
        // Previously it would've thrown an error that `store` is `null` on the `SelectFactory`,
        // since `store` is set to `null` in `SelectFactory.ngOnDestroy`.
        const lastCountry = await secondTestComponent.instance.lastCountry$
          .pipe(take(1))
          .toPromise();

        expect(lastCountry).toEqual('France');

        disposeSubscriptions(subscriptions);
      })
    );
  });

  describe('Injectables', () => {
    it(
      'should use independent states inside root providers',
      freshPlatform(async () => {
        // Arrange
        @Injectable({ providedIn: 'root' })
        class TestService {
          @Select(CountriesState) countries$!: Observable<string[]>;
          @Select(CountriesState.getLastCountry) lastCountry$!: Observable<string>;
        }

        @Component({ selector: 'app-root', template: '' })
        class TestComponent {}

        @NgModule({
          imports: [
            BrowserModule,
            NgxsModule.forRoot([CountriesState], { developmentMode: true })
          ],
          declarations: [TestComponent],
          bootstrap: [TestComponent]
        })
        class TestModule {}

        // Act
        const platform = platformBrowserDynamic();
        const firstAppCountries: string[][] = [];
        const secondAppCountries: string[][] = [];
        const subscriptions: Subscription[] = [];

        const [firstNgModuleRef, secondNgModuleRef] = await Promise.all([
          platform.bootstrapModule(TestModule),
          platform.bootstrapModule(TestModule)
        ]);

        const firstTestService = firstNgModuleRef.injector.get(TestService);
        const secondTestService = secondNgModuleRef.injector.get(TestService);

        subscriptions.push(
          firstTestService.countries$.subscribe(countries => {
            firstAppCountries.push(countries);
          })
        );

        subscriptions.push(
          secondTestService.countries$.subscribe(countries => {
            secondAppCountries.push(countries);
          })
        );

        const firstStore = firstNgModuleRef.injector.get(Store);
        const secondStore = secondNgModuleRef.injector.get(Store);

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

        // Let's subscribe to the `lastCountry$` thus it will call `createSelectObservable()`.
        // Previously it would've thrown an error that `store` is `null` on the `SelectFactory`,
        // since `store` is set to `null` in `SelectFactory.ngOnDestroy`.
        const lastCountry = await secondTestService.lastCountry$.pipe(take(1)).toPromise();

        expect(lastCountry).toEqual('France');

        disposeSubscriptions(subscriptions);
      })
    );

    it(
      'should work inside providers declared in lazy module',
      freshPlatform(async () => {
        // Arrange
        @Injectable()
        class TestService {
          @Select(CountriesState) countries$!: Observable<string[]>;
          @Select(CountriesState.getLastCountry) lastCountry$!: Observable<string>;
        }

        @Component({ selector: 'app-root', template: '<router-outlet></router-outlet>' })
        class TestComponent {}

        @Component({ selector: 'app-child', template: '<h1>child</h1>' })
        class ChildComponent {
          countries$ = this.testService.countries$;
          lastCountry$ = this.testService.lastCountry$;

          constructor(private testService: TestService) {}
        }

        @NgModule({
          imports: [
            RouterModule.forChild([
              {
                path: '',
                component: ChildComponent
              }
            ])
          ],
          declarations: [ChildComponent],
          providers: [TestService]
        })
        class ChildModule {}

        @NgModule({
          imports: [
            BrowserModule,
            RouterModule.forRoot([
              {
                path: 'child',
                loadChildren: async () => ChildModule
              }
            ]),
            NgxsModule.forRoot([CountriesState], { developmentMode: true })
          ],
          declarations: [TestComponent],
          bootstrap: [TestComponent],
          providers: [{ provide: APP_BASE_HREF, useValue: '/' }]
        })
        class TestModule {}

        // Act
        const countries: string[][] = [];
        const { injector } = await platformBrowserDynamic().bootstrapModule(TestModule);
        const ngZone = injector.get(NgZone);
        const router = injector.get(Router);
        const store = injector.get(Store);

        await ngZone.run(() => router.navigateByUrl('/child'));
        expect(document.body.innerHTML).toContain('<h1>child</h1>');

        const childComponent: ChildComponent = ɵglobal.ng.getComponent(
          document.querySelector('app-child')
        );

        const subscription = childComponent.countries$.subscribe(
          countries.push.bind(countries)
        );

        store.dispatch(new AddCountry('Spain'));

        expect(countries).toEqual([
          ['Mexico', 'USA', 'Canada'],
          ['Mexico', 'USA', 'Canada', 'Spain']
        ]);

        subscription.unsubscribe();
      })
    );
  });
});

function disposeSubscriptions(subscriptions: Subscription[]): void {
  while (subscriptions.length) {
    subscriptions.pop()!.unsubscribe();
  }
}
