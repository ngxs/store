export class AppAction {
  static readonly type = '[App] Add item';
  constructor(public payload: string) { }
}
