# Action Schematics

You can generate an `action` using the command as seen below:


```bash
ng generate @ngxs/store:actions
```

Running this command will prompt you to create an "Action" with the options as they are listed in the table below.

Alternatively, you can provide the options yourself.

```bash
ng generate @ngxs/store:actions --name NAME_OF_YOUR_ACTION
```

| Option | Description                                  | Required | Default Value        |
| ------ | -------------------------------------------- | :------: | -------------------- |
| --name | The name of the actions                      |   Yes    |                      |
| --path | The path to create the actions               |    No    | App's root directory |
| --flat | Boolean flag to indicate if a dir is created |    No    | `false`              |

🪄 **This command will**:

- Create an action with the given options

> Note: If the --flat option is false, the generated files will be organized into a directory named using the kebab case of the --name option. For instance, 'MyActions' will be transformed into 'my-actions'.
