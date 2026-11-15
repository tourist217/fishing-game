import React, { useState } from 'react';
import { GemIcon } from './GemIcon';
import { getPlayerIdentity } from '../firebase';

interface GemsShopModalProps {
  onClose: () => void;
  gems: number;
  onAddTestGems?: (amount: number) => void;
  onAddGems?: (amount: number) => void;
}

export const GemsShopModal: React.FC<GemsShopModalProps> = ({
  onClose,
  gems,
  onAddTestGems,
  onAddGems,
}) => {
  const [starsNotice, setStarsNotice] = useState<string | null>(null);
  const [loadingPackId, setLoadingPackId] = useState<string | null>(null);
  const [hasClaimedTestGems, setHasClaimedTestGems] = useState<boolean>(() => {
    return localStorage.getItem('fg_claimed_test_gems') === 'true';
  });

  // Автоматическая проверка и восстановление покупок Stars при открытии
  React.useEffect(() => {
    const identity = getPlayerIdentity();
    if (identity?.id && !identity.id.startsWith('local_')) {
      fetch(`/api/sync-gems?userId=${identity.id}`)
        .then((r) => r.json())
        .then((res) => {
          if (res?.ok && typeof res.gems === 'number' && res.totalPaidGems > 0 && res.gems > gems) {
            const diff = res.gems - gems;
            onAddGems?.(diff);
            setStarsNotice(`✨ Ваши купленные алмазы (+${diff} 💎) успешно восстановлены!`);
          }
        })
        .catch((e) => console.warn('Auto-sync gems check error:', e));
    }
  }, []);

  const handleClaimTestGems = () => {
    if (hasClaimedTestGems || !onAddTestGems) return;
    onAddTestGems(50);
    setHasClaimedTestGems(true);
    localStorage.setItem('fg_claimed_test_gems', 'true');
  };

  const handleBuyWithStars = async (packId: string, packGems: number, starsPrice: number) => {
    const tg = window.Telegram?.WebApp;
    if (!tg || typeof (tg as any).openInvoice !== 'function') {
      setStarsNotice(`⭐ Оплата за Stars (${starsPrice} ⭐ за ${packGems} 💎) работает внутри официального приложения Telegram.`);
      return;
    }

    setLoadingPackId(packId);
    setStarsNotice(`Подготовка счёта Telegram Stars (${starsPrice} ⭐)...`);

    try {
      const identity = getPlayerIdentity();
      const res = await fetch('/api/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: packId,
          userId: identity.id,
        }),
      });

      const data = await res.json();
      if (!data.ok || !data.invoiceLink) {
        throw new Error(data.error || 'Не удалось сформировать платёж');
      }

      setStarsNotice(null);

      // Открываем защищенное нативное окно оплаты Telegram Stars
      (tg as any).openInvoice(data.invoiceLink, async (status: string) => {
        if (status === 'paid') {
          setStarsNotice(`🎉 Оплата прошла успешно! +${packGems} 💎 зачислены на ваш баланс.`);
          onAddGems?.(packGems);

          // Запасная серверная синхронизация
          try {
            await fetch(`/api/sync-gems?userId=${identity.id}`);
          } catch (e) {
            console.warn('Sync gems error:', e);
          }
        } else if (status === 'cancelled') {
          setStarsNotice('Оплата отменена.');
        } else if (status === 'failed') {
          setStarsNotice('⚠️ Ошибка при проведении платежа.');
        }
      });
    } catch (err: any) {
      setStarsNotice(`⚠️ ${err?.message || 'Ошибка связи с сервером'}`);
    } finally {
      setLoadingPackId(null);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        userSelect: 'none',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(180deg, #0f172a 0%, #090d16 100%)',
          borderRadius: '26px',
          border: '1.5px solid rgba(56, 189, 248, 0.35)',
          padding: '22px',
          width: '100%',
          maxWidth: '360px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 0 35px rgba(2, 132, 199, 0.3), 0 20px 40px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {/* Заголовок с балансом */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(2, 132, 199, 0.15) 100%)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GemIcon size={24} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 900, color: '#ffffff' }}>
                Магазин Алмазов
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                Премиальная валюта игры
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1.5px solid rgba(56, 189, 248, 0.45)',
              borderRadius: '16px',
              padding: '6px 12px',
              boxShadow: '0 0 12px rgba(56, 189, 248, 0.2)',
            }}
          >
            <GemIcon size={18} />
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#38bdf8' }}>
              {gems.toLocaleString('ru-RU')}
            </span>
          </div>
        </div>

        {/* Уведомление про Stars */}
        {starsNotice && (
          <div
            style={{
              background: 'rgba(234, 179, 8, 0.15)',
              border: '1px solid rgba(234, 179, 8, 0.4)',
              borderRadius: '14px',
              padding: '10px 12px',
              fontSize: '11px',
              color: '#fef08a',
              lineHeight: 1.4,
            }}
          >
            {starsNotice}
          </div>
        )}

        {/* Наборы Telegram Stars */}
        <div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 800,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <span>⭐ Наборы за Telegram Stars</span>
            <span
              style={{
                fontSize: '9px',
                padding: '2px 6px',
                borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.2)',
                color: '#fbbf24',
                fontWeight: 900,
              }}
            >
              ОФИЦИАЛЬНО
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { id: 'pack_50', gems: 50, stars: 25, label: 'Горсть алмазов', badge: null },
              { id: 'pack_150', gems: 150, stars: 70, label: 'Мешочек кристаллов', badge: '+20% БОНУС' },
              { id: 'pack_500', gems: 500, stars: 200, label: 'Сундук старателя', badge: 'ХИТ 🔥' },
              { id: 'pack_1200', gems: 1200, stars: 450, label: 'Сокровищница озера', badge: '+50% МАКС' },
            ].map((pack) => {
              const isLoading = loadingPackId === pack.id;
              return (
                <div
                  key={pack.id}
                  onClick={() => !isLoading && handleBuyWithStars(pack.id, pack.gems, pack.stars)}
                  style={{
                    background: 'rgba(30, 41, 59, 0.65)',
                    border: pack.badge ? '1.5px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: isLoading ? 'wait' : 'pointer',
                    opacity: isLoading ? 0.7 : 1,
                    transition: 'transform 0.1s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <GemIcon size={24} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 900, color: '#ffffff' }}>
                          +{pack.gems} 💎
                        </span>
                        {pack.badge && (
                          <span
                            style={{
                              fontSize: '9px',
                              fontWeight: 900,
                              color: '#38bdf8',
                              background: 'rgba(56, 189, 248, 0.18)',
                              padding: '2px 6px',
                              borderRadius: '6px',
                            }}
                          >
                            {pack.badge}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {pack.label}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      border: '1px solid #fde68a',
                      borderRadius: '12px',
                      padding: '6px 12px',
                      color: '#ffffff',
                      fontWeight: 900,
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
                    }}
                  >
                    <span>{isLoading ? '⏳' : pack.stars}</span>
                    <span>⭐</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Как получить бесплатно в игре */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '12px',
          }}
        >
          <div
            style={{
              fontSize: '11.5px',
              fontWeight: 800,
              color: '#38bdf8',
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
              marginBottom: '8px',
            }}
          >
            🎣 Бесплатные способы добычи:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: '#cbd5e1', lineHeight: 1.4 }}>
            <div>
              <strong style={{ color: '#fde047' }}>• Ловля трофеев:</strong> Каждая трофейная рыба при продаже в садке даёт <span style={{ color: '#38bdf8', fontWeight: 800 }}>+5 💎</span>!
            </div>
            <div>
              <strong style={{ color: '#4ade80' }}>• Заказы Егеря:</strong> Ежедневные квесты и суточный бонус приносят алмазы каждый день.
            </div>
            <div>
              <strong style={{ color: '#c084fc' }}>• Журнал рыбака:</strong> Закрывайте виды и трофеи для получения крупных наград (до 100 💎).
            </div>
          </div>
        </div>

        {/* Кнопка быстрого тест-пополнения для разработчика/тестировщика */}
        {onAddTestGems && (
          <button
            onClick={handleClaimTestGems}
            disabled={hasClaimedTestGems}
            style={{
              background: hasClaimedTestGems ? 'rgba(255, 255, 255, 0.04)' : 'rgba(56, 189, 248, 0.12)',
              border: hasClaimedTestGems ? '1px solid rgba(255, 255, 255, 0.1)' : '1px dashed rgba(56, 189, 248, 0.45)',
              borderRadius: '14px',
              padding: '9px',
              color: hasClaimedTestGems ? '#64748b' : '#38bdf8',
              fontWeight: 800,
              fontSize: '12px',
              cursor: hasClaimedTestGems ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>
              {hasClaimedTestGems ? '✓ Тестовый бонус уже получен (1 раз)' : '+50 💎 (Тестовый бонус — 1 раз)'}
            </span>
          </button>
        )}

        {/* Кнопка закрыть */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '13px',
            padding: '11px',
            borderRadius: '14px',
            cursor: 'pointer',
          }}
        >
          Закрыть
        </button>
      </div>
    </div>
  );
};
