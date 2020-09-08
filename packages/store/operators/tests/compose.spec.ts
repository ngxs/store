import { iif } from '../src/iif';
import { patch } from '../src/patch';
import { append } from '../src/append';
import { compose } from '../src/compose';
import { removeItem } from '../src/remove-item';
import { updateItem } from '../src/update-item';
import { insertItem } from '../src/insert-item';

describe('compose', () => {
  describe('compose with objects', () => {
    it('returns the same root', () => {
      // Arrange
      const original = {
        a: {
          hello: 'world'
        }
      };

      // Act
      const newValue = patch({
        a: patch({
          hello: compose(iif(() => true, 'world'))
        })
      })(original);

      // Assert
      expect(newValue).toBe(original);
    });

    it('returns the same root', () => {
      // Arrange
      const original = {
        a: {
          hello: 'world'
        }
      };

      // Act
      const newValue = patch({
        a: compose<typeof original['a']>(
          iif<typeof original['a']>(
            a => a!.hello === 'world',
            patch({
              hello: 'world'
            })
          )
        )
      })(original);

      // Assert
      expect(newValue).toBe(original);
    });

    it('returns a new root', () => {
      // Arrange
      const original = {
        a: 1,
        b: 2,
        c: 3
      };

      // Act
      const newValue = compose<typeof original>(
        patch({ a: 10 }),
        iif<typeof original>(object => object!.b === 2, patch({ b: 20 })),
        iif<typeof original>(object => object!.c === 3, patch({ c: 30 }))
      )(original);

      // Assert
      expect(newValue).toEqual({
        a: 10,
        b: 20,
        c: 30
      });
    });

    it('returns the same root', () => {
      // Arrange
      const original = {
        a: {
          hello: 'world'
        },
        b: {
          goodbye: 'there'
        },
        c: {
          hey: 'again'
        }
      };

      // Act
      const newValue = patch({
        a: compose(patch({ hello: 'world' })),
        b: compose(patch({ goodbye: 'there' })),
        c: compose(patch({ hey: 'again' }))
      })(original);

      // Assert
      expect(newValue).toBe(original);
    });
  });

  describe('compose with arrays', () => {
    it('returns the same root', () => {
      // Arrange
      const original = {
        a: [1, 2, 3]
      };

      // Act
      const newValue = patch({
        a: compose(iif<number[]>(numbers => numbers!.length === 3, updateItem(0, 1)))
      })(original);

      // Assert
      expect(newValue).toBe(original);
    });

    it('returns a new root', () => {
      // Arrange
      const original = {
        a: [1, 2, 3]
      };

      // Act
      const newValue = patch({
        a: compose(
          removeItem<number>(number => number! === 1),
          updateItem<number>(number => number === 2, 2),
          append([4, 5, 6])
        )
      })(original);

      // Assert
      expect(newValue).toEqual({
        a: [2, 3, 4, 5, 6]
      });
    });

    it('returns a new root', () => {
      // Arrange
      const original = {
        a: ['hello', 'world'],
        b: ['goodbye', 'there']
      };

      // Act
      const newValue = patch({
        a: compose(
          iif<string[]>(
            words => words!.includes('hello'),
            insertItem('again', original.a.length),
            insertItem('not again')
          )
        ),
        b: compose<string[]>(
          removeItem(0),
          removeItem(0),
          append(['GOODBYE', 'THERE']),
          insertItem('AGAIN', original.b.length)
        )
      })(original);

      // Assert
      expect(newValue).toEqual({
        a: ['hello', 'world', 'again'],
        b: ['GOODBYE', 'THERE', 'AGAIN']
      });
    });
  });

  describe('compose with objects and arrays', () => {
    it('returns the same root', () => {
      // Arrange
      const original = {
        a: [{ name: 'Mark' }],
        b: {
          numbers: [1, 2, 3, 4, 5]
        },
        c: {
          hello: 'world'
        }
      };

      // Act
      const newValue = patch({
        a: compose(
          iif(
            a => Array.isArray(a) && a[0].name === 'Mark',
            updateItem(
              0,
              patch({
                name: 'Mark'
              })
            )
          )
        ),
        b: patch({
          numbers: updateItem(0, 1)
        }),
        c: patch({
          hello: iif(word => word === 'hello', 'hello', 'world')
        })
      })(original);

      // Assert
      expect(newValue).toBe(original);
    });

    it('returns a new root', () => {
      // Arrange
      interface Original {
        a: { name: string }[];
        b: {
          numbers: number[];
        };
        c: {
          hello: string;
        };
      }
      const original: Original = {
        a: [{ name: 'Mark' }],
        b: {
          numbers: [1, 2, 3, 4, 5]
        },
        c: {
          hello: 'world'
        }
      };

      // Act
      const newValue = patch({
        a: compose<Original['a']>(
          removeItem(0),
          append([{ name: 'Artur' }])
        ),
        b: patch({
          numbers: compose(
            iif<Original['b']['numbers']>(
              numbers => numbers!.length === 5,
              compose(
                removeItem(0),
                removeItem(0),
                insertItem(10)
              )
            )
          )
        }),
        c: patch({
          hello: 'there'
        })
      })(original);

      // Assert
      expect(newValue).toEqual({
        a: [
          {
            name: 'Artur'
          }
        ],
        b: {
          numbers: [10, 3, 4, 5]
        },
        c: {
          hello: 'there'
        }
      });
    });
  });

  describe('compose with with nesting multiple levels deep', () => {
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
        beer: compose<Beer[]>(
          removeItem(beer => beer!.name === 'BUNK!'),
          insertItem({ name: 'Corona', quantity: 10 }),
          append([{ name: 'Corona', quantity: 10 }])
        ),
        controller: iif(
          controllers => !controllers!.includes('Max Ivanov'),
          append(['Max Ivanov'])
        ),
        nestedStock: {
          wine: [],
          nestedStock: {
            whiskey: []
          }
        }
      })(original);

      const newValue2 = patch({
        nestedStock: patch({
          wine: compose(
            iif<Wine[]>(
              wines => wines!.length === 0,
              append([{ name: 'Geneve', quantity: 10 }])
            ),
            insertItem({ name: 'Geneve 2', quantity: 20 })
          ),
          nestedStock: patch({
            whiskey: compose(
              append([{ name: 'Jack Daniels' }]),
              removeItem(1),
              updateItem(0, { name: 'Jack Daniels 2' })
            )
          })
        })
      })(newValue);

      // Assert
      expect(newValue).toEqual({
        beer: [
          {
            name: 'Corona',
            quantity: 10
          },
          {
            name: 'Colessi',
            quantity: 10
          },
          {
            name: 'Corona',
            quantity: 10
          }
        ],
        controller: ['Artur Androsovych', 'Mark Whitfield', 'Max Ivanov'],
        nestedStock: {
          wine: [],
          nestedStock: {
            whiskey: []
          }
        }
      });

      expect(newValue2).toEqual({
        beer: [
          {
            name: 'Corona',
            quantity: 10
          },
          {
            name: 'Colessi',
            quantity: 10
          },
          {
            name: 'Corona',
            quantity: 10
          }
        ],
        controller: ['Artur Androsovych', 'Mark Whitfield', 'Max Ivanov'],
        nestedStock: {
          wine: [
            {
              name: 'Geneve 2',
              quantity: 20
            },
            {
              name: 'Geneve',
              quantity: 10
            }
          ],
          nestedStock: {
            whiskey: [
              {
                name: 'Jack Daniels 2'
              }
            ]
          }
        }
      });
    });
  });
});
