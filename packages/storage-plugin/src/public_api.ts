export { NgxsStoragePluginModule, withNgxsStoragePlugin } from './storage.module';
export { withStorageFeature } from './with-storage-feature';
export { withNgxsStorageSync } from './features/with-ngxs-storage-sync';
export {
  withNgxsStorageBatching,
  withNgxsStorageDefaultBatching,
  NGXS_STORAGE_ENGINE_TO_WRAP,
  type NgxsStorageBatchingOptions,
  type NgxsBatchingStorageEngine
} from './features/with-ngxs-storage-batching';
export {
  NgxsStoragePlugin,
  NgxsStorageDeserializationError,
  NgxsStorageQuotaExceededError,
  NgxsStorageSerializationError
} from './storage.plugin';
export * from './engines';

export {
  StorageOption,
  type NgxsStoragePluginOptions,
  STORAGE_ENGINE,
  type StorageEngine
} from '@ngxs/storage-plugin/internals';
