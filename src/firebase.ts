import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"


const firebaseConfig = {
  apiKey: "AIzaSyDmu26lOiolnAXAmN7j2feA7xuKJLsGJkg",
  authDomain: "crack-classification-dashboard.firebaseapp.com",
  projectId: "crack-classification-dashboard",
  storageBucket: "crack-classification-dashboard.firebasestorage.app",
  messagingSenderId: "1077608675636",
  appId: "1:1077608675636:web:403d4bde6fe46b506a0d61"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app)