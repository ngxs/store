import { TestBed, ComponentFixture } from '@angular/core/testing';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { APP_BASE_HREF } from '@angular/common';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppModule],
      providers: [{ provide: APP_BASE_HREF, useValue: '/' }]
    });

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should add a todo', () => {
    component.addTodo('Get Milk');

    component.todos$.subscribe(state => {
      expect(state.length).toBe(1);
    });
  });

  it('should remove a todo', () => {
    component.addTodo('Get Milk');
    component.addTodo('Clean Bathroom');
    component.removeTodo(0);

    component.todos$.subscribe(state => {
      expect(state.length).toBe(1);
      expect(state[0]).toBe('Get Milk');
    });
  });
});
