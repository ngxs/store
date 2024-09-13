import { Component, Injectable } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { Action, InitState, NgxsOnInit, provideStore, State, Store } from '@ngxs/store';
import { freshPlatform } from '@ngxs/store/internals/testing';

describe('State decorator returns a constructor function', () => {
  @Component({ selector: 'app-root', template: '', standalone: true })
  class TestComponent {}

  it(
    'should call an InitState action handler before the ngxsOnInit method on root module initialisation',
    freshPlatform(async () => {
      // Arrange
      @Injectable()
      class FooState
        extends State<string[]>({ name: 'foo', defaults: [] })
        implements NgxsOnInit
      {
        ngxsOnInit() {
          this.setState([...this.getState(), 'onInit']);
        }

        @Action(InitState)
        initState() {
          this.setState([...this.getState(), 'initState']);
        }
      }

      // Act
      const { injector } = await bootstrapApplication(TestComponent, {
        providers: [provideStore([FooState])]
      });

      const store = injector.get(Store);

      // Assert
      expect(store.snapshot().foo).toEqual(['initState', 'onInit']);
    })
  );
});
