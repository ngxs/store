import { Observable } from 'rxjs';

import { propGetter } from '../../internal/internals';
import { SelectFactory } from './select-factory';
import { StateToken } from '../../state-token/state-token';
import { ExtractTokenType } from '../../state-token/symbols';
import { throwSelectFactoryNotConnectedError } from '../../configs/messages.config';

const DOLLAR_CHAR_CODE = 36;

export function createSelectObservable<T = any>(selector: any): Observable<T> {
  // We're not adding `ngDevMode` guard since we have still to throw this error until we fix SSR issue.
  if (!SelectFactory.store) {
    throwSelectFactoryNotConnectedError();
  }
  return SelectFactory.store!.select(selector);
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
