# Inject Container State Deprecation

The `injectContainerState` feature is scheduled for removal in future updates. Instead, it can now be declared in the global configuration when invoking `forRoot` or `provideStore`, or through the `@SelectorOptions` decorator. This property was introduced several years ago to facilitate the incremental migration of existing codebases.

This change specifically impacts the runtime behavior of the `@Selector` decorator and how parameters are passed into selector functions, especially when `@Selector` is used with joined selectors. It's important to note that this change does not affect the behavior of `createSelector`.

No changes need to be made when `@Selector` is called with no arguments within the state class:

```ts
export class InvoiceState {
  @Selector()
  static getInvoiceId(state: InvoiceStateModel) {
    return state.id;
  }
}
```

However, if you're calling the decorator with arguments, you would expect the container state to be injected as the first argument:

```ts
export class InvoiceLinesState {
  @Selector([InvoiceState.getInvoiceId])
  static getInvoiceLinesByInvoiceId(state: InvoiceLinesStateModel, invoiceId: number) {
    return state.invoiceLines.filter(line => line.invoiceId === invoiceId);
  }
}
```

With `injectContainerState` being removed and set to `false` by default, you now need to explicitly specify the container state in the above example:

```ts
export class InvoiceLinesState {
  @Selector()
  static getInvoiceLines(state: InvoiceLinesStateModel) {
    return state.invoiceLines;
  }

  @Selector([InvoiceLinesState.getInvoiceLines, InvoiceState.getInvoiceId])
  static getInvoiceLinesByInvoiceId(invoiceLines: InvoiceLine[], invoiceId: number) {
    return invoiceLines.filter(line => line.invoiceId === invoiceId);
  }
}
```
