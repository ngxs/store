import { Injectable } from '@angular/core';
import { NgxsPlugin } from '@ngxs/store';

@Injectable()
export class NgxsRouterPlugin implements NgxsPlugin {
  constructor() // @Inject(NGXS_ROUTER_PLUGIN_OPTIONS) private _options: NgxsRouterPluginOptions
  {}

  handle(state, event, next) {}
}
