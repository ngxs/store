# Style Guide
Below are suggestions for naming and style conventions.

- Stores should always have the `Store` suffix. Right: `ZooStore` Wrong: `Zoo`
- Stores should have a `.store.ts` suffix for the filename
- Selects should have a `$` suffix. Right: `animals$` Wrong: `animals`
- Plugins should end with the `Plugin` suffix
- Global stores should be organized under `src/shared/store`
- Feature stores should live within the respective feature folder structure `src/app/my-feature`
- Events should NOT have a a suffix
- Unit tests for the store should be named `my-store-name.store.spec.ts`
- Events should ALWAYS use the `payload` public name
- Actions can live within the store file but are recommended to be a separate file like: `zoo.events.ts`
- Mutations should NEVER perform async operations
- Actions should NEVER mutate the state directly
- Actions should NOT deal with view related operations (i.e. showing popups/etc)
