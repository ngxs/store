import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgxsModule, State } from '@ngxs/store';

describe('NGXS', () => {
  it('should not warn if state class is not decorated with @Injectable()', async () => {
    // Arrange
    const spy = jest.spyOn(console, 'warn');

    @State({
      name: 'countries'
    })
    class CountriesState {}

    // Act
    await TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([CountriesState])],
      providers: [Injector]
    }).compileComponents();

    TestBed.get(CountriesState);

    // Assert
    expect(spy).toHaveBeenCalledTimes(0);
  });
});
