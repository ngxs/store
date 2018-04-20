# Contributing to NGXS

:+1::tada: First off, thanks for taking the time to contribute! :tada::+1:

The following is a set of guidelines for contributing to NGXS and its packages.

#### Table Of Contents

[I don't want to read this whole thing, I just have a question!!!](#i-dont-want-to-read-this-whole-thing-i-just-have-a-question)

[How can I help?](#how-can-I-help?)

[Developing](#developing)

[Building](#building)
 * [Linking local version](#linking)

[Publish new version](#publishing-new-version)
 * [Dev builds](#dev-builds)
 * [Beta builds](#beta-builds)
 * [Release builds](#release-builds)

## I don't want to read this whole thing I just have a question!!!

> **Note:** Please don't file an issue to ask a question.

 * Read our [docs](https://ngxs.gitbook.io/ngxs)
 * Ask a question in our [slack](https://now-examples-slackin-eqzjxuxoem.now.sh/).
 * Ask a question on [stackoverflow](https://stackoverflow.com/questions/tagged/ngxs).

# How can I help?
Check the [issues](https://github.com/ngxs/store/issues) where we have labels for help wanted.
Also chat us up on slack, where we will be more than happy to get you started on an issue.

# Developing
Start by installing all dependencies
```bash
yarn
```

You can then either start develping using TDD
```bash
yarn test
```

Or start the integration app and start playing around
```bash
yarn start
```

## Building
Since our library is a combination of the main `@ngxs/store` and the plugins, we need to build them into separate npm packages and publish them.

running
```bash
yarn build
```
will create a build for each package in the `builds/` directory.

### Linking
If you want to test out a local build in your own app you can create a global symlink for the package which can then be linked locally in your app.

```bash
# build ngxs
yarn build

# cd into the build you want to link
cd builds/store

# create the global symlink
yarn link
```

now navigate to your app then run
```bash
yarn link @ngxs/store
```
now `node_modules/@ngxs/store` will be symlinked to the local build directory of `@ngxs/store`.
to make a change, save the file in ngxs, run `yarn build` and your app should now be using the new build.

# Publishing new version
> (@ngxs team members only)

## Dev builds
CircleCI picks up all commits to master, which is our development branch. It then runs the build, the tests and the integration tests. If they all succeed,
CircleCI will publish to Code Climate, and to npm using the git commit sha1 as an identified `3.0.0-dev.6e59e7b` and tag it as `@dev`

# Beta builds
**@todo** need to figure out how to get the prerelease version and use it as the git tag, before we can automate the `@beta` releases.

## Release builds
CircleCI picks up when a git tag is created and does the same thing as for the development build, but instead of releasing a dev build,
releases the version that was specified in the root package.json in the git tag. It also tags it as @latest.
