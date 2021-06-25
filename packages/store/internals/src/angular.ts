import { getPlatform, COMPILER_OPTIONS, CompilerOptions, PlatformRef } from '@angular/core';
import { memoize } from './memoize';

/**
 * @description Will be provided through Terser global definitions by Angular CLI
 * during the production build. This is how Angular does tree-shaking internally.
 */
declare const ngDevMode: boolean;

function _isAngularInTestMode(): boolean {
  const platformRef: PlatformRef | null = getPlatform();
  if (!platformRef) return false;
  const compilerOptions = platformRef.injector.get(COMPILER_OPTIONS, null);
  if (!compilerOptions) return false;
  const isInTestMode = compilerOptions.some((item: CompilerOptions) => {
    const providers = (item && item.providers) || [];
    return providers.some((provider: any) => {
      return (
        (provider && provider.provide && provider.provide.name === 'MockNgModuleResolver') ||
        false
      );
    });
  });
  return isInTestMode;
}

export const isAngularInTestMode =
  // Caretaker note: we have still left the `typeof` condition in order to avoid
  // creating a breaking change for projects that still use the View Engine.
  typeof ngDevMode === 'undefined' || ngDevMode ? memoize(_isAngularInTestMode) : () => false;
