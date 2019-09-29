import {
  NGXS_INTERNAL_CONTEXT_FACTORY_TOKEN,
  NGXS_INTERNAL_FACTORY_TOKEN
} from '@ngxs/store/internals';
import { Inject, ModuleWithProviders, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgxsModule } from '@ngxs/store';

import { StateFactory } from '../src/internal/state-factory';
import { StateContextFactory } from '../src/internal/state-context-factory';

describe('Internal API', () => {
  it('should be correct inject stateFactory, stateContextFactory when call NgxsModule.forRoot()', () => {
    class MyCustomPluginAccessor {
      constructor(
        @Inject(NGXS_INTERNAL_FACTORY_TOKEN)
        public factory: StateFactory,
        @Inject(NGXS_INTERNAL_CONTEXT_FACTORY_TOKEN)
        public contextFactory: StateContextFactory
      ) {}
    }

    @NgModule()
    class MyPlugin {
      public static forRoot(): ModuleWithProviders {
        return {
          ngModule: MyPlugin,
          providers: [MyCustomPluginAccessor]
        };
      }
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot(), MyPlugin.forRoot()]
    });

    const stateFactory: StateFactory = TestBed.get(StateFactory);
    const stateContextFactory: StateContextFactory = TestBed.get(StateContextFactory);
    const myCustomPluginAccessor: MyCustomPluginAccessor = TestBed.get(MyCustomPluginAccessor);

    expect(stateFactory).toEqual(myCustomPluginAccessor.factory);
    expect(stateContextFactory).toEqual(myCustomPluginAccessor.contextFactory);
  });
});
