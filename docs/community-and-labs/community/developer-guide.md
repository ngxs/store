# Developer Guide

Welcome to the NGXS community! We're excited to have you here. This guide will help you set up your local development environment and contribute effectively. :rocket:

## Prerequisites

Before you begin, ensure you have met the following requirements:

- You have installed [**Node.js**](https://nodejs.org/)
- You have installed [**Yarn**](https://yarnpkg.com/)

## Installation

Follow these steps to set up your local environment:

1. Fork the repository if you haven't already. [Learn how](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo).
2. Clone the forked repository to your local machine using git.
3. Install project dependencies:

   ```bash
   # Install root dependencies
   yarn install

   # Install dependencies for the "create-app" tutorial
   yarn --cwd tutorials/create-app
   ```

4. Build all packages:
   ```bash
   yarn build:packages
   ```

## Developing and Contributing

If you want to contribute to the project by fixing bugs, adding new features, or creating new packages, follow the steps below.

### Modifying `@ngxs/store`

1. Run development mode:
   ```bash
   yarn build:packages --package store --watch
   ```
2. Run serve integration examples:
   ```bash
   yarn start
   ```
3. **Make your changes...**
4. Run tests to ensure everything works correctly:
   ```bash
   yarn test
   ```
5. Commit changes following the [Conventional Commits](https://www.conventionalcommits.org/) format.
6. Create a **pull request** with a detailed description of the changes.

### Adding a New Package: `@ngxs/<my-super-plugin>`

1. Create a new package directory `packages/<my-super-plugin>`.
2. Create a template library with `ngPackagr`.
3. Add the package to `package.json` at the root level.
4. Run development mode:
   ```bash
   yarn build:packages --package <my-super-plugin> --watch
   ```
5. **Develop your plugin...**
6. Build the package:
   ```bash
   yarn build:packages --package <my-super-plugin>
   ```
7. Run tests to ensure everything works correctly:
   ```bash
   yarn test
   ```
8. Commit changes following the [Conventional Commits](https://www.conventionalcommits.org/) format.
9. Create a **pull request** with a detailed description of the changes.
