import { getPlatform, COMPILER_OPTIONS, CompilerOptions, PlatformRef } from '@angular/core';
import { memoize } from './memoize';

function _isAngularInTestMode() {
  const platformRef: PlatformRef | null = getPlatform();
  if (!platformRef) return false;
  const compilerOptions = platformRef.injector.get<any>(COMPILER_OPTIONS, null);
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

export const isAngularInTestMode = memoize(_isAngularInTestMode);
