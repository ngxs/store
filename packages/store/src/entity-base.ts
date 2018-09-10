import { NgxsOnInit, StateContext } from './symbols';

export interface EntityStateModel<V> {
  ids: (string | number)[];
  entities: {
    [id: string]: V;
    [id: number]: V;
  };
}

export interface EntityUpdateStr<T> {
  id: string;
  changes: Partial<T>;
}

export interface EntityUpdateNum<T> {
  id: number;
  changes: Partial<T>;
}

export type EntityUpdate<T> = EntityUpdateStr<T> | EntityUpdateNum<T>;

export enum EntityMutation {
  IdAndEntity,
  Entity,
  None
}

export abstract class EntityBase<T, S extends EntityStateModel<T>> implements NgxsOnInit {
  private ctx: StateContext<S>;

  /**
   * The defaults for all state classes that inherit from EntityBase
   */
  static defaults() {
    return {
      ids: [],
      entities: {}
    };
  }

  static selectIds<T>(state: EntityStateModel<T>) {
    return state.ids || [];
  }

  static selectEntities<T>(state: EntityStateModel<T>) {
    return state.entities || {};
  }

  static selectAll<T>(state: EntityStateModel<T>) {
    return (state.ids || []).map((id: any) => state.entities[id]);
  }

  static selectTotal<T>(state: EntityStateModel<T>) {
    return (state.ids || []).length;
  }

  ngxsOnInit(ctx: StateContext<S>) {
    this.ctx = ctx;
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
    const state = Object.assign({}, this.ctx.getState());
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
    state.ids = [...state.ids, key];
    state.entities = {
      ...state.entities,
      ...{ [key]: entity }
    };
    return EntityMutation.IdAndEntity;
  }

  addMany(entities: T[]): S {
    const state = Object.assign({}, this.ctx.getState());
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
    const state = this.ctx.getState();
    const newState = Object.assign({}, state, {
      ids: [],
      entities: {}
    });
    this._addMany(newState, entities);
    return this._mutateStateIfNeeded(newState, EntityMutation.IdAndEntity);
  }

  removeOne(key: string | number): S {
    return this.removeMany([key]);
  }

  removeMany(keys: (string | number)[]): S {
    const state = Object.assign({}, this.ctx.getState());
    const mutation = this._removeMany(state, keys);
    return this._mutateStateIfNeeded(state, mutation);
  }

  /**
   * Helper method that checks if we need to mutate state and if so updates the passed in state
   */
  private _removeMany(state: S, keys: (string | number)[]) {
    const keysToChange = keys.filter(key => key in state.entities);
    const didMutate = keysToChange.length > 0;

    state.entities = Object.assign(
      {},
      ...Object.keys(state.entities)
        .filter(key => keysToChange.indexOf(key) === -1)
        .map(k => ({ [k]: state.entities[k] }))
    );

    if (didMutate) {
      state.ids = state.ids.filter((id: any) => id in state.entities);
    }

    return didMutate ? EntityMutation.IdAndEntity : EntityMutation.None;
  }

  removeAll(): S {
    const state = this.ctx.getState();
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
    const state = Object.assign({}, this.ctx.getState());
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
      const { [update.id]: entityToDelete, ...newEntities } = state.entities;
      state.entities = newEntities;
    }

    state.entities = { ...state.entities, [newKey]: updated };

    return hasNewKey;
  }
  /*

  upsertOne(entity: T, state: S): S {

  }
  upsertMany(entities: T[], state: S): S {

  }*/

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

    // set the new state
    this.ctx.setState(newLocalState);

    // return the local updated state if the user would like to continue proccesing it in the action handler
    return newLocalState;
  }
}
