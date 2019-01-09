import { State, Selector, NgxsOnInit, NgxsAfterBootstrap, StateContext } from '@ngxs/store';

@State<string[]>({
  name: 'list',
  defaults: ['foo']
})
export class ListState implements NgxsOnInit, NgxsAfterBootstrap {
  @Selector()
  public static hello(): string {
    return 'hello';
  }

  public ngxsOnInit({ setState, getState }: StateContext<string[]>): void {
    setState([...getState(), 'NgxsOnInit feature']);
  }

  public ngxsAfterBootstrap({ setState, getState }: StateContext<string[]>): void {
    setState([...getState(), 'NgxsAfterBootstrap feature']);
  }
}
