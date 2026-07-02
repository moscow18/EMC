export const playNotificationSound = (soundType = 'double_beep', volume = 0.5) => {
  if (typeof window === 'undefined') return;
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playTone = (freq: number, startTime: number, duration: number, type: OscillatorType = 'sine') => {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = type;
      oscillator.frequency.value = freq;
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.95, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    if (soundType === 'double_beep') {
      playTone(880, audioCtx.currentTime, 0.2);
      playTone(1200, audioCtx.currentTime + 0.1, 0.25);
    } else if (soundType === 'soft_chime') {
      // Beautiful harmonic chord
      const now = audioCtx.currentTime;
      playTone(523.25, now, 1.2);
      playTone(659.25, now + 0.05, 1.2);
      playTone(783.99, now + 0.1, 1.4);
    } else if (soundType === 'alert_bell') {
      // Rapid bell ring
      const now = audioCtx.currentTime;
      for (let i = 0; i < 6; i++) {
        const time = now + i * 0.08;
        playTone(i % 2 === 0 ? 800 : 1000, time, 0.08, 'triangle');
      }
    } else if (soundType === 'digital_ring') {
      // Fast rising tones
      const now = audioCtx.currentTime;
      playTone(600, now, 0.08, 'square');
      playTone(800, now + 0.08, 0.08, 'square');
      playTone(1000, now + 0.16, 0.15, 'square');
    }
  } catch (e) {
    console.error('Web Audio API error:', e);
  }
};
