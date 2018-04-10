# Work in Progress

### Install Schematics

npm i -g @angular-devkit/{schematics, schematics-cli, core } @shematics/schematics

### Debug and Try Ngxs Schematics

schematics .:state --name=animals --dry-run=false
schematics .:action --name=FeedAnimals --state=Zoo --dry-run=false
schematics .:select --name=Zoo --dry-run=false


### Testing

To test locally, install `@angular-devkit/schematics` globally and use the `schematics` command line tool. That tool acts the same as the `generate` command of the Angular CLI, but also has a debug mode.

Check the documentation with
```bash
schematics --help
```

### Unit Testing

`npm run test` will run the unit tests, using Jasmine as a runner and test framework.

### Publishing

To publish, simply do:

```bash
npm run build
npm publish
```




That's it!
 