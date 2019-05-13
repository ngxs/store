import { NgxsHmrOptions } from '../symbols';

export class HmrOptionBuilder {
  public readonly deferTime: number;
  public readonly autoClearLogs: boolean;

  constructor({ deferTime, autoClearLogs }: NgxsHmrOptions) {
    this.deferTime = deferTime || 100;
    this.autoClearLogs = autoClearLogs === undefined ? true : autoClearLogs;
  }

  public clearLogs(): void {
    if (this.autoClearLogs) {
      console.clear();
    }
  }
}
