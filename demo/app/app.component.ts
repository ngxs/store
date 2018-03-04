import { Component } from '@angular/core';
import { Ngxs } from 'ngxs';

import { AddTodo, RemoveTodo } from './stores/todo.store';

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
  todos$ = this.ngxs.select(state => state.todos);

  constructor(private ngxs: Ngxs) {}

  addTodo(todo: string) {
    this.ngxs.dispatch(new AddTodo(todo));
  }

  removeTodo(index: number) {
    this.ngxs.dispatch(new RemoveTodo(index));
  }
}
