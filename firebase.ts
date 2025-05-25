import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Firebase config from the Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyDJuhKbUwpo1WOJ1ITrlu6bdaYy3m-Mixc",
    authDomain: "nearby-chats-a4355.firebaseapp.com",
    projectId: "nearby-chats-a4355",
    storageBucket: "nearby-chats-a4355.firebasestorage.app",
    messagingSenderId: "375634886830",
    appId: "1:375634886830:web:197bb36c14caa128616d3f",
    measurementId: "G-55PQX2QNQQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage, ref, uploadBytes, getDownloadURL };
