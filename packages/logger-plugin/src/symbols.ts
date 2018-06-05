import { InjectionToken } from '@angular/core';

export interface NgxsLoggerPluginOptions {
  /** Auto expand logged actions  */
  collapsed?: boolean;

  /** Provide alternate console.log implementation */
  logger?: any;

  /** Disable the logger. Useful for prod mode. */
  disabled?: boolean;
}

export const NGXS_LOGGER_PLUGIN_OPTIONS = new InjectionToken('NGXS_LOGGER_PLUGIN_OPTIONS');
