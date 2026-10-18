export type HapticStyle =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'rigid'
  | 'soft'
  | 'impact'
  | 'success'
  | 'warning'
  | 'error'
  | 'notification'
  | 'selection';

// Базовый виброотклик Telegram WebApp с поддержкой Web API фоллбэка
export function triggerHaptic(style: HapticStyle) {
  const tg = (window as unknown as { Telegram?: { WebApp?: { HapticFeedback?: {
    impactOccurred: (s: string) => void;
    notificationOccurred: (s: string) => void;
    selectionChanged: () => void;
  } } } }).Telegram?.WebApp?.HapticFeedback;

  if (tg) {
    if (style === 'selection') {
      tg.selectionChanged();
    } else if (style === 'notification' || style === 'success') {
      tg.notificationOccurred('success');
    } else if (style === 'warning') {
      tg.notificationOccurred('warning');
    } else if (style === 'error') {
      tg.notificationOccurred('error');
    } else if (style === 'impact' || style === 'medium') {
      tg.impactOccurred('medium');
    } else if (style === 'light' || style === 'soft') {
      tg.impactOccurred('light');
    } else if (style === 'heavy') {
      tg.impactOccurred('heavy');
    } else if (style === 'rigid') {
      tg.impactOccurred('rigid');
    }
    return;
  }

  // Fallback для стандартных мобильных браузеров
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    const durations: Record<string, number[]> = {
      selection: [12],
      light: [25],
      soft: [20],
      medium: [45],
      impact: [45],
      heavy: [80],
      rigid: [65],
      notification: [35, 50, 35],
      success: [35, 50, 35],
      warning: [60, 50, 60],
      error: [90, 60, 90],
    };
    try {
      navigator.vibrate(durations[style] || [30]);
    } catch {
      // Игнорируем ограничения политик автоплея браузера
    }
  }
}

// Продвинутая вибрация, динамически зависящая от веса и размера рыбы
export function triggerFishHaptic(
  weight: number,
  sizeCategory?: string,
  event: 'hook' | 'jerk' | 'catch' = 'jerk'
) {
  const isTrophy = sizeCategory === 'trophy' || weight >= 6.5;
  const isLarge = sizeCategory === 'large' || (weight >= 2.5 && weight < 6.5);
  const isMedium = sizeCategory === 'medium' || (weight >= 0.8 && weight < 2.5);

  if (event === 'hook') {
    // Момент поклёвки (удар по поплавку/спиннингу)
    if (isTrophy) {
      triggerHaptic('heavy');
      setTimeout(() => triggerHaptic('rigid'), 90);
      setTimeout(() => triggerHaptic('heavy'), 200);
    } else if (isLarge) {
      triggerHaptic('heavy');
      setTimeout(() => triggerHaptic('medium'), 120);
    } else if (isMedium) {
      triggerHaptic('medium');
    } else {
      triggerHaptic('light');
    }
  } else if (event === 'jerk') {
    // Рывок рыбы во время вываживания
    if (isTrophy) {
      triggerHaptic('heavy');
    } else if (isLarge) {
      triggerHaptic('medium');
    } else if (isMedium) {
      triggerHaptic('light');
    } else {
      triggerHaptic('selection');
    }
  } else if (event === 'catch') {
    // Успешный вылов рыбы
    if (isTrophy) {
      // Торжественная победная серия импульсов для трофея
      triggerHaptic('success');
      setTimeout(() => triggerHaptic('heavy'), 110);
      setTimeout(() => triggerHaptic('rigid'), 240);
      setTimeout(() => triggerHaptic('heavy'), 400);
    } else if (isLarge) {
      triggerHaptic('success');
      setTimeout(() => triggerHaptic('medium'), 120);
    } else {
      triggerHaptic('success');
    }
  }
}
