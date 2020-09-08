# Style Guide

Below are suggestions for naming and style conventions.

### State Suffix

A state should always be suffixed with the word `State`. Prefer: `ZooState` Avoid: `Zoo`

### State Filenames

States should have a `.state.ts` suffix for the filename

### State Interfaces

State interfaces should be named the name of the state followed by the `Model` suffix. If my
state were called `ZooState`, we would call my state interface `ZooStateModel`.

### Select Suffix

Selects should have a `$` suffix. Prefer: `animals$` Avoid: `animals`

### Plugin Suffix

Plugins should end with the `Plugin` suffix

### Plugin Filenames

Plugins file names should end with `.plugin.ts`

### Folder Organization

Global states should be organized under `src/shared/state`.
Feature states should live within the respective feature folder structure `src/app/my-feature`.
Actions can live within the state file but are recommended to be a separate file like: `zoo.actions.ts`

### Action Suffixes

Actions should NOT have a suffix

### Unit Tests

Unit tests for the state should be named `my-state-name.state.spec.ts`

### Action Operations

Actions should NOT deal with view related operations (i.e. showing popups/etc). Use the action
stream to handle these types of operations

### Avoid Saving Class Based Instances in Your State

The objects stored in your state should be immutable and should support serialization and deserialization. It is therefore recommended to store pure object literals in your state. Class based instances are not trivial to serialize and deserialize, and also are generally focused on encapsulating internals and mutating internal state through exposed operations. This does not match the requirement for the data stored in state.

This also applies to the usage of data collections such as Set, Map, WeakMap, WeakSet, etc. Since they are not amenable to deserialization and cannot easily be presented for normalization.

#### Avoid

```ts
export class Todo {
  constructor(public title: string, public isCompleted = false) {}
}

@State<Todo[]>({
  name: 'todos',
  defaults: []
})
@Injectable()
class TodosState {
  @Action(AddTodo)
  add(ctx: StateContext<Todo[]>, action: AddTodo): void {
    // Avoid new Todo(title)
    ctx.setState((state: Todo[]) => state.concat(new Todo(action.title)));
  }
}

@Component({
  selector: 'app',
  template: `
    <ng-container *ngFor="let todo of todos$ | async">
      {{ todo.isCompleted }}
    </ng-container>
  `
})
class AppComponent {
  @Select(TodosState) todos$: Observable<Todo[]>;
}
```

It is not recommended to add Class based object instances to your state because this can lead to undefined behavior in the future.

#### Prefer

```ts
export interface TodoModel {
  title: string;
  isCompleted: boolean;
}

@State<TodoModel[]>({
  name: 'todos',
  defaults: []
})
@Injectable()
class TodosState {
  @Action(AddTodo)
  add(ctx: StateContext<TodoModel[]>, action: AddTodo): void {
    ctx.setState((state: TodoModel[]) =>
      state.concat({ title: action.title, isCompleted: false })
    );
  }
}

@Component({
  selector: 'app',
  template: `
    <ng-container *ngFor="let todo of todos$ | async">
      {{ todo.isCompleted }}
    </ng-container>
  `
})
class AppComponent {
  @Select(TodosState) todos$: Observable<Todo[]>;
}
```

### Flatten Deep Object Graphs

The general recommendation for handling hierarchical data in Redux is to normalise it.
This would entail flattening it in the same way that you would design relational tables, having keys for references to parent objects.

#### Avoid

```ts
export interface RowStateModel {
  id: number;
}

export interface GridStateModel {
  id: number;
  rows: Map<number, RowState>;
}

export interface GridCollectionStateModel {
  grids: Map<number, GridState>;
}

@State<RowStateModel>({
  name: 'row',
  defaults: {
    id: -1
  }
})
@Injectable()
export class RowState {}

@State<GridStateModel>({
  name: 'grid',
  defaults: {
    id: -1,
    rows: new Map<number, RowState>()
  }
})
@Injectable()
export class GridState {}

@State<GridCollectionStateModel>({
  name: 'grid-collection',
  defaults: {
    grids: new Map<number, GridState>()
  }
})
@Injectable()
export class GridCollectionState {}
```

Note: It is not recommended to use data collections such as Set, Map, WeakMap, WeakSet, etc. Since they are not amenable to deserialization and cannot easily be presented for normalization.

#### Prefer

```ts
export interface RowStateModel {
  id: number;
}

export interface GridStateModel {
  id: number;
  rows: {
    [id: number]: RowStateModel;
  };
}

export interface GridCollectionStateModel {
  grids: {
    [id: number]: GridStateModel;
  };
}

@State<RowStateModel>({
  name: 'row',
  defaults: {
    id: -1
  }
})
@Injectable()
export class RowState {}

@State<GridStateModel>({
  name: 'grid',
  defaults: {
    id: -1,
    rows: {}
  }
})
@Injectable()
export class GridState {}

@State<GridCollectionStateModel>({
  name: 'grid-collection',
  defaults: {
    grids: {}
  }
})
@Injectable()
export class GridCollectionState {}
```
