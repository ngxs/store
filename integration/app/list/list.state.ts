import { State, Selector, NgxsOnInit, NgxsAfterBootstrap, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';

@State<string[]>({
  name: 'list',
  defaults: ['foo']
})
@Injectable()
export class ListState implements NgxsOnInit, NgxsAfterBootstrap {
  @Selector()
  static getHello(): string {
    return 'hello';
  }

  ngxsOnInit({ setState, getState }: StateContext<string[]>): void {
    setState([...getState(), 'NgxsOnInit lazy']);
  }

  ngxsAfterBootstrap({ setState, getState }: StateContext<string[]>): void {
    setState([...getState(), 'NgxsAfterBootstrap lazy']);
  }
}
