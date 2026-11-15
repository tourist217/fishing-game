import * as admin from 'firebase-admin';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8855072906:AAFeiso-CDnzg60PHVz8Fd_cYnHvF2iPNqQ';

function getAdminDb() {
  if (!admin.apps.length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (raw) {
      try {
        const cert = JSON.parse(raw);
        admin.initializeApp({
          credential: admin.credential.cert(cert),
        });
      } catch (e) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', e);
      }
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          }),
        });
      } catch (e) {
        console.error('Failed to init Firebase Admin from env variables:', e);
      }
    } else {
      console.warn('FIREBASE_SERVICE_ACCOUNT is not configured yet. Payments will be logged only.');
    }
  }

  return admin.apps.length ? admin.firestore() : null;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(200).send('Telegram Stars Webhook Endpoint is Active');
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

      console.log(`Received successful payment: ${starsPaid} Stars for ${gemsToAdd} gems from user ${userId} (charge: ${chargeId})`);

      const db = getAdminDb();
      if (db) {
        const paymentDocRef = db.collection('payments').doc(chargeId);
        const paymentSnap = await paymentDocRef.get();

        if (paymentSnap.exists) {
          console.warn(`Payment ${chargeId} already processed. Skipping duplicate.`);
          return res.status(200).json({ ok: true, status: 'already_processed' });
        }

        const batch = db.batch();

        batch.set(paymentDocRef, {
          chargeId,
          userId,
          packageId,
          gems: gemsToAdd,
          stars: starsPaid,
          createdAt: Date.now(),
          providerChargeId: payment.provider_payment_charge_id || null,
        });

        const userDocRef = db.collection('users').doc(userId);
        batch.set(
          userDocRef,
          {
            gems: admin.firestore.FieldValue.increment(gemsToAdd),
            updatedAt: Date.now(),
          },
          { merge: true }
        );

        await batch.commit();
        console.log(`Successfully credited ${gemsToAdd} gems to user ${userId} in Firestore.`);
      } else {
        console.error('Cannot credit gems to Firestore: Firebase Admin is not initialized! (Missing FIREBASE_SERVICE_ACCOUNT)');
      }

      // Отправляем игроку чек в чат с ботом
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

    return res.status(200).json({ ok: true, message: 'update ignored' });
  } catch (err: any) {
    console.error('Webhook processing exception:', err);
    return res.status(200).json({ ok: false, error: err?.message });
  }
}
