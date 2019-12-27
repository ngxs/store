import { Observable } from 'rxjs';

import { CONFIG_MESSAGES, VALIDATION_CODE } from '../../configs/messages.config';
import { propGetter } from '../../internal/internals';
import { SelectFactory } from './select-factory';
import { StateToken } from '../../state-token/state-token';
import { ExtractTokenType } from '../../state-token/symbols';

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

export type PropertyType<T> = T extends StateToken<any>
  ? Observable<ExtractTokenType<T>>
  : T extends (...args: any[]) => any
  ? Observable<ReturnType<T>>
  : any;

export type ComponentClass<T> = {
  [P in keyof T]: T[P];
};

export type SelectType<T> = <
  U extends ComponentClass<any> & Record<K, PropertyType<T>>,
  K extends string
>(
  target: U,
  key: K
) => void;
