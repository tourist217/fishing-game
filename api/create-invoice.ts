const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8855072906:AAFeiso-CDnzg60PHVz8Fd_cYnHvF2iPNqQ';

export const GEM_PACKAGES: Record<string, { id: string; gems: number; stars: number; title: string; description: string }> = {
  pack_50: {
    id: 'pack_50',
    gems: 50,
    stars: 25,
    title: '50 Алмазов',
    description: 'Горсть алмазов для рыбалки в Fishing Game',
  },
  pack_150: {
    id: 'pack_150',
    gems: 150,
    stars: 70,
    title: '150 Алмазов (+20% Бонус)',
    description: 'Мешочек кристаллов для рыбалки в Fishing Game',
  },
  pack_500: {
    id: 'pack_500',
    gems: 500,
    stars: 200,
    title: '500 Алмазов (Хит 🔥)',
    description: 'Сундук старателя для рыбалки в Fishing Game',
  },
  pack_1200: {
    id: 'pack_1200',
    gems: 1200,
    stars: 450,
    title: '1200 Алмазов (+50% Макс)',
    description: 'Сокровищница озера для рыбалки в Fishing Game',
  },
};

export default async function handler(req: any, res: any) {
  // CORS заголовки для локальной и веб-отладки
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { packageId, userId } = req.body || {};

    if (!packageId || !GEM_PACKAGES[packageId]) {
      return res.status(400).json({ error: 'Invalid packageId' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const pack = GEM_PACKAGES[packageId];

    // Компактный payload (строго до 128 байт для Telegram Bot API)
    const payload = JSON.stringify({
      u: String(userId),
      p: pack.id,
      g: pack.gems,
      s: pack.stars,
      t: Date.now(),
    });

    const telegramRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/createInvoiceLink`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: pack.title,
        description: pack.description,
        payload,
        provider_token: '', // Для Telegram Stars всегда пустая строка
        currency: 'XTR',
        prices: [
          {
            label: pack.title,
            amount: pack.stars,
          },
        ],
      }),
    });

    const data: any = await telegramRes.json();

    if (!data.ok) {
      console.error('Telegram createInvoiceLink API error:', data);
      return res.status(500).json({ error: data.description || 'Failed to create invoice' });
    }

    return res.status(200).json({
      ok: true,
      invoiceLink: data.result,
      pack: {
        id: pack.id,
        gems: pack.gems,
        stars: pack.stars,
      },
    });
  } catch (err: any) {
    console.error('create-invoice handler exception:', err);
    return res.status(500).json({ error: err?.message || 'Internal server error' });
  }
}
