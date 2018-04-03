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
      providers: [{provide: ComponentFixtureAutoDetect, useValue: true}]
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

  it('should set toppings using form control', fakeAsync(() => {
    component.pizzaForm.patchValue({ toppings: 'oli' });
    tick(200);
    component.pizza$.pipe(take(1)).subscribe((pizza:any) => {
       expect(pizza.model.toppings).toBe('oli');
    });
    component.pizzaForm.setValue({ toppings: 'olives'});
    tick(200);
    component.pizza$.pipe(take(1)).subscribe((pizza:any) => {
       expect(pizza.model.toppings).toBe('olives');
    });
    discardPeriodicTasks();
  }));

  it('should set toppings prefix', () => {
     component.setValue('cheese');
     component.onPrefix();
     component.pizza$.subscribe((pizza:any) => {
       console.log('pizza ', pizza)
       console.log('pizza.model ', pizza.model)

        expect(pizza.model.toppings).toBe('Mr. cheese');
     });
  });
});
