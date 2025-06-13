import { Component, Injectable, NgModule } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { NgxsModule, provideStore, State } from '@ngxs/store';
import { freshPlatform } from '@ngxs/store/internals/testing';

describe('Standalone component', () => {
  @State({
    name: 'countries',
    defaults: []
  })
  @Injectable()
  class CountriesState {}

  @NgModule({
    imports: [NgxsModule.forFeature([CountriesState])]
  })
  class LazyModule {}

  @Component({
    selector: 'app-root',
    template: ` <div>Hello World</div> `,
    standalone: true,
    imports: [LazyModule]
  })
  class StandaloneComponent {}

  it(
    'should render and destroy standalone component',
    freshPlatform(async () => {
      // Arrange
      const appRef = await bootstrapApplication(StandaloneComponent, {
        providers: [provideStore([])]
      });

      // Assert
      expect(() => appRef.destroy()).not.toThrow();
    })
  );
});
