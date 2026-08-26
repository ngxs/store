import { describe, expect, it, vi } from 'vitest';
import { Component, Service } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideStore, State } from '@ngxs/store';
import { freshPlatform } from '@ngxs/store/internals/testing';

// `@Service()` only exists from Angular v22 onwards, which is why this check is
// exercised here (against a real `@angular/core` v22 install) rather than in the
// `@ngxs/store` unit tests, which still run against the workspace's root Angular version.
describe('@Service() on @State() classes', () => {
  @Component({ selector: 'app-root', template: '', standalone: true })
  class RootComponent {}

  it(
    'should not warn when the state is decorated with @Service({ autoProvided: false })',
    freshPlatform(async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      @State({ name: 'scopedServiceState', defaults: null })
      @Service({ autoProvided: false })
      class ScopedServiceState {}

      const appRef = await bootstrapApplication(RootComponent, {
        providers: [provideStore([ScopedServiceState])]
      });

      expect(warnSpy).not.toHaveBeenCalled();

      appRef.destroy();
      warnSpy.mockRestore();
    })
  );

  it(
    'should warn when the state is decorated with bare @Service() (auto-provided at root)',
    freshPlatform(async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      @State({ name: 'autoProvidedServiceState', defaults: null })
      @Service()
      class AutoProvidedServiceState {}

      const appRef = await bootstrapApplication(RootComponent, {
        providers: [provideStore([AutoProvidedServiceState])]
      });

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('@Service({ autoProvided: false }) instead')
      );

      appRef.destroy();
      warnSpy.mockRestore();
    })
  );
});
