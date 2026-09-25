interface TelegramWebApp {
  HapticFeedback?: {
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    selectionChanged: () => void;
  };
  ready: () => void;
  expand: () => void;
  initDataUnsafe?: { user?: { first_name?: string } };
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export {};
