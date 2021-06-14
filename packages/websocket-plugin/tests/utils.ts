import { WebSocket } from 'mock-socket';

export function mockWebSocket(): void {
  const OriginalWebSocket = window.WebSocket;

  beforeEach(() => {
    (window as any).WebSocket = WebSocket;
  });

  afterAll(() => {
    window.WebSocket = OriginalWebSocket;
  });
}
