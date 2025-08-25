import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReconnectingWebSocket } from './useReconnectingWebSocket';
// Mock WebSocket
class MockWebSocket {
    constructor(url) {
        this.onopen = null;
        this.onclose = null;
        this.onmessage = null;
        this.onerror = null;
        this.readyState = 0;
        this.send = vi.fn();
        this.close = vi.fn().mockImplementation(() => {
            this.readyState = MockWebSocket.CLOSED;
            if (this.onclose) {
                this.onclose(new CloseEvent('close', { code: 1000, reason: 'Normal closure' }));
            }
        });
        this.url = url;
        this.readyState = MockWebSocket.CONNECTING;
        // Simulate successful connection after a short delay
        setTimeout(() => {
            this.readyState = MockWebSocket.OPEN;
            if (this.onopen) {
                this.onopen(new Event('open'));
            }
        }, 10);
    }
}
MockWebSocket.CONNECTING = 0;
MockWebSocket.OPEN = 1;
MockWebSocket.CLOSING = 2;
MockWebSocket.CLOSED = 3;
global.WebSocket = MockWebSocket;
describe('useReconnectingWebSocket', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.clearAllTimers();
    });
    describe('Basic Connection', () => {
        it('should connect to WebSocket URL', async () => {
            const { result } = renderHook(() => useReconnectingWebSocket('ws://localhost:8000/test'));
            // Initial state
            expect(result.current.connectionStatus).toBe('connecting');
            expect(result.current.data).toEqual([]);
            // Simulate connection
            await act(async () => {
                vi.advanceTimersByTime(20);
            });
            expect(result.current.connectionStatus).toBe('connected');
        });
        it('should handle empty URL', () => {
            const { result } = renderHook(() => useReconnectingWebSocket(''));
            expect(result.current.connectionStatus).toBe('disconnected');
        });
    });
    describe('Message Handling', () => {
        it('should handle OHLC data messages', async () => {
            const { result } = renderHook(() => useReconnectingWebSocket('ws://localhost:8000/test'));
            await act(async () => {
                vi.advanceTimersByTime(20);
            });
            // Simulate receiving OHLC data
            const mockData = {
                time: 1640995200,
                open: 100,
                high: 110,
                low: 95,
                close: 105
            };
            const mockWebSocket = global.WebSocket.mock.results[0].value;
            await act(async () => {
                if (mockWebSocket.onmessage) {
                    mockWebSocket.onmessage({
                        data: JSON.stringify({ type: 'ohlc', data: mockData })
                    });
                }
            });
            expect(result.current.data).toHaveLength(1);
            expect(result.current.data[0]).toEqual(mockData);
        });
        it('should handle ping/pong messages', async () => {
            const { result } = renderHook(() => useReconnectingWebSocket('ws://localhost:8000/test'));
            await act(async () => {
                vi.advanceTimersByTime(20);
            });
            const mockWebSocket = global.WebSocket.mock.results[0].value;
            // Test ping response
            await act(async () => {
                if (mockWebSocket.onmessage) {
                    mockWebSocket.onmessage({
                        data: JSON.stringify({ type: 'ping', timestamp: Date.now() })
                    });
                }
            });
            expect(mockWebSocket.send).toHaveBeenCalledWith(expect.stringContaining('"type":"pong"'));
        });
        it('should limit data array size', async () => {
            const { result } = renderHook(() => useReconnectingWebSocket('ws://localhost:8000/test'));
            await act(async () => {
                vi.advanceTimersByTime(20);
            });
            const mockWebSocket = global.WebSocket.mock.results[0].value;
            // Send many messages
            for (let i = 0; i < 1200; i++) {
                await act(async () => {
                    if (mockWebSocket.onmessage) {
                        mockWebSocket.onmessage({
                            data: JSON.stringify({
                                type: 'ohlc',
                                data: { time: i, open: 100, high: 110, low: 95, close: 105 }
                            })
                        });
                    }
                });
            }
            expect(result.current.data).toHaveLength(1000); // Should be limited to 1000
        });
    });
    describe('Reconnection Logic', () => {
        it('should attempt reconnection on connection failure', async () => {
            // Mock WebSocket to fail immediately
            const FailingWebSocket = vi.fn().mockImplementation(() => {
                const ws = {
                    onopen: null,
                    onclose: null,
                    onerror: null,
                    onmessage: null,
                    readyState: 3, // CLOSED
                    send: vi.fn(),
                    close: vi.fn(),
                };
                setTimeout(() => {
                    if (ws.onclose) {
                        ws.onclose(new CloseEvent('close', { code: 1006, reason: 'Connection failed' }));
                    }
                }, 10);
                return ws;
            });
            global.WebSocket = FailingWebSocket;
            const { result } = renderHook(() => useReconnectingWebSocket('ws://localhost:8000/test', {
                maxRetries: 3,
                initialDelay: 100
            }));
            await act(async () => {
                vi.advanceTimersByTime(20);
            });
            expect(result.current.connectionStatus).toBe('reconnecting');
            // Should schedule reconnection
            await act(async () => {
                vi.advanceTimersByTime(150);
            });
            expect(FailingWebSocket).toHaveBeenCalledTimes(2); // Initial + 1 retry
        });
        it('should give up after max retries', async () => {
            const FailingWebSocket = vi.fn().mockImplementation(() => ({
                onopen: null,
                onclose: (callback) => {
                    setTimeout(() => callback(new CloseEvent('close', { code: 1006 })), 10);
                },
                onerror: null,
                onmessage: null,
                readyState: 3,
                send: vi.fn(),
                close: vi.fn(),
            }));
            global.WebSocket = FailingWebSocket;
            const { result } = renderHook(() => useReconnectingWebSocket('ws://localhost:8000/test', {
                maxRetries: 2,
                initialDelay: 50
            }));
            // Let all retry attempts complete
            await act(async () => {
                vi.advanceTimersByTime(1000);
            });
            expect(result.current.connectionStatus).toBe('failed');
        });
    });
    describe('Manual Controls', () => {
        it('should allow manual reconnection', async () => {
            const { result } = renderHook(() => useReconnectingWebSocket('ws://localhost:8000/test'));
            await act(async () => {
                vi.advanceTimersByTime(20);
            });
            expect(result.current.connectionStatus).toBe('connected');
            // Manual reconnect
            await act(async () => {
                result.current.reconnect();
            });
            expect(result.current.connectionStatus).toBe('connecting');
        });
        it('should allow manual disconnection', async () => {
            const { result } = renderHook(() => useReconnectingWebSocket('ws://localhost:8000/test'));
            await act(async () => {
                vi.advanceTimersByTime(20);
            });
            expect(result.current.connectionStatus).toBe('connected');
            // Manual disconnect
            await act(async () => {
                result.current.disconnect();
            });
            expect(result.current.connectionStatus).toBe('disconnected');
        });
        it('should reset connection state', async () => {
            const { result } = renderHook(() => useReconnectingWebSocket('ws://localhost:8000/test'));
            await act(async () => {
                vi.advanceTimersByTime(20);
            });
            // Add some data
            const mockWebSocket = global.WebSocket.mock.results[0].value;
            await act(async () => {
                if (mockWebSocket.onmessage) {
                    mockWebSocket.onmessage({
                        data: JSON.stringify({ type: 'ohlc', data: { time: 1, value: 100 } })
                    });
                }
            });
            expect(result.current.data).toHaveLength(1);
            // Reset
            await act(async () => {
                result.current.reset();
            });
            expect(result.current.data).toEqual([]);
            expect(result.current.connectionStatus).toBe('disconnected');
        });
    });
    describe('Heartbeat', () => {
        it('should send periodic pings', async () => {
            const { result } = renderHook(() => useReconnectingWebSocket('ws://localhost:8000/test', {
                pingInterval: 100
            }));
            await act(async () => {
                vi.advanceTimersByTime(20);
            });
            const mockWebSocket = global.WebSocket.mock.results[0].value;
            // Advance time to trigger ping
            await act(async () => {
                vi.advanceTimersByTime(120);
            });
            expect(mockWebSocket.send).toHaveBeenCalledWith(expect.stringContaining('"type":"ping"'));
        });
    });
});
