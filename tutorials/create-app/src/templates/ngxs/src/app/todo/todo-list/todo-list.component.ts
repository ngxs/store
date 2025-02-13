import { AsyncPipe, JsonPipe, NgForOf, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { select, Select, Store } from '@ngxs/store';
import { TodoItemComponent } from '../components/todo-item/todo-item.component';
import { TodoSelectors } from '../store/todo.queries';
import { TodoModel } from '../types/todo';
import { signal } from '@angular/core';
import { TodoState } from '../store/todo.state';
@Component({
  selector: 'app-todo',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
  standalone: true,
  imports: [
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatCheckboxModule,
    FormsModule,
    AsyncPipe,
    NgForOf,
    NgTemplateOutlet,
    TodoItemComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoListComponent {
  private _store = inject(Store);

  completeTodoItems: Signal<TodoModel[]> = signal([
    {
      id: 1,
      title: 'Learn Angular',
      completed: true
    },
    {
      id: 2,
      title: 'Learn NGXS',
      completed: true
    },
    {
      id: 3,
      title: 'Learn NGXS Store',
      completed: true
    },
    {
      id: 4,
      title: 'Learn NGXS Selectors',
      completed: true
    },
    {
      id: 5,
      title: 'Learn NGXS Actions',
      completed: true
    }
  ]);

  // inCompleteTodoItems = select(TodoSelectors.getIncompletedTodos);
  inCompleteTodoItems: Signal<TodoModel[]> = signal([
    {
      id: 6,
      title: 'Learn NGXS Utility selectors',
      completed: false
    }
  ]);

  newItemName!: string;

  constructor() {
    // this._store.dispatch(new GetTodos());
  }

  toggleItem(todoItem: TodoModel) {
    // dispatch an action to update the todo item
    // this._store.dispatch(new UpdateComplete(todoItem.id, todoItem));
  }

  addItem() {
    // this._store.dispatch(new AddTodo(this.newItemName));
    this.newItemName = '';
  }
}
