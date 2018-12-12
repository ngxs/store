import { StateStream } from '@ngxs/store';

export interface NgxsStoreSnapshot {
  [key: string]: any;
}

export interface NgxsHmrPlugin {

  /**
   * hmrNgxsStoreOnInit is called when the AppModule on init
   * @param stream - current state from Store
   * @param snapshot - previous state from Store after last hmr on destroy
   */
  hmrNgxsStoreOnInit(stream: StateStream, snapshot: NgxsStoreSnapshot): void;

  /**
   * hmrNgxsStoreOnInit is called when the AppModule on destroy
   * @param stream - current state from Store
   */
  hmrNgxsStoreOnDestroy(stream: StateStream): NgxsStoreSnapshot;
}
