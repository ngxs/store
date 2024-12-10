import { withNgxsPendingTasks } from '@ngxs/store';

/**
 * Required for correct functioning of SSR apps.
 *
 * @deprecated
 * This experimental export is deprecated in favour of the non-experimental export.
 * This is no longer an experimental feature, but is now available as
 * `withNgxsPendingTasks` in the main `@ngxs/store` package.
 */
export function withExperimentalNgxsPendingTasks() {
  return withNgxsPendingTasks();
}
