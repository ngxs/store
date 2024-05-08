# Store Schematics

You can generate the `store` using the command as seen below:

```bash
ng generate @ngxs/store:store
```

Running this command will prompt you to create a "Store" with the options as they are listed in the table below.

Alternatively, you can provide the options yourself.

```bash
ng generate @ngxs/store:store --name NAME_OF_YOUR_STORE
```

| Option    | Description                                                    | Required | Default Value               |
| --------- | -------------------------------------------------------------- | :------: | --------------------------- |
| --name    | The name of the store                                          |   Yes    |                             |
| --path    | The path to create the store                                   |    No    | App's root directory        |
| --spec    | Boolean flag to indicate if a unit test file should be created |    No    | `true`                      |
| --flat    | Boolean flag to indicate if a dir is created                   |    No    | `false`                     |
| --project | Name of the project as it is defined in your angular.json      |    No    | Workspace's default project |

> When working with multiple projects within a workspace, you can explicitly specify the `project` where you want to install the **store**. The schematic will automatically detect whether the provided project is a standalone or not, and it will generate the necessary files accordingly.

🪄 **This command will**:

- Generate a `{name}.actions.ts`
- Generate a `{name}.state.spec.ts`
- Generate a `{name}.state.ts`. The state file also includes an action handler for the generated action.

> Note: If the --flat option is false, the generated files will be organized into a directory named using the kebab case of the --name option. For instance, 'MyStore' will be transformed into 'my-store'.
