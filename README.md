<p align="center">
  <figure><picture><source srcset="docs/assets/ngxs-logo_dark_theme.png" media="(prefers-color-scheme: dark)"><img src="docs/assets/ngxs-logo_light_theme.png" alt=""></picture></figure>
  <br />
  NGXS is a state management pattern + library for Angular
  <br /><br />
  
  <a href="https://travis-ci.org/ngxs/store">
    <img src="https://api.travis-ci.org/ngxs/store.svg?branch=master" />
  </a>
  <a href="https://join.slack.com/t/ngxs/shared_invite/zt-by26i24h-2CC5~vqwNCiZa~RRibh60Q">
    <img src="https://img.shields.io/badge/slack-join%20us-blue.svg?style=flat&logo=slack" />
  </a>
  <a href="https://badge.fury.io/js/%40ngxs%2Fstore">
    <img src="https://badge.fury.io/js/%40ngxs%2Fstore.svg" />
  </a>
  <a href="https://www.npmjs.com/package/@ngxs/store">
    <img src="https://img.shields.io/npm/dw/@ngxs/store.svg" />
  </a>
  <a href="https://gurubase.io/g/ngxs">
    <img src="https://img.shields.io/badge/Gurubase-Ask%20NGXS%20Guru-006BFF" />
  </a>
  
  <br />
  
  <a href="https://npm-stat.com/charts.html?package=%40ngxs%2Fstore&from=2017-01-12">
    <img src="https://img.shields.io/npm/dt/@ngxs/store.svg" />
  </a>
  <a href="https://codeclimate.com/github/ngxs/store/maintainability">
    <img src="https://api.codeclimate.com/v1/badges/5b43106a1ddff7d76a04/maintainability" />
  </a>
  <a href="https://codeclimate.com/github/ngxs/store/test_coverage">
    <img src="https://api.codeclimate.com/v1/badges/5b43106a1ddff7d76a04/test_coverage" />
  </a> 
  <a href="https://circleci.com/gh/ngxs/store">
    <img src="https://circleci.com/gh/ngxs/store/tree/master.svg?style=svg" />
  </a>
  <a href="https://github.com/ngxs/store/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/Naereen/StrapDown.js.svg" />
  </a>
</p>

---

### Quick Links

