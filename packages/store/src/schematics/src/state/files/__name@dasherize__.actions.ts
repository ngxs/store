export class <%= classify(name) %> {
  static readonly type = '[<%= dasherize(name) %>] <%= classify(name) %>';
}

export class <%= classify(name) %>WithPayload {
  static readonly type = '[<%= dasherize(name) %>] <%= classify(name) %> With Payload';
  constructor(public readonly payload?: any) {}
}