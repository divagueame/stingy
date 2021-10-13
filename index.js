// Import the functions you need from the SDKs you need
import { initializeApp } from "./node_modules/firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDFH-HvSyQ2nL2V0XWMV1dFyVrgna_HzBI",
  authDomain: "stingy-d49e9.firebaseapp.com",
  databaseURL: "https://stingy-d49e9-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "stingy-d49e9",
  storageBucket: "stingy-d49e9.appspot.com",
  messagingSenderId: "231992947759",
  appId: "1:231992947759:web:db2e29dd9249e36ff742da",
  measurementId: "G-ZKHW1F38FT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);