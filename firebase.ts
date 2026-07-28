import { getApps, getApp ,  initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";  

const firebaseConfig = {
  apiKey: "AIzaSyC78jAD0GnFw_ZbymTKnvD62NGGZbTP224",
  authDomain: "chat-with-pdf-8cbc7.firebaseapp.com",
  databaseURL: "https://chat-with-pdf-8cbc7-default-rtdb.firebaseio.com",
  projectId: "chat-with-pdf-8cbc7",
  storageBucket: "chat-with-pdf-8cbc7.firebasestorage.app",
  messagingSenderId: "495525996034",
  appId: "1:495525996034:web:d805ab116623488fba291b",
  measurementId: "G-TC4RKM3CQD"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };

