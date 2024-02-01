We have `@definitelytyped/header-parser` resolved to version `0.0.93` because `dtslint` points to the `latest` version, which is `^0.2.2` and is not compatible with the API being used by `dtslint` (due to its deprecation). In the future, we will need to migrate to `tsd` instead.

We have all of these dependencies installed separately from the root dependencies to avoid conflicts with different TypeScript versions and other dependencies.
