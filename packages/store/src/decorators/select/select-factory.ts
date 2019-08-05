import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Store } from '../../store';
import { META_KEY, NgxsConfig } from '../../symbols';
import { propGetter } from '../../internal/internals';
import { CONFIG_MESSAGES, VALIDATION_CODE } from '../../configs/messages.config';

/**
 * Allows the select decorator to get access to the DI store.
 * @internal only use in @Select decorator
 * @ignore
 */
@Injectable()
export class SelectFactory {
  public static store: Store | null = null;
  public static config: NgxsConfig | null = null;
  private static readonly DOLLAR_CHAR_CODE: number = 36;

  constructor(store: Store, config: NgxsConfig) {
    SelectFactory.store = store;
    SelectFactory.config = config;
  }

  /**
   * @example If `foo$` => make it just `foo`
   */
  public static removeDollarAtTheEnd(name: string): string {
    const lastCharIndex: number = name.length - 1;
    const dollarAtTheEnd: boolean =
      name.charCodeAt(lastCharIndex) === SelectFactory.DOLLAR_CHAR_CODE;
    return dollarAtTheEnd ? name.slice(0, lastCharIndex) : name;
  }

  public static selectBySelector<T = any>(selector: any): Observable<T> {
    if (!SelectFactory.store) {
      throw new Error(CONFIG_MESSAGES[VALIDATION_CODE.SELECT_FACTORY_NOT_CONNECTED]());
    }

    return SelectFactory.store.select(selector);
  }

  public static unwrapSelector(name: string, rawSelector?: any, paths: string[] = []): any {
    rawSelector = !rawSelector ? SelectFactory.removeDollarAtTheEnd(name) : rawSelector;

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
}
