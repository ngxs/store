import { exit } from 'node:process';
import * as ts from 'ts-morph';

import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { visitTsFiles } from '../utils/visit-files';

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
    const keyProperty = objectLiteral.getProperty('key');
    const propertyName = keyProperty?.getChildAtIndex(0);
    const propertyValue = keyProperty?.getChildAtIndex(2);
    propertyName?.replaceWithText('keys');

    // if the property value is a string literal, then we should wrap it in an array
    // We are checking the isStringLiteral to avoid wrapping a value that is already an array
    if (ts.Node.isStringLiteral(propertyValue!)) {
      propertyValue?.replaceWithText(`[${propertyValue?.getText()}]`);
    }
  }
}

function isStoragePluginProvided(callExpression: ts.CallExpression) {
  return (
    callExpression && callExpression.getText().includes('NgxsStoragePluginModule.forRoot')
  );
}

/**
 * We do not use the ts.Node.isCallExpression(node) because the underlying implementation
 * uses -> node.getKind() === typescript.SyntaxKind.CallExpression
 * which is an enum that can return different numbers depending on minor typescript package versions
 */
function isCallExpression(node: ts.Node): node is ts.CallExpression {
  return node.getKindName() === 'CallExpression';
}

export function migrateKeys(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const tsProject = new ts.Project({ useInMemoryFileSystem: true });
    const packageJson = tree.readJson('package.json') as any;
    const storePackage = packageJson['dependencies']['@ngxs/store'];

    if (!storePackage) {
      _context.logger.error(`No @ngxs/store found`);
      return exit(1);
    }

    visitTsFiles(tree, tree.root, async path => {
      const fileContent = tree.readText(path);
      const sourceFile = tsProject.createSourceFile(path, fileContent!);
      const hasStoragePluginImported = sourceFile.getImportDeclaration(
        importDecl => importDecl.getModuleSpecifierValue() === '@ngxs/storage-plugin'
      );

      // do not try migrating if the storage plugin is not imported
      if (hasStoragePluginImported) {
        sourceFile.forEachDescendant(node => {
          if (
            isCallExpression(node) &&
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
              _context.logger.info(`Migrating empty forRoot in ${path}`);
              migrateEmptyForRoot(callExpression);
            } else if (ts.Node.isObjectLiteralExpression(args[0])) {
              _context.logger.info(`Migrating forRoot with args in ${path}`);
              migrateForRootWithArgs(args[0]);
            }
          }
        });

        tree.overwrite(path, sourceFile.getFullText());
      }
    });
  };
}
