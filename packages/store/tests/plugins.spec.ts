import { TestBed } from '@angular/core/testing';
import { NgxsModule, NGXS_PLUGINS, Store } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

describe('Plugins', () => {
  it('should run a function plugin', () => {
    let pluginInvoked = 0;

    class Foo {
      static readonly type = 'Foo';
    }

    function logPlugin(
      state: any,
      action: any,
      next: (state: any, action: any) => Observable<any>
    ) {
      if (action.constructor && action.constructor.type === 'Foo') {
        pluginInvoked++;
      }

      return next(state, action).pipe(
        tap(() => {
          if (action.constructor.type === 'Foo') {
            pluginInvoked++;
          }
        })
      );
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot()],
      providers: [
        {
          provide: NGXS_PLUGINS,
          useValue: logPlugin,
          multi: true
        }
      ]
    });

    const store: Store = TestBed.inject(Store);
    store.dispatch(new Foo());

    expect(pluginInvoked).toEqual(2);
  });
});
