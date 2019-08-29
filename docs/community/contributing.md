# Guidelines

We would love for you to contribute to our project and help make it ever better!
As a contributor, here are the guidelines we would like you to follow.

- [Report Issues](#report-issues)
- [Request Features](#request-features)
- [Submitting a Pull Request (PR)](#submitting-a-pull-request-pr)
- [Commit Message Format](#commit-message-format)

## Report Issues
If you find a bug in the source code or a mistake in the documentation, you can help us 
by submitting an issue to our GitHub Repository. Including an issue reproduction 
(via Stackblitz, Plunkr, etc.) is the absolute best way to help the team quickly diagnose the 
problem. Screenshots are also helpful.

You can help the team even more and submit a Pull Request with a fix.

## Issue Etiquette
Before you submit an issue, search the archive, maybe your question was already answered.

If your issue appears to be a bug, and hasn't been reported, open a new issue. Help us 
to maximize the effort we can spend fixing issues and adding new features by not reporting 
duplicate issues. Providing the following information will increase the chances of your issue being dealt with quickly:

- Overview of the Issue - if an error is being thrown a non-minified stack trace helps
- Angular and ngxs Versions - which versions of Angular and ngxs are affected
- Motivation for or Use Case - explain what are you trying to do and why the current behavior is a bug for you
- Browsers and Operating System - is this a problem with all browsers?
- Reproduce the Error - provide a live example (using Stackblitz, Plunker, etc.) or a unambiguous set of steps
- Screenshots - Due to the visual nature of ngxs, screenshots can help the team triage issues far more quickly than a text description.
- Related Issues - has a similar issue been reported before?
- Suggest a Fix - if you can't fix the bug yourself, perhaps you can point to what might be causing the problem (line of code or commit)

## Request Features
You can request a new feature by submitting an issue to our GitHub Repository. 
If you would like to implement a new feature, please submit an issue with a proposal for your work first, 
to be sure that we can use it. Please consider what kind of change it is:

- For a Major Feature, first open an issue and outline your proposal so that it can be discussed. 
This will also allow us to better coordinate our efforts, prevent duplication of work, and help you 
to craft the change so that it is successfully accepted into the project.
- Small Features can be crafted and directly submitted as a Pull Request.

## Submitting a Pull Request (PR)
Before you submit a Pull Request (PR) consider the following guidelines:

* Search [GitHub](https://github.com/amcdnl/ngxs/pulls) for an open or closed PR
  that relates to your submission. You don't want to duplicate effort.
* Create a new git branch:

     ```shell
     git checkout -b my-fix-branch master
     ```

* Make changes on your local branch.
* Run the full test suite and ensure that all tests pass.
* Commit your changes using a descriptive commit message that follows our
  [commit message guidelines](#commit-message-guidelines). Adherence to these conventions
  is necessary to keep a clean git log.

* Push your branch to GitHub:

    ```shell
    git push origin my-fix-branch
    ```

* In GitHub, send a pull request to `ngxs:master`.
* If we suggest changes then:
  * Make the required updates.
  * Re-run the test suites to ensure tests are still passing.
  * Rebase your branch and force push to your GitHub repository (this will update your Pull Request):

    ```shell
    git rebase master -i
    git push -f
    ```

That's it! Thank you for your contribution!

## Commit Message Format
Each commit message consists of a **header**, a **body** and a **footer**.  The header has a special
format that includes a **type**, a **scope** and a **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The **header** is mandatory and the **scope** of the header is optional.

Any line of the commit message cannot be longer than 100 characters! This allows the message to be easier
to read on GitHub as well as in various git tools.

### Revert
If the commit reverts a previous commit, it should begin with `revert: `, followed by the header of the reverted commit. In the body it should say: `This reverts commit <hash>.`, where the hash is the SHA of the commit being reverted.

### Type
Must be one of the following:

* **feat**: A new feature
* **fix**: A bug fix
* **docs**: Documentation only changes
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing
  semi-colons, etc)
* **refactor**: A code change that neither fixes a bug nor adds a feature
* **perf**: A code change that improves performance
* **test**: Adding missing tests
* **chore**: Changes to the build process or auxiliary tools and libraries such as documentation
  generation

### Scope
The scope could be anything specifying place of the commit change. For example
`Store`, `Mutation`, `Action`, `Select` etc.

### Subject
The subject contains succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize first letter
* no dot (.) at the end

### Body
Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes".
The body should include the motivation for the change and contrast this with previous behavior.

### Footer
The footer should contain any information about **Breaking Changes** and is also the place to
reference GitHub issues that this commit **Closes**.

**Breaking Changes** should start with the word `BREAKING CHANGE:` with a space or two newlines. The rest of the commit message is then used for this.
