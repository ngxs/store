import { Observable } from 'rxjs';

import { SelectFactory } from './select-factory';
import { META_KEY, NgxsConfig } from '../../symbols';
import { propGetter } from '../../internal/internals';
import { CONFIG_MESSAGES, VALIDATION_CODE } from '../../configs/messages.config';

export function createSelect(fn: any): Observable<any> {
  const store = SelectFactory.store;
  if (!store) {
    throw new Error(CONFIG_MESSAGES[VALIDATION_CODE.SELECT_FACTORY_NOT_CONNECTED]());
  }

  return store.select(fn);
}

export function createSelector(selectorOrFeature?: any, paths: string[] = []) {
  const config: NgxsConfig = SelectFactory.config!;

  if (typeof selectorOrFeature === 'string') {
    const propsArray: string[] = paths.length
      ? [selectorOrFeature, ...paths]
      : selectorOrFeature.split('.');

    return propGetter(propsArray, config);
  } else if (selectorOrFeature[META_KEY] && selectorOrFeature[META_KEY].path) {
    return propGetter(selectorOrFeature[META_KEY].path.split('.'), config);
  } else {
    return selectorOrFeature;
  }
}
