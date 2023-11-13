import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { getProject, isLib } from '../project';

export function getProjectMainFile(host: Tree, project?: string) {
  const resolvedProject = getProject(host, project);
  if (!resolvedProject) {
    throw new SchematicsException(`Project "${project}" does not exist.`);
  }
  if (isLib(host, project)) {
    throw new SchematicsException(`Invalid project type`);
  }
  const projectOptions = resolvedProject.architect['build'].options;

  if (!projectOptions?.main) {
    throw new SchematicsException(`Could not find the main file`);
  }

  return projectOptions.main as string;
}
