import { safePatch } from '@ngxs/store/operators';

describe('safePatch', () => {
  describe('when existing state is null', () => {
    it('treats existing as {} and returns patched object', () => {
      // Arrange & Act
      const newValue = safePatch<{ a: number }>({ a: 1 })(null as any);

      // Assert
      expect(newValue).toEqual({ a: 1 });
    });

    it('returns {} when patch spec is empty', () => {
      // Arrange & Act
      const newValue = safePatch<object>({})(null as any);

      // Assert
      expect(newValue).toEqual({});
    });
  });

  describe('when existing state is undefined', () => {
    it('treats existing as {} and returns patched object', () => {
      // Arrange & Act
      const newValue = safePatch<{ a: number }>({ a: 1 })(undefined as any);

      // Assert
      expect(newValue).toEqual({ a: 1 });
    });

    it('returns {} when patch spec is empty', () => {
      // Arrange & Act
      const newValue = safePatch<object>({})(undefined as any);

      // Assert
      expect(newValue).toEqual({});
    });
  });

  describe('when existing state is a valid object', () => {
    describe('with same values', () => {
      it('returns the same root', () => {
        // Arrange
        const original = { a: 1, b: 2 };

        // Act
        const newValue = safePatch({ a: 1 })(original);

        // Assert
        expect(newValue).toBe(original);
      });
    });

    describe('with different values', () => {
      it('returns a new root', () => {
        // Arrange
        const original = { a: 1, b: 2 };

        // Act
        const newValue = safePatch({ a: 99 })(original);

        // Assert
        expect(newValue).not.toBe(original);
      });

      it('returns a new root with changed property set', () => {
        // Arrange
        const original = { a: 1, b: 2, c: 3 };

        // Act
        const newValue = safePatch({ a: 99 })(original);

        // Assert
        expect(newValue).toEqual({ a: 99, b: 2, c: 3 });
      });

      it('returns a new root with multiple changed properties set', () => {
        // Arrange
        const original = { a: 1, b: 2, c: 3 };

        // Act
        const newValue = safePatch({ a: 10, b: 20 })(original);

        // Assert
        expect(newValue).toEqual({ a: 10, b: 20, c: 3 });
      });
    });

    describe('with nested safePatch operators', () => {
      it('returns a new root with deeply patched values', () => {
        // Arrange
        interface Model {
          a: number;
          b: { x: number; y?: number };
        }
        const original: Model = { a: 1, b: { x: 10 } };

        // Act
        const newValue = safePatch<Model>({
          b: safePatch<Model['b']>({ y: 99 })
        })(original);

        // Assert
        expect(newValue).toEqual({ a: 1, b: { x: 10, y: 99 } });
      });

      it('handles nested null state by treating it as {}', () => {
        // Arrange
        interface Model {
          a: number;
          b: { x: number } | null;
        }
        const original: Model = { a: 1, b: null };

        // Act
        const newValue = safePatch<Model>({
          b: safePatch<{ x: number }>({ x: 42 }) as any
        })(original);

        // Assert
        expect(newValue).toEqual({ a: 1, b: { x: 42 } });
      });
    });
  });
});
