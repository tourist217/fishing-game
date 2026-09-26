import React, { useEffect, useRef, useState } from 'react';
import type { FishingLocation } from '../locationsData';
import type { GameState } from './FishingScreen';

export type TimeOfDay = 'dawn' | 'morning' | 'day' | 'evening' | 'night';

export function getTimeOfDay(date: Date = new Date()): TimeOfDay {
  const hour = date.getHours();
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'day';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

interface FishingSceneCanvasProps {
  location: FishingLocation;
  gameState: GameState;
  tension: number; // 0..100
  rodMaterial?: string;
  onCastComplete?: () => void;
}

const bgImages: Record<string, HTMLImageElement> = {};

function getPreloadedImage(src: string): HTMLImageElement | null {
  if (!bgImages[src]) {
    const img = new Image();
    img.src = src;
    bgImages[src] = img;
  }
  return bgImages[src].complete && bgImages[src].naturalWidth > 0 ? bgImages[src] : null;
}

function drawImageCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, width: number, height: number) {
  const imgRatio = img.width / img.height;
  const canvasRatio = width / height;
  let renderW = width;
  let renderH = height;
  let offsetX = 0;
  let offsetY = 0;

  if (imgRatio > canvasRatio) {
    renderW = height * imgRatio;
    offsetX = (width - renderW) / 2;
  } else {
    renderH = width / imgRatio;
    offsetY = (height - renderH) / 2;
  }

  ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
}

