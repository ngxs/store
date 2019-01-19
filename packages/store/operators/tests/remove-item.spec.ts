import { patch } from '../src/patch';
import { removeItem } from '../src/remove-item';

describe('remove item', () => {
  describe('when null provided', () => {
    it('returns the same root', () => {
      // Arrange
      const original = {
        a: []
      };

      // Act
      const newValue = patch({
        a: removeItem(null!)
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
        a: removeItem(undefined!)
      })(original);

      // Assert
      expect(newValue).toBe(original);
    });
  });

  describe('when different values provided', () => {
    it('returns a new root', () => {
      // Arrange
      const original = {
        a: [1, 2, 3]
      };

      // Act
      const newValue = patch({
        a: removeItem(0)
      })(original);

      // Assert
      expect(newValue).not.toBe(original);
    });

    it('returns a new root without item if index provided', () => {
      // Arrange
      const original = {
        a: [1, 2, 3]
      };

      // Act
      const newValue = patch({
        a: removeItem(0)
      })(original);

      // Assert
      expect(newValue).toEqual({
        a: [2, 3]
      });
    });

    it('returns a new root without item if predicate provided', () => {
      // Arrange
      const original = {
        a: [1, 2, 3]
      };

      // Act
      const newValue = patch({
        a: removeItem(number => number === 1)
      })(original);

      // Assert
      expect(newValue).toEqual({
        a: [2, 3]
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
          a: number[];
          b: {
            hello?: Greeting[];
            goodbye?: Greeting[];
            greeting?: string[];
          };
        }

        const original: Model = {
          a: [1, 2, 3, 4, 5],
          b: {
            hello: [
              {
                person: {
                  name: 'you'
                }
              },
              {
                person: {
                  name: 'YOU'
                }
              }
            ],
            goodbye: [
              {
                person: {
                  name: 'Mark'
                }
              },
              {
                person: {
                  name: 'Artur'
                }
              }
            ]
          }
        };

        // Act
        const newValue = patch({
          a: removeItem(number => number === 5),
          b: patch({
            hello: removeItem<Greeting>(greeting => greeting!.person.name === 'YOU'),
            goodbye: removeItem<Greeting>(greeting => greeting!.person.name === 'Artur')
          })
        })(original);

        // Assert
        expect(newValue).toEqual({
          a: [1, 2, 3, 4],
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
        });
      });
    });
  });
});
