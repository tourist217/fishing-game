export const TEA_PRICES = [50, 550, 1400, 3000, 5000];
export const SANDWICH_PRICES = [100, 700, 2200, 4000, 7000];
export const MAX_DAILY_PROVISION_BUYS = 5;
export const GEMS_ENERGY_DRINK_COST = 20; // 20 кристаллов за полный бак 100 энергии

export interface ProvisionItemConfig {
  id: 'tea' | 'sandwich';
  name: string;
  icon: string;
  energyBonus: number;
  description: string;
}

export const PROVISION_CONFIGS: Record<'tea' | 'sandwich', ProvisionItemConfig> = {
  tea: {
    id: 'tea',
    name: 'Чай из термоса',
    icon: '☕',
    energyBonus: 25,
    description: 'Горячий травяной чай. Восстанавливает +25 энергии (5 забросов).',
  },
  sandwich: {
    id: 'sandwich',
    name: 'Бутерброд с ветчиной',
    icon: '🥪',
    energyBonus: 50,
    description: 'Сытный перекус рыбака. Восстанавливает +50 энергии (10 забросов).',
  },
};

export interface DailyProvisionsState {
  date: string;
  teaBoughtCount: number;
  sandwichBoughtCount: number;
}

export function getProvisionPrice(id: 'tea' | 'sandwich', boughtCount: number): number | null {
  const ladder = id === 'tea' ? TEA_PRICES : SANDWICH_PRICES;
  if (boughtCount >= ladder.length) {
    return null; // Дневной лимит 5 покупок исчерпан
  }
  return ladder[boughtCount];
}
