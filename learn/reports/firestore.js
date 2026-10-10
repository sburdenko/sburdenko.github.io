/** Адаптер жалоб на Cloud Firestore: коллекция `reports`, только запись. */
const SDK = 'https://www.gstatic.com/firebasejs/10.14.1';

export async function createSink(settings) {
  const [{ initializeApp, getApps }, fs] = await Promise.all([
    import(`${SDK}/firebase-app.js`),
    import(`${SDK}/firebase-firestore.js`)
  ]);
  const app = getApps()[0] ?? initializeApp(settings);
  const db = fs.getFirestore(app);
  return {
    // createdAt ставит сервер: правила проверяют, что это именно время запроса
    add: report => fs.addDoc(fs.collection(db, 'reports'), { ...report, createdAt: fs.serverTimestamp() })
  };
}
