import { NgxsModule, Selector, State, StateToken, Store } from '@ngxs/store';
import { TestBed } from '@angular/core/testing';
import { Component, Injectable } from '@angular/core';
import { take } from 'rxjs/operators';
import { Observable } from 'rxjs';

describe('[TEST]: StateToken', () => {
  describe('Simple use', function () {
    it('should successfully create a simple token', () => {
      const TODO_TOKEN = new StateToken<string>('todo');
      expect(TODO_TOKEN).toBeInstanceOf(StateToken);
      expect(TODO_TOKEN.getName()).toEqual('todo');
      expect(TODO_TOKEN.toString()).toEqual('StateToken[todo]');
    });
  });

  describe('Integration', () => {
    async function setup() {
      const TODO_LIST_TOKEN = new StateToken<string[]>('todoList');

      @State<string[]>({
        name: TODO_LIST_TOKEN,
        defaults: ['hello', 'world']
      })
      @Injectable()
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
        template: '{{ myState$ | async | json }}'
      })
      class MyComponent {
        myState$: Observable<string[]> = this.storeApp.select(TODO_LIST_TOKEN);

        constructor(public storeApp: Store) {}
      }

      await TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([TodoListState])],
        declarations: [MyComponent]
      }).compileComponents();

      const fixture = TestBed.createComponent(MyComponent);
      fixture.autoDetectChanges();

      return { fixture, TODO_LIST_TOKEN, TodoListState };
    }

    it('should successfully create store', async () => {
      // Arrange
      const { fixture, TODO_LIST_TOKEN, TodoListState } = await setup();

      // Assert
      const store: Store = fixture.componentInstance.storeApp;
      expect(store.selectSnapshot(TodoListState.todos)).toEqual(['hello', 'world']);
      expect(store.selectSnapshot(TodoListState.first)).toEqual('hello');

      expect(fixture.debugElement.nativeElement.innerHTML.replace(/\s+/g, '')).toContain(
        `["hello","world"]`
      );

      expect(store.selectSnapshot(TODO_LIST_TOKEN)).toEqual(['hello', 'world']);

      // Act
      const selectResult: string[] = await store
        .select(TODO_LIST_TOKEN)
        .pipe(take(1))
        .toPromise();
      // Assert
      expect(selectResult).toEqual(['hello', 'world']);

      // Act
      const selectOnceResult: string[] = await store.selectOnce(TODO_LIST_TOKEN).toPromise();
      // Assert
      expect(selectOnceResult).toEqual(['hello', 'world']);
    });
  });
});
