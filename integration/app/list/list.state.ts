import { State, Selector, NgxsOnInit, NgxsAfterBootstrap, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';

@State<string[]>({
  name: 'list',
  defaults: ['foo']
})
@Injectable()
export class ListState implements NgxsOnInit, NgxsAfterBootstrap {
  @Selector()
  public static hello(): string {
    return 'hello';
  }

  public ngxsOnInit({ setState, getState }: StateContext<string[]>): void {
    setState([...getState(), 'NgxsOnInit lazy']);
  }

  public ngxsAfterBootstrap({ setState, getState }: StateContext<string[]>): void {
    setState([...getState(), 'NgxsAfterBootstrap lazy']);
  }
}
