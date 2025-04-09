// Property reads are not minified.
// It's smaller to read it once and use a function.
const _hasOwnProperty = Object.prototype.hasOwnProperty;
export const ɵhasOwnProperty = (target: any, key: PropertyKey) =>
  _hasOwnProperty.call(target, key);

export const ɵdefineProperty = Object.defineProperty;
