### Emitter

> ER is a new pattern that provides the opportunity to feel free from actions

[![Build Status](https://travis-ci.org/ngxs-labs/tools.svg?branch=master)](https://travis-ci.org/ngxs-labs/tools) [![Build Status: Circle](https://circleci.com/gh/ngxs-labs/tools.svg?style=svg)](https://circleci.com/gh/ngxs-labs/tools)
[![NPM](https://badge.fury.io/js/%40ngxs-labs%2Femitter.svg)](https://www.npmjs.com/package/@ngxs-labs/emitter)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/ngxs-labs/tools/blob/master/license)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/079272acc4104332b904dc6818929d06)](https://www.codacy.com/app/arturovt/emitter?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=ngxs-contrib/emitter&amp;utm_campaign=Badge_Grade)

[🚀 See it in action on Stackblitz](https://stackblitz.com/edit/ngxs-emitter-simple)

This package allows you to get rid of actions. You can use decorators to register actions directly in your state, you don't have to create any actions in your project (until you really need them), as they don't give any profit, only bring extra boilerplate files.

## Concepts
Compare these diagrams, we've simplified Redux flow and threw out unnecessary middleware:

![ER Flow](https://raw.githubusercontent.com/ngxs-labs/emitter/master/docs/assets/redux-er.png)

## :package: Install

To install `@ngxs-labs/emitter` run the following command:

```console
npm install @ngxs-labs/emitter
# or if you use yarn
yarn add @ngxs-labs/emitter
```

## :hammer: Usage

Import the module into your root application module:

![ER Plugin](https://raw.githubusercontent.com/ngxs-labs/emitter/master/docs/assets/module.png)

## Receiver

Receiver is a basic building block. `@Receiver()` is a function that allows you to decorate static methods in your states for further passing this method to the emitter:

![Receiver](https://raw.githubusercontent.com/ngxs-labs/emitter/master/docs/assets/receiver.png)

## Emitter

Emitter is basically a bridge between your component and receivers. `@Emitter()` is a function that decorates properties defining new getter and gives you an access to the emittable interface:

![Emitter](https://raw.githubusercontent.com/ngxs-labs/emitter/master/docs/assets/emitter.png)

## Custom types

You can define custom types for debbuing purposes (works with `@ngxs/logger-plugin`):

![Types](https://raw.githubusercontent.com/ngxs-labs/emitter/master/docs/assets/types.png)

## Actions

If you still need actions - it is possible to pass an action as an argument into `@Receiver()` decorator:

![Actions](https://raw.githubusercontent.com/ngxs-labs/emitter/master/docs/assets/actions.png)

## Dependency injection

Assume you have to make some API request and load some data from your server, it is very easy to use services with static methods, Angular provides an `Injector` class for getting instances by reference:

![Depedency injection](https://raw.githubusercontent.com/ngxs-labs/emitter/master/docs/assets/di.png)

If you work with promises - we advice you to use `async/await` approach, because method marked with `async` keyword will automatically return a `Promise`, you will not get confused if you missed `return` keyword somewhere:

![Async/await approach](https://raw.githubusercontent.com/ngxs-labs/emitter/master/docs/assets/async-await.png)

## Lifecycle

As you may know - actions in NGXS have own lifecycle. We also provide RxJS operators that give you the ability to react to actions at different points in their existence:

- `ofEmittableDispatched`: triggers when an emittable target has been dispatched
- `ofEmittableSuccessful`: triggers when an emittable target has been completed successfully
- `ofEmittableCanceled`: triggers when an emittable target has been canceled
- `ofEmittableErrored`: triggers when an emittable target has caused an error to be thrown

Below is just a simple example that uses those operators:

![Lifecycle](https://raw.githubusercontent.com/ngxs-labs/emitter/master/docs/assets/lifecycle.png)

Import operators in component and pipe `Actions` service:

![Lifecycle operators](https://raw.githubusercontent.com/ngxs-labs/emitter/master/docs/assets/lifecycle-operators.png)

