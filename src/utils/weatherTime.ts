// Система времени суток и погоды с глобальной 15-минутной синхронизацией

export type TimeOfDay = 'morning' | 'day' | 'evening' | 'night';
export type WeatherType = 'clear' | 'fog' | 'overcast' | 'rain';

export interface TimeConfig {
  id: TimeOfDay;
  label: string;
  icon: string;
  description: string;
}

export interface WeatherConfig {
  id: WeatherType;
  label: string;
  icon: string;
  description: string;
}

export const TIME_CONFIGS: Record<TimeOfDay, TimeConfig> = {
  morning: {
    id: 'morning',
    label: 'Утро',
    icon: '🌅',
    description: 'Утренняя зорька, прохладный туман над водой',
  },
  day: {
    id: 'day',
    label: 'День',
    icon: '☀️',
    description: 'Солнечный зенит, тёплая прогретая вода',
  },
  evening: {
    id: 'evening',
    label: 'Вечер',
    icon: '🌆',
    description: 'Закатные сумерки, всплески хищников у берега',
  },
  night: {
    id: 'night',
    label: 'Ночь',
    icon: '🌙',
    description: 'Звёздная тишина, глубоководная ночная охота',
  },
};

export const WEATHER_CONFIGS: Record<WeatherType, WeatherConfig> = {
  clear: {
    id: 'clear',
    label: 'Ясно',
    icon: '☀️',
    description: 'Ясное небо и штиль, рыба на мелководье',
  },
  fog: {
    id: 'fog',
    label: 'Туман',
    icon: '🌫️',
    description: 'Густая дымка над плёсом, отличный клёв судака и леща',
  },
  overcast: {
    id: 'overcast',
    label: 'Пасмурно',
    icon: '☁️',
    description: 'Серое затянутое небо, щука и окунь выходят на охоту',
  },
  rain: {
    id: 'rain',
    label: 'Дождь',
    icon: '🌧️',
    description: 'Тёплые капли и рябь на воде, активность сома и хищников',
  },
};

/**
 * Определение текущего времени суток (15 минут на период, ровно 60 минут на цикл):
 * 00..14 мин: Утро
 * 15..29 мин: День
 * 30..44 мин: Вечер
 * 45..59 мин: Ночь
 */
export function getCurrentTimeOfDay(date: Date = new Date()): TimeOfDay {
  const minutes = date.getMinutes();
  if (minutes < 15) return 'morning';
  if (minutes < 30) return 'day';
  if (minutes < 45) return 'evening';
  return 'night';
}

/**
 * Псевдослучайный генератор погоды по дате и номеру 15-минутного интервала в сутках (0..95).
 * Гарантирует абсолютную одинаковость погоды у всех игроков в мире в любой момент.
 */
function getSlotIndex(date: Date): number {
  return date.getHours() * 4 + Math.floor(date.getMinutes() / 15);
}



export function getWeatherForSlot(_slotIndex: number, _dateStr: string): WeatherType {
  // По запросу: только ясная погода, без дождя и тумана
  return 'clear';
}

export function getCurrentWeather(date: Date = new Date()): {
  timeOfDay: TimeOfDay;
  weather: WeatherType;
  slotIndex: number;
} {
  const timeOfDay = getCurrentTimeOfDay(date);
  const slotIndex = getSlotIndex(date);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  const weather = getWeatherForSlot(slotIndex, dateStr);

  return { timeOfDay, weather, slotIndex };
}

/**
 * Получить прогноз на следующие N 15-минутных периодов
 */
export function getWeatherForecast(count: number = 4): Array<{
  timeLabel: string;
  timeOfDay: TimeOfDay;
  weather: WeatherType;
  startsInMinutes: number;
}> {
  const now = new Date();
  const currentSlot = getSlotIndex(now);
  const minutesInCurrentSlot = now.getMinutes() % 15;
  const minutesUntilNext = 15 - minutesInCurrentSlot;

  const timesOrder: TimeOfDay[] = ['morning', 'day', 'evening', 'night'];
  const currentTimeIdx = timesOrder.indexOf(getCurrentTimeOfDay(now));

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  const forecast = [];
  for (let i = 1; i <= count; i++) {
    const nextSlot = (currentSlot + i) % 96;
    const nextTime = timesOrder[(currentTimeIdx + i) % 4];
    const nextWeather = getWeatherForSlot(nextSlot, dateStr);
    const startsIn = minutesUntilNext + (i - 1) * 15;

    forecast.push({
      timeLabel: TIME_CONFIGS[nextTime].label,
      timeOfDay: nextTime,
      weather: nextWeather,
      startsInMinutes: startsIn,
    });
  }

  return forecast;
}
