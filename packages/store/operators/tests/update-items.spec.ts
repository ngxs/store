import { patch, updateItems } from '@ngxs/store/operators';

describe('update items', () => {
  describe('when existing is not an array', () => {
    it('returns an empty array', () => {
      // Arrange & Act
      const newValue = updateItems<number>(() => true, 0)(null!);

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
        a: updateItems<number>(() => true, 0)
      })(original);

      // Assert
      expect(newValue).toBe(original);
    });
  });

  describe('when no items match the predicate', () => {
    it('returns a new array with the same content', () => {
      // Arrange
      const original = { a: [1, 2, 3] };

      // Act
      const newValue = patch({
        a: updateItems<number>(n => n === 99, 0)
      })(original);

      // Assert
      expect(newValue['a']).toEqual([1, 2, 3]);
      expect(newValue['a']).not.toBe(original.a);
    });
  });

  describe('when a single item matches the predicate', () => {
    it('updates only the matching item with a value', () => {
      // Arrange
      const original = { a: [1, 2, 3] };

      // Act
      const newValue = patch({
        a: updateItems<number>(n => n === 2, 99)
      })(original);

      // Assert
      expect(newValue).toEqual({ a: [1, 99, 3] });
    });

    it('updates only the matching item with a state operator', () => {
      // Arrange
      const original = { a: [{ name: 'Artur' }, { name: 'Mark' }] };

      // Act
      const newValue = patch({
        a: updateItems<{ name: string }>(
          item => item!.name === 'Artur',
          patch({ name: 'ARTUR' })
        )
      })(original);

      // Assert
      expect(newValue).toEqual({ a: [{ name: 'ARTUR' }, { name: 'Mark' }] });
    });

    it('does not modify non-matching items', () => {
      // Arrange
      const original = { a: [{ name: 'Artur' }, { name: 'Mark' }] };

      // Act
      const newValue = patch({
        a: updateItems<{ name: string }>(
          item => item!.name === 'Artur',
          patch({ name: 'ARTUR' })
        )
      })(original);

      // Assert
      expect(newValue['a'][1]).toBe(original.a[1]);
    });
  });

  describe('when multiple items match the predicate', () => {
    it('updates all matching items with a value', () => {
      // Arrange
      const original = { a: [1, 2, 1, 3] };

      // Act
      const newValue = patch({
        a: updateItems<number>(n => n === 1, 99)
      })(original);

      // Assert
      expect(newValue).toEqual({ a: [99, 2, 99, 3] });
    });

    it('updates all matching items with a state operator', () => {
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
        a: updateItems<{ name: string; active: boolean }>(
          item => !item!.active,
          patch({ active: true })
        )
      })(original);

      // Assert
      expect(newValue).toEqual({
        a: [
          { name: 'Michael', active: true },
          { name: 'John', active: true },
          { name: 'Alan', active: true }
        ]
      });
    });
  });

  describe('when all items match the predicate', () => {
    it('updates every item', () => {
      // Arrange
      const original = { a: ['Jimmy', 'Jake', 'Alan'] };

      // Act
      const newValue = patch({
        a: updateItems<string>(() => true, 'updated')
      })(original);

      // Assert
      expect(newValue).toEqual({ a: ['updated', 'updated', 'updated'] });
    });
  });

  describe('when used with nested patch operators', () => {
    it('returns the deeply patched object', () => {
      // Arrange
      interface Game {
        name: string;
        active: boolean;
      }

      interface Account {
        name: string;
        games: Game[];
      }

      const original: Account = {
        name: 'Mark',
        games: [
          { name: 'CS:GO', active: true },
          { name: 'Dota 2', active: false },
          { name: 'TF2', active: false }
        ]
      };

      // Act
      const newValue = patch<Account>({
        games: updateItems<Game>(game => !game!.active, patch({ active: true }))
      })(original);

      // Assert
      expect(newValue).toEqual({
        name: 'Mark',
        games: [
          { name: 'CS:GO', active: true },
          { name: 'Dota 2', active: true },
          { name: 'TF2', active: true }
        ]
      });
    });
  });
});
