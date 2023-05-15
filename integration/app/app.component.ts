import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { TodoState } from '@integration/store/todos/todo/todo.state';
import { TodosState } from '@integration/store/todos/todos.state';
import { AddTodo, RemoveTodo } from '@integration/store/todos/todo/todo.actions';
import { LoadData, SetPrefix } from '@integration/store/todos/todos.actions';
import { Extras, Pizza, Todo } from '@integration/store/todos/todos.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  readonly allExtras: Extras[] = [
    { name: 'cheese', selected: false },
    { name: 'mushrooms', selected: false },
    { name: 'olives', selected: false }
  ];

  pizzaForm = this._fb.group({
    toppings: [''],
    crust: [{ value: 'thin', disabled: true }],
    extras: this._fb.array(this._extrasControls)
  });

  greeting: string;
  todos$: Observable<Todo[]> = this._store.select(TodoState);
  pandas$: Observable<Todo[]> = this._store.select(TodoState.getPandas);
  pizza$: Observable<Pizza> = this._store.select(TodosState.getPizza);
  injected$: Observable<string> = this._store.select(TodosState.getInjected);

  constructor(private _store: Store, private _fb: FormBuilder) {}

  get extras(): FormControl[] {
    const extras = this.pizzaForm.get('extras') as FormArray;
    return extras.controls as FormControl[];
  }

  private get _extrasControls(): FormControl[] {
    return this.allExtras.map((extra: Extras) => this._fb.control(extra.selected));
  }

  ngOnInit(): void {
    const payload: Todo = 'ngOnInit todo';
    const state: Todo[] = this._store.selectSnapshot(TodoState);
    if (!state.includes(payload)) {
      this._store.dispatch(new AddTodo(payload));
    }
  }

  addTodo(todo: Todo) {
    this._store.dispatch(new AddTodo(todo));
  }

  removeTodo(index: number) {
    this._store.dispatch(new RemoveTodo(index)).subscribe(() => {
      console.log('Removed!');
    });
  }

  onSubmit() {
    this.pizzaForm.patchValue({ toppings: 'olives' });
  }

  onPrefix() {
    this._store.dispatch(new SetPrefix());
  }

  onLoadData() {
    this._store.dispatch(new LoadData());
  }
}
