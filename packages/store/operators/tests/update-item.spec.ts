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
        a: [{ name: 'Mark' }, { name: 'Artur' }]
      };

      // Act
      const newValue = patch({
        a: updateItem<{ name: string }>(item => item!.name === 'Mark', patch({ name: 'Mark' }))
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
        interface Original {
          a: number[];
          b: {
            hello: string[];
            goodbye: string[];
          };
        }
        const original: Original = {
          a: [1, 2, 3],
          b: {
            hello: ['world'],
            goodbye: ['there']
          }
        };

        // Act
        const newValue = patch({
          a: updateItem(item => item === 3, 3),
          b: patch({
            hello: updateItem(item => item === 'world', 'world'),
            goodbye: updateItem(0, 'there')
          })
        })(original);

        // Assert
        expect(newValue).toEqual(original);
      });
    });

    describe('with same values', () => {
      it('returns the same root', () => {
        // Arrange
        const original = {
          a: [1, 2, 3],
          b: [4, 5, 6]
        };

        // Act
        const newValue = patch({
          b: updateItem(item => item === 6, original.b[2])
        })(original);

        // Assert
        expect(newValue).toBe(original);
      });
    });
  });

  describe('when object with nested patch operators provided', () => {
    describe('with nesting multiple levels deep', () => {
      it('returns the deeply patched object', () => {
        // Arrange
        interface Person {
          name: string;
          lastName?: string;
          nickname?: string;
        }

        interface Greeting {
          enthusiastic?: boolean;
          person: Person;
        }

        interface Model {
          a: number;
          b: {
            hello?: Greeting[];
            goodbye?: Greeting[];
            greeting?: string[];
          };
          c?: number;
        }

        const original: Model = {
          a: 1,
          b: {
            hello: [
              {
                person: {
                  name: 'you'
                }
              }
            ],
            goodbye: [
              {
                person: {
                  name: 'Mark'
                }
              }
            ]
          }
        };

        // Act
        const newValue = patch({
          b: patch({
            hello: updateItem<Greeting>(item => item!.person.name === 'you', {
              enthusiastic: true,
              person: {
                name: 'Artur',
                lastName: 'Androsovych'
              }
            }),
            goodbye: updateItem<Greeting>(item => item!.person.name === 'Mark', {
              enthusiastic: true,
              person: {
                name: 'Mark',
                lastName: 'Whitfield'
              }
            })
          })
        })(original);

        // Assert
        expect(newValue).toEqual({
          a: 1,
          b: {
            hello: [
              {
                enthusiastic: true,
                person: {
                  name: 'Artur',
                  lastName: 'Androsovych'
                }
              }
            ],
            goodbye: [
              {
                enthusiastic: true,
                person: {
                  name: 'Mark',
                  lastName: 'Whitfield'
                }
              }
            ]
          }
        });
      });

      it(`doesn't run a patch nested two levels deep`, () => {
        // Arrange
        interface Account {
          name: string;
          games: Game[];
        }

        interface Game {
          name: string;
          categories: Category[];
          time: Time[];
        }

        interface Time {
          since?: number;
          till: number;
        }

        interface Category {
          name: string;
        }

        const original: Account = {
          name: 'Mark',
          games: [
            {
              name: 'CS:GO',
              categories: [{ name: 'shooter' }, { name: 'action' }],
              time: [{ since: 2014, till: 2017 }]
            }
          ]
        };

        // Act
        const newValue = patch({
          games: updateItem<Game>(
            item => item!.name === 'CS:GO',
            patch({
              categories: updateItem(
                item => item!.name === 'shooter',
                patch({ name: 'shooter' })
              )
            })
          )
        })(original);

        // Assert
        expect(newValue).toBe(original);
      });
    });
  });
});
