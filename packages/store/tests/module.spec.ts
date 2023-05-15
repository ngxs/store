import { Injectable, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgxsModule, State, Store, Selector } from '@ngxs/store';

interface RootStateModel {
  foo: string;
}
@State<RootStateModel>({
  name: 'root',
  defaults: {
    foo: 'Hello'
  }
})
@Injectable()
class RootState {}

interface FeatureStateModel {
  bar: string;
}
@State<FeatureStateModel>({
  name: 'feature',
  defaults: {
    bar: 'World'
  }
})
@Injectable()
class FeatureState {
  @Selector()
  static getBar(state: FeatureStateModel) {
    return state.bar;
  }
}

interface FeatureStateModel2 {
  baz: string;
}
@State<FeatureStateModel2>({
  name: 'feature2',
  defaults: {
    baz: '!'
  }
})
@Injectable()
class FeatureState2 {
  @Selector()
  static getBaz(state: FeatureStateModel2) {
    return state.baz;
  }
}

@NgModule({
  imports: [NgxsModule.forRoot([RootState])]
})
class RootModule {}

@NgModule({
  imports: [NgxsModule.forFeature([FeatureState])]
})
class FeatureModule {}

@NgModule({
  imports: [NgxsModule.forFeature([FeatureState2])]
})
class FeatureModule2 {}

describe('module', () => {
  it('should configure and run with no states', () => {
    // Arrange
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot()]
    });

    // Assert
    expect(TestBed.inject(Store)).toBeTruthy();
  });

  it('should configure and return `RootState`', () => {
    // Arrange
    TestBed.configureTestingModule({
      imports: [RootModule]
    });

    // Assert
    expect(TestBed.inject(Store)).toBeTruthy();
    expect(TestBed.inject(RootState)).toBeTruthy();
  });

  it('should configure feature module and return `RootState` and `FeatureState`', () => {
    // Arrange
    TestBed.configureTestingModule({
      imports: [RootModule, FeatureModule]
    });

    // Assert
    expect(TestBed.inject(Store)).toBeTruthy();
    expect(TestBed.inject(RootState)).toBeTruthy();
    expect(TestBed.inject(FeatureModule)).toBeTruthy();
  });

  it('should configure feature modules and return them', () => {
    // Arrange
    TestBed.configureTestingModule({
      imports: [RootModule, FeatureModule, FeatureModule2]
    });

    // Assert
    expect(TestBed.inject(Store)).toBeTruthy();
    expect(TestBed.inject(RootState)).toBeTruthy();
    expect(TestBed.inject(FeatureModule, FeatureState2)).toBeTruthy();
  });

  it('should allow empty root module and a feature module', () => {
    // Arrange
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot(), FeatureModule]
    });

    // Assert
    expect(TestBed.inject(Store)).toBeTruthy();
    expect(TestBed.inject(FeatureModule)).toBeTruthy();
  });

  it('should initialize all feature modules state', async () => {
    // Arrange
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot(), FeatureModule, FeatureModule2]
    });

    const store = TestBed.inject(Store);

    // Assert
    expect(await store.selectOnce(FeatureState.getBar).toPromise()).toEqual('World');
    expect(await store.selectOnce(FeatureState2.getBaz).toPromise()).toEqual('!');
  });
});
