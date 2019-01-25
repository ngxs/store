import { TestBed } from '@angular/core/testing';
import { NgxsModule } from '../src/module';
import { State } from '../src/decorators/state';
import { Store } from '../src/store';

describe('Duplicate states', () => {
  let store: Store;

  it('should be checked duplicate state', () => {
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

      store = TestBed.get(Store);
    } catch (e) {
      expect(e.message).toEqual('State name MyDuplicateState in MyOtherState already exists');
      expect(store).toBeUndefined();
    }
  });

  it('should be checked add @State() decorator', () => {
    try {
      class TestState {}

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([TestState])]
      });

      store = TestBed.get(Store);
    } catch (e) {
      expect(e.message).toEqual('States must be decorated with @State() decorator');
      expect(store).toBeUndefined();
    }
  });
});
