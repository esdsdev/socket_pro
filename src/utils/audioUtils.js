// Audio utilities for sound alerts
class AudioManager {
  constructor() {
    this.sounds = new Map();
    this.preloadSounds();
  }

  preloadSounds() {
    const soundFiles = [
      { name: 'message', path: '/sounds/message-notification.mp3' },
      { name: 'call', path: '/sounds/call-ringtone.mp3' },
      { name: 'typing', path: '/sounds/typing.mp3' }
    ];

    soundFiles.forEach(({ name, path }) => {
      const audio = new Audio(path);
      audio.preload = 'auto';
      this.sounds.set(name, audio);
    });
  }

  async playSoundAlert(soundName = 'message', volume = 0.5) {
    try {
      const audio = this.sounds.get(soundName);
      if (!audio) {
        console.warn(`Sound '${soundName}' not found`);
        return;
      }

      audio.volume = Math.max(0, Math.min(1, volume));
      audio.currentTime = 0; // Reset to beginning
      await audio.play();
    } catch (error) {
      console.warn('Could not play sound:', error);
    }
  }

  setVolume(soundName, volume) {
    const audio = this.sounds.get(soundName);
    if (audio) {
      audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  stopSound(soundName) {
    const audio = this.sounds.get(soundName);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  stopAllSounds() {
    this.sounds.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }
}

export const audioManager = new AudioManager();

export const playSoundAlert = (soundName, volume) => {
  return audioManager.playSoundAlert(soundName, volume);
};