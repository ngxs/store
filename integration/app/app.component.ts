import {
  FormArray,
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { ChangeDetectionStrategy, Component, OnInit, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngxs/store';
import { NgxsFormDirective } from '@ngxs/form-plugin';
import { Observable } from 'rxjs';

import { TodoState } from '@integration/store/todos/todo/todo.state';
import { TodosState } from '@integration/store/todos/todos.state';
import { AddTodo, RemoveTodo } from '@integration/store/todos/todo/todo.actions';
import { LoadData, SetPrefix } from '@integration/store/todos/todos.actions';
import { Extras, Pizza, Todo } from '@integration/store/todos/todos.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, NgxsFormDirective]
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

  todos$: Observable<Todo[]> = this._store.select(TodoState.getTodoState);
  todos: Signal<Todo[]> = this._store.selectSignal(TodoState.getTodoState);

  pandas$: Observable<Todo[]> = this._store.select(TodoState.getPandas);
  pandas: Signal<Todo[]> = this._store.selectSignal(TodoState.getPandas);

  pizza$: Observable<Pizza> = this._store.select(TodosState.getPizza);
  pizza: Signal<Pizza> = this._store.selectSignal(TodosState.getPizza);

  injected$: Observable<string> = this._store.select(TodosState.getInjected);
  injected: Signal<string> = this._store.selectSignal(TodosState.getInjected);

  constructor(
    private _store: Store,
    private _fb: FormBuilder
  ) {}

  get extras(): FormControl[] {
    const extras = this.pizzaForm.get('extras') as FormArray;
    return extras.controls as FormControl[];
  }

  private get _extrasControls(): FormControl[] {
    return this.allExtras.map((extra: Extras) => this._fb.control(extra.selected));
  }

  ngOnInit(): void {
    const payload: Todo = 'ngOnInit todo';
    const state: Todo[] = this._store.selectSnapshot(TodoState.getTodoState);
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
