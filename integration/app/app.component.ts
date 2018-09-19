import { Component, ViewEncapsulation } from '@angular/core';
import { Dispatch, Select, Store, DispatchEmitter } from '@ngxs/store';
import { Observable } from 'rxjs';
import { FormArray, FormBuilder } from '@angular/forms';

import { AddTodo, LoadData, RemoveTodo, SetPrefix, TodosState, TodoState } from './todo.state';
import { CounterState, CounterStateModel } from './counter.state';
import { AppState } from './app.state';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
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
  @Select(CounterState)
  count$: Observable<CounterStateModel>;
  @Dispatch(CounterState.setValue)
  counterValue: DispatchEmitter<number>;

  isLoading = false;

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

  onPrefix() {
    this.store.dispatch(new SetPrefix());
  }

  onLoadData() {
    this.store.dispatch(new LoadData());
  }

  counterClear() {
    this.store
      .emitter<number, AppState>(CounterState.setValue)
      .emit(0)
      .subscribe(({ counter }) => {
        console.log('Clear!', 'Current counter state: ', counter);
      });
  }

  loadCountData() {
    this.isLoading = true;
    this.store
      .emitter(CounterState.loadData)
      .emit()
      .subscribe(() => (this.isLoading = false));
  }
}
