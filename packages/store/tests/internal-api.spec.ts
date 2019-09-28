import { NGXS_INTERNAL_CONTEXT_FACTORY, NGXS_INTERNAL_FACTORY } from '@ngxs/store/internals';
import { Inject, Injector, ModuleWithProviders, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgxsModule } from '@ngxs/store';

import { StateFactory } from '../src/internal/state-factory';
import { StateContextFactory } from '../src/internal/state-context-factory';

describe('Internal API', () => {
  it('should be correct inject stateFactory, stateContextFactory when call NgxsModule.forRoot()', () => {
    class MyCustomPluginAccessor {
      public stateFactory: StateFactory | null = null;
      public stateContextFactory: StateContextFactory | null = null;

      constructor(
        @Inject(NGXS_INTERNAL_FACTORY) stateFactoryRef: any,
        @Inject(NGXS_INTERNAL_CONTEXT_FACTORY) stateContextFactoryRef: any,
        injector: Injector
      ) {
        this.stateFactory = injector.get<any>(stateFactoryRef);
        this.stateContextFactory = injector.get<any>(stateContextFactoryRef);
      }
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

    expect(stateFactory).toEqual(myCustomPluginAccessor.stateFactory);
    expect(stateContextFactory).toEqual(myCustomPluginAccessor.stateContextFactory);
  });
});
