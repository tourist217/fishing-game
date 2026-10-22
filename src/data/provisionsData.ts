export interface ProvisionItem {
  id: 'tea' | 'sandwich';
  name: string;
  icon: string;
  price: number;
  energyBonus: number;
  description: string;
}

export const PROVISIONS: ProvisionItem[] = [
  {
    id: 'tea',
    name: 'Чай из термоса',
    icon: '☕',
    price: 45,
    energyBonus: 25,
    description: 'Горячий травяной чай. Согревает и возвращает силы на 5 забросов (+25 ⚡).',
  },
  {
    id: 'sandwich',
    name: 'Бутерброд с ветчиной',
    icon: '🥪',
    price: 80,
    energyBonus: 50,
    description: 'Сытный перекус рыбака. Снимает усталость и даёт силы на 10 забросов (+50 ⚡).',
  },
];
