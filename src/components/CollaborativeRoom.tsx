import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';
import { useAuth } from '../contexts/AuthContext';
import { roomAPI, CollaborativeWebSocket } from '../lib/api';
import LanguageSelector from './LanguageSelector';

interface RoomInfo {
  room_code: string;
  interviewer: { id: string; name: string; email: string };
  candidate: { id: string; name: string; email: string } | null;
  status: string;
  editor_content: string;
}

interface CollaborativeRoomProps {
  roomCode: string;
  isInterviewer?: boolean;
}

const CollaborativeRoom: React.FC<CollaborativeRoomProps> = ({ roomCode, isInterviewer = false }) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  // Room state
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Editor state
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [remoteUsers, setRemoteUsers] = useState<{ [userId: string]: { name: string; cursor: any } }>({});
  
  // Monitoring state (candidates only)
  const [focusWarning, setFocusWarning] = useState<string | null>(null);
  const [monitoringAlerts, setMonitoringAlerts] = useState<Array<{
    type: string;
    message: string;
    timestamp: string;
  }>>([]);
  
  // WebSocket connection
  const wsRef = useRef<CollaborativeWebSocket | null>(null);
  const lastUpdateRef = useRef<string>('');
  const isLocalUpdateRef = useRef(false);
  
  // Monitoring refs (candidates only)
  const focusLostTimeRef = useRef<number | null>(null);
  const keystrokeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get language extension for CodeMirror
  const getLanguageExtension = (lang: string) => {
    switch (lang.toLowerCase()) {
      case 'python':
        return [python()];
      case 'java':
        return [java()];
      case 'cpp':
      case 'c++':
        return [cpp()];
      case 'c':
        return [cpp()];
      default:
        return [];
    }
  };

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((data: any) => {
    console.log('WebSocket message:', data);
    
    switch (data.type) {
      case 'room_state':
        setRoomInfo(data.room_info);
        if (data.room_info.editor_content && data.room_info.editor_content !== code) {
          setCode(data.room_info.editor_content);
          lastUpdateRef.current = data.room_info.editor_content;
        }
        break;
        
      case 'editor_update':
        if (data.user_id !== user?.id && data.content !== lastUpdateRef.current) {
          isLocalUpdateRef.current = false;
          setCode(data.content);
          lastUpdateRef.current = data.content;
        }
        break;
        
      case 'cursor_update':
        if (data.user_id !== user?.id) {
          setRemoteUsers(prev => ({
            ...prev,
            [data.user_id]: {
              name: data.user_name,
              cursor: data.cursor_position
            }
          }));
        }
        break;
        
      case 'participant_joined':
        console.log('Participant joined');
        break;
        
      case 'participant_left':
        console.log('Participant left');
        break;
        
      case 'room_closed':
        alert('The interview room has been closed');
        navigate('/');
        break;
        
      case 'candidate_monitoring_alert':
        // Only show alerts to interviewers
        if (isInterviewer) {
          setMonitoringAlerts(prev => [...prev, {
            type: data.alert_type,
            message: data.message,
            timestamp: data.timestamp
          }]);
        }
        break;
        
      default:
        console.log('Unknown message type:', data.type);
    }
  }, [user?.id, code, navigate]);

  // Initialize room and WebSocket connection
  useEffect(() => {
    if (!user || !profile) return;

    const initializeRoom = async () => {
      try {
        // Get room info first
        const info = await roomAPI.getRoomInfo(roomCode);
        setRoomInfo(info);
        setCode(info.editor_content);
        lastUpdateRef.current = info.editor_content;

        // Initialize WebSocket connection
        const ws = new CollaborativeWebSocket(
          roomCode,
          user.id,
          profile.full_name || profile.email,
          {
            onMessage: handleWebSocketMessage,
            onOpen: () => {
              setConnected(true);
              setConnectionError(null);
            },
            onClose: () => {
              setConnected(false);
            },
            onError: (error) => {
              console.error('WebSocket connection error:', error);
              setConnectionError('Failed to connect to collaboration server');
              setConnected(false);
            }
          }
        );

        ws.connect();
        wsRef.current = ws;
        
      } catch (error) {
        console.error('Failed to initialize room:', error);
        setConnectionError(error instanceof Error ? error.message : 'Failed to connect to room');
      }
    };

    initializeRoom();

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
      }
    };
  }, [user, profile, roomCode, handleWebSocketMessage]);

  // Monitoring utility functions (candidates only) - must be declared before useEffect
  const isSuspiciousKeyCombination = useCallback((key: string, ctrlKey: boolean, metaKey: boolean, altKey: boolean): boolean => {
    const keyCombo = `${ctrlKey ? 'Ctrl+' : ''}${metaKey ? 'Cmd+' : ''}${altKey ? 'Alt+' : ''}${key}`;
    
    // Define suspicious key combinations
    const suspiciousKeys = [
      'Ctrl+C', 'Cmd+C', // Copy
      'Ctrl+V', 'Cmd+V', // Paste
      'Ctrl+A', 'Cmd+A', // Select All
      'Ctrl+X', 'Cmd+X', // Cut
      'Ctrl+Z', 'Cmd+Z', // Undo
      'Ctrl+Y', 'Cmd+Y', // Redo
      'Ctrl+F', 'Cmd+F', // Find
      'Ctrl+H', 'Cmd+H', // Replace
      'Ctrl+Tab', 'Cmd+Tab', // Switch tabs
      'Alt+Tab', // Switch applications
      'Ctrl+Shift+I', 'Cmd+Shift+I', // Developer tools
      'F12', // Developer tools
      'Ctrl+Shift+J', 'Cmd+Shift+J', // Console
      'Ctrl+U', 'Cmd+U', // View source
    ];
    
    return suspiciousKeys.includes(keyCombo);
  }, []);

  const sendKeystroke = useCallback((key: string, ctrlKey: boolean, metaKey: boolean, altKey: boolean) => {
    if (!isInterviewer && wsRef.current && wsRef.current.isConnected()) {
      const keyCombo = `${ctrlKey ? 'Ctrl+' : ''}${metaKey ? 'Cmd+' : ''}${altKey ? 'Alt+' : ''}${key}`;
      const isSuspicious = isSuspiciousKeyCombination(key, ctrlKey, metaKey, altKey);
      
      wsRef.current.sendKeystrokeMonitoring(key, keyCombo, isSuspicious);
    }
  }, [isInterviewer, isSuspiciousKeyCombination]);

  // Monitoring for candidates only
  useEffect(() => {
    if (isInterviewer || !user || !profile) return;

    // Window focus/blur monitoring
    const handleWindowBlur = () => {
      focusLostTimeRef.current = Date.now();
      setFocusWarning('⚠️ Warning: You have lost focus of the interview window. Please return to the interview.');
    };

    const handleWindowFocus = () => {
      if (focusLostTimeRef.current) {
        const duration = Date.now() - focusLostTimeRef.current;
        if (duration > 1000 && wsRef.current && wsRef.current.isConnected()) { // Only report if lost focus for more than 1 second
          wsRef.current.sendWindowFocusLost(Math.round(duration / 1000));
        }
        focusLostTimeRef.current = null;
      }
      setFocusWarning(null);
    };

    // Keystroke monitoring
    const handleKeyDown = (event: KeyboardEvent) => {
      // Clear previous timeout
      if (keystrokeTimeoutRef.current) {
        clearTimeout(keystrokeTimeoutRef.current);
      }

      // Debounce keystroke reporting to avoid spam
      keystrokeTimeoutRef.current = setTimeout(() => {
        sendKeystroke(event.key, event.ctrlKey, event.metaKey, event.altKey);
      }, 100);
    };

    // Add event listeners
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('keydown', handleKeyDown);
      
      if (keystrokeTimeoutRef.current) {
        clearTimeout(keystrokeTimeoutRef.current);
      }
    };
  }, [isInterviewer, user, profile, sendKeystroke]);

  // Handle code changes
  const handleCodeChange = useCallback((value: string) => {
    if (isLocalUpdateRef.current === false) {
      isLocalUpdateRef.current = true;
      return;
    }

    setCode(value);
    lastUpdateRef.current = value;
    
    // Send update via WebSocket
    if (wsRef.current && wsRef.current.isConnected()) {
      wsRef.current.sendEditorUpdate(value);
    }
  }, []);

  // Handle language change
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
  };

  // Close room (interviewer only)
  const handleCloseRoom = async () => {
    if (!isInterviewer) return;
    
    if (confirm('Are you sure you want to close this interview room?')) {
      try {
        await roomAPI.closeRoom(roomCode);
        navigate('/');
      } catch (error) {
        console.error('Failed to close room:', error);
        alert('Failed to close room');
      }
    }
  };

  // Loading state
  if (!roomInfo) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-white mt-4">Connecting to room {roomCode}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="text-blue-400 hover:text-blue-300 font-semibold"
          >
            ← Back to Home
          </button>
          
          <div className="text-white">
            <h1 className="text-xl font-bold">Interview Room: {roomCode}</h1>
            <p className="text-sm text-gray-400">
              {isInterviewer ? 'You are the interviewer' : 'You are the candidate'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Connection status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-white text-sm">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Interviewer controls */}
          {isInterviewer && (
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  // Open monitoring dashboard in a new window/modal
                  // For now, we'll just show an alert with monitoring data
                  roomAPI.getMonitoringData(roomCode)
                    .then(data => {
                      const alertMessage = `
Monitoring Summary for Room ${roomCode}:
• Total Focus Loss Incidents: ${data.monitoring_incidents.length}
• Total Keystrokes Monitored: ${data.total_keystrokes}
• Suspicious Key Combinations: ${data.keystroke_logs.filter(k => k.is_suspicious).length}

Recent Incidents:
${data.monitoring_incidents.slice(-3).map(i => 
  `• ${i.type} - ${new Date(i.timestamp).toLocaleTimeString()}${i.duration ? ` (${i.duration}s)` : ''}`
).join('\n')}
                      `;
                      alert(alertMessage);
                    })
                    .catch(error => {
                      console.error('Failed to fetch monitoring data:', error);
                      alert('Failed to fetch monitoring data');
                    });
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors text-sm"
              >
                📊 Monitoring
              </button>
              <button
                onClick={handleCloseRoom}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
              >
                Close Room
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Connection error */}
      {connectionError && (
        <div className="bg-red-600 text-white p-3 rounded mb-4">
          <p>{connectionError}</p>
        </div>
      )}

      {/* Focus warning for candidates */}
      {!isInterviewer && focusWarning && (
        <div className="bg-yellow-600 text-white p-3 rounded mb-4 animate-pulse">
          <p className="font-semibold">{focusWarning}</p>
        </div>
      )}

      {/* Monitoring alerts for interviewers */}
      {isInterviewer && monitoringAlerts.length > 0 && (
        <div className="bg-orange-600 text-white p-4 rounded mb-4">
          <h3 className="font-semibold mb-2">🚨 Candidate Monitoring Alerts</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {monitoringAlerts.slice(-5).reverse().map((alert, index) => (
              <div key={index} className="text-sm bg-orange-700 p-2 rounded">
                <p>{alert.message}</p>
                <p className="text-orange-200 text-xs">{new Date(alert.timestamp).toLocaleTimeString()}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => setMonitoringAlerts([])}
            className="mt-2 text-xs text-orange-200 hover:text-white underline"
          >
            Clear alerts
          </button>
        </div>
      )}

      {/* Participants info */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h3 className="text-white font-semibold mb-3">Participants</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-700 rounded p-3">
            <p className="text-white font-medium">Interviewer</p>
            <p className="text-blue-200 text-sm">{roomInfo.interviewer.name}</p>
            <p className="text-blue-300 text-xs">{roomInfo.interviewer.email}</p>
          </div>
          
          {roomInfo.candidate ? (
            <div className="bg-green-700 rounded p-3">
              <p className="text-white font-medium">Candidate</p>
              <p className="text-green-200 text-sm">{roomInfo.candidate.name}</p>
              <p className="text-green-300 text-xs">{roomInfo.candidate.email}</p>
            </div>
          ) : (
            <div className="bg-gray-600 rounded p-3">
              <p className="text-white font-medium">Candidate</p>
              <p className="text-gray-300 text-sm">Waiting for candidate to join...</p>
            </div>
          )}
        </div>
      </div>

      {/* Language selector */}
      <div className="mb-4">
        <LanguageSelector language={language} setLanguage={handleLanguageChange} />
      </div>

      {/* Code editor */}
      <div className="flex justify-center">
        <div className="shadow-lg border border-gray-700 rounded overflow-hidden bg-gray-800">
          <CodeMirror
            value={code}
            onChange={handleCodeChange}
            theme={oneDark}
            extensions={getLanguageExtension(language)}
            height="500px"
            width="800px"
            placeholder={`Start coding together in ${language}...`}
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              dropCursor: false,
              allowMultipleSelections: false,
              indentOnInput: true,
              bracketMatching: true,
              closeBrackets: true,
              autocompletion: true,
              highlightSelectionMatches: false,
              searchKeymap: true,
            }}
            style={{
              fontSize: '16px',
              fontFamily: '"Fira Code", "Monaco", "Consolas", "Ubuntu Mono", monospace',
            }}
          />
        </div>
      </div>

      {/* Status */}
      <div className="mt-4 text-center">
        <p className="text-gray-400 text-sm">
          {roomInfo.status === 'waiting_for_candidate' 
            ? 'Waiting for candidate to join...' 
            : 'Interview in progress - collaborate in real-time!'
          }
        </p>
      </div>
    </div>
  );
};

export default CollaborativeRoom; 