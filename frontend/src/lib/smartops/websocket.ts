// WebSocket Client
// Handles real-time updates via WebSocket or Server-Sent Events fallback

export type UpdateType = 
  | 'target_status_changed'
  | 'bda_assessment_created'
  | 'decision_gate_changed'
  | 'jtb_session_updated'
  | 'tst_alert'
  | 'new_target_nominated';

export interface RealtimeUpdate {
  type: UpdateType;
  entityId: string;
  entityType: string;
  timestamp: string;
  data: Record<string, any>;
}

type UpdateCallback = (update: RealtimeUpdate) => void;
type ConnectionCallback = (connected: boolean) => void;

class RealtimeClient {
  private ws: WebSocket | null = null;
  private eventSource: EventSource | null = null;
  private updateCallbacks: Set<UpdateCallback> = new Set();
  private connectionCallbacks: Set<ConnectionCallback> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private useWebSocket = true; // Prefer WebSocket, fallback to SSE

  constructor() {
    // Auto-connect on instantiation
    this.connect();
  }

  private getWebSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_WS_URL || window.location.host;
    return `${protocol}//${host}/ws/targeting`;
  }

  private getSSEUrl(): string {
    const protocol = window.location.protocol;
    const host = import.meta.env.VITE_API_URL || window.location.origin;
    return `${protocol}//${host.replace(/^https?:\/\//, '')}/api/targeting/events`;
  }

  connect(): void {
    if (this.isConnecting) return;
    if (this.ws?.readyState === WebSocket.OPEN || this.eventSource?.readyState === EventSource.OPEN) {
      return; // Already connected
    }

    this.isConnecting = true;

    if (this.useWebSocket) {
      this.connectWebSocket();
    } else {
      this.connectSSE();
    }
  }

  private connectWebSocket(): void {
    try {
      const url = this.getWebSocketUrl();
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.notifyConnection(true);
        console.log('[WebSocket] Connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const update: RealtimeUpdate = JSON.parse(event.data);
          this.handleUpdate(update);
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        this.isConnecting = false;
      };

      this.ws.onclose = () => {
        this.isConnecting = false;
        this.notifyConnection(false);
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('[WebSocket] Connection failed, falling back to SSE:', error);
      this.useWebSocket = false;
      this.connectSSE();
    }
  }

  private connectSSE(): void {
    try {
      const url = this.getSSEUrl();
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.notifyConnection(true);
        console.log('[SSE] Connected');
      };

      this.eventSource.onmessage = (event) => {
        try {
          const update: RealtimeUpdate = JSON.parse(event.data);
          this.handleUpdate(update);
        } catch (error) {
          console.error('[SSE] Failed to parse message:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('[SSE] Error:', error);
        this.isConnecting = false;
        this.notifyConnection(false);
        // SSE will auto-reconnect, but we can add manual retry if needed
      };
    } catch (error) {
      console.error('[SSE] Connection failed:', error);
      this.isConnecting = false;
      this.notifyConnection(false);
    }
  }

  private handleUpdate(update: RealtimeUpdate): void {
    this.updateCallbacks.forEach((callback) => {
      try {
        callback(update);
      } catch (error) {
        console.error('[RealtimeClient] Callback error:', error);
      }
    });
  }

  private notifyConnection(connected: boolean): void {
    this.connectionCallbacks.forEach((callback) => {
      try {
        callback(connected);
      } catch (error) {
        console.error('[RealtimeClient] Connection callback error:', error);
      }
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('[RealtimeClient] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    setTimeout(() => {
      console.log(`[RealtimeClient] Reconnecting (attempt ${this.reconnectAttempts})...`);
      this.connect();
    }, delay);
  }

  subscribe(callback: UpdateCallback): () => void {
    this.updateCallbacks.add(callback);
    return () => {
      this.updateCallbacks.delete(callback);
    };
  }

  onConnectionChange(callback: ConnectionCallback): () => void {
    this.connectionCallbacks.add(callback);
    return () => {
      this.connectionCallbacks.delete(callback);
    };
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.isConnecting = false;
    this.notifyConnection(false);
  }

  isConnected(): boolean {
    return (
      this.ws?.readyState === WebSocket.OPEN ||
      this.eventSource?.readyState === EventSource.OPEN
    );
  }
}

// Singleton instance
export const realtimeClient = new RealtimeClient();
