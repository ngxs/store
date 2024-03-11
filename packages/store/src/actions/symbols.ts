export interface ActionDef<T = any, U = any> {
  type: string;

  new (...args: T[]): U;
}

export type ActionType = ActionDef | { type: string };
