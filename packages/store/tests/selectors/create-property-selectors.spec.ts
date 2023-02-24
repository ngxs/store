import { Injectable } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { NgxsModule, State, Store, createPropertySelectors } from '../../src/public_api';

describe.only('getPropertySelectors', () => {
  interface MyStateModel {
    property1: string;
    property2: number[];
    emptyProperty: {
      loading?: boolean;
    };
  }

  @State<MyStateModel>({
    name: 'myState',
    defaults: {
      property1: 'testValue',
      property2: [1, 2, 3],
      emptyProperty: {},
    },
  })
  @Injectable()
  class MyState {}

  it('Passing null', () => {
    const slices = createPropertySelectors(null as any);
    expect(slices).toThrowError();
  });

  it('Passing undefined', () => {
    const slices = createPropertySelectors(undefined as any);
    expect(slices).toThrowError();
  });

  // it('Passing empty object', () => {
  //   const slices = createPropertySelectors({});
  //   expect(slices).toBe(null);
  // });

  it('Passing a selector that returns a empty object', () => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MyState])],
    });

    const store: Store = TestBed.inject(Store);
    const slices = createPropertySelectors<MyStateModel>(MyState);
    const slicesOnEmptyProperty = createPropertySelectors<MyStateModel['emptyProperty']>(
      slices.emptyProperty
    );

    expect(store.selectSnapshot(slicesOnEmptyProperty.loading)).toBe(undefined);

    store.reset({
      property1: 'testValue',
      property2: [1, 2, 3],
      emptyProperty: {
        loading: true,
      },
    });

    expect(store.selectSnapshot(slicesOnEmptyProperty.loading)).toBe(true);
  });

  it('Should create a selector for each property of state', () => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MyState])],
    });

    // const store: Store = TestBed.inject(Store);
    // const myState = store.selectSnapshot<MyStateModel>(MyState);
    const slices = createPropertySelectors<MyStateModel>(MyState);

    console.log({ slices });

    expect(slices).toHaveProperty('property1');
    expect(slices).toHaveProperty('property2');
    expect(slices).not.toHaveProperty('emptyProperty');
  });

  it('The create selectors should return value of the state', async(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MyState])],
    });

    const store: Store = TestBed.inject(Store);
    const myState = store.selectSnapshot<MyStateModel>(MyState);
    const slices = createPropertySelectors<MyStateModel>(MyState);

    expect(slices.property1(myState)).toBe('testValue');
    expect(slices.property2(myState)).toStrictEqual([1, 2, 3]);
  }));

  it('Should memoise each internal selector', () => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MyState])],
    });

    const store: Store = TestBed.inject(Store);
    const myState = store.selectSnapshot<MyStateModel>(MyState);
    const slices1 = createPropertySelectors<MyStateModel>(MyState);
    const slices2 = createPropertySelectors<MyStateModel>(MyState);

    expect(slices1.property1(myState) === slices2.property1(myState)).toBeTruthy();
    expect(slices1.property2(myState) === slices2.property2(myState)).toBeTruthy();
  });

  it('Should memoise each internal selector', () => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MyState])],
    });

    const store: Store = TestBed.inject(Store);
    const myState = store.selectSnapshot<MyStateModel>(MyState);
    const slices1 = createPropertySelectors<MyStateModel>(MyState);
    const slices2 = createPropertySelectors<MyStateModel>(MyState);

    expect(slices1.property1(myState) === slices2.property1(myState)).toBeTruthy();
    expect(slices1.property2(myState) === slices2.property2(myState)).toBeTruthy();
  });
});
