# Sub States Deprecation

We're planning to remove the option to declare sub-states on the state using the `children` property. This feature was introduced years ago to address certain issues, but it's not technically beneficial and doesn't add any value.

Moreover, this feature has been restrictive because you always had to consider state erasure when calling `ctx.setState` in states that have sub-states. This is because `ctx.setState` removes the sub-state, which is mostly invisible from the parent state.

Therefore, it necessitated maintaining a relationship between a parent and a child state.

It's preferable to have separate states that maintain the relationship. There shouldn't be bidirectional dependencies between states, as it often leads to cyclic dependency errors.

For example, if you have an invoice state and an invoice list state, instead of tying the invoice list state to the invoice state through `children: [InvoiceListsState]`, you can keep `InvoiceListsState` entirely separate. Each invoice list item may have an `invoiceId` property. Then, when you select a list, you can join the selector with `InvoiceState.getInvoiceId` or something similar to retrieve the invoice ID, and then filter the invoice list by `invoiceId`.
