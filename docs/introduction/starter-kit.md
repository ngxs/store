# Starter Kit

The Starter Kit provides a pre-configured NGXS setup that includes a Store, State, Actions, and selectors.

## Installing with schematics

```bash
ng generate @ngxs/store:starter-kit
```

Note: Running this command will prompt you to create a "Starter-Kit". The options available for the "Starter-Kit" are listed in the table below.

You have the option to enter the options yourself

```bash
ng generate @ngxs/store:starter-kit --path YOUR_PATH
```

| Option    | Description                                                    | Required | Default Value               |
| :-------- | :------------------------------------------------------------- | :------: | :-------------------------- |
| --path    | The path to create the starter kit                             |   Yes    |                             |
| --spec    | Boolean flag to indicate if a unit test file should be created |    No    | `true`                      |
| --project | Name of the project as it is defined in your angular.json      |    No    | Workspace's default project |

> When working with multiple projects within a workspace, you can explicitly specify the `project` where you want to install the **starter kit**. The schematic will automatically detect whether the provided project is a standalone or not, and it will generate the necessary files accordingly.

🪄 **This command will**:

- Create Auth State, Actions, Selectors and Unit Tests, organized into an 'auth' directory
- Create Dictionary State, Actions, Selectors and Unit Tests, organized into a 'dashboard/states/dictionary' directory
- Create User State, Actions, Selectors and Unit Tests, organized into a 'dashboard/states/user' directory
- Create a Store and Configure the Auth, Dictionary and User states

> Note: The generated files will be organized into a 'store' directory.
