import { TestBed } from '@angular/core/testing';

import { Store } from '../src/store';
import { NgxsModule } from '../src/module';
import { State } from '../src/decorators/state';
import { Selector } from '../src/decorators/selector/selector';
import { SelectorOptions } from '../src/decorators/selector-options';

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
});
