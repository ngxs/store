export function isEmpty(value: string | undefined): boolean {
  return typeof value !== 'undefined' && !value.trim().length;
}