- ✨ Learn about it on the [docs site](https://ngxs.io/)
- 💬 Ask a question in our [Discord](https://discord.gg/yT3Q8cXTnz) server (we are migrating from our [slack](https://join.slack.com/t/ngxs/shared_invite/zt-by26i24h-2CC5~vqwNCiZa~RRibh60Q) server).
- 🚀 See it in action on [Stackblitz](https://stackblitz.com/edit/ngxs-repro)
- 😎 Checkout the [sample application](integration)
- 🔧 Scaffolding application using [NGXS Schematics](https://www.ngxs.io/introduction/schematics)
- 📖 Read the blog [posts](https://medium.com/ngxs)
- ⚡️ Development of [NGXS Labs](https://github.com/ngxs-labs)
- 📝 Learn about updates from the [changelog](CHANGELOG.md)
- ❤️ Give back by becoming a [Contributor](docs/community-and-labs/community/contributors.md) or a [Sponsor](/docs/community-and-labs/community/sponsors.md)
- 👂 We would love to hear about your experience with NGXS, you can [leave your feedback here](https://forms.gle/2Nf9tNyZnaD8AZL89)

---

### The Goal of NGXS

NGXS tries to make things as simple and accessible as possible. There can be a lot of boilerplate code in state management, thus a main goal of NGXS is to reduce boilerplate allowing you to do more things with less. It is also not necessary to be super familiar with RxJs.

### The Goal of NGXS Labs

The idea with this github organisation is to provide a place for the community to create libraries that augment the main framework with functionality that does not need to be integrated directly into the framework and therefore can evolve through their initial iterations of experimentation without affecting the main @ngxs/store library.

### Developer Guides

- [Getting Started](docs/community-and-labs/community/developer-guide.md) - Installation and local development.
- [Contributing](docs/community-and-labs/community/contributing.md) - Learn how to contribute to the project.
- [Style Guide](docs/style-guide.md) - Coding conventions and best practices.
- [Code of Conduct](CODE_OF_CONDUCT.md) - Contributor Code of Conduct.

#### NGXS Labs

If you have ideas for creating unique libraries, you can join us. Email us at `ngxs.lead@gmail.com`. Or you can email us on Twitter or Slack.

### Packages

#### Tools

| Project             | Package                                                          | Version                                                                                                               | Links                                                                                                                      |
| ------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **NGXS CLI**        | [`@ngxs/cli`](https://npmjs.com/package/@ngxs/cli)               | [![latest](https://img.shields.io/npm/v/%40ngxs%2Fcli/latest.svg)](https://npmjs.com/package/@ngxs/cli)               | [![README](https://img.shields.io/badge/README--green.svg)](https://github.com/ngxs/store/blob/master/docs/plugins/cli.md) |
| **NGXS Schematics** | [`@ngxs/schematics`](https://npmjs.com/package/@ngxs/schematics) | [![latest](https://img.shields.io/npm/v/%40ngxs%2Fschematics/latest.svg)](https://npmjs.com/package/@ngxs/schematics) | [![README](https://img.shields.io/badge/README--green.svg)](https://github.com/ngxs/schematics/blob/master/README.md)      |

#### Packages

| Project                   | Package                                                                      | Version                                                                                                                           | Links                                                                                                                                                                                                                                                       |
| ------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **NGXS Store**            | [`@ngxs/store`](https://npmjs.com/package/@ngxs/store)                       | [![latest](https://img.shields.io/npm/v/%40ngxs%2Fstore/latest.svg)](https://npmjs.com/package/@ngxs/store)                       | [![README](https://img.shields.io/badge/README--green.svg)](http://ngxs.io) [![snapshot](https://img.shields.io/badge/snapshot--blue.svg)](https://www.npmjs.com/package/@ngxs/store/v/dev)                                                                 |
| **NGXS Logger-plugin**    | [`@ngxs/logger-plugin`](https://npmjs.com/package/@ngxs/logger-plugin)       | [![latest](https://img.shields.io/npm/v/%40ngxs%2Flogger-plugin/latest.svg)](https://npmjs.com/package/@ngxs/logger-plugin)       | [![README](https://img.shields.io/badge/README--green.svg)](https://github.com/ngxs/store/blob/master/docs/plugins/logger.md) [![snapshot](https://img.shields.io/badge/snapshot--blue.svg)](https://www.npmjs.com/package/@ngxs/logger-plugin/v/dev)       |
| **NGXS Devtools-plugin**  | [`@ngxs/devtools-plugin`](https://npmjs.com/package/@ngxs/devtools-plugin)   | [![latest](https://img.shields.io/npm/v/%40ngxs%2Fdevtools-plugin/latest.svg)](https://npmjs.com/package/@ngxs/devtools-plugin)   | [![README](https://img.shields.io/badge/README--green.svg)](https://github.com/ngxs/store/blob/master/docs/plugins/devtools.md) [![snapshot](https://img.shields.io/badge/snapshot--blue.svg)](https://www.npmjs.com/package/@ngxs/devtools-plugin/v/dev)   |
| **NGXS WebSocket-plugin** | [`@ngxs/websocket-plugin`](https://npmjs.com/package/@ngxs/websocket-plugin) | [![latest](https://img.shields.io/npm/v/%40ngxs%2Fwebsocket-plugin/latest.svg)](https://npmjs.com/package/@ngxs/websocket-plugin) | [![README](https://img.shields.io/badge/README--green.svg)](https://github.com/ngxs/store/blob/master/docs/plugins/websocket.md) [![snapshot](https://img.shields.io/badge/snapshot--blue.svg)](https://www.npmjs.com/package/@ngxs/websocket-plugin/v/dev) |
| **NGXS Form-plugin**      | [`@ngxs/form-plugin`](https://npmjs.com/package/@ngxs/form-plugin)           | [![latest](https://img.shields.io/npm/v/%40ngxs%2Fform-plugin/latest.svg)](https://npmjs.com/package/@ngxs/form-plugin)           | [![README](https://img.shields.io/badge/README--green.svg)](https://github.com/ngxs/store/blob/master/docs/plugins/form.md) [![snapshot](https://img.shields.io/badge/snapshot--blue.svg)](https://www.npmjs.com/package/@ngxs/form-plugin/v/dev)           |
| **NGXS Router-plugin**    | [`@ngxs/router-plugin`](https://npmjs.com/package/@ngxs/router-plugin)       | [![latest](https://img.shields.io/npm/v/%40ngxs%2Frouter-plugin/latest.svg)](https://npmjs.com/package/@ngxs/router-plugin)       | [![README](https://img.shields.io/badge/README--green.svg)](https://github.com/ngxs/store/blob/master/docs/plugins/router.md) [![snapshot](https://img.shields.io/badge/snapshot--blue.svg)](https://www.npmjs.com/package/@ngxs/router-plugin/v/dev)       |
| **NGXS Storage-plugin**   | [`@ngxs/storage-plugin`](https://npmjs.com/package/@ngxs/storage-plugin)     | [![latest](https://img.shields.io/npm/v/%40ngxs%2Fstorage-plugin/latest.svg)](https://npmjs.com/package/@ngxs/storage-plugin)     | [![README](https://img.shields.io/badge/README--green.svg)](https://github.com/ngxs/store/blob/master/docs/plugins/storage.md) [![snapshot](https://img.shields.io/badge/snapshot--blue.svg)](https://www.npmjs.com/package/@ngxs/storage-plugin/v/dev)     |
| **NGXS HMR**              | [`@ngxs/hmr-plugin`](https://npmjs.com/package/@ngxs/hmr-plugin)             | [![latest](https://img.shields.io/npm/v/%40ngxs%2Fhmr-plugin/latest.svg)](https://npmjs.com/package/@ngxs/hmr-plugin)             | [![README](https://img.shields.io/badge/README--green.svg)](https://github.com/ngxs/store/blob/master/docs/plugins/hmr.md) [![snapshot](https://img.shields.io/badge/snapshot--blue.svg)](https://www.npmjs.com/package/@ngxs/hmr-plugin/v/dev)             |

#### NGXS Labs

| Project                                 | Package                                                                                        | Version                                                                                                                                             | Links                                                                                                          |
| --------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **NGXS Persistence API**                | [`@anglar-ru/ngxs`](https://angular-ru.gitbook.io/sdk/ngxs/ngxs)                               | [![latest](https://img.shields.io/npm/v/%40angular-ru%2Fngxs/latest.svg)](https://npmjs.com/package/@angular-ru/ngxs)                               | [![README](https://img.shields.io/badge/README--green.svg)](https://angular-ru.gitbook.io/sdk/ngxs/ngxs)       |
| **NGXS-labs Emitter**                   | [`@ngxs-labs/emitter`](https://npmjs.com/package/@ngxs-labs/emitter)                           | [![latest](https://img.shields.io/npm/v/%40ngxs-labs%2Femitter/latest.svg)](https://npmjs.com/package/@ngxs-labs/emitter)                           | [![README](https://img.shields.io/badge/README--green.svg)](https://github.com/ngxs-labs/emitter)              |
| **NGXS-labs Immer adapter**             | [`@ngxs-labs/immer-adapter`](https://npmjs.com/package/@ngxs-labs/immer-adapter)               | [![latest](https://img.shields.io/npm/v/%40ngxs-labs%2Fimmer-adapter/latest.svg)](https://npmjs.com/package/@ngxs-labs/immer-adapter)               | [![README](https://img.shields.io/badge/README--green.svg)](https://github.com/ngxs-labs/immer-adapter)        |
| **NGXS-labs Dispatch decorator**        | [`@ngxs-labs/dispatch-decorator`](https://npmjs.com/package/@ngxs-labs/dispatch-decorator)     | [![latest](https://img.shields.io/npm/v/%40ngxs-labs%2Fdispatch-decorator/latest.svg)](https://npmjs.com/package/@ngxs-labs/dispatch-decorator)     | [![README](https://img.shields.io/badge/README--green.svg)](https://github.com/ngxs-labs/dispatch-decorator)   |
| **NGXS-labs Select snapshot decorator** | [`@ngxs-labs/select-snapshot`](https://npmjs.com/package/@ngxs-labs/select-snapshot)           | [![latest](https://img.shields.io/npm/v/%40ngxs-labs%2Fselect-snapshot/latest.svg)](https://npmjs.com/package/@ngxs-labs/select-snapshot)           | [![README](https://img.shields.io/badge/README--green.svg)](https://github.com/ngxs-labs/select-snapshot)      |
| **NGXS-labs Async storage plugin**      | [`@ngxs-labs/async-storage-plugin`](https://npmjs.com/package/@ngxs-labs/async-storage-plugin) | [![latest](https://img.shields.io/npm/v/%40ngxs-labs%2Fasync-storage-plugin/latest.svg)](https://npmjs.com/package/@ngxs-labs/async-storage-plugin) | [![README](https://img.shields.io/badge/README--green.svg)](https://github.com/ngxs-labs/async-storage-plugin) |
| **NGXS-labs Entity state**              | [`@ngxs-labs/entity-state`](https://npmjs.com/package/@ngxs-labs/entity-state)                 | [![latest](https://img.shields.io/npm/v/%40ngxs-labs%2Fentity-state/latest.svg)](https://npmjs.com/package/@ngxs-labs/entity-state)                 | [![README](https://img.shields.io/badge/README--green.svg)](https://github.com/ngxs-labs/entity-state)         |
| **NGXS-labs Testing tools**             | [`@ngxs-labs/testing`](https://npmjs.com/package/@ngxs-labs/testing)                           | [![latest](https://img.shields.io/npm/v/%40ngxs-labs%2Ftesting/latest.svg)](https://npmjs.com/package/@ngxs-labs/testing)                           | [![README](https://img.shields.io/badge/README--green.svg)](https://github.com/ngxs-labs/testing)              |
| **NGXS-labs Actions Executing**         | [`@ngxs-labs/actions-executing`](https://npmjs.com/package/@ngxs-labs/actions-executing)       | [![latest](https://img.shields.io/npm/v/%40ngxs-labs%2Ftesting/latest.svg)](https://npmjs.com/package/@ngxs-labs/actions-executing)                 | [![README](https://img.shields.io/badge/README--green.svg)](https://github.com/ngxs-labs/actions-executing)    |
| **NGXS-labs Attach Action**             | [`@ngxs-labs/attach-action`](https://npmjs.com/package/@ngxs-labs/attach-action)               | [![latest](https://img.shields.io/npm/v/%40ngxs-labs%2Fattach-action/latest.svg)](https://npmjs.com/package/@ngxs-labs/attach-action)               | [![README](https://img.shields.io/badge/README--green.svg)](https://github.com/ngxs-labs/attach-action)        |

#### Community

| Project                 | Package                                                                    | Version                                                                                                                     | Links                                                                                                                                                         |
| ----------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Reset Plugin**        | [`ngxs-reset-plugin`](https://npmjs.com/package/ngxs-reset-plugin)         | [![latest](https://img.shields.io/npm/v/ngxs-reset-plugin/latest.svg)](https://npmjs.com/package/ngxs-reset-plugin)         | [![README](https://img.shields.io/badge/README--green.svg)](https://github.com/ng-turkey/ngxs-reset-plugin/blob/master/README.md)                             |
| **NGXS-Loading-plugin** | [`ngxs-loading-plugin`](https://www.npmjs.com/package/ngxs-loading-plugin) | [![latest](https://img.shields.io/npm/v/ngxs-loading-plugin/latest.svg)](https://www.npmjs.com/package/ngxs-loading-plugin) | [![README](https://img.shields.io/badge/README--green.svg)](https://github.com/sa-bangash/ngxs-plugin/blob/master/README.md)                                  |
| **NGXS-History-plugin** | [`ngxs-history-plugin`](https://www.npmjs.com/package/ngxs-history-plugin) | [![latest](https://img.shields.io/npm/v/ngxs-history-plugin/latest.svg)](https://www.npmjs.com/package/ngxs-history-plugin) | [![README](https://img.shields.io/badge/README--green.svg)](https://github.com/profanis/ngxs-history-plugin/blob/main/projects/ngxs-history-plugin/README.md) |

# Contributors

Thanks to all our contributors!

<a href="https://github.com/ngxs/ngxs/graphs/contributors"><img src="https://opencollective.com/ngxs/contributors.svg?width=890" /></a>
