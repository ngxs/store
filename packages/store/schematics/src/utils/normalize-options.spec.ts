import { createWorkspace } from '../_testing';
import { normalizeBaseOptions, normalizeOptionalBoolean } from './normalize-options';

describe('normalizeBaseOptions', function () {
  test.each`
    options                                                            | expected
    ${{ name: '' }}                                                    | ${{ name: '', path: 'projects/foo/src/app', project: 'foo' }}
    ${{ name: 'MyComponent', path: '' }}                               | ${{ name: 'my-component', path: 'projects/foo/src/app', project: 'foo' }}
    ${{ name: 'MyComponent', path: 'components', extraProp: 'value' }} | ${{ name: 'my-component', path: 'projects/foo/src/app/components', extraProp: 'value', project: 'foo' }}
    ${{ name: 'MyComponent', path: '/../../../outside-of-app-path' }}  | ${{ name: 'my-component', path: 'projects/outside-of-app-path', project: 'foo' }}
  `('should normalize options $options as $expected', async function ({ options, expected }) {
    const appTree = await createWorkspace();
    const normalizedOptions = normalizeBaseOptions(appTree, options);
    expect(normalizedOptions).toEqual(expected);
  });
});

describe('normalizeOptionalBoolean', function () {
  test.each`
    value        | defaultValue | expected
    ${true}      | ${false}     | ${true}
    ${false}     | ${true}      | ${false}
    ${undefined} | ${true}      | ${true}
    ${null}      | ${false}     | ${false}
  `(
    'should return $expected when value is $value and default is $defaultValue',
    function ({ value, defaultValue, expected }) {
      const result = normalizeOptionalBoolean(value, defaultValue);
      expect(result).toBe(expected);
    }
  );
});
