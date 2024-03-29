export interface ActionDef<TArgs extends any[]> {
  type: string;

  new (...args: TArgs): any;
}

export type ActionType = ActionDef<any[]> | { type: string };
