import { Type, ɵivyEnabled } from '@angular/core';
import { Observable } from 'rxjs';

import { Store } from '../../store';
import { NgxsConfig } from '../../symbols';
import { propGetter } from '../../internal/internals';
import { SelectFactory } from './select-factory';
import { StateToken } from '../../state-token/state-token';
import { ExtractTokenType } from '../../state-token/symbols';
import { throwSelectFactoryNotConnectedError } from '../../configs/messages.config';

const DOLLAR_CHAR_CODE = 36;

export function createSelectObservable<T = any>(
  selector: any,
  store: Store | null
): Observable<T> {
  // We're doing this stuff to tree-shake the `SelectFactory` when the user
  // is running Ivy since NGXS will select the state from the provided `store` argument.
  return ɵivyEnabled
    ? createSelectObservableIvy(selector, store)
    : createSelectObservableViewEngine(selector);
}

export function createSelectorFn(
  config: NgxsConfig | null,
  name: string,
  rawSelector?: any,
  paths: string[] = []
): SelectorFn {
  rawSelector = rawSelector || removeDollarAtTheEnd(name);

  if (typeof rawSelector !== 'string') {
    return rawSelector;
  } else {
    const propsArray: string[] = paths.length
      ? [rawSelector, ...paths]
      : rawSelector.split('.');

    return ɵivyEnabled
      ? createSelectorFnIvy(propsArray, config)
      : createSelectorFnViewEngine(propsArray);
  }
}

/**
 * @example If `foo$` => make it just `foo`
 */
export function removeDollarAtTheEnd(name: string): string {
  const lastCharIndex: number = name.length - 1;
  const dollarAtTheEnd: boolean = name.charCodeAt(lastCharIndex) === DOLLAR_CHAR_CODE;
  return dollarAtTheEnd ? name.slice(0, lastCharIndex) : name;
}

export type SelectorFn =
  | ((state: any, ...states: any[]) => any)
  | string
  | Type<any>
  | StateToken<any>;

export type PropertyType<T> = T extends StateToken<any>
  ? Observable<ExtractTokenType<T>>
  : T extends (...args: any[]) => any
  ? Observable<ReturnType<T>>
  : any;

function createSelectObservableIvy<T = any>(
  selector: any,
  store: Store | null
): Observable<T> {
  return ngDevMode && !store ? throwSelectFactoryNotConnectedError() : store!.select(selector);
}

function createSelectObservableViewEngine<T = any>(selector: any): Observable<T> {
  return SelectFactory.store
    ? SelectFactory.store.select(selector)
    : throwSelectFactoryNotConnectedError();
}

function createSelectorFnIvy(propsArray: string[], config: NgxsConfig | null) {
  return ngDevMode && !config
    ? throwSelectFactoryNotConnectedError()
    : propGetter(propsArray, config!);
}

function createSelectorFnViewEngine(propsArray: string[]) {
  return propGetter(propsArray, SelectFactory.config!);
}
