import { normalizeBaseOptions, normalizeOptionalBoolean } from './normalize-options';

describe('normalizeBaseOptions', function () {
  test.each`
    options                                                                | expected
    ${{ name: '' }}                                                        | ${{ name: '', path: '' }}
    ${{ name: 'MyComponent', path: '' }}                                   | ${{ name: 'my-component', path: '' }}
    ${{ name: 'MyComponent', path: 'app/components', extraProp: 'value' }} | ${{ name: 'my-component', path: 'app/components', extraProp: 'value' }}
    ${{ name: 'MyComponent', path: 'app/../invalid-path' }}                | ${{ name: 'my-component', path: 'invalid-path' }}
  `('should normalize options $options as $expected', function ({ options, expected }) {
    var normalizedOptions = normalizeBaseOptions(options);
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
      var result = normalizeOptionalBoolean(value, defaultValue);
      expect(result).toBe(expected);
    }
  );
});
