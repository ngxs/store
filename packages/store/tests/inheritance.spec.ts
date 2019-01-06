import { TestBed } from '@angular/core/testing';

import { Store } from '../src/store';
import { State } from '../src/decorators/state';
import { NgxsModule } from '../src/module';

describe('Inheritance @State', () => {
  interface MyStateModel {
    value: string;
  }

  @State<string>({
    name: 'child_a',
    defaults: 'child_a'
  })
  class MyChildAState {}

  @State<string>({
    name: 'child_b',
    defaults: 'child_b'
  })
  class MyChildBState {}

  @State<MyStateModel>({
    name: 'a',
    defaults: { value: 'a' },
    children: [MyChildAState]
  })
  class MyState {}

  @State<MyStateModel>({
    name: 'b',
    children: [MyChildBState]
  })
  class MyOtherState extends MyState {}

  it('should be correct inheritance default meta data', () => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MyState, MyOtherState, MyChildAState, MyChildBState])]
    });

    const store = TestBed.get(Store);
    const state = store.selectSnapshot(MyState);
    const otherState = store.selectSnapshot(MyOtherState);

    expect(state).toEqual({ value: 'a', child_a: 'child_a' });
    expect(otherState).toEqual({ value: 'a', child_b: 'child_b' });
  });
});
