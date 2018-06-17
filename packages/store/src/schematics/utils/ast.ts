import { Tree, SchematicsException } from '@angular-devkit/schematics';
import * as ts from 'typescript';
import { addImportToModule } from '@schematics/angular/utility/ast-utils';
import { getAppModulePath } from '@schematics/angular/utility/ng-ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';

/**
 * Import and add module to root app module.
 * https://github.com/angular/material2/blob/48dda505f78ba82be385b025c6c5eb5ff51e8a84/src/lib/schematics/utils/ast.ts#L22
 */
export function addModuleImportToRootModule(host: Tree, moduleName: string, src: string, project: any) {
  const modulePath = getAppModulePath(host, project.architect.build.options.main);
  addModuleImportToModule(host, modulePath, moduleName, src);
}

/**
 * Reads file given path and returns TypeScript source file.
 * https://github.com/angular/material2/blob/48dda505f78ba82be385b025c6c5eb5ff51e8a84/src/lib/schematics/utils/ast.ts#L12
 */
export function getSourceFile(host: Tree, path: string): ts.SourceFile {
  const buffer = host.read(path);
  if (!buffer) {
    throw new SchematicsException(`Could not find file for path: ${path}`);
  }
  const content = buffer.toString();
  return ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true);
}

/**
 * Import and add module to specific module path.
 * https://github.com/angular/material2/blob/48dda505f78ba82be385b025c6c5eb5ff51e8a84/src/lib/schematics/utils/ast.ts#L34
 */
export function addModuleImportToModule(host: Tree, modulePath: string, moduleName: string, src: string) {
  const moduleSource = getSourceFile(host, modulePath);

  if (!moduleSource) {
    throw new SchematicsException(`Module not found: ${modulePath}`);
  }

  const changes = addImportToModule(moduleSource, modulePath, moduleName, src);
  const recorder = host.beginUpdate(modulePath);

  changes.forEach(change => {
    if (change instanceof InsertChange) {
      recorder.insertLeft(change.pos, change.toAdd);
    }
  });

  host.commitUpdate(recorder);
}
