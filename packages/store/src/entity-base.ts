import { StateStream } from './state-stream';
import { getValue, setValue } from './utils';
import { META_KEY } from './symbols';
import { Injector } from '@angular/core';

export interface EntityState<V> {
  ids: (string | number)[];
  entities: {
    [id: string]: V;
    [id: number]: V;
  };
}

export enum EntityMutation {
  IdAndEntity,
  Entity,
  None
}

export abstract class EntityBase<T, S extends EntityState<T>> {
  static defaults = {
    ids: [],
    entities: {}
  };

  // @todo Don't like having to pass in an injector to be able to get at the
  // state stream, how could we do this differently?
  private stateStream: StateStream;
  constructor(injector: Injector) {
    this.stateStream = injector.get(StateStream);
  }

  /**
   * Select the entity id used to store the entity in the state.
   * Can easily be overriden in the state class.
   * @param entity The entity to select the id from
   */
  selectEntityId(entity: T): string | number {
    if (!entity) {
      return undefined;
    }
    return entity['id'] || entity['_id'];
  }

  addOne(entity: T): S {
    const state = this.getState();
    const didMutate = this._addOne(state, entity);
    return this.mutateStateIfNeeded(state, didMutate);
  }

  private _addOne(state: S, entity: T): EntityMutation {
    const key = this.selectEntityId(entity);

    if (key in state.entities) {
      return EntityMutation.None;
    }

    state.ids.push(key);
    state.entities[key] = entity;

    return EntityMutation.IdAndEntity;
  }

  addMany(entities: T[]): S {
    const state = this.getState();
    const didMutate = this._addMany(state, entities);
    return this.mutateStateIfNeeded(state, didMutate);
  }

  private _addMany(state: S, entities: T[]): EntityMutation {
    let didMutate = false;

    for (const entity of entities) {
      didMutate = this._addOne(state, entity) !== EntityMutation.None || didMutate;
    }

    return didMutate ? EntityMutation.IdAndEntity : EntityMutation.None;
  }
  /*
  addAll(entities: T[], state: S): S {

  }

  removeOne(key: string, state: S): S {

  }
  removeOne(key: number, state: S): S {

  }

  removeMany(keys: string[], state: S): S {

  }
  removeMany(keys: number[], state: S): S {

  }

  removeAll(state: S): S {

  }

  updateOne(update: Partial<T>, state: S): S {

  }
  updateMany(updates: Partial<T>[], state: S): S {

  }

  upsertOne(entity: T, state: S): S {

  }
  upsertMany(entities: T[], state: S): S {

  }*/

  private getState() {
    const rootState = this.stateStream.getValue();
    const stateClass = this.constructor[META_KEY];
    const state = getValue(rootState, stateClass.path);
    return state;
  }

  private mutateStateIfNeeded(state: S, didMutate: EntityMutation) {
    if (didMutate === EntityMutation.None) {
      return state;
    }

    const clonedEntityState = {
      ids: [...state.ids],
      entities: { ...state.entities }
    };

    const stateClass = this.constructor[META_KEY];
    const path = stateClass.path;

    // set state to old state first
    let newLocalState = state;

    // If the action needed to update both the ids and the entities, we replace the state with a new object
    if (didMutate === EntityMutation.IdAndEntity) {
      newLocalState = Object.assign({}, state, clonedEntityState);
    }

    // if only an entity was mutated we only update the entites reference to cause selectors to be recalculated
    if (didMutate === EntityMutation.Entity) {
      newLocalState = {
        ...(state as any),
        entities: clonedEntityState.entities
      };
    }

    // update state
    const newState = setValue(state, path, newLocalState);
    this.stateStream.next(newState);

    // return the local updated state if the user would like to continue proccesing it in the action handler
    return newLocalState;
  }
}
