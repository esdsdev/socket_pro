import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { callAPI } from '../services/api';

const CallContext = createContext();

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};

export const CallProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  
  const [currentCall, setCurrentCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callHistory, setCallHistory] = useState([]);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStartTime, setCallStartTime] = useState(null);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleIncomingCall = (callData) => {
      setIncomingCall(callData);
    };

    const handleCallAnswered = (callData) => {
      setIsCallActive(true);
      setCallStartTime(new Date());
    };

    const handleCallDeclined = () => {
      setCurrentCall(null);
      setIncomingCall(null);
      cleanupCall();
    };

    const handleCallEnded = () => {
      setCurrentCall(null);
      setIncomingCall(null);
      setIsCallActive(false);
      setCallStartTime(null);
      cleanupCall();
    };

    socket.on('call:incoming', handleIncomingCall);
    socket.on('call:answered', handleCallAnswered);
    socket.on('call:declined', handleCallDeclined);
    socket.on('call:ended', handleCallEnded);

    return () => {
      socket.off('call:incoming', handleIncomingCall);
      socket.off('call:answered', handleCallAnswered);
      socket.off('call:declined', handleCallDeclined);
      socket.off('call:ended', handleCallEnded);
    };
  }, [socket, isConnected]);

  const cleanupCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  };

  const initiateCall = async (receiverId, callType) => {
    try {
      const response = await callAPI.initiateCall(receiverId, callType);
      setCurrentCall({
        id: response.callId,
        receiverId,
        callType,
        status: 'calling'
      });
      
      // Setup WebRTC for the call
      await setupWebRTC(callType);
      
      return response;
    } catch (error) {
      console.error('Error initiating call:', error);
      throw error;
    }
  };

  const answerCall = async (callId) => {
    try {
      await callAPI.answerCall(callId);
      setCurrentCall({
        id: callId,
        ...incomingCall,
        status: 'active'
      });
      setIncomingCall(null);
      
      // Setup WebRTC for the call
      await setupWebRTC(incomingCall.call_type);
      
    } catch (error) {
      console.error('Error answering call:', error);
      throw error;
    }
  };

  const declineCall = async (callId) => {
    try {
      await callAPI.declineCall(callId);
      setIncomingCall(null);
    } catch (error) {
      console.error('Error declining call:', error);
      throw error;
    }
  };

  const endCall = async () => {
    if (!currentCall) return;

    try {
      const duration = callStartTime ? Math.floor((new Date() - callStartTime) / 1000) : 0;
      await callAPI.endCall(currentCall.id, duration);
      
      setCurrentCall(null);
      setIsCallActive(false);
      setCallStartTime(null);
      cleanupCall();
    } catch (error) {
      console.error('Error ending call:', error);
      throw error;
    }
  };

  const setupWebRTC = async (callType) => {
    try {
      // Get user media
      const constraints = {
        audio: true,
        video: callType === 'video'
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Setup peer connection
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      };
      
      peerConnectionRef.current = new RTCPeerConnection(configuration);
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnectionRef.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

    } catch (error) {
      console.error('Error setting up WebRTC:', error);
      throw error;
    }
  };

  const loadCallHistory = async () => {
    try {
      const history = await callAPI.getCallHistory();
      setCallHistory(history);
    } catch (error) {
      console.error('Error loading call history:', error);
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  };

  const value = {
    currentCall,
    incomingCall,
    callHistory,
    isCallActive,
    callStartTime,
    localVideoRef,
    remoteVideoRef,
    initiateCall,
    answerCall,
    declineCall,
    endCall,
    loadCallHistory,
    toggleMute,
    toggleVideo
  };

  return (
    <CallContext.Provider value={value}>
      {children}
    </CallContext.Provider>
  );
};