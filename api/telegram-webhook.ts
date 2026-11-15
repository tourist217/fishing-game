import { adminDb, FieldValue } from './_lib/firebaseAdmin';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8855072906:AAFeiso-CDnzg60PHVz8Fd_cYnHvF2iPNqQ';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(200).send('Telegram webhook endpoint');
  }

  try {
    const update = req.body || {};

    // 1. Предварительное подтверждение оплаты (pre_checkout_query)
    if (update.pre_checkout_query) {
      const queryId = update.pre_checkout_query.id;
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerPreCheckoutQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pre_checkout_query_id: queryId,
          ok: true,
        }),
      });
      return res.status(200).json({ ok: true });
    }

    // 2. Успешный платёж (successful_payment)
    const message = update.message;
    if (message && message.successful_payment) {
      const payment = message.successful_payment;
      const chargeId = payment.telegram_payment_charge_id;
      const chatId = message.chat?.id;

      // Парсим полезную нагрузку нашего счёта
      let payloadData: any = null;
      try {
        payloadData = JSON.parse(payment.invoice_payload);
      } catch (e) {
        console.error('Failed to parse invoice payload:', payment.invoice_payload);
      }

      const userId = String(payloadData?.u || message.from?.id);
      const gemsToAdd = Number(payloadData?.g) || 0;
      const starsPaid = Number(payment.total_amount) || 0;
      const packageId = String(payloadData?.p || 'unknown');

      if (!userId || gemsToAdd <= 0) {
        console.error('Invalid payment data:', { userId, gemsToAdd, payment });
        return res.status(200).json({ ok: true });
      }

      // Идемпотентность: защита от двойного начисления по одному чеку
      const paymentDocRef = adminDb.collection('payments').doc(chargeId);
      const paymentSnap = await paymentDocRef.get();

      if (paymentSnap.exists) {
        console.warn(`Payment ${chargeId} already processed. Skipping.`);
        return res.status(200).json({ ok: true, status: 'already_processed' });
      }

      // Атомарная запись: сохраняем чек + начисляем кристаллы игроку
      const batch = adminDb.batch();

      batch.set(paymentDocRef, {
        chargeId,
        userId,
        packageId,
        gems: gemsToAdd,
        stars: starsPaid,
        createdAt: Date.now(),
        providerChargeId: payment.provider_payment_charge_id || null,
      });

      const userDocRef = adminDb.collection('users').doc(userId);
      batch.set(
        userDocRef,
        {
          gems: FieldValue.increment(gemsToAdd),
          updatedAt: Date.now(),
        },
        { merge: true }
      );

      await batch.commit();
      console.log(`Successfully credited ${gemsToAdd} gems to user ${userId} (charge: ${chargeId})`);

      // Отправляем игроку красивое подтверждение в чат с ботом
      if (chatId) {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `🎉 *Оплата успешно получена!*\n\nНа ваш игровой аккаунт зачислено *+${gemsToAdd.toLocaleString('ru-RU')} 💎*.\nСпасибо за поддержку игры и ни хвоста, ни чешуи! 🎣`,
            parse_mode: 'Markdown',
          }),
        }).catch((err) => console.warn('Failed to send confirmation telegram message:', err));
      }

      return res.status(200).json({ ok: true, status: 'credited', gems: gemsToAdd });
    }

    return res.status(200).json({ ok: true, message: 'unhandled update' });
  } catch (err: any) {
    console.error('Webhook error:', err);
    // Всегда возвращаем 200 для Telegram, чтобы он не спамил повторами при внутренних ошибках
    return res.status(200).json({ ok: false, error: err?.message });
  }
}
