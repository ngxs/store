# Style Guide
Below are suggestions for naming and style conventions.

### State Suffix
A state should always be suffixed with the word `State`. Right: `ZooState` Wrong: `Zoo`

### State Filenames
States should have a `.state.ts` suffix for the filename

### State Interfaces
State interfaces should be named the name of the state followed by the `Model` suffix. If my
state were called `ZooState`, we would call my state interface `ZooStateModel`.

### Select Suffix
Selects should have a `$` suffix. Right: `animals$` Wrong: `animals`

### Plugin Suffix
Plugins should end with the `Plugin` suffix

### Plugin Filenames
Plugins file names should end with `.plugin.ts`

### Folder Organization
Global states should be organized under `src/shared/state`.
Feature states should live within the respective feature folder structure `src/app/my-feature`.
Actions can live within the state file but are recommended to be a separate file like: `zoo.actions.ts`

### Action Suffixes
Actions should NOT have a suffix

### Unit Tests
Unit tests for the state should be named `my-state-name.state.spec.ts`

### Action Operations
Actions should NOT deal with view related operations (i.e. showing popups/etc). Use the action
stream to handle these types of operations
