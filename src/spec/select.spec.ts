import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { NgxsModule } from '../module';
import { Select } from '../select';
import { State } from '../state';

describe('Select', () => {
  interface StateModel {
    foo: string;
    bar: string;
    subProperty?: SubStateModel;
  }

  interface SubStateModel {
    hello: boolean;
    world: boolean;
  }

  @State<SubStateModel>({
    name: 'boo',
    defaults: {
      hello: true,
      world: true
    }
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
  }

  @Component({
    selector: 'my-component-1',
    template: ''
  })
  class StoreSelectComponent {
    @Select(MyState) state: Observable<StateModel>;
    @Select(MySubState) subState: Observable<SubStateModel>;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MyState, MySubState])],
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
  });
});
