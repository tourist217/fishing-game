import { useEffect, useState } from 'react';

// Описываем тип пользователя Telegram
interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

export default function App() {
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    // Проверяем, запущено ли приложение внутри Telegram
    const tg = (window as any).Telegram?.WebApp;

    if (tg) {
      // Сообщаем Telegram, что приложение загрузилось
      tg.ready();
      // Раскрываем приложение на максимум экрана
      tg.expand();

      // Получаем данные игрока, если они доступны
      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user);
      }
    }
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '20px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      }}
    >
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎣</div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
        Рыбалка Онлайн
      </h1>
      <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '24px' }}>
        {user ? `Привет, ${user.first_name}!` : 'Добро пожаловать, Рыбак!'}
      </p>

      <div
        style={{
          padding: '12px 20px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '14px',
          color: '#38bdf8',
        }}
      >
        Telegram SDK успешно подключен
      </div>
    </div>
  );
}