export interface Rod {
  id: string;
  name: string;
  icon: string;
  price: number;
  levelReq: number;
  sweetSpotBonus: number;
  goldBonus: number;
}

export const RODS: Rod[] = [
  {
    id: 'bamboo',
    name: 'Бамбуковая удочка',
    icon: '🎋',
    price: 0,
    levelReq: 1,
    sweetSpotBonus: 0,
    goldBonus: 1.0,
  },
  {
    id: 'fiberglass',
    name: 'Стеклопластик Pro',
    icon: '🎣',
    price: 150,
    levelReq: 2,
    sweetSpotBonus: 8,
    goldBonus: 1.25,
  },
  {
    id: 'carbon',
    name: 'Карбоновый спиннинг',
    icon: '⚡',
    price: 500,
    levelReq: 4,
    sweetSpotBonus: 16,
    goldBonus: 1.6,
  },
  {
    id: 'titanium',
    name: 'Титановый Титан-X',
    icon: '🔱',
    price: 1500,
    levelReq: 7,
    sweetSpotBonus: 25,
    goldBonus: 2.2,
  },
];