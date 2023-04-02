import { Injectable, NgModule } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';

import { NgxsModule } from '../src/module';
import { State } from '../src/decorators/state';
import { Store } from '../src/store';
import { Selector } from '../src/decorators/selector/selector';

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
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot()]
    });

    expect(TestBed.inject(Store)).toBeTruthy();
  });

  it('should configure and return `RootState`', () => {
    TestBed.configureTestingModule({
      imports: [RootModule]
    });

    expect(TestBed.inject(Store)).toBeTruthy();
    expect(TestBed.inject(RootState)).toBeTruthy();
  });

  it('should configure feature module and return `RootState` and `FeatureState`', () => {
    TestBed.configureTestingModule({
      imports: [RootModule, FeatureModule]
    });

    expect(TestBed.inject(Store)).toBeTruthy();
    expect(TestBed.inject(RootState)).toBeTruthy();
    expect(TestBed.inject(FeatureModule)).toBeTruthy();
  });

  it('should configure feature modules and return them', () => {
    TestBed.configureTestingModule({
      imports: [RootModule, FeatureModule, FeatureModule2]
    });

    expect(TestBed.inject(Store)).toBeTruthy();
    expect(TestBed.inject(RootState)).toBeTruthy();
    expect(TestBed.inject(FeatureModule, FeatureState2)).toBeTruthy();
  });

  it('should allow empty root module and a feature module', () => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot(), FeatureModule]
    });

    expect(TestBed.inject(Store)).toBeTruthy();
    expect(TestBed.inject(FeatureModule)).toBeTruthy();
  });

  it('should initialize all feature modules state', async(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot(), FeatureModule, FeatureModule2]
    });

    const store: Store = TestBed.inject(Store);
    expect(store).toBeTruthy();
    store.select(FeatureState.getBar).subscribe((bar: string) => expect(bar).toEqual('World'));
    store.select(FeatureState2.getBaz).subscribe((baz: string) => expect(baz).toEqual('!'));
  }));
});
