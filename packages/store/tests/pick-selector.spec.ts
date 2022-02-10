// import { Injectable } from "@angular/core";
// import { TestBed } from "@angular/core/testing";
// import { MockState } from "packages/hmr-plugin/src/tests/hmr-mock";
// import { NgxsModule, State, Store } from "..";
// import { createPickSelector } from "../src/selectors/pick-selector"

// describe('Pick Selector', () => {

//   interface MockStateModel {
//     property1: string;
//     property2: number[]
//   }

//   @State<MockStateModel>({
//     name: 'mockstate',
//     defaults: {
//       property1: '',
//       property2: []
//     }
//   })
//   @Injectable()
//   class mockState {}

//   it('Passing null', () => {
//     const pickSelector = createPickSelector(null, ['property1', 'property2']);

//     expect(pickSelector).toBe(null)
//   })

//   it('Passing undefined', () => {
//     const pickSelector = createPickSelector(undefined, ['property1', 'property2']);

//     expect(pickSelector).toBe(undefined)
//   })

//   it('Passing undefined on keys should ignore', () => {
//     TestBed.configureTestingModule({
//       imports: [NgxsModule.forRoot([MockState])]
//     });

//     const store: Store = TestBed.inject(Store);
//     const pickSelector = createPickSelector<MockStateModel>(MockState, [undefined, 'property2']);

//     expect(pickSelector).toBe(undefined)
//   })

// })
