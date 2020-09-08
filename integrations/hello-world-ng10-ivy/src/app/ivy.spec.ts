import { ɵivyEnabled as ivyEnabled } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { State, NgxsModule } from '@ngxs/store';

describe('NGXS with Ivy enabled', () => {
  it('ivy has to be enabled', () => {
    // This assertion has to be performed as we have to
    // be sure that we're running these tests with the Ivy engine
    expect(ivyEnabled).toBeTruthy();
  });

  it('should warn if state class is not decorated with @Injectable()', () => {
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
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(
      `'CountriesState' class should be decorated with @Injectable() right after the @State() decorator`
    );
  });
});
