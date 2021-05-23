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

export function freshPlatform(fn: (done?: VoidFunction) => Promise<void>) {
  let done: VoidFunction | null = null,
    whenDoneIsCalledPromise: Promise<void> | null = null;

  const hasDoneArgument = fn.length === 1;

  if (hasDoneArgument) {
    whenDoneIsCalledPromise = new Promise<void>(resolve => {
      done = resolve;
    });
  }

  return async function testWithAFreshPlatform() {
    try {
      destroyPlatformBeforeBootstrappingTheNewOne();

      if (done !== null) {
        await fn(done);
        await whenDoneIsCalledPromise!;
      } else {
        await fn();
      }
    } finally {
      resetPlatformAfterBootstrapping();
    }
  };
}
