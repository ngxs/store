/**
 *  Object unfreeze code
 * https://github.com/vicsstar/deep-unfreeze
 */

export const unfreeze = prop => {
  return Object.isFrozen(prop) ? deepUnfreeze(prop) : prop;
};

const deepUnfreeze = obj => {
  if (obj !== null) {
    if (
      obj.constructor.name !== 'Date' &&
      !Array.isArray(obj) &&
      typeof obj !== 'function' &&
      typeof obj === 'object'
    ) {
      return Object.getOwnPropertyNames(obj)
        .map(prop => {
          const clonedObj = {};
          clonedObj[prop] = unfreeze(obj[prop]);
          return clonedObj;
        })
        .reduce((leftObj, rightObj) => Object.assign({}, leftObj, rightObj));
    } else if (Array.isArray(obj)) {
      return obj.map(item => unfreeze(item));
    } else if (typeof obj === 'function') {
      const target = function() {
        obj.call(this, ...(arguments as any));
      };
      target.prototype = Object.create(obj.prototype);
      return target;
    }
  }
  return obj;
};
