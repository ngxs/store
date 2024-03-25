# Signals

NGXS offers utilities for signals that can be used with other solutions. All of these utilities are located within the `@ngxs/signals` package and are independent of any specific.

## Produce selectors and actions

Utility functions include `produceSelectors` and `produceActions`.

### produceSelectors

The `produceSelectors` function accepts an object where the values are selector functions:

```ts
import { produceSelectors } from '@ngxs/signals';

class AppComponent {
  selectors = produceSelectors({
    invoiceId: InvoiceState.getInvoiceId,
    invoiceSignature: InvoiceState.getInvoiceSignature,
    invoiceLines: InvoiceLinesState.getInvoiceLines
  });
}
```

The `selectors` property will now be an object where the keys are the same keys you provided to the `produceSelectors`, and the values are signals from the state using the provided selectors. Consider the following template example:

```html
<div>
  <p>Invoice ID: {{ selectors.invoiceId() }}</p>
  <p>Invoice signature: {{ selectors.invoiceSignature() }}</p>
  <p>Invoice lines: {{ selectors.invoiceLines() | json }}</p>
  <!--
    Error: Property 'invoiceBody' does not exist on type { ... }
  -->
  <p>{{ selectors.invoiceBody() }}</p>
</div>
```

Properties are also `readonly` by type and functionality. Assigning to a property will result in compiler and runtime errors.

It also necessitates an injection context since it internally employs `inject`.

### produceActions

The `produceActions` function accepts an object where the values are action classes. It only allow action classes because they contain type information (constructor parameters):

```ts
import { produceSelectors, produceActions } from '@ngxs/signals';

class AppComponent {
  selectors = produceSelectors({
    invoiceId: InvoiceState.getInvoiceId,
    invoiceSignature: InvoiceState.getInvoiceSignature,
    invoiceLines: InvoiceLinesState.getInvoiceLines
  });

  actions = produceActions({
    updateInvoiceSignature: InvoiceActions.UpdateInvoiceSignature,
    reloadInvoiceLines: InvoiceLinesActions.ReloadInvoiceLines
  });
}
```

The `actions` property will now be an object where the keys are the same keys, and the values are functions that accept the same arguments as action constructors and return observables (representing the dispatch result):

```html
<button (click)="actions.reloadInvoiceLines(selectors.invoiceId())">
  Reload invoice lines
</button>
```

### Using utilities with NgRx SignalStore

These utility functions can be easily integrated for use with the NgRx SignalStore solution. We will need to create simple [store features](https://ngrx.io/guide/signals/signal-store/custom-store-features) and include them in our codebase:

```ts
import { signalStoreFeature, withComputed } from '@ngrx/signals';
import { produceSelectors, SelectorMap, produceActions, ActionMap } from '@ngxs/signals';

export function withSelectors<T extends SelectorMap>(selectorMap: T) {
  return signalStoreFeature(withComputed(() => produceSelectors(selectorMap)));
}

export function withActions<T extends ActionMap>(actionMap: T) {
  return signalStoreFeature(withMethods(() => produceActions(actionMap)));
}
```

Now, let's explore how these utilities can assist in creating a signal store by using these straightforward signal store features:

```ts
import { signalStore } from '@ngrx/signals';

import { withSelectors, withActions } from './utilities-we-created';

export const InvoicesStore = signalStore(
  withSelectors({
    invoices: InvoicesState.getInvoice,
    signatures: InvoicesState.getSignatures,
    totalAmountDue: InvoicesState.getTotalAmountDue
  }),

  withActions({
    getInvoice: InvoicesActions.getInvoices,
    updateTotalAmountDue: InvoicesActions.UpdateTotalAmountDue
  })
);
```

The reason we didn't tie our solution to NgRx signals is because we aimed for it to be solution-agnostic. Therefore, these utility functions, `produceSelectors` and `produceActions`, can be utilized in a similar manner with other state management solutions.
