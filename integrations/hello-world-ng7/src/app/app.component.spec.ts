import { TestBed } from '@angular/core/testing';
import { State, NgxsModule } from '@ngxs/store';

describe('NGXS', () => {
  it('should not warn if state class is not decorated with @Injectable()', () => {
    // Arrange
    const spy = jest.spyOn(console, 'warn');

    @State({
      name: 'countries'
    })
    class CountriesState {}

    // Act
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([CountriesState])]
    });

    TestBed.inject(CountriesState);

    // Assert
    expect(spy).toHaveBeenCalledTimes(0);
  });
});
