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

    // 1. Получаем профиль пользователя
    const userDocRef = db.collection('users').doc(userId);
    const userSnap = await userDocRef.get();
    const userData = userSnap.exists ? userSnap.data() || {} : {};
    const currentGems = Number(userData.gems) || 0;
    const claimedChargeIds = Array.isArray(userData.claimedChargeIds) ? userData.claimedChargeIds : [];

    // 2. Находим все подтвержденные чеки пользователя в базе
    const paymentsSnap = await db.collection('payments').where('userId', '==', userId).get();
    let unclaimedGems = 0;
    const newClaimedIds = [...claimedChargeIds];

    paymentsSnap.forEach((doc) => {
      const chargeId = doc.id;
      const data = doc.data();
      const gems = Number(data.gems) || 0;

      // Если этот чек ещё не был начислен в баланс игрока
      if (!claimedChargeIds.includes(chargeId) && gems > 0) {
        unclaimedGems += gems;
        newClaimedIds.push(chargeId);
      }
    });

    let updatedGems = currentGems;

    // 3. Если есть неначисленные чеки — прибавляем их к балансу!
    if (unclaimedGems > 0) {
      updatedGems = currentGems + unclaimedGems;
      await userDocRef.set(
        {
          gems: updatedGems,
          claimedChargeIds: newClaimedIds,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
      console.log(`Credited unclaimed ${unclaimedGems} gems to user ${userId}. New total: ${updatedGems}`);
    }

    return res.status(200).json({
      ok: true,
      userId,
      addedGems: unclaimedGems,
      gems: updatedGems,
      claimedCount: newClaimedIds.length,
    });
  } catch (err) {
    console.error('sync-gems error:', err);
    return res.status(500).json({ error: err?.message || 'Internal server error' });
  }
}
