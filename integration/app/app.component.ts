import { Component, ViewEncapsulation } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { FormArray, FormBuilder } from '@angular/forms';

import { AddTodo, LoadData, RemoveTodo, SetPrefix, TodosState, TodoState } from './todo.state';

@Component({
  selector: 'app-root',
  template: `
    <div class="todo-list">
      <div>
        <h3>Reactive Form</h3>
        <form [formGroup]="pizzaForm" novalidate (ngSubmit)="onSubmit()" ngxsForm="todos.pizza">
          Toppings: <input type="text" formControlName="toppings"/>
          <br>
          Crust <input type="text" formControlName="crust"/>
          <br>
          Extras
          <span *ngFor='let extra of extras; let i=index'>
              <input type='checkbox' [formControl]='extra'/> {{allExtras[i].name}}
            </span>
          <br>
          <hr>
          <button type="submit">Set Olives</button>
          <button type="button" (click)="onPrefix()">Set Prfix</button>
          <button type="button" (click)="onLoadData()">Load Data</button>
        </form>
      </div>
      <br><br>
      <div>
      <h3>Save Form with Button click</h3>
      <form [formGroup]="savingForm" novalidate (ngSubmit)="saveForm()" ngxsForm="todos.pizza" [ngxsFormStoreOn]="saveRequests$">
        Toppings: <input type="text" formControlName="toppings"/>
        <br>
        Crust <input type="text" formControlName="crust"/>
        <br>
        Extras
        <span *ngFor='let extra of extras; let i=index'>
              <input type='checkbox' [formControl]='extra'/> {{allExtras[i].name}}
            </span>
        <br>
        <hr>
        <button type="submit">Save</button>
      </form>
    </div>
      <br><br>
      <hr>
      <h3>Todo Form</h3>
      <div class="add-todo">
        <input placeholder="New Todo" #text>
        <button (click)="addTodo(text.value)">Add</button>
      </div>
      <ul>
        <li class="todo" *ngFor="let todo of todos$ | async; let i = index">
          {{todo}}
          <button (click)="removeTodo(i)">🗑</button>
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
  @Select(TodoState)
  todos$: Observable<string[]>;
  @Select(TodoState.pandas)
  pandas$: Observable<string[]>;
  @Select(TodosState.pizza)
  pizza$: Observable<any>;

  allExtras = [
    { name: 'cheese', selected: false },
    { name: 'mushrooms', selected: false },
    { name: 'olives', selected: false }
  ];

  pizzaForm = this.formBuilder.group({
    toppings: [''],
    crust: [{ value: 'thin', disabled: true }],
    extras: this.createExtras()
  });

  savingForm = this.formBuilder.group({
    toppings: [''],
    crust: [{ value: 'thin', disabled: true }],
    extras: this.createExtras()
  });

  saveRequests$ = new Subject<void>();

  constructor(private store: Store, private formBuilder: FormBuilder) {}

  addTodo(todo: string) {
    this.store.dispatch(new AddTodo(todo));
  }

  removeTodo(index: number) {
    this.store.dispatch(new RemoveTodo(index)).subscribe(() => {
      console.log('Removed!');
    });
  }

  createExtras() {
    const arr = this.allExtras.map(extra => {
      return this.formBuilder.control(extra.selected);
    });
    return this.formBuilder.array(arr);
  }

  get extras() {
    const ctl: FormArray = <FormArray>this.pizzaForm.get('extras');
    return ctl.controls;
  }

  onSubmit() {
    this.pizzaForm.patchValue({
      toppings: 'olives'
    });
  }

  saveForm() {
    this.saveRequests$.next();
  }

  onPrefix() {
    this.store.dispatch(new SetPrefix());
  }

  onLoadData() {
    this.store.dispatch(new LoadData());
  }
}
