import { useState, useEffect, useRef, useCallback } from 'react';
const DEFAULT_CONFIG = {
    maxRetries: 10,
    initialDelay: 1000, // Start with 1 second
    maxDelay: 30000, // Max 30 seconds
    backoffMultiplier: 1.5, // Exponential backoff
    jitterRange: 0.3, // 30% random jitter
    pingInterval: 30000, // Ping every 30 seconds
    pongTimeout: 10000 // Wait 10 seconds for pong
};
export function useReconnectingWebSocket(url, config = {}) {
    const fullConfig = { ...DEFAULT_CONFIG, ...config };
    const [state, setState] = useState({
        data: [],
        connectionStatus: 'disconnected',
        error: null,
        reconnectAttempts: 0,
        lastConnected: null,
        isReconnecting: false
    });
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const pingIntervalRef = useRef(null);
    const pongTimeoutRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);
    const intentionalCloseRef = useRef(false);
    // Calculate next reconnection delay with exponential backoff and jitter
    const calculateDelay = useCallback((attempt) => {
        const exponentialDelay = Math.min(fullConfig.initialDelay * Math.pow(fullConfig.backoffMultiplier, attempt), fullConfig.maxDelay);
        // Add jitter to prevent thundering herd
        const jitter = exponentialDelay * fullConfig.jitterRange * (Math.random() - 0.5);
        return Math.max(100, exponentialDelay + jitter);
    }, [fullConfig]);
    // Clear all timers
    const clearTimers = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
        }
        if (pongTimeoutRef.current) {
            clearTimeout(pongTimeoutRef.current);
            pongTimeoutRef.current = null;
        }
    }, []);
    // Setup ping/pong heartbeat
    const setupHeartbeat = useCallback(() => {
        clearTimers();
        pingIntervalRef.current = setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                console.log('📡 Sending WebSocket ping');
                // Send ping
                try {
                    wsRef.current.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
                }
                catch (error) {
                    console.warn('Failed to send ping:', error);
                    return;
                }
                // Wait for pong response
                pongTimeoutRef.current = setTimeout(() => {
                    console.warn('⚠️ Pong timeout - connection may be stale');
                    setState(prev => ({ ...prev, connectionStatus: 'error' }));
                    // Force reconnection
                    if (wsRef.current) {
                        wsRef.current.close();
                    }
                }, fullConfig.pongTimeout);
            }
        }, fullConfig.pingInterval);
    }, [fullConfig.pingInterval, fullConfig.pongTimeout, clearTimers]);
    // Connect to WebSocket
    const connect = useCallback(() => {
        if (!url || intentionalCloseRef.current)
            return;
        // Don't connect if already connecting or connected
        if (wsRef.current?.readyState === WebSocket.CONNECTING ||
            wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }
        console.log(`🔌 Connecting to WebSocket: ${url} (attempt ${reconnectAttemptsRef.current + 1})`);
        setState(prev => ({
            ...prev,
            connectionStatus: reconnectAttemptsRef.current > 0 ? 'reconnecting' : 'connecting',
            error: null,
            isReconnecting: reconnectAttemptsRef.current > 0
        }));
        try {
            wsRef.current = new WebSocket(url);
            wsRef.current.onopen = () => {
                console.log('✅ WebSocket connected successfully');
                reconnectAttemptsRef.current = 0;
                setState(prev => ({
                    ...prev,
                    connectionStatus: 'connected',
                    error: null,
                    reconnectAttempts: 0,
                    lastConnected: new Date(),
                    isReconnecting: false
                }));
                setupHeartbeat();
            };
            wsRef.current.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    // Handle pong response
                    if (message.type === 'pong') {
                        console.log('🏓 Received WebSocket pong');
                        if (pongTimeoutRef.current) {
                            clearTimeout(pongTimeoutRef.current);
                            pongTimeoutRef.current = null;
                        }
                        return;
                    }
                    // Handle ping (respond with pong)
                    if (message.type === 'ping') {
                        console.log('🏓 Received ping, sending pong');
                        if (wsRef.current?.readyState === WebSocket.OPEN) {
                            wsRef.current.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
                        }
                        return;
                    }
                    // Handle data messages
                    if (message.type === 'ohlc' && message.data) {
                        setState(prev => ({
                            ...prev,
                            data: [...prev.data, message.data].slice(-1000) // Keep last 1000 items
                        }));
                    }
                }
                catch (error) {
                    console.warn('Failed to parse WebSocket message:', error);
                }
            };
            wsRef.current.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                setState(prev => ({
                    ...prev,
                    connectionStatus: 'error',
                    error: new Error('WebSocket connection error')
                }));
            };
            wsRef.current.onclose = (event) => {
                console.log(`🔌 WebSocket closed: ${event.code} - ${event.reason}`);
                clearTimers();
                if (intentionalCloseRef.current) {
                    setState(prev => ({ ...prev, connectionStatus: 'disconnected' }));
                    return;
                }
                // Determine if we should reconnect
                const shouldReconnect = reconnectAttemptsRef.current < fullConfig.maxRetries;
                setState(prev => ({
                    ...prev,
                    connectionStatus: shouldReconnect ? 'reconnecting' : 'failed',
                    reconnectAttempts: reconnectAttemptsRef.current,
                    isReconnecting: shouldReconnect
                }));
                if (shouldReconnect) {
                    const delay = calculateDelay(reconnectAttemptsRef.current);
                    console.log(`🔄 Scheduling reconnection in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${fullConfig.maxRetries})`);
                    reconnectTimeoutRef.current = setTimeout(() => {
                        reconnectAttemptsRef.current++;
                        connect();
                    }, delay);
                }
                else {
                    console.error('💥 Max reconnection attempts reached');
                    setState(prev => ({
                        ...prev,
                        connectionStatus: 'failed',
                        error: new Error('Maximum reconnection attempts exceeded')
                    }));
                }
            };
        }
        catch (error) {
            console.error('Failed to create WebSocket:', error);
            setState(prev => ({
                ...prev,
                connectionStatus: 'error',
                error: error instanceof Error ? error : new Error('WebSocket creation failed')
            }));
        }
    }, [url, fullConfig.maxRetries, calculateDelay, setupHeartbeat, clearTimers]);
    // Manual reconnect function
    const reconnect = useCallback(() => {
        console.log('🔄 Manual reconnection initiated');
        reconnectAttemptsRef.current = 0;
        intentionalCloseRef.current = false;
        if (wsRef.current) {
            intentionalCloseRef.current = true;
            wsRef.current.close();
            intentionalCloseRef.current = false;
        }
        setTimeout(connect, 100);
    }, [connect]);
    // Disconnect function
    const disconnect = useCallback(() => {
        console.log('🔌 Intentional WebSocket disconnect');
        intentionalCloseRef.current = true;
        clearTimers();
        if (wsRef.current) {
            wsRef.current.close();
        }
        setState(prev => ({
            ...prev,
            connectionStatus: 'disconnected',
            isReconnecting: false
        }));
    }, [clearTimers]);
    // Reset connection state
    const reset = useCallback(() => {
        disconnect();
        setState({
            data: [],
            connectionStatus: 'disconnected',
            error: null,
            reconnectAttempts: 0,
            lastConnected: null,
            isReconnecting: false
        });
        reconnectAttemptsRef.current = 0;
    }, [disconnect]);
    // Effect to handle URL changes - use refs to avoid dependency issues
    useEffect(() => {
        if (!url) {
            disconnect();
            return;
        }
        // If URL changed, disconnect and reconnect
        if (wsRef.current) {
            disconnect();
            setTimeout(() => connect(), 100);
        }
        else {
            connect();
        }
        return () => {
            intentionalCloseRef.current = true;
            clearTimers();
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [url]); // Only depend on URL changes
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            intentionalCloseRef.current = true;
            clearTimers();
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [clearTimers]);
    return {
        ...state,
        reconnect,
        disconnect,
        reset,
        send: useCallback((data) => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(typeof data === 'string' ? data : JSON.stringify(data));
                return true;
            }
            return false;
        }, [])
    };
}
// Legacy compatibility wrapper for existing useWebSocketOHLC
export function useWebSocketOHLC(url) {
    const { data, connectionStatus, reconnect, disconnect } = useReconnectingWebSocket(url);
    return {
        data,
        connectionStatus: connectionStatus,
        reconnect,
        disconnect
    };
}
