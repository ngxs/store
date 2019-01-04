import { TestBed } from '@angular/core/testing';

import { Store } from '../src/store';
import { NgxsModule } from '../src/ngxs.module';
import { State } from '../src/decorators/state';

describe('Duplicate states', () => {
  let warn: string[] = [];
  const warning = console.warn;
  console.warn = function() {
    warn = [].concat(Array.prototype.slice.call(arguments).join(' ') as any);
    warning.apply(console, arguments);
  };

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

  @State<string>({
    name: 'duplicate',
    defaults: 'third'
  })
  class MyFeatureState {}

  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([MyOtherState, MyDuplicateState]),
        NgxsModule.forFeature([MyFeatureState])
      ]
    });

    store = TestBed.get(Store);
  });

  it('should be checked duplicate state', () => {
    expect(warn).toEqual([
      'State name in MyDuplicateState already exists also in MyOtherState'
    ]);
  });

  it('should be correct value from state without override mounted state', () => {
    const value: string = store.selectSnapshot((state: any) => state.duplicate);
    expect(value).toEqual('first');
  });
});
