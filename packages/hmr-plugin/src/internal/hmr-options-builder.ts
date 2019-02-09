import { NgxsHmrLifeCycle, NgxsHmrOptions } from '../symbols';

export class HmrOptionBuilder<T extends NgxsHmrLifeCycle<S>, S> {
  public readonly deferTime: number;
  public readonly autoClearLogs: boolean;

  constructor({ deferTime, autoClearLogs }: NgxsHmrOptions<T, S>) {
    this.deferTime = deferTime || 100;
    this.autoClearLogs = autoClearLogs === undefined ? true : autoClearLogs;
  }

  public clearLogs(): void {
    if (this.autoClearLogs) {
      console.clear();
    }
  }
}
