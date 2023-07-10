import { SchematicTestRunner } from '@angular-devkit/schematics/testing';

/**
 * Validate that a schema property is not empty or contains only spaces.
 *
 * @param runner SchematicsTestRunner configured in the test suite.
 * @param factory Name of the factory being tested.
 * @param property Property name being tested.
 */
export async function propertyNotEmpty(
  runner: SchematicTestRunner,
  factory: string,
  property: string
) {
  await expect(() =>
    runner.runSchematicAsync(factory, { [property]: '' }).toPromise()
  ).rejects.toThrow(`Invalid options, "${property}" is required.`);

  await expect(() =>
    runner.runSchematicAsync(factory, { [property]: ' ' }).toPromise()
  ).rejects.toThrow(`Invalid options, "${property}" is required.`);
}
