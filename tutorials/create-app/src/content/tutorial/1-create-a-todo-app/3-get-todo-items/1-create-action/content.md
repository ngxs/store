---
type: lesson
title: Create action
focus: /src/app/todo/store/todo.actions.ts
---

# Create Action

To fetch the data from the source, we have to dispatch an action which will initiate an HTTP GET method.

To accomplish this, we should create and dispatch an `Action`.

---

🎧 **Exercises**

1. Create the Get Action class in the `todo.actions.ts` file.

```ts
export class GetTodos {
  static readonly type = '[Todo] Get';
}
```

---

👀 **Observe**

- Each Action is a separate class

---

📚 **Read more**

- Read more in the NGXS documentation <a href="https://www.ngxs.io/concepts/actions" target="_blank">here</a>
