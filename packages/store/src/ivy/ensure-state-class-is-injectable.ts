import { StateClass } from '@ngxs/store/internals';

import { ivyEnabledInJitMode } from './ivy-enabled-in-jit-mode';
import { CONFIG_MESSAGES, VALIDATION_CODE } from '../configs/messages.config';

export function ensureStateClassIsInjectable(target: StateClass): void {
  // `ɵprov` is a static property added by the NGC compiler running with Ivy
  // enabled. It always exists in the AOT mode because this property is added before
  // runtime. If app is running in JIT mode then this property can be added by the
  // `@Injectable()` decorator. The `@Injectable()` decorator has to go after the
  // `@State()` decorator, thus we prevent users from unwanted DI errors.
  if (ivyEnabledInJitMode()) {
    // Do not run this check if Ivy is disabled or `ɵprov` exists on the class
    const ngInjectableDef = (target as any).ɵprov;
    if (!ngInjectableDef) {
      console.warn(CONFIG_MESSAGES[VALIDATION_CODE.UNDECORATED_STATE_IN_IVY](target.name));
    }
  }
}
