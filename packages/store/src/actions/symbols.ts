export interface ActionDef<TArgs extends any[]> {
  type: string;

  new (...args: TArgs): ThisType<ActionDef<TArgs>>;
}

export type ActionType = ActionDef<any[]> | { type: string };
