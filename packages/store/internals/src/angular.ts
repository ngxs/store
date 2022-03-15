import { ɵglobal } from '@angular/core';

export function isAngularInTestMode(): boolean {
  return (
    typeof ɵglobal.__karma__ !== 'undefined' ||
    typeof ɵglobal.jasmine !== 'undefined' ||
    typeof ɵglobal.jest !== 'undefined' ||
    typeof ɵglobal.Mocha !== 'undefined'
  );
}
