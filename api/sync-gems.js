import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminDb() {
  if (!getApps().length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (raw) {
      try {
        const serviceAccount = JSON.parse(raw);
        initializeApp({
          credential: cert(serviceAccount),
        });
      } catch (e) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', e);
      }
    }
  }

  return getApps().length ? getFirestore() : null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const userId = String(req.query.userId || req.body?.userId || '');
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const db = getAdminDb();
    if (!db) {
      return res.status(500).json({ error: 'Database unavailable' });
    }

    // Находим все подтвержденные платежи этого пользователя
    const paymentsSnap = await db.collection('payments').where('userId', '==', userId).get();
    let totalPaidGems = 0;
    const charges = [];

    paymentsSnap.forEach((doc) => {
      const data = doc.data();
      const gems = Number(data.gems) || 0;
      totalPaidGems += gems;
      charges.push({ chargeId: doc.id, gems, createdAt: data.createdAt });
    });

    const userDocRef = db.collection('users').doc(userId);
    const userSnap = await userDocRef.get();
    const currentGems = userSnap.exists ? Number(userSnap.data()?.gems) || 0 : 0;

    // Если баланс меньше суммы оплаченных алмазов — восстанавливаем!
    let updatedGems = currentGems;
    if (totalPaidGems > 0 && currentGems < totalPaidGems) {
      updatedGems = totalPaidGems;
      await userDocRef.set(
        {
          gems: updatedGems,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
      console.log(`Restored ${totalPaidGems} gems for user ${userId}`);
    }

    return res.status(200).json({
      ok: true,
      userId,
      totalPaidGems,
      gems: updatedGems,
      chargesCount: charges.length,
      charges,
    });
  } catch (err) {
    console.error('sync-gems error:', err);
    return res.status(500).json({ error: err?.message || 'Internal server error' });
  }
}
