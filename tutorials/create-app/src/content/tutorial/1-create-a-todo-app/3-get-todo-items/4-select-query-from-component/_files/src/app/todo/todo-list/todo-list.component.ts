import { AsyncPipe, NgForOf, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { Store, select } from '@ngxs/store';
import { TodoItemComponent } from '../components/todo-item/todo-item.component';
import { TodoSelectors } from '../store/todo.queries';
import { TodoModel } from '../types/todo';
import { signal } from '@angular/core';
import { GetTodos } from '../store/todo.actions';

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
      id: 6,
      title: 'Learn NGXS',
      completed: true
    }
  ]);

  inCompleteTodoItems: Signal<TodoModel[]> = signal([
    {
      id: 6,
      title: 'Learn NGXS Utility selectors',
      completed: false
    }
  ]);

  newItemName!: string;

  constructor() {}

  toggleItem(todoItem: TodoModel) {}

  addItem() {
    this.newItemName = '';
  }
}
