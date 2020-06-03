import { NgxsHmrOptions } from '../symbols';
import { isDevMode } from '@angular/core';

export class HmrOptionBuilder {
  public readonly deferTime: number;
  public readonly autoClearLogs: boolean;
  public readonly isIvyMode: boolean;

  constructor({ deferTime, autoClearLogs, isIvyMode }: NgxsHmrOptions) {
    this.deferTime = deferTime || 100;
    this.autoClearLogs = autoClearLogs === undefined ? true : autoClearLogs;
    this.isIvyMode = isIvyMode === undefined ? HmrOptionBuilder.isIvy() : isIvyMode;
  }

  private static isIvy(): boolean {
    const ng = (window as any).ng;
    const _viewEngineEnabled = !!ng.probe && !!ng.coreTokens;
    return !_viewEngineEnabled && isDevMode();
  }

  public clearLogs(): void {
    if (this.autoClearLogs) {
      console.clear();
    }
  }
}
