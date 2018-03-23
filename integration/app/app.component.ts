import { Component, ViewEncapsulation } from '@angular/core';
import { Store, Select } from 'ngxs';
import { Observable } from 'rxjs';

import { AddTodo, RemoveTodo, TodoState } from './todo.state';

@Component({
  selector: 'app-root',
  template: `
    <div class="todo-list">
      <div class="add-todo">
        <input placeholder="New Todo" #text>
        <button (click)="addTodo(text.value)">Add</button>
      </div>
      <ul>
        <li class="todo" *ngFor="let todo of todos$ | async; let i = index">
          {{todo}} <button (click)="removeTodo(i)">🗑</button>
        </li>
        <li *ngFor="let todo of pandas$ | async">
          🐼
        </li>
      </ul>
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  @Select(TodoState) todos$: Observable<string[]>;
  @Select(TodoState.pandas) pandas$: Observable<string[]>;

  constructor(private store: Store) {}

  addTodo(todo: string) {
    this.store.dispatch(new AddTodo(todo));
  }

  removeTodo(index: number) {
    this.store.dispatch(new RemoveTodo(index)).subscribe(() => {
      console.log('Removed!');
    });
  }
}
