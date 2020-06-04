import { NgxsHmrOptions } from '../symbols';

export class HmrOptionBuilder {
  public readonly deferTime: number;
  public readonly autoClearLogs: boolean;
  public isIvyMode: boolean | undefined;

  constructor({ deferTime, autoClearLogs, isIvyMode }: NgxsHmrOptions) {
    this.deferTime = deferTime || 100;
    this.autoClearLogs = autoClearLogs === undefined ? true : autoClearLogs;
    this.isIvyMode = isIvyMode;
  }

  public clearLogs(): void {
    if (this.autoClearLogs) {
      console.clear();
    }
  }
}
