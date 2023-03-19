import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgxsModule, State, Store } from '@ngxs/store';

describe('Last select value (https://github.com/ngxs/store/issues/1880)', () => {
  @State<number>({
    name: 'counter',
    defaults: 0
  })
  @Injectable()
  class CounterState {}

  it('should receive the latest value (previously it was a bug because of refCount() which made observable cold)', async () => {
    // Arrange
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([CounterState])]
    });

    const store = TestBed.inject(Store);

    // Act
    // This is done explicitly to make stream cold.
    store.select(CounterState).subscribe().unsubscribe();

    store.reset({ counter: 3 });

    // Assert
    expect(store.selectSnapshot(CounterState)).toEqual(3);
    // Previously, it would've returned `0`, because of `refCount()`.
    expect(await store.selectOnce(CounterState).toPromise()).toEqual(3);
  });
});
