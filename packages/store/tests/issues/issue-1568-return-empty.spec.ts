import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { NgxsModule, State, Action, Store, Actions } from '@ngxs/store';

describe('https://github.com/ngxs/store/issues/1568', () => {
  class MyAction {
    static type = '[MyState] My action';
  }

  @State<string>({
    name: 'myState',
    defaults: 'STATE_VALUE'
  })
  @Injectable()
  class MyState {
    @Action(MyAction)
    handleAction(): Observable<string> {
      return of('handleAction()');
    }

    @Action(MyAction)
    handleAction1(): Observable<never> {
      return of();
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MyState])]
    });
  });

  it('MyAction should not be canceled', () => {
    // Arrange
    const store = TestBed.inject(Store);
    const actions$ = TestBed.inject(Actions);
    const contexts: any[] = [];

    // Act
    const subscription = actions$.subscribe(ctx => {
      contexts.push(ctx);
    });

    store.dispatch(new MyAction());

    // Assert
    expect(contexts).toEqual([
      {
        action: {},
        status: 'DISPATCHED'
      },
      {
        action: {},
        status: 'SUCCESSFUL'
      }
    ]);

    subscription.unsubscribe();
  });
});
