import { SchematicTestRunner } from '@angular-devkit/schematics/testing';

/**
 * Validate that a schema property is not empty or contains only spaces.
 *
 * @param runner SchematicsTestRunner configured in the test suite.
 * @param factory Name of the factory being tested.
 * @param property Property name being tested.
 */
export function propertyNotEmpty(
  runner: SchematicTestRunner,
  factory: string,
  property: string
) {
  expect(() => runner.runSchematic(factory, { [property]: '' })).toThrow(
    `Invalid options, "${property}" is required.`
  );

  expect(() => runner.runSchematic(factory, { [property]: ' ' })).toThrow(
    `Invalid options, "${property}" is required.`
  );
}
