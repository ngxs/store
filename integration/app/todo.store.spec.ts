import { TestBed } from '@angular/core/testing';
import { NgxsModule, Ngxs } from 'ngxs';

import { TodoStore, AddTodo, RemoveTodo } from './todo.store';

describe('TodoStore', () => {
  let ngxs: Ngxs;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([TodoStore])]
    });

    ngxs = TestBed.get(Ngxs);
  });

  it('should add a todo', () => {
    ngxs.dispatch(new AddTodo('Get Milk'));

    ngxs.select(state => state.todos).subscribe(state => {
      expect(state.length).toBe(1);
    });
  });

  it('should remove a todo', () => {
    ngxs.dispatch(new AddTodo('Get Milk'));
    ngxs.dispatch(new RemoveTodo(0));

    ngxs.select(state => state.todos).subscribe(state => {
      expect(state.length).toBe(0);
    });
  });
});
