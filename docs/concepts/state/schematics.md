# State Schematics

You can generate a `state` using the command as seen below:

```bash
ng generate @ngxs/store:state
```

Running this command will prompt you to create a "State" with the options as they are listed in the table below.

Alternatively, you can provide the options yourself.

```bash
ng generate @ngxs/store:state --name NAME_OF_YOUR_STATE
```

| Option    | Description                                                    | Required | Default Value               |
| --------- | -------------------------------------------------------------- | :------: | --------------------------- |
| --name    | The name of the state                                          |   Yes    |                             |
| --path    | The path to create the state                                   |    No    | App's root directory        |
| --spec    | Boolean flag to indicate if a unit test file should be created |    No    | `true`                      |
| --flat    | Boolean flag to indicate if a dir is created                   |    No    | `false`                     |
| --project | Name of the project as it is defined in your angular.json      |    No    | Workspace's default project |

> When working with multiple projects within a workspace, you can explicitly specify the `project` where you want to install the **state**. The schematic will automatically detect whether the provided project is a standalone or not, and it will generate the necessary files accordingly.

🪄 **This command will**:

- Create a state with the given options

> Note: If the --flat option is false, the generated files will be organized into a directory named using the kebab case of the --name option. For instance, 'MyState' will be transformed into 'my-state'.
