import { validateExistHmrStorage } from './common';

/**
 * Session storage: max size - 5 MB, in future need usage IndexDB (50MB)
 * Session storage is used so that lazy modules can also be updated.
 */
export function hmrInit() {
  validateExistHmrStorage();
}
