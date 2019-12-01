import { ɵivyEnabled as ivyEnabled } from '@angular/core';

describe('NGXS with Ivy enabled', () => {
  it('ivy has to be enabled', () => {
    // This assertion has to be performed as we have to
    // be sure that we're running these tests with the Ivy engine
    expect(ivyEnabled).toBeTruthy();
  });

  // here we can write next tests for Ivy
});
