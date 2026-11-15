import { GEM_PACKAGES } from './_lib/packages';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8855072906:AAFeiso-CDnzg60PHVz8Fd_cYnHvF2iPNqQ';

export default async function handler(req: any, res: any) {
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

    // Payload должен быть компактным (лимит Telegram 128 байт)
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
        provider_token: '', // Для Stars всегда пустая строка
        currency: 'XTR',
        prices: [
          {
            label: pack.title,
            amount: pack.stars, // Сумма в Telegram Stars (1 Star = 1 единица)
          },
        ],
      }),
    });

    const data = await telegramRes.json();

    if (!data.ok) {
      console.error('Telegram createInvoiceLink error:', data);
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
    console.error('Create invoice handler error:', err);
    return res.status(500).json({ error: err?.message || 'Internal server error' });
  }
}
