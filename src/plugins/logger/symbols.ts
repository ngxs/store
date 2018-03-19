import { InjectionToken } from '@angular/core';

export interface NgxsLoggerPluginOptions {
  /** Auto expand logged mutations  */
  collapsed: boolean;

  /** Provide alternate console.log implementation */
  logger: any;
}

export const NGXS_LOGGER_PLUGIN_OPTIONS = new InjectionToken('NGXS_LOGGER_PLUGIN_OPTIONS');
