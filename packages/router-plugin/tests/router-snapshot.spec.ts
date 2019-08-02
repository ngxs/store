import { fakeAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Component, NgModule, Injectable, Type } from '@angular/core';
import { Router, Routes, ActivatedRouteSnapshot } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Store, NgxsModule } from '@ngxs/store';

import { RouterState, NgxsRouterPluginModule } from '../';

import { freshPlatform } from './helpers';
import { APP_BASE_HREF } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>'
})
class RootComponent {}

@Component({
  selector: 'app-login',
  template: ''
})
class LoginComponent {}

@Component({
  selector: 'app-register',
  template: ''
})
class RegisterComponent {}

@Component({
  selector: 'app-dashboard',
  template: '<router-outlet></router-outlet>'
})
class DashboardComponent {}

@Component({
  selector: 'app-categories',
  template: '<router-outlet></router-outlet>'
})
class CategoriesComponent {}

@Component({
  selector: 'app-category',
  template: ''
})
class CategoryComponent {}

@Injectable()
class CategoryResolver {
  resolve(route: ActivatedRouteSnapshot) {
    return {
      id: +route.paramMap.get('id')!
    };
  }
}

const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      {
        path: 'categories',
        component: CategoriesComponent,
        children: [
          {
            path: ':id',
            component: CategoryComponent,
            resolve: {
              category: CategoryResolver
            },
            runGuardsAndResolvers: 'paramsChange'
          }
        ]
      }
    ]
  }
];

function getTestModule() {
  @NgModule({
    imports: [
      BrowserModule,
      RouterTestingModule.withRoutes(routes, { initialNavigation: 'enabled' }),
      NgxsModule.forRoot(),
      NgxsRouterPluginModule.forRoot()
    ],
    declarations: [
      RootComponent,
      LoginComponent,
      RegisterComponent,
      DashboardComponent,
      CategoriesComponent,
      CategoryComponent
    ],
    bootstrap: [RootComponent],
    providers: [CategoryResolver, { provide: APP_BASE_HREF, useValue: '/' }]
  })
  class TestModule {}

  return TestModule;
}

const createPlatformAndGetStoreWithRouter = () =>
  platformBrowserDynamic()
    .bootstrapModule(getTestModule())
    .then(({ injector }) => {
      const store: Store = injector.get(Store);
      const router: Router = injector.get(Router);
      return { store, router };
    });

const getRouteSnapshot = <T>(store: Store, component: Type<T>) =>
  store.selectSnapshot(RouterState.getRouteSnapshot(component));

fdescribe('RouterState.getRouteSnapshot', () => {
  it(
    'should select "LoginComponent"s snapshot',
    freshPlatform(
      fakeAsync(async () => {
        // Arrange
        const { store, router } = await createPlatformAndGetStoreWithRouter();

        // Act
        await router.navigateByUrl('/');

        const loginComponentSnapshot = getRouteSnapshot(store, LoginComponent)!;

        // Assert
        expect(loginComponentSnapshot).toBeTruthy();
        expect(loginComponentSnapshot).toBeInstanceOf(ActivatedRouteSnapshot);
        expect(loginComponentSnapshot.component).toBe(LoginComponent);
      })
    )
  );

  it(
    'should select "RegisterComponent"s snapshot',
    freshPlatform(
      fakeAsync(async () => {
        // Arrange
        const { store, router } = await createPlatformAndGetStoreWithRouter();

        // Act
        await router.navigateByUrl('/');
        await router.navigateByUrl('/register');

        const registerComponentSnapshot = getRouteSnapshot(store, RegisterComponent)!;

        // Assert
        expect(registerComponentSnapshot).toBeTruthy();
        expect(registerComponentSnapshot).toBeInstanceOf(ActivatedRouteSnapshot);
        expect(registerComponentSnapshot.component).toBe(RegisterComponent);
      })
    )
  );

  it(
    'should return "null" for deactivated component',
    freshPlatform(
      fakeAsync(async () => {
        // Arrange
        const { store, router } = await createPlatformAndGetStoreWithRouter();

        // Act
        await router.navigateByUrl('/');
        await router.navigateByUrl('/register');
        await router.navigateByUrl('/');

        const registerComponentSnapshot = getRouteSnapshot(store, RegisterComponent)!;
        const loginComponentSnapshot = getRouteSnapshot(store, LoginComponent)!;

        // Assert
        expect(registerComponentSnapshot).toBeNull();
        expect(loginComponentSnapshot).toBeTruthy();
        expect(loginComponentSnapshot.component).toBe(LoginComponent);
      })
    )
  );

  it(
    'should select "CategoriesComponent"s snapshot',
    freshPlatform(
      fakeAsync(async () => {
        // Arrange
        const { store, router } = await createPlatformAndGetStoreWithRouter();

        // Act
        await router.navigateByUrl('/');
        await router.navigateByUrl('/register');
        await router.navigateByUrl('/dashboard/categories');

        const categoriesComponentSnapshot = getRouteSnapshot(store, CategoriesComponent)!;

        // Assert
        expect(categoriesComponentSnapshot).toBeInstanceOf(ActivatedRouteSnapshot);
      })
    )
  );

  it(
    'should select "CategoryComponent"s snapshot and get category',
    freshPlatform(
      fakeAsync(async () => {
        // Arrange
        const { store, router } = await createPlatformAndGetStoreWithRouter();

        // Act
        await router.navigateByUrl('/');
        await router.navigateByUrl('/dashboard/categories/1');

        let categoryComponentSnapshot = getRouteSnapshot(store, CategoryComponent)!;

        // Assert
        expect(categoryComponentSnapshot.data.category).toEqual({ id: 1 });

        await router.navigateByUrl('/dashboard/categories/2');

        categoryComponentSnapshot = getRouteSnapshot(store, CategoryComponent)!;

        // Assert
        expect(categoryComponentSnapshot.data.category).toEqual({ id: 2 });
      })
    )
  );

  fit(
    'should listen to the state change',
    freshPlatform(
      fakeAsync(async () => {
        // Arrange
        const { store, router } = await createPlatformAndGetStoreWithRouter();
        const datas: any[] = [];

        store
          .select(RouterState.getRouteSnapshot(CategoryComponent))
          .pipe(filter((snapshot): snapshot is ActivatedRouteSnapshot => snapshot !== null))
          .subscribe(snapshot => {
            datas.push(snapshot.data);
          });

        // Act
        await router.navigateByUrl('/');
        await router.navigateByUrl('/dashboard/categories/1');
        await router.navigateByUrl('/dashboard/categories/3');
        await router.navigateByUrl('/dashboard/categories/5');
      })
    )
  );
});
