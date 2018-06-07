import { async, TestBed } from '@angular/core/testing';
import { State, SelectorCreator } from '@ngxs/store';
import { Store } from '../src/store';
import { NgxsModule } from '../src/module';
import { Selector } from '../src/selector';

describe('SelectorCreator', () => {
  interface MyStateModel {
    foo: string;
    bar: string;
  }

  @State<MyStateModel>({
    name: 'counter',
    defaults: {
      foo: 'Hello',
      bar: 'World'
    }
  })
  class MyState {
    @Selector()
    static foo(state) {
      return state.foo;
    }

    @SelectorCreator()
    static getStateKey(key: keyof MyStateModel) {
      return (state: MyStateModel) => state[key];
    }
  }

  interface MyState2Model {
    foo: string;
    bar: string;
  }

  @State<MyState2Model>({
    name: 'zoo',
    defaults: {
      foo: 'Hello',
      bar: 'World'
    }
  })
  class MyState2 {
    @Selector([MyState.getStateKey('bar')])
    static foo(myState2: MyState2Model, bar: string) {
      return myState2.foo + bar;
    }
  }

  class MetaSelector {
    @Selector([MyState.getStateKey('foo')])
    static foo(myState) {
      return myState;
    }

    @SelectorCreator([MyState2.foo])
    static concatFooState2(text: string) {
      return (foo: string) => foo + text;
    }
  }

  it('should select the state', async(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MyState])]
    });

    const store: Store = TestBed.get(Store);
    const slice = store.selectSnapshot(MyState.foo);
    expect(slice).toBe('Hello');

    const slice2 = store.selectSnapshot(MyState.getStateKey('foo'));
    expect(slice2).toBe('Hello');

    const slice3 = store.selectSnapshot(MyState.getStateKey('bar'));
    expect(slice3).toBe('World');
  }));

  it('should select using the meta selector', async(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MyState, MyState2])]
    });

    const store: Store = TestBed.get(Store);
    const slice = store.selectSnapshot(MetaSelector.foo);
    expect(slice).toBe('Hello');

    const slice2 = store.selectSnapshot(MetaSelector.concatFooState2('!'));
    expect(slice2).toBe('HelloWorld!');
  }));

  it('should still be usable as a function', async(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MyState])]
    });

    const store: Store = TestBed.get(Store);
    const myState = store.selectSnapshot(<any>MyState);
    const slice = MyState.getStateKey('foo')(myState);
    expect(slice).toBe('Hello');
  }));
});
