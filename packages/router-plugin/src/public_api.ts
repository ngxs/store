export { NgxsRouterPluginModule, withNgxsRouterPlugin } from './router.module';
export { ROUTER_STATE_TOKEN, RouterState, RouterStateModel } from './router.state';
export {
  RouterStateSerializer,
  DefaultRouterStateSerializer,
  SerializedRouterStateSnapshot
} from './serializer';
export * from './router.actions';
export {
  NavigationActionTiming,
  NgxsRouterPluginOptions
} from '@ngxs/router-plugin/internals';
