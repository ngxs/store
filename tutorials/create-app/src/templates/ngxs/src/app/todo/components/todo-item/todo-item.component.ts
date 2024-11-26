import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { TodoModel } from '../../types/todo';

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [MatListModule, MatCheckboxModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-list-item [class.is-done]="item().completed" role="listitem">
      <div class="flex items-center">
        <mat-checkbox [checked]="item().completed" (change)="toggleItem.emit(item())">
          {{ item().title }}
        </mat-checkbox>
      </div>
    </mat-list-item>
  `,
  styles: `
    .is-done {
      mat-checkbox {
        text-decoration: line-through;
        color: gray;
      }
    }
  `
})
export class TodoItemComponent {
  item = input.required<TodoModel>();
  toggleItem = output<TodoModel>();
}
