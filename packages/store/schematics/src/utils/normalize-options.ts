import { normalize, strings } from '@angular-devkit/core';

interface BaseOptions {
  name: string;
  path?: string;
}

export function normalizeBaseOptions<T extends BaseOptions>(
  options: T
): T & Required<BaseOptions> {
  const name: string = strings.dasherize(options.name);
  const path = normalizePath(options.path);
  return {
    ...options,
    name,
    path
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
