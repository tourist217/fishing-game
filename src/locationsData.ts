export interface FishingLocation {
  id: string;
  name: string;
  icon: string;
  levelReq: number;
  description: string;
  weightModifier: number; // множитель веса рыбы на этом водоёме
  gradient: string;       // атмосферный градиент фона
  accentColor: string;
}

export const LOCATIONS: FishingLocation[] = [
  {
    id: 'old_pond',
    name: 'Старый пруд',
    icon: '🌾',
    levelReq: 1,
    description: 'Небольшой тихий пруд за деревней. Идеальное место для новичков с простой удочкой.',
    weightModifier: 1.0,
    gradient: 'linear-gradient(180deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    accentColor: '#38bdf8',
  },
  {
    id: 'forest_lake',
    name: 'Лесное озеро',
    icon: '🌲',
    levelReq: 2,
    description: 'Глубокий водоем в окружении сосен. Здесь рыба сытнее и нагуливает больший вес.',
    weightModifier: 1.3,
    gradient: 'linear-gradient(180deg, #0b1d14 0%, #163826 50%, #1e4d35 100%)',
    accentColor: '#4ade80',
  },
  {
    id: 'river_backwater',
    name: 'Речная заводь',
    icon: '🌊',
    levelReq: 3,
    description: 'Тихий залив полноводной реки. Течение приносит крупную рыбу, требуется прочная снасть.',
    weightModifier: 1.7,
    gradient: 'linear-gradient(180deg, #0a192f 0%, #172a45 50%, #1f4068 100%)',
    accentColor: '#818cf8',
  },
];

export const DEFAULT_LOCATION_ID = 'old_pond';