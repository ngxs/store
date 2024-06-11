import { Component, Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Action, NgxsModule, Selector, State, StateContext, Store } from '@ngxs/store';
import { switchMap, tap } from 'rxjs/operators';

describe('Select once after dispatch (https://github.com/ngxs/store/issues/1976)', () => {
  class Add {
    static readonly type = 'Add';
  }

  @State<number>({
    name: 'counter',
    defaults: 0
  })
  @Injectable()
  class CounterState {
    @Selector()
    static magicNumber(): number {
      return 42;
    }

    @Action(Add)
    add(ctx: StateContext<number>) {
      const state = ctx.getState();
      ctx.setState(state + 1);
    }
  }

  @Component({
    template: `
      <h1>{{ counter$ | async }}</h1>
      <button (click)="dispatch()">Click me</button>
    `
  })
  class TestComponent {
    selectSnapshotValue: number | null = null;
    selectOnceValue: number | null = null;

    constructor(private store: Store) {}

    dispatch(): void {
      this.store
        .selectOnce(CounterState.magicNumber)
        .pipe(
          switchMap(() => this.store.dispatch(new Add())),
          tap(() => {
            this.selectSnapshotValue = this.store.selectSnapshot(CounterState);
          }),
          switchMap(() => this.store.selectOnce(CounterState))
        )
        .subscribe(selectOnceValue => {
          this.selectOnceValue = selectOnceValue;
        });
    }
  }

  it('should receive the latest value (previously it was a bug because of refCount() which made observable cold)', async () => {
    // Arrange
    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [NgxsModule.forRoot([CounterState])]
    });

    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    // Act
    document.querySelector('button')!.click();

    // Assert
    expect(fixture.componentInstance.selectSnapshotValue).toEqual(1);
    expect(fixture.componentInstance.selectOnceValue).toEqual(1);
  });
});
