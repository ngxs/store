import { async, TestBed } from '@angular/core/testing';
import { State } from '@ngxs/store';
import { Store } from '../src/store';
import { NgxsModule } from '../src/module';
import { Selector } from '../src/selector';

describe('Selector', () => {
  @State<any>({
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
  }

  @State<any>({
    name: 'zoo',
    defaults: {
      foo: 'Hello',
      bar: 'World'
    }
  })
  class MyState2 {
    @Selector([MyState.foo])
    static foo(myState2, myState) {
      return myState2.foo + myState;
    }
  }

  class MetaSelector {
    @Selector([MyState.foo])
    static foo(myState) {
      return myState;
    }
  }

  it('should select the state', async(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MyState])]
    });

    const store: Store = TestBed.get(Store);
    const slice = store.selectSnapshot(MyState.foo);
    expect(slice).toBe('Hello');
  }));

  it('should select using the meta selector', async(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MyState])]
    });

    const store: Store = TestBed.get(Store);
    const slice = store.selectSnapshot(MetaSelector.foo);
    expect(slice).toBe('Hello');
  }));

  it('should still be usable as a function', async(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MyState])]
    });

    const store: Store = TestBed.get(Store);
    const myState = store.selectSnapshot(<any>MyState);
    const slice = MyState.foo(myState);
    expect(slice).toBe('Hello');
  }));

  it('should select multiples', async(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MyState, MyState2])]
    });

    const store: Store = TestBed.get(Store);
    const slice = store.selectSnapshot(MyState2.foo);
    expect(slice).toBe('HelloHello');
  }));
});
