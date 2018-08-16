export class {{pascalCase name}}Action {
  static readonly type = '[{{pascalCase name}}] Add item';
  constructor(public payload: string) { }
}
