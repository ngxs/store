import { Service } from '@angular/core';
import { State } from '@ngxs/store';

// Intentionally decorated with bare `@Service()` (defaults to `autoProvided: true`) rather than
// `@Service({ autoProvided: false })`. This state contributes nothing to the app — it exists so
// the integration build/e2e run always compiles and boots a state in this "wrong" configuration,
// proving it doesn't break the app even though NGXS's dev-mode check warns about it.
@State({
  name: 'dummy',
  defaults: null
})
@Service()
export class DummyState {}
