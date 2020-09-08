import { patch } from '../src/patch';

describe('patch', () => {
  describe('when no properties provided', () => {
    it('returns the same root', () => {
      // Arrange
      const original = { a: 1, b: 2, c: 3 };

      // Act
      const newValue = patch({})(original);

      // Assert
      expect(newValue).toBe(original);
    });
  });

  describe('when null provided', () => {
    it('returns the same root', () => {
      // Arrange
      const original = { a: 1, b: 2, c: 3 };

      // Act
      const newValue = (<any>patch)(null)(original);

      // Assert
      expect(newValue).toBe(original);
    });
  });

  describe('when undefined provided', () => {
    it('returns the same root', () => {
      // Arrange
      const original = { a: 1, b: 2, c: 3 };

      // Act
      const newValue = (<any>patch)(undefined)(original);

      // Assert
      expect(newValue).toBe(original);
    });
  });

  describe('when object with primitive property values provided', () => {
    describe('with same values', () => {
      it('returns the same root', () => {
        // Arrange
        const original = { a: 1, b: 2, c: 3 };

        // Act
        const newValue = patch({ a: 1 })(original);

        // Assert
        expect(newValue).toBe(original);
      });
      it('returns the same root (when multiple same)', () => {
        // Arrange
        const original = { a: 1, b: '2', c: 3 };

        // Act
        const newValue = patch({ a: 1, b: '2' })(original);

        // Assert
        expect(newValue).toBe(original);
      });
    });
    describe('with different values', () => {
      it('returns a new root', () => {
        // Arrange
        const original = { a: 1, b: 2, c: 3 };

        // Act
        const newValue = patch({ a: 2 })(original);

        // Assert
        expect(newValue).not.toBe(original);
      });

      it('returns a new root with changed property set', () => {
        // Arrange
        const original = { a: 1, b: 2, c: 3 };

        // Act
        const newValue = patch({ a: 2 })(original);

        // Assert
        expect(newValue).toEqual({ a: 2, b: 2, c: 3 });
      });

      it('returns a new root with changed properties set', () => {
        // Arrange
        const original = { a: 1, b: 2, c: 3 };

        // Act
        const newValue = patch({ a: 2, b: 3 })(original);

        // Assert
        expect(newValue).toEqual({ a: 2, b: 3, c: 3 });
      });

      it('returns a new root with added properties set', () => {
        // Arrange
        interface MyObj {
          a: number;
          b: number;
          c: number;
          d?: number;
          e?: number;
        }
        const original: MyObj = { a: 1, b: 2, c: 3 };
        // Act
        const newValue = patch<MyObj>({ d: 4, e: 5 })(original);

        // Assert
        expect(newValue).toEqual({ a: 1, b: 2, c: 3, d: 4, e: 5 });
      });
    });
  });

  describe('when object with object property values provided', () => {
    describe('with different values', () => {
      it('returns a new root', () => {
        // Arrange
        const original = { a: 1, b: { hello: 'world' } };

        // Act
        const newValue = patch({ b: { hello: 'you' } })(original);

        // Assert
        expect(newValue).not.toBe(original);
      });

      it('returns a new root with changed property set', () => {
        // Arrange
        const original = { a: 1, b: { hello: 'world' } };

        // Act
        const newValue = patch({ b: { hello: 'you' } })(original);

        // Assert
        expect(newValue).toEqual({ a: 1, b: { hello: 'you' } });
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

  describe('when object with nested patch operators provided', () => {
    describe('as [patch(...)]', () => {
      describe('with different calculated values', () => {
        it('returns a new root', () => {
          // Arrange
          const original = { a: 1, b: { hello: 'world' } };

          // Act
          const newValue = patch({
            b: patch({ hello: 'you' })
          })(original);

          // Assert
          expect(newValue).not.toBe(original);
        });

        it('returns a new root with calculated properties set', () => {
          // Arrange
          const original = { a: 1, b: { hello: 'world' } };

          // Act
          const newValue = patch({
            b: patch({ hello: 'you' })
          })(original);

          // Assert
          expect(newValue).toEqual({ a: 1, b: { hello: 'you' } });
        });

        it('treats the nested object as a patch', () => {
          // Arrange
          type Combined = {
            a: number;
            b: { hello?: string; goodbye?: string };
          };
          const original: Combined = { a: 1, b: { hello: 'world' } };
          // Act
          const newValue = patch<Combined>({
            b: patch<Combined['b']>({ goodbye: 'there' })
          })(original);

          // Assert
          expect(newValue).toEqual({
            a: 1,
            b: { hello: 'world', goodbye: 'there' }
          });
        });
      });

      describe('with equal calculated values', () => {
        it('returns the same root', () => {
          // Arrange
          const original = { a: 1, b: { hello: 'world' } };

          // Act
          const newValue = patch({
            b: patch({ hello: 'world' })
          })(original);

          // Assert
          expect(newValue).toBe(original);
        });
      });

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
                  name: 'Mark'
                }
              }
            }
          };

          // Act
          const newValue = patch<Model>({
            b: patch<Model['b']>({
              hello: patch<Model['b']['hello']>({
                enthusiastic: true,
                person: patch({
                  name: 'Mark',
                  lastName: 'Whitfeld'
                })
              }),
              greeting: 'Howzit'
            }),
            c: 3
          })(original);

          const newValue2 = patch<Model>({
            b: patch<Model['b']>({
              hello: patch<Greeting>({
                enthusiastic: true,
                person: patch({
                  name: 'Mark',
                  lastName: 'Whitfeld'
                })
              }),
              greeting: 'Howzit'
            }),
            c: 3
          })(original);

          // Assert
          expect(newValue).toEqual(newValue2);
          expect(newValue).toEqual({
            a: 1,
            b: {
              greeting: 'Howzit',
              hello: {
                enthusiastic: true,
                person: {
                  name: 'Mark',
                  lastName: 'Whitfeld'
                }
              },
              goodbye: {
                person: {
                  name: 'Mark'
                }
              }
            },
            c: 3
          });
        });

        it(`doesn't run a patch nested two levels deep`, () => {
          // Arrange
          const original = {
            a: 1,
            b: {
              hello: {
                person: 'you'
              },
              goodbye: {
                person: 'Mark'
              }
            }
          };

          const patchTooDeep = patch({
            person: 'Mark'
          });

          // Act
          const newValue = patch<any>({
            b: {
              greeting: 'Howzit',
              hello: patchTooDeep
            },
            c: 3
          })(original);

          // Assert
          expect<any>(newValue.b.hello).toEqual(patchTooDeep);
        });
      });
    });
  });
});
