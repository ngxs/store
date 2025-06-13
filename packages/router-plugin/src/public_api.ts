export { NgxsRouterPluginModule, withNgxsRouterPlugin } from './router.module';
export { ROUTER_STATE_TOKEN, RouterState, type RouterStateModel } from './router.state';
export {
  RouterStateSerializer,
  DefaultRouterStateSerializer,
  type SerializedRouterStateSnapshot
} from './serializer';
export * from './router.actions';
export {
  NavigationActionTiming,
  type NgxsRouterPluginOptions
} from '@ngxs/router-plugin/internals';
