---
type: lesson
title: Generate a Store
focus: /src/app/app.config.ts
---

# Generate a store

Generate the `store` using the command:

```bash
ng generate @ngxs/store:store
```

Note: In our example, we need to generate the store in the `todo` directory and we also need to give the `todo` name in our store. As such, the command will become:

```bash
ng generate @ngxs/store:store --name=todo --path=todo
```

This command generates the files:

- `todo.actions.ts`
- `todo.state.spec.ts`
- `todo.state.ts`

Next, we'll transition our hardcoded Todo items from `todo-list.component.ts` to the `todo.state.ts` file. These items will be stored in the `defaults` property of the state, serving as the initial values.

Note: To see the updated application, please complete the following exercises.

---

🎧 **Exercises**

1. Provide the `TodoState` in the `app.config.ts`

```ts
export const config: ApplicationConfig = {
  providers: [
    // add the TodoState in the provideStore array
    provideStore([TodoState])
  ]
};
```

2. Add a TODO item in the `defaults.todo` array of the `todo.state.ts`

```ts
@State<TodoStateModel>({
  name: 'todo',
  defaults: {
    todos: [
      //...
      // Add an item here
    ],
  },
})
```

---

👀 **Observe**

- The **app.config.ts** file has the `provideStore` function with an empty array. Every root level state slice should be part of this array.
- The `todo.actions.ts` file has been generated
- The `todo.state.spec.ts` file has been generated
- The `todo.state.ts` file has been generated

---

📚 **Read more**

- Read more in the NGXS documentation <a href="https://www.ngxs.io/introduction/installation" target="_blank">here</a>
