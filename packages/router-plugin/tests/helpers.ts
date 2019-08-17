import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { Store, Actions } from '@ngxs/store';
import { ɵgetDOM as getDOM } from '@angular/platform-browser';
import { destroyPlatform, createPlatform, Type } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

function createRootElement() {
  const document = TestBed.get(DOCUMENT);
  const root = getDOM().createElement('app-root', document);
  getDOM().appendChild(document.body, root);
}

function removeRootElement() {
  const document = TestBed.get(DOCUMENT);
  const root = getDOM().querySelector(document, 'app-root');
  document.body.removeChild(root);
}

function destroyPlatformBeforeBootstrappingTheNewOne() {
  destroyPlatform();
  createRootElement();
}

// As we create our custom platform via `bootstrapModule`
// we have to destroy it after assetions and revert
// the previous one
function resetPlatformAfterBootstrapping() {
  removeRootElement();
  destroyPlatform();
  createPlatform(TestBed);
}

export function freshPlatform(fn: Function): (...args: any[]) => any {
  return async function testWithAFreshPlatform(this: any, ...args: any[]) {
    try {
      destroyPlatformBeforeBootstrappingTheNewOne();
      return await fn.apply(this, args);
    } finally {
      resetPlatformAfterBootstrapping();
    }
  };
}

export async function createNGXSRouterPluginTestingPlatform<T>(module: Type<T>) {
  const { injector } = await platformBrowserDynamic().bootstrapModule(module);
  const store: Store = injector.get(Store);
  const router: Router = injector.get(Router);
  const actions$: Actions = injector.get(Actions);
  return { store, router, actions$ };
}
