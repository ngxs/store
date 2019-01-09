import { TestBed } from '@angular/core/testing';
import { Component, ApplicationRef, NgModule } from '@angular/core';
import {
  ɵDomAdapter as DomAdapter,
  ɵBrowserDomAdapter as BrowserDomAdapter,
  BrowserModule,
  DOCUMENT
} from '@angular/platform-browser';

import { InitState, UpdateState } from '../src/actions/actions';
import { Action, NgxsModule, NgxsOnInit, State, StateContext, Store } from '../src/public_api';

import { META_KEY, NgxsAfterBootstrap, NgxsLifeCycle } from '../src/symbols';
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

    @Component({
      selector: 'app-root',
      template: ''
    })
    class MockComponent {}

    function createModule() {
      @NgModule({
        imports: [BrowserModule],
        declarations: [MockComponent],
        entryComponents: [MockComponent]
      })
      class MockModule {}

      return MockModule;
    }

    it('should invoke "ngxsAfterBootstrap" after "ngxsOnInit"', () => {
      const hooks: (keyof NgxsLifeCycle)[] = [];

      @State({ name: 'foo' })
      class FooState implements NgxsOnInit, NgxsAfterBootstrap {
        public ngxsOnInit(): void {
          hooks.push('ngxsOnInit');
        }

        public ngxsAfterBootstrap(): void {
          hooks.push('ngxsAfterBootstrap');
        }
      }

      TestBed.configureTestingModule({
        imports: [createModule(), NgxsModule.forRoot([FooState])]
      });

      const app: ApplicationRef = TestBed.get(ApplicationRef);
      createRootNode();
      app.bootstrap(MockComponent);

      expect(hooks[0]).toBe('ngxsOnInit');
      expect(hooks[1]).toBe('ngxsAfterBootstrap');
    });
  });
});
