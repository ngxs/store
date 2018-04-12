import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentFixtureAutoDetect, discardPeriodicTasks } from '@angular/core/testing';
import { take, last } from 'rxjs/operators';

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
    fakeAsync(() => {
      component.pizzaForm.patchValue({ toppings: 'oli' });

      tick(200);
      component.pizza$.pipe(take(1)).subscribe((pizza: any) => {
        expect(pizza.model.toppings).toBe('oli');
        expect(pizza.model.crust).toBe('thin');
      });
      component.pizzaForm.patchValue({ toppings: 'olives', crust: 'thick' });
      tick(200);
      component.pizza$.pipe(take(1)).subscribe((pizza: any) => {
        expect(pizza.model.toppings).toBe('olives');
        expect(pizza.model.crust).toBe('thick');
      });
      discardPeriodicTasks();
    })
  );

  it('should set toppings prefix', () => {
    component.setValue('cheese');
    component.onPrefix();
    component.pizza$.pipe(last()).subscribe((pizza: any) => {
      expect(pizza.model.toppings).toBe('Mr. cheese');
      expect(pizza.model.crust).toBe('thin');
    });
  });
});
