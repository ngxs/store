import { TestBed } from '@angular/core/testing';
import { ActionDirector, provideStore, Store } from '@ngxs/store';

import { AddCountry } from './fixtures/actions';
import { CountriesState } from './fixtures/state';

describe('ActionDirector', () => {
  it('should allow attaching action handlers on the fly', async () => {
    // Arrange
    TestBed.configureTestingModule({
      providers: [provideStore([CountriesState])]
    });

    const store = TestBed.inject(Store);

    // Act
    store.dispatch(new AddCountry('Canada'));

    // Assert
    expect(store.snapshot()).toEqual({ countries: [] });

    // Act
    const { addCountryActionHandler } = await import('./fixtures/add-country-action-handler');
    const handle = addCountryActionHandler(TestBed.inject(ActionDirector));

    store.dispatch(new AddCountry('Canada'));

    // Assert
    expect(store.snapshot()).toEqual({ countries: ['Canada'] });

    // Act
    handle.detach();
    store.dispatch(new AddCountry('Spain'));

    // Assert
    expect(store.snapshot()).toEqual({ countries: ['Canada'] });
  });
});
