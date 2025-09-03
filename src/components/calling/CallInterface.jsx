import React, { useEffect, useState } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Volume2 } from 'lucide-react';
import { useCall } from '../../contexts/CallContext';
import { formatCallDuration } from '../../utils/dateUtils';

const CallInterface = () => {
  const {
    currentCall,
    incomingCall,
    isCallActive,
    callStartTime,
    localVideoRef,
    remoteVideoRef,
    answerCall,
    declineCall,
    endCall,
    toggleMute,
    toggleVideo
  } = useCall();

  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  // Update call duration
  useEffect(() => {
    if (!isCallActive || !callStartTime) return;

    const interval = setInterval(() => {
      const duration = Math.floor((new Date() - callStartTime) / 1000);
      setCallDuration(duration);
    }, 1000);

    return () => clearInterval(interval);
  }, [isCallActive, callStartTime]);

  const handleToggleMute = () => {
    toggleMute();
    setIsMuted(!isMuted);
  };

  const handleToggleVideo = () => {
    toggleVideo();
    setIsVideoEnabled(!isVideoEnabled);
  };

  // Incoming call screen
  if (incomingCall) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">
              {incomingCall.caller.username.charAt(0).toUpperCase()}
            </span>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {incomingCall.caller.username}
          </h3>
          
          <p className="text-gray-600 mb-8">
            Incoming {incomingCall.call_type} call...
          </p>
          
          <div className="flex justify-center space-x-6">
            <button
              onClick={() => declineCall(incomingCall.callId)}
              className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
            
            <button
              onClick={() => answerCall(incomingCall.callId)}
              className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
            >
              <Phone className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active call screen
  if (currentCall) {
    const isVideoCall = currentCall.callType === 'video';
    
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Video containers */}
        {isVideoCall && (
          <div className="flex-1 relative">
            {/* Remote video */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Local video */}
            <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
        
        {/* Call info (for voice calls or overlay for video calls) */}
        {(!isVideoCall || !isCallActive) && (
          <div className="flex-1 flex flex-col items-center justify-center text-white">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-6">
              <span className="text-white text-4xl font-bold">
                {currentCall.receiverId ? 'U' : 'U'}
              </span>
            </div>
            
            <h3 className="text-2xl font-semibold mb-2">
              {currentCall.receiverId ? 'User' : 'User'}
            </h3>
            
            <p className="text-gray-300 mb-4">
              {isCallActive ? formatCallDuration(callDuration) : 'Calling...'}
            </p>
          </div>
        )}
        
        {/* Call controls */}
        <div className="p-6 bg-black bg-opacity-50">
          <div className="flex justify-center space-x-6">
            {/* Mute button */}
            <button
              onClick={handleToggleMute}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                isMuted ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            
            {/* Video toggle (for video calls) */}
            {isVideoCall && (
              <button
                onClick={handleToggleVideo}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                  !isVideoEnabled ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
              </button>
            )}
            
            {/* Speaker button (for voice calls) */}
            {!isVideoCall && (
              <button className="w-14 h-14 bg-gray-700 text-white rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors">
                <Volume2 className="w-6 h-6" />
              </button>
            )}
            
            {/* End call button */}
            <button
              onClick={endCall}
              className="w-14 h-14 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default CallInterface;