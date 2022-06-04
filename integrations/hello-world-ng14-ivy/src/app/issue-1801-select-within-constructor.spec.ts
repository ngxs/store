import {
  Component,
  Injectable,
  NgModule,
  ɵivyEnabled,
  Directive,
  Pipe,
  PipeTransform,
  OnInit
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { freshPlatform } from '@ngxs/store/internals/testing';
import { Action, NgxsModule, Select, Selector, State, StateContext } from '@ngxs/store';
import { Observable } from 'rxjs';

describe('@Select() decorated property is used within a constructor (https://github.com/ngxs/store/issues/1801)', () => {
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

  it(
    'should be possible to use @Select() decorated properties within constructors',
    freshPlatform(async () => {
      // Arrange
      const recorder: string[] = [];

      const enum Type {
        Pipe = 'pipe',
        Directive = 'directive',
        Component = 'component',
        NgModule = 'ngModule',
        RootProvider = 'rootProvider',
        ComponentProvider = 'componentProvider'
      }

      const enum Hook {
        Constructor = 'constructor',
        NgOnInit = 'ngOnInit'
      }

      function record(type: Type, hook: Hook, propertyName: string): void {
        const value = `${type}:${hook}:${propertyName}`;
        if (recorder.indexOf(value) === -1) {
          recorder.push(value);
        }
      }

      const countries = 'countries$';
      const lastCountry = 'lastCountry$';

      interface Recordable {
        [countries]: Observable<string[]>;
        [lastCountry]: Observable<string>;
      }

      function startRecording(ctx: Recordable, type: Type, hook: Hook): void {
        ctx[countries].subscribe(() => {
          record(type, hook, countries);
        });

        ctx[lastCountry].subscribe(() => {
          record(type, hook, lastCountry);
        });
      }

      @Injectable({ providedIn: 'root' })
      class TestRootProvider implements Recordable {
        @Select(CountriesState) [countries]!: Observable<string[]>;
        @Select(CountriesState.getLastCountry) [lastCountry]!: Observable<string>;

        constructor() {
          startRecording(this, Type.RootProvider, Hook.Constructor);
        }
      }

      @Injectable()
      class TestComponentProvider implements Recordable {
        @Select(CountriesState) [countries]!: Observable<string[]>;
        @Select(CountriesState.getLastCountry) [lastCountry]!: Observable<string>;

        constructor() {
          startRecording(this, Type.ComponentProvider, Hook.Constructor);
        }
      }

      @Pipe({ name: 'testPipe' })
      class TestPipe implements PipeTransform, Recordable {
        @Select(CountriesState) [countries]!: Observable<string[]>;
        @Select(CountriesState.getLastCountry) [lastCountry]!: Observable<string>;

        constructor() {
          startRecording(this, Type.Pipe, Hook.Constructor);
        }

        transform() {
          return 'TestPipe';
        }
      }

      @Directive({ selector: '[testDirective]' })
      class TestDirective implements OnInit, Recordable {
        @Select(CountriesState) [countries]!: Observable<string[]>;
        @Select(CountriesState.getLastCountry) [lastCountry]!: Observable<string>;

        constructor() {
          startRecording(this, Type.Directive, Hook.Constructor);
        }

        ngOnInit(): void {
          startRecording(this, Type.Directive, Hook.NgOnInit);
        }
      }

      @Component({
        selector: 'app-root',
        template: `
          <div testDirective>{{ '' | testPipe }}</div>
        `,
        providers: [TestComponentProvider]
      })
      class TestComponent implements OnInit, Recordable {
        @Select(CountriesState) [countries]!: Observable<string[]>;
        @Select(CountriesState.getLastCountry) [lastCountry]!: Observable<string>;

        constructor(
          testRootProvider: TestRootProvider,
          testComponentProvider: TestComponentProvider
        ) {
          startRecording(this, Type.Component, Hook.Constructor);
        }

        ngOnInit(): void {
          startRecording(this, Type.Component, Hook.NgOnInit);
        }
      }

      @NgModule({
        imports: [
          BrowserModule,
          NgxsModule.forRoot([CountriesState], { developmentMode: true })
        ],
        declarations: [TestComponent, TestDirective, TestPipe],
        bootstrap: [TestComponent]
      })
      class TestModule {
        @Select(CountriesState) [countries]!: Observable<string[]>;
        @Select(CountriesState.getLastCountry) [lastCountry]!: Observable<string>;

        constructor() {
          startRecording(this, Type.NgModule, Hook.Constructor);
        }
      }

      // Act
      await platformBrowserDynamic().bootstrapModule(TestModule);

      // Assert
      expect(recorder).toEqual([
        'ngModule:constructor:countries$',
        'ngModule:constructor:lastCountry$',
        'rootProvider:constructor:countries$',
        'rootProvider:constructor:lastCountry$',
        'componentProvider:constructor:countries$',
        'componentProvider:constructor:lastCountry$',
        'component:constructor:countries$',
        'component:constructor:lastCountry$',
        'directive:constructor:countries$',
        'directive:constructor:lastCountry$',
        'pipe:constructor:countries$',
        'pipe:constructor:lastCountry$',
        'component:ngOnInit:countries$',
        'component:ngOnInit:lastCountry$',
        'directive:ngOnInit:countries$',
        'directive:ngOnInit:lastCountry$'
      ]);
    })
  );
});
