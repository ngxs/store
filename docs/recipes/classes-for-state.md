# Classes for State

Its ES6 and Typescript era. Nowadays you are working with classes and constructor objects more then ever. `Class-transformer` allows you to transform plain object to some instance of class and versa. Also it allows to serialize / deserialize object based on criteria. This tool is super useful on both frontend and backend.

## Use case

In JavaScript there are two types of objects:

- plain (literal) objects;
- class (constructor) objects.

Plain objects are objects that are instances of Object class. Sometimes they are called literal objects, when created via {} notation.

Consider a situation with a simple state and model.

```ts
import { State, Action, StateContext } from '@ngxs/store';

export interface UserModel {
  id: number;
  firstName: string;
  lastName: string;
}

export class UpdateUserAction {
  public static readonly type: string = 'User update';
  constructor(public user: UserModel) {}
}

@State<UserModel>({
  name: 'user',
  defaults: {
    id: null,
    firstName: null,
    lastName: null
  }
})
export class UserState {
  @Action(UpdateUserAction)
  public update(ctx: StateContext<UserModel>, { user }: UpdateUserAction): void {
    ctx.setState(user);
  }
}
```

```ts
@Component({
  selector: 'my-app',
  template: `
    <pre>{{ user$ | async | json }}</pre>
    <button (click)="update()">Send incorrect model</button>
  `
})
export class AppComponent {
  @Select(UserState)
  public user$: Observable<UserModel>;

  constructor(private store: Store) {}

  public update(): void {
    this.store.dispatch(new UpdateUserAction(null));
  }
}
```

```text
{
  "id": null,
  "firstName": null,
  "lastName": null
}
```

Upon initialization, in the template, we will see the displayed model first, and after dispatched `UpdateUserAction` action, our state will be incorrect reset.

Class objects are instances of classes with own defined constructor, properties and methods. Usually you define them via class notation.

So, what is the problem?

Sometimes you want to transform plain javascript object to the ES6 classes you have. For example, if you are loading a json from your backend, some api or from a json file, and after you JSON.parse it you have a plain javascript object, not instance of class you have.

## Enforcing type-safe instance

```ts
import { State, Action, StateContext } from '@ngxs/store';
import { Exclude, Expose, plainToClass } from 'class-transformer';

@Exclude()
export class User {
  @Expose() public id: number = null;
  @Expose() public firstName: string = null;
  @Expose() public lastName: string = null;
}

export class UpdateUserAction {
  public static readonly type: string = 'User update';
  constructor(public user: User) {}
}

@State<User>({
  name: 'user',
  defaults: new User()
})
export class UserState {
  @Action(UpdateUserAction)
  public update(ctx: StateContext<User>, { user }: UpdateUserAction): void {
    ctx.setState(this.enforcingType(user));
  }

  private enforcingType(user: User): User {
    return plainToClass(User, { ...new User(), ...user });
  }
}
```

Now we will always be sure that our model will be true no matter what comes from the outside.

```ts
import { Component } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { UserState, User, UpdateUserAction } from './app.state';

@Component({
  selector: 'my-app',
  template: `
    <pre>{{ user$ | async | json }}</pre>
    <button (click)="update()">Send incorrect model</button>
  `
})
export class AppComponent {
  @Select(UserState)
  public user$: Observable<User>;

  constructor(private store: Store) {}

  public update(): void {
    this.store.dispatch(new UpdateUserAction({ invalid: 'data' } as any));
  }
}
```

When the action is executed, the transformer class will check the model and if the fields do not match the model, they will be excluded.

```ts
this.store.dispatch(new UpdateUserAction({ invalid: 'data' } as any));
```

## Use Classes for selection Models

Writing to the repository is done like ordinary objects, to preserve immunity. Therefore, you cannot save an instance of a class to retrieve data from a state.

```ts
import { State, Action, StateContext } from '@ngxs/store';
import { Exclude, Expose, plainToClass } from 'class-transformer';

@Exclude()
export class User {
  @Expose() public firstName: string;
  @Expose() public lastName: string;

  constructor(firstName: string = null, lastName: string = null) {
    this.firstName = firstName;
    this.lastName = lastName;
  }

  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

@State<User>({
  name: 'user',
  defaults: new User('Mark', 'Whitfeld')
})
export class UserState {}
```

```ts
import { Component } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { UserState, User } from './app.state';

@Component({
  selector: 'my-app',
  template: `
    <ng-container *ngIf="user$ | async as user">
      <pre>{{ user | json }}</pre>
      <p>FullName - {{ user.fullName }}</p>
    </ng-container>
  `
})
export class AppComponent {
  @Select(UserState)
  public user$: Observable<User>;
}
```

However, by writing such code, you will not see the full name. Because in the store it will be a simple object. In order for you to be able to work normally with an instance from a state, you need to select the values correctly.

```ts
@State<User>({
  name: 'user',
  defaults: new User('Mark', 'Whitfeld')
})
export class UserState {
  @Selector()
  public static getUser(state: User): User {
    return plainToClass(User, state);
  }
}
```

```ts
@Component({ ... })
export class AppComponent  {
  @Select(UserState.getUser)
  public user$: Observable<User>;
}
```

But with the selector you can always get the correct state instance value and see in template.

```text
{
  "firstName": "Mark",
  "lastName": "Whitfeld"
}

Full name - Mark Whitfeld
```
