import { InjectionToken } from '@angular/core';

export interface LoggerPluginOptions {
  /** Auto expand logged mutations  */
  collapsed: boolean;

  /** Provide alternate console.log implementation */
  logger: any;
}

export const LOGGER_PLUGIN_OPTIONS = new InjectionToken('LOGGER_PLUGIN_OPTIONS');
