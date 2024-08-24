---
type: lesson
title: Handle the action
focus: /src/app/todo/store/todo.state.ts
---

# Listen to the action

The actions are similar to the events, in an essence that the events have the event handlers where are listening to the event.
For example, a click event on a HTML button has a related click event handler.
Similarly, the `Actions` in **NGXS** have the related action listeners. An action listener is a function that will be invoked when the action is getting dispatched.

---

🎧 **Exercises**

1. Create an Action listener in the `todo.state.ts` file, which will be invoked when `GetTodos` is being dispatched.

```ts
@Action(GetTodos)
async get(ctx: StateContext<TodoStateModel>) {
  const todoItems = await firstValueFrom(this._todoService.get());
  ctx.setState({
    todos: todoItems,
  });
}
```

---

👀 **Observe**

- Each Action is a separate class

---

📚 **Read more**

- Read more in the NGXS documentation <a href="https://www.ngxs.io/concepts/actions" target="_blank">here</a>
