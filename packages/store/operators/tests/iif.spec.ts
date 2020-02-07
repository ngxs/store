import { iif } from '../src/iif';
import { patch } from '../src/patch';

describe('iif', () => {
  describe('when null condition provided', () => {
    it('returns the same root if "else" not provided', () => {
      // Arrange
      const original = { a: 1, b: 2, c: 3 };

      // Act
      const newValue = patch({
        a: iif(null!, 1)
      })(original);

      // Assert
      expect(newValue).toBe(original);
    });

    it('returns the same root if "else" provides same value as existing', () => {
      // Arrange
      const original = { a: 1, b: 2, c: 3 };

      // Act
      const newValue = patch({
        a: iif(null!, 10, 1)
      })(original);

      // Assert
      expect(newValue).toBe(original);
    });

    it('returns patched object if "else" is provided with new value', () => {
      // Arrange
      const original = { a: 1, b: 2, c: 3 };

      // Act
      const newValue = patch({
        a: iif(null!, 10, 20)
      })(original);

      // Assert
      expect(newValue).not.toBe(original);
      expect(newValue).toEqual({
        a: 20,
        b: 2,
        c: 3
      });
    });
  });

  describe('when undefined condition provided', () => {
    it('returns the same root if "else" not provided', () => {
      // Arrange
      const original = { a: 1, b: 2, c: 3 };

      // Act
      const newValue = patch({
        a: iif(undefined!, 1)
      })(original);

      // Assert
      expect(newValue).toBe(original);
    });

    it('returns the same root if "else" provides same value as existing', () => {
      // Arrange
      const original = { a: 1, b: 2, c: 3 };

      // Act
      const newValue = patch({
        a: iif(undefined!, 10, 1)
      })(original);

      // Assert
      expect(newValue).toBe(original);
    });

    it('returns patched object if "else" is provided with new value', () => {
      // Arrange
      const original = { a: 1, b: 2, c: 3 };

      // Act
      const newValue = patch({
        a: iif(undefined!, 10, 20)
      })(original);

      // Assert
      expect(newValue).not.toBe(original);
      expect(newValue).toEqual({
        a: 20,
        b: 2,
        c: 3
      });
    });
  });

  describe('when primitive values provided', () => {
    it('returns number if condition equals true', () => {
      // Act
      const newValue = iif(() => true, 10)(null!);
      // Assert
      expect(newValue).toBe(10);
    });

    it('returns the same root if number provided', () => {
      // Arrange
      const original = { a: 10, b: 10 };

      // Act
      const newValue = patch({
        a: iif(() => true, 10)
      })(original);

      // Assert
      expect(newValue).toBe(original);
    });

    it('returns the same root if "else" provides same value as existing', () => {
      // Arrange
      const original = { a: 10, b: 10 };

      // Act
      const newValue = patch({
        a: iif(false, 0, 10)
      })(original);

      // Assert
      expect(newValue).toEqual(original);
    });
  });

  describe('when argument provided into predicate function', () => {
    it('returns the same root', () => {
      // Arrange
      const original = { a: 1, b: 2, c: 3 };

      // Act
      const newValue = patch({
        a: iif(a => a === 1, 1),
        b: iif(b => b === 2, 2)
      })(original);

      // Assert
      expect(newValue).toBe(original);
    });

    it('returns new patched object', () => {
      // Arrange
      const original = { a: 1, b: 2, c: 3 };

      // Act
      const newValue = patch({
        a: iif(a => a! < 10, 10, 5),
        b: iif(b => b! > 0, 10, 5),
        c: iif(c => c! === 3, 10, 5)
      })(original);

      // Assert
      expect(newValue).not.toBe(original);
      expect(newValue).toEqual({
        a: 10,
        b: 10,
        c: 10
      });
    });
  });

  describe('when object with primitive property values provided', () => {
    it('returns the same root', () => {
      // Arrange
      const original = { a: 1, b: 2, c: 3 };

      // Act
      const newValue = iif(() => true, patch({ a: 1 }))(original);

      // Assert
      expect(newValue).toEqual(original);
    });

    it('returns the same root when condition is false', () => {
      // Arrange
      interface Original {
        a: number;
        b: number;
        c: number;
      }
      const original = { a: 1, b: 2, c: 3 };

      // Act
      const newValue = iif<Original>(() => false, patch({ b: 20 }), patch({ a: 1 }))(original);

      // Assert
      expect(newValue).toBe(original);
    });

    it('returns the same root (when multiple same)', () => {
      // Arrange
      const original = { a: 1, b: 2, c: 3 };

      // Act
      const newValue = iif(() => true, patch({ a: 1, b: 2 }))(original);

      // Assert
      expect(newValue).toEqual(original);
    });

    it('returns new patched object if "predicate" result equals true', () => {
      // Arrange
      interface Original {
        a: number;
        b: number;
        c: number;
      }
      const original: Original = { a: 1, b: 2, c: 3 };

      // Act
      const newValue = patch<Original>({
        a: iif(() => true, 10)
      })(original);

      // Assert
      expect(newValue).toEqual({
        a: 10,
        b: 2,
        c: 3
      });
    });
  });

  describe('when object with nested patch operators provided', () => {
    describe('with different calculated values if condition equals "true"', () => {
      it('returns new root', () => {
        // Arrange
        const original = { a: 10, b: 10 };

        // Act
        const newValue = patch({
          b: iif(() => true, 20)
        })(original);

        // Assert
        expect(newValue).not.toBe(original);
      });

      it('returns new root with calculated properties if multiple "iif"s provided', () => {
        // Arrange
        const original = { a: 20, b: 20 };

        // Act
        const newValue = patch({
          a: iif(() => false, 10, 30),
          b: iif(() => true, 50, 100)
        })(original);

        // Assert
        expect(newValue).toEqual({
          a: 30,
          b: 50
        });
      });

      it('treats the nested object as a patch if condition equals "true"', () => {
        // Arrange
        type Combined = {
          a: number;
          b: { hello?: string; goodbye?: string };
        };
        const original: Combined = { a: 1, b: { hello: 'world' } };
        // Act
        const newValue = patch({
          b: iif<Combined['b']>(b => b!.hello === 'world', patch({ goodbye: 'there' }))
        })(original);

        // Assert
        expect(newValue).toEqual({
          a: 1,
          b: { hello: 'world', goodbye: 'there' }
        });
      });
    });

    describe('with nesting multiple levels deep', () => {
      it('returns the deeply patched object with multiple conditions provided', () => {
        // Arrange
        interface Person {
          name: string;
          lastName?: string;
          nickname?: string;
        }

        interface Greeting {
          motivated?: boolean;
          person: Person;
        }

        interface Model {
          a: number;
          b: {
            hello?: Greeting;
            goodbye?: Greeting;
            greeting?: string;
          };
          c?: number;
        }

        const original: Model = {
          a: 1,
          b: {
            hello: {
              person: {
                name: 'you'
              }
            },
            goodbye: {
              person: {
                name: 'Artur'
              }
            }
          }
        };

        // Act
        const newValue = patch<Model>({
          b: iif<Model['b']>(
            b => typeof b!.hello === 'object',
            patch({
              hello: patch({
                motivated: iif(motivated => motivated !== true, true),
                person: patch({
                  name: 'Artur',
                  lastName: 'Androsovych'
                })
              }),
              greeting: 'How are you?'
            })
          ),
          c: iif(c => c !== 100, () => 0 + 100, 10)
        })(original);

        const newValue2 = patch<Model>({
          b: patch<Model['b']>({
            hello: patch<Greeting>({
              motivated: iif(motivated => motivated !== true, true),
              person: patch({
                name: iif(name => name !== 'Mark', 'Artur'),
                lastName: iif(lastName => lastName !== 'Whitfield', 'Androsovych')
              })
            }),
            greeting: iif(greeting => !greeting, 'How are you?')
          }),
          c: iif(c => !c, 100, 10)
        })(original);

        // Assert
        expect(newValue).toEqual(newValue2);
        expect(newValue).toEqual({
          a: 1,
          b: {
            hello: {
              person: {
                name: 'Artur',
                lastName: 'Androsovych'
              },
              motivated: true
            },
            goodbye: {
              person: {
                name: 'Artur'
              }
            },
            greeting: 'How are you?'
          },
          c: 100
        });
      });
    });
  });
});
