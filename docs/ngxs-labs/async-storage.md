<p align="center">
    <img src="https://raw.githubusercontent.com/ngxs-labs/async-storage-plugin/master/docs/assets/logo.png">
</p>

---

> Supports custom storage engine with async access

[![NPM](https://badge.fury.io/js/%40ngxs-labs%2Fasync-storage-plugin.svg)](https://www.npmjs.com/package/@ngxs-labs/async-storage-plugin)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/ngxs-labs/async-storage-plugin/blob/master/LICENSE)

## 📦 Install

To install `@ngxs-labs/async-storage-plugin` run the following command:

```console
npm install --save @ngxs-labs/async-storage-plugin
# or if you use yarn
yarn add @ngxs-labs/async-storage-plugin
```

## 🔨 Usage
Import the module into your root application module:

```typescript
import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { NgxsAsyncStoragePluginModule } from '@ngxs-labs/async-storage-plugin';

@NgModule({
    imports: [
        NgxsModule.forRoot(states),
        NgxsAsyncStoragePluginModule.forRoot(YOUR_CUSTOM_ENGINE)
    ]
})
export class AppModule {}
```

## Custom Async Storage Engine
You can implement your own async storage engine by providing an engine that implements `AsyncStorageEngine`:

```typescript
export class MyAsyncStorageEngine implements AsyncStorageEngine {
  constructor(private storage: YourStorage) { }

  length(): Observable<number> {
    // Your logic here
  }

  getItem(key: any): Observable<any> {
    // Your logic here
  }

  setItem(key: any, val: any): void {
    // Your logic here
  }

  removeItem(key: any): void {
    // Your logic here
  }

  clear(): void {
    // Your logic here
  }

  key(val: number): Observable<string> {
    // Your logic here
  }

}

@NgModule({
  imports: [
    NgxsModule.forRoot([]),
    NgxsAsyncStoragePluginModule.forRoot(MyAsyncStorageEngine)
  ]
})
export class AppModule {}
```

If your async storage returns a `Promise` you can wrap calls with `from(storage.length())` from `rxjs`.

## Code Samples

### Custom Ionic Storage Engine
Here is an example implementation of the `AsyncStorageEngine` using the Ionic Storage.
You can find the [StorageService](/integration/app/services/storage.service.ts) in the integration project.

```typescript
import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { Storage } from '@ionic/storage';
import { AsyncStorageEngine } from '@ngxs-labs/async-storage-plugin';

@Injectable({
  providedIn: 'root'
})
export class StorageService implements AsyncStorageEngine {
  constructor(private storage: Storage) { }

  length(): Observable<number> {
    return from(this.storage.length());
  }

  getItem(key: any): Observable<any> {
    return from(this.storage.get(key));
  }

  setItem(key: any, val: any): void {
    this.storage.set(key, val);
  }

  removeItem(key: any): void {
    this.storage.remove(key);
  }

  clear(): void {
    this.storage.clear();
  }

  key(val: number): Observable<string> {
    return from(this.storage.keys().then(keys => keys[val]));
  }

}

@NgModule({
  imports: [
    NgxsModule.forRoot([]),
    NgxsAsyncStoragePluginModule.forRoot(StorageService)
  ]
})
export class AppModule {}
```

## Options and Migrations
This plugin provides the same options and migration settings as the [Storage Plugin](https://ngxs.gitbook.io/ngxs/plugins/storage). See [Options](https://ngxs.gitbook.io/ngxs/plugins/storage#options) and [Migrations](https://ngxs.gitbook.io/ngxs/plugins/storage#migrations) here.
