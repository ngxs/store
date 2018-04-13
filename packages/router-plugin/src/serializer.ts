import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

export abstract class RouterStateSerializer<T> {
  abstract serialize(routerState: RouterStateSnapshot): T;
}

export interface SerializedRouterStateSnapshot {
  root: ActivatedRouteSnapshot;
  url: string;
}

export class DefaultRouterStateSerializer implements RouterStateSerializer<SerializedRouterStateSnapshot> {
  serialize(routerState: RouterStateSnapshot): SerializedRouterStateSnapshot {
    return {
      root: this.serializeRoute(routerState.root),
      url: routerState.url
    };
  }

  private serializeRoute(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
    const children = route.children.map(c => this.serializeRoute(c));
    return {
      url: route.url,
      params: route.params,
      queryParams: route.queryParams,
      fragment: route.fragment,
      data: route.data,
      outlet: route.outlet,
      component: route.routeConfig ? route.routeConfig.component : undefined,
      routeConfig: null,
      root: undefined,
      parent: undefined,
      firstChild: children[0],
      children: children,
      pathFromRoot: undefined,
      paramMap: route.paramMap,
      queryParamMap: route.queryParamMap,
      toString: route.toString
    };
  }
}
