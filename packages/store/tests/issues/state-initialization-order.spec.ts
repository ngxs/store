import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  DispatchOutsideZoneNgxsExecutionStrategy,
  NgxsModule,
  State,
  Store
} from '@ngxs/store';

describe('State initialization order', () => {
  @Injectable()
  @State({ name: 'counter', defaults: 0 })
  class CounterState {}

  @Injectable()
  @State({ name: 'posts', defaults: 0 })
  class PostsState {}

  it('should log an error into the console when the state initialization order is invalid', () => {
    // Arrange
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();

    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forFeature([CounterState, PostsState]),
        NgxsModule.forRoot([], {
          executionStrategy: DispatchOutsideZoneNgxsExecutionStrategy
        })
      ]
    });

    // Act
    TestBed.inject(Store);

    try {
      // Assert
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringMatching(/invalid state initialization order/)
      );

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Feature states added before the store initialization is complete: "posts", "counter".'
        )
      );
    } finally {
      errorSpy.mockRestore();
    }
  });
});
