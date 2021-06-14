type WebSocketMessage = string | Blob | ArrayBuffer | ArrayBufferView;

declare module 'mock-socket' {
  interface WebSocketCallbackMap {
    close: () => void;
    error: (err: Error) => void;
    message: (message: WebSocketMessage) => void;
    open: () => void;
  }

  interface WebSocket {
    // the `WebSocket` from the `mock-socket` package actually has this method!
    // but they didn't add this method to the interface!
    // that's why we do "module augmentation"
    // so we don't have to use `any` type like `(socket: any)`
    on<K extends keyof WebSocketCallbackMap>(type: K, callback: WebSocketCallbackMap[K]): void;
  }
}
