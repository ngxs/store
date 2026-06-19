import { test, expect } from '@playwright/test';

const listUrl = 'http://localhost:4200/list';
const faviconUrl = 'http://localhost:4200/favicon.ico';

const orderedLifecycleHooks = [
  'NgxsOnInit todo',
  'NgxsAfterBootstrap todo',
  'NgxsOnInit lazy',
  'NgxsAfterBootstrap lazy'
];

test.describe('Server side rendering', () => {
  test('should make sure the Express server is running', async ({ request }) => {
    const res = await request.get(listUrl);
    expect(res.headers()).toHaveProperty('x-powered-by');
  });

  test('should serve statics and favicon.ico', async ({ request }) => {
    const res = await request.get(faviconUrl);
    expect(res.status()).toBe(200);
  });

  test('"ngOnInit todo" should exist', async ({ request }) => {
    const res = await request.get(listUrl);
    expect(await res.text()).toContain('ngOnInit todo');
  });

  for (const hook of orderedLifecycleHooks) {
    test(`should have '${hook}' lifecycle hook output visible`, async ({ request }) => {
      const res = await request.get(listUrl);
      expect(await res.text()).toContain(hook);
    });
  }

  test('lifecycle hooks should exist in the correct order (root => lazy)', async ({
    request
  }) => {
    const res = await request.get(listUrl);
    const body = await res.text();
    const indexes = orderedLifecycleHooks.map(text => body.indexOf(text));
    indexes.forEach((idx, i) => {
      const previous = i > 0 ? indexes[i - 1] : -1;
      expect(
        idx,
        `'${orderedLifecycleHooks[i]}' index should be greater than ${previous}`
      ).toBeGreaterThan(previous);
    });
  });

  test('should successfully resolve list of animals', async ({ request }) => {
    const res = await request.get(listUrl);
    const body = await res.text();
    expect(body).toContain('animals were resolved');
    expect(body).toContain('zebras,pandas,lions,giraffes');
  });
});
