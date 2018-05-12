export class <%= classify(name) %> {
  static readonly type = '[<%= dasherize(state) %>] <%= classify(name) %>';
  constructor(public readonly payload?: any) {}
}
