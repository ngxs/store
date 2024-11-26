---
type: lesson
title: Create a query
focus: /src/app/todo/store/todo.queries.ts
---

# Create a query

We've successfully established our Todo data within the Todo state slice. Remember, this slice is part of the global state container.

To access and utilize this data in our components, we'll create a Selector. This mechanism allows us to extract specific information from the global state

---

🎧 **Exercises**

1. Create a Selector in the `todo.queries.ts` file. This Selector should leverage `TodoSelectors.getSlices.todos` to filter and return only the Todo items marked as `completed`.

```ts
static getCompletedTodos = createSelector(
  [TodoSelectors.getSlices.todos],
  (todos) => todos.filter((todo) => todo.completed),
);
```

---

👀 **Observe**

- The `getSlices` function utilizes the `createPropertySelectors` utility to generate an object containing Selectors. These Selectors correspond directly to the properties defined in the state schema

---

📚 **Read more**

- Read more in the NGXS documentation about the <a href="https://www.ngxs.io/concepts/select" target="_blank">select function</a>