export const FishingSceneCanvas: React.FC<FishingSceneCanvasProps> = ({
  location,
  gameState,
  tension,
  rodMaterial = 'reed',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timeOfDay = getTimeOfDay();

  // Состояние позиции заброса поплавка для текущего каста
  const [castTarget, setCastTarget] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.65 });
  const [castProgress, setCastProgress] = useState<number>(1); // 0 -> 1 при забросе

  // Генерируем новую случайную точку при переходе в заброс (waiting/hooked)
  useEffect(() => {
    if (gameState === 'waiting') {
      // Случайная точка на поверхности воды (по X: 35-65%, по Y: 58-72%)
      const rx = 0.35 + Math.random() * 0.3;
      const ry = 0.58 + Math.random() * 0.14;
      setCastTarget({ x: rx, y: ry });
      setCastProgress(0); // Стартуем анимацию полета
    } else if (gameState === 'idle') {
      setCastProgress(1);
    }
  }, [gameState]);

  // Аниматор заброса
  useEffect(() => {
    if (castProgress < 1 && gameState !== 'idle') {
      const timer = requestAnimationFrame(() => {
        setCastProgress((prev) => Math.min(1, prev + 0.04));
      });
      return () => cancelAnimationFrame(timer);
    }
  }, [castProgress, gameState]);

  // Главный 2D Canvas цикл отрисовки
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let startTime = Date.now();

    const render = () => {
      const time = (Date.now() - startTime) / 1000;
      const width = canvas.width;
      const height = canvas.height;

      const isVillagePond = location.id === 'loc_village_pond';

      if (isVillagePond) {
        // Единое базовое изображение фонового водоема
        const bgSrc = '/assets/locations/loc_village_pond_base.jpg';
        let photoImg = getPreloadedImage(bgSrc);
        if (!photoImg) {
          photoImg = getPreloadedImage('/assets/locations/loc_village_pond_dawn.jpg');
        }

        if (photoImg) {
          // Отрисовка без искажения пропорций (object-fit: cover)
          drawImageCover(ctx, photoImg, width, height);

          // Динамическое наложение освещения по времени суток на единое фоновое изображение
          if (timeOfDay === 'dawn') {
            // Зорька: теплая золотисто-розовая утренняя дымка
            ctx.fillStyle = 'rgba(246, 189, 96, 0.22)';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = 'rgba(217, 119, 111, 0.15)';
            ctx.fillRect(0, 0, width, height);
          } else if (timeOfDay === 'morning') {
            // Утро: нежный естественный свет
            ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
            ctx.fillRect(0, 0, width, height);
          } else if (timeOfDay === 'evening') {
            // Вечер: заходящий закатный пурпурно-оранжевый оттенок
            ctx.fillStyle = 'rgba(168, 63, 81, 0.32)';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = 'rgba(242, 142, 43, 0.18)';
            ctx.fillRect(0, 0, width, height);
          } else if (timeOfDay === 'night') {
            // Ночь: глубокое синее ночное освещение
            ctx.fillStyle = 'rgba(5, 12, 28, 0.82)';
            ctx.fillRect(0, 0, width, height);

            // Звезды и Луна ночью
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            for (let i = 0; i < 30; i++) {
              const sx = (Math.sin(i * 99) * 0.5 + 0.5) * width;
              const sy = (Math.cos(i * 33) * 0.5 + 0.5) * (height * 0.35);
              ctx.beginPath();
              ctx.arc(sx, sy, i % 3 === 0 ? 1.5 : 1, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        } else {
          drawSky(ctx, width, height, timeOfDay, location);
          drawBackgroundScenery(ctx, width, height, timeOfDay, location);
          drawWaterSurface(ctx, width, height, height * 0.48, timeOfDay, location, time);
        }
      } else {
        drawSky(ctx, width, height, timeOfDay, location);
        drawWaterSurface(ctx, width, height, height * 0.48, timeOfDay, location, time);
      }

      // 4. Позиция поплавка на экране
      const targetX = width * castTarget.x;
      const targetY = height * castTarget.y;

      let floatX = targetX;
      let floatY = targetY;

      if (castProgress < 1) {
        // Полет поплавка по дуге (заброс)
        const startX = width * 0.85;
        const startY = height * 0.8;
        const arcY = Math.sin(castProgress * Math.PI) * 120;
        floatX = startX + (targetX - startX) * castProgress;
        floatY = startY + (targetY - startY) * castProgress - arcY;
      } else {
        // Покачивание на волнах в покое или рывки при поклевке/вываживании
        const waveBob = Math.sin(time * 2.5) * 3;
        let biteShake = 0;
        if (gameState === 'hooked') {
          biteShake = (Math.random() - 0.5) * 8 + Math.sin(time * 15) * 6; // Быстрая поклёвка
        } else if (gameState === 'reeling') {
          biteShake = Math.sin(time * 8) * (tension * 0.08); // Рывки при тяге
        }
        floatY += waveBob + biteShake;
      }

      // 5. Отрисовка Рипплов (Кругов на воде)
      if (castProgress >= 1 && gameState !== 'idle') {
        drawWaterRipples(ctx, floatX, floatY + 6, time, gameState);
      }

      // 6. Вычисление Изгиба Удочки (Bending Rod)
      const rodBaseX = width * 0.92;
      const rodBaseY = height + 10;

      // Спокойное положение вершинки
      let rodTipTargetX = width * 0.72;
      let rodTipTargetY = height * 0.45;

      // Изгиб от натяжения лески в процессе вываживания
      const bendFactor = gameState === 'reeling' ? Math.max(0, tension / 100) : 0;
      const rodTipX = rodTipTargetX - bendFactor * 70;
      const rodTipY = rodTipTargetY + bendFactor * 110;

      // 7. Отрисовка Лески (Line)
      if (gameState !== 'idle') {
        drawFishingLine(ctx, rodTipX, rodTipY, floatX, floatY, bendFactor, gameState);
      }

      // 8. Отрисовка Поплавка
      if (gameState !== 'idle') {
        drawFloat(ctx, floatX, floatY, timeOfDay, gameState);
      }

      // 9. Отрисовка Удилища (Rod)
      drawRod(ctx, rodBaseX, rodBaseY, rodTipX, rodTipY, bendFactor, rodMaterial);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [location, gameState, tension, rodMaterial, timeOfDay, castTarget, castProgress]);

  // Автоматический ресайз холста под реальный размер родительского контейнера
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          borderRadius: '20px',
        }}
      />
      
      {/* Метка текущего времени суток */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '14px',
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '10px',
          padding: '4px 10px',
          fontSize: '11px',
          fontWeight: 'bold',
          color: '#e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          pointerEvents: 'none',
        }}
      >
        <span>{getTimeOfDayBadge(timeOfDay).icon}</span>
        <span>{getTimeOfDayBadge(timeOfDay).label}</span>
      </div>
    </div>
  );
};

// --- ВСПОМОГАТЕЛЬНЫЕ РИСОВАЛКИ Canvas 2D ---

