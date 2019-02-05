import { NgxsStoragePluginModule, StorageEngine } from '../';

export class SimpleSynchronizedStorage implements StorageEngine {
  constructor(private storage: Storage) {}

  async length(): Promise<number> {
    return this.storage.length;
  }
  async getItem(key: string): Promise<any> {
    return this.storage.getItem(key);
  }
  async setItem(key: string, val: any): Promise<void> {
    return this.storage.setItem(key, val);
  }
  async removeItem(key: string): Promise<void> {
    return this.storage.removeItem(key);
  }
  async clear(): Promise<void> {
    return this.storage.clear();
  }
}
