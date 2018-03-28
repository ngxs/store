import { Component, ViewEncapsulation } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { UpdateFormDirty } from '@ngxs/form-plugin';
import { Observable } from 'rxjs/Observable';
import { FormBuilder } from '@angular/forms';
import { AddTodo, RemoveTodo, TodoState, SetPrefix } from './todo.state';

@Component({
  selector: 'app-root',
  template: `
    <div class="todo-list">
      <div>
        <h3>Reactive Form</h3>
        <form [formGroup]="pizzaForm" novalidate (ngSubmit)="onSubmit()" ngxsForm="todos.pizza">
            <input type="text" formControlName="toppings" />
            <br><hr>
            <button type="submit">set Dirty false</button>
            <button type="button" (click)="onPrefix()">Set Prfix</button>
        </form>
      </div>

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

  pizzaForm = this.formBuilder.group({
    toppings: ['']
  });

  constructor(private store: Store, private formBuilder: FormBuilder) {}

  addTodo(todo: string) {
    this.store.dispatch(new AddTodo(todo));
  }

  removeTodo(index: number) {
    this.store.dispatch(new RemoveTodo(index)).subscribe(() => {
      console.log('Removed!');
    });
  }

  onSubmit() {
    this.store.dispatch(
      new UpdateFormDirty({
        dirty: false,
        path: 'todos.pizza'
      })
    );
  }

  onPrefix() {
    this.store.dispatch(new SetPrefix());
  }
}
