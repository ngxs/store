import { normalize, strings } from '@angular-devkit/core';
import { getProjectData } from './project';
import { Tree } from '@angular-devkit/schematics';

interface BaseOptions {
  name: string;
  path?: string;
  project?: string;
}

export function normalizeBaseOptions<T extends BaseOptions>(
  host: Tree,
  options: T
): T & Required<BaseOptions> {
  const name: string = strings.dasherize(options.name);
  const data = getProjectData(host, options);

  if (!data) {
    throw new Error('Could not resolve project path and name');
  }

  return {
    ...options,
    name,
    path: data.path,
    project: data.project
  };
}

export function normalizePath(path: string | undefined): string {
  return path !== undefined ? normalize(path) : '';
}

/** Returns `value` if it's "true" | "false" and default value otherwise */
export function normalizeOptionalBoolean(
  value: boolean | undefined,
  defaultValue: boolean
): boolean {
  if (value === true || value === false) {
    return value;
  }
  return defaultValue;
}
