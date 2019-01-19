import { patch } from '../src/patch';
import { insertItem } from '../src/insert-item';

describe('insert item', () => {
  describe('when null provided', () => {
    it('returns the same root', () => {
      // Arrange
      const original = {
        a: []
      };

      // Act
      const newValue = patch({
        a: insertItem(null!)
      })(original);

      // Assert
      expect(newValue).toBe(original);
    });
  });

  describe('when undefined provided', () => {
    it('returns the same root', () => {
      // Arrange
      const original = {
        a: []
      };

      // Act
      const newValue = patch({
        a: insertItem(undefined!)
      })(original);

      // Assert
      expect(newValue).toBe(original);
    });
  });

  describe('when non-existing index provided', () => {
    it('returns a new root', () => {
      // Arrange
      const original = {
        a: [] as object[]
      };

      // Act
      const newValue = patch({
        a: insertItem({}, -1)
      })(original);

      // Assert
      expect(newValue).toEqual({
        a: [{}]
      });
    });
  });

  describe('when property is added dynamically', () => {
    it('returns a new root', () => {
      // Arrange
      const original: { a?: number[] } = {};

      // Act
      const newValue = patch({
        a: insertItem(10)
      })(original);

      // Assert
      expect(newValue).toEqual({
        a: [10]
      });
    });
  });

  describe('when object with primitive property values provided', () => {
    it('returns a new root', () => {
      // Arrange
      const original = {
        a: [{ name: 'Artur' }],
        b: [{ name: 'Mark' }]
      };

      // Act
      const newValue = patch({
        a: insertItem({ name: 'Androsovych' }, original.a.length),
        b: insertItem({ name: 'Whitfield' }, original.b.length)
      })(original);

      // Assert
      expect(newValue).toEqual({
        a: [{ name: 'Artur' }, { name: 'Androsovych' }],
        b: [{ name: 'Mark' }, { name: 'Whitfield' }]
      });
    });

    it('returns a new root', () => {
      // Arrange
      const original = {
        say: ['world']
      };

      // Act
      const newValue = patch({
        say: insertItem('hello', 0)
      })(original);

      // Assert
      expect(newValue).toEqual({
        say: ['hello', 'world']
      });
    });
  });

  describe('when object with nested patch operators provided', () => {
    describe('with different calculated values', () => {
      it('treats the nested object as a patch', () => {
        // Arrange
        interface Original {
          a: number[];
          b: {
            hello?: string[];
            goodbye?: string[];
          };
        }
        const original: Original = {
          a: [1, 2, 3],
          b: {
            hello: ['world']
          }
        };

        // Act
        const newValue = patch({
          a: insertItem(20),
          b: patch({
            goodbye: insertItem('there')
          })
        })(original);

        // Assert
        expect(newValue).toEqual({
          a: [20, 1, 2, 3],
          b: {
            hello: ['world'],
            goodbye: ['there']
          }
        });
      });
    });
  });

  describe('with nesting multiple levels deep', () => {
    it('returns the deeply patched object', () => {
      // Arrange
      interface Stock {
        beer: Beer[];
        controller: string[];
        nestedStock?: {
          wine: Wine[];
          nestedStock?: {
            whiskey: Whiskey[];
          };
        };
      }

      interface Beer {
        name: string;
        quantity: number;
      }

      interface Wine {
        name: string;
        quantity: number;
      }

      interface Whiskey {
        name: string;
      }

      const original: Stock = {
        beer: [
          {
            name: 'Colessi',
            quantity: 10
          },
          {
            name: 'BUNK!',
            quantity: 5
          }
        ],
        controller: ['Artur Androsovych', 'Mark Whitfield']
      };

      // Act
      const newValue = patch<Stock>({
        beer: insertItem({ name: 'Alchemist', quantity: 10 }),
        controller: insertItem('Max Ivanov'),
        nestedStock: {
          wine: [{ name: 'Centine', quantity: 10 }],
          nestedStock: {
            whiskey: [{ name: 'Jack Daniels' }]
          }
        }
      })(original);

      const newValue2 = patch<Stock>({
        nestedStock: patch({
          wine: insertItem({ name: 'Chablis', quantity: 20 }),
          nestedStock: patch({
            whiskey: insertItem({ name: 'Chivas' })
          })
        })
      })(newValue);

      // Assert
      expect(newValue).toEqual({
        beer: [
          {
            name: 'Alchemist',
            quantity: 10
          },
          {
            name: 'Colessi',
            quantity: 10
          },
          {
            name: 'BUNK!',
            quantity: 5
          }
        ],
        controller: ['Max Ivanov', 'Artur Androsovych', 'Mark Whitfield'],
        nestedStock: {
          wine: [
            {
              name: 'Centine',
              quantity: 10
            }
          ],
          nestedStock: {
            whiskey: [
              {
                name: 'Jack Daniels'
              }
            ]
          }
        }
      });

      expect(newValue2).toEqual({
        beer: [
          {
            name: 'Alchemist',
            quantity: 10
          },
          {
            name: 'Colessi',
            quantity: 10
          },
          {
            name: 'BUNK!',
            quantity: 5
          }
        ],
        controller: ['Max Ivanov', 'Artur Androsovych', 'Mark Whitfield'],
        nestedStock: {
          wine: [
            {
              name: 'Chablis',
              quantity: 20
            },
            {
              name: 'Centine',
              quantity: 10
            }
          ],
          nestedStock: {
            whiskey: [
              {
                name: 'Chivas'
              },
              {
                name: 'Jack Daniels'
              }
            ]
          }
        }
      });
    });
  });
});
