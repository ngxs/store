# Starter Kit

The Starter Kit will generate and auto-configure Store, Actions, States and Selectors

## Installing with schematics

```bash
ng generate starter-kit
```

Note: Running this command will prompt you to create a "Starter-Kit". The options available for the "Starter-Kit" are listed in the table below.

You have the option to enter the options yourself

```bash
ng generate starter-kit --path YOUR_PATH
```

| Option | Description                                            | Required |
| :----- | :----------------------------------------------------- | :------: |
| --path | The path to create the starter kit                     |   Yes    |
| --spec | Flag to indicate if a unit test file should be created |    No    |

🪄 **This command will**:

- Create Auth State, Actions and Selectors
- Create Dictionary State, Actions and Selectors
- Create User State, Actions and Selectors
- Create a Store and Configure the Auth, Dictionary and User states
