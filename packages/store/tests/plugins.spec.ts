import { assertInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgxsModule, NGXS_PLUGINS, Store, NgxsNextPluginFn, InitState } from '@ngxs/store';
import { debounceTime, firstValueFrom, tap } from 'rxjs';

describe('Plugins', () => {
  it('should run a function plugin (within an injection context too)', async () => {
    // Arrange
    const recorder: any[] = [];

    class Foo {
      static readonly type = 'Foo';
    }

    function asyncLogPlugin(state: any, action: any, next: NgxsNextPluginFn) {
      assertInInjectionContext(asyncLogPlugin);

      if (action.constructor.type === 'Foo') {
        recorder.push(['asyncLogPlugin()', action, 'before next()']);
      }

      return next(state, action).pipe(
        debounceTime(0),
        tap(() => {
          if (action.constructor.type === 'Foo') {
            recorder.push(['asyncLogPlugin()', action, 'after next()']);
          }
        })
      );
    }

    function otherPlugin(state: any, action: any, next: NgxsNextPluginFn) {
      assertInInjectionContext(otherPlugin);
      recorder.push(['otherPlugin()', action]);
      return next(state, action);
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot()],
      providers: [
        {
          provide: NGXS_PLUGINS,
          useValue: asyncLogPlugin,
          multi: true
        },
        {
          provide: NGXS_PLUGINS,
          useValue: otherPlugin,
          multi: true
        }
      ]
    });

    // Act
    const store = TestBed.inject(Store);

    // Assert
    expect(recorder).toEqual([['otherPlugin()', new InitState()]]);

    // Act
    const action = new Foo();
    await firstValueFrom(store.dispatch(action));

    // Assert
    expect(recorder).toEqual([
      ['otherPlugin()', new InitState()],
      ['asyncLogPlugin()', action, 'before next()'],
      ['otherPlugin()', action],
      ['asyncLogPlugin()', action, 'after next()']
    ]);
  });
});
