import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBoRo1kvjdobVd2mSQrJOR5v1042lPcOvg",
  authDomain: "swapchargo.firebaseapp.com",
  projectId: "swapchargo",
  storageBucket: "swapchargo.appspot.com",
  messagingSenderId: "309570008217",
  appId: "1:309570008217:web:4440d686a9e4f403107408",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const storage = getStorage();
