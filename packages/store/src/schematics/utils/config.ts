import { SchematicsException } from '@angular-devkit/schematics';
import { WorkspaceSchema } from '@angular-devkit/core/src/workspace';

/**
 * Get the project for the given workspace.
 * https://github.com/angular/material2/blob/48dda505f78ba82be385b025c6c5eb5ff51e8a84/src/lib/schematics/utils/devkit-utils/config.ts#L96
 * https://github.com/angular/angular-cli/blob/master/packages/schematics/angular/component/index.ts#L131
 */
export function getProjectFromWorkspace(workspace: WorkspaceSchema, options: any) {
  if (!options.project) {
    throw new SchematicsException('Option (project) is required.');
  }

  const project = workspace.projects[options.project];

  if (!project) {
    throw new SchematicsException('Project not found');
  }

  return project;
}
