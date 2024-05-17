import { TargetDefinition } from '@schematics/angular/utility/workspace';
import { getWorkspace } from './config';
import { Tree } from '@angular-devkit/schematics';
import { join } from 'path';

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
    if (!defaultProject) {
      const projectNames = Object.keys(workspace.projects);
      if (projectNames.length === 1) {
        project = projectNames[0];
      }
    }
  }

  const resolvedProject = project && workspace.projects[project];
  if (resolvedProject) {
    resolvedProject.name = project;

    return resolvedProject;
  }
  return null;
}

export function getProjectData(
  host: Tree,
  options: { project?: string | undefined; path?: string | undefined }
): { project: string; path: string } | null {
  const project = getProject(host, options.project);

  if (!project) {
    return null;
  }

  if (project.root.slice(-1) === '/') {
    project.root = project.root.substring(0, project.root.length - 1);
  }

  const projectDirName = project.projectType === 'application' ? 'app' : 'lib';

  return {
    project: project.name,
    path: join(project.root ?? '', 'src', projectDirName, options.path ?? '')
  };
}

export function isLib(host: Tree, project?: string) {
  const resolvedProject = getProject(host, project);

  return resolvedProject?.projectType === 'library';
}
