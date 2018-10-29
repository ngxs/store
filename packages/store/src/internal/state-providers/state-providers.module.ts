import { Injectable, NgModule, Type } from '@angular/core';
import { NgxsProvideIn, NgxsProvides, NgxsStateType } from './state-providers.interfaces';

@NgModule()
export class NgxsStateProvidersModule {
  public static states: NgxsProvides = {
    ngxsRoot: [],
    ngxsFeature: []
  };

  public static provideInNgxsModule(target: NgxsStateType, type: Type<unknown> = null): void {
    const { ngxsRoot, ngxsFeature } = NgxsStateProvidersModule.states;
    const firstInitialize = ![...ngxsRoot, ...ngxsFeature].includes(target);

    if (firstInitialize) {
      Injectable({ providedIn: type || NgxsStateProvidersModule })(target);
    }
  }

  public static defineStatesByProvideIn(provideIn: string | Type<unknown>, states: NgxsStateType[]): void {
    const stateSourceKey = typeof provideIn === 'string' ? provideIn : NgxsProvideIn.feature;
    const sources = NgxsStateProvidersModule.states[stateSourceKey] || [];
    sources.push(...states);
  }

  public static filterWithoutDuplicate(states: NgxsStateType[], sources: NgxsStateType[] = []): NgxsStateType[] {
    return states.filter((value, index) => {
      const nonDuplicateSource = states.indexOf(value) === index;
      const nonDuplicateTarget = !sources.includes(value);
      return value && nonDuplicateSource && nonDuplicateTarget;
    });
  }

  public static flattenedUniqueStates(entry: NgxsStateType[], compare: NgxsStateType[]) {
    return this.filterWithoutDuplicate([...entry, ...compare]);
  }
}
