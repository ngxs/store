import { NgxsModule } from '@ngxs/store';

export function isJIT(): boolean {
  return Array.isArray((NgxsModule as any)['__annotations__']);
}

export function isAOT(): boolean {
  return !isJIT();
}
