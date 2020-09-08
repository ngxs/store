/**
 * Boolean conversion:
 *
 *    like '', 'false' to boolean
 *    ngxsFormClearOnDestroy, ngxsFormClearOnDestroy="true" should be treated as true
 *    ngxsFormClearOnDestroy='false' should be treated as false
 *
 * @ignore
 */
export function coerceBoolean(val: boolean | string | undefined | null) {
  return val != null && `${val}` !== 'false';
}
