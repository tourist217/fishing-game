import type { FishSizeCategory } from '../fishData';

export const formatWeight = (kg: number): string => {
  if (kg < 1) {
    return `${Math.round(kg * 1000)} г`;
  }
  return `${kg.toFixed(2)} кг`;
};

export const getCategoryBadgeStyle = (category?: FishSizeCategory) => {
  switch (category) {
    case 'trophy':
      return {
        text: '🏆 ТРОФЕЙ',
        color: '#fbbf24',
        bg: 'rgba(251, 191, 36, 0.15)',
        border: '1px solid rgba(251, 191, 36, 0.5)',
      };
    case 'large':
      return {
        text: 'Крупная',
        color: '#a855f7',
        bg: 'rgba(168, 85, 247, 0.12)',
        border: '1px solid rgba(168, 85, 247, 0.35)',
      };
    case 'medium':
      return {
        text: 'Средняя',
        color: '#38bdf8',
        bg: 'rgba(56, 189, 248, 0.1)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
      };
    case 'small':
    default:
      return {
        text: 'Мелкая',
        color: '#94a3b8',
        bg: 'rgba(148, 163, 184, 0.1)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
      };
  }
};

export interface FishDifficultyConfig {
  zoneWidth: number;
  jerkIntervalMs: number;
  loadRatio: number;
}

export function getFishDifficultyConfig(
  weightKg: number,
  rodStrengthKg: number,
  lineTensileKg: number,
  hookSharpenLevel: number = 0
): FishDifficultyConfig {
  // 1. Базовые параметры по массе рыбы
  let baseWidth = 55;
  let jerkIntervalMs = 0; // 0 = зона статична (рыбы до 100 г)

  if (weightKg < 0.1) {
    baseWidth = 60;
    jerkIntervalMs = 1200;
  } else if (weightKg < 0.25) {
    baseWidth = 50;
    jerkIntervalMs = 1000;
  } else if (weightKg < 0.5) {
    baseWidth = 45;
    jerkIntervalMs = 850;
  } else if (weightKg < 1.0) {
    baseWidth = 40;
    jerkIntervalMs = 700;
  } else if (weightKg < 2.5) {
    baseWidth = 35;
    jerkIntervalMs = 580;
  } else if (weightKg < 5.0) {
    baseWidth = 30;
    jerkIntervalMs = 480;
  } else if (weightKg < 10.0) {
    baseWidth = 25;
    jerkIntervalMs = 400;
  } else if (weightKg < 20.0) {
    baseWidth = 20;
    jerkIntervalMs = 340;
  } else {
    baseWidth = 15;
    jerkIntervalMs = 280;
  }

  // 2. Определение запаса прочности снасти
  const rodLimit = rodStrengthKg > 0 ? rodStrengthKg : 0.25;
  const lineLimit = lineTensileKg > 0 ? lineTensileKg : 0.4;
  const gearLimit = Math.min(rodLimit, lineLimit);

  const loadRatio = weightKg / gearLimit;

  let widthMultiplier = 1.0;
  let intervalMultiplier = 1.0;

  if (loadRatio < 0.35) {
    widthMultiplier = 1.2;
    intervalMultiplier = 1.35;
  } else if (loadRatio <= 0.65) {
    widthMultiplier = 1.0;
    intervalMultiplier = 1.0;
  } else if (loadRatio <= 0.85) {
    widthMultiplier = 0.82;
    intervalMultiplier = 0.8;
  } else {
    widthMultiplier = 0.65;
    intervalMultiplier = 0.6;
  }

  const sharpenBonus = hookSharpenLevel * 3;

  const finalWidth = Math.max(
    14,
    Math.min(65, Math.round(baseWidth * widthMultiplier + sharpenBonus))
  );

  const finalIntervalMs =
    jerkIntervalMs > 0
      ? Math.max(350, Math.round(jerkIntervalMs * intervalMultiplier))
      : 0;

  return {
    zoneWidth: finalWidth,
    jerkIntervalMs: finalIntervalMs,
    loadRatio,
  };
}

