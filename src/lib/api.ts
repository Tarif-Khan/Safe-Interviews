import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Get the current user's JWT token for API authentication
export const getAuthToken = async (): Promise<string | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
};

// Create authenticated headers for API requests
const createAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Handle API responses and errors
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

// Room API functions
export const roomAPI = {
  // Create a new interview room (for interviewers)
  createRoom: async (): Promise<{ room_code: string; status: string; message: string }> => {
    const headers = await createAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/create-room`, {
      method: 'POST',
      headers,
      body: JSON.stringify({}),
    });
    return handleResponse(response);
  },

  // Join an existing room (for candidates)
  joinRoom: async (roomCode: string): Promise<{ 
    room_code: string; 
    status: string; 
    message: string; 
    room_info: {
      interviewer: { id: string; name: string; email: string };
      candidate: { id: string; name: string; email: string } | null;
      editor_content: string;
    }
  }> => {
    const headers = await createAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/join-room`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ room_code: roomCode }),
    });
    return handleResponse(response);
  },

  // Get room information
  getRoomInfo: async (roomCode: string): Promise<{
    room_code: string;
    interviewer: { id: string; name: string; email: string };
    candidate: { id: string; name: string; email: string } | null;
    status: string;
    editor_content: string;
  }> => {
    const response = await fetch(`${API_BASE_URL}/api/room/${roomCode}`);
    return handleResponse(response);
  },

  // Close a room
  closeRoom: async (roomCode: string): Promise<{ status: string; message: string }> => {
    const headers = await createAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/room/${roomCode}`, {
      method: 'DELETE',
      headers,
    });
    return handleResponse(response);
  },

  // Get monitoring data for a room (interviewer only)
  getMonitoringData: async (roomCode: string): Promise<{
    room_code: string;
    monitoring_incidents: Array<{
      type: string;
      user_id: string;
      user_name: string;
      timestamp: string;
      duration?: number;
    }>;
    keystroke_logs: Array<{
      user_id: string;
      user_name: string;
      timestamp: string;
      key: string;
      key_combination: string;
      is_suspicious: boolean;
    }>;
    total_incidents: number;
    total_keystrokes: number;
  }> => {
    const headers = await createAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/room/${roomCode}/monitoring`, {
      headers,
    });
    return handleResponse(response);
  },
};

// WebSocket connection for real-time collaboration
export class CollaborativeWebSocket {
  private ws: WebSocket | null = null;
  private roomCode: string;
  private userId: string;
  private userName: string;
  private onMessage: (data: any) => void;
  private onOpen: () => void;
  private onClose: () => void;
  private onError: (error: Event) => void;

  constructor(
    roomCode: string,
    userId: string,
    userName: string,
    callbacks: {
      onMessage: (data: any) => void;
      onOpen: () => void;
      onClose: () => void;
      onError: (error: Event) => void;
    }
  ) {
    this.roomCode = roomCode;
    this.userId = userId;
    this.userName = userName;
    this.onMessage = callbacks.onMessage;
    this.onOpen = callbacks.onOpen;
    this.onClose = callbacks.onClose;
    this.onError = callbacks.onError;
  }

  connect(): void {
    const wsUrl = API_BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://');
    this.ws = new WebSocket(`${wsUrl}/ws/${this.roomCode}`);

    this.ws.onopen = () => {
      console.log(`Connected to room ${this.roomCode}`);
      this.onOpen();
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.onMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log(`Disconnected from room ${this.roomCode}`);
      this.onClose();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.onError(error);
    };
  }

  // Send editor content update
  sendEditorUpdate(content: string, cursorPosition?: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'editor_update',
        content,
        user_id: this.userId,
        user_name: this.userName,
        cursor_position: cursorPosition,
      }));
    }
  }

  // Send cursor position update
  sendCursorUpdate(cursorPosition: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'cursor_update',
        user_id: this.userId,
        user_name: this.userName,
        cursor_position: cursorPosition,
      }));
    }
  }

  // Monitoring methods for candidates
  sendWindowFocusLost(duration: number): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'window_focus_lost',
        user_id: this.userId,
        user_name: this.userName,
        duration: duration
      }));
    }
  }

  sendKeystrokeMonitoring(key: string, keyCombination: string, isSuspicious: boolean): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'keystroke_monitoring',
        user_id: this.userId,
        user_name: this.userName,
        key: key,
        key_combination: keyCombination,
        is_suspicious: isSuspicious
      }));
    }
  }

  // Disconnect from WebSocket
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // Get connection state
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Health check
export const healthCheck = async (): Promise<{
  status: string;
  active_rooms: number;
  active_connections: number;
}> => {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  return handleResponse(response);
}; 