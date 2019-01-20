import { NgxsHmrOptions, HmrAfterOnInit, NgxsHmrLifeCycle } from '../symbols';
import { HmrManager } from '../hmr-manager';

export class HmrOptionBuilder<T extends NgxsHmrLifeCycle<S>, S> {
  public readonly deferTime: number;
  public readonly autoClearLogs: boolean;
  public readonly hmrAfterOnInit: HmrAfterOnInit<T, S>;

  constructor({ deferTime, autoClearLogs, hmrAfterOnInit }: NgxsHmrOptions<T, S>) {
    this.deferTime = deferTime || 100;
    this.hmrAfterOnInit = hmrAfterOnInit || ((_: HmrManager<T, S>) => {});
    this.autoClearLogs = autoClearLogs === undefined ? true : autoClearLogs;
  }

  public clearLogs(): void {
    if (this.autoClearLogs) {
      console.clear();
      console.log('[NGXS HMR] clear old logs...');
    }
  }
}
