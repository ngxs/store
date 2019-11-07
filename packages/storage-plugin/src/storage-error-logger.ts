import { Inject, Injectable } from '@angular/core';
import { NGXS_STORAGE_PLUGIN_OPTIONS, NgxsStoragePluginOptions } from './symbols';

@Injectable()
export class StorageErrorLogger {
  constructor(
    @Inject(NGXS_STORAGE_PLUGIN_OPTIONS)
    private _options: NgxsStoragePluginOptions
  ) {}

  public error(message: string): void {
    if (!this._options.suppressErrors) {
      console.error(message);
    }
  }
}