function getTimeOfDayBadge(timeOfDay: TimeOfDay) {
  switch (timeOfDay) {
    case 'dawn': return { label: 'Зорька (Рассвет)', icon: '🌅' };
    case 'morning': return { label: 'Утро', icon: '☀️' };
    case 'day': return { label: 'Обед (День)', icon: '🌤️' };
    case 'evening': return { label: 'Вечер (Закат)', icon: '🌆' };
    case 'night': default: return { label: 'Ночь', icon: '🌙' };
  }
}

function drawSky(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  timeOfDay: TimeOfDay,
  location: FishingLocation
) {
  const grad = ctx.createLinearGradient(0, 0, 0, h * 0.55);

  if (timeOfDay === 'dawn') {
    grad.addColorStop(0, '#2d1b4e');
    grad.addColorStop(0.4, '#8a3b68');
    grad.addColorStop(0.8, '#d9776f');
    grad.addColorStop(1, location.accentColor || '#f6bd60');
  } else if (timeOfDay === 'morning') {
    grad.addColorStop(0, '#1a5b8c');
    grad.addColorStop(0.5, '#3891c8');
    grad.addColorStop(1, '#8bd3dd');
  } else if (timeOfDay === 'day') {
    grad.addColorStop(0, '#0f4c81');
    grad.addColorStop(0.6, '#2589bd');
    grad.addColorStop(1, '#70c1b3');
  } else if (timeOfDay === 'evening') {
    grad.addColorStop(0, '#1f1a3a');
    grad.addColorStop(0.35, '#5c2557');
    grad.addColorStop(0.7, '#a83f51');
    grad.addColorStop(1, '#f28e2b');
  } else {
    // Night
    grad.addColorStop(0, '#050b14');
    grad.addColorStop(0.6, '#0a1628');
    grad.addColorStop(1, '#112239');
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Ночные звезды и луна
  if (timeOfDay === 'night') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 35; i++) {
      const sx = (Math.sin(i * 99) * 0.5 + 0.5) * w;
      const sy = (Math.cos(i * 33) * 0.5 + 0.5) * (h * 0.4);
      ctx.beginPath();
      ctx.arc(sx, sy, (i % 3 === 0 ? 1.5 : 1), 0, Math.PI * 2);
      ctx.fill();
    }

    // Луна
    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = 'rgba(254, 240, 138, 0.6)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(w * 0.8, h * 0.15, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function drawBackgroundScenery(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  timeOfDay: TimeOfDay,
  location: FishingLocation
) {
  const horizonY = h * 0.48;

  // Силуэты деревьев и холмов на дальнем плане с легким акцентом цветности локации
  ctx.fillStyle = timeOfDay === 'night' ? '#08121e' : location.accentColor ? `${location.accentColor}40` : 'rgba(15, 32, 25, 0.7)';
  ctx.beginPath();
  ctx.moveTo(0, horizonY);

  for (let x = 0; x <= w; x += 25) {
    const treeH = Math.sin(x * 0.05) * 18 + Math.cos(x * 0.02) * 24 + 15;
    ctx.lineTo(x, horizonY - treeH);
  }
  ctx.lineTo(w, horizonY);
  ctx.closePath();
  ctx.fill();
}

function drawWaterSurface(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  waterY: number,
  timeOfDay: TimeOfDay,
  location: FishingLocation,
  time: number
) {
  const waterGrad = ctx.createLinearGradient(0, waterY, 0, h);

  if (timeOfDay === 'night') {
    waterGrad.addColorStop(0, '#091829');
    waterGrad.addColorStop(0.5, '#06111f');
    waterGrad.addColorStop(1, '#030811');
  } else if (timeOfDay === 'evening') {
    waterGrad.addColorStop(0, '#3a1f28');
    waterGrad.addColorStop(0.5, '#1e1c2b');
    waterGrad.addColorStop(1, '#0d101d');
  } else {
    waterGrad.addColorStop(0, '#0e3a31');
    waterGrad.addColorStop(0.5, '#0b2a24');
    waterGrad.addColorStop(1, '#051814');
  }

  ctx.fillStyle = waterGrad;
  ctx.fillRect(0, waterY, w, h - waterY);

  // Анимированные солнечные/лунные блики и рябь на воде
  ctx.strokeStyle = timeOfDay === 'night' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 1;

  for (let y = waterY + 12; y < h; y += 14) {
    const speed = (y - waterY) * 0.03 + 1.2;
    ctx.beginPath();
    for (let x = 0; x < w; x += 30) {
      const waveOffset = Math.sin(x * 0.03 + time * speed) * 3;
      if (x === 0) ctx.moveTo(x, y + waveOffset);
      else ctx.lineTo(x, y + waveOffset);
    }
    ctx.stroke();
  }

  // Реалистичные кувшинки и камыши у берегов Деревенского Пруда
  if (location.id === 'loc_village_pond') {
    drawVillagePondFlora(ctx, w, h, waterY, time);
  }
}

