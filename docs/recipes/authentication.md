# Authentication

Authentication is a common theme across many applications. Let's take a look
at how we would implement this in NGXS.

First, let's define our state model and our actions:

```TS
export interface AuthStateModel {
  token: string | null;
  username: string | null;
}

export class Login {
  static readonly type = '[Auth] Login';
  constructor(public payload: { username: string, password: string }) {}
}

export class Logout {
  static readonly type = '[Auth] Logout';
}
```

In our state model, we want to track our token and the username. The token
represents a JWT token that was issued for the session.

Let's hook up these actions in our state class and wire that up to our login
service.

```TS
@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    token: null,
    username: null
  }
})
export class AuthState {

  @Selector()
  static token(state: AuthStateModel): string | null {
    return state.token;
  }

  @Selector()
  static isAuthenticated(state: AuthStateModel): boolean {
    return !!state.token;
  }

  constructor(private authService: AuthService) {}

  @Action(Login)
  login(ctx: StateContext<AuthStateModel>, action: Login) {
    return this.authService.login(action.payload).pipe(
      tap((result: { token: string }) => {
        ctx.patchState({
          token: result.token,
          username: action.payload.username
        });
      })
    );
  }

  @Action(Logout)
  logout(ctx: StateContext<AuthStateModel>) {
    const state = getState();
    return this.authService.logout(state.token).pipe(
      tap(() => {
        ctx.setState({
          token: null,
          username: null
        });
      })
    );
  }

}
```

In this state class, we have:

- A selector that will select the token from the store
- A login action method that will invoke the authentication service and set the token
- A logout action method that will invoke the authentication service and remove our state

Now let's wire up the state in our module.

```TS
@NgModule({
  imports: [
    NgxsModule.forRoot([AuthState]),
    NgxsStoragePluginModule.forRoot({
      key: 'auth.token'
    })
  ]
})
export class AppModule {}
```

In a typical JWT setup, you want to store your token in the `localstorage`. To do this
so we hookup our storage plugin and tell it to track the token
key in our state.

Next, we want to make sure that our users can't go to any pages that require authentication.
We can easily accomplish this with a router guard provided by Angular.

```TS
@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private store: Store) {}

  canActivate() {
    const isAuthenticated = this.store.selectSnapshot(AuthState.isAuthenticated);
    return isAuthenticated;
  }

}
```

This guard will decide if a route can be activated by using our selector to
select the token from the store. If the token is invalid it won't let the user go to that page.
Let's make sure we implement this in our route itself by defining the `AuthGuard`
in the `canActivate` definition.

```TS
export const routes: Routes = [
  {
    path: 'admin',
    loadChildren: './admin/admin.module#AdminModule',
    canActivate: [AuthGuard]
  }
];
```

A common action you want to take is when a user logs out, we want
to actually redirect the user to the login page. We can use our action
stream to listen to the `Logout` action and tell the router to go to
the login page.

```TS
@Component({
  selector: 'app',
  template: '..'
})
export class AppComponent implements OnInit {

  constructor(private actions: Actions, private router: Router) {}

  ngOnInit() {
    this.actions.pipe(ofActionDispatched(Logout)).subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

}
```

And that's it!
