import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { getProject, isLib } from '../project';

export function getProjectMainFile(host: Tree, project?: string): string | null {
  const resolvedProject = getProject(host, project);
  if (!resolvedProject) {
    if (!project) {
      throw new SchematicsException(
        `Could not determine the project name. Make sure to provide the "project" option manually.`
      );
    }
    throw new SchematicsException(`Project "${project}" does not exist.`);
  }
  if (isLib(host, project)) {
    return null;
  }
  const projectOptions = resolvedProject.architect['build'].options;

  if (projectOptions?.main) {
    return projectOptions.main as string;
  } else if (projectOptions?.browser) {
    return projectOptions.browser as string;
  }

  throw new SchematicsException('No `main` or `browser` files have been found.');
}
