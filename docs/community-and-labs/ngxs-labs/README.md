# Introduction

<div align="center">

<img src="../../assets/ngxs-labs.png" alt="">

</div>

We announced a new idea called [NGXS Labs](https://github.com/ngxs-labs). The goal of NGXS Labs is to more clearly communicate the balance between new explorations by the team, with the normal stability that our community has come to expect since the release of NGXS.

#### Introduction

There is definitely no lack of enthusiasm for the NGXS project and as a result there has been a proliferation of pull requests to add new features to the framework. This is very exciting but at the same time has been one of the big challenges. How do we incorporate the growing innovation around the framework and experiment with different ideas without compromising the stability and comprehensibility of the core framework? In response to this we have created NGXS Labs.

The idea with this github organisation is to provide a place for the community to create libraries that augment the main framework with functionality that does not need to be integrated directly into the framework and therefore can evolve through their initial iterations of experimentation without affecting the main `@ngxs/store` library. Once a project in the labs space has stabilised, has received significant adoption and is accepted as a recommended approach then it can be moved to the ngxs github organisation.

From time to time we will be posting about projects that have been started under the ngxs-labs organisation to get community involvement and feedback around them.

#### Labs Packages

| Package                                                                                      | Version                                                                          | Status      |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------- |
| [@ngxs-labs/data](https://npmjs.com/package/@ngxs-labs/data)                                 | ![](https://img.shields.io/npm/v/%40ngxs-labs%2Fdata/latest.svg)                 | Stable      |
| [@ngxs-labs/emitter](https://npmjs.com/package/@ngxs-labs/emitter)                           | ![](https://img.shields.io/npm/v/%40ngxs-labs%2Femitter/latest.svg)              | Stable      |
| [@ngxs-labs/immer-adapter](https://npmjs.com/package/@ngxs-labs/immer-adapter)               | ![](https://img.shields.io/npm/v/%40ngxs-labs%2Fimmer-adapter/latest.svg)        | Stable      |
| [@ngxs-labs/dispatch-decorator](https://npmjs.com/package/@ngxs-labs/dispatch-decorator)     | ![](https://img.shields.io/npm/v/%40ngxs-labs%2Fdispatch-decorator/latest.svg)   | Stable      |
| [@ngxs-labs/select-snapshot](https://npmjs.com/package/@ngxs-labs/select-snapshot)           | ![](https://img.shields.io/npm/v/%40ngxs-labs%2Fselect-snapshot/latest.svg)      | Stable      |
| [@ngxs-labs/async-storage-plugin](https://npmjs.com/package/@ngxs-labs/async-storage-plugin) | ![](https://img.shields.io/npm/v/%40ngxs-labs%2Fasync-storage-plugin/latest.svg) | Alpha       |
| [@ngxs-labs/entity-state](https://npmjs.com/package/@ngxs-labs/entity-state)                 | ![](https://img.shields.io/npm/v/%40ngxs-labs%2Fentity-state/latest.svg)         | Development |
| [@ngxs-labs/actions-executing](https://npmjs.com/package/@ngxs-labs/actions-executing)       | ![](https://img.shields.io/npm/v/%40ngxs-labs%2Factions-executing/latest.svg)    | Alpha       |
| [@ngxs-labs/attach-action](https://npmjs.com/package/@ngxs-labs/attach-action)               | ![](https://img.shields.io/npm/v/%40ngxs-labs%2Fattach-action/latest.svg)        | Alpha       |
| [@ngxs-labs/firestore-plugin](https://npmjs.com/package/@ngxs-labs/firestore-plugin)         | ![](https://img.shields.io/npm/v/%40ngxs-labs%2Ffirestore-plugin/latest.svg)     | Alpha       |
