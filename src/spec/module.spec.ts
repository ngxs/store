import { NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgxsModule, Store } from 'ngxs';

import { State } from '../state';

interface RootStateModel {
  foo: string;
}
@State<RootStateModel>({
  name: 'root',
  defaults: {
    foo: 'Hello'
  }
})
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
class FeatureState {}

interface FeatureStateModel2 {
  baz: string;
}
@State<FeatureStateModel2>({
  name: 'feature2',
  defaults: {
    baz: '!'
  }
})
class FeatureState2 {}

@NgModule({
  imports: [NgxsModule.forRoot([RootState])]
})
class RootModule {}

@NgModule({
  imports: [NgxsModule.forFeature([FeatureState])]
})
class FeatureModule {}

@NgModule({
  imports: [NgxsModule.forFeature([FeatureState])]
})
class FeatureModule2 {}

describe('module', () => {
  it('should configure and run with no states', () => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot()]
    });

    expect(TestBed.get(Store)).toBeTruthy();
  });

  it('should configure and return `RootState`', () => {
    TestBed.configureTestingModule({
      imports: [RootModule]
    });

    expect(TestBed.get(Store)).toBeTruthy();
    expect(TestBed.get(RootState)).toBeTruthy();
  });

  xit('should configure feature module and return `RootState` and `FeatureState`', () => {
    TestBed.configureTestingModule({
      imports: [RootModule, FeatureModule]
    });

    expect(TestBed.get(Store)).toBeTruthy();
    expect(TestBed.get(RootState)).toBeTruthy();
    expect(TestBed.get(FeatureModule)).toBeTruthy();
  });

  xit('should configure feature modules and return them', () => {
    TestBed.configureTestingModule({
      imports: [RootModule, FeatureModule, FeatureModule2]
    });

    expect(TestBed.get(Store)).toBeTruthy();
    expect(TestBed.get(RootState)).toBeTruthy();
    expect(TestBed.get(FeatureModule, FeatureState2)).toBeTruthy();
  });

  xit('should allow empty root module and a feature module', () => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot(), FeatureModule]
    });

    expect(TestBed.get(Store)).toBeTruthy();
    expect(TestBed.get(FeatureModule)).toBeTruthy();
  });
});
