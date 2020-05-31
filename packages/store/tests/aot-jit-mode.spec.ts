import { TestBed } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { isAOT, isJIT } from '@ngxs/store/internals';

describe('[TEST]: AOT/JIT', () => {
  it('should ', () => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([])]
    });

    const store = TestBed.inject(Store);

    expect(store).toBeTruthy();
    expect(isJIT()).toBeTruthy();
    expect(isAOT()).toBeFalsy();
  });
});
