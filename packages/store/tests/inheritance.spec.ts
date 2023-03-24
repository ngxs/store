import { TestBed } from '@angular/core/testing';

import { Store } from '../src/store';
import { State } from '../src/decorators/state';
import { NgxsModule } from '../src/module';
import { Injectable } from '@angular/core';

describe('Inheritance @State', () => {
  interface MyStateModel {
    value: string;
  }

  it('should be correct inheritance default meta data', () => {
    @State<string>({
      name: 'child_a',
      defaults: 'child_a'
    })
    @Injectable()
    class MyChildAState {}

    @State<string>({
      name: 'child_b',
      defaults: 'child_b'
    })
    @Injectable()
    class MyChildBState {}

    @State<MyStateModel>({
      name: 'a',
      defaults: { value: 'a' },
      children: [MyChildAState]
    })
    @Injectable()
    class MyState {}

    @State<MyStateModel>({
      name: 'b',
      children: [MyChildBState]
    })
    @Injectable()
    class MyOtherState extends MyState {}

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MyState, MyOtherState, MyChildAState, MyChildBState])]
    });

    const store = TestBed.inject(Store);
    const state = store.selectSnapshot(MyState);
    const otherState = store.selectSnapshot(MyOtherState);

    expect(state).toEqual({ value: 'a', child_a: 'child_a' });
    expect(otherState).toEqual({ value: 'a', child_b: 'child_b' });
  });

  it('should be correct first inherited without other states [CHARACTERIZATION]', () => {
    @State<MyStateModel>({
      name: 'child',
      defaults: { value: 'child_value' }
    })
    @Injectable()
    class MyChildState {}

    @State<MyStateModel>({
      name: '_',
      defaults: { value: 'shared_value' },
      children: [MyChildState]
    })
    @Injectable()
    class SharedState {}

    @State<MyStateModel>({
      name: 'first',
      children: [MyChildState]
    })
    @Injectable()
    class FirstState extends SharedState {}

    @State<MyStateModel>({ name: 'second' })
    @Injectable()
    class SecondState extends SharedState {}

    @State<MyStateModel>({ name: 'third' })
    @Injectable()
    class ThirdState extends SharedState {}

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([FirstState, MyChildState, SecondState, ThirdState])]
    });

    const store = TestBed.inject(Store);

    expect(store.snapshot()).toEqual({
      first: {
        value: 'shared_value',
        child: { value: 'child_value' }
      },
      second: {
        value: 'shared_value'
      },
      third: {
        value: 'shared_value'
      }
    });
  });
});
