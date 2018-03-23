import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { Store } from '../store';
import { NgxsModule } from '../module';
import { Select } from '../select';
import { State } from '../state';
import { Action } from '../action';
import { last, first } from 'rxjs/operators';

describe('Select', () => {
  interface SubSubStateModel {
    name: string;
  }

  interface SubStateModel {
    hello: boolean;
    world: boolean;
    subSubProperty?: SubSubStateModel;
  }

  interface StateModel {
    foo: string;
    bar: string;
    subProperty?: SubStateModel;
  }

  class FooIt {}

  @State<SubSubStateModel>({
    name: 'baz',
    defaults: {
      name: 'Danny'
    }
  })
  class MySubSubState {}

  @State<SubStateModel>({
    name: 'boo',
    defaults: {
      hello: true,
      world: true
    },
    children: [MySubSubState]
  })
  class MySubState {}

  @State<StateModel>({
    name: 'counter',
    defaults: {
      foo: 'Hello',
      bar: 'World'
    },
    children: [MySubState]
  })
  class MyState {
    @Action(FooIt)
    fooIt({ setState }) {
      setState({ foo: 'bar' });
    }
  }

  const states = [MySubState, MySubSubState, MyState];

  it('should select the correct state using string', () => {
    @Component({
      selector: 'my-component-0',
      template: ''
    })
    class StringSelectComponent {
      @Select('counter') state: Observable<StateModel>;
      @Select('counter.boo') subState: Observable<SubStateModel>;
      @Select('counter.boo.baz') subSubState: Observable<SubSubStateModel>;
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot(states)],
      declarations: [StringSelectComponent]
    });

    const comp = TestBed.createComponent(StringSelectComponent);

    comp.componentInstance.state.subscribe(state => {
      expect(state.foo).toBe('Hello');
      expect(state.bar).toBe('World');
    });

    comp.componentInstance.subState.subscribe(state => {
      expect(state.hello).toBe(true);
      expect(state.world).toBe(true);
    });

    comp.componentInstance.subSubState.subscribe(state => {
      expect(state.name).toBe('Danny');
    });
  });

  it('should select the correct state using a state class', () => {
    @Component({
      selector: 'my-component-1',
      template: ''
    })
    class StoreSelectComponent {
      @Select(MyState) state: Observable<StateModel>;
      @Select(MySubState) subState: Observable<SubStateModel>;
      @Select(MySubSubState) subSubState: Observable<SubSubStateModel>;
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot(states)],
      declarations: [StoreSelectComponent]
    });

    const comp = TestBed.createComponent(StoreSelectComponent);

    comp.componentInstance.state.subscribe(state => {
      expect(state.foo).toBe('Hello');
      expect(state.bar).toBe('World');
    });

    comp.componentInstance.subState.subscribe(state => {
      expect(state.hello).toBe(true);
      expect(state.world).toBe(true);
    });

    comp.componentInstance.subSubState.subscribe(state => {
      expect(state.name).toBe('Danny');
    });
  });

  it('should select the correct state using a function', () => {
    @Component({
      selector: 'my-component-1',
      template: ''
    })
    class StoreSelectComponent {
      @Select(state => state.counter.foo)
      counter$: Observable<string>;
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot(states)],
      declarations: [StoreSelectComponent]
    });

    const comp = TestBed.createComponent(StoreSelectComponent);

    comp.componentInstance.counter$.subscribe(state => {
      expect(state).toBe('Hello');
    });
  });

  it('should select the correct state after timeout', () => {
    @Component({
      selector: 'my-component-1',
      template: ''
    })
    class StoreSelectComponent {
      @Select(state => state.counter.foo)
      counter$: Observable<string>;

      constructor(store: Store) {
        setTimeout(() => {
          store.dispatch(new FooIt());
        }, 500);
      }
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot(states)],
      declarations: [StoreSelectComponent]
    });

    const comp = TestBed.createComponent(StoreSelectComponent);

    comp.componentInstance.counter$.pipe(first()).subscribe(state2 => {
      expect(state2).toBe('Hello');
    });

    comp.componentInstance.counter$.pipe(last()).subscribe(state2 => {
      expect(state2).toBe('bar');
    });
  });
});
