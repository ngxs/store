import {
  Tree,
  convertNxGenerator,
  getProjects,
  logger,
  readJson,
  visitNotIgnoredFiles
} from '@nx/devkit';
import { exit } from 'node:process';
import * as ts from 'ts-morph';

function migrateEmptyForRoot(callExpression: ts.CallExpression<ts.ts.CallExpression>) {
  callExpression.addArgument(`{ keys: '*' }`);
}

function migrateForRootWithArgs(arg: ts.Node<ts.ts.Node>) {
  const objectLiteral = arg as ts.ObjectLiteralExpression;

  const hasPropertyName = (name: string) =>
    objectLiteral.getProperties().some(prop => {
      return ts.Node.isPropertyAssignment(prop) && prop.getName() === name;
    });

  const isAlreadyMigrated = hasPropertyName('keys');

  // If the "keys" property is already there, we should not try migrating
  if (isAlreadyMigrated) {
    return;
  }

  const hasKeyProperty = hasPropertyName('key');

  // Add the "keys" property if it's not there
  if (!hasKeyProperty) {
    objectLiteral.addPropertyAssignment({ name: 'keys', initializer: `'*'` });
  } else {
    // Rename the "key" property to "keys"
    objectLiteral.getProperty('key')?.getChildAtIndex(0)?.replaceWithText('keys');
  }
}

function isStoragePluginProvided(callExpression: ts.CallExpression) {
  return (
    callExpression && callExpression.getText().includes('NgxsStoragePluginModule.forRoot')
  );
}

export async function migrateKeys(tree: Tree) {
  const projects = getProjects(tree);
  const tsProject = new ts.Project({ useInMemoryFileSystem: true });
  const packageJson = readJson(tree, 'package.json');
  const storePackage = packageJson['dependencies']['@ngxs/store'];

  if (!storePackage) {
    logger.error(`No @ngxs/store found`);
    return exit(1);
  }

  for (const { root } of projects.values()) {
    logger.info(`Migrating keys for '${root}...'`);

    visitNotIgnoredFiles(tree, root, async path => {
      const fileContent = tree.read(path, 'utf8');
      const sourceFile = tsProject.createSourceFile(path, fileContent!);
      const hasStoragePluginImported = sourceFile.getImportDeclaration(
        importDecl => importDecl.getModuleSpecifierValue() === '@ngxs/storage-plugin'
      );

      // do not try migrating if the storage plugin is not imported
      if (path.endsWith('.ts') && hasStoragePluginImported) {
        sourceFile.forEachDescendant(node => {
          if (
            ts.Node.isCallExpression(node) &&
            ts.Node.isPropertyAccessExpression(node.getExpression())
          ) {
            const callExpression = node as ts.CallExpression;

            // If the storage plugin is not provided, we should not try migrating
            if (!isStoragePluginProvided(callExpression)) {
              return;
            }

            const args = callExpression.getArguments();
            // If there are no arguments in the forRoot(), then add the `keys` property
            if (!args.length) {
              logger.info(`Migrating empty forRoot in ${path}`);
              migrateEmptyForRoot(callExpression);
            } else if (ts.Node.isObjectLiteralExpression(args[0])) {
              logger.info(`Migrating forRoot with args in ${path}`);
              migrateForRootWithArgs(args[0]);
            }
          }
        });

        tree.write(path, sourceFile.getFullText());
      }
    });
  }
}

export const migrateKeysAngularSchematic = convertNxGenerator(migrateKeys);
