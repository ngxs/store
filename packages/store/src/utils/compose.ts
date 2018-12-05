export type StateFn = (...args: any[]) => any;

/**
 * Composes a array of functions from left to right. Example:
 *
 *      compose([fn, final])(state, action);
 *
 * then the funcs have a signature like:
 *
 *      function fn (state, action, next) {
 *          console.log('here', state, action, next);
 *          return next(state, action);
 *      }
 *
 *      function final (state, action) {
 *          console.log('here', state, action);
 *          return state;
 *      }
 *
 * the last function should not call `next`.
 *
 * @ignore
 */
export const compose = (funcs: StateFn[]) => (...args: any[]) => {
  const curr = funcs.shift()!;
  return curr(...args, (...nextArgs: any[]) => compose(funcs)(...nextArgs));
};
