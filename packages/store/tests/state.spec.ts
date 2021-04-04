import {
  AfterViewInit,
  ApplicationRef,
  Component,
  Injectable,
  NgModule,
  OnInit
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import {
  BrowserModule,
  ɵBrowserDomAdapter as BrowserDomAdapter
} from '@angular/platform-browser';

import { InitState, UpdateState } from '../src/actions/actions';
import { Action, NgxsModule, NgxsOnInit, State, StateContext, Store } from '../src/public_api';
import { META_KEY, NgxsAfterBootstrap } from '../src/symbols';
import { simplePatch } from '../src/internal/state-operators';

describe('State', () => {
  it('describes correct name', () => {
    @State({
      name: 'moo'
    })
    @Injectable()
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
    @Injectable()
    class BarState {
      @Action(Eat)
      eat() {}
    }

    @State({
      name: 'bar2'
    })
    @Injectable()
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
      @Injectable()
      class MyState {}

      (<any>window)['foo'] = MyState; // to help with unread warning
    } catch (err) {
      message = err.message;
    }

    expect(message).toEqual(
      'bar-foo is not a valid state name. It needs to be a valid object property name.'
    );
  });

  it('should throw when state parameters are not passed', () => {
    try {
      @State(null!)
      @Injectable()
      class MyOtherState {}

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([MyOtherState])]
      });
    } catch ({ message }) {
      expect(message).toEqual(`States must register a 'name' property.`);
    }
  });

  describe('given the ngxsOnInit lifecycle method is present', () => {
    it('should call the ngxsOnInit method on root module initialisation', () => {
      const listener: string[] = [];

      @State<number>({
        name: 'foo',
        defaults: 0
      })
      @Injectable()
      class FooState implements NgxsOnInit {
        ngxsOnInit() {
          listener.push('onInit');
        }
      }

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([FooState])]
      });

      TestBed.inject(FooState);

      expect(listener).toEqual(['onInit']);
    });

    it('should call the ngxsOnInit method on feature module initialisation', () => {
      @State<string[]>({
        name: 'foo',
        defaults: []
      })
      @Injectable()
      class FooState implements NgxsOnInit {
        ngxsOnInit(ctx: StateContext<string[]>) {
          ctx.setState([...ctx.getState(), 'onInit']);
        }
      }

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([]), NgxsModule.forFeature([FooState])]
      });

      TestBed.inject(FooState);

      expect(TestBed.inject(Store).snapshot().foo).toEqual(['onInit']);
    });

    it('should call an InitState action handler before the ngxsOnInit method on root module initialisation', () => {
      @State<string[]>({
        name: 'foo',
        defaults: []
      })
      @Injectable()
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

      TestBed.inject(FooState);

      expect(TestBed.inject(Store).snapshot().foo).toEqual(['initState', 'onInit']);
    });

    it('should call an UpdateState action handler with multiple states', () => {
      const expectedStates = { foo: ['test'], bar: 'baz', qux: { key: 'value' } };

      @State<any>({
        name: 'eager',
        defaults: []
      })
      @Injectable()
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
      @Injectable()
      class FooState {}

      @State<string>({
        name: 'bar',
        defaults: expectedStates.bar
      })
      @Injectable()
      class BarState {}

      @State<any>({
        name: 'qux',
        defaults: expectedStates.qux
      })
      @Injectable()
      class QuxState {}

      TestBed.configureTestingModule({
        imports: [
          NgxsModule.forRoot([EagerState]),
          NgxsModule.forFeature([FooState, BarState, QuxState])
        ]
      });

      expect(TestBed.inject(Store).snapshot().eager).toEqual(expectedStates);
    });

    it('should call an UpdateState action handler before the ngxsOnInit method on feature module initialisation', () => {
      @State<string[]>({
        name: 'foo',
        defaults: []
      })
      @Injectable()
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

      TestBed.inject(FooState);

      expect(TestBed.inject(Store).snapshot().foo).toEqual(['updateState', 'onInit']);
    });
  });

  describe('ngxsAfterBootstrap" lifecycle hook', () => {
    function createRootNode(selector = 'app-root'): void {
      const document = TestBed.inject(DOCUMENT);
      const adapter = new BrowserDomAdapter();
      const root = adapter.createElement(selector);
      document.body.appendChild(root);
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
      @State({
        name: 'foo'
      })
      @Injectable()
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

      MockModule.ngDoBootstrap(TestBed.inject(ApplicationRef));

      expect(hooks).toEqual([
        LifecycleHooks.NgxsOnInit,
        LifecycleHooks.NgOnInit,
        LifecycleHooks.NgAfterViewInit,
        LifecycleHooks.NgxsAfterBootstrap
      ]);
    });

    it('should invoke "ngxsAfterBootstrap" for feature states', () => {
      @State({
        name: 'fooFeature'
      })
      @Injectable()
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

      MockModule.ngDoBootstrap(TestBed.inject(ApplicationRef));

      expect(hooks).toEqual([
        LifecycleHooks.NgxsOnInit,
        LifecycleHooks.NgOnInit,
        LifecycleHooks.NgAfterViewInit,
        LifecycleHooks.NgxsAfterBootstrap
      ]);
    });
  });

  describe('simple patch', () => {
    it('should be correct patch object', () => {
      interface Simple {
        a: number;
        b: number;
      }

      const simple: Simple = { a: 1, b: 2 };

      expect(simplePatch({ a: 3 })(simple)).toEqual({ a: 3, b: 2 });
      expect(simplePatch(null!)(simple)).toEqual({ a: 1, b: 2 });
    });

    it('should be correct when patched null to null', () => {
      expect(simplePatch(null!)(null!)).toEqual({});
    });

    it('should avoid the whole check if you want own properties only', () => {
      function Origin() {
        // @ts-ignore
        this.x = `I'm an own property`;
      }

      Origin.prototype.y = `I'm not an own property`;

      // @ts-ignore
      const patcher: typeof Origin & Origin = new Origin();

      expect(patcher.x).toEqual(`I'm an own property`);
      expect(patcher.y).toEqual(`I'm not an own property`);

      const existingState: any = {};
      const resultState: any = simplePatch(patcher)(existingState);

      expect(resultState.x).toEqual(`I'm an own property`);
      expect(resultState.y).toEqual(`I'm not an own property`);
    });

    it('should throw exception if value is array', () => {
      try {
        const simple: string[] = ['hello'];
        simplePatch(['world'])(simple);
      } catch (e) {
        expect(e.message).toEqual('Patching arrays is not supported.');
      }
    });

    it('should throw exception if value is primitive', () => {
      try {
        simplePatch('one')('two');
      } catch (e) {
        expect(e.message).toEqual('Patching primitives is not supported.');
      }
    });

    it('should throw exception if value is lambda', () => {
      try {
        const lambda: any = () => {};
        console.log(simplePatch(lambda)({}));
      } catch (e) {
        expect(e.message).toEqual('Patching primitives is not supported.');
      }
    });
  });
});
