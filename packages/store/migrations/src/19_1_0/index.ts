import { DirEntry, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as ts from 'ts-morph';
import { exit } from 'node:process';
import { getProjectMainFile } from '../../../schematics-utils/src/project';

export default function (): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const tsProject = new ts.Project({ useInMemoryFileSystem: true });
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

    visitTsFiles(tree, tree.root, async path => {
      const fileContent = tree.readText(path);
      const sourceFile = tsProject.createSourceFile(path, fileContent!);

      sourceFile.forEachDescendant(node => {
        const callExpression = node as ts.CallExpression;

        if (!isCallExpression(node)) {
          return;
        }

        migrateProvideStore(node, callExpression, _context, path, sourceFile, tree);

        migrateNgxsForRoot(node, callExpression, _context, path, sourceFile, tree);
      });

      tree.overwrite(path, sourceFile.getFullText());
    });
  };
}

function migrateNgxsForRoot(
  node: ts.CallExpression<ts.ts.CallExpression>,
  callExpression: ts.CallExpression<ts.ts.CallExpression>,
  _context: SchematicContext,
  path: string,
  sourceFile: ts.SourceFile,
  tree: Tree
) {
  if (
    ts.Node.isPropertyAccessExpression(node.getExpression()) &&
    isNgxsModule(callExpression)
  ) {
    const args = callExpression.getArguments();
    if (!args.length) {
      _context.logger.info(`Migrating empty forRoot in ${path}`);
      migrateEmptyForRoot(callExpression);
    } else if (args.length === 1) {
      _context.logger.info(`Migrating forRoot with states in ${path}`);
      migrateForRootWithStates(callExpression);
    } else if (args.length === 2) {
      _context.logger.info(`Migrating forRoot with states and existing properties in ${path}`);
      migrateForRootWithExistingOptions(args[1]);
    }

    if (!args.length || args.length <= 2) {
      // Add the import statement
      addNgxsExecutionStrategyImport({
        path,
        sourceFile,
        tree
      });
    }
  }
}

function migrateProvideStore(
  node: ts.CallExpression<ts.ts.CallExpression>,
  callExpression: ts.CallExpression<ts.ts.CallExpression>,
  _context: SchematicContext,
  path: string,
  sourceFile: ts.SourceFile,
  tree: Tree
) {
  if (ts.Node.isIdentifier(node.getExpression()) && isProviderFunction(callExpression)) {
    const args = callExpression.getArguments();

    if (args.length === 1) {
      // args.length === 1 --> provideStore([])
      _context.logger.info(`Migrating provideStore with states in ${path}`);
      migrateForRootWithStates(callExpression);
    } else if (args.length === 2) {
      // args.length === 2 --> provideStore([], {foo:'bar'})
      _context.logger.info(
        `Migrating provideStore with states and existing properties in ${path}`
      );
      migrateForRootWithExistingOptions(args[1]);
    }

    if (args.length === 1 || args.length === 2) {
      // Add the import statement
      addNgxsExecutionStrategyImport({
        path,
        sourceFile,
        tree
      });
    }
  }
}

function addNgxsExecutionStrategyImport(options: {
  sourceFile: ts.SourceFile;
  path: string;
  tree: Tree;
}) {
  // Add the import statement
  const importDeclaration = options.sourceFile.getImportDeclaration('@ngxs/store');
  if (importDeclaration) {
    importDeclaration.addNamedImports(['DispatchOutsideZoneNgxsExecutionStrategy']);
  } else {
    options.sourceFile.addImportDeclaration({
      namedImports: ['DispatchOutsideZoneNgxsExecutionStrategy'],
      moduleSpecifier: '@ngxs/store'
    });
  }

  // Get the updated text
  const updatedText = options.sourceFile.getText();

  // Update the tree
  options.tree.overwrite(options.path, updatedText);
}

// TODO(FP): move to utilities
function visitTsFiles(tree: Tree, dirPath = tree.root, visitor: (path: string) => void): void {
  function visit(directory: DirEntry) {
    for (const path of directory.subfiles) {
      if (path.endsWith('.ts') && !path.endsWith('.d.ts')) {
        const entry = directory.file(path);
        if (entry) {
          visitor(entry.path);
        }
      }
    }

    for (const path of directory.subdirs) {
      if (path === 'node_modules') {
        continue;
      }

      visit(directory.dir(path));
    }
  }

  visit(dirPath);
}

/**
 * We do not use the ts.Node.isCallExpression(node) because the underlying implementation
 * uses -> node.getKind() === typescript.SyntaxKind.CallExpression
 * which is an enum that can return different numbers depending on minor typescript package versions
 */
function isCallExpression(node: ts.Node): node is ts.CallExpression {
  return node.getKindName() === 'CallExpression';
}

function isNgxsModule(callExpression: ts.CallExpression) {
  return callExpression && callExpression.getText().includes('NgxsModule.forRoot');
}

function isProviderFunction(callExpression: ts.CallExpression) {
  return callExpression.getExpression().getText() === 'provideStore';
}

/**
 * NgxsModule.forRoot() -> NgxsModule.forRoot([], { executionStrategy: DispatchOutsideZoneNgxsExecutionStrategy })
 */
function migrateEmptyForRoot(callExpression: ts.CallExpression<ts.ts.CallExpression>) {
  callExpression.addArgument(`[]`);
  callExpression.addArgument(
    `{ executionStrategy: DispatchOutsideZoneNgxsExecutionStrategy }`
  );
}

/**
 * NgxsModule.forRoot(states) -> NgxsModule.forRoot(states, { executionStrategy: DispatchOutsideZoneNgxsExecutionStrategy })
 * provideStore([]) -> provideStore([], { executionStrategy: DispatchOutsideZoneNgxsExecutionStrategy })
 */
function migrateForRootWithStates(callExpression: ts.CallExpression<ts.ts.CallExpression>) {
  callExpression.addArgument(
    `{ executionStrategy: DispatchOutsideZoneNgxsExecutionStrategy }`
  );
}

/**
 * NgxsModule.forRoot([], { foo:'bar' }) -> NgxsModule.forRoot([], { foo:'bar', executionStrategy: DispatchOutsideZoneNgxsExecutionStrategy })
 * provideStore([], { foo:'bar' }) -> provideStore([], { foo:'bar', executionStrategy: DispatchOutsideZoneNgxsExecutionStrategy })
 */
function migrateForRootWithExistingOptions(arg: ts.Node<ts.ts.Node>) {
  const objectLiteral = arg as ts.ObjectLiteralExpression;

  const hasPropertyName = (name: string) =>
    objectLiteral.getProperties().some(prop => {
      return ts.Node.isPropertyAssignment(prop) && prop.getName() === name;
    });

  const isAlreadyMigrated = hasPropertyName('executionStrategy');

  // If the "executionStrategy" property is already there, we should not try migrating
  if (isAlreadyMigrated) {
    return;
  }

  objectLiteral.addPropertyAssignment({
    name: 'executionStrategy',
    initializer: 'DispatchOutsideZoneNgxsExecutionStrategy'
  });
}
