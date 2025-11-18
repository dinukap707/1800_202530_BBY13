// src/userStats.js
import { db } from "./firebase.js";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";

/**
 * Make sure the user doc exists with default game stats.
 * Call this right after sign-up / login.
 */
export async function ensureUserStats(user) {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      fullName: user.displayName || "",
      username: user.email?.split("@")[0] || "",
      points: 0,
      questsPublished: 0,
      contactsMade: 0,
      myItemsFound: 0,
      questsCompleted: 0,
    });
  }
}

/** +1 point and +1 questPublished when user posts a lost item */
export async function awardForNewPost(uid) {
  if (!uid) return;
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    points: increment(1),
    questsPublished: increment(1),
  });
}

/** +1 point and +1 contactsMade when user clicks Contact */
export async function awardForContact(uid) {
  if (!uid) return;
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    points: increment(1),
    contactsMade: increment(1),
  });
}

/**
 * Award when a quest is completed:
 *  - ownerUid gets +3 pts, +1 questsCompleted, +1 myItemsFound
 *  - finderUid gets +5 pts, +1 questsCompleted
 */
export async function awardForQuestCompletion(ownerUid, finderUid) {
  const updates = [];

  if (ownerUid) {
    const ownerRef = doc(db, "users", ownerUid);
    updates.push(
      updateDoc(ownerRef, {
        points: increment(3),
        questsCompleted: increment(1),
        myItemsFound: increment(1),
      })
    );
  }

  if (finderUid) {
    const finderRef = doc(db, "users", finderUid);
    updates.push(
      updateDoc(finderRef, {
        points: increment(5),
        questsCompleted: increment(1),
      })
    );
  }

  await Promise.all(updates);
}
