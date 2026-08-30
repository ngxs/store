import { getActionTypeFromInstance } from '@ngxs/store';

describe('getActionTypeFromInstance', () => {
  it('reads the static type from an action class instance', () => {
    class AddTodo {
      static readonly type = '[Todos] Add';
    }

    expect(getActionTypeFromInstance(new AddTodo())).toBe('[Todos] Add');
  });

  it('reads the type from the action class itself', () => {
    class AddTodo {
      static readonly type = '[Todos] Add';
    }

    expect(getActionTypeFromInstance(AddTodo)).toBe('[Todos] Add');
  });

  it('falls back to a plain object action `type`', () => {
    expect(getActionTypeFromInstance({ type: '[Todos] Add' })).toBe('[Todos] Add');
  });

  it('returns undefined when there is no type', () => {
    class NoType {}

    expect(getActionTypeFromInstance(new NoType())).toBeUndefined();
    expect(getActionTypeFromInstance({})).toBeUndefined();
  });

  it('keeps the per-class cache separate for different action classes', () => {
    class AddTodo {
      static readonly type = '[Todos] Add';
    }
    class RemoveTodo {
      static readonly type = '[Todos] Remove';
    }

    // Resolve `AddTodo` first so it is cached, then make sure `RemoveTodo`
    // still resolves to its own type and not the cached one.
    expect(getActionTypeFromInstance(new AddTodo())).toBe('[Todos] Add');
    expect(getActionTypeFromInstance(new RemoveTodo())).toBe('[Todos] Remove');
    expect(getActionTypeFromInstance(new AddTodo())).toBe('[Todos] Add');
  });

  it('does not cache against Object for plain object actions', () => {
    expect(getActionTypeFromInstance({ type: 'first' })).toBe('first');
    expect(getActionTypeFromInstance({ type: 'second' })).toBe('second');
  });
});
