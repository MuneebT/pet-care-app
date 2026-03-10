// firebase.ts
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCD_4YYbmpLIOeHO-a-qM0r9rmcfe4gq4Q",
  authDomain: "petscan-913b4.firebaseapp.com",
  projectId: "petscan-913b4",
  storageBucket: "petscan-913b4.appspot.com",
  messagingSenderId: "792473026007",
  appId: "1:792473026007:web:2e6837093912166eb89f92",
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app);

const db = getFirestore(app);

export { auth, db };

