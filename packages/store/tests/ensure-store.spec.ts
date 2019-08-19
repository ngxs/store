import { TestBed } from '@angular/core/testing';
import { State, NgxsModule, ensureStoreMetadata, Action } from '@ngxs/store';

describe('Ensure store for plugins', () => {
  @State({ name: 'count', defaults: 0 })
  class CountState {
    @Action({ type: 'increment' })
    public addOne(): void {}

    @Action({ type: 'increment' })
    public addTwo(): void {}
  }

  beforeAll(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([CountState])]
    }).compileComponents();
  });

  it('should be get meta data from state', () => {
    expect(ensureStoreMetadata(CountState)).toEqual({
      name: 'count',
      actions: {
        increment: [
          { fn: 'addOne', options: {}, type: 'increment' },
          { fn: 'addTwo', options: {}, type: 'increment' }
        ]
      },
      defaults: 0,
      path: null,
      selectFromAppState: null,
      children: undefined,
      instance: null
    });
  });
});
