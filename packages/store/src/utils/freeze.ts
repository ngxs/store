import { ɵhasOwnProperty } from '@ngxs/store/internals';

/**
 * Object freeze code
 * https://github.com/jsdf/deep-freeze
 */
export const deepFreeze = (o: any) => {
// Skip freezing for non-state objects
if (o && typeof o === 'object' && !o.__isState) {
        return o;
    }
  
  Object.freeze(o);

  const oIsFunction = typeof o === 'function';

  Object.getOwnPropertyNames(o).forEach(function (prop) {
    if (
      ɵhasOwnProperty(o, prop) &&
      (oIsFunction ? prop !== 'caller' && prop !== 'callee' && prop !== 'arguments' : true) &&
      o[prop] !== null &&
      (typeof o[prop] === 'object' || typeof o[prop] === 'function') &&
      !Object.isFrozen(o[prop])
    ) {
      deepFreeze(o[prop]);
    }
  });

  return o;
};
