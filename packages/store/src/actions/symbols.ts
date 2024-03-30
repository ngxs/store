export interface ActionDef<TArgs extends any[] = any[], TReturn = any> {
  type: string;

  new (...args: TArgs): TReturn;
}

export type ActionType = ActionDef | { type: string };
