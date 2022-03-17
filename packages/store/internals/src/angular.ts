declare const __karma__: unknown;
declare const jasmine: unknown;
declare const jest: unknown;
declare const Mocha: unknown;

export function isAngularInTestMode(): boolean {
  // This is safe to check for these properties in the following way since `typeof` does not
  // throw an exception if the value does not exist in the scope.
  // We should not try to read these values from the global scope (e.g. `ɵglobal` from the `@angular/core`).
  // This is related to how these frameworks compile and execute modules. E.g. Jest wraps the module into
  // its internal code where `jest` variable exists in the scope. It cannot be read from the global scope, e.g.
  // this will return undefined `global.jest`, but `jest` will not equal undefined.
  return (
    typeof __karma__ !== 'undefined' ||
    typeof jasmine !== 'undefined' ||
    typeof jest !== 'undefined' ||
    typeof Mocha !== 'undefined'
  );
}
