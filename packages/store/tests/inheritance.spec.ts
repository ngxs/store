import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Store } from '../src/store';
import { State } from '../src/decorators/state';
import { NgxsModule } from '../src/module';
import { Action, StateContext } from '../src/public_api';

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

  it("should create a new action handler for child and change it's value when the scope refers to this state", async () => {
    class ChangeValue {
      static type = 'Change Value';
    }

    const newValue = 'new value';
    @Injectable()
    class AbstractState {
      @Action(ChangeValue, { newActionHandlerForChild: true })
      changeValue(context: StateContext<MyStateModel>) {
        return context.patchState({ value: newValue });
      }

      @Action(ChangeValue)
      changeValue2(context: StateContext<MyStateModel>) {
        return context.patchState({ value: newValue });
      }
    }

    const child1 = {
      name: 'child1',
      value: 'child value 1'
    };
    @State<MyStateModel>({
      name: child1.name,
      defaults: {
        value: child1.value
      }
    })
    @Injectable()
    class Child1State extends AbstractState {}

    const child2 = {
      name: 'child2',
      value: 'child value 2'
    };
    @State<MyStateModel>({
      name: child2.name,
      defaults: {
        value: child2.value
      }
    })
    @Injectable()
    class Child2State extends AbstractState {}

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([Child1State, Child2State])]
    });

    const store = TestBed.inject(Store);

    await store.dispatch(ChangeValue, { scope: Child1State });

    expect(store.snapshot()).toEqual({
      [child1.name]: {
        value: newValue
      },
      [child2.name]: {
        value: child2.value
      }
    });
  });

  it('should run to both of the children state', async () => {
    interface AbstractStateModel extends MyStateModel {
      value2: string;
    }

    class ChangeValue {
      static type = 'Change Value';
    }

    const newValue1 = 'new value from handler 1';
    const newValue2 = 'new value from handler 2';
    @Injectable()
    class AbstractState {
      @Action(ChangeValue, { newActionHandlerForChild: true })
      changeValue(context: StateContext<AbstractStateModel>) {
        return context.patchState({ value: newValue1 });
      }

      @Action(ChangeValue)
      changeValue2(context: StateContext<AbstractStateModel>) {
        return context.patchState({ value2: newValue2 });
      }
    }

    const child1 = {
      name: 'child1',
      value: 'child1 value1',
      value2: 'child1 value2'
    };
    @State<AbstractStateModel>({
      name: child1.name,
      defaults: {
        value: child1.value,
        value2: child1.value2
      }
    })
    @Injectable()
    class Child1State extends AbstractState {}

    const child2 = {
      name: 'child2',
      value: 'child2 value1',
      value2: 'child2 value2'
    };
    @State<AbstractStateModel>({
      name: child2.name,
      defaults: {
        value: child2.value,
        value2: child2.value2
      }
    })
    @Injectable()
    class Child2State extends AbstractState {}

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([Child1State, Child2State])]
    });

    const store = TestBed.inject(Store);

    await store.dispatch(ChangeValue);

    expect(store.snapshot()).toEqual({
      [child1.name]: {
        value: child1.value,
        value2: newValue2
      },
      [child2.name]: {
        value: child2.value,
        value2: newValue2
      }
    });
  });
});
