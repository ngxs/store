import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Store, provideStore } from '@ngxs/store';
import { withNgxsFormPlugin } from '@ngxs/form-plugin';
import { firstValueFrom, take } from 'rxjs';

import { AppComponent } from './app.component';
import { Pizza, Todo } from './store/todos/todos.model';
import { TodosState } from './store/todos/todos.state';
import { TodoState } from './store/todos/todo/todo.state';

// Every time the state is updated, the primary state signal
// receives updates asynchronously behind the scenes after the
// microtask is executed.
function waitForStateSignalToReceiveUpdate() {
  return Promise.resolve();
}

function waitForFormDebounce(debounce: number) {
  return new Promise(resolve => setTimeout(resolve, debounce));
}

describe('AppComponent', () => {
  describe('observable', () => {
    let fixture: ComponentFixture<AppComponent>;
    let component: AppComponent;
    let store: Store;

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
      expect.assertions(1);

      component.addTodo('Get Milk');
      component.addTodo('Clean Bathroom');

      component.todos$.subscribe((state: Todo[]) => {
        expect(state.length).toBe(2);
      });
    });

    it('should remove a todo', () => {
      expect.assertions(2);

      component.addTodo('Get Milk');
      component.addTodo('Clean Bathroom');
      component.removeTodo(1);

      component.todos$.subscribe((state: Todo[]) => {
        expect(state.length).toBe(1);
        expect(state[0]).toBe('Get Milk');
      });
    });

    it('should set toppings using form control', async () => {
      expect.assertions(6);

      fixture.detectChanges();
      await fixture.whenStable();

      component.pizzaForm.patchValue({ toppings: 'oli' });
      await waitForFormDebounce(component.debounce);

      let flag = false;

      component.pizza$.pipe(take(1)).subscribe((pizza: Pizza) => {
        flag = true;
        expect(pizza.model.toppings).toBe('oli');
        expect(pizza.model.crust).toBe('thin');
      });

      expect(flag).toBe(true);

      component.pizzaForm.patchValue({ toppings: 'olives', crust: 'thick' });
      await waitForFormDebounce(component.debounce);

      flag = false;

      component.pizza$.pipe(take(1)).subscribe((pizza: Pizza) => {
        flag = true;
        expect(pizza.model.toppings).toBe('olives');
        expect(pizza.model.crust).toBe('thick');
      });

      expect(flag).toBe(true);
    });

    it('should set toppings prefix', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      component.pizzaForm.patchValue({ toppings: 'cheese' });
      await waitForFormDebounce(component.debounce);

      component.onPrefix();

      const pizza = await firstValueFrom(component.pizza$);
      expect(pizza.model).toBeDefined();
      expect(pizza.model.toppings).toBe('Mr. cheese');
      expect(pizza.model.crust).toBe('thin');
    });

    it('should load data in pizza form', () => {
      expect.assertions(4);

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

    it('should add a todo', async () => {
      component.addTodo('Get Milk');
      component.addTodo('Clean Bathroom');

      await waitForStateSignalToReceiveUpdate();

      expect(component.todos().length).toEqual(2);
    });

    it('should remove a todo', async () => {
      component.addTodo('Get Milk');
      component.addTodo('Clean Bathroom');
      component.removeTodo(1);

      await waitForStateSignalToReceiveUpdate();

      const todos = component.todos();
      expect(todos.length).toEqual(1);
      expect(todos[0]).toEqual('Get Milk');
    });

    it('should set toppings using form control', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      component.pizzaForm.patchValue({ toppings: 'oli' });
      await waitForFormDebounce(component.debounce);
      await waitForStateSignalToReceiveUpdate();

      let pizza: Pizza;
      pizza = component.pizza();

      expect(pizza.model.toppings).toBe('oli');
      expect(pizza.model.crust).toBe('thin');

      component.pizzaForm.patchValue({ toppings: 'olives', crust: 'thick' });
      await waitForFormDebounce(component.debounce);
      await waitForStateSignalToReceiveUpdate();

      pizza = component.pizza();
      expect(pizza.model.toppings).toBe('olives');
      expect(pizza.model.crust).toBe('thick');
    });

    it('should set toppings prefix', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      component.pizzaForm.patchValue({ toppings: 'cheese' });
      await waitForFormDebounce(component.debounce);

      component.onPrefix();
      await waitForStateSignalToReceiveUpdate();

      const pizza = component.pizza();
      expect(pizza.model).toBeDefined();
      expect(pizza.model.toppings).toBe('Mr. cheese');
      expect(pizza.model.crust).toBe('thin');
    });

    it('should load data in pizza form', async () => {
      component.onLoadData();

      await waitForStateSignalToReceiveUpdate();

      const pizza = component.pizza();

      expect(pizza.model.toppings).toBe('pineapple');
      expect(pizza.model.crust).toBe('medium');
      expect(pizza.model.extras).toEqual([false, false, true]);
    });
  });
});
