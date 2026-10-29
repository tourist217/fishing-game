import React, { useEffect, useRef } from 'react';
import type { FishingLocation } from '../locationsData';
import type { GameState } from './FishingScreen';

import {
  type TimeOfDay,
  type WeatherType,
  getCurrentWeather,
  TIME_CONFIGS,
  WEATHER_CONFIGS,
} from '../utils/weatherTime';

interface FishingSceneCanvasProps {
  location: FishingLocation;
  gameState: GameState;
  tension: number; // 0..100
  catchProgress?: number; // 0..100
  rodMaterial?: string;
  onCastComplete?: () => void;
  timeOfDay?: TimeOfDay;
  weather?: WeatherType;
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
  catchProgress = 0,
  rodMaterial = 'reed',
  timeOfDay: propTimeOfDay,
  weather: propWeather,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentEnv = getCurrentWeather();
  const effectiveTime = propTimeOfDay || currentEnv.timeOfDay;
  const effectiveWeather = propWeather || currentEnv.weather;

  // Рефы для непрерывного Canvas-цикла без сброса таймера анимаций
  const locationRef = useRef(location);
  useEffect(() => { locationRef.current = location; }, [location]);

  const gameStateRef = useRef(gameState);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  const tensionRef = useRef(tension);
  useEffect(() => { tensionRef.current = tension; }, [tension]);

  const catchProgressRef = useRef(catchProgress);
  useEffect(() => { catchProgressRef.current = catchProgress; }, [catchProgress]);

  const lerpedCatchProgressRef = useRef(0);
  const hookedStartTimeRef = useRef<number>(Date.now());

  const rodMaterialRef = useRef(rodMaterial);
  useEffect(() => { rodMaterialRef.current = rodMaterial; }, [rodMaterial]);

  const effectiveTimeRef = useRef(effectiveTime);
  useEffect(() => { effectiveTimeRef.current = effectiveTime; }, [effectiveTime]);

  const effectiveWeatherRef = useRef(effectiveWeather);
  useEffect(() => { effectiveWeatherRef.current = effectiveWeather; }, [effectiveWeather]);

