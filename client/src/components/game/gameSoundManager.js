const SOUND_FILES = {
  bgm: '/audio/BGM.wav',
  damage: '/audio/damage.wav',
  laser: '/audio/laser_shot.wav',
  explosion: '/audio/explosion.wav',
};

let audioContext;
let masterGain;
let bgmAudio;
let audioUnlocked = false;
let gameplayMusicEnabled = false;

const getContext = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContextClass();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.16;
    masterGain.connect(audioContext.destination);
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  return audioContext;
};

const createAudio = (src, { loop = false, volume = 1, preload = 'auto' } = {}) => {
  if (typeof window === 'undefined') {
    return null;
  }

  const audio = new window.Audio(src);
  audio.preload = preload;
  audio.loop = loop;
  audio.volume = volume;
  return audio;
};

const getBgmAudio = () => {
  if (!bgmAudio) {
    bgmAudio = createAudio(SOUND_FILES.bgm, { loop: true, volume: 0.35, preload: 'metadata' });
  }

  return bgmAudio;
};

const syncGameplayMusic = () => {
  const bgm = getBgmAudio();
  if (!bgm) {
    return;
  }

  if (!audioUnlocked || !gameplayMusicEnabled) {
    bgm.pause();
    bgm.currentTime = 0;
    return;
  }

  const playPromise = bgm.play();
  if (playPromise?.catch) {
    playPromise.catch(() => {});
  }
};

const playBufferedSound = (src, { volume = 1, playbackRate = 1 } = {}) => {
  if (typeof window === 'undefined' || !audioUnlocked) {
    return;
  }

  const sound = createAudio(src, { volume });
  if (!sound) {
    return;
  }

  sound.playbackRate = playbackRate;
  const playPromise = sound.play();
  if (playPromise?.catch) {
    playPromise.catch(() => {});
  }
};

const envelopeGain = (context, destination, start, attack, decay, peak) => {
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(peak, start + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + attack + decay);
  gain.connect(destination);
  return gain;
};

const playTone = ({ type = 'sine', frequency = 440, endFrequency, attack = 0.01, decay = 0.12, gain = 0.08 }) => {
  const context = getContext();
  if (!context || !masterGain) {
    return;
  }

  const start = context.currentTime;
  const oscillator = context.createOscillator();
  const noteGain = envelopeGain(context, masterGain, start, attack, decay, gain);

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  if (endFrequency) {
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + attack + decay);
  }

  oscillator.connect(noteGain);
  oscillator.start(start);
  oscillator.stop(start + attack + decay + 0.02);
};

export const resumeGameAudio = () => {
  getContext();
  audioUnlocked = true;
  syncGameplayMusic();
};

export const setGameplayMusicEnabled = (enabled) => {
  gameplayMusicEnabled = enabled;
  syncGameplayMusic();
};

export const playLaserSound = () => {
  playBufferedSound(SOUND_FILES.laser, { volume: 0.42, playbackRate: 1 });
};

export const playEnemyDestroyedSound = () => {
  playBufferedSound(SOUND_FILES.explosion, { volume: 0.5, playbackRate: 1.04 });
};

export const playShipImpactSound = () => {
  playBufferedSound(SOUND_FILES.explosion, { volume: 0.48, playbackRate: 0.92 });
};

export const playDamageSound = () => {
  playBufferedSound(SOUND_FILES.damage, { volume: 0.5, playbackRate: 1 });
};

export const playUiConfirmSound = () => {
  playTone({ type: 'triangle', frequency: 540, endFrequency: 820, attack: 0.01, decay: 0.12, gain: 0.04 });
};

export const playMissionEndSound = (status) => {
  if (status === 'completed') {
    playBufferedSound(SOUND_FILES.explosion, { volume: 0.38, playbackRate: 0.92 });
    return;
  }

  playBufferedSound(SOUND_FILES.explosion, { volume: 0.44, playbackRate: 0.72 });
};
