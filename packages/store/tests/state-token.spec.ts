import { NgxsModule, Select, Selector, State, StateToken, Store } from '@ngxs/store';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Injectable } from '@angular/core';
import { take } from 'rxjs/operators';
import { Observable } from 'rxjs';

describe('[TEST]: StateToken', () => {
  describe('Simple use', function() {
    it('should successfully create a simple token', () => {
      const TODO_TOKEN = new StateToken<string>('todo');
      expect(TODO_TOKEN).toBeInstanceOf(StateToken);
      expect(TODO_TOKEN.getName()).toEqual('todo');
      expect(TODO_TOKEN.toString()).toEqual('StateToken[todo]');
    });
  });

  describe('Integration', () => {
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
      @Select(TODO_LIST_TOKEN)
      myState$: Observable<string[]>;

      constructor(public storeApp: Store) {}
    }

    let fixture: ComponentFixture<MyComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([TodoListState])],
        declarations: [MyComponent]
      })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(MyComponent);
          fixture.autoDetectChanges();
        });
    });

    it('should successfully create store', async () => {
      const store: Store = fixture.componentInstance.storeApp;
      expect(store.selectSnapshot(TodoListState.todos)).toEqual(['hello', 'world']);
      expect(store.selectSnapshot(TodoListState.first)).toEqual('hello');

      expect(fixture.debugElement.nativeElement.innerHTML.replace(/\s+/g, '')).toContain(
        `["hello","world"]`
      );

      expect(store.selectSnapshot(TODO_LIST_TOKEN)).toEqual(['hello', 'world']);

      const selectResult: string[] = await store
        .select(TODO_LIST_TOKEN)
        .pipe(take(1))
        .toPromise();
      expect(selectResult).toEqual(['hello', 'world']);

      const selectOnceResult: string[] = await store.selectOnce(TODO_LIST_TOKEN).toPromise();
      expect(selectOnceResult).toEqual(['hello', 'world']);
    });
  });
});
