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
  }

  @State<StateModel>({
    name: 'counter',
    defaults: {
      foo: 'Hello',
      bar: 'World'
    }
  })
  class MyStore {}

  @Component({
    selector: 'my-component-0',
    template: ''
  })
  class StringSelectComponent {
    @Select('counter') state: Observable<StateModel>;
  }

  @Component({
    selector: 'my-component-1',
    template: ''
  })
  class StoreSelectComponent {
    @Select(MyStore) state: Observable<StateModel>;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MyStore])],
      declarations: [StringSelectComponent, StoreSelectComponent]
    });
  });

  it('should select the correct state using string', () => {
    const comp = TestBed.createComponent(StoreSelectComponent);

    comp.componentInstance.state.subscribe(state => {
      expect(state.foo).toBe('Hello');
      expect(state.bar).toBe('World');
    });
  });

  it('should select the correct state using a store class', () => {
    const comp = TestBed.createComponent(StringSelectComponent);

    comp.componentInstance.state.subscribe(state => {
      expect(state.foo).toBe('Hello');
      expect(state.bar).toBe('World');
    });
  });
});
