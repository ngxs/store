import { patch } from '../src/patch';
import { updateItem } from '../src/update-item';

describe('update item', () => {
  describe('when null provided', () => {
    it('returns the same root', () => {
      // Arrange
      const original = { a: [] };

      // Act
      const newValue = patch({
        a: updateItem(null!, {})
      })(original);

      // Assert
      expect(newValue).toBe(original);
    });
  });

  describe('when undefined provided', () => {
    it('returns the same root', () => {
      // Arrange
      const original = { a: [] };

      // Act
      const newValue = patch({
        a: updateItem(undefined!, {})
      })(original);

      // Assert
      expect(newValue).toBe(original);
    });
  });

  describe('when same values provided', () => {
    it('returns the same root', () => {
      // Arrange
      const original = {
        a: [1, 2, 3]
      };

      // Act
      const newValue = patch({
        a: updateItem(item => item === 2, 2)
      })(original);

      // Assert
      expect(newValue).toBe(original);
    });

    it('returns the same root', () => {
      // Arrange
      const original = {
        a: [{ name: 'Mark' }]
      };

      // Act
      const newValue = patch({
        a: updateItem(0, patch({ name: 'Mark' }))
      })(original);

      // Assert
      expect(newValue).toBe(original);
    });
  });

  describe('when object with primitive property values provided', () => {
    describe('with different values', () => {
      it('returns a new root', () => {
        // Arrange
        const original = {
          a: [{ name: 'Artur' }]
        };

        // Act
        const newValue = patch({
          a: updateItem(0, { name: 'Mark' })
        })(original);

        // Assert
        expect(newValue).not.toBe(original);
      });

      it('returns a new root with changed item in array if index provided', () => {
        // Arrange
        const original = {
          a: [{ name: 'Artur' }]
        };

        // Act
        const newValue = patch({
          a: updateItem(0, { name: 'Mark' })
        })(original);

        // Assert
        expect(newValue).toEqual({
          a: [{ name: 'Mark' }]
        });
      });

      it('returns a new root with changed item in array if predicate provided', () => {
        // Arrange
        const original = {
          a: [{ name: 'Artur' }]
        };

        // Act
        const newValue = patch({
          a: updateItem(item => item!.name === 'Artur', { name: 'Mark' })
        })(original);

        // Assert
        expect(newValue).toEqual({
          a: [{ name: 'Mark' }]
        });
      });

      it('returns a new root with changed item in array if operator provided', () => {
        // Arrange
        const original = {
          a: [{ name: 'Artur' }]
        };

        // Act
        const newValue = patch({
          a: updateItem(0, patch({ name: 'Mark' }))
        })(original);

        // Assert
        expect(newValue).toEqual({
          a: [{ name: 'Mark' }]
        });
      });
    });
  });

  describe('when object with object property values provided', () => {
    describe('with different values', () => {
      it('returns a new root', () => {
        // Arrange
        const original = {
          a: 1,
          b: {
            hello: ['world']
          }
        };

        // Act
        const newValue = patch({
          b: patch({
            hello: updateItem(0, 'WORLD')
          })
        })(original);

        // Assert
        expect(newValue).not.toBe(original);
      });

      it('returns a new root with changed property set', () => {
        // Arrange
        const original = {
          a: 1,
          b: {
            hello: ['world']
          }
        };

        // Act
        const newValue = patch({
          b: patch({
            hello: updateItem(0, 'you')
          })
        })(original);

        // Assert
        expect(newValue).toEqual({
          a: 1,
          b: {
            hello: ['you']
          }
        });
      });

      it('does not treat the nested object as a patch', () => {
        // Arrange
        interface MyObj {
          a: number;
          b: {
            hello?: string;
            goodbye: string | null;
          };
        }
        const original: MyObj = { a: 1, b: { hello: 'world', goodbye: null } };

        // Act
        const newValue = patch<MyObj>({ b: { goodbye: 'there' } })(original);

        // Assert
        expect(newValue).toEqual({ a: 1, b: { goodbye: 'there' } });
      });
    });

    describe('with similar values', () => {
      it('returns a new root', () => {
        // Arrange
        const original = { a: 1, b: { hello: 'world' } };

        // Act
        const newValue = patch({ b: { hello: 'world' } })(original);

        // Assert
        expect(newValue).not.toBe(original);
      });

      it('returns a new root with changed property set', () => {
        // Arrange
        const original = { a: 1, b: { hello: 'world' } };

        // Act
        const newValue = patch({ b: { hello: 'world' } })(original);

        // Assert
        expect(newValue).toEqual({ a: 1, b: { hello: 'world' } });
      });
    });

    describe('with same values', () => {
      it('returns the same root', () => {
        // Arrange
        const original = { a: 1, b: { hello: 'world' } };

        // Act
        const newValue = patch({ b: original.b })(original);

        // Assert
        expect(newValue).toBe(original);
      });
    });
  });
});
