import { NGXS_STATE_CONTEXT_FACTORY, NGXS_STATE_FACTORY } from '@ngxs/store/internals';
import { Inject, Injectable, ModuleWithProviders, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgxsModule } from '@ngxs/store';

import { StateFactory } from '../src/internal/state-factory';
import { StateContextFactory } from '../src/internal/state-context-factory';

describe('Internal API', () => {
  it('should be correct inject stateFactory, stateContextFactory when call NgxsModule.forRoot()', () => {
    @Injectable()
    class MyCustomPluginAccessor {
      constructor(
        @Inject(NGXS_STATE_FACTORY)
        public factory: StateFactory,
        @Inject(NGXS_STATE_CONTEXT_FACTORY)
        public contextFactory: StateContextFactory
      ) {}
    }

    @NgModule()
    class MyPlugin {
      public static forRoot(): ModuleWithProviders<MyPlugin> {
        return {
          ngModule: MyPlugin,
          providers: [MyCustomPluginAccessor],
        };
      }
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot(), MyPlugin.forRoot()],
    });

    const stateFactory: StateFactory = TestBed.inject(StateFactory);
    const stateContextFactory: StateContextFactory = TestBed.inject(StateContextFactory);
    const myCustomPluginAccessor: MyCustomPluginAccessor = TestBed.inject(
      MyCustomPluginAccessor
    );

    expect(stateFactory).toEqual(myCustomPluginAccessor.factory);
    expect(stateContextFactory).toEqual(myCustomPluginAccessor.contextFactory);
  });
});