  // Позиция заброса и прогресс полета поплавка (в рефах, не вызывает лишних ре-рендеров)
  const castTargetRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.65 });
  const castProgressRef = useRef<number>(1);
  const crankAngleRef = useRef<number>(0);

  // Генерируем новую случайную точку при переходе в заброс (waiting/hooked)
  useEffect(() => {
    if (gameState === 'waiting') {
      // Случайная точка на поверхности воды (по X: 35-65%, по Y: 58-72%)
      const rx = 0.35 + Math.random() * 0.3;
      const ry = 0.58 + Math.random() * 0.14;
      castTargetRef.current = { x: rx, y: ry };
      castProgressRef.current = 0; // Стартуем анимацию полета
      lerpedCatchProgressRef.current = 0;
    } else if (gameState === 'hooked') {
      hookedStartTimeRef.current = Date.now();
    } else if (gameState === 'idle') {
      castProgressRef.current = 1;
      lerpedCatchProgressRef.current = 0;
    }
  }, [gameState]);

  // Главный 2D Canvas цикл отрисовки — работает непрерывно на 60 FPS
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const startTime = Date.now();

    const render = () => {
      const time = (Date.now() - startTime) / 1000;
      const width = canvas.width;
      const height = canvas.height;

      // Плавное продвижение полета поплавка при забросе (внутри Canvas-цикла)
      if (castProgressRef.current < 1) {
        castProgressRef.current = Math.min(1, castProgressRef.current + 0.035);
      }
      const curCastProgress = castProgressRef.current;
      const curCastTarget = castTargetRef.current;
      const curGameState = gameStateRef.current;
      const curTension = tensionRef.current;
      const curLocation = locationRef.current;
      const curTime = effectiveTimeRef.current;
      const curWeather = effectiveWeatherRef.current;
      const curRodMaterial = rodMaterialRef.current;

      const LOCATION_BG_MAP: Record<string, string> = {
        loc_village_pond: '/assets/locations/loc_village_pond_base.jpg',
        loc_old_oxbow: '/assets/locations/loc_old_oxbow.jpg',
        loc_forest_lake: '/assets/locations/loc_forest_lake.jpg',
        loc_quiet_river: '/assets/locations/loc_quiet_river.jpg',
        loc_beaver_backwater: '/assets/locations/loc_beaver_backwater.jpg',
        loc_wide_reach: '/assets/locations/loc_wide_reach.jpg',
        loc_reservoir: '/assets/locations/loc_reservoir.jpg',
      };

      const bgSrc = curLocation.image || LOCATION_BG_MAP[curLocation.id];
      const photoImg = bgSrc
        ? getPreloadedImage(bgSrc) || (curLocation.id === 'loc_village_pond' ? getPreloadedImage('/assets/locations/loc_village_pond_dawn.jpg') : null)
        : null;

      if (photoImg) {
        // Отрисовка без искажения пропорций (object-fit: cover)
        drawImageCover(ctx, photoImg, width, height);

          // Динамическое наложение освещения по времени суток на единое фоновое изображение
          if (curTime === 'morning') {
            // Утро: теплая золотисто-розовая утренняя дымка и рассвет
            ctx.fillStyle = 'rgba(251, 191, 36, 0.16)';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = 'rgba(244, 114, 182, 0.08)';
            ctx.fillRect(0, 0, width, height);
          } else if (curTime === 'day') {
            // День: нежный естественный свет
            ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
            ctx.fillRect(0, 0, width, height);
          } else if (curTime === 'evening') {
            // Вечер: заходящий закатный пурпурно-оранжевый оттенок
            ctx.fillStyle = 'rgba(168, 63, 81, 0.28)';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = 'rgba(242, 142, 43, 0.16)';
            ctx.fillRect(0, 0, width, height);
          } else if (curTime === 'night') {
            // Ночь: глубокое синее ночное освещение
            ctx.fillStyle = 'rgba(5, 12, 28, 0.82)';
            ctx.fillRect(0, 0, width, height);

            // Звезды ночью
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
          drawSky(ctx, width, height, curTime, curLocation);
          drawBackgroundScenery(ctx, width, height, curTime, curLocation);
          drawWaterSurface(ctx, width, height, height * 0.48, curTime, curLocation, time);
        }

      // 3.5. Отрисовка погодных эффектов на холсте (дождь с каплями и кругами, туман, пасмурно, солнце)
      drawWeatherEffects(ctx, width, height, curWeather, time);

      // 4. Позиция поплавка и точки входа лески на экране
      const targetX = width * curCastTarget.x;
      const targetY = height * curCastTarget.y;

      let floatX = targetX;
      let floatY = targetY;
      let floatTilt = 0;
      let waterLineOffset = 0;
      let isBobberVisible = true;
      let lineWaterX = targetX;
      let lineWaterY = targetY;

      if (curCastProgress < 1) {
        // Полет поплавка по дуге при забросе
        const startX = width * 0.85;
        const startY = height * 0.8;
        const arcY = Math.sin(curCastProgress * Math.PI) * 120;
        floatX = startX + (targetX - startX) * curCastProgress;
        floatY = startY + (targetY - startY) * curCastProgress - arcY;
        lineWaterX = floatX;
        lineWaterY = floatY;
      } else if (curGameState === 'reeling') {
        // === ВЫВАЖИВАНИЕ: ПОПЛАВОК ПОД ВОДОЙ, ЛЕСКА ТЯНЕТСЯ К БЕРЕГУ ===
        isBobberVisible = false;

        const targetProgress = catchProgressRef.current;
        lerpedCatchProgressRef.current += (targetProgress - lerpedCatchProgressRef.current) * 0.08;
        const p = Math.max(0, Math.min(1, lerpedCatchProgressRef.current / 100));

        // Точка у мостков/берега (внизу экрана)
        const shoreX = width * 0.52;
        const shoreY = height * 0.92;

        const baseX = targetX + (shoreX - targetX) * p;
        const baseY = targetY + (shoreY - targetY) * p;

        // Сопротивление рыбы: виляние из стороны в сторону (уменьшается у самого берега)
        const fightAmplitude = (1 - p * 0.65) * 26;
        const lateralSway = Math.sin(time * 5.5) * fightAmplitude;
        const verticalSway = Math.cos(time * 7.0) * 3;

        lineWaterX = baseX + lateralSway;
        lineWaterY = baseY + verticalSway;

        // Отрисовка бурунов и подводного анатомического силуэта рыбы
        drawReelingWaterEffects(ctx, lineWaterX, lineWaterY, time, curTension, p, shoreX, shoreY);
      } else if (curGameState === 'hooked') {
        // === РЕАЛИСТИЧНАЯ ПОКЛЁВКА (ПРИТОПЫ, ВЫКЛАДЫВАНИЕ, УТОП С НАКЛОНОМ) ===
        const hookedAge = (Date.now() - hookedStartTimeRef.current) / 1000;
        const cycle = hookedAge % 2.2;
        let biteDip = 0;
        let biteTilt = 0;
        let rippleIntensity = 1;

        if (cycle < 0.45) {
          // 1. Первый осторожный притоп
          const p = Math.sin((cycle / 0.45) * Math.PI);
          biteDip = p * 6;
          biteTilt = p * 0.12;
          rippleIntensity = 1.3;
        } else if (cycle < 0.75) {
          // 2. Пауза
          biteDip = 0;
          biteTilt = 0;
        } else if (cycle < 1.25) {
          // 3. Второй уверенный притоп
          const p = Math.sin(((cycle - 0.75) / 0.5) * Math.PI);
          biteDip = p * 10;
          biteTilt = -p * 0.18;
          rippleIntensity = 1.7;
        } else if (cycle < 1.5) {
          // 4. Выкладывание (подъём)
          const p = Math.sin(((cycle - 1.25) / 0.25) * Math.PI);
          biteDip = -p * 3;
          biteTilt = p * 0.08;
        } else {
          // 5. Решительный утоп
          const p = (cycle - 1.5) / 0.7;
          const easeP = Math.sin(p * Math.PI * 0.5);
          biteDip = 12 + easeP * 8;
          biteTilt = 0.35 + Math.sin(time * 8) * 0.08;
          rippleIntensity = 2.4;
        }

        floatX = targetX + Math.sin(time * 3) * 2;
        floatY = targetY + Math.sin(time * 2.5) * 2;
        waterLineOffset = biteDip;
        floatTilt = biteTilt;
        lineWaterX = floatX;
        lineWaterY = floatY + biteDip;

        drawWaterRipples(ctx, targetX, targetY + 6, time, 'hooked', rippleIntensity);
      } else {
        // === ПОКОЙ (ОЖИДАНИЕ / WAITING): МЯГКОЕ ПОКАЧИВАНИЕ НА ВОЛНАХ ===
        const waveBob = Math.sin(time * 2.5) * 2.5;
        floatX = targetX + Math.sin(time * 1.5) * 1.5;
        floatY = targetY + waveBob;
        floatTilt = Math.sin(time * 1.8) * 0.05;
        lineWaterX = floatX;
        lineWaterY = floatY;

        if (curCastProgress >= 1 && curGameState !== 'idle') {
          drawWaterRipples(ctx, targetX, targetY + 6, time, 'waiting', 1);
        }
      }

      // 6. Вычисление Изгиба Удочки (Bending Rod)
      const rodBaseX = width * 0.92;
      const rodBaseY = height + 10;

      // Спокойное положение вершинки
      let rodTipTargetX = width * 0.72;
      let rodTipTargetY = height * 0.45;

      // Изгиб от натяжения лески в процессе вываживания
      const bendFactor = curGameState === 'reeling' ? Math.max(0, curTension / 100) : 0;
      const rodTipX = rodTipTargetX - bendFactor * 70;
      const rodTipY = rodTipTargetY + bendFactor * 110;

      // Анимация вращения катушки при подмотке лески
      if (curGameState === 'reeling') {
        crankAngleRef.current += 0.28 + (curTension / 100) * 0.22;
      }

      // 7. Отрисовка Лески (Line)
      if (curGameState !== 'idle') {
        drawFishingLine(ctx, rodTipX, rodTipY, lineWaterX, lineWaterY, bendFactor, curGameState, curTension, time);
      }

      // 8. Отрисовка Поплавка
      if (curGameState !== 'idle' && isBobberVisible) {
        drawFloat(ctx, floatX, floatY, curTime, floatTilt, waterLineOffset);
      }

      // 9. Отрисовка Удилища (Rod)
      drawRod(ctx, rodBaseX, rodBaseY, rodTipX, rodTipY, bendFactor, curRodMaterial, crankAngleRef.current);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

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
      
      {/* Метка текущего времени суток и погоды */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '14px',
          background: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          borderRadius: '12px',
          padding: '5px 10px',
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
          pointerEvents: 'none',
        }}
      >
        <span>{TIME_CONFIGS[effectiveTime]?.icon || '🌅'}</span>
        <span>{TIME_CONFIGS[effectiveTime]?.label || 'Утро'}</span>
        <span style={{ opacity: 0.4, margin: '0 1px' }}>•</span>
        <span style={{ fontSize: '14px' }}>
          {WEATHER_CONFIGS[effectiveWeather]?.icon || '☀️'}
        </span>
      </div>
    </div>
  );
};

