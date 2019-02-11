import { Injectable, isDevMode } from '@angular/core';
import {
  getActionTypeFromInstance,
  getStoreMetadata,
  NgxsNextPluginFn,
  NgxsPlugin
} from '@ngxs/store';
import { getValue, MetaDataModel, setValue, StateClass } from './internals';
import { StateErase, StateReset } from './symbols';

@Injectable()
export class NgxsResetPlugin implements NgxsPlugin {
  private getErasedState(state: any, statesToKeep: MetaDataModel[]): any {
    return statesToKeep
      .map(meta => getPath(meta))
      .map(path => ({
        parts: path.split('.'),
        value: getValue(state, path)
      }))
      .reduce(
        (obj, { parts, value }) =>
          parts.reduceRight(
            (acc, part) =>
              part in obj
                ? {
                    [part]: {
                      ...obj[part],
                      ...acc
                    }
                  }
                : { [part]: acc },
            value
          ),
        {} as any
      );
  }

  private resetStates(state: any, statesToReset: MetaDataModel[]): any {
    statesToReset.forEach(meta => {
      if (meta.name && 'defaults' in meta) {
        state = setValue(state, getPath(meta), meta.defaults);
      } else if (isDevMode()) {
        console.warn(`Reset Failed: ${meta.name} is not a state class.`);
      }
    });

    return state;
  }

  handle(state: any, action: any, next: NgxsNextPluginFn) {
    const type: string = getActionTypeFromInstance(action) || '';

    switch (type) {
      case StateErase.type:
        state = this.getErasedState(state, convertToMetaDataList(action.statesToKeep || []));
        break;

      case StateReset.type:
        state = this.resetStates(state, convertToMetaDataList(action.statesToReset));
        break;

      default:
        break;
    }

    return next(state, action);
  }
}

function convertToMetaDataList(classes: StateClass | StateClass[]): MetaDataModel[] {
  return (Array.isArray(classes) ? classes : [classes]).map(
    stateClass => new Object(getStoreMetadata(stateClass)) as MetaDataModel
  );
}

function getPath(meta: MetaDataModel): string {
  return meta.path || '';
}
