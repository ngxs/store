import { Mutation } from '../mutation';
import { Store } from '../store';
import { ensureStoreMetadata } from '../internals';
import { TestBed } from '@angular/core/testing';
import { Ngxs } from '../ngxs';
import { NgxsModule } from '../module';

describe('Mutation', () => {
  let ngxs: Ngxs;

  class AddTodo {
    constructor(public readonly payload: string) {}
  }

  @Store({
    name: 'todos',
    defaults: []
  })
  class TodoStore {
    @Mutation(AddTodo)
    addTodo(state, action: AddTodo) {
      return [...state, action.payload];
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([TodoStore])]
    });

    ngxs = TestBed.get(Ngxs);
  });

  it('supports multiple actions', () => {
    class Mutation1 {}
    class Mutation2 {}

    @Store({})
    class BarStore {
      @Mutation([Mutation1, Mutation2])
      foo(state) {
        state.foo = false;
      }
    }

    const meta = ensureStoreMetadata(BarStore);
    expect(meta.mutations['Mutation1']).toBeDefined();
    expect(meta.mutations['Mutation2']).toBeDefined();
  });

  xit('should add a todo', () => {
    ngxs.dispatch(new AddTodo('Get Milk'));

    ngxs.select(state => state.todos).subscribe(state => {
      expect(state.length).toBe(1);
    });
  });
});
