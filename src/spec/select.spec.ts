import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { NgxsModule } from '../module';
import { Select } from '../select';
import { State } from '../state';

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
  class MyState {}

  @Component({
    selector: 'my-component-0',
    template: ''
  })
  class StringSelectComponent {
    @Select('counter') state: Observable<StateModel>;
    @Select('counter.boo') subState: Observable<SubStateModel>;
    @Select('counter.boo.baz') subSubState: Observable<SubSubStateModel>;
  }

  @Component({
    selector: 'my-component-1',
    template: ''
  })
  class StoreSelectComponent {
    @Select(MyState) state: Observable<StateModel>;
    @Select(MySubState) subState: Observable<SubStateModel>;
    @Select(MySubSubState) subSubState: Observable<SubSubStateModel>;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MyState, MySubState, MySubSubState])],
      declarations: [StringSelectComponent, StoreSelectComponent]
    });
  });

  it('should select the correct state using string', () => {
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
});
