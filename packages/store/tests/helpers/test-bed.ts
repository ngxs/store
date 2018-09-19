import { TestBed, TestModuleMetadata } from '@angular/core/testing';

const resetTestingModule = TestBed.resetTestingModule;
const preventAngularFromResetting = () => (TestBed.resetTestingModule = () => TestBed);
const allowAngularToReset = () => {
  resetTestingModule();
  TestBed.resetTestingModule = resetTestingModule;
};
export const setUpTestBed = (moduleDef: TestModuleMetadata, ...functions: (() => void)[]) => {
  // @ts-ignore
  beforeAll(done =>
    (async () => {
      resetTestingModule();
      preventAngularFromResetting();

      TestBed.configureTestingModule(moduleDef);
      functions.forEach(func => func());

      TestBed.resetTestingModule = () => TestBed;
      return await TestBed.compileComponents();
    })()
      .then(done)
      .catch(done.fail));

  // @ts-ignore
  afterAll(() => allowAngularToReset());
};
