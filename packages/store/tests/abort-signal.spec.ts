import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { Action, provideStore, State, StateContext, Store } from '@ngxs/store';

const { default: fetch, AbortError, FetchError } = require('node-fetch');

describe('AbortSignal', () => {
  const recorder: any[] = [];

  class AddCountry {
    static readonly type = 'AddCountry';

    constructor(readonly country: string) {}
  }

  class AddCountryUsingNodeFetch {
    static readonly type = 'AddCountryUsingNodeFetch';

    constructor(readonly country: string) {}
  }

  @State({
    name: 'countries',
    defaults: []
  })
  @Injectable()
  class CountriesState {
    @Action(AddCountry, { cancelUncompleted: true })
    async addCountry(ctx: StateContext<string[]>, action: AddCountry) {
      recorder.push('before await promise');
      await new Promise(resolve => setTimeout(resolve));
      recorder.push('after await promise');
      if (ctx.abortSignal.aborted) {
        recorder.push('abortSignal.aborted');
        return;
      }
      ctx.setState(countries => [...countries, action.country]);
      recorder.push('setState()');
    }

    @Action(AddCountryUsingNodeFetch, { cancelUncompleted: true })
    async addCountryUsingNodeFetch(ctx: StateContext<string[]>) {
      try {
        await fetch('http://localhost:4200/non-existing-url', { signal: ctx.abortSignal });
      } catch (error) {
        recorder.push(error);
        throw error;
      }
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore([CountriesState])]
    });
  });

  afterEach(() => {
    recorder.length = 0;
  });

  it('should abort an asynchronous action', async () => {
    // Arrange
    const store = TestBed.inject(Store);

    // Act
    store.dispatch(new AddCountry('Canada'));
    await firstValueFrom(store.dispatch(new AddCountry('Spain')));

    // Assert
    expect(recorder).toEqual([
      'before await promise',
      'before await promise',
      'after await promise',
      'abortSignal.aborted',
      'after await promise',
      'setState()'
    ]);
    expect(store.snapshot()).toEqual({ countries: ['Spain'] });
  });

  it('should not propagate an abort error when fetch is aborted', async () => {
    // Arrange
    expect.assertions(4);

    const store = TestBed.inject(Store);

    // Act
    try {
      store.dispatch(new AddCountryUsingNodeFetch('Canada'));
      await firstValueFrom(store.dispatch(new AddCountryUsingNodeFetch('Spain')));
    } catch (error) {
      expect(error).toBeInstanceOf(FetchError);

      expect(recorder.length).toEqual(2);
      expect(recorder[0]).toBeInstanceOf(AbortError);
      expect(recorder[1]).toBeInstanceOf(FetchError);
    }
  });
});
