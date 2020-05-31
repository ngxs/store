import { isJIT } from '@ngxs/store/internals';

import { NgxsHmrOptions } from '../symbols';
import { ivyEnabledInDevMode } from '../../../store/src/ivy/ivy-enabled-in-dev-mode';

export class HmrOptionBuilder {
  public readonly deferTime: number;
  public readonly autoClearLogs: boolean;

  constructor({ deferTime, autoClearLogs }: NgxsHmrOptions) {
    this.deferTime = deferTime || 100;
    this.autoClearLogs = autoClearLogs === undefined ? true : autoClearLogs;
    this.validateIvyMode();
  }

  public clearLogs(): void {
    if (this.autoClearLogs) {
      console.clear();
    }
  }

  private validateIvyMode(): void {
    ivyEnabledInDevMode().subscribe(_ivyEnabledInDevMode => {
      if (isJIT()) {
        console.error(`@ngxs/hrm-plugin: doesn't work with JIT mode with Ivy render.`);
      }
    });
  }
}
