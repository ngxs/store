# Style Guide

Below are suggestions for naming and style conventions.

### State Suffix

A state should always be suffixed with the word `State`. Right: `ZooState` Wrong: `Zoo`

### State Filenames

States should have a `.state.ts` suffix for the filename

### State Interfaces

State interfaces should be named the name of the state followed by the `Model` suffix. If my
state were called `ZooState`, we would call my state interface `ZooStateModel`.

### Select Suffix

Selects should have a `$` suffix. Right: `animals$` Wrong: `animals`

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

### Avoid saving entities, instances in your states

#### Avoid

```ts
export class Todo {
  constructor(public title: string, private complete: boolean = false) {}
  public get isCompleted(): boolean {
    return this.complete;
  }
}

@State<Todo[]>({
  name: 'todos',
  defaults: []
})
class TodosState {
  @Action(AddTodo)
  add(ctx: StateContext<Todo[]>, { title }: { title: string }): void {
    // Avoid new Todo(title)
    ctx.setState((state: Todo[]) => state.concat(new Todo(title)));
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
  @Select(TodosState) public todos$: Observable<Todo[]>;
}
```

It is not recommended to use persistence of object instances, because this can lead to undefined behavior in the future.

#### Prefer

```ts
export interface TodoModel {
  title: string;
  complete: boolean;
}

@State<TodoModel[]>({
  name: 'todos',
  defaults: []
})
class TodosState {
  @Action(AddTodo)
  add(ctx: StateContext<TodoModel[]>, { title }: { title: string }): void {
    ctx.setState((state: TodoModel[]) => state.concat({ title, complete: false }));
  }
}

@Component({
  selector: 'app',
  template: `
    <ng-container *ngFor="let todo of todos$ | async">
      {{ todo.complete }}
    </ng-container>
  `
})
class AppComponent {
  @Select(TodosState) public todos$: Observable<Todo[]>;
}
```

#### Why?

You should use the new operator to create new objects of your class if you need to perform complex operations on the object itself. If in case you just need to access the properties only, you may use the object literal to create a new object.

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
export class RowState {}

@State<GridStateModel>({
  name: 'grid',
  defaults: {
    id: -1,
    rows: new Map<number, RowState>()
  }
})
export class GridState {}

@State<GridCollectionStateModel>({
  name: 'grid-collection',
  defaults: {
    grids: new Map<number, GridState>()
  }
})
export class GridCollectionState {}
```

It is not recommended to use data collections such as Set, Map, WeakMap, WeakSet, etc. Since they are not amenable to deserialization and cannot easily be presented for normalization.

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
export class RowState {}

@State<GridStateModel>({
  name: 'grid',
  defaults: {
    id: -1,
    rows: {}
  }
})
export class GridState {}

@State<GridCollectionStateModel>({
  name: 'grid-collection',
  defaults: {
    grids: {}
  }
})
export class GridCollectionState {}
```

#### Why?

The general recommendation for handling hierarchical data in Redux is to normalise it.
This would entail flattening it ianthe same way that you would design relational tables, having keys for referring to their parents.
