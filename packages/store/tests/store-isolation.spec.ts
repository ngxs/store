import { TestBed } from '@angular/core/testing';

import { Store } from '../src/store';
import { NgxsModule } from '../src/module';
import { State } from '../src/decorators/state';

describe('Store (isolation)', () => {
  describe('when selecting a child state', () => {
    @State<string>({
      name: 'child'
    })
    class ChildState {}

    @State<{}>({
      name: 'parent',
      children: [ChildState]
    })
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
});
