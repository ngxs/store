import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Store, provideStore } from '@ngxs/store';
import { withNgxsFormPlugin } from '@ngxs/form-plugin';
import { take } from 'rxjs/operators';

import { AppComponent } from './app.component';
import { Pizza, Todo } from './store/todos/todos.model';
import { TodosState } from './store/todos/todos.state';
import { TodoState } from './store/todos/todo/todo.state';

describe('AppComponent', () => {
  describe('observable', () => {
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
      component = fixture.componentInstance;

      // reset store because of storage plugin
      const store = TestBed.inject(Store);
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

    it('should set toppings using form control', fakeAsync(async () => {
      fixture.detectChanges();
      await fixture.whenStable();

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

    it('should set toppings prefix', fakeAsync(async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      component.pizzaForm.patchValue({ toppings: 'cheese' });
      tick(100);
      component.onPrefix();
      let flag = false;
      tick(100);

      component.pizza$.pipe(take(1)).subscribe((pizza: Pizza) => {
        flag = true;
        expect(pizza.model).toBeDefined();
        expect(pizza.model.toppings).toBe('Mr. cheese');
        expect(pizza.model.crust).toBe('thin');
      });

      expect(flag).toBe(true);
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

  describe('signal', () => {
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
      component = fixture.componentInstance;

      // reset store because of storage plugin
      const store = TestBed.inject(Store);
      store.reset(initialState);
    });

    it('should add a todo', () => {
      component.addTodo('Get Milk');
      component.addTodo('Clean Bathroom');

      expect(component.todos().length).toEqual(2);
    });

    it('should remove a todo', () => {
      component.addTodo('Get Milk');
      component.addTodo('Clean Bathroom');
      component.removeTodo(1);

      const todos = component.todos();
      expect(todos.length).toEqual(1);
      expect(todos[0]).toEqual('Get Milk');
    });

    it('should set toppings using form control', fakeAsync(async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      component.pizzaForm.patchValue({ toppings: 'oli' });
      tick(200);

      let pizza: Pizza;
      pizza = component.pizza();

      expect(pizza.model.toppings).toBe('oli');
      expect(pizza.model.crust).toBe('thin');

      component.pizzaForm.patchValue({ toppings: 'olives', crust: 'thick' });
      tick(200);

      pizza = component.pizza();
      expect(pizza.model.toppings).toBe('olives');
      expect(pizza.model.crust).toBe('thick');
    }));

    it('should set toppings prefix', fakeAsync(async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      component.pizzaForm.patchValue({ toppings: 'cheese' });
      tick(100);
      component.onPrefix();
      tick(100);

      const pizza = component.pizza();
      expect(pizza.model).toBeDefined();
      expect(pizza.model.toppings).toBe('Mr. cheese');
      expect(pizza.model.crust).toBe('thin');
    }));

    it('should load data in pizza form', () => {
      component.onLoadData();

      const pizza = component.pizza();

      expect(pizza.model.toppings).toBe('pineapple');
      expect(pizza.model.crust).toBe('medium');
      expect(pizza.model.extras).toEqual([false, false, true]);
    });
  });
});
