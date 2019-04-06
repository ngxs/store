<p align="center">
  <img src="docs/assets/logo.png">
  <br />
  NGXS is a state management pattern + library for Angular
  <br /><br />
  
  <a href="https://travis-ci.org/ngxs/store">
    <img src="https://api.travis-ci.org/ngxs/store.svg?branch=master" />
  </a>
  <a href="https://now-examples-slackin-eqzjxuxoem.now.sh/">
    <img src="https://now-examples-slackin-eqzjxuxoem.now.sh/badge.svg" />
  </a>
  <a href="https://badge.fury.io/js/%40ngxs%2Fstore">
    <img src="https://badge.fury.io/js/%40ngxs%2Fstore.svg" />
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

</p>

---

### Quick Links

- ✨ Learn about it on the [docs site](https://ngxs.gitbooks.io/ngxs/)
- 🚀 See it in action on [Stackblitz](https://stackblitz.com/edit/ngxs-simple)
- 😎 Checkout the [sample application](integration)
- 🔧 Scaffolding application using [NGXS Schematics](https://github.com/ngxs/schematics)
- 📖 Read the blog [posts](https://medium.com/ngxs)
- ⚡️ Development of [NGXS Labs](https://github.com/ngxs-labs)
- 📝 Learn about updates from the [changelog](CHANGELOG.md)
- ❤️ Give back by becoming a [Contributor](docs/community/contributors.md) or a [Sponsor](/docs/community/sponsors.md)

----

### The Goal of NGXS

NGXS tries to make things as simple and accessible as possible. There can be a lot of boilerplate code in state management, thus a main goal of NGXS is to reduce boilerplate allowing you to do more things with less. It is also not necessary to be super familiar with RxJs.

### The Goal of NGXS Labs

The idea with this github organisation is to provide a place for the community to create libraries that augment the main framework with functionality that does not need to be integrated directly into the framework and therefore can evolve through their initial iterations of experimentation without affecting the main @ngxs/store library.

### Getting Started - Local Development

#### Installation

To get started locally, follow these instructions:

1. If you haven't done it already, make a fork of this repo.
2. Clone to your local computer using git.
3. Make sure that you have installed NodeJS.
4. Make sure that you have yarn installed.
5. Run ``yarn install``.
6. Run ``yarn build:packages``.

#### Creating new packages or add feature/fix

##### if you make changes @ngxs/store

1. Run development mode ``yarn build:packages --package store --watch``
2. Run serve integration examples ``yarn start``
3. **...development...**
4. Run tests ``yarn test:ci``
5. Create pull request

##### if you add a new package @ngxs/my-super-plugin

1. Create a new project folder ``packages/my-super-plugin``
2. Create template library with ngPackagr
3. Add your project to package.json
4. Run development mode ``yarn build:packages --package my-super-plugin --watch``
5. **...development...**
6. Run build ``yarn build:packages --package my-super-plugin``
7. Run tests ``yarn test:ci``
8. Create pull request

#### NGXS Labs

If you have ideas for creating unique libraries, you can join us. Email us at `ngxs.lead@gmail.com`. Or you can email us on Twitter or Slack.

### Packages

#### Tools

| Project | Package | Version | Links |
|---|---|---|---|
**NGXS CLI** | [`@ngxs/cli`](https://npmjs.com/package/@ngxs/cli) | [![latest](https://img.shields.io/npm/v/%40ngxs%2Fcli/latest.svg)](https://npmjs.com/package/@ngxs/cli) | [![README](https://img.shields.io/badge/README--green.svg)](https://github.com/ngxs/store/blob/master/docs/plugins/cli.md)
**NGXS Schematics** | [`@ngxs/schematics`](https://npmjs.com/package/@ngxs/schematics) | [![latest](https://img.shields.io/npm/v/%40ngxs%2Fschematics/latest.svg)](https://npmjs.com/package/@ngxs/schematics) |  [![README](https://img.shields.io/badge/README--green.svg)](https://github.com/ngxs/schematics/blob/master/README.md)

#### Packages

| Project | Package | Version | Links |
|---|---|---|---|
**NGXS Store** | [`@ngxs/store`](https://npmjs.com/package/@ngxs/store) | [![latest](https://img.shields.io/npm/v/%40ngxs%2Fstore/latest.svg)](https://npmjs.com/package/@ngxs/store) |  [![README](https://img.shields.io/badge/README--green.svg)](http://ngxs.io) [![snapshot](https://img.shields.io/badge/snapshot--blue.svg)](https://www.npmjs.com/package/@ngxs/store/v/dev)
**NGXS Logger-plugin** | [`@ngxs/logger-plugin`](https://npmjs.com/package/@ngxs/logger-plugin) | [![latest](https://img.shields.io/npm/v/%40ngxs%2Flogger-plugin/latest.svg)](https://npmjs.com/package/@ngxs/logger-plugin) | [![README](https://img.shields.io/badge/README--green.svg)](https://github.com/ngxs/store/blob/master/docs/plugins/logger.md) [![snapshot](https://img.shields.io/badge/snapshot--blue.svg)](https://www.npmjs.com/package/@ngxs/logger-plugin/v/dev)
**NGXS Devtools-plugin** | [`@ngxs/devtools-plugin`](https://npmjs.com/package/@ngxs/devtools-plugin) | [![latest](https://img.shields.io/npm/v/%40ngxs%2Fdevtools-plugin/latest.svg)](https://npmjs.com/package/@ngxs/devtools-plugin) | [![README](https://img.shields.io/badge/README--green.svg)](https://github.com/ngxs/store/blob/master/docs/plugins/devtools.md) [![snapshot](https://img.shields.io/badge/snapshot--blue.svg)](https://www.npmjs.com/package/@ngxs/devtools-plugin/v/dev)
**NGXS WebSocket-plugin** | [`@ngxs/websocket-plugin`](https://npmjs.com/package/@ngxs/websocket-plugin) | [![latest](https://img.shields.io/npm/v/%40ngxs%2Fwebsocket-plugin/latest.svg)](https://npmjs.com/package/@ngxs/websocket-plugin) | [![README](https://img.shields.io/badge/README--green.svg)](https://github.com/ngxs/store/blob/master/docs/plugins/websocket.md) [![snapshot](https://img.shields.io/badge/snapshot--blue.svg)](https://www.npmjs.com/package/@ngxs/websocket-plugin/v/dev)
**NGXS Form-plugin** | [`@ngxs/form-plugin`](https://npmjs.com/package/@ngxs/form-plugin) | [![latest](https://img.shields.io/npm/v/%40ngxs%2Fform-plugin/latest.svg)](https://npmjs.com/package/@ngxs/form-plugin) | [![README](https://img.shields.io/badge/README--green.svg)](https://github.com/ngxs/store/blob/master/docs/plugins/form.md) [![snapshot](https://img.shields.io/badge/snapshot--blue.svg)](https://www.npmjs.com/package/@ngxs/form-plugin/v/dev)
**NGXS Router-plugin** | [`@ngxs/router-plugin`](https://npmjs.com/package/@ngxs/router-plugin) | [![latest](https://img.shields.io/npm/v/%40ngxs%2Frouter-plugin/latest.svg)](https://npmjs.com/package/@ngxs/router-plugin) | [![README](https://img.shields.io/badge/README--green.svg)](https://github.com/ngxs/store/blob/master/docs/plugins/router.md) [![snapshot](https://img.shields.io/badge/snapshot--blue.svg)](https://www.npmjs.com/package/@ngxs/router-plugin/v/dev)
**NGXS Storage-plugin** | [`@ngxs/storage-plugin`](https://npmjs.com/package/@ngxs/storage-plugin) | [![latest](https://img.shields.io/npm/v/%40ngxs%2Fstorage-plugin/latest.svg)](https://npmjs.com/package/@ngxs/storage-plugin) | [![README](https://img.shields.io/badge/README--green.svg)](https://github.com/ngxs/store/blob/master/docs/plugins/storage.md) [![snapshot](https://img.shields.io/badge/snapshot--blue.svg)](https://www.npmjs.com/package/@ngxs/storage-plugin/v/dev)
**NGXS HMR** | [`@ngxs/hmr-plugin`](https://npmjs.com/package/@ngxs/hmr-plugin) | [![latest](https://img.shields.io/npm/v/%40ngxs%2Fhmr-plugin/latest.svg)](https://npmjs.com/package/@ngxs/hmr-plugin) | [![README](https://img.shields.io/badge/README--green.svg)](https://github.com/ngxs/store/blob/master/docs/plugins/hmr.md) [![snapshot](https://img.shields.io/badge/snapshot--blue.svg)](https://www.npmjs.com/package/@ngxs/hmr-plugin/v/dev)

#### NGXS Labs

| Project | Package | Version | Links |
|---|---|---|---|
**NGXS-labs Emitter** | [`@ngxs-labs/emitter`](https://npmjs.com/package/@ngxs-labs/emitter) | [![latest](https://img.shields.io/npm/v/%40ngxs-labs%2Femitter/latest.svg)](https://npmjs.com/package/@ngxs-labs/emitter) | [![README](https://img.shields.io/badge/README--green.svg)](https://github.com/ngxs-labs/emitter)
**NGXS-labs Immer-adapter** | [`@ngxs-labs/immer-adapter`](https://npmjs.com/package/@ngxs-labs/immer-adapter) | [![latest](https://img.shields.io/npm/v/%40ngxs-labs%2Fimmer-adapter/latest.svg)](https://npmjs.com/package/@ngxs-labs/immer-adapter) | [![README](https://img.shields.io/badge/README--green.svg)](https://github.com/ngxs-labs/immer-adapter)
**NGXS-labs Dispatch** | [`@ngxs-labs/dispatch-decorator`](https://npmjs.com/package/@ngxs-labs/dispatch-decorator) | [![latest](https://img.shields.io/npm/v/%40ngxs-labs%2Fdispatch-decorator/latest.svg)](https://npmjs.com/package/@ngxs-labs/dispatch-decorator) | [![README](https://img.shields.io/badge/README--green.svg)](https://github.com/ngxs-labs/dispatch-decorator)
**NGXS-labs Async-storage-plugin** | [`@ngxs-labs/async-storage-plugin`](https://npmjs.com/package/@ngxs-labs/async-storage-plugin) | [![latest](https://img.shields.io/npm/v/%40ngxs-labs%2Fasync-storage-plugin/latest.svg)](https://npmjs.com/package/@ngxs-labs/async-storage-plugin) | [![README](https://img.shields.io/badge/README--green.svg)](https://github.com/ngxs-labs/async-storage-plugin)
**NGXS-labs Entity-state** | [`@ngxs-labs/entity-state`](https://npmjs.com/package/@ngxs-labs/entity-state) | [![latest](https://img.shields.io/npm/v/%40ngxs-labs%2Fentity-state/latest.svg)](https://npmjs.com/package/@ngxs-labs/entity-state) | [![README](https://img.shields.io/badge/README--green.svg)](https://github.com/ngxs-labs/entity-state)
