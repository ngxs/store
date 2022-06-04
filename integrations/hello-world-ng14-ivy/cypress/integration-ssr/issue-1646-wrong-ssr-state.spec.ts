/// <reference types="cypress" />

describe('Select decorator returning state from the wrong store during SSR (https://github.com/ngxs/store/issues/1646)', () => {
  it('should make concurrent requests and app should render correctly for each request', async () => {
    const promises: Promise<string>[] = Array.from({ length: 100 }).map(() =>
      fetch('/').then(res => res.text())
    );

    const bodies = await Promise.all(promises);

    bodies.forEach(body => {
      expect(body).to.contain('Angular 14 (ivy) Integration Test');
      expect(body).to.contain('Counter is 0');
    });
  });
});
