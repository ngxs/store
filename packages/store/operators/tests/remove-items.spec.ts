import { patch, removeItems } from '@ngxs/store/operators';

describe('remove items', () => {
  describe('when existing is not an array', () => {
    it('returns an empty array', () => {
      // Arrange & Act
      const newValue = removeItems<number>(() => true)(null!);

      // Assert
      expect(newValue).toEqual([]);
    });
  });

  describe('when existing is an empty array', () => {
    it('returns the same reference', () => {
      // Arrange
      const original = { a: [] as number[] };

      // Act
      const newValue = patch({
        a: removeItems<number>(() => true)
      })(original);

      // Assert
      expect(newValue).toBe(original);
    });
  });

  describe('when no items match the predicate', () => {
    it('returns the same reference', () => {
      // Arrange
      const original = { a: [1, 2, 3] };

      // Act
      const newValue = patch({
        a: removeItems<number>(n => n === 99)
      })(original);

      // Assert
      expect(newValue).toBe(original);
    });
  });

  describe('when a single item matches the predicate', () => {
    it('returns a new array without the matching item', () => {
      // Arrange
      const original = { a: [1, 2, 3] };

      // Act
      const newValue = patch({
        a: removeItems<number>(n => n === 2)
      })(original);

      // Assert
      expect(newValue).toEqual({ a: [1, 3] });
    });

    it('returns a new array reference', () => {
      // Arrange
      const original = { a: [1, 2, 3] };

      // Act
      const newValue = patch({
        a: removeItems<number>(n => n === 2)
      })(original);

      // Assert
      expect(newValue['a']).not.toBe(original.a);
    });
  });

  describe('when multiple items match the predicate', () => {
    it('removes all matching items', () => {
      // Arrange
      const original = { a: [1, 2, 1, 3] };

      // Act
      const newValue = patch({
        a: removeItems<number>(n => n === 1)
      })(original);

      // Assert
      expect(newValue).toEqual({ a: [2, 3] });
    });

    it('removes all matching objects', () => {
      // Arrange
      const original = {
        a: [
          { name: 'Michael', active: false },
          { name: 'John', active: true },
          { name: 'Alan', active: false }
        ]
      };

      // Act
      const newValue = patch({
        a: removeItems<{ name: string; active: boolean }>(item => !item!.active)
      })(original);

      // Assert
      expect(newValue).toEqual({
        a: [{ name: 'John', active: true }]
      });
    });
  });

  describe('when all items match the predicate', () => {
    it('returns an empty array', () => {
      // Arrange
      const original = { a: [1, 2, 3] };

      // Act
      const newValue = patch({
        a: removeItems<number>(() => true)
      })(original);

      // Assert
      expect(newValue).toEqual({ a: [] });
    });

    it('does not return the original reference', () => {
      // Arrange
      const original = { a: [1, 2, 3] };

      // Act
      const newValue = patch({
        a: removeItems<number>(() => true)
      })(original);

      // Assert
      expect(newValue['a']).not.toBe(original.a);
    });
  });

  describe('when used with nested patch operators', () => {
    it('returns the deeply patched object', () => {
      // Arrange
      interface Animal {
        name: string;
        active: boolean;
      }

      interface AnimalsStateModel {
        zebras: Animal[];
        pandas: Animal[];
      }

      const original: AnimalsStateModel = {
        zebras: [
          { name: 'Jimmy', active: true },
          { name: 'Jake', active: false }
        ],
        pandas: [
          { name: 'Michael', active: false },
          { name: 'John', active: true }
        ]
      };

      // Act
      const newValue = patch<AnimalsStateModel>({
        zebras: removeItems<Animal>(a => !a.active),
        pandas: removeItems<Animal>(a => !a.active)
      })(original);

      // Assert
      expect(newValue).toEqual({
        zebras: [{ name: 'Jimmy', active: true }],
        pandas: [{ name: 'John', active: true }]
      });
    });
  });
});
