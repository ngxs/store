import { State, stateNameErrorMessage } from '../src/state';
import { Action } from '../src/action';
import { META_KEY } from '../src/symbols';

describe('Store', () => {
  it('describes correct name', () => {
    @State({
      name: 'moo'
    })
    class BarState {}

    const meta = BarState[META_KEY];

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
    class BarState {
      @Action(Eat)
      eat() {}
    }

    @State({
      name: 'bar2'
    })
    class Bar2State extends BarState {
      @Action(Drink)
      drink() {}
    }

    const meta = Bar2State[META_KEY];
    expect(meta.actions[Eat.type]).toBeDefined();
    expect(meta.actions[Drink.type]).toBeDefined();
  });

  it('should throw an error on invalid names', () => {
    try {
      @State({
        name: 'bar-foo'
      })
      class MyState {}

      window['foo'] = MyState; // to help with unread warning
    } catch (err) {
      expect(err.message).toBe(stateNameErrorMessage('bar-foo'));
    }
  });
});
