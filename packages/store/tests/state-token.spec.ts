import { State, NgxsModule, Selector, Store, Select } from '@ngxs/store';
import { StateToken } from '../src/state-token/state-token';
import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';

describe('[TEST]: StateToken', () => {
  describe('Simple use', function() {
    it('should be create simple state token', () => {
      const TODO_TOKEN = StateToken.create<string>('todo');
      expect(TODO_TOKEN).toBeInstanceOf(StateToken);
      expect(TODO_TOKEN.name).toEqual('todo');
      expect(TODO_TOKEN.toString()).toEqual('todo');
    });

    it('should be singleton', () => {
      let error: string = null!;
      const TODO_TOKEN = StateToken.create<string>('todo');
      expect(TODO_TOKEN).toBeInstanceOf(StateToken);

      try {
        StateToken.create<string>('todo');
      } catch (e) {
        error = e.message;
      }

      expect(error).toEqual('StateToken todo is already initialized');
    });

    it('should be correct inject by string token', () => {
      const injectedToken = StateToken.inject<string>('name');
      expect(injectedToken).toEqual(null);

      const TODO_TOKEN = StateToken.create<string>('todo');
      expect(TODO_TOKEN).toBeInstanceOf(StateToken);

      const injectedTodoToken = StateToken.inject<string>('todo');
      expect(injectedTodoToken === TODO_TOKEN).toBeTruthy();
    });

    it('should be correct inject by class token', () => {
      @State({
        name: 'invalid'
      })
      class MyState {}

      const injectedToken = StateToken.inject<string>(MyState);
      expect(injectedToken).toEqual(null);

      const TODO_TOKEN = StateToken.create<string>('todo');

      @State({
        name: TODO_TOKEN
      })
      class TodoState {}

      const todoInjectedToken = StateToken.inject<string>(TodoState);
      expect(todoInjectedToken === TODO_TOKEN).toBeTruthy();
    });
  });

  describe('Integration', () => {
    it('should be create store', async () => {
      const TODO_LIST_TOKEN = StateToken.create<string[]>('todoList');

      @State<string[]>({
        name: TODO_LIST_TOKEN,
        defaults: ['hello', 'world']
      })
      class TodoListState {
        @Selector([TODO_LIST_TOKEN])
        static todos(state: string[]) {
          return state;
        }

        @Selector([TODO_LIST_TOKEN])
        static first(state: string[]): string {
          return state.slice().shift()!;
        }
      }

      @Component({
        selector: 'myApp',
        template: '{{ myState | async | json }}'
      })
      class MyComponent {
        @Select(TODO_LIST_TOKEN)
        public myState: Observable<string[]>;

        constructor(public storeApp: Store) {}
      }

      await TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([TodoListState])],
        declarations: [MyComponent]
      }).compileComponents();

      const fixture = TestBed.createComponent(MyComponent);
      fixture.autoDetectChanges();

      const store: Store = fixture.componentInstance.storeApp;
      expect(store.selectSnapshot(TodoListState.todos)).toEqual(['hello', 'world']);
      expect(store.selectSnapshot(TodoListState.first)).toEqual('hello');

      expect(fixture.debugElement.nativeElement.innerHTML.replace(/\s+/g, '')).toContain(
        `["hello","world"]`
      );

      expect(store.selectSnapshot(TODO_LIST_TOKEN)).toEqual(['hello', 'world']);
    });
  });

  afterEach(() => StateToken.clear());
});
