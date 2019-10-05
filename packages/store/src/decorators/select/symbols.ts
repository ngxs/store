import { Observable } from 'rxjs';

import { CONFIG_MESSAGES, VALIDATION_CODE } from '../../configs/messages.config';
import { propGetter } from '../../internal/internals';
import { SelectFactory } from './select-factory';
import { META_KEY } from '../../symbols';

const DOLLAR_CHAR_CODE = 36;

export function createSelectObservable<T = any>(selector: any): Observable<T> {
  if (!SelectFactory.store) {
    throw new Error(CONFIG_MESSAGES[VALIDATION_CODE.SELECT_FACTORY_NOT_CONNECTED]());
  }

  return SelectFactory.store.select(selector);
}

export function createSelectorFn(name: string, rawSelector?: any, paths: string[] = []): any {
  rawSelector = !rawSelector ? removeDollarAtTheEnd(name) : rawSelector;

  if (typeof rawSelector === 'string') {
    const propsArray: string[] = paths.length
      ? [rawSelector, ...paths]
      : rawSelector.split('.');
    return propGetter(propsArray, SelectFactory.config!);
  } else if (rawSelector[META_KEY] && rawSelector[META_KEY].path) {
    return propGetter(rawSelector[META_KEY].path.split('.'), SelectFactory.config!);
  }

  return rawSelector;
}

/**
 * @example If `foo$` => make it just `foo`
 */
export function removeDollarAtTheEnd(name: string): string {
  const lastCharIndex: number = name.length - 1;
  const dollarAtTheEnd: boolean = name.charCodeAt(lastCharIndex) === DOLLAR_CHAR_CODE;
  return dollarAtTheEnd ? name.slice(0, lastCharIndex) : name;
}
