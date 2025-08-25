import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Send } from 'lucide-react';

const VoiceRecorder = ({ onRecordingComplete, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    startRecording();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      onCancel();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const handleSend = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob);
    }
  };

  const handleCancel = () => {
    if (isRecording) {
      stopRecording();
    }
    onCancel();
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isRecording ? (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <Mic className="w-5 h-5 text-red-500" />
            </div>
          ) : (
            <Mic className="w-5 h-5 text-gray-500" />
          )}
          
          <div className="text-sm">
            {isRecording ? (
              <span className="text-red-600 font-medium">Recording... {formatTime(recordingTime)}</span>
            ) : (
              <span className="text-gray-600">Recording complete ({formatTime(recordingTime)})</span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isRecording ? (
            <button
              onClick={stopRecording}
              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              title="Stop recording"
            >
              <Square className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                title="Cancel"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleSend}
                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                title="Send voice message"
              >
                <Send className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Waveform visualization placeholder */}
      {isRecording && (
        <div className="mt-3 flex items-center justify-center space-x-1">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className="w-1 bg-red-400 rounded-full animate-pulse"
              style={{
                height: `${Math.random() * 20 + 10}px`,
                animationDelay: `${i * 50}ms`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;