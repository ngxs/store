import { Component } from '@angular/core';
import { Ngxs, Select } from 'ngxs';
import { Observable } from 'rxjs/Observable';

import { AddTodo, RemoveTodo } from './todo.store';

@Component({
  selector: 'app-root',
  template: `
    <input placeholder="New Todo" #text>

    <button (click)="addTodo(text.value)">Add</button>

    <ul>
      <li *ngFor="let todo of todos$ | async; let i = index">
        {{todo}} <button (click)="removeTodo(i)">remove</button>
      </li>
    </ul>
  `
})
export class AppComponent {
  @Select(state => state.todos)
  todos$: Observable<string[]>;

  constructor(private ngxs: Ngxs) {}

  addTodo(todo: string) {
    this.ngxs.dispatch(new AddTodo(todo));
  }

  removeTodo(index: number) {
    this.ngxs.dispatch(new RemoveTodo(index));
  }
}
