import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { ɵgetDOM as getDOM } from '@angular/platform-browser';
import { VERSION, destroyPlatform, createPlatform } from '@angular/core';

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

function destroyPlatformBeforeBootstrappingTheNewOne(freshUrl: string) {
  destroyPlatform();
  resetLocationToUrl(freshUrl);
  createRootElement();
}

// As we create our custom platform via `bootstrapModule`
// we have to destroy it after assetions and revert
// the previous one
function resetPlatformAfterBootstrapping() {
  removeRootElement();
  destroyPlatform();
  const version = +VERSION.major;
  // https://github.com/angular/angular/commit/e250db4f261741b04ee4cbad4dec41a8908a12aa
  if (version < 14) {
    createPlatform(TestBed);
  }
}

function resetLocationToUrl(freshUrl: string) {
  window.history.replaceState({}, 'Test', freshUrl);
}

export function freshPlatform(fn: (done?: VoidFunction) => Promise<void>) {
  let resolve: VoidFunction | null = null;
  let reject: ((error: Error) => void) | null = null;
  let whenDoneIsCalledPromise: Promise<void> | null = null;

  const hasDoneArgument = fn.length === 1;

  if (hasDoneArgument) {
    whenDoneIsCalledPromise = new Promise<void>((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });
  }

  return async function testWithAFreshPlatform() {
    try {
      const freshUrl = '/';
      destroyPlatformBeforeBootstrappingTheNewOne(freshUrl);

      if (hasDoneArgument) {
        await fn((error?: Error) => {
          if (error) {
            reject!(error);
          } else {
            resolve!();
          }
        });
        await whenDoneIsCalledPromise!;
      } else {
        await fn();
      }
    } finally {
      resetPlatformAfterBootstrapping();
    }
  };
}
