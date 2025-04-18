import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as ts from 'typescript';

import { exit } from 'node:process';
import { getProjectMainFile } from '../../../schematics-utils/src/project';
import { visitTsFiles } from '../../../schematics-utils/src/file-utils';
import { Change, InsertChange } from '@schematics/angular/utility/change';
import { findNodes, insertImport } from '@schematics/angular/utility/ast-utils';

const EXECUTION_STRATEGY_OPTION =
  'executionStrategy: DispatchOutsideZoneNgxsExecutionStrategy';

export default function (): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const packageJson = tree.readJson('package.json') as any;
    const storePackage = packageJson['dependencies']['@ngxs/store'];

    if (!storePackage) {
      _context.logger.error(`No @ngxs/store found`);
      return exit(1);
    }

    const mainFile = getProjectMainFile(tree);
    if (!mainFile) {
      return;
    }

    visitTsFiles(tree, tree.root, async (source, path) => {
      const hasNgxsModuleOrProvideStoreImported = source.statements
        .filter(ts.isImportDeclaration)
        .filter(importDeclaration =>
          importDeclaration.moduleSpecifier.getText().includes('@ngxs/store')
        )
        .filter(importDeclaration => {
          const hasNgxsModule = importDeclaration.importClause?.namedBindings
            ?.getText()
            .includes('NgxsModule');

          const hasProvideStore = importDeclaration.importClause?.namedBindings
            ?.getText()
            .includes('provideStore');

          return hasNgxsModule || hasProvideStore;
        });

      if (!hasNgxsModuleOrProvideStoreImported.length) {
        // Avoid running the migration if the NgxsModule or the provideStore is not imported
        return;
      }

      const changes: Change[] = [];

      const ngxsModuleImportChanges = migrateNgxsForRoot(source, path, _context);
      const provideStoreChanges = migrateProvideStore(source, path, _context);
      changes.push(...ngxsModuleImportChanges, ...provideStoreChanges);
      const recorder = tree.beginUpdate(path);

      changes.forEach(change => {
        if (change instanceof InsertChange) {
          recorder.insertLeft(change.pos, change.toAdd);
        }
      });

      tree.commitUpdate(recorder);
    });

    return tree;
  };
}

// ****** NGXS Module forRoot Migrations ******

function migrateNgxsForRoot(
  source: ts.SourceFile,
  path: string,
  context: SchematicContext
): Change[] {
  const ngxsModuleImport = findNgxsModuleImport(source);
  const changes: Change[] = [];

  if (!ngxsModuleImport) {
    return [];
  }
  const args = ngxsModuleImport.arguments;

  if (!args.length) {
    context.logger.info(`Migrating empty forRoot in ${path}`);
    migrateEmptyForRoot(ngxsModuleImport.arguments.pos, path, changes);
  } else if (args.length === 1) {
    context.logger.info(`Migrating forRoot with states in ${path}`);
    migrateForRootWithStates(ngxsModuleImport.arguments[0].end, path, changes);
  } else {
    context.logger.info(`Migrating forRoot with states and existing options in ${path}`);
    migrateForRootWithExistingOptions(ngxsModuleImport.arguments, path, changes);
  }

  // add the import if it does not exists
  addNgxsExecutionStrategyImport({
    source,
    path,
    changes
  });

  return changes;
}

/**
 * NgxsModule.forRoot() -> NgxsModule.forRoot([], { executionStrategy: DispatchOutsideZoneNgxsExecutionStrategy })
 */
function migrateEmptyForRoot(start: number, modulePath: string, changes: Change[]) {
  const newArguments = `[], { ${EXECUTION_STRATEGY_OPTION} }`;

  changes.push(new InsertChange(modulePath, start, newArguments));
}

/**
 * NgxsModule.forRoot(states) -> NgxsModule.forRoot(states, { executionStrategy: DispatchOutsideZoneNgxsExecutionStrategy })
 * provideStore([]) -> provideStore([], { executionStrategy: DispatchOutsideZoneNgxsExecutionStrategy })
 */
function migrateForRootWithStates(start: number, modulePath: string, changes: Change[]) {
  const newArguments = `, { ${EXECUTION_STRATEGY_OPTION} }`;

  changes.push(new InsertChange(modulePath, start, newArguments));
}

/**
 * NgxsModule.forRoot([], { foo:'bar' }) -> NgxsModule.forRoot([], { foo:'bar', executionStrategy: DispatchOutsideZoneNgxsExecutionStrategy })
 */
function migrateForRootWithExistingOptions(
  args: ts.NodeArray<ts.Expression>,
  modulePath: string,
  changes: Change[]
) {
  if (args.length === 2 && ts.isObjectLiteralExpression(args[1])) {
    migrateExistingOptions(args, modulePath, changes);
  }
}

