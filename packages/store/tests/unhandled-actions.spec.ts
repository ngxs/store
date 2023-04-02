import { TestBed } from '@angular/core/testing';
import {
  Store,
  NgxsModule,
  NgxsDevelopmentModule,
  NgxsUnhandledActionsLogger,
  NgxsDevelopmentOptions
} from '@ngxs/store';

describe('Unhandled actions warnings', () => {
  class FireAndForget {
    static readonly type = 'Fire & forget';
  }

  const plainObjectAction = { type: 'Fire & Forget' };

  const testSetup = (
    options: NgxsDevelopmentOptions | null = { warnOnUnhandledActions: true }
  ) => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([]), options ? NgxsDevelopmentModule.forRoot(options) : []]
    });

    const store = TestBed.inject(Store);
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const unhandledActionsLogger = TestBed.inject(NgxsUnhandledActionsLogger, null);
    return { store, warnSpy, unhandledActionsLogger };
  };

  it('should not warn on unhandled actions if the module is not provided', () => {
    // Arrange
    const { store, warnSpy } = testSetup(/* options */ null);
    // Act
    store.dispatch(new FireAndForget());
    // Assert
    try {
      expect(warnSpy).not.toHaveBeenCalled();
    } finally {
      warnSpy.mockRestore();
    }
  });

  describe('warn on unhandled actions', () => {
    it('should warn when the action is a class', () => {
      // Arrange
      const { store, warnSpy } = testSetup();
      const action = new FireAndForget();
      // Act
      store.dispatch(action);
      // Assert
      try {
        expect(warnSpy).toHaveBeenCalledTimes(1);
        expect(warnSpy).toHaveBeenCalledWith(
          `The FireAndForget action has been dispatched but hasn't been handled. This may happen if the state with an action handler for this action is not registered.`
        );
      } finally {
        warnSpy.mockRestore();
      }
    });

    it('should warn when the action is an object', () => {
      // Arrange
      const { store, warnSpy } = testSetup();
      // Act
      store.dispatch(plainObjectAction);
      // Assert
      try {
        expect(warnSpy).toHaveBeenCalledTimes(1);
        expect(warnSpy).toHaveBeenCalledWith(
          `The Fire & Forget action has been dispatched but hasn't been handled. This may happen if the state with an action handler for this action is not registered.`
        );
      } finally {
        warnSpy.mockRestore();
      }
    });

    it('should be possible to add custom actions which should be ignored through the module options', () => {
      // Arrange
      const { store, warnSpy } = testSetup({
        warnOnUnhandledActions: {
          ignore: [FireAndForget, plainObjectAction]
        }
      });
      // Act
      store.dispatch(new FireAndForget());
      store.dispatch(plainObjectAction);
      // Assert
      try {
        expect(warnSpy).not.toHaveBeenCalled();
      } finally {
        warnSpy.mockRestore();
      }
    });

    it('should be possible to add custom actions which should be ignored through the logger', () => {
      // Arrange
      const { store, warnSpy, unhandledActionsLogger } = testSetup();
      unhandledActionsLogger!.ignoreActions(FireAndForget, plainObjectAction);
      // Act
      store.dispatch(new FireAndForget());
      store.dispatch(plainObjectAction);
      // Assert
      try {
        expect(warnSpy).not.toHaveBeenCalled();
      } finally {
        warnSpy.mockRestore();
      }
    });
  });
});
