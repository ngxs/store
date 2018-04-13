import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentFixtureAutoDetect, discardPeriodicTasks } from '@angular/core/testing';
import { take } from 'rxjs/operators';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppModule, RouterTestingModule, FormsModule, ReactiveFormsModule],
      providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }]
    });

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should add a todo', () => {
    component.addTodo('Get Milk');
    component.addTodo('Clean Bathroom');

    component.todos$.subscribe(state => {
      expect(state.length).toBe(2);
    });
  });

  it('should remove a todo', () => {
    component.addTodo('Get Milk');
    component.addTodo('Clean Bathroom');
    component.removeTodo(1);

    component.todos$.subscribe(state => {
      expect(state.length).toBe(1);
      expect(state[0]).toBe('Get Milk');
    });
    
  });

  it('should set toppings using form control',
    () => {
      component.pizzaForm.patchValue({ toppings: 'oli' });

      let flag = false;
      component.pizza$.pipe(take(1)).subscribe((pizza: any) => {
        flag = true;
        expect(pizza.model.toppings).toBe('oli');
        expect(pizza.model.crust).toBe('thin');
      });
      expect(flag).toBe(true);

      component.pizzaForm.patchValue({ toppings: 'olives', crust: 'thick' });
      flag = false;
      component.pizza$.pipe(take(1)).subscribe((pizza: any) => {
        flag = true;
        expect(pizza.model.toppings).toBe('olives');
        expect(pizza.model.crust).toBe('thick');
      });
      expect(flag).toBe(true);
      
    });

  it('should set toppings prefix', fakeAsync(() => {
    component.pizzaForm.patchValue({ toppings: 'cheese' });
    tick(200);
    component.onPrefix();
    let flag = false;
    tick(200);
    component.pizza$.pipe(take(1)).subscribe((pizza: any) => {
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
    component.pizza$.pipe(take(1)).subscribe((pizza: any) => {
      flag = true;
      expect(pizza.model.toppings).toBe('pineapple');
      expect(pizza.model.crust).toBe('medium');
      expect(pizza.model.extras).toEqual([false, false, true]);
    });
    expect(flag).toBe(true);
  });
});
