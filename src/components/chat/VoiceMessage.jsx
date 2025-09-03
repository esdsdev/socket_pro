import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download } from 'lucide-react';

const VoiceMessage = ({ message, autoDownload = true, maxSize = 10 }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(message.voice_messages?.[0]?.duration || 30);
  const [shouldLoadAudio, setShouldLoadAudio] = useState(false);
  const audioRef = useRef(null);

  const audioUrl = message.voiceMessages?.[0]?.file_path;
  const voiceMessage = message.voiceMessages?.[0];
  const fileSizeInMB = voiceMessage?.file_size ? voiceMessage.file_size / (1024 * 1024) : 0;
  const shouldAutoLoad = autoDownload && (maxSize >= 100 || fileSizeInMB <= maxSize);

  useEffect(() => {
    setShouldLoadAudio(shouldAutoLoad);
  }, [shouldAutoLoad]);

  // Auto-download placeholder
  if (!shouldLoadAudio) {
    return (
      <div className="flex items-center justify-center w-64 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
        <button
          onClick={() => setShouldLoadAudio(true)}
          className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          <Download className="w-6 h-6 text-gray-400 dark:text-gray-500" />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
              Voice Message ({fileSizeInMB.toFixed(1)} MB)
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Tap to download</p>
          </div>
        </button>
      </div>
    );
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !shouldLoadAudio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [shouldLoadAudio]);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg max-w-xs">
      {shouldLoadAudio && <audio ref={audioRef} src={audioUrl} preload="metadata" />}
      
      <button
        onClick={togglePlayback}
        className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </button>

      <div className="flex-1">
        <div className="relative h-1 bg-gray-200 dark:bg-gray-600 rounded-full mb-1">
          <div
            className="absolute h-full bg-blue-500 rounded-full transition-all duration-100"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="text-xs text-gray-400 dark:text-gray-500">
        🎵
      </div>
    </div>
  );
};

export default VoiceMessage;