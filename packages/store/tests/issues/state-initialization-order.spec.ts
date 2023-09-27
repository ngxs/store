import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgxsModule, State, Store } from '@ngxs/store';

describe('State stream order of updates', () => {
  @Injectable()
  @State({ name: 'counter', defaults: 0 })
  class CounterState {}

  it('should log an error into the console when the state initialization order is invalid', () => {
    // Arrange
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();

    TestBed.configureTestingModule({
      imports: [NgxsModule.forFeature([CounterState]), NgxsModule.forRoot()]
    });

    // Act
    TestBed.inject(Store);

    try {
      // Assert
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringMatching(/invalid state initialization order/)
      );
    } finally {
      errorSpy.mockRestore();
    }
  });
});
