import { TestBed } from '@angular/core/testing';

import { Ngxs } from '../ngxs';
import { NgxsModule } from '../module';
import { Store } from '../store';
import { Mutation } from '../mutation';

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

  it('should add a todo', () => {
    ngxs.dispatch(new AddTodo('Get Milk'));

    ngxs.select(state => state.todo).subscribe(state => {
      expect(state.length).toBe(1);
    });
  });
});
