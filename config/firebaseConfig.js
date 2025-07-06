// config/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDeHPIX6eWl7kVrGBeJQX8uZ16ZndnFwaE",
  authDomain: "vatrovisuals-5eb95.firebaseapp.com",
  projectId: "vatrovisuals-5eb95",
  storageBucket: "vatrovisuals-5eb95.appspot.com",
  messagingSenderId: "547075630450",
  appId: "1:547075630450:web:dea39ee498144f413f29eb",
  measurementId: "G-JNEFXD13T9",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
