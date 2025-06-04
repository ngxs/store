import { InjectionToken } from '@angular/core';

/**
 * Interface for the redux-devtools-extension API.
 */
export interface NgxsDevtoolsExtension {
  init(state: any): void;
  send(action: any, state?: any): void;
  subscribe(fn: (message: NgxsDevtoolsAction) => void): VoidFunction;
}

export interface NgxsDevtoolsAction {
  type: string;
  payload: any;
  state: any;
  id: number;
  source: string;
}

export interface NgxsDevtoolsOptions {
  /**
   * The name of the extension
   */
  name?: string;

  /**
   * Whether the dev tools is enabled or note. Useful for setting during production.
   */
  disabled?: boolean;

  /**
   * Max number of entiries to keep.
   */
  maxAge?: number;

  /**
   * If more than one action is dispatched in the indicated interval, all new actions will be collected
   * and sent at once. It is the joint between performance and speed. When set to 0, all actions will be
   * sent instantly. Set it to a higher value when experiencing perf issues (also maxAge to a lower value).
   * Default is 500 ms.
   */
  latency?: number;

  /**
   * string or array of strings as regex - actions types to be hidden in the monitors (while passed to the reducers).
   * If actionsWhitelist specified, actionsBlacklist is ignored.
   */
  actionsBlacklist?: string | string[];

  /**
   * string or array of strings as regex - actions types to be shown in the monitors (while passed to the reducers).
   * If actionsWhitelist specified, actionsBlacklist is ignored.
   */
  actionsWhitelist?: string | string[];

  /**
   * called for every action before sending, takes state and action object, and returns true in case it allows
   * sending the current data to the monitor. Use it as a more advanced version of
   * actionsBlacklist/actionsWhitelist parameters
   */
  predicate?: (state: any, action: any) => boolean;

  /**
   * Reformat actions before sending to dev tools
   */
  actionSanitizer?: (action: any) => void;

  /**
   * Reformat state before sending to devtools
   */
  stateSanitizer?: (state: any) => void;

  /**
   * If set to true, will include stack trace for every dispatched action
   */
  trace?: boolean | (() => string);

  /**
   * Maximum stack trace frames to be stored (in case trace option was provided as true)
   */
  traceLimit?: number;

  /**
   * https://github.com/reduxjs/redux-devtools/blob/main/extension/docs/API/Arguments.md#serialize
   */
  serialize?:
    | boolean
    | {
        /**
         * - `undefined` - will use regular `JSON.stringify` to send data (it's the fast mode).
         * - `false` - will handle also circular references.
         * - `true` - will handle also date, regex, undefined, error objects, symbols, maps, sets and functions.
         * - object, which contains `date`, `regex`, `undefined`, `error`, `symbol`, `map`, `set` and `function` keys.
         *   For each of them you can indicate if to include (by setting as `true`).
         *   For `function` key you can also specify a custom function which handles serialization.
         *   See [`jsan`](https://github.com/kolodny/jsan) for more details.
         */
        options?:
          | undefined
          | boolean
          | {
              date?: true;
              regex?: true;
              undefined?: true;
              error?: true;
              symbol?: true;
              map?: true;
              set?: true;
              function?: true | ((fn: (...args: any[]) => any) => string);
            };
        /**
         * [JSON replacer function](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#The_replacer_parameter) used for both actions and states stringify.
         * In addition, you can specify a data type by adding a [`__serializedType__`](https://github.com/zalmoxisus/remotedev-serialize/blob/master/helpers/index.js#L4)
         * key. So you can deserialize it back while importing or persisting data.
         * Moreover, it will also [show a nice preview showing the provided custom type](https://cloud.githubusercontent.com/assets/7957859/21814330/a17d556a-d761-11e6-85ef-159dd12f36c5.png):
         */
        replacer?: (key: string, value: unknown) => any;
        /**
         * [JSON `reviver` function](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#Using_the_reviver_parameter)
         * used for parsing the imported actions and states. See [`remotedev-serialize`](https://github.com/zalmoxisus/remotedev-serialize/blob/master/immutable/serialize.js#L8-L41)
         * as an example on how to serialize special data types and get them back.
         */
        reviver?: (key: string, value: unknown) => any;
      };
}

export const NGXS_DEVTOOLS_OPTIONS = new InjectionToken<NgxsDevtoolsOptions>(
  'NGXS_DEVTOOLS_OPTIONS'
);
