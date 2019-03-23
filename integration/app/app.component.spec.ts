import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ComponentFixtureAutoDetect, discardPeriodicTasks } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { take } from 'rxjs/operators';
import { Store } from '@ngxs/store';

import { AppComponent } from '@integration/app.component';
import { AppModule } from '@integration/app.module';
import { Pizza, Todo } from '@integration/store/todos/todos.model';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  const initialState = {
    todos: {
      todo: [],
      pizza: { model: undefined }
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppModule, RouterTestingModule, FormsModule, ReactiveFormsModule],
      providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }]
    });

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    // reset store because of storage plugin
    const store = TestBed.get(Store);
    store.reset(initialState);
  });

  it('should add a todo', () => {
    component.addTodo('Get Milk');
    component.addTodo('Clean Bathroom');

    component.todos$.subscribe((state: Todo[]) => {
      expect(state.length).toBe(2);
    });
  });

  it('should remove a todo', () => {
    component.addTodo('Get Milk');
    component.addTodo('Clean Bathroom');
    component.removeTodo(1);

    component.todos$.subscribe((state: Todo[]) => {
      expect(state.length).toBe(1);
      expect(state[0]).toBe('Get Milk');
    });
  });

  it('should set toppings using form control', fakeAsync(() => {
    component.pizzaForm.patchValue({ toppings: 'oli' });
    tick(200);
    let flag = false;

    component.pizza$.pipe(take(1)).subscribe((pizza: Pizza) => {
      flag = true;
      expect(pizza.model.toppings).toBe('oli');
      expect(pizza.model.crust).toBe('thin');
    });

    expect(flag).toBe(true);

    component.pizzaForm.patchValue({ toppings: 'olives', crust: 'thick' });
    tick(200);
    flag = false;

    component.pizza$.pipe(take(1)).subscribe((pizza: Pizza) => {
      flag = true;
      expect(pizza.model.toppings).toBe('olives');
      expect(pizza.model.crust).toBe('thick');
    });

    expect(flag).toBe(true);
  }));

  it('should set toppings prefix', fakeAsync(() => {
    component.pizzaForm.patchValue({ toppings: 'cheese' });
    tick(200);
    component.onPrefix();
    let flag = false;
    tick(200);

    component.pizza$.pipe(take(1)).subscribe((pizza: Pizza) => {
      flag = true;
      expect(pizza.model).toBeDefined();
      expect(pizza.model.toppings).toBe('Mr. cheese');
      expect(pizza.model.crust).toBe('thin');
    });

    expect(flag).toBe(true);
    discardPeriodicTasks();
  }));

  it('should load data in pizza form', () => {
    component.onLoadData();
    let flag = false;

    component.pizza$.pipe(take(1)).subscribe((pizza: Pizza) => {
      flag = true;
      expect(pizza.model.toppings).toBe('pineapple');
      expect(pizza.model.crust).toBe('medium');
      expect(pizza.model.extras).toEqual([false, false, true]);
    });

    expect(flag).toBe(true);
  });
});
