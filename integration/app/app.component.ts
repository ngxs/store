import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup
} from '@angular/forms';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { TodoState } from '@integration/store/todos/todo/todo.state';
import { TodosState } from '@integration/store/todos/todos.state';
import { AddTodo, RemoveTodo } from '@integration/store/todos/todo/todo.actions';
import { LoadData, SetPrefix } from '@integration/store/todos/todos.actions';
import { Pizza } from '@integration/store/todos/todos.model';
import { Extras } from '@integration/app.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  public allExtras: Extras[];
  public pizzaForm: FormGroup;
  @Select(TodoState) public todos$: Observable<string[]>;
  @Select(TodoState.pandas) public pandas$: Observable<string[]>;
  @Select(TodosState.pizza) public pizza$: Observable<Pizza>;

  constructor(private store: Store, private formBuilder: FormBuilder) {}

  public get extras(): AbstractControl[] {
    return (<FormArray>this.pizzaForm.get('extras')).controls;
  }

  private get extrasControls(): FormControl[] {
    return this.allExtras.map((extra: Extras) => this.formBuilder.control(extra.selected));
  }

  private static getAllExtras(): Extras[] {
    return [
      { name: 'cheese', selected: false },
      { name: 'mushrooms', selected: false },
      { name: 'olives', selected: false }
    ];
  }

  public ngOnInit(): void {
    this.allExtras = AppComponent.getAllExtras();
    this.pizzaForm = this.createPizzaForm();
    this.addTodoByOnInit();
  }

  public addTodo(todo: string) {
    this.store.dispatch(new AddTodo(todo));
  }

  public removeTodo(index: number) {
    this.store.dispatch(new RemoveTodo(index)).subscribe(() => {
      console.log('Removed!');
    });
  }

  public onSubmit() {
    this.pizzaForm.patchValue({ toppings: 'olives' });
  }

  public onPrefix() {
    this.store.dispatch(new SetPrefix());
  }

  public onLoadData() {
    this.store.dispatch(new LoadData());
  }

  private createPizzaForm(): FormGroup {
    return this.formBuilder.group({
      toppings: [''],
      crust: [{ value: 'thin', disabled: true }],
      extras: this.formBuilder.array(this.extrasControls)
    });
  }

  private addTodoByOnInit() {
    const payload = 'ngOnInit todo';
    const state: string[] = this.store.selectSnapshot(TodoState);
    if (!state.includes(payload)) {
      this.store.dispatch(new AddTodo(payload));
    }
  }
}
