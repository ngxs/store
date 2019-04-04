import { TestBed } from '@angular/core/testing';
import { Component, ApplicationRef, NgModule, OnInit, AfterViewInit } from '@angular/core';
import {
  ɵDomAdapter as DomAdapter,
  ɵBrowserDomAdapter as BrowserDomAdapter,
  BrowserModule,
  DOCUMENT
} from '@angular/platform-browser';

import { InitState, UpdateState } from '../src/actions/actions';
import { Action, NgxsModule, NgxsOnInit, State, StateContext, Store } from '../src/public_api';

import { META_KEY, NgxsAfterBootstrap } from '../src/symbols';
import { StoreValidators } from '../src/utils/store-validators';

describe('State', () => {
  it('describes correct name', () => {
    @State({
      name: 'moo'
    })
    class BarState {}

    const meta = (<any>BarState)[META_KEY];

    expect(meta.name).toBe('moo');
  });

  it('handles extending', () => {
    class Eat {
      static type = 'EAT';
    }

    class Drink {
      static type = 'DRINK';
    }

    @State({
      name: 'bar'
    })
    class BarState {
      @Action(Eat)
      eat() {}
    }

    @State({
      name: 'bar2'
    })
    class Bar2State extends BarState {
      @Action(Drink)
      drink() {}
    }

    const meta = (<any>Bar2State)[META_KEY];
    expect(meta.actions[Eat.type]).toBeDefined();
    expect(meta.actions[Drink.type]).toBeDefined();
  });

  it('should throw an error on invalid names', () => {
    let message = '';

    try {
      @State({
        name: 'bar-foo'
      })
      class MyState {}

      (<any>window)['foo'] = MyState; // to help with unread warning
    } catch (err) {
      message = err.message;
    }

    expect(message).toBe(StoreValidators.stateNameErrorMessage('bar-foo'));
  });

  describe('given the ngxsOnInit lifecycle method is present', () => {
    it('should call the ngxsOnInit method on root module initialisation', () => {
      const listener: string[] = [];

      @State<number>({
        name: 'foo',
        defaults: 0
      })
      class FooState implements NgxsOnInit {
        ngxsOnInit(stateContext: StateContext<number>) {
          listener.push('onInit');
        }
      }

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([FooState])]
      });

      TestBed.get(FooState);

      expect(listener).toEqual(['onInit']);
    });

    it('should call the ngxsOnInit method on feature module initialisation', () => {
      @State<string[]>({
        name: 'foo',
        defaults: []
      })
      class FooState implements NgxsOnInit {
        ngxsOnInit(ctx: StateContext<string[]>) {
          ctx.setState([...ctx.getState(), 'onInit']);
        }
      }

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([]), NgxsModule.forFeature([FooState])]
      });

      TestBed.get(FooState);

      expect(TestBed.get(Store).snapshot().foo).toEqual(['onInit']);
    });

    it('should call an InitState action handler before the ngxsOnInit method on root module initialisation', () => {
      @State<string[]>({
        name: 'foo',
        defaults: []
      })
      class FooState implements NgxsOnInit {
        ngxsOnInit(ctx: StateContext<string[]>) {
          ctx.setState([...ctx.getState(), 'onInit']);
        }

        @Action(InitState)
        initState(ctx: StateContext<string[]>) {
          ctx.setState([...ctx.getState(), 'initState']);
        }
      }

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([FooState])]
      });

      TestBed.get(FooState);

      expect(TestBed.get(Store).snapshot().foo).toEqual(['initState', 'onInit']);
    });

    it('should call an UpdateState action handler with multiple states', () => {
      const expectedStates = { foo: ['test'], bar: 'baz', qux: { key: 'value' } };

      @State<any>({
        name: 'eager',
        defaults: []
      })
      class EagerState {
        @Action(UpdateState)
        updateState(ctx: StateContext<any[]>, action: UpdateState) {
          ctx.setState({ ...ctx.getState(), ...action.addedStates });
        }
      }

      @State<string[]>({
        name: 'foo',
        defaults: expectedStates.foo
      })
      class FooState {}

      @State<string>({
        name: 'bar',
        defaults: expectedStates.bar
      })
      class BarState {}

      @State<any>({
        name: 'qux',
        defaults: expectedStates.qux
      })
      class QuxState {}

      TestBed.configureTestingModule({
        imports: [
          NgxsModule.forRoot([EagerState]),
          NgxsModule.forFeature([FooState, BarState, QuxState])
        ]
      });

      expect(TestBed.get(Store).snapshot().eager).toEqual(expectedStates);
    });

    it('should call an UpdateState action handler before the ngxsOnInit method on feature module initialisation', () => {
      @State<string[]>({
        name: 'foo',
        defaults: []
      })
      class FooState implements NgxsOnInit {
        ngxsOnInit(ctx: StateContext<string[]>) {
          ctx.setState([...ctx.getState(), 'onInit']);
        }

        @Action(InitState)
        initState(ctx: StateContext<string[]>) {
          ctx.setState([...ctx.getState(), 'initState']);
        }

        @Action(UpdateState)
        updateState(ctx: StateContext<string[]>) {
          ctx.setState([...ctx.getState(), 'updateState']);
        }
      }

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([]), NgxsModule.forFeature([FooState])]
      });

      TestBed.get(FooState);

      expect(TestBed.get(Store).snapshot().foo).toEqual(['updateState', 'onInit']);
    });
  });

  describe('"ngxsAfterBootstrap" lifecycle hook', () => {
    function createRootNode(selector = 'app-root'): void {
      const document = TestBed.get(DOCUMENT);
      const adapter: DomAdapter = new BrowserDomAdapter();

      const root = adapter.firstChild(
        adapter.content(adapter.createTemplate(`<${selector}></${selector}>`))
      );

      const oldRoots = adapter.querySelectorAll(document, selector);
      oldRoots.forEach(oldRoot => adapter.remove(oldRoot));

      adapter.appendChild(document.body, root);
    }

    const enum LifecycleHooks {
      NgOnInit = 'ngOnInit',
      NgxsOnInit = 'ngxsOnInit',
      NgAfterViewInit = 'ngAfterViewInit',
      NgxsAfterBootstrap = 'ngxsAfterBootstrap'
    }

    let hooks: LifecycleHooks[] = [];

    @Component({
      selector: 'app-root',
      template: ''
    })
    class MockComponent implements OnInit, AfterViewInit {
      public ngOnInit(): void {
        hooks.push(LifecycleHooks.NgOnInit);
      }

      public ngAfterViewInit(): void {
        hooks.push(LifecycleHooks.NgAfterViewInit);
      }
    }

    @NgModule({
      imports: [BrowserModule],
      declarations: [MockComponent],
      entryComponents: [MockComponent]
    })
    class MockModule {
      public static ngDoBootstrap(app: ApplicationRef): void {
        createRootNode();
        app.bootstrap(MockComponent);
      }
    }

    beforeEach(() => (hooks = []));

    it('should invoke "ngxsAfterBootstrap" after "ngxsOnInit" and after root component\'s "ngAfterViewInit"', () => {
      @State({ name: 'foo' })
      class FooState implements NgxsOnInit, NgxsAfterBootstrap {
        public ngxsOnInit(): void {
          hooks.push(LifecycleHooks.NgxsOnInit);
        }

        public ngxsAfterBootstrap(): void {
          hooks.push(LifecycleHooks.NgxsAfterBootstrap);
        }
      }

      TestBed.configureTestingModule({
        imports: [MockModule, NgxsModule.forRoot([FooState])]
      });

      MockModule.ngDoBootstrap(TestBed.get(ApplicationRef));

      expect(hooks).toEqual([
        LifecycleHooks.NgxsOnInit,
        LifecycleHooks.NgOnInit,
        LifecycleHooks.NgAfterViewInit,
        LifecycleHooks.NgxsAfterBootstrap
      ]);
    });

    it('should invoke "ngxsAfterBootstrap" for feature states', () => {
      @State({ name: 'fooFeature' })
      class FooFeatureState implements NgxsOnInit, NgxsAfterBootstrap {
        public ngxsOnInit(): void {
          hooks.push(LifecycleHooks.NgxsOnInit);
        }

        public ngxsAfterBootstrap(): void {
          hooks.push(LifecycleHooks.NgxsAfterBootstrap);
        }
      }

      TestBed.configureTestingModule({
        imports: [MockModule, NgxsModule.forRoot(), NgxsModule.forFeature([FooFeatureState])]
      });

      MockModule.ngDoBootstrap(TestBed.get(ApplicationRef));

      expect(hooks).toEqual([
        LifecycleHooks.NgxsOnInit,
        LifecycleHooks.NgOnInit,
        LifecycleHooks.NgAfterViewInit,
        LifecycleHooks.NgxsAfterBootstrap
      ]);
    });
  });
});
