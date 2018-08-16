import { TestBed } from '@angular/core/testing';
import { NgxsModule } from '../src/module';
import { NGXS_PLUGINS } from '../src/plugin_api';
import { Store } from '../src/store';
import { tap } from 'rxjs/operators';

describe('Plugins', () => {
  it('should run a function plugin', () => {
    const spy = jasmine.createSpy('plugin spy');

    class Foo {
      static readonly type = 'Foo';
    }

    function logPlugin(state, action, next) {
      if (action.constructor.type === 'Foo') {
        spy();
      }

      return next(state, action).pipe(
        tap(() => {
          if (action.constructor.type === 'Foo') {
            spy();
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

    const store: Store = TestBed.get(Store);
    store.dispatch(new Foo());

    expect(spy).toHaveBeenCalledTimes(2);
  });
});
