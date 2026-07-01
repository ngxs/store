// Property reads are not minified.
// It's smaller to read it once and use a function.
export const ɵhasOwnProperty = (target: any, key: PropertyKey) => Object.hasOwn(target, key);

export const ɵdefineProperty = Object.defineProperty;
