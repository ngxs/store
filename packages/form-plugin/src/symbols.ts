import { InjectionToken, Type } from '@angular/core';

import { NgxsFormPluginValueChangesStrategy } from './value-changes-strategy';

export const NGXS_FORM_PLUGIN_VALUE_CHANGES_STRATEGY = new InjectionToken<
  Type<NgxsFormPluginValueChangesStrategy>
>('NGXS_FORM_PLUGIN_VALUE_CHANGES_STRATEGY');

export interface NgxsFormPluginOptions {
  valueChangesStrategy?: Type<NgxsFormPluginValueChangesStrategy>;
}
