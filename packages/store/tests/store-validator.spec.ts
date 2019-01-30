import { TestBed } from '@angular/core/testing';
import { NgxsModule } from '../src/module';
import { State } from '../src/decorators/state';
import { Store } from '../src/store';

describe('StoreValidator', () => {
  describe('duplicate state name check', () => {
    it('should detect duplicates', () => {
      let errorMessage: string | null = null;
      try {
        @State<string>({
          name: 'duplicate',
          defaults: 'first'
        })
        class MyOtherState {}

        @State<string>({
          name: 'duplicate',
          defaults: 'second'
        })
        class MyDuplicateState {}

        TestBed.configureTestingModule({
          imports: [NgxsModule.forRoot([MyOtherState, MyDuplicateState])]
        });

        TestBed.get(Store);
      } catch (e) {
        errorMessage = e.message;
      }
      expect(errorMessage).toEqual(
        `State name 'duplicate' from MyDuplicateState already exists in MyOtherState`
      );
    });

    it('should detect duplicates from a child', () => {
      let errorMessage: string | null = null;
      try {
        @State<string>({
          name: 'duplicate',
          defaults: 'first'
        })
        class MyOtherState {}

        @State<string>({
          name: 'duplicate',
          defaults: 'third'
        })
        class MyDuplicateChildState {}

        @State<string>({
          name: 'another',
          defaults: 'second',
          children: [MyDuplicateChildState]
        })
        class MyAnotherState {}

        TestBed.configureTestingModule({
          imports: [NgxsModule.forRoot([MyOtherState, MyAnotherState, MyDuplicateChildState])]
        });

        TestBed.get(Store);
      } catch (e) {
        errorMessage = e.message;
      }
      expect(errorMessage).toEqual(
        `State name 'duplicate' from MyDuplicateChildState already exists in MyOtherState`
      );
    });

    it('should detect duplicates from a feature module', () => {
      let errorMessage: string | null = null;
      try {
        @State<string>({
          name: 'duplicate',
          defaults: 'first'
        })
        class MyOtherState {}

        @State<string>({
          name: 'duplicate',
          defaults: 'second'
        })
        class MyDuplicateState {}

        TestBed.configureTestingModule({
          imports: [
            NgxsModule.forRoot([MyOtherState]),
            NgxsModule.forFeature([MyDuplicateState])
          ]
        });

        TestBed.get(Store);
      } catch (e) {
        errorMessage = e.message;
      }
      expect(errorMessage).toEqual(
        `State name 'duplicate' from MyDuplicateState already exists in MyOtherState`
      );
    });

    it('should not detect the same state in multiple features as a duplicate', () => {
      let errorMessage: string | undefined;
      try {
        @State<string>({
          name: 'main',
          defaults: 'first'
        })
        class MyMainState {}

        @State<string>({
          name: 'feature',
          defaults: 'second'
        })
        class MyFeatureState {}

        TestBed.configureTestingModule({
          imports: [
            NgxsModule.forRoot([MyMainState]),
            NgxsModule.forFeature([MyFeatureState]),
            NgxsModule.forFeature([MyFeatureState])
          ]
        });

        const store: Store = TestBed.get(Store);
        expect(store).toBeDefined();
      } catch (e) {
        errorMessage = e.message;
      }
      expect(errorMessage).toBeUndefined();
    });
  });

  describe('@State() decorator check', () => {
    it('should detect a missing decorator', () => {
      let errorMessage: string | null = null;
      try {
        class TestState {}

        TestBed.configureTestingModule({
          imports: [NgxsModule.forRoot([TestState])]
        });

        TestBed.get(Store);
      } catch (e) {
        errorMessage = e.message;
      }
      expect(errorMessage).toEqual('States must be decorated with @State() decorator');
    });

    it('should detect a missing decorator in child states', () => {
      let errorMessage: string | null = null;
      try {
        class ChildState {}

        @State<any>({
          name: 'myState',
          defaults: {},
          children: [ChildState]
        })
        class MyState {}

        TestBed.configureTestingModule({
          imports: [NgxsModule.forRoot([MyState, ChildState])]
        });

        TestBed.get(Store);
      } catch (e) {
        errorMessage = e.message;
      }
      expect(errorMessage).toEqual('States must be decorated with @State() decorator');
    });
  });
});
