import { patch } from '../src/patch';
import { append } from '../src/append';

describe('append', () => {
  describe('when an empty array provided', () => {
    it('returns the same root', () => {
      // Arrange
      const original = { a: [1, 2, 3], b: [4, 5, 6] };

      // Act
      const newValue = patch({
        a: append(<number[]>[])
      })(original);

      // Assert
      expect(newValue).toBe(original);
    });
  });

  describe('when null provided', () => {
    it('returns the same root', () => {
      // Arrange
      const original = { a: [1, 2, 3], b: [4, 5, 6] };

      // Act
      const newValue = patch({
        a: append(null!)
      })(original);

      // Assert
      expect(newValue).toBe(original);
    });
  });

  describe('when undefined provided', () => {
    it('returns the same root', () => {
      // Arrange
      const original = { a: [1, 2, 3], b: [4, 5, 6] };

      // Act
      const newValue = patch({
        a: append(undefined!)
      })(original);

      // Assert
      expect(newValue).toBe(original);
    });
  });

  describe('when object with primitive property values provided', () => {
    describe('with different values', () => {
      it('returns new root if non-empty array array provided', () => {
        // Arrange
        const original = { a: [] };

        // Act
        const newValue = patch({
          a: append(<number[]>[1, 2])
        })(original);

        // Assert
        expect(newValue).not.toBe(original);
      });

      it('returns a new root with changed property set if non-empty array provided', () => {
        // Arrange
        const original = { a: [1, 2, 3] };

        // Act
        const newValue = patch({
          a: append([4, 5])
        })(original);

        // Assert
        expect(newValue).toEqual({
          a: [1, 2, 3, 4, 5]
        });
      });

      it('returns a new root with added properties set', () => {
        // Arrange
        interface Original {
          a: number[];
          b: number[];
          c: number[];
          d?: number[];
          e?: number[];
        }
        const original: Original = { a: [1, 2, 3], b: [1, 2, 3], c: [1, 2, 3] };

        // Act
        const newValue = patch({
          a: append([4, 5]),
          b: append([4, 5]),
          c: append([4, 5]),
          d: append(<number[]>[]),
          e: append(<number[]>[])
        })(original);

        // Assert
        expect(newValue).toEqual({
          a: [1, 2, 3, 4, 5],
          b: [1, 2, 3, 4, 5],
          c: [1, 2, 3, 4, 5],
          d: [],
          e: []
        });
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
          a: append([4, 5]),
          b: patch({
            goodbye: ['there']
          })
        })(original);

        // Assert
        expect(newValue).toEqual({
          a: [1, 2, 3, 4, 5],
          b: {
            hello: ['world'],
            goodbye: ['there']
          }
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
          beer: append([{ name: 'Alchemist', quantity: 10 }]),
          controller: append(['Max Ivanov']),
          nestedStock: {
            wine: [{ name: 'Centine', quantity: 10 }],
            nestedStock: {
              whiskey: [{ name: 'Jack Daniels' }]
            }
          }
        })(original);

        const newValue2 = patch<Stock>({
          nestedStock: patch({
            wine: append([{ name: 'Chablis', quantity: 20 }]),
            nestedStock: patch({
              whiskey: append([{ name: 'Chivas' }])
            })
          })
        })(newValue);

        // Assert
        expect(newValue).toEqual({
          beer: [
            {
              name: 'Colessi',
              quantity: 10
            },
            {
              name: 'BUNK!',
              quantity: 5
            },
            {
              name: 'Alchemist',
              quantity: 10
            }
          ],
          controller: ['Artur Androsovych', 'Mark Whitfield', 'Max Ivanov'],
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
              name: 'Colessi',
              quantity: 10
            },
            {
              name: 'BUNK!',
              quantity: 5
            },
            {
              name: 'Alchemist',
              quantity: 10
            }
          ],
          controller: ['Artur Androsovych', 'Mark Whitfield', 'Max Ivanov'],
          nestedStock: {
            wine: [
              {
                name: 'Centine',
                quantity: 10
              },
              {
                name: 'Chablis',
                quantity: 20
              }
            ],
            nestedStock: {
              whiskey: [
                {
                  name: 'Jack Daniels'
                },
                {
                  name: 'Chivas'
                }
              ]
            }
          }
        });
      });
    });
  });
});
