<p align="center">
    <img src="https://raw.githubusercontent.com/ngxs-labs/dispatch-decorator/master/docs/assets/logo.png">
</p>

---

> Reusable logic for avoiding `Store` injection

[![Build Status](https://travis-ci.org/ngxs-labs/dispatch-decorator.svg?branch=master)](https://travis-ci.org/ngxs-labs/dispatch-decorator)
[![Build status](https://ci.appveyor.com/api/projects/status/tgbu55o6lephax5j?svg=true)](https://ci.appveyor.com/project/arturovt/dispatch-decorator)
[![NPM](https://badge.fury.io/js/%40ngxs-labs%2Fdispatch-decorator.svg)](https://www.npmjs.com/package/@ngxs-labs/dispatch-decorator)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/ngxs-labs/dispatch-decorator/blob/master/LICENSE)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/610c73ab99434bf9807c080e7feb8b85)](https://www.codacy.com/app/arturovt/dispatch-decorator?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=ngxs-labs/dispatch-decorator&amp;utm_campaign=Badge_Grade) [![Greenkeeper badge](https://badges.greenkeeper.io/ngxs-labs/dispatch-decorator.svg)](https://greenkeeper.io/)

This package simplifies dispatching process, you shouldn't care about `Store` service injection as we provide more declarative way to dispatch events out of the box.

## 📦 Install

To install `@ngxs-labs/dispatch-decorator` run the following command:

```console
npm install @ngxs-labs/dispatch-decorator
# or if you use yarn
yarn add @ngxs-labs/dispatch-decorator
```

## 🔨 Usage

Import the module into your root application module:

```typescript
import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { NgxsDispatchPluginModule } from '@ngxs-labs/dispatch-decorator';

@NgModule({
    imports: [
        NgxsModule.forRoot(states),
        NgxsDispatchPluginModule.forRoot()
    ]
})
export class AppModule {}
```

## Dispatch

`@Dispatch()` is a function that allows you to decorate methods and properties of your components, basically arrow functions are properties. Firstly you have to create a state:

```typescript
import { State, Action, StateContext } from '@ngxs/store';

export class Increment {
    public static readonly type = '[Counter] Increment';
}

export class Decrement {
    public static readonly type = '[Counter] Decrement';
}

@State<number>({
    name: 'counter',
    defaults: 0
})
export class CounterState {
    @Action(Increment)
    public increment({ setState, getState }: StateContext<number>) {
        setState(getState() + 1);
    }

    @Action(Decrement)
    public decrement({ setState, getState }: StateContext<number>) {
        setState(getState() - 1);
    }
}
```

Register this state in `NgxsModule` and import this state and actions in your component:

```typescript
import { Component } from '@angular/core';
import { Select } from '@ngxs/store';
import { Dispatch } from '@ngxs-labs/dispatch-decorator';

import { Observable } from 'rxjs';

import { CounterState, Increment, Decrement } from './counter.state';

@Component({
    selector: 'app-root',
    template: `
        <ng-container *ngIf="counter$ | async as counter">
            <h1>{{ counter }}</h1>
        </ng-container>

        <button (click)="increment()">Increment</button>
        <button (click)="decrement()">Decrement</button>
    `
})
export class AppComponent {
    @Select(CounterState)
    public counter$: Observable<number>;

    @Dispatch()
    public increment = () => new Increment()

    @Dispatch()
    public decrement = () => new Decrement()
}
```

Also, your dispatchers can be asyncrhonous, they can return `Promise` or `Observable`, asynchronous operations are handled outside Angular's zone, thus it doesn't affect performance:

```typescript
export class AppComponent {
    // `ApiService` is defined somewhere
    constructor(private api: ApiService) {}

    @Dispatch()
    public async setAppSchema(): Promise<SetAppSchema> {
        const { version, shouldUseGraphQL } = await this.api.getInformation();
        const { schema } = await this.api.getSchemaForVersion(version);
        return new SetAppSchema(schema);
    }

    // OR

    @Dispatch()
    public setAppInformation = () => this.api.getInformation().pipe(
        switchMap(({ version }) => this.api.getSchemaForVersion(version)),
        map(({ schema }) => new SetAppSchema(schema))
    );
}
```

Notice that it doesn't matter if you use an arrow function or a normal class method.

## Dispatching multiple events

Your dispatchers can also return arrays with events inside:

```typescript
export class AppComponent {
    @Dispatch()
    public setLanguageAndNavigateHome = (language: string) => {
        return [new SetLanguage(language), new Navigate('/')];
    }
}
```
