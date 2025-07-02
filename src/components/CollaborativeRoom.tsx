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
  
  // WebSocket connection
  const wsRef = useRef<CollaborativeWebSocket | null>(null);
  const lastUpdateRef = useRef<string>('');
  const isLocalUpdateRef = useRef(false);

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

          {/* Close room button (interviewer only) */}
          {isInterviewer && (
            <button
              onClick={handleCloseRoom}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
            >
              Close Room
            </button>
          )}
        </div>
      </div>

      {/* Connection error */}
      {connectionError && (
        <div className="bg-red-600 text-white p-3 rounded mb-4">
          <p>{connectionError}</p>
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