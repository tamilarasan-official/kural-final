import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
// Only import analytics helpers if you plan to use it on web
// import { getAnalytics, isSupported } from "firebase/analytics";
// import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyBDRLXQcjTqYfJdTKfJPuQi0GC-B7yxNpA",
  authDomain: "kural-4f1f5.firebaseapp.com",
  projectId: "kural-4f1f5",
  storageBucket: "kural-4f1f5.appspot.com",
  messagingSenderId: "888013124085",
  appId: "1:888013124085:web:9698ea98e0ad98e11bb0bc",
  measurementId: "G-QDDWPZDF8G",
};

const app = initializeApp(firebaseConfig);

// Use auto-detected long polling to avoid WebChannel transport issues on some networks/devices
initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
export const db = getFirestore(app);

// Optional (web-only) analytics:
// if (Platform.OS === "web") {
//   isSupported().then((ok) => { if (ok) getAnalytics(app); });
// }