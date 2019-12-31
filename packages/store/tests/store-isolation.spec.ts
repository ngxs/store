import { TestBed } from '@angular/core/testing';

import { Store } from '../src/store';
import { NgxsModule } from '../src/module';
import { State } from '../src/decorators/state';
import { Selector } from '../src/decorators/selector/selector';
import { SelectorOptions } from '../src/decorators/selector-options';
import { NgModule, NgModuleFactoryLoader } from '@angular/core';
import { RouterTestingModule, SpyNgModuleFactoryLoader } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StateToken } from '../src/public_api';
import { StateClass } from '../internals/src/index';

describe('Store (isolation)', () => {
  describe('when selecting a child state', () => {
    @State<string>({ name: 'child' })
    class ChildState {}

    @State<{}>({ name: 'parent', children: [ChildState] })
    class ParentState {}

    it('should select undefined if not initialised in store', () => {
      // Arrange
      TestBed.configureTestingModule({
        imports: [
          NgxsModule.forRoot([], {
            selectorOptions: { suppressErrors: false }
          })
        ]
      });
      const store: Store = TestBed.get(Store);
      store.reset({ child: 'child' });
      // Act
      const result = store.selectSnapshot(ChildState);
      // Assert
      expect(result).toBeUndefined();
    });

    it('should select successfully if initialised in store', () => {
      // Arrange
      TestBed.configureTestingModule({
        imports: [
          NgxsModule.forRoot([ChildState, ParentState], {
            selectorOptions: { suppressErrors: false }
          })
        ]
      });
      const store: Store = TestBed.get(Store);
      store.reset({ parent: { child: 'parent.child' }, child: 'child' });
      // Act
      const result = store.selectSnapshot(ChildState);
      // Assert
      expect(result).toEqual('parent.child');
    });

    it('should select undefined if not initialised in store in subsequent test', () => {
      // Arrange
      TestBed.configureTestingModule({
        imports: [
          NgxsModule.forRoot([], {
            selectorOptions: { suppressErrors: false }
          })
        ]
      });
      const store: Store = TestBed.get(Store);
      store.reset({ parent: { child: 'parent.child' }, child: 'child' });
      // Act
      const result = store.selectSnapshot(ChildState);
      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('when selecting a child state using a selector', () => {
    @State<string>({ name: 'child' })
    class ChildState {
      @Selector() static getPath(state: string) {
        return state;
      }
    }

    @State<{ path: string }>({ name: 'parent', children: [ChildState] })
    @SelectorOptions({ injectContainerState: false })
    class ParentState {
      @Selector([ParentState, ChildState.getPath])
      static getPaths(parent: any, childPath: string) {
        return `${parent && parent.path}, ${childPath}`;
      }
    }

    function setToTestState(store: Store) {
      store.reset({ parent: { path: 'parent', child: 'parent.child' }, child: 'child' });
    }

    it('should select undefined if not initialised in store', () => {
      // Arrange
      TestBed.configureTestingModule({
        imports: [
          NgxsModule.forRoot([], {
            selectorOptions: { suppressErrors: false }
          })
        ]
      });
      const store: Store = TestBed.get(Store);
      setToTestState(store);
      // Act
      const result = store.selectSnapshot(ParentState.getPaths);
      // Assert
      expect(result).toEqual('undefined, undefined');
    });

    it('should select successfully if initialised in store', () => {
      // Arrange
      TestBed.configureTestingModule({
        imports: [
          NgxsModule.forRoot([ChildState, ParentState], {
            selectorOptions: { suppressErrors: false }
          })
        ]
      });
      const store: Store = TestBed.get(Store);
      setToTestState(store);
      // Act
      const result = store.selectSnapshot(ParentState.getPaths);
      // Assert
      expect(result).toEqual('parent, parent.child');
    });

    it('should select undefined if not initialised in store in subsequent test', () => {
      // Arrange
      TestBed.configureTestingModule({
        imports: [
          NgxsModule.forRoot([], {
            selectorOptions: { suppressErrors: false }
          })
        ]
      });
      const store: Store = TestBed.get(Store);
      setToTestState(store);
      // Act
      const result = store.selectSnapshot(ParentState.getPaths);
      // Assert
      expect(result).toEqual('undefined, undefined');
    });
  });

  describe('when selecting a child state using a state token', () => {
    const CHILD_STATE_TOKEN = new StateToken<string>('child');
    const PARENT_STATE_TOKEN = new StateToken<{ path: string }>('parent');

    @State<string>({ name: CHILD_STATE_TOKEN })
    @SelectorOptions({ injectContainerState: false })
    class ChildState {
      @Selector([CHILD_STATE_TOKEN]) static getPath(state: string) {
        return state;
      }
    }

    @State<{ path: string }>({ name: PARENT_STATE_TOKEN, children: [ChildState] })
    @SelectorOptions({ injectContainerState: false })
    class ParentState {
      @Selector([PARENT_STATE_TOKEN, ChildState.getPath])
      static getPaths(parent: any, childPath: string) {
        return `${parent && parent.path}, ${childPath}`;
      }
    }

    function setToTestState(store: Store) {
      store.reset({ parent: { path: 'parent', child: 'parent.child' }, child: 'child' });
    }

    function setup(states: StateClass<any>[]) {
      TestBed.configureTestingModule({
        imports: [
          NgxsModule.forRoot(states, {
            selectorOptions: { suppressErrors: false }
          })
        ]
      });
      const store: Store = TestBed.get(Store);
      setToTestState(store);
      return { store };
    }

    it('should select undefined if not initialised in store', () => {
      // Arrange
      const { store } = setup([]);
      // Act
      const result = store.selectSnapshot(ParentState.getPaths);
      // Assert
      expect(result).toEqual('undefined, undefined');
    });

    it('should select successfully if initialised in store', () => {
      // Arrange
      const { store } = setup([ChildState, ParentState]);
      // Act
      const result = store.selectSnapshot(ParentState.getPaths);
      // Assert
      expect(result).toEqual('parent, parent.child');
    });

    it('should select undefined if not initialised in store in subsequent test', () => {
      // Arrange
      const { store } = setup([]);
      // Act
      const result = store.selectSnapshot(ParentState.getPaths);
      // Assert
      expect(result).toEqual('undefined, undefined');
    });
  });

  describe('when selecting a lazy child state using a selector', () => {
    @State<string>({ name: 'child' })
    class ChildState {
      @Selector() static getPath(state: string) {
        return state;
      }
    }

    @State<{ path: string }>({ name: 'parent', children: [ChildState] })
    @SelectorOptions({ injectContainerState: false })
    class ParentState {
      @Selector([ParentState, ChildState.getPath])
      static getPaths(parent: any, childPath: string) {
        return `${parent && parent.path}, ${childPath}`;
      }
    }

    @NgModule({ imports: [CommonModule, NgxsModule.forFeature([ChildState, ParentState])] })
    class LazyModule {}

    function setup() {
      TestBed.configureTestingModule({
        imports: [
          RouterTestingModule,
          NgxsModule.forRoot([], {
            selectorOptions: { suppressErrors: false }
          })
        ]
      });

      const store: Store = TestBed.get(Store);
      const router: Router = TestBed.get(Router);
      const loader: SpyNgModuleFactoryLoader = TestBed.get(NgModuleFactoryLoader);
      loader.stubbedModules = {
        lazyModule: LazyModule
      };
      router.resetConfig([{ path: 'lazy-path', loadChildren: 'lazyModule' }]);
      async function navigateToLazyRoute() {
        return await router.navigateByUrl('/lazy-path');
      }
      return {
        store,
        navigateToLazyRoute
      };
    }

    function setToTestState(store: Store) {
      store.reset({ parent: { path: 'parent', child: 'parent.child' }, child: 'child' });
    }

    it('should select undefined if not initialised in store', () => {
      // Arrange
      const { store } = setup();
      setToTestState(store);
      // Act
      const result = store.selectSnapshot(ParentState.getPaths);
      // Assert
      expect(result).toEqual('undefined, undefined');
    });

    it('should select successfully if lazy route initialised in store', async () => {
      // Arrange
      const { navigateToLazyRoute, store } = setup();
      await navigateToLazyRoute();
      setToTestState(store);
      // Act
      const result = store.selectSnapshot(ParentState.getPaths);
      // Assert
      expect(result).toEqual('parent, parent.child');
    });

    it('should select undefined if not initialised in store in subsequent test', () => {
      // Arrange
      const { store } = setup();
      setToTestState(store);
      // Act
      const result = store.selectSnapshot(ParentState.getPaths);
      // Assert
      expect(result).toEqual('undefined, undefined');
    });
  });
});
