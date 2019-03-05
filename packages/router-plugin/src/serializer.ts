import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

export abstract class RouterStateSerializer<T> {
  abstract serialize(snapshot: ActivatedRouteSnapshot): T;
}

export interface SerializedRouterStateSnapshot {
  root: ActivatedRouteSnapshot;
  url: string;
}

export class DefaultRouterStateSerializer
  implements RouterStateSerializer<SerializedRouterStateSnapshot> {
  serialize(snapshot: ActivatedRouteSnapshot): SerializedRouterStateSnapshot {
    return {
      root: this.serializeRoute(snapshot),
      url: this.getRouterStateSnapshot(snapshot).url
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
      component: null,
      routeConfig: null,
      root: null as any,
      parent: null,
      firstChild: children[0],
      children: children,
      pathFromRoot: null as any,
      paramMap: route.paramMap,
      queryParamMap: route.queryParamMap,
      toString: route.toString
    };
  }

  /**
   * `_routerState` is a private property but always exists
   */
  private getRouterStateSnapshot(snapshot: any): RouterStateSnapshot {
    return snapshot._routerState;
  }
}
