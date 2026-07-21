export { NgxsStoragePluginModule, withNgxsStoragePlugin } from './storage.module';
export { withStorageFeature } from './with-storage-feature';
export { withNgxsStorageSync } from './features/with-ngxs-storage-sync';
export { NgxsStoragePlugin } from './storage.plugin';
export * from './engines';

export {
  StorageOption,
  type NgxsStoragePluginOptions,
  STORAGE_ENGINE,
  type StorageEngine
} from '@ngxs/storage-plugin/internals';
