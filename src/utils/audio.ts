// Генерация звуковых эффектов через Web Audio API (работает мгновенно без загрузки внешних mp3)
export function playTrophyFanfare() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Торжественные аккорды победных фанфар (До - Ми - Соль - Верхнее До)
    const notes = [
      { freq: 523.25, time: 0.0, dur: 0.14 },   // C5
      { freq: 659.25, time: 0.14, dur: 0.14 },  // E5
      { freq: 783.99, time: 0.28, dur: 0.18 },  // G5
      { freq: 1046.5, time: 0.46, dur: 0.75 },  // C6 (финальный звонкий аккорд)
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

      // Плавная атака и затухание
      gain.gain.setValueAtTime(0.001, ctx.currentTime + time);
      gain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + dur);
    });

    // Перезвон золотых монет и блеска
    const coinPitches = [1600, 1950, 2300, 2700];
    coinPitches.forEach((freq, idx) => {
      const delay = 0.48 + idx * 0.1;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

      gain.gain.setValueAtTime(0.18, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.28);
    });
  } catch {
    // Безопасный игнор ограничений автовоспроизведения в некоторых браузерах
  }
}
