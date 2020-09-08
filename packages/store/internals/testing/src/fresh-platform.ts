import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { ɵgetDOM as getDOM } from '@angular/platform-browser';
import { destroyPlatform, createPlatform } from '@angular/core';

function createRootElement() {
  const document = TestBed.inject(DOCUMENT);
  const root = getDOM().createElement('app-root', document);
  document.body.appendChild(root);
}

function removeRootElement() {
  const root: Element = document.getElementsByTagName('app-root').item(0)!;
  try {
    document.body.removeChild(root);
  } catch {}
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
