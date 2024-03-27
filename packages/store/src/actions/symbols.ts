export interface ActionDef<T = any> {
  type: string;

  new (...args: T[]): ThisType<ActionDef>;
}

export type ActionType = ActionDef | { type: string };
