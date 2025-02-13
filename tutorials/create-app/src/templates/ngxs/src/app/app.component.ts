import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TodoListComponent } from './todo/todo-list/todo-list.component';

@Component({
  selector: 'app-root',
  template: ` <app-todo></app-todo> `,
  styles: ``,
  imports: [TodoListComponent],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  title = 'Code Shots With Profanis - Like and Subscribe :)';
}