// --- ВСПОМОГАТЕЛЬНЫЕ РИСОВАЛКИ Canvas 2D ---

function drawWeatherEffects(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  _weather: WeatherType,
  _time: number
) {
  // По запросу: туман и дождь полностью отключены, всегда ясная погода с мягким солнечным светом
  ctx.save();
  const sunGlow = ctx.createRadialGradient(
    width * 0.3,
    height * 0.18,
    10,
    width * 0.3,
    height * 0.18,
    width * 0.65
  );
  sunGlow.addColorStop(0, 'rgba(255, 245, 210, 0.14)');
  sunGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = sunGlow;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function drawSky(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  timeOfDay: TimeOfDay,
  location: FishingLocation
) {
  const grad = ctx.createLinearGradient(0, 0, 0, h * 0.55);

  if (timeOfDay === 'morning') {
    grad.addColorStop(0, '#2d1b4e');
    grad.addColorStop(0.4, '#8a3b68');
    grad.addColorStop(0.8, '#d9776f');
    grad.addColorStop(1, location.accentColor || '#f6bd60');
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
  gameState: GameState,
  intensity: number = 1
) {
  const expandSpeed = gameState === 'hooked' ? 3.5 * Math.min(1.8, intensity) : 2;
  const numRipples = gameState === 'hooked' ? 3 : 2;

  for (let i = 0; i < numRipples; i++) {
    const phase = (time * expandSpeed + i * 0.8) % 2.5;
    const radiusX = (phase * 16 + 4) * Math.min(1.8, intensity);
    const radiusY = radiusX * 0.4;
    const alpha = Math.max(0, 1 - phase / 2.5) * (gameState === 'hooked' ? 0.7 : 0.35);

    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = 1.4;
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
  tiltAngle: number = 0,
  waterLineOffset: number = 0
) {
  ctx.save();
  ctx.translate(fx, fy + waterLineOffset);
  if (tiltAngle !== 0) {
    ctx.rotate(tiltAngle);
  }

  // 1. Подводная тень поплавка
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 10, 7, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Киль поплавка (под водой)
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.rect(-1.5, 0, 3, 14);
  ctx.fill();

  // 3. Реалистичное тело бальзового поплавка (каплевидная форма с бликом)
  const bodyGrad = ctx.createLinearGradient(-6, 0, 6, 0);
  bodyGrad.addColorStop(0, '#e2e8f0');
  bodyGrad.addColorStop(0.5, '#ffffff');
  bodyGrad.addColorStop(1, '#94a3b8');

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, -4, 6, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Красный воротничок тела
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.rect(-5.5, -9, 11, 5);
  ctx.fill();

  // 4. Реалистичная антенна поплавка (полосатая высокой видимости)
  ctx.fillStyle = '#facc15'; // жёлтая полоса
  ctx.beginPath();
  ctx.rect(-1.5, -20, 3, 11);
  ctx.fill();

  ctx.fillStyle = '#ef4444'; // красная верхушка
  ctx.beginPath();
  ctx.rect(-1.5, -20, 3, 5);
  ctx.fill();

  // Черные разделительные кольца на антенне
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-1.5, -15, 3, 1.5);

  // В ночное время: неоновый святящийся химический светлячок!
  if (timeOfDay === 'night') {
    ctx.fillStyle = '#22c55e';
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(0, -20, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}

function drawFishShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  length: number,
  width: number,
  time: number,
  progress: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Динамическое виляние хвоста рыбы (активное сопротивление вываживанию)
  const wagPhase = time * 14;
  const tailWag = Math.sin(wagPhase) * (width * 0.65);
  const finFlutter = Math.sin(time * 11) * 2;
  const alpha = Math.min(0.74, 0.45 + progress * 0.28);

  // Мягкое подводное затемнение/глубина
  ctx.shadowColor = 'rgba(5, 18, 30, 0.55)';
  ctx.shadowBlur = 6;

  // 1. Парные грудные плавники (выступают по бокам тела)
  ctx.fillStyle = `rgba(10, 32, 48, ${alpha * 0.72})`;
  // Левый грудной плавник
  ctx.beginPath();
  ctx.moveTo(length * 0.12, -width * 0.44);
  ctx.quadraticCurveTo(length * 0.02, -width * 1.05 + finFlutter, -length * 0.06, -width * 0.42);
  ctx.closePath();
  ctx.fill();

  // Правый грудной плавник
  ctx.beginPath();
  ctx.moveTo(length * 0.12, width * 0.44);
  ctx.quadraticCurveTo(length * 0.02, width * 1.05 - finFlutter, -length * 0.06, width * 0.42);
  ctx.closePath();
  ctx.fill();

  // 2. Брюшные плавники
  ctx.beginPath();
  ctx.moveTo(-length * 0.12, -width * 0.38);
  ctx.quadraticCurveTo(-length * 0.18, -width * 0.72, -length * 0.24, -width * 0.34);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-length * 0.12, width * 0.38);
  ctx.quadraticCurveTo(-length * 0.18, width * 0.72, -length * 0.24, width * 0.34);
  ctx.closePath();
  ctx.fill();

  // 3. Анатомическое веретенообразное тело рыбы с изгибом к хвосту
  ctx.fillStyle = `rgba(8, 24, 38, ${alpha})`;
  ctx.beginPath();
  // Нос (пасть) рыбы
  ctx.moveTo(length * 0.48, 0);

  // Верхний контур (жабры -> спина -> хвостовой стебель)
  ctx.bezierCurveTo(
    length * 0.35, -width * 0.4,
    length * 0.12, -width * 0.52,
    -length * 0.05, -width * 0.48
  );
  ctx.bezierCurveTo(
    -length * 0.22, -width * 0.38,
    -length * 0.36, -width * 0.18 + tailWag * 0.4,
    -length * 0.42, tailWag * 0.6
  );

  // Хвостовой плавник (настоящий раздвоенный хвост рыбы)
  // Верхняя лопасть
  ctx.lineTo(-length * 0.62, -width * 0.62 + tailWag);
  // Выемка хвоста
  ctx.quadraticCurveTo(-length * 0.53, tailWag * 0.8, -length * 0.62, width * 0.62 + tailWag);
  // Нижняя лопасть
  ctx.lineTo(-length * 0.42, tailWag * 0.6);

  // Нижний контур (хвостовой стебель -> брюхо -> горло -> пасть)
  ctx.bezierCurveTo(
    -length * 0.36, width * 0.18 + tailWag * 0.4,
    -length * 0.22, width * 0.38,
    -length * 0.05, width * 0.48
  );
  ctx.bezierCurveTo(
    length * 0.12, width * 0.52,
    length * 0.35, width * 0.4,
    length * 0.48, 0
  );

  ctx.closePath();
  ctx.fill();

  // 4. Тёмный хребет вдоль спины
  ctx.shadowBlur = 0;
  ctx.strokeStyle = `rgba(3, 12, 20, ${alpha * 0.85})`;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(length * 0.38, 0);
  ctx.quadraticCurveTo(0, tailWag * 0.25, -length * 0.38, tailWag * 0.6);
  ctx.stroke();

  // 5. Тонкий водный блик по спине рыбы
  ctx.strokeStyle = `rgba(210, 235, 255, ${0.16 + progress * 0.12})`;
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(length * 0.32, -width * 0.1);
  ctx.quadraticCurveTo(length * 0.05, -width * 0.12, -length * 0.18, tailWag * 0.2 - width * 0.06);
  ctx.stroke();

  ctx.restore();
}

function drawReelingWaterEffects(
  ctx: CanvasRenderingContext2D,
  wx: number,
  wy: number,
  time: number,
  _tension: number,
  progress: number,
  shoreX: number,
  shoreY: number
) {
  ctx.save();

  // 1. Расчёт ориентации рыбы к берегу и бокового виляния при борьбе
  const dx = shoreX - wx;
  const dy = shoreY - wy;
  const angleToShore = Math.atan2(dy, dx);
  const swayAngle = Math.cos(time * 5.5) * 0.32;
  const fishAngle = angleToShore + swayAngle;

  // Размеры рыбы (плавно увеличиваются по мере приближения к берегу и поверхности)
  const fishLength = 34 + progress * 14;
  const fishWidth = 11 + progress * 5;

  // Смещение центра рыбы так, чтобы пасть находилась точно у точки входа лески (wx, wy)
  const headOffset = fishLength * 0.38;
  const fishCenterX = wx - Math.cos(fishAngle) * headOffset;
  const fishCenterY = wy - Math.sin(fishAngle) * headOffset;

  // Отрисовка реалистичного силуэта рыбы
  drawFishShadow(ctx, fishCenterX, fishCenterY, fishAngle, fishLength, fishWidth, time, progress);

  // 2. Кильватерный след (V-образная волна от подтягивания рыбы к берегу)
  const wakeCount = 3;
  for (let i = 0; i < wakeCount; i++) {
    const phase = (time * 3.2 + i * 0.7) % 2.0;
    const spread = phase * 16 + 4;
    const alpha = Math.max(0, 1 - phase / 2.0) * 0.65;

    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = 1.3;

    // Левый и правый усик V-волны
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.lineTo(wx - spread * 1.3, wy - spread * 0.6);
    ctx.moveTo(wx, wy);
    ctx.lineTo(wx + spread * 1.3, wy - spread * 0.6);
    ctx.stroke();

    // Овальный бурунчик
    ctx.beginPath();
    ctx.ellipse(wx, wy, spread * 0.8, spread * 0.35, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawFishingLine(
  ctx: CanvasRenderingContext2D,
  tx: number,
  ty: number,
  fx: number,
  fy: number,
  bendFactor: number,
  gameState: GameState,
  tension: number = 0,
  time: number = 0
) {
  if (gameState === 'reeling') {
    // Натянутая как струна леска с микро-вибрацией от натяжения
    const vibe = tension > 25 ? Math.sin(time * 70) * (tension / 100) * 1.5 : 0;
    const midX = (tx + fx) / 2 + vibe;
    const midY = (ty + fy) / 2;

    ctx.save();
    ctx.strokeStyle = tension > 80 ? 'rgba(254, 202, 202, 0.95)' : 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = tension > 70 ? 1.4 : 1.0;
    if (tension > 75) {
      ctx.shadowColor = 'rgba(239, 68, 68, 0.6)';
      ctx.shadowBlur = 6;
    }
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(midX, midY);
    ctx.lineTo(fx, fy);
    ctx.stroke();
    ctx.restore();
  } else {
    // Спокойная леска с естественным провисанием
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1;
    const midX = (tx + fx) / 2;
    const midY = (ty + fy) / 2 + (1 - bendFactor) * 22;

    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(midX, midY, fx, fy);
    ctx.stroke();
    ctx.restore();
  }
}

function drawRod(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  tx: number,
  ty: number,
  bendFactor: number,
  rodMaterial: string,
  crankAngle: number = 0
) {
  const rodImg = getPreloadedImage('/assets/ui/rod_fps.png');

  // Контрольная точка кривой изгиба удилища (Bending Rod Bezier)
  const ctrlX = bx - 60 - bendFactor * 55;
  const ctrlY = by - (by - ty) * 0.55;

  if (rodImg) {
    // Сегментная прорисовка изогнутого бланка из оригинального спрайта
    const segCount = 28;

    for (let i = 0; i < segCount; i++) {
      const t0 = i / segCount;
      const t1 = (i + 1) / segCount;
      const tMid = (t0 + t1) * 0.5;

      const p0X = Math.pow(1 - t0, 2) * bx + 2 * (1 - t0) * t0 * ctrlX + t0 * t0 * tx;
      const p0Y = Math.pow(1 - t0, 2) * by + 2 * (1 - t0) * t0 * ctrlY + t0 * t0 * ty;

      const p1X = Math.pow(1 - t1, 2) * bx + 2 * (1 - t1) * t1 * ctrlX + t1 * t1 * tx;
      const p1Y = Math.pow(1 - t1, 2) * by + 2 * (1 - t1) * t1 * ctrlY + t1 * t1 * ty;

      const segAngle = Math.atan2(p1Y - p0Y, p1X - p0X);
      const segDist = Math.hypot(p1X - p0X, p1Y - p0Y);

      // Срез вертикального спрайта (комель снизу, вершинка сверху)
      const srcY = rodImg.naturalHeight * (1 - t1);
      const srcH = rodImg.naturalHeight / segCount;

      ctx.save();
      ctx.translate(p0X, p0Y);
      ctx.rotate(segAngle - Math.PI / 2);

      // Коническое сужение бланка от комля к вершинке
      const scaleW = 0.22 * (1 - tMid * 0.45);
      const drawW = rodImg.naturalWidth * scaleW;

      ctx.drawImage(
        rodImg,
        0, srcY, rodImg.naturalWidth, srcH,
        -drawW * 0.5, 0, drawW, segDist + 1
      );
      ctx.restore();
    }

    // Анимированная ручка катушки (вращение при подмотке)
    const reelT = 0.12; // Позиция катушки у основания бланка
    const reelX = Math.pow(1 - reelT, 2) * bx + 2 * (1 - reelT) * reelT * ctrlX + reelT * reelT * tx;
    const reelY = Math.pow(1 - reelT, 2) * by + 2 * (1 - reelT) * reelT * ctrlY + reelT * reelT * ty;

    ctx.save();
    ctx.translate(reelX - 8, reelY - 4);

    const crankRadius = 14;
    const knobX = Math.cos(crankAngle) * crankRadius;
    const knobY = Math.sin(crankAngle) * crankRadius * 0.65; // Эллиптическая 3D перспектива вращения

    // Рычаг катушки
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(knobX, knobY);
    ctx.stroke();

    // Ось вращения
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    // Кноб (рукоять катушки)
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.ellipse(knobX, knobY, 4.5, 3, crankAngle, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
    return;
  }

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
