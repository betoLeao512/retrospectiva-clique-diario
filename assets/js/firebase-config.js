/* ============================================================
   RETROSPECTIVA CLIQUE DIÁRIO — firebase-config.js
   Configuração do Firebase (Firestore) — usado só pela Galer.iA.
   SDK modular via CDN (gstatic), sem npm/build step.
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCn-9Y1HFTGogoykOfEWIP7SMsTYDvtlTg",
  authDomain: "retrospectiva-clique-diario.firebaseapp.com",
  projectId: "retrospectiva-clique-diario",
  storageBucket: "retrospectiva-clique-diario.firebasestorage.app",
  messagingSenderId: "543516633181",
  appId: "1:543516633181:web:e12b79424594643804c5b4"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
