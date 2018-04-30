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

export type EntityUpdateStr<T> = {
  id: string;
  changes: Partial<T>;
};

export type EntityUpdateNum<T> = {
  id: number;
  changes: Partial<T>;
};
export type EntityUpdate<T> = EntityUpdateStr<T> | EntityUpdateNum<T>;

export enum EntityMutation {
  IdAndEntity,
  Entity,
  None
}

export abstract class EntityBase<T, S extends EntityState<T>> {
  static defaults() {
    return {
      ids: [],
      entities: {}
    };
  }

  // @todo Don't like having to pass in an injector to be able to get at the
  // state stream, how could we do this differently?
  private _stateStream: StateStream;
  constructor(injector: Injector) {
    this._stateStream = injector.get(StateStream);
  }

  /**
   * Get the entity id used to store the entity in the state.
   * Can easily be overriden in the state class.
   * @param entity The entity to get the id from
   */
  getEntityId(entity: T): string | number {
    if (!entity) {
      return undefined;
    }
    return entity['id'] || entity['_id'];
  }

  /**
   * Add entity to the state, using the `id` key as an identifier
   * @param entity add this entity to the state
   */
  addOne(entity: T): S {
    const state = this.getState();
    const didMutate = this._addOne(state, entity);
    return this._mutateStateIfNeeded(state, didMutate);
  }

  /**
   * Helper method that checks if we need to mutate state and if so updates the passed in state
   */
  private _addOne(state: S, entity: T): EntityMutation {
    const key = this.getEntityId(entity);

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
    return this._mutateStateIfNeeded(state, didMutate);
  }

  /**
   * Helper method that checks if we need to mutate state and if so updates the passed in state
   */
  private _addMany(state: S, entities: T[]): EntityMutation {
    let didMutate = false;

    for (const entity of entities) {
      didMutate = this._addOne(state, entity) !== EntityMutation.None || didMutate;
    }

    return didMutate ? EntityMutation.IdAndEntity : EntityMutation.None;
  }

  addAll(entities: T[]): S {
    const state = this.getState();
    state.ids = [];
    state.entities = {};

    this._addMany(state, entities);

    return this._mutateStateIfNeeded(state, EntityMutation.IdAndEntity);
  }

  removeOne(key: string | number): S {
    return this.removeMany([key]);
  }

  removeMany(keys: (string | number)[]): S {
    const state = this.getState();
    const mutation = this._removeMany(state, keys);
    return this._mutateStateIfNeeded(state, mutation);
  }

  /**
   * Helper method that checks if we need to mutate state and if so updates the passed in state
   */
  private _removeMany(state: S, keys: (string | number)[]) {
    const didMutate = keys.filter(key => key in state.entities).map(key => delete state.entities[key]).length > 0;

    if (didMutate) {
      state.ids = state.ids.filter((id: any) => id in state.entities);
    }

    return didMutate ? EntityMutation.IdAndEntity : EntityMutation.None;
  }

  removeAll(): S {
    const state = this.getState();
    const cleanState = Object.assign({}, state, {
      ids: [],
      entities: {}
    });
    return this._mutateStateIfNeeded(cleanState, EntityMutation.IdAndEntity);
  }

  updateOne(update: EntityUpdate<T>): S {
    return this.updateMany([update]);
  }

  updateMany(updates: EntityUpdate<T>[]): S {
    const state = this.getState();
    const mutation = this._updateMany(state, updates);
    return this._mutateStateIfNeeded(state, mutation);
  }

  /**
   * Helper method that checks if we need to mutate state and if so updates the passed in state
   */
  private _updateMany(state: S, updates: EntityUpdate<T>[]) {
    const newKeys: { [id: string]: string } = {};

    updates = updates.filter(update => update.id in state.entities);

    const didMutateEntities = updates.length > 0;

    if (didMutateEntities) {
      const didMutateIds = updates.filter(update => this._takeNewKey(state, newKeys, update)).length > 0;

      if (didMutateIds) {
        state.ids = state.ids.map((id: any) => newKeys[id] || id);
        return EntityMutation.IdAndEntity;
      } else {
        return EntityMutation.Entity;
      }
    }

    return EntityMutation.None;
  }

  /**
   * Helper method that checks if we need to update the id of the entity, and if so, removes the old entity and id first.
   */
  private _takeNewKey(state: S, keys: { [id: string]: any }, update: EntityUpdate<T>): boolean {
    const original = state.entities[update.id];
    const updated: T = Object.assign({}, original, update.changes);
    const newKey = this.getEntityId(updated);
    const hasNewKey = newKey !== update.id;

    if (hasNewKey) {
      keys[update.id] = newKey;
      delete state.entities[update.id];
    }

    state.entities[newKey] = updated;

    return hasNewKey;
  }
  /*

  upsertOne(entity: T, state: S): S {

  }
  upsertMany(entities: T[], state: S): S {

  }*/

  /**
   * Helper method to get the current state for this state class
   */
  private getState() {
    const rootState = this._stateStream.getValue();
    const stateClass = this.constructor[META_KEY];
    const state = getValue(rootState, stateClass.path);
    return state;
  }

  /**
   * Updates the entity and or id of entity based on what mutator was invoked
   * By minimizing the amount of state we change, we have the best performance.
   * @param state Current state
   * @param didMutate the helper methods return value, signals how we should update the state
   */
  private _mutateStateIfNeeded(state: S, didMutate: EntityMutation) {
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
    this._stateStream.next(newState);

    // return the local updated state if the user would like to continue proccesing it in the action handler
    return newLocalState;
  }
}
