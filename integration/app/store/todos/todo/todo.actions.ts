export class AddTodo {
  public static type = 'AddTodo';
  constructor(public readonly payload: string) {}
}

export class RemoveTodo {
  public static type = 'RemoveTodo';
  constructor(public readonly payload: number) {}
}