// ****** provideStore Migrations ******
function migrateProvideStore(
  source: ts.SourceFile,
  path: string,
  context: SchematicContext
): Change[] {
  const provideStoreImport = findProvideStore(source);
  const changes: Change[] = [];

  if (!provideStoreImport) {
    return [];
  }
  const args = provideStoreImport.arguments;

  if (args.length === 1) {
    // args.length === 1 --> provideStore([])
    context.logger.info(`Migrating provideStore with states in ${path}`);
    migrateForRootWithStates(provideStoreImport.arguments[0].end, path, changes);
  } else if (args.length >= 2) {
    migrateProvideStoreWithExistingOptions(
      provideStoreImport.arguments,
      path,
      changes,
      context
    );
  }

  // add the import if it does not exist
  addNgxsExecutionStrategyImport({
    source,
    path,
    changes
  });

  return changes;
}

function findProvideStore(source: ts.SourceFile): ts.CallExpression | undefined {
  const nodes = findNodes(source, (node): node is ts.CallExpression => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'provideStore'
    ) {
      return ts.isCallExpression(node);
    }

    return false;
  });

  if (nodes.length === 0) {
    return undefined;
  }

  return nodes[0] as ts.CallExpression;
}

/**
 * provideStore([], OPTIONS) -> provideStore([], { ...OPTIONS, executionStrategy: DispatchOutsideZoneNgxsExecutionStrategy })
 * provideStore([], OPTIONS, PLUGINS) -> provideStore([], { ...OPTIONS, executionStrategy: DispatchOutsideZoneNgxsExecutionStrategy }, PLUGINS)
 * provideStore([], PLUGINS) -> provideStore([], { executionStrategy: DispatchOutsideZoneNgxsExecutionStrategy }, PLUGINS)
 */
function migrateProvideStoreWithExistingOptions(
  args: ts.NodeArray<ts.Expression>,
  path: string,
  changes: Change[],
  context: SchematicContext
) {
  if (args.length >= 2) {
    // If the second argument is an object literal expression, we can add the executionStrategy property to same object
    if (ts.isObjectLiteralExpression(args[1])) {
      context.logger.info(
        `Migrating provideStore with states and existing options in ${path}`
      );
      migrateExistingOptions(args, path, changes);
    }

    // if the second argument is not an object literal expression, we assume that it is a plugin
    if (!ts.isObjectLiteralExpression(args[1]) && ts.isCallExpression(args[1])) {
      context.logger.info(
        `Migrating provideStore with states, existing options and plugins in ${path}`
      );
      const insertionPoint = args[0].end;
      const toInsert = `, { ${EXECUTION_STRATEGY_OPTION} }`;
      changes.push(new InsertChange(path, insertionPoint, toInsert));
    }
  }
}

// *** Common Functions ***
function addNgxsExecutionStrategyImport(options: {
  source: ts.SourceFile;
  path: string;
  changes: Change[];
}) {
  // add the import if it does not exists
  const importChange = insertImport(
    options.source,
    options.path,
    'DispatchOutsideZoneNgxsExecutionStrategy',
    '@ngxs/store'
  );
  if (importChange) {
    options.changes.push(importChange);
  }
}

function findNgxsModuleImport(source: ts.SourceFile): ts.CallExpression | undefined {
  const nodes = findNodes(source, (node): node is ts.CallExpression => {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression) &&
      node.expression.expression.text === 'NgxsModule' &&
      ts.isIdentifier(node.expression.name) &&
      node.expression.name.text === 'forRoot'
    ) {
      return ts.isCallExpression(node);
    }

    return false;
  });

  if (nodes.length === 0) {
    return undefined;
  }
  return nodes[0] as ts.CallExpression;
}

/**
 * provideStore([], OPTIONS) -> provideStore([], { ...OPTIONS, executionStrategy: DispatchOutsideZoneNgxsExecutionStrategy })
 */
function migrateExistingOptions(
  args: ts.NodeArray<ts.Expression>,
  path: string,
  changes: Change[]
) {
  if (!ts.isObjectLiteralExpression(args[1])) {
    return;
  }

  const configObject = args[1];

  const executionStrategyProperty = configObject.properties.find(
    prop =>
      ts.isPropertyAssignment(prop) &&
      ts.isIdentifier(prop.name) &&
      prop.name.text === 'executionStrategy'
  );

  if (!executionStrategyProperty) {
    const insertionPoint = configObject.properties.end;
    const toInsert = `, ${EXECUTION_STRATEGY_OPTION}`;
    changes.push(new InsertChange(path, insertionPoint, toInsert));
  }
}
