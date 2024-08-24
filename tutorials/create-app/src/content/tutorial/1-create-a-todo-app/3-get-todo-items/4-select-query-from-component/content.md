---
type: lesson
title: Select the query
focus: /src/app/todo/todo-list/todo-list.component.ts
---

# Select the query

In this lesson we should display all the available todo items that returned from the service. To accomplish this we need to dispatch an action and select the related query.

---

🎧 **Exercises**

1. Dispatch the `GetTodos` `Action` to invoke the Action Handler..

```ts
constructor() {
  this._store.dispatch(new GetTodos());
}
```

2. Query the data and display them in the UI

```ts
completeTodoItems = select(TodoSelectors.getCompletedTodos);
```

---

👀 **Observe**

- The `select` function returns a `signal` type and infers the type of the selector

---

📚 **Read more**

- Read more in the NGXS documentation about the <a href="https://www.ngxs.io/concepts/select#store-select-signal-function" target="_blank">store select signal function</a>
- Read more in the NGXS documentation about <a href="https://www.ngxs.io/concepts/store#dispatching-actions" target="_blank">dispatching actions</a>
