import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { chain, noop, Rule, Tree, SchematicContext } from '@angular-devkit/schematics';
import { addPackageToPackageJson } from '../utils/package';
import { getProjectFromWorkspace } from '../utils/config';
import { Schema } from './schema';
import { getWorkspace } from '@schematics/angular/utility/config';
import { addModuleImportToRootModule } from '../utils/ast';

export default function(options: Schema): Rule {
  return chain([options && options.skipPackageJson ? noop() : addtoPackageJson(), addStoreToRootModule(options)]);
}

function addtoPackageJson() {
  return (host: Tree, context: SchematicContext) => {
    addPackageToPackageJson(host, 'dependencies', '@ngxs/store', '^3.0.0');
    context.addTask(new NodePackageInstallTask());
    return host;
  };
}

function addStoreToRootModule(options: Schema) {
  return (host: Tree) => {
    const workspace = getWorkspace(host);
    const project = getProjectFromWorkspace(workspace, options.project);

    addModuleImportToRootModule(host, 'NgxsModule', '@ngxs/store', project);

    return host;
  };
}
