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
  // 1. Базовая ширина зелёной зоны зависит от массы рыбы
  let baseWidth = 55;

  if (weightKg < 0.1) {
    baseWidth = 60;
  } else if (weightKg < 0.25) {
    baseWidth = 50;
  } else if (weightKg < 0.5) {
    baseWidth = 45;
  } else if (weightKg < 1.0) {
    baseWidth = 40;
  } else if (weightKg < 2.5) {
    baseWidth = 35;
  } else if (weightKg < 5.0) {
    baseWidth = 30;
  } else if (weightKg < 10.0) {
    baseWidth = 25;
  } else if (weightKg < 20.0) {
    baseWidth = 20;
  } else {
    baseWidth = 15;
  }

  // 2. Влияние прочности снасти на ширину зоны и рывки (принцип слабого звена: удочка + леска)
  const rodLimit = rodStrengthKg > 0 ? rodStrengthKg : 0.25;
  const lineLimit = lineTensileKg > 0 ? lineTensileKg : 0.4;
  // Леска отдельно от удочки не работает: нагрузку определяет самое слабое звено снасти
  const gearLimit = Math.min(rodLimit, lineLimit);

  const loadRatio = weightKg / gearLimit;

  let widthMultiplier = 1.0;
  let finalIntervalMs = 1500;

  if (loadRatio < 0.35) {
    widthMultiplier = 1.25;
    finalIntervalMs = 1800; // Спокойная рыба под мощную снасть
  } else if (loadRatio <= 0.70) {
    widthMultiplier = 1.0;
    finalIntervalMs = 1500;
  } else if (loadRatio <= 0.95) {
    widthMultiplier = 0.80;
    finalIntervalMs = 1300;
  } else if (loadRatio <= 1.20) {
    // Небольшой перегруз снасти (на 10-20% выше предела)
    widthMultiplier = 0.48;
    finalIntervalMs = 950;
  } else if (loadRatio <= 1.50) {
    // Существенный перегруз снасти (на 20-50% выше предела)
    widthMultiplier = 0.28;
    finalIntervalMs = 750;
  } else {
    // Экстремальный перегруз снасти (> 1.5x) - например 4.4 кг на 2.5 кг удочку
    widthMultiplier = 0.16;
    finalIntervalMs = 550; // Зона мечется каждые 0.55 сек, рыба яростно бьётся
  }

  // Бонус заточки крючка: при перегрузе снасти крючок не может бесконечно расширять зону
  const maxSharpenBonus = loadRatio > 1.5 ? 2 : loadRatio > 1.0 ? 3 : 8;
  const sharpenBonus = Math.min(hookSharpenLevel * 2, maxSharpenBonus);

  // Минимальная ширина зоны: при перегрузе зона становится ооочень маленькой (6-8%)
  const minAllowedWidth = loadRatio > 1.5 ? 7 : loadRatio > 1.0 ? 10 : 15;

  const finalWidth = Math.max(
    minAllowedWidth,
    Math.min(65, Math.round(baseWidth * widthMultiplier + sharpenBonus))
  );

  return {
    zoneWidth: finalWidth,
    jerkIntervalMs: finalIntervalMs,
    loadRatio,
  };
}

