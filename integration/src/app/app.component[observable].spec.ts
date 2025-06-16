import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Store, provideStore } from '@ngxs/store';
import { withNgxsFormPlugin } from '@ngxs/form-plugin';
import { firstValueFrom } from 'rxjs';

import { AppComponent } from './app.component';
import { Pizza } from './store/todos/todos.model';
import { TodosState } from './store/todos/todos.state';
import { TodoState } from './store/todos/todo/todo.state';
import { skipConsoleLogging } from '@ngxs/store/internals/testing';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  const initialState = {
    todos: {
      pizza: { model: undefined }
    },
    todo: []
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [provideStore([TodosState, TodoState], withNgxsFormPlugin())]
    });

    fixture = TestBed.createComponent(AppComponent);
    fixture.componentInstance.debounce = -1;
    component = fixture.componentInstance;

    // reset store because of storage plugin
    const store = TestBed.inject(Store);
    store.reset(initialState);
  });

  it('should add a todo', async () => {
    // Arrange & act
    component.addTodo('Get Milk');
    component.addTodo('Clean Bathroom');

    const todos = await firstValueFrom(component.todos$);

    // Assert
    expect(todos.length).toEqual(2);
  });

  it('should remove a todo', () =>
    skipConsoleLogging(async () => {
      // Arrange & act
      component.addTodo('Get Milk');
      component.addTodo('Clean Bathroom');
      component.removeTodo(1);

      const todos = await firstValueFrom(component.todos$);

      // Assert
      expect(todos.length).toBe(1);
      expect(todos[0]).toBe('Get Milk');
    }));

  it('should set toppings using form control', async () => {
    // Arrange
    fixture.detectChanges();
    await fixture.whenStable();

    // Act
    component.pizzaForm.patchValue({ toppings: 'oli' });

    let pizza: Pizza = await firstValueFrom(component.pizza$);

    // Assert
    expect(pizza.model.toppings).toBe('oli');
    expect(pizza.model.crust).toBe('thin');

    // Act
    component.pizzaForm.patchValue({ toppings: 'olives', crust: 'thick' });

    pizza = await firstValueFrom(component.pizza$);

    // Assert
    expect(pizza.model.toppings).toBe('olives');
    expect(pizza.model.crust).toBe('thick');
  });

  it('should set toppings prefix', async () => {
    // Arrange
    fixture.detectChanges();
    await fixture.whenStable();

    // Act
    component.pizzaForm.patchValue({ toppings: 'cheese' });

    component.onPrefix();

    // Assert
    const pizza = await firstValueFrom(component.pizza$);
    expect(pizza.model).toBeDefined();
    expect(pizza.model.toppings).toBe('Mr. cheese');
    expect(pizza.model.crust).toBe('thin');
  });

  it('should load data in pizza form', async () => {
    // Arrange & act
    component.onLoadData();

    // Assert
    const pizza = await firstValueFrom(component.pizza$);
    expect(pizza.model.toppings).toBe('pineapple');
    expect(pizza.model.crust).toBe('medium');
    expect(pizza.model.extras).toEqual([false, false, true]);
  });
});