// Отрисовка кувшинок, цветков и рогоза (камышей) у берега
function drawVillagePondFlora(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  waterY: number,
  time: number
) {
  // 1. Листья кувшинок слева
  const lilyPads = [
    { x: w * 0.12, y: waterY + 45, rx: 22, ry: 11, angle: 0.2 },
    { x: w * 0.18, y: waterY + 60, rx: 18, ry: 9, angle: -0.1 },
    { x: w * 0.25, y: waterY + 35, rx: 15, ry: 8, angle: 0.4 },
    { x: w * 0.08, y: waterY + 80, rx: 26, ry: 13, angle: -0.3 },
  ];

  lilyPads.forEach((pad) => {
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.ellipse(pad.x, pad.y, pad.rx, pad.ry, pad.angle, 0, Math.PI * 1.85);
    ctx.lineTo(pad.x, pad.y);
    ctx.closePath();
    ctx.fill();

    // Прожилка листа кувшинки
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.x, pad.y);
    ctx.lineTo(pad.x + pad.rx * 0.6, pad.y - pad.ry * 0.4);
    ctx.stroke();
  });

  // Желтый цветок кувшинки
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(w * 0.18 + Math.sin(time) * 0.5, waterY + 56, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(w * 0.18 + Math.sin(time) * 0.5, waterY + 56, 2, 0, Math.PI * 2);
  ctx.fill();

  // 2. Стелибья камышей и початков рогоза справа
  const reeds = [
    { x: w * 0.88, h: 75, sway: Math.sin(time * 1.2) * 3 },
    { x: w * 0.91, h: 90, sway: Math.cos(time * 1.1) * 4 },
    { x: w * 0.94, h: 65, sway: Math.sin(time * 1.4) * 2 },
    { x: w * 0.97, h: 80, sway: Math.cos(time * 1.3) * 3 },
  ];

  reeds.forEach((r) => {
    // Стебель
    ctx.strokeStyle = '#166534';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(r.x, h);
    ctx.quadraticCurveTo(r.x, h - r.h * 0.5, r.x + r.sway, h - r.h);
    ctx.stroke();

    // Коричневый початок рогоза (камыш)
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.ellipse(r.x + r.sway, h - r.h + 12, 3.5, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawWaterRipples(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  time: number,
  gameState: GameState
) {
  const expandSpeed = gameState === 'hooked' ? 4 : 2;
  const numRipples = gameState === 'hooked' ? 3 : 2;

  for (let i = 0; i < numRipples; i++) {
    const phase = (time * expandSpeed + i * 0.8) % 2.5;
    const radiusX = phase * 18 + 4;
    const radiusY = radiusX * 0.4;
    const alpha = Math.max(0, 1 - phase / 2.5) * (gameState === 'hooked' ? 0.7 : 0.35);

    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawFloat(
  ctx: CanvasRenderingContext2D,
  fx: number,
  fy: number,
  timeOfDay: TimeOfDay,
  gameState: GameState
) {
  const isDipped = gameState === 'hooked';
  const drawY = isDipped ? fy + 8 : fy;

  // 1. Подводная тень поплавка
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.ellipse(fx, drawY + 10, 7, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Киль поплавка (градиентный темно-серый под водой)
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.rect(fx - 1.5, drawY, 3, 14);
  ctx.fill();

  // 3. Реалистичное тело бальзового поплавка (каплевидная форма с бликом)
  const bodyGrad = ctx.createLinearGradient(fx - 6, drawY, fx + 6, drawY);
  bodyGrad.addColorStop(0, '#e2e8f0');
  bodyGrad.addColorStop(0.5, '#ffffff');
  bodyGrad.addColorStop(1, '#94a3b8');

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(fx, drawY - 4, 6, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Красный воротничок тела
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.rect(fx - 5.5, drawY - 9, 11, 5);
  ctx.fill();

  // 4. Реалистичная антенна поплавка (полосатая высокой видимости)
  ctx.fillStyle = '#facc15'; // жёлтая полоса
  ctx.beginPath();
  ctx.rect(fx - 1.5, drawY - 20, 3, 11);
  ctx.fill();

  ctx.fillStyle = '#ef4444'; // красная верхушка
  ctx.beginPath();
  ctx.rect(fx - 1.5, drawY - 20, 3, 5);
  ctx.fill();

  // Черные разделительные кольца на антенне
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(fx - 1.5, drawY - 15, 3, 1.5);

  // В ночное время: неоновый святящийся химический светлячок!
  if (timeOfDay === 'night') {
    ctx.fillStyle = '#22c55e';
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(fx, drawY - 20, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function drawFishingLine(
  ctx: CanvasRenderingContext2D,
  tx: number,
  ty: number,
  fx: number,
  fy: number,
  bendFactor: number,
  gameState: GameState
) {
  ctx.strokeStyle = gameState === 'reeling' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 1;

  // Прогиб лески под собственным весом или натяжением
  const midX = (tx + fx) / 2;
  const midY = (ty + fy) / 2 + (1 - bendFactor) * 22;

  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.quadraticCurveTo(midX, midY, fx, fy);
  ctx.stroke();
}

function drawRod(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  tx: number,
  ty: number,
  bendFactor: number,
  rodMaterial: string
) {
  let mainColor = '#d4a373'; // reed / бамбук
  let nodeColor = '#78350f'; // узлы бамбука

  if (rodMaterial === 'bamboo') {
    mainColor = '#e9c46a';
    nodeColor = '#92400e';
  } else if (rodMaterial === 'plastic') {
    mainColor = '#0284c7';
    nodeColor = '#0369a1';
  } else if (rodMaterial === 'fiberglass') {
    mainColor = '#10b981';
    nodeColor = '#047857';
  } else if (rodMaterial === 'composite') {
    mainColor = '#ef4444';
    nodeColor = '#991b1b';
  } else if (rodMaterial === 'carbon') {
    mainColor = '#334155';
    nodeColor = '#0f172a';
  } else if (rodMaterial === 'gold') {
    mainColor = '#fbbf24';
    nodeColor = '#b45309';
  }

  // Контрольная точка кривой изгиба удилища (Bending Rod Bezier)
  const ctrlX = bx - 60 - bendFactor * 40;
  const ctrlY = by - (by - ty) * 0.5;

  // 1. Отрисовка бланка удочки (сужающаяся линия от комеля к верхушке)
  ctx.strokeStyle = mainColor;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.quadraticCurveTo(ctrlX, ctrlY, tx, ty);
  ctx.stroke();

  // 2. Прорисовка узлов/сочленений колен бамбука/удочки (Nodes/Rings)
  ctx.strokeStyle = nodeColor;
  ctx.lineWidth = 3;
  for (let t = 0.2; t <= 0.8; t += 0.2) {
    const nx = Math.pow(1 - t, 2) * bx + 2 * (1 - t) * t * ctrlX + t * t * tx;
    const ny = Math.pow(1 - t, 2) * by + 2 * (1 - t) * t * ctrlY + t * t * ty;
    ctx.beginPath();
    ctx.arc(nx, ny, 4, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 3. Пропускные кольца (Line Guides) вдоль бланка
  for (let t = 0.3; t <= 0.9; t += 0.3) {
    const gx = Math.pow(1 - t, 2) * bx + 2 * (1 - t) * t * ctrlX + t * t * tx;
    const gy = Math.pow(1 - t, 2) * by + 2 * (1 - t) * t * ctrlY + t * t * ty;
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(gx - 2, gy - 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Тюльпан (вершинное кольцо удочки)
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(tx, ty, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 5. Пробковая рукоять (Cork Handle) у комеля внизу справа
  ctx.fillStyle = '#d4a373';
  ctx.strokeStyle = '#a16207';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(bx - 12, by - 40, 24, 50, 6);
  ctx.fill();
  ctx.stroke();
}
