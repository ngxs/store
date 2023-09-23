import { TargetDefinition } from '@schematics/angular/utility/workspace';
import { getWorkspace } from './config';
import { Tree } from '@angular-devkit/schematics';

export interface WorkspaceProject {
  name: string;
  root: string;
  projectType: string;
  architect: {
    [key: string]: TargetDefinition;
  };
}

export function getProject(host: Tree, project?: string): WorkspaceProject | null {
  const workspace = getWorkspace(host);

  if (!project) {
    const defaultProject = (workspace as { defaultProject?: string }).defaultProject;
    project =
      defaultProject !== undefined ? defaultProject : Object.keys(workspace.projects)[0];
  }

  const resolvedProject = workspace.projects[project];
  if (resolvedProject) {
    resolvedProject.name = project;

    return resolvedProject;
  }
  return null;
}

export function getProjectPath(
  host: Tree,
  options: { project?: string | undefined; path?: string | undefined }
): string | null {
  const project = getProject(host, options.project);

  if (!project) {
    return null;
  }

  if (project.root.slice(-1) === '/') {
    project.root = project.root.substring(0, project.root.length - 1);
  }

  if (options.path === undefined) {
    const projectDirName = project.projectType === 'application' ? 'app' : 'lib';

    return `${project.root ? `/${project.root}` : ''}/src/${projectDirName}`;
  }

  return options.path;
}

export function isLib(host: Tree, project?: string) {
  const resolvedProject = getProject(host, project);

  return resolvedProject?.projectType === 'library';
}
